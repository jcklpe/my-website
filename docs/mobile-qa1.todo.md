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
- [ ] **Pullquote mobile centering:** The `tablet-down` reset in `_pullquote.scss` already
  clears floats and sets `width: 100%; margin-inline: 0` — needs visual confirmation.
- [x] **Float-break wrapper spacing:** Added phone breakpoint to `.float-breakout-flow`
  reducing `margin-bottom` from `var(--space-7)` (3rem) to `var(--space-5)` (1.5rem).

### 2. Navigation Mobile Placement

- [ ] **Interior nav flush-left:** The phone breakpoint already sets `left: var(--space-4)`.
  Needs visual confirmation that the nav pill's left edge aligns with the content column.

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

## Ready For Human QA

Move completed implementation items here when the user should visually confirm
them on a phone or in mobile browser emulation.

Suggested QA routes:

- `http://127.0.0.1:3001/`
- `http://127.0.0.1:3001/writing`
- `http://127.0.0.1:3001/side-projects`
- a representative writing detail page
- a representative case-study detail page

Suggested QA checks:

- No horizontal scroll into blank ground.
- Headings, paragraphs, lists, quotes, and pullquotes share a coherent mobile
  content rhythm.
- Interior nav feels intentionally placed on mobile.
- Writing archive rows feel edge-aligned without clipping text.

## Pending Investigation

- [ ] **Font size mismatch (CMS vs public frontend):** Content on the QA/CMS kitchen sink page appears smaller than on the public frontend. Root cause unknown — do not change code until investigated. Compare which stylesheet is loaded on each, whether `--type-body-size` differs, or if a different Sass context is active.
- [ ] **Gallery QA on actual phone hardware:** Gallery overflow fix replaced `100vw` approach with grid-column; needs real-device confirmation that both `alignwide` and `alignfull` galleries are fully contained.

## Ready For Human QA (Implementation Complete)

The following items need visual confirmation on a real phone or mobile emulation:

- **Heading inset parity** — heading text should align with paragraph left edge at all phone sizes; headings inside collapsed two-column blocks should NOT be double-indented (ColumnBlock.vue reset)
- **List rhythm** — margin-bottom now 0.5rem on phone; lists should feel part of prose flow
- **Paragraph margin-bottom** — now 0 on phone; paragraphs should flow tightly into lists and subsequent headings provide section rhythm
- **Heading margin-top** — h2 reduced to 1.5rem, h3 to 1rem, h4 to 1.5rem (from 3rem), h5/h6 to 1rem
- **Blockquote width** — inline padding now 0 on phone; quote should use the full content column
- **Pullquote overflow** — added `box-sizing: border-box` to tablet-down float reset; `width:100%` + 16px inline padding was overflowing by 32px without it
- **Float-break wrapper spacing** — gaps around floated/breakout blocks should not feel excessive
- **Year-group rhythm** — writing archive year sections should breathe without too much separation
- **Homepage overflow** — confirm horizontal scroll is gone on the homepage
- **Interior nav** — now `left: 0` on phone; pill should be flush with viewport left edge
- **Media/text block text** — `alignwide`/`alignfull` blocks now add `padding-inline: var(--space-4)` to `.copy` on phone
- **Pullquote centering** (additional visual check — right/wide/full pullquotes should be centered)
- **Gallery overflow (phone)** — `alignwide`/`alignfull` gallery should span full viewport with no horizontal scroll; image box-shadows should be clipped at viewport edge with a small inset gap
- **Media-text shadow** — wide/full media-text blocks should have no shadow bleed past viewport on phone
- **Embed shadow** — wide video embeds should have no shadow bleed past viewport on phone
- **Table shadow** — wide table blocks should have no shadow bleed past viewport on phone; horizontal table scroll should still work inside the block
- **File download block** — normal and wide file blocks should be fully contained within viewport on phone
- **Wide/full columns gutter** — `alignwide` columns should have matching 16px gutter on phone; `alignfull` columns should have text that aligns with the article content column on desktop
- **Audio block overflow** — wide audio block should be contained within viewport on phone; confirm no horizontal scroll caused by audio player
- **Case study prev/next nav** — should show 2 cards side-by-side on phone (not stacked)

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
