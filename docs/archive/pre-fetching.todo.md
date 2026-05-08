# Background

The frontend currently queries listing data for homepage/writing cards and separately queries full post/case-study detail data on the destination routes. The custom featured-media transition can make the visual move feel immediate, but the destination page may still wait on the full WordPress GraphQL detail query after navigation begins. The featured image is also the most important visual asset for the transition target, so the first pass should warm it when the card already has the URL.

This spike adds intent-based prefetching for post and case-study detail data plus featured hero media from cards. It also warms listing surfaces before common return/archive navigation so Home and Writing have their card data ready when possible. The conceptual framing is in `docs/pre-fetching.md`.

## Project organization

Add new items to complete to the `# To Do` section. When those items are completed move them either to `# Ready for human QA` or `# Done`. Update the `# Current State Overview` with the actual current state after each pass.

Keep tasks concrete, atomic, and specific. Prefer "add `prefetchPost(slug)` to a new content-detail prefetch composable" over "improve data loading."

## General principles

- Prefetch detail data and featured hero media only from visitor intent: hover, keyboard focus, touch/pointer start, or click warm-up.
- Do not burst-prefetch every visible card on page load; viewport prefetch must be bounded, idle-scheduled, and easy to inspect.
- Do not prefetch every body image from a long article or gallery in the first pass.
- Prefetch is an optimization only. Direct route loads and failed prefetches must still use the normal detail query path.
- Do not block navigation or featured-media transitions while prefetch completes.
- Dedupe in-flight requests by content key so hover, focus, and click do not issue duplicate GraphQL calls.
- Dedupe media URL warmups so repeated focus/hover does not repeatedly create image preloads.
- Keep cache state explicit and small. Avoid a generalized data framework unless this first pass proves it is needed.
- Treat capped body-image prefetch and lazy-loading defaults as related future image-performance work, not required for the first pass.
- Do not touch style-system files for this spike.
- Preserve existing route transition behavior, reverse transitions, fallback transitions, and scroll behavior.
- Run `corepack pnpm check` after implementation changes.

# Current State Overview

The prefetching spike is implementation-complete. Human QA confirmed the forward card-to-detail path feels snappier, hover/focus intent starts the expected GraphQL request before click, Home return navigation feels good, and Home/Writing listing-surface warmups reduce the avoidable archive/listing pause. The remaining work in this file is final closeout QA and archival bookkeeping.

Later performance QA on the Kitchen Sink / media-gallery case-study showed that a GraphQL request can still spend a few hundred milliseconds waiting on the WordPress server even when the request is a cache `HIT`. That is now understood as a production-delivery/static-deploy concern rather than additional prefetching work: a WordPress transient cache still boots WordPress/PHP, while a static/CDN deployment would avoid most public runtime GraphQL work.

The earlier broad common-block module warmup made the network trace noisy by starting many Vite block-component module requests on intent. That is no longer the desired critical path. Intent prefetch should prioritize the detail GraphQL request and featured hero media first, then warm exact block modules after detail data resolves.

Direct repeated local GraphQL benchmarks did not reproduce a steady 500ms detail-query cost. Against `http://127.0.0.1:8080/graphql`, repeated warmed detail queries landed mostly between 50ms and 120ms. That suggests the browser-observed 500ms request may be caused by cold WordPress/PHP/MySQL state, local Docker/dev-server contention, or first-hit behavior rather than the steady-state shape of the GraphQL query alone.

The WordPress bootstrap plugin now owns a narrow WPGraphQL response cache for public GraphQL `POST` queries. It caches successful unauthenticated query responses for five minutes, caps the indexed transient set, bypasses mutations, introspection, authenticated requests, batch requests, and root-null not-found responses, flushes on content/media/ACF saves, and exposes `X-My-Website-GraphQL-Cache: MISS | HIT | BYPASS` for browser QA.

Current frontend shape:

- `apps/frontend/composables/useWordPress.ts` owns the existing WordPress GraphQL query functions:
  - `queryWordPressPostBySlug(slug)`
  - `queryWordPressCaseStudyBySlug(slug)`
- `apps/frontend/composables/useContentDetailPrefetch.ts` owns the timestamped detail shell/body caches, client-only in-flight request dedupe, exact block-module warmup, and featured-media URL warmup
- `apps/frontend/composables/useHomeSurfacePrefetch.ts` owns Home listing-surface warmup for reverse navigation:
  - homepage latest posts
  - homepage case studies
  - homepage ACF content
