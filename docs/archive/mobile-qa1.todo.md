# Mobile QA Pass 1 — To Do

Operational checklist for [mobile-qa1.md](mobile-qa1.md).

## Background

The transition spike is closed and the writing archive surface has landed. The
next practical work is a small, disciplined mobile QA pass over layout fit,
content-flow rhythm, and a handful of obvious overflow problems.

This doc was generated from `docs/scratch/mobile-qa1.md`. The original scratch
note was intentionally terse; this todo turns it into implementable work.

## Project Organization

- Conceptual doc: [mobile-qa1.md](mobile-qa1.md).
- Related loose notes: `docs/scratch/misc1.md`.
- Adjacent active spike: `docs/bento-writing.md` / `.todo.md`.
- Relevant durable docs: `docs/design-system.md`, `docs/visual-design.md`, and
  `AGENTS.md`.

## General Principles

- Keep fixes small and visible.
- Prefer shared-component recipe fixes when the problem appears in authored
  Gutenberg content.
- Prefer route/component-local fixes only for surface-specific layout issues
  like the writing archive rows or SiteNav mobile placement.
- Do not re-open the featured-media transition spike unless a mobile fix creates
  a new transition regression.
- Use `phone` as the existing small-screen breakpoint name.
- Preserve desktop alignment unless the todo item explicitly calls for checking
  desktop too.

## Current State Overview

- Mobile transition motion is accepted enough to move on.
- Writing archive title-wrap shiver is no longer blocking this pass.
- Side Projects mobile overflow may already be fixed; verify before changing.
- The homepage still may have a small right overflow, probably from Selected Work
  outlines/card geometry.
- Several content-flow blocks need mobile rhythm tuning: headings, lists,
  blockquotes, pullquotes, and float-break wrappers.

## To Do

### 1. Content-flow Mobile Rhythm

- [x] **Heading inset parity:** Changed phone `padding-inline` in `heading-article-frame`
  from `var(--article-padding-inline)` (~8px at narrow phones) to `var(--space-4)` (16px),
  matching the phone content-grid gutter exactly so h2–h6 text aligns with paragraphs.
- [x] **List rhythm:** Added phone breakpoint to `list-block` reducing `margin-bottom`
  from `var(--space-5)` (1.5rem) to `var(--space-4)` (1rem).
- [x] **Blockquote mobile width:** Added phone breakpoint to `quote-shell` reducing
  `padding-inline` from `var(--space-5)` (1.5rem) to `var(--space-3)` (0.75rem).
- [x] **Blockquote ground:** Addressed in content-blocks spike.
- [x] **Pullquote mobile centering:** Confirmed on human QA — right/wide/full pullquotes
  center correctly on phone.
- [x] **Float-break wrapper spacing:** Added phone breakpoint to `.float-breakout-flow`
  reducing `margin-bottom` from `var(--space-7)` (3rem) to `var(--space-5)` (1.5rem).

### 2. Navigation Mobile Placement

- [x] **Interior nav flush-left:** Confirmed on human QA — pill left edge aligns with content
  column on phone.

### 3. Writing Archive Mobile Fit

- [x] **Rows flush to mobile edges:** Confirmed working on mobile after misc1 fix.
- [x] **Year-group rhythm:** Added phone breakpoint to `WritingArchiveList.vue` reducing
  `.year-group { margin-bottom }` from `var(--space-8)` (4.5rem) to `var(--space-6)` (2rem).

### 4. Horizontal Overflow

- [x] **Homepage overflow:** Root cause: `case-study-card::after { inset: -2px }` extends
  the border overlay 2px past the card's box; on the full-bleed Selected Work section
  (which reaches the viewport edge), that 2px escapes the viewport and creates a scrollbar.
  Fixed: added `overflow-x: clip` to `.selected-work-section` in `HomeSelectedWorkSection.vue`.
