# Prefetching Notes

## The Goal

Card clicks should feel immediate.

The site already has a strong card-to-detail transition system: a visitor clicks a post or case-study card, the featured media moves into the detail hero, and the page shell hides until the transition has somewhere meaningful to land. The weak spot is data timing. If the detail page still has to wait for the full WordPress GraphQL request after the click, the transition can feel visually ready before the content is ready.

This spike is about prefetching **detail data** and **featured hero media** for posts and case studies before the click completes, so the destination page can render from already-warm data and already-warming visual assets whenever possible. It also includes small listing-surface warmups for Home and Writing, so common return/archive navigation has the card data it needs whenever possible.

This is not a style refactor or route-transition redesign. It should be a small data/navigation layer that makes the existing experience feel faster without changing the visual system.

## What "Prefetching" Means Here

In this project, prefetching means:

- when a visitor shows intent on a card, start fetching the corresponding WordPress detail query in the background
- when a Selected Work case-study card nears the viewport, start a lower-priority bounded prefetch for that case study
- warm the card's featured media URL, because that same image is the detail hero and shared-transition target
- cache the resolved detail data by the same identity the detail route uses
- warm exact Vue block component modules after detail data reveals the resolved block names
- when a visitor is already on a detail page, warm relevant listing surface data in the background so return/archive paths can be ready
- dedupe in-flight requests so hover/focus/click do not trigger duplicate GraphQL calls
- let the destination detail page consume the cached result if it exists
- fall back to the normal detail query if nothing was prefetched or if the prefetch failed

The intended content types are:

- posts: `/writing/[slug]`, with separate `post-shell:${slug}` and `post-body:${slug}` route data keys
- case studies: `/case-studies/[slug]`, with separate `case-study-shell:${slug}` and `case-study-body:${slug}` route data keys

The split keeps the hero/header route shell small while the heavier block body resolves separately. Compatibility helpers can still compose shell plus body data for callers that want the old full-detail shape.

The Home listing surface is deliberately separate from detail prefetch. It warms:

- the homepage Latest Writing query
- the homepage Selected Work/case-study query
- the homepage ACF content query

That cache exists to support the reverse path from detail pages back to Home. It should not become a generic page cache unless the site grows into needing one.

The Writing archive surface is owned by `useWritingArchive`, because that composable already owns archive posts, pagination state, and the initial page query. Writing prefetch should warm that existing archive state rather than create a parallel cache.

## What This Is Not

This is not Nuxt route/component prefetching. Nuxt can prefetch route chunks, but the bottleneck here is WordPress GraphQL detail data: title, excerpt, featured media, author/date where relevant, and `editorBlocks(flat: true)`.

This is also not a production-bundle diagnosis by itself. In local development, Vite serves many `.vue` modules as separate requests, so a Kitchen Sink QA page can show a dramatic component-request waterfall. Production bundling should reduce the request count, but the same principle still matters: a page that uses every block family should warm likely block renderers before the click has to pay for them.

This is not permission to warm every common block renderer on first hover. The critical intent path is detail GraphQL plus featured hero media. Broad module warmup can create a noisy dev-server waterfall and make the app feel busier without addressing WordPress response time. Exact block module warmup should happen after the detail payload reveals which blocks the destination actually uses.

This is not eager prefetching for every visible card in every list. Selected Work has a narrow exception: case-study cards may prefetch when they near the viewport because that section is the main portfolio browsing surface. That viewport prefetch must be idle-scheduled, deduped, and concurrency-limited so it does not stampede WordPress.

This is not a generalized prefetcher for every route. Home and Writing get narrow exceptions because they are real listing surfaces with observed navigation lag: Home is the main browsing surface and a transition return target, while Writing is the archive destination from post details and the Home Latest Writing section. Other pages should be added only when there is a real visitor path that benefits from being warmed.

This is not a full body-media prefetch pass. Images are likely the heaviest bytes in many articles, so the first pass should prefetch the featured hero image that the card already knows about. After detail data is warm, a later or optional extension can prefetch a small capped number of body images from `editorBlocks`. Do not treat hover as permission to download an entire gallery or every image in a long case study.

This is not the same thing as lazy loading. Lazy loading is the broader image performance baseline: images outside the first viewport should load only when they are likely to matter. Prefetching is the opposite direction — it warms a small number of assets because navigation intent is already visible. The two should cooperate: hero/transition images stay eager when they matter immediately, while non-hero article images default to lazy loading.

This is not eager loading for below-the-fold navigation surfaces. Case-study previous/next navigation is useful, but it lives below the article body. Its list query and component work should not delay the first viewport of a case-study detail page.

This is not eager loading for below-the-fold gallery media. Large gallery videos should not attach their source during the first render just because their block exists in the article body. The grid may reserve the tile and show a poster, but the video source should wait until the tile is near enough to matter.

This is not a replacement for page-level loading/error/not-found states. Prefetch is an optimization. It must fail soft.

## Trigger Philosophy

Prefetch should be intent-based, not bulk.

Good triggers:

- `pointerenter` on a post or case-study card link
- keyboard focus on the card link
- possibly `touchstart` / `pointerdown` as a best-effort mobile path
- just-before-navigation on click, without awaiting it
- near-viewport entry for Selected Work case-study cards, using a bounded idle queue

Bad triggers:

- prefetching all homepage cards on mount
- prefetching all writing archive cards after every "Load more"
- prefetching unrelated pages just because they exist
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
prefetchCaseStudyFromViewport(slug)
getCaseStudy(slug)
```

`prefetchPost` and `prefetchCaseStudy` start work in the background and fail quietly. They should also warm the known featured media URL when the caller provides it.

`getPost` and `getCaseStudy` are used by detail pages. They should:

1. return cached detail data if present
2. await an in-flight prefetch if one exists
3. otherwise run the normal WordPress detail query
4. store successful results for later reuse
5. warm the exact block renderer modules needed by the returned `editorBlocks`

This keeps the detail page in control. The card is only a warm-up signal; it does not become responsible for page correctness.

Detail routes can use more granular shell/body helpers so the route shell and block body do not have to wait on the same GraphQL request. The compatibility helpers should remain boring composition over those pieces rather than becoming a separate cache model.

The resolved cache can live in Nuxt state so it persists across client-side route changes. In-flight promises can be a private client-side map inside the composable. Do not put non-serializable promises into Nuxt payload state.

Hero media prefetch does not need to live in the same cache as GraphQL detail data. It can be a tiny helper that starts browser image loading for a URL and dedupes URLs already requested in the current session.

Home surface prefetch should use its own small composable rather than being folded into detail-data cache. It is a different kind of cache: listing and page assembly data for a return surface, not full article detail data.

Writing archive prefetch should stay inside the Writing archive composable. That keeps pagination, archive cache state, and the initial page warmup in one owner.

Block component warmup should stay close to the block renderer registry. The same map that resolves `core/image` to `ImageBlock.vue` should also be the map used to warm the module after prefetch reveals that an article contains images.

WordPress also has a narrow WPGraphQL response cache in the project bootstrap plugin. It is not a generic WordPress page cache. It exists because the expensive request in this spike is a public GraphQL `POST`, and normal page-cache plugins often do not help that path. The cache stores successful unauthenticated query responses for a short window, bypasses mutations, introspection, authenticated requests, batch request payloads, and root-null not-found responses, and exposes its decision through the `X-My-Website-GraphQL-Cache` response header.

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

Listing-surface prefetch has the same relationship to reverse/archive transitions. It gives Home or Writing a better chance of having the relevant cards rendered before the transition needs them, but it should not alter transition ownership or add transition-specific data contracts.

Listing-surface warmups from detail pages should be background work. A short delay after mount is acceptable because the visitor is already reading the detail page; the warmup should not compete with the destination page's first render.

## Error Handling

Prefetch errors should be swallowed or stored only for debugging.

If prefetch fails, the destination page should behave as if no prefetch happened. The visible error state belongs to the detail route's normal fetch path, not to hover intent.

Avoid global error toasts, console noise in normal usage, or state that marks content as broken because a speculative request failed.

## Performance Boundaries

Keep each layer small.

The implementation now has a short freshness window, a small server-process cache, and a bounded viewport queue because measured behavior asked for them. That is still different from inventing a generalized data framework: each cache and queue has one job, clear keys, and quiet failure behavior.

The WordPress-side GraphQL cache follows the same rule. It is intentionally short-lived, indexed, capped, and flushed on content/media/ACF saves. It should smooth repeated public GraphQL requests during hover, client navigation, SSR direct loads, and local QA without hiding content edits for long or changing authenticated CMS behavior.

If this grows later, useful additions could include:

- a small max cache size
- explicit cache invalidation on route boundaries
- capped body-image prefetch after detail data resolves
- lazy-loading refinements for future image-bearing components
- preload refinements for future media-bearing components
- prefetching adjacent case-study loop navigation targets
- content-page prefetching if WordPress-managed pages become a real data surface
- persistent object cache support if production measurements show repeated WordPress object/database lookup work remains expensive beneath the response cache

Those are later improvements, not part of the first implementation.

## Spike Closeout

The prefetching spike achieved its original goal: post and case-study card navigation feels snappier because detail data, featured media, listing surfaces, exact block modules, and repeated public GraphQL responses now have clear warmup/cache paths.

The remaining performance questions are no longer primarily prefetching questions. Local Lighthouse and HAR review showed a mix of Vite dev-mode module/style request noise, large media/image payloads, and WordPress cache-hit overhead. Those belong to a production-delivery/static-deploy spike focused on static generation, CDN media hosting, image transformation, compression, cache headers, and production Lighthouse baselining.

## Desired End State

After this spike:

- hovering/focusing a post card starts fetching that post's shell/body detail data
- hovering/focusing a case-study card starts fetching that case study's shell/body detail data
- Selected Work case-study cards near the viewport can warm case-study shell/body data through a bounded idle queue
- hovering/focusing a card starts warming that card's featured media URL when one exists
- clicking a warmed card usually lands on a detail page with data already available
- returning Home from a warmed detail page usually has homepage listing data already available
- visiting Writing from a warmed post detail page or Home "Read More" link usually has the archive's initial page already available
- non-hero article/body images default to lazy loading and async decoding
- detail hero featured images remain eager/high-priority where they are the immediate destination target
- prefetched detail pages warm exact block renderer modules after detail data reveals the block list
- repeated public WPGraphQL queries can reuse a short-lived WordPress response cache, visible through the `X-My-Website-GraphQL-Cache` header
- below-the-fold case-study previous/next navigation does not block the initial detail-page render
- preserved audio/video block HTML defaults to metadata preload rather than eager full media loading
- heavy gallery videos do not attach their source until the tile nears the viewport
- direct navigation, hard refreshes, browser back/forward, and failed prefetches still work through the normal data-fetch path
- the route transition system remains unchanged in shape and responsibility
- the implementation is small enough to understand without inventing a generalized caching framework