- `apps/frontend/composables/useWritingArchive.ts` owns Writing archive state and now exposes `prefetchInitialArchivePage()` for common `/writing` navigation paths
- `apps/frontend/pages/writing/[slug].vue` uses a `post-shell:${slug}` async-data key for the fast route shell and a `post-body:${slug}` lazy async-data key for the block body
- `apps/frontend/pages/writing/[slug].vue` schedules `prefetchHomeSurface()` and `prefetchInitialArchivePage()` shortly after mount so Home and the Writing archive can warm while the visitor reads without competing with the detail page's first render
- `apps/frontend/pages/case-studies/[slug].vue` uses a `case-study-shell:${slug}` async-data key for the fast route shell and a `case-study-body:${slug}` lazy async-data key for the block body
- `apps/frontend/pages/case-studies/[slug].vue` schedules `prefetchHomeSurface()` shortly after mount so Home can warm while the visitor reads without competing with the detail page's first render
- `apps/frontend/pages/index.vue` still uses its existing homepage async-data keys, but its handlers now read through cache-aware Home surface getters
- `apps/frontend/components/home/HomeContentSection.vue` warms the Writing archive on intent for the Home Latest Writing "Read More" link
- `apps/frontend/components/navigation/SiteNav.vue` warms the Writing archive on intent for local/global Writing nav links
- `apps/frontend/components/navigation/SiteFooter.vue` warms the Writing archive on intent for footer links to `/writing`
- `apps/frontend/components/navigation/cards/PostCard.vue` triggers `prefetchPost(postSlug, post.featuredMedia)` on pointer hover, keyboard focus, pointer down, and click warm-up
- `apps/frontend/components/navigation/cards/CaseStudyCard.vue` triggers `prefetchCaseStudy(caseStudySlug, caseStudy.featuredMedia)` on pointer hover, keyboard focus, pointer down, and click warm-up
- `apps/frontend/components/navigation/cards/CaseStudyCard.vue` also observes near-viewport entry and calls `prefetchCaseStudyFromViewport(caseStudySlug, featuredMedia)` for lower-priority Selected Work warming
- Selected Work viewport prefetch is deduped by slug, idle-scheduled with a `requestIdleCallback` fallback, and capped to one active case-study prefetch task at a time
- Detail prefetch warms exact block modules after the prefetched body-block payload resolves
- Detail shell/body cache entries are successful responses only, use a five-minute freshness window, and are capped to keep the server-side process cache small
- Both card types still hand actual navigation to `navigateWithFeaturedMediaTransition`
- Both card types already receive `featuredMedia` from listing queries, so the first pass can warm the hero image without an additional API request
- Case-study bottom loop navigation no longer blocks initial case-study route rendering; its list query starts only when the bottom sentinel nears the viewport
- The writing archive preserves loaded listing state through `useWritingArchive`; prefetch should not interfere with archive pagination or reverse transition state
- Non-hero article/body images now default to lazy loading and async decoding in the block paths that render or preserve image HTML
- Detail hero featured media now opts into eager loading and high fetch priority
- Preserved audio/video block HTML now gets `preload="metadata"` when no preload attribute exists
- Mega Gallery grid videos now defer attaching their source until the video tile nears the viewport, so video-heavy Kitchen Sink content does not eagerly download gallery videos during first render
- Reverse navigation back to Home has been human-QAed and feels good
- Navigation to Writing from Home and post detail pages has been human-QAed and feels good
- The Selected Work viewport prefetch slice has been verified through browser HAR review
- The WPGraphQL response cache slice has been verified with curl and browser HAR review
- Production delivery, static prerendering, CDN media hosting, image transformation, compression, and long-lived asset caching belong to the next static-deploy spike, not to this prefetching spike

# To Do

## Layered performance plan

The current plan is to pursue all useful optimization families, but in an order that keeps each change measurable:

1. Measure the detail GraphQL variants so we know whether `editorBlocks`, `renderedHtml`, or broader WordPress work is the response-time driver.
2. Add a small Nuxt-side cache for detail data/body data keyed by content type and slug, so repeat navigations and settled prefetches avoid repeated WordPress work.
3. Split detail loading into shell and body queries so hero/header/transition work can begin from a smaller payload while the block body resolves.
4. Add bounded viewport prefetch for Selected Work case studies, because those cards are the portfolio's main browsing surface and the total number is expected to stay small.
5. Add a narrow WPGraphQL response cache for repeated public GraphQL requests.
6. Re-evaluate persistent object caching only if production-like measurements still show repeated WordPress object/database lookup work beneath the response cache.