- [x] **Side Projects verification:** Confirmed clean — no horizontal overflow on mobile.
- [x] **Full-width (`alignfull`) blocks global fix:** Global phone override in `width-alignment(full)` mixin
  now sets `box-sizing: border-box; width: 100%; margin-inline: 0; overflow-x: clip` — fixes
  `100vw` scrollbar-width discrepancy and clips child box-shadow bleed for all `alignfull` blocks.
- [x] **Gallery `alignwide`/`alignfull` shadow bleed:** Phone rules were using
  `width: 100vw; margin-left: calc(50% - 50vw)` which cascades into overflow when
  any other block has already pushed the page wider. Replaced with `width: 100%;
  margin-inline: 0` (relying on phone grid column) + `overflow-x: clip` to trim
  image box-shadow bleed. `padding-inline: var(--space-2)` retained so shadows
  breathe away from the viewport edge. (`_gallery-block.scss`)
- [x] **Media-text `alignwide`/`alignfull` shadow bleed:** Added `overflow-x: clip` +
  `padding-inline: var(--space-4)` on `.copy` for `alignwide`/`alignfull` blocks on phone.
  (`_media-text-block.scss`)
- [x] **Wide embed shadow bleed:** Added `overflow-x: clip` for `alignwide` on phone.
  (`_embed-block.scss`)
- [x] **Wide table shadow bleed:** `.table-scroll` child has `box-shadow` that bleeds
  past the viewport on phone. Added `overflow-x: clip` for `.alignwide` on phone in
  `table-shell`. Does not affect the table's internal horizontal scroll. (`_table-block.scss`)
- [x] **File download block overflow:** `file-grid-shell` had `padding: var(--space-4)` + `width: 100%`
  without `box-sizing: border-box`, causing 32px width overflow on narrow phone. Fixed with
  `box-sizing: border-box`. (`_file-block.scss`)
- [x] **Wide/full columns flush-left (phone):** `alignwide` now included alongside `alignfull`
  in `columns-phone-stack` padding rule: `padding-inline: var(--space-4)`. (`_columns-block.scss`)
- [x] **Full-width columns flush-left (desktop):** `columns-shell` `alignfull` branch now sets
  `padding-inline: max(var(--space-4), calc((100% - var(--article-grid-content)) / 2))`
  with `box-sizing: border-box` so column text aligns with the article content column.
  (`_columns-block.scss`)
- [x] **Blockquote UA margin:** Added `margin-inline: 0` to `quote-shell` base to reset
  browser default 40px blockquote margin. Padding kept at `var(--space-2)`. (`_quote-block.scss`)
- [x] **Audio block overflow (defensive):** Root cause unresolved via code analysis — the block
  CSS looks correct (`width: 100%; box-sizing: border-box; grid-column: wide`). Added
  `overflow-x: clip` for `alignwide`/`alignfull` on phone as defensive measure. Needs
  fresh QA pass on phone to confirm resolved. Longer-term fix likely belongs in the
  custom audio player spike because native browser controls are hard to size/style
  reliably. The audio spike later closed with a custom player and figure-margin
  overflow fix. (`_audio-block.scss`, `docs/archive/audio-player.md`)

### 5. Case Study Navigation

- [x] **Prev/next nav 2-column on phone:** Was stacking to single column. Changed to
  `grid-template-columns: repeat(2, minmax(0, 1fr))` with smaller card sizing so both
  links appear side-by-side on phone. (`CaseStudyLoopNav.vue`)

### 6. Loop Nav Transition Choreography

Discovered during mobile QA: the detail→detail (loop nav) transition lacked the same
"surroundings out → transition → surroundings in" choreography as other transitions.

- [x] **`isLoopNavDeparting` flag:** Added watch that fires when `transitionState.active`
  is true for a DIFFERENT key than the current page (i.e., the user clicked prev/next
  loop nav). This flag drives all departure animations. (`[slug].vue`)
- [x] **Hero slides up on departure:** `.hero` animates `translateY(0) → translateY(-60vh)`
  over `--surroundings-duration`, physically sliding the hero off the top of the screen.
  (`[slug].vue`)
