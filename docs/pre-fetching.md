# Prefetching Notes

## The Goal

Card clicks should feel immediate.

The site already has a strong card-to-detail transition system: a visitor clicks a post or case-study card, the featured media moves into the detail hero, and the page shell hides until the transition has somewhere meaningful to land. The weak spot is data timing. If the detail page still has to wait for the full WordPress GraphQL request after the click, the transition can feel visually ready before the content is ready.

This spike is about prefetching **detail data** and **featured hero media** for posts and case studies before the click completes, so the destination page can render from already-warm data and already-warming visual assets whenever possible.

This is not a style refactor or route-transition redesign. It should be a small data/navigation layer that makes the existing experience feel faster without changing the visual system.

## What "Prefetching" Means Here

In this project, prefetching means:

- when a visitor shows intent on a card, start fetching the corresponding WordPress detail query in the background
- warm the card's featured media URL, because that same image is the detail hero and shared-transition target
- cache the resolved detail data by the same identity the detail route uses
- dedupe in-flight requests so hover/focus/click do not trigger duplicate GraphQL calls
- let the destination detail page consume the cached result if it exists
- fall back to the normal detail query if nothing was prefetched or if the prefetch failed

The intended content types are:

- posts: `/writing/[slug]`, keyed as `post:${slug}`
- case studies: `/case-studies/[slug]`, keyed as `case-study:${slug}`

Those keys already match the current `useAsyncData` keys in the detail routes, which is useful. The prefetch layer should preserve that mental model.

## What This Is Not

This is not Nuxt route/component prefetching. Nuxt can prefetch route chunks, but the bottleneck here is WordPress GraphQL detail data: title, excerpt, featured media, author/date where relevant, and `editorBlocks(flat: true)`.

This is not eager prefetching for every visible card. The full detail query includes Gutenberg block data and can be heavier than the listing query. Fetching every card detail as soon as a list appears would trade one kind of delay for unnecessary CMS/API load.

This is not a full body-media prefetch pass. Images are likely the heaviest bytes in many articles, so the first pass should prefetch the featured hero image that the card already knows about. After detail data is warm, a later or optional extension can prefetch a small capped number of body images from `editorBlocks`. Do not treat hover as permission to download an entire gallery or every image in a long case study.

This is not the same thing as lazy loading. Lazy loading should be considered as a broader image performance baseline later: images outside the first viewport should load only when they are likely to matter. Prefetching is the opposite direction — it warms a small number of assets because navigation intent is already visible.

This is not a replacement for page-level loading/error/not-found states. Prefetch is an optimization. It must fail soft.

## Trigger Philosophy

Prefetch should be intent-based, not bulk.

Good triggers:

- `pointerenter` on a post or case-study card link
- keyboard focus on the card link
- possibly `touchstart` / `pointerdown` as a best-effort mobile path
- just-before-navigation on click, without awaiting it

Bad triggers:

- prefetching all homepage cards on mount
- prefetching all writing archive cards after every "Load more"
- blocking the click while prefetch completes
- surfacing prefetch errors to the visitor
- prefetching every body image for a long article or case study

The right behavior is opportunistic: if the visitor hovers or tabs to a card, we use that moment. If they tap instantly, the normal fetch path still works.

## Cache Shape

The cache should be explicit and boring.

A good shape is a small composable, likely `useContentDetailPrefetch`, that exposes separate functions for each content type:

```ts
prefetchPost(slug)
getPost(slug)
prefetchCaseStudy(slug)
getCaseStudy(slug)
```

`prefetchPost` and `prefetchCaseStudy` start work in the background and fail quietly. They should also warm the known featured media URL when the caller provides it.

`getPost` and `getCaseStudy` are used by detail pages. They should:

1. return cached detail data if present
2. await an in-flight prefetch if one exists
3. otherwise run the normal WordPress detail query
4. store successful results for later reuse

This keeps the detail page in control. The card is only a warm-up signal; it does not become responsible for page correctness.

The resolved cache can live in Nuxt state so it persists across client-side route changes. In-flight promises can be a private client-side map inside the composable. Do not put non-serializable promises into Nuxt payload state.

Hero media prefetch does not need to live in the same cache as GraphQL detail data. It can be a tiny helper that starts browser image loading for a URL and dedupes URLs already requested in the current session.

## SSR And Direct Navigation

Direct page loads must still work exactly as they do now.

If someone lands directly on `/writing/my-post`, there is no card hover and no client prefetch. The detail route should run the normal server-side `useAsyncData` query and render correctly.

The prefetch layer should be client-enhancing, not client-required. Server-side rendering should not depend on client-only maps or browser events.

## Interaction With The Transition System

The transition system should remain visually authoritative.

Prefetching should not change:

- transition keys such as `post:${slug}` and `case-study:${slug}` for data, or `post-${slug}` / `case-study-${slug}` for featured-media DOM hooks
- `navigateWithFeaturedMediaTransition`
- reverse transition behavior
- fallback page transition behavior
- scroll suppression/restoration behavior

The click handler can fire prefetch as a best-effort warm-up, but it should still hand navigation to the existing transition coordinator. Do not await prefetch before starting the transition.

Featured-media prefetch should support the transition rather than own it. The transition layer still decides which DOM nodes move; prefetch only gives the browser a better chance of already having the target image bytes.

## Error Handling

Prefetch errors should be swallowed or stored only for debugging.

If prefetch fails, the destination page should behave as if no prefetch happened. The visible error state belongs to the detail route's normal fetch path, not to hover intent.

Avoid global error toasts, console noise in normal usage, or state that marks content as broken because a speculative request failed.

## Performance Boundaries

Keep the first pass small.

No TTL, cache eviction, concurrency queue, stale-while-revalidate layer, or generalized content cache is needed unless real behavior asks for it. The site has a modest number of cards, and a session-sized cache for hovered/clicked detail pages is enough for the initial spike.

If this grows later, useful additions could include:

- a small max cache size
- explicit cache invalidation on route boundaries
- capped body-image prefetch after detail data resolves
- lazy-loading defaults for non-hero article images
- prefetching adjacent case-study loop navigation targets
- content-page prefetching if WordPress-managed pages become a real data surface

Those are later improvements, not part of the first implementation.

## Desired End State

After this spike:

- hovering/focusing a post card starts fetching that post's full detail data
- hovering/focusing a case-study card starts fetching that case study's full detail data
- hovering/focusing a card starts warming that card's featured media URL when one exists
- clicking a warmed card usually lands on a detail page with data already available
- direct navigation, hard refreshes, browser back/forward, and failed prefetches still work through the normal data-fetch path
- the route transition system remains unchanged in shape and responsibility
- the implementation is small enough to understand without inventing a generalized caching framework