## Slice 1: GraphQL response-time benchmark

- Done. See `# Done` for benchmark results.
- Follow-up later if needed: add lightweight server timing or local request logging around WPGraphQL detail queries to distinguish WordPress query time, block rendering time, and transport time during a browser-observed cold/slow request.

## Slice 2: Nuxt-side detail/body cache

- Done. The original full-detail cache has been split into shell and body tracks. See `# Done`.

## Slice 3: Shell/body query split

- Done. See `# Done`.

## Slice 4: Selected Work viewport prefetch

- Done. See `# Done`.

## Slice 5: WordPress/WPGraphQL caching evaluation

- Done. A project-owned WPGraphQL response cache is now implemented in the WordPress bootstrap plugin. See `# Done`.

Deferred out of this spike:

- Add capped body-image prefetch only if the static/media delivery plan leaves a clear gap for it
- Refine lazy-loading defaults for future image-bearing components when new block/component paths are added
- Consider adjacent case-study previous/next prefetch only if detail-to-detail navigation remains a bottleneck after static delivery decisions

# Ready for human QA

# Done

## Final closeout QA

- From Home, hover/focus one case-study card and one writing card, click each after a short dwell, and confirm the detail transition still feels snappy
- From a case-study detail page, return Home and confirm the Selected Work surface appears without the old avoidable pause
- From a writing detail page, go to Writing and confirm the archive appears without the old avoidable pause
- In DevTools Network, confirm repeated public detail GraphQL requests either do not duplicate or show `X-My-Website-GraphQL-Cache: HIT`
- Spot-check one detail hero image for `loading="eager"` and `fetchpriority="high"`, and one normal article/body image for `loading="lazy"` plus `decoding="async"`
- Spot-check Kitchen Sink media: preserved audio/video should use metadata preload, and Mega Gallery videos should not request their `.mp4` sources until the gallery area nears the viewport
- Optional cache-invalidation check: save a post/case study/media/settings change, then confirm the next matching public GraphQL request returns `MISS` before warming back to `HIT`

## Spike closeout and browser performance review

- Human QA confirmed the forward card-to-detail path feels snappier after detail data and featured media prefetching
- Human QA confirmed Home return prefetching feels good
- Human QA confirmed navigation to Writing from Home and post detail pages feels good
- Browser HAR review showed all captured case-study shell/body GraphQL requests returning `X-My-Website-GraphQL-Cache: HIT`
- Browser HAR review showed the remaining visible delay is dominated by local dev-mode Vite/module/style/media behavior and WordPress cache-hit overhead, not by missing prefetch wiring
- Lighthouse review against local dev mode showed acceptable Core Web Vitals but dev-mode-inflated Speed Index and payload warnings
- Static deploy, CDN media hosting, image transformation, compression, cache headers, and production Lighthouse baselining were partitioned into the future static-deploy spike

## Slice 5: WordPress/WPGraphQL response cache

- Added a project-owned public GraphQL response cache to `apps/cms/wp-content/plugins/project-bootstrap/project-bootstrap.php`
- Cached only single public GraphQL `POST` query responses with no GraphQL errors
- Bypassed authenticated requests, mutations, introspection, batch request payloads, and root-null not-found responses
- Keyed cache entries by query, operation name, and normalized variables
- Stored entries as indexed WordPress transients with a five-minute default TTL and a 50-entry default cap
- Flushed the indexed cache on post saves/deletes, attachment edits/deletes, and ACF saves
- Added the `X-My-Website-GraphQL-Cache` response header so DevTools can show `MISS`, `HIT`, or `BYPASS`
- Verified the clean public query path with curl: first request `MISS`, repeated identical request `HIT`
- Verified a root-null not-found query returns `BYPASS`
- Verified PHP syntax with `php -l`

## Slice 4: Selected Work viewport prefetch

