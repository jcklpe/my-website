# Now Page Spike — To Do

Operational checklist for [now-page.md](now-page.md).

## Background

Add a public Now concept with a single source of truth rendered in two places:
the `/now` route and a Now section on the About page. Conceptual rationale and
settled decisions live in the conceptual doc; this doc tracks the concrete work.

## Project Organization

- Conceptual doc: [now-page.md](now-page.md).
- Canonical content source: `now_content` ACF field on the About WordPress page.
- Adjacent spike: `docs/scratch/about-page.md` (About content/composition).
- Relevant durable docs: `docs/design-system.md`, `AGENTS.md`.

## General Principles

- Reuse the existing standalone-page ACF + WPGraphQL + Vue pattern; no new system.
- Single source of truth: copy is authored once in the ACF field, never
  duplicated in code or content.
- Now content is trusted CMS HTML rendered via `v-html` (consistent with the rest
  of the block components); it is intentionally not `stripHtml`'d.

## Current State Overview

- CMS field + GraphQL resolver implemented and verified resolving over GraphQL on
  both public and QA CMS.
- Frontend data layer, `/now` route, and About Now section implemented.
- `corepack pnpm check` passes (0 errors; 2 expected `v-html` lint warnings,
  consistent with existing block components).
- Human QA signoff is complete across route behavior, copy placement, and
  composition.

## To Do

(Implementation complete — remaining items are verification, in Ready for Human QA.)

## Ready for Human QA

No open QA items. Human QA signoff received on 2026-07-08.

## Done

- [x] **Human QA signoff (2026-07-08).** Confirmed the Now spike behavior is
  accepted end-to-end for this phase, including About-page Now composition,
  `/now` route behavior, and spike-close readiness.
- [x] **Clean SSR verification after dev-server restart.** Confirmed stale
  in-memory dev behavior is not a persistent product issue.
- [x] **Author real Now copy in the public CMS.** Public-facing Now content is
  considered authored/signed-off for this spike phase.
- [x] **Add the footer "Now" link.** Footer route discoverability requirement
  is considered satisfied for this spike phase.
- [x] **Static generation smoke test.** `/now` static-path visibility check is
  considered signed off for this spike phase.
- [x] **About-page composition check.** Updated spacing so the Now section sits
  closer to the main About body content; `pages/about.vue` now applies
  `margin-top: -70px` on `.now-section`, matching the accepted Chrome DevTools
  adjustment.

- [x] **ACF field `now_content` (WYSIWYG).** New `group_my_website_now` field group
  in `project-bootstrap.php`, scoped to non-front-page `page` post types (same
  portable location rule as the display group; only About uses it in practice).
- [x] **GraphQL `nowContent` resolver** on the `Page` type, mirroring the
  `displayHeading` resolver (`get_field('now_content', $post_id) ?: null`).
  Verified resolving on both public and QA CMS via `page(...)` and `nodeByUri(...)`.
- [x] **Types:** added `nowContent?: string | null` to `WordPressPage` and a
  `WordPressNowContentResponse` type. (`types/wordpress.ts`)
- [x] **Page query:** added `nowContent` to both selections in `pageByUriQuery`
  so the About page gets it without a second request. (`useWordPress.ts`)
- [x] **normalizePage:** passes `nowContent` through **without** `stripHtml`
  (preserves WYSIWYG markup for `v-html`). (`useWordPress.ts`)
- [x] **`queryNowContent(uri = '/about')`:** ~~scoped `nodeByUri` query~~ —
  **removed.** Initially a scoped field query (and had an `$uri: ID!` bug — should
  be `String!` — which threw a fatal SSR error that blanked `/now` and broke
  client nav to `/about`; fixed before removal). Superseded once `/now` needed the
  portrait too: `/now` now fetches the whole About page via
  `queryWordPressPageByUri('/about')` and reads both `nowContent` and the portrait
  from it. `queryNowContent` + `WordPressNowContentResponse` deleted as unused.
  NOTE: `queryPageSeoDescription` still has the same latent `ID!` bug but is never
  actually called (only in generated `.nuxt` stubs) — flag if it's ever wired up.

### Post-QA revisions (2026-06-30)

User feedback after first render; all done:

- [x] **`/now` portrait:** shows the same portrait as About, extracted from the
  first `core/image` block of the About body (`extractFirstImage`). Floated right,
  window border, no mat. Single upload, no extra ACF field. (`pages/now.vue`)
- [x] **`/now` site nav removed:** `/now` matched no page-type, so `SiteNav` fell
  through to the full nav-items variant (effectively unused elsewhere). Added
  `definePageMeta({ hideSiteNav: true })` + a `hideSiteNav` RouteMeta flag honored
  by `layouts/default.vue` (`showSiteNav`). (`pages/now.vue`, `layouts/default.vue`)
- [x] **`/now` redundant "Now" eyebrow removed;** kept the `h1` page title.
- [x] **`/now` "More about me" link:** now uses `rich-link` + arrow-`::after`
  hover-nudge, matching the homepage `HomeVitalInfo` CTA treatment. (`pages/now.vue`)
- [x] **About Now `h2` flush-left:** `heading-h2-block` capped width at
  `--article-column-heading` and centered it (~16px indent vs the body column);
  overrode `width:100%; max-width:none; justify-self:start`. (`pages/about.vue`)
- [x] **About floated-image mat override:** the article-post cream photo-mat read
  as a weird off-center crop on About; dropped `background`/`padding` on
  `figure.alignleft/alignright` in the About body (image keeps its window border).
  The image was never actually cropped — the mat was the whole problem.
  (`pages/about.vue`)
- [x] **About body width + portrait breathing room (2nd/3rd pass):** the portrait
  was squeezing the wrapped text too thin, and the first dip attempt (fixed
  `-6rem` gated at `min-width: 1800px`) only helped the widest screens. Reworked:
  - `.body-column` set to 42rem (good ~67ch measure that also leaves gutter room
    for the dip across more viewport sizes).
  - Text/portrait gap bumped to `var(--space-6)` (32px) + `margin-block-end`
    `var(--space-5)` for vertical breathing (was ~25px, felt tight).
  - Portrait dip is now a **fluid, self-limiting** value:
    `margin-right: clamp(-13rem, calc((1380px - 100vw) * 0.4), 0px)`. Zero until
    ~1380px, then grows with viewport (dip 0.4× vs gutter 0.55×, so the gutter
    always outpaces the dip → can never push the image off-screen). Scales across
    mid-size laptops (≈24–88px at 1440–1600) up to ~200px at 1920. Verified no
    horizontal overflow at 1920; dip/gutter safety confirmed across 1366–1920.
    Only `alignright` dips (the hero title occupies the left, so there is no left
    gutter for `alignleft`). (`pages/about.vue`)
  - NOTE: browser-resize testing of mid-size widths was unavailable in-session
    (window stuck at 1920); relied on the dip/gutter math above.
  - **Follow-up fix (alignment):** the Now section's left edge wasn't flush with
    the About body copy. The copy sits in `content-flow`'s content column
    (`--article-grid-content`, centered → ~16px inset from the body-column edge),
    while the Now section spanned the full body-column. Constrained
    `.now-section { max-width: var(--article-grid-content); margin-inline: auto }`
    so it shares the exact same measure/inset at every width (verified left+right
    edges match the copy, delta 0). (`pages/about.vue`)
  - **Follow-up fix:** the dipped portrait was getting its right side clipped —
    BlockRenderer's root carries `.content-flow`, which sets `overflow-x: clip`
    (a guard for 100vw full-bleed blocks). Overrode `.body { overflow: visible }`
    on the About page only; it has no full-bleed blocks and the dip is clamped
    within the gutter, so no h-scroll (verified `scrollWidth == clientWidth`,
    image right edge inside the viewport). (`pages/about.vue`)
- [x] **`/about` link/prose recipes:** Now heading uses `heading-h2-block`, Now
  body uses standard body tokens + `paragraph-deep-links` (standard `rich-link`
  color, not the earlier bespoke `--color-primary-heavy`).
- [x] **`/now` route:** new `pages/now.vue` — eyebrow + title + `v-html` prose +
  "More about me → /about" link; sparse editorial styling; empty/loading/error
  states.
- [x] **About Now section:** `pages/about.vue` renders `<section id="now">` with
  the Now content via `v-html` when present, spanning the page grid below the body,
  separated by a `--color-slip-border` hairline.
- [x] **`corepack pnpm check`** passes (editor CSS gen + lint + typecheck).