- [x] **Body slides right on departure:** `.content` reuses `detail-content-exit` keyframe
  (translateX to right) over `--surroundings-duration`. (`[slug].vue`)
- [x] **Clicked loop nav card shell fades on departure:** The card marked `is-transition-source`
  (set by `CaseStudyLoopNav` when `isTransitioning()` is true) fades `opacity: 0`. Its photo
  and title are already invisible via `is-transition-hidden`, so only the border and label-slip
  background fade. (`[slug].vue`, `CaseStudyLoopNav.vue`)
- [x] **Other loop nav card slides down on departure:** `.link:not(.is-transition-source)`
  physically slides `translateY(100vh)` off the bottom. Uses a simple class selector rather
  than `:has()` which doesn't compile reliably inside Vue's `:deep()`. (`[slug].vue`)
- [x] **Footer slides down on departure (JS):** Footer is outside `.site-main` so it can't
  be reached by page-scoped CSS. Added `isLoopNavDeparting` JS watch that checks if the
  footer is visible (top < innerHeight) and animates it `translateY(0) → translateY(100vh)`
  using the Web Animations API. (`[slug].vue`)
- [x] **Footer animation cancelled on arrival:** On the new detail page, `enteredViaTransition`
  watch cancels any forward-fill footer animations so the footer snaps to natural position
  before the user scrolls. Invisible because user starts at top. (`[slug].vue`)
- [x] **`enteredViaLoopNav` detection:** `enteredViaTransition` watch checks
  `sourceRegistry.value[key].at(-1)` — if it starts with `/case-studies/`, the page was
  arrived at via loop nav. (`[slug].vue`)
- [x] **Body slides in from left on loop nav arrival:** `is-arriving-from-loop` class drives
  `detail-content-enter-loop` keyframe: `translateX(-100%) → translateX(0)` (pure translate,
  no fade). `overflow-x: clip` on both `.content` and article prevents horizontal scroll
  during animation. Replaces `detail-content-rise` which starts on-screen on mobile.
  (`[slug].vue`)
- [x] **Reduced-motion guard updated:** New classes added to `prefers-reduced-motion` query.
  (`[slug].vue`)

### 7. Stepped Title Ground Color — Home↔Detail Transition

Discovered during QA: the clone's stepped title ground strips showed the wrong color at the
start and end of home→detail and detail→home transitions on mobile.

Root cause: `cloneTitleGroundColor` was hardcoded to `var(--color-surface-warmer)` regardless
of which surface was clicked. Home cards use `var(--color-surface)` for their ground; loop nav
cards and the detail hero use `var(--color-surface-warmer)`. A single hardcoded value can't
satisfy both.

Fix: capture the source element's actual ground color at clone-creation time (one-time DOM
read, not reactive) and animate between it and the destination color during flight.

- [x] **`SteppedTitleGround.vue`:** Added `data-ground-color` attribute to root `<span>`
  mirroring the `groundColor` prop so the transition layer can read it from the DOM.
- [x] **`useFeaturedMediaTransition.ts`:** Added `titleGroundColor: string | null` to
  `FeaturedMediaTransitionState` and `initialFeaturedMediaTransitionState`. In
  `startFeaturedMediaTransitionFromRole`, reads
  `sourceTitle?.querySelector('[data-featured-title-text-layer]')?.dataset.groundColor`
  and stores as `titleGroundColor`.
- [x] **`FeaturedMediaTransitionLayer.vue`:** `cloneTitleGroundColor` reads
  `transitionState.value.titleGroundColor` (fallback `--color-surface-warmer`). This sets
  `--stepped-title-ground-color` on the strips' ancestor via the `ground-color` prop.
- [x] **`mobile-case-title-ground-enter` keyframe:** Holds `var(--stepped-title-ground-color)`
  (= captured source color) for 0–30%, eases to `var(--color-surface-warmer)` by 85–100%.
  Strips match the source card at clone-birth; arrive cream at the detail hero.