- Added a bounded viewport prefetch queue to `useContentDetailPrefetch.ts`
- Exposed `prefetchCaseStudyFromViewport(slug, media)` for lower-priority case-study warming
- Kept viewport prefetch case-study-only so Writing cards and archive/listing links remain intent-based
- Warmed featured media immediately when a case-study card nears the viewport
- Scheduled viewport GraphQL prefetch through `requestIdleCallback`, with a short `setTimeout` fallback for browsers without idle callbacks
- Capped viewport work to one active case-study prefetch task at a time so the homepage does not stampede WordPress
- Deduped queued and started viewport prefetches by slug, while preserving hover/focus/click prefetch as an explicit retry path
- Wired `CaseStudyCard.vue` to observe its own near-viewport entry with `IntersectionObserver`
- Used an `800px` vertical root margin so Selected Work cards can warm shortly before the visitor reaches or clicks them
- Verified with `corepack pnpm check`

## Slice 3: Shell/body query split

- Added shell-only and body-block-only WordPress query functions for posts and case studies:
  - `queryWordPressPostShellBySlug(slug)`
  - `queryWordPressPostBlocksBySlug(slug)`
  - `queryWordPressCaseStudyShellBySlug(slug)`
  - `queryWordPressCaseStudyBlocksBySlug(slug)`
- Split `useContentDetailPrefetch.ts` into separate shell and block-body cache tracks for posts and case studies
- Kept successful shell/body cache entries on the same five-minute freshness window and small server-process cap
- Kept `getPost(slug)` and `getCaseStudy(slug)` compatibility helpers by composing shell plus body data
- Updated post detail routes to load the route shell with `post-shell:${slug}` and the block body with `post-body:${slug}`
- Updated case-study detail routes to load the route shell with `case-study-shell:${slug}` and the block body with `case-study-body:${slug}`
- Kept card intent prefetch warming featured media, shell data, body-block data, and exact block modules once body data resolves
- Added visible body error states so a block-body failure does not make the entire detail route look not-found
- Verified with `corepack pnpm check`

## Slice 2: Nuxt-side detail cache

- Converted the detail cache in `useContentDetailPrefetch.ts` from bare slug/value records into timestamped entries.
- Cache entries are keyed by content type and slug through separate post and case-study stores.
- Only successful post/case-study detail responses are cached; null/not-found responses are returned normally but are not stored.
- Added a five-minute freshness window to keep local editing changes from being hidden indefinitely.
- Added a small server-process cache with a 50-entry cap so repeated SSR/direct detail requests can reuse recent successful responses while the Nuxt process is alive.
- Kept the existing client-side Nuxt state cache so hover prefetch, client navigation, browser back/forward, and hydrated detail pages share the same owner.
- Kept exact block-module warmup when cached or freshly fetched detail data is used.
- Left body-specific caching for the shell/body split slice, because there is not a separate body query yet.
- Verified with `corepack pnpm check`.

## Slice 1: GraphQL response-time benchmark

- Benchmarked `testing-media-gallery`, `block-qa-kitchen-sink-case-study`, and `block-qa-kitchen-sink-post` directly against `http://127.0.0.1:8080/graphql`.
- Compared shell-only, block-structure-only, rendered-block-only, and full detail query variants.
- `testing-media-gallery` repeated warmed timings:
  - shell: ~58ms average, 565 bytes
  - block structure: ~59ms average, 1.9kb, 17 blocks
  - rendered blocks only: ~59ms average, 7.8kb, 17 blocks
  - full: ~53ms average, 9.6kb, 17 blocks
- `block-qa-kitchen-sink-case-study` repeated warmed timings:
  - shell: ~54ms average, 606 bytes
  - block structure: ~56ms average, 21.8kb, 260 blocks
  - rendered blocks only: ~73ms average, 66.9kb, 260 blocks
  - full: ~77ms average, 88kb, 260 blocks
- `block-qa-kitchen-sink-post` repeated warmed timings:
  - shell: ~65ms average, 647 bytes
  - block structure: ~57ms average, 20.6kb, 245 blocks
  - rendered blocks only: ~69ms average, 64kb, 245 blocks
  - full: ~116ms average, 83.9kb, 245 blocks, with one ~256ms outlier
- A repeated full `testing-media-gallery` run including the first request showed the first request at ~188ms, second at ~89ms, then mostly ~56-66ms.
- Initial conclusion: `renderedHtml` and full block payload size add measurable cost, but the direct warmed query benchmark does not explain a steady 500ms server response. The larger browser-side delay is likely cold-cache behavior, local runtime contention, or first-hit behavior.
- Implication for the next slice: Nuxt-side caching is still worthwhile for repeated navigations and settled prefetches; shell/body query split is still worthwhile for perceived speed and cold spikes; broad generic WordPress page caching is less clearly the first move.

