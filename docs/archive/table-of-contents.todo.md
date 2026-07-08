# Table Of Contents To-Do

## Background

This spike adds an article outline / table-of-contents affordance to long-form
writing posts and case studies.

The feature is partly navigational and partly atmospheric. It should help
readers orient in longer pieces, but it should also fit the site's article
apparatus system alongside sidenotes, footnotes, captions, and the existing
local nav.

The user named Maggie Appleton's table of contents behavior as a reference:
visible at first, auto-collapsing after continued scroll, and manually
reopenable. The goal is not to copy Maggie's visual style; it is to adapt that
orientation-then-disappear behavior to Blue Atlas.

## Project Organization

- Conceptual doc: `docs/table-of-contents.md`
- Operational doc: `docs/table-of-contents.todo.md`
- Likely component: `apps/frontend/components/content/ArticleToc.vue`
- Likely composable: `apps/frontend/composables/useArticleToc.ts`
- Writing integration: `apps/frontend/pages/writing/[slug].vue`
- Case-study integration: `apps/frontend/pages/case-studies/[slug].vue`
- Article grid/context: `packages/styles/context-role/_vue-frontend.scss`

## General Principles

- Treat the TOC as article apparatus, not global navigation.
- Left side belongs to article outline; right side remains available for
  sidenotes/footnotes.
- Desktop uses a left rail. Phone/tablet uses an inline collapsed top-of-article
  "Contents" block rather than a persistent floating rail.
- Prefer normal anchor semantics and progressive enhancement.
- Suppress the TOC when an article is too short to need it.
- Respect reduced-motion for smooth scrolling and any collapse animation.
- Avoid adding a schema/GraphQL field until DOM extraction proves insufficient.
- Authored media/layout blocks take visual priority over the TOC. The TOC can
  pass underneath wide/full/floated/layout content rather than dodging every
  obstacle.
- If overlapping feels visually busy, add neutral ground or matting to the
  authored block surfaces rather than raising the TOC above them.

## Current State Overview

- Writing and case-study pages render structured Gutenberg blocks through
  `BlockRenderer`.
- Headings are rendered as normal DOM headings after the lazy body blocks load.
- `.content-flow` owns content/wide/full article grid tracks, but it does not
  currently provide a left rail track.
- `SiteNav` already provides page-level wayfinding and is scroll-aware; the TOC
  must not feel like a second global nav.
- Footnotes/sidenotes already occupy the right side on desktop; TOC should avoid
  the right margin.
- Wide/full images, galleries, columns, media/text, and floated blocks can
  intrude into the left margin. The TOC needs a lower-priority layer model so
  authored content can pass over it without collision choreography.

## To Do

- [x] Promote `docs/scratch/table-of-contents.md` to active
  `docs/table-of-contents.md`.
- [x] Flesh out the conceptual doc with the Maggie Appleton reference and the
  current design questions.
- [x] Create this companion todo doc with the full spike structure.
- [x] Decide the first-pass design model with the user.
- [x] Inspect rendered article heading DOM on writing and case-study pages.
- [x] Decide layout architecture: outer article apparatus shell vs. measured
  sticky rail.
- [x] Implement `useArticleToc` heading scan, active-section tracking,
  collapse state, and hash scrolling.
- [x] Implement `ArticleToc.vue` desktop rail.
- [x] Include `h2` through `h6` with conservative depth styling.
- [x] Integrate on writing detail pages.
- [x] Integrate on case-study detail pages.
- [x] Add mobile/tablet inline collapsed "Contents" block near the top of the
  article.
- [x] Confirm wide/full/floated/media/layout blocks visually layer above the TOC
  without ugly clutter.
- [x] Add neutral ground/matting adjustments only where overlapping content
  actually needs more visual clearing.
- [x] Refine the experimental geometry-based TOC fade so it measures actual
  content-flow children, ignores tiny overlaps, and does not fight collapse
  state.
- [x] Run `corepack pnpm check`.

## Ready For Human QA

- [x] On a long writing post, the TOC starts visible on desktop, highlights the
  active section, and links scroll to headings.
- [x] On a long case study, the TOC behaves the same without interfering with
  the hero transition or loop nav.
- [x] The TOC auto-collapses in a way that feels helpful rather than twitchy.
- [x] Manual reopen feels obvious and is respected.
- [x] Short articles do not show an unnecessary TOC.
- [x] Phone/tablet layouts show a collapsed top-of-article Contents block with
  no stray chrome or horizontal overflow.
- [x] Wide/full/floated/media/layout blocks can cross the left rail area without
  the TOC visually competing with them.
- [x] Verify the TOC rail remains visible against the article body ground while
  still feeling lower-priority than authored media/layout blocks.

## Done

- Promoted the spike out of `docs/scratch/`.
- Added a full companion todo doc.
- Inspected Maggie Appleton's `TableOfContents.astro` implementation and
  captured the useful behavior model in the conceptual doc.
- Implemented the first pass:
  - `useArticleToc.ts` scans `h2` through `h6`, generates missing IDs, tracks
    active heading on scroll/resize, and scrolls with hash updates.
  - `ArticleToc.vue` renders the flat Blue Atlas-styled desktop rail and the
    mobile/tablet collapsed top-of-article Contents block.
  - Writing and case-study detail pages wrap `BlockRenderer` in an
    `article-apparatus` shell and pass the rendered body as the TOC scan target.
- Ran `corepack pnpm check`; it passed with the existing `vue/no-v-html`
  warnings in `apps/frontend/pages/about.vue` and
  `apps/frontend/pages/now.vue`.
- Moved the TOC into `BlockRenderer`'s content-flow apparatus slot so it sits on
  the article ground while authored blocks paint above it.
- Added the shared `underlap-matte($size: 25px)` Sass pattern for cream quiet
  zones around authored blocks that cross the TOC lane.
- Applied TOC-underlap clearing to Mega Gallery, wide/full Media/Text, Columns,
  Code, Table, Embed/Video, File, Details, and Accordion blocks; Media/Text
  copy, Columns, and Audio also receive solid cream backgrounds where their
  transparent interiors would otherwise show the TOC through.
- Added the same TOC-underlap clearing to full-width Image blocks, Quote blocks,
  and Pullquote blocks. Full-width Image and Pullquote blocks also receive cream
  backgrounds so capped media or transparent quote interiors do not expose the
  TOC underneath.
- Browser-checked the footnote QA and block kitchen-sink routes for aligned
  matte application and horizontal overflow; both reported no document-level
  horizontal overflow after the changes.
- Reworked the deliberately removable TOC-obscuring heuristic in
  `ArticleToc.vue` after the first attempt hid at incorrect moments and fought
  collapse state. The refined version measures a stable expanded TOC rectangle
  against actual `.content-flow` children, ignores tiny overlaps, and fades the
  rail only when at least three content blocks meaningfully overlap it. The
  simpler layer model still holds: authored content paints above the TOC, and
  cream mattes/backgrounds quiet ordinary underlap.
- Fixed the phone/tablet TOC placement so it behaves as a normal content-column
  grid item instead of a lower-layer desktop rail. It now aligns flush with the
  paragraph column, sits above the first paragraph, and remains clickable.
- Human QA passed the final TOC behavior: case-study TOC behavior is good,
  manual reopen works, short posts suppress the TOC, mobile placement/clicking
  is good, and the underlap-matte approach is sufficient.
- Folded durable TOC and underlap-matte rules into `AGENTS.md`,
  `docs/design-system.md`, and `docs/visual-design.md` before archiving.