- [x] **`mobile-case-title-ground-exit` keyframe:** Holds `var(--color-surface-warmer)` for
  0–30% (over the detail hero), eases to `var(--color-surface)` by 85–100%. Strips arrive
  white when the clone lands on the home card. Removed old `opacity: 0` fade (inconsistent
  with the physical/no-fade brand voice).
- [x] **`CaseStudyCard.vue` reverted:** Earlier incorrect fix had changed `ground-color` prop
  and `.link-box` background to `--color-surface-warmer`. Reverted to `--color-surface` —
  the card's lighter surface is intentional and now matched by the transition system.

## Pending Investigation

- [x] **Font size mismatch (CMS vs public frontend):** Closed — confirmed to be a misreading
  of QA fixture content vs. live content; no actual stylesheet difference. No code change needed.
- [x] **Gallery QA on actual phone hardware:** Closed for this spike. Real-device QA is
  recommended but not blocking; the grid-column approach is structurally sound.

### 8. Late-Session Fixes (horizontal overflow + content layout)

- [x] **Desktop horizontal overflow — pullquote:** Full-width pullquote was creating desktop
  horizontal scroll. Fixed by adding `overflow-x: clip` to `.content-flow` in
  `_vue-frontend.scss`. (`_vue-frontend.scss`)
- [x] **Desktop horizontal overflow — embed/video shadow:** Full-width embed and video embeds
  had shadow bleed past viewport. Fixed by adding `.embed-frame { box-shadow: none }` for
  `alignfull` in `embed-block`, and `video { box-shadow: none }` for `alignfull` in
  `video-block-shell`. (`_embed-block.scss`)
- [x] **Wide video off-center (desktop):** `video-block-shell` `alignwide` rule was missing
  `max-width: none; width: 100%`, causing the video to cap at `--article-frame` and
  left-align within the wide column. Fixed by adding those two declarations. (`_embed-block.scss`)
- [x] **Wide video off-center (mobile):** `<figure>` elements have a browser UA default of
  `margin: 1em 40px`. The `video-block-shell` mixin never reset this, so on phone the video
  started 40px from the left edge. Fixed by adding `margin-inline: auto` to the
  `video-block-shell` base (matching `embed-block` which already had this reset). (`_embed-block.scss`)
- [x] **File download button wrapping on mobile:** Phone breakpoint in `file-block` was
  overriding `grid-template-columns` to `1fr`, collapsing to a single column and pushing the
  download button to a new row. Fixed by removing that override. The base 2-column layout
  (`minmax(0,1fr) auto`) with `min-width: 0` on `.file-meta` already handles narrow widths
  correctly. (`_file-block.scss`)
- [x] **Loop nav "Next" card shadow bleed (phone):** The rightmost card was flush to the
  viewport edge and its `shadow-hard-low` (0.35rem right offset) bled past the viewport.
  Fixed with asymmetric `padding-inline: 0 var(--space-2)` on the phone breakpoint —
  left card stays flush, right card has 8px of shadow breathing room. (`CaseStudyLoopNav.vue`)
- [x] **Mega gallery shadow bleed (phone):** Items near the right viewport edge had shadow
  bleed. Fixed with `padding-inline: var(--space-2)` on `&.alignfull` in the phone
  breakpoint. (`MegaGalleryBlock.vue`)

## Follow-On / Spin-Out Candidates

- **Audio block overflow / custom player:** Audio custom-player work closed in
  `docs/archive/audio-player.md`. If audio regresses, inspect `_audio-block.scss`
  root figure margins and phone content-column sizing before adding clipping.
- **Case-study previous/next transition state:** Misc QA noted a clone/state issue in
  the bottom previous/next case-study nav, likely related to mobile header/detail
  styling differences. If reproducible, treat it as a focused transition QA item,
  not as general mobile spacing work.

## Done

- [x] Promoted the scratch note into active spike docs:
  [mobile-qa1.md](mobile-qa1.md) and this todo file.