## Critical prefetch priority cleanup

- Removed broad common editorial block module warmup from the card hover/focus/pointer intent path
- Restored the critical intent path to detail GraphQL plus featured hero media
- Kept exact block-module warmup after the detail GraphQL response as a second-pass cache fill
- Deferred Home/Writing return-surface warmups briefly after detail-page mount so they do not compete with the detail route's first render
- Changed Mega Gallery grid videos to attach their source only when the tile nears the viewport
- Added metadata preload to Mega Gallery grid videos once they become eligible to load
- Verified with `corepack pnpm check`

## Kitchen Sink QA performance follow-up

- Added `apps/frontend/utils/block-components.ts` as the shared owner for block-component dynamic imports
- Updated `BlockChildren.vue` to use the shared block component registry
- Updated detail prefetch so fetched post/case-study block data warms the required block component modules during the hover/focus prefetch window
- Changed case-study previous/next loop navigation to use a non-blocking client-only query
- Added an IntersectionObserver sentinel so the case-study loop navigation query waits until the bottom area nears the viewport
- Added media preload defaults for preserved audio/video HTML, using `preload="metadata"` when no preload value is present
- Applied media defaults to audio blocks, video blocks, media/text preserved media HTML, HTML fallback blocks, and unsupported fallback HTML
- Verified with `corepack pnpm check`

## Lazy-loading image baseline

- Added image loading defaults to `ImageBlock.vue` so parsed article images preserve author attributes but fill missing `loading="lazy"` and `decoding="async"`
- Added `addImageLoadingDefaultsToHtml()` in `block-html.ts` for image HTML that remains rendered through controlled `v-html` paths
- Applied image loading defaults to media/text image HTML, HTML fallback blocks, and unsupported block fallback HTML
- Added async decoding to Mega Gallery thumbnails
- Let `FeaturedMediaFrame.vue` accept loading/fetch-priority props while keeping lazy loading as the default for reusable frames
- Marked post and case-study detail hero featured media as eager/high-priority
- Added async decoding to the featured-media transition overlay image
- Verified with `corepack pnpm check`

## writing listing surface qa

- From the Home Latest Writing section, hover/focus the "Read More" link, click it, and confirm `/writing` appears without the previous avoidable loading pause
- In DevTools Network, hover/focus the Home Latest Writing "Read More" link and confirm the Writing archive GraphQL request begins before click
- From a writing detail page, wait a moment after page load, click the local Writing nav link, and confirm `/writing` appears without the previous avoidable loading pause
- In DevTools Network, directly load a writing detail page and confirm the Writing archive GraphQL request begins after detail-page mount, before clicking Writing
- From any page with a footer Writing link, hover/focus the footer link and confirm the Writing archive request is warmed before click
- Directly load `/` in a fresh tab and confirm SSR/direct homepage loading still works
- Directly load `/writing` in a fresh tab and confirm SSR/direct archive loading still works
- Directly load a detail URL in a fresh tab, immediately click Home before prefetch settles, and confirm the normal Home loading path still works
- Directly load a writing detail URL in a fresh tab, immediately click Writing before prefetch settles, and confirm the normal Writing archive loading path still works
- Confirm reverse featured-media transitions still work when navigating back from case-study detail pages
- Confirm reverse featured-media transitions still work when navigating back from writing detail pages
- Confirm a CMS/API outage still shows the existing Home error state rather than a detail-page prefetch UI error
- Confirm a CMS/API outage still shows the existing Writing archive error/empty behavior rather than a link-level prefetch UI error

## Home listing-surface QA

- From a case-study detail page, wait a moment after page load, return Home, and confirm the Selected Work surface appears without the previous avoidable loading pause
- From a writing detail page, wait a moment after page load, return Home, and confirm the Latest Writing surface appears without the previous avoidable loading pause
- In DevTools Network, directly load a case-study detail page and confirm the Home surface GraphQL requests begin after detail-page mount, before clicking Home
- In DevTools Network, directly load a writing detail page and confirm the Home surface GraphQL requests begin after detail-page mount, before clicking Home
- Directly load `/` in a fresh tab and confirm SSR/direct homepage loading still works
- Directly load a detail URL in a fresh tab, immediately click Home before prefetch settles, and confirm the normal Home loading path still works
- Confirm reverse featured-media transitions still work when navigating back from case-study detail pages
- Confirm reverse featured-media transitions still work when navigating back from writing detail pages
- Confirm a CMS/API outage still shows the existing Home error state rather than a detail-page prefetch UI error

