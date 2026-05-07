# Background

The frontend currently queries listing data for homepage/writing cards and separately queries full post/case-study detail data on the destination routes. The custom featured-media transition can make the visual move feel immediate, but the destination page may still wait on the full WordPress GraphQL detail query after navigation begins. The featured image is also the most important visual asset for the transition target, so the first pass should warm it when the card already has the URL.

This spike adds intent-based prefetching for post and case-study detail data plus featured hero media from cards. The conceptual framing is in `docs/pre-fetching.md`.

## Project organization

Add new items to complete to the `# To Do` section. When those items are completed move them either to `# Ready for human QA` or `# Done`. Update the `# Current State Overview` with the actual current state after each pass.

Keep tasks concrete, atomic, and specific. Prefer "add `prefetchPost(slug)` to a new content-detail prefetch composable" over "improve data loading."

## General principles

- Prefetch detail data and featured hero media only from visitor intent: hover, keyboard focus, touch/pointer start, or click warm-up.
- Do not prefetch every visible card on page load.
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

No implementation has started.

The to-do item in the root `to-do.md` is: "Add prefetching for post/case-study detail data from cards so clicked content appears immediately."

Current relevant frontend shape:

- `apps/frontend/composables/useWordPress.ts` owns the existing WordPress GraphQL query functions:
  - `queryWordPressPostBySlug(slug)`
  - `queryWordPressCaseStudyBySlug(slug)`
- `apps/frontend/pages/writing/[slug].vue` fetches detail data with `useAsyncData(() => \`post:${slug.value}\`, ...)`
- `apps/frontend/pages/case-studies/[slug].vue` fetches detail data with `useAsyncData(() => \`case-study:${slug.value}\`, ...)`
- `apps/frontend/components/navigation/cards/PostCard.vue` owns post-card navigation and already calls `navigateWithFeaturedMediaTransition`
- `apps/frontend/components/navigation/cards/CaseStudyCard.vue` owns case-study-card navigation and already calls `navigateWithFeaturedMediaTransition`
- Both card types already receive `featuredMedia` from listing queries, so the first pass can warm the hero image without an additional API request
- The writing archive preserves loaded listing state through `useWritingArchive`; prefetch should not interfere with archive pagination or reverse transition state

# To Do

## Plan the cache/composable API

- Create a small design note in this file once implementation begins, confirming the exact composable API before coding
- Confirm the data keys:
  - posts use `post:${slug}`
  - case studies use `case-study:${slug}`
- Confirm the detail pages will consume prefetched data through wrapper functions rather than duplicating cache lookup logic inline
- Confirm the first pass warms only featured media URLs, not every image discovered in body content

## Add detail-data prefetch composable

- Add `apps/frontend/composables/useContentDetailPrefetch.ts`
- Store resolved prefetched post and case-study detail results in Nuxt state so they survive client-side navigation
- Store in-flight client-side promises in private maps, not in serializable Nuxt state
- Expose `prefetchPost(slug)` as a quiet best-effort background function
- Expose `getPost(slug)` as the detail-route fetch function that uses cached/in-flight data before falling back to `queryWordPressPostBySlug`
- Expose `prefetchCaseStudy(slug)` as a quiet best-effort background function
- Expose `getCaseStudy(slug)` as the detail-route fetch function that uses cached/in-flight data before falling back to `queryWordPressCaseStudyBySlug`
- Ensure direct SSR/detail-route loads still run the normal query path when no client prefetch exists
- Ensure failed prefetches do not poison the cache or create visible UI errors

## Add featured media warmup helper

- Add a small helper inside the prefetch composable, or a separate tiny utility, that warms a single image URL
- Dedupe warmed URLs for the current client session
- Accept missing/null featured media without doing anything
- Keep media prefetch best-effort; failed image warmups should not surface visible UI errors
- Do not parse body block HTML or prefetch body images in this first pass
- Note a future follow-up for capped body-image prefetch after detail data resolves
- Note a future follow-up for lazy-loading non-hero article images more generally

## Wire card intent triggers

- Update `PostCard.vue` to call `prefetchPost(postSlug, post.featuredMedia)` on pointer hover intent
- Update `PostCard.vue` to call `prefetchPost(postSlug, post.featuredMedia)` on keyboard focus intent
- Update `PostCard.vue` to call `prefetchPost(postSlug, post.featuredMedia)` as a best-effort click warm-up without awaiting it
- Update `CaseStudyCard.vue` to call `prefetchCaseStudy(caseStudySlug, caseStudy.featuredMedia)` on pointer hover intent
- Update `CaseStudyCard.vue` to call `prefetchCaseStudy(caseStudySlug, caseStudy.featuredMedia)` on keyboard focus intent
- Update `CaseStudyCard.vue` to call `prefetchCaseStudy(caseStudySlug, caseStudy.featuredMedia)` as a best-effort click warm-up without awaiting it
- Confirm the existing `navigateWithFeaturedMediaTransition` call remains the navigation owner

## Wire detail pages to consume prefetched data

- Update `apps/frontend/pages/writing/[slug].vue` so its `useAsyncData` handler calls `getPost(slug.value)` instead of `queryWordPressPostBySlug(slug.value)` directly
- Keep the existing `post:${slug}` async-data key
- Keep existing loading/error/not-found UI behavior
- Update `apps/frontend/pages/case-studies/[slug].vue` so its `useAsyncData` handler calls `getCaseStudy(slug.value)` instead of `queryWordPressCaseStudyBySlug(slug.value)` directly
- Keep the existing `case-study:${slug}` async-data key
- Keep existing loading/error/not-found UI behavior
- Confirm case-study loop navigation data stays separate from detail prefetching

## Verification

- Run `corepack pnpm check`
- From the homepage, hover a case-study card, click it, and confirm the detail page renders without an avoidable loading pause when the prefetch has time to finish
- Confirm the case-study featured image request begins before navigation when hovering/focusing a card with featured media
- From the homepage Latest Writing section, hover a post card, click it, and confirm the writing detail page renders without an avoidable loading pause when the prefetch has time to finish
- Confirm the post featured image request begins before navigation when hovering/focusing a card with featured media
- From `/writing`, hover a loaded post card, click it, and confirm the writing detail page uses the same behavior
- Directly load a writing detail URL in a fresh tab and confirm SSR/direct loading still works
- Directly load a case-study detail URL in a fresh tab and confirm SSR/direct loading still works
- Click a card immediately without hover dwell and confirm the normal loading path still works
- Test keyboard tab focus on cards and confirm prefetch triggers without changing focus behavior
- Confirm reverse featured-media transitions still work when navigating back from detail pages
- Confirm a CMS/API outage still shows the existing destination-page error state rather than a card-level error
- Confirm cards without featured media do not throw when prefetch intent fires

# Ready for human QA

# Done