## Writing archive prefetch pass

- Extended `apps/frontend/composables/useWritingArchive.ts` with client-only in-flight request dedupe for the initial archive page
- Added `prefetchInitialArchivePage()` so `/writing` links can warm the archive without taking ownership of archive data
- Kept the Writing archive's existing `useState` cache and `writing-archive` async-data key
- Triggered Writing archive warmup from writing detail pages on mount
- Triggered Writing archive warmup from the Home Latest Writing "Read More" link on hover, focus, and pointer down
- Triggered Writing archive warmup from `SiteNav` Writing links on hover, focus, and pointer down
- Triggered Writing archive warmup from footer links to `/writing` on hover, focus, and pointer down
- Kept failed Writing archive prefetches quiet so speculative background requests do not create visible UI errors
- Verified with `corepack pnpm check`

## Forward browser/network verification

- From the homepage, hover a case-study card, click it, and confirm the detail page renders without an avoidable loading pause when the prefetch has time to finish
- Confirm the case-study detail GraphQL request starts before click completion after hovering/focusing a case-study card
- Confirm the case-study featured image request begins before navigation when hovering/focusing a card with featured media
- From the homepage Latest Writing section, hover a post card, click it, and confirm the writing detail page renders without an avoidable loading pause when the prefetch has time to finish
- Confirm the post detail GraphQL request starts before click completion after hovering/focusing a post card
- Confirm the post featured image request begins before navigation when hovering/focusing a card with featured media
- From `/writing`, hover a loaded post card, click it, and confirm the writing detail page uses the same behavior
- Directly load a writing detail URL in a fresh tab and confirm SSR/direct loading still works
- Directly load a case-study detail URL in a fresh tab and confirm SSR/direct loading still works
- Click a card immediately without hover dwell and confirm the normal loading path still works
- Test keyboard tab focus on cards and confirm prefetch triggers without changing focus behavior
- Confirm reverse featured-media transitions still work when navigating back from detail pages
- Confirm a CMS/API outage still shows the existing destination-page error state rather than a card-level error
- Confirm cards without featured media do not throw when prefetch intent fires

## Home listing-surface prefetch pass

- Added `apps/frontend/composables/useHomeSurfacePrefetch.ts`
- Added Nuxt-state caches for homepage latest posts, homepage case studies, and homepage ACF content
- Added client-only in-flight request dedupe for each homepage surface query
- Updated `pages/index.vue` to read through `getHomePosts()`, `getHomeCaseStudies()`, and `getHomeContent()` while preserving the existing async-data keys
- Triggered `prefetchHomeSurface()` from writing and case-study detail pages on mount
- Kept failed Home surface prefetches quiet so speculative background requests do not create visible UI errors
- Preserved normal SSR/direct homepage loading and existing Home error states
- Left route-transition code and style-system files untouched for this pass
- Verified with `corepack pnpm check`

## First implementation pass

- Added `apps/frontend/composables/useContentDetailPrefetch.ts`
- Added Nuxt-state caches for resolved post and case-study detail data
- Added client-only in-flight request maps so hover, focus, pointerdown, and click warm-up dedupe to one GraphQL request per slug
- Added featured media URL warmup through the browser image loader, with session-level URL dedupe
- Kept failed prefetches quiet so speculative hover/focus requests do not create visible UI errors
- Updated `PostCard.vue` to warm post detail data and featured media on pointer hover, focus, pointer down, and click
- Updated `CaseStudyCard.vue` to warm case-study detail data and featured media on pointer hover, focus, pointer down, and click
- Updated writing detail pages to read through `getPost(slug)` while preserving the existing `post:${slug}` async-data key
- Updated case-study detail pages to read through `getCaseStudy(slug)` while preserving the existing `case-study:${slug}` async-data key
- Preserved the existing featured-media transition coordinator as the navigation owner
- Left style-system files untouched for this spike
- Verified with `corepack pnpm check`

## Deferred image-performance follow-ups

- Consider capped body-image prefetch after detail data resolves, especially for the first few body images likely to appear near the top of an article
- Refine lazy-loading defaults for future image-bearing components if new block/component paths are added
