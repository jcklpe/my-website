# Content Blocks Polish Pass — To Do

## Status: ✅ Implementation Complete

See `content-blocks.md` for full scope and rationale.

---

## Background

This spike is a broad polish pass over Gutenberg-rendered content blocks in writing posts, case studies, and the WordPress editor. The goal is to make common editorial blocks feel like one Blue Atlas content system: readable, framed only where framing helps, and consistent between frontend and editor where that consistency improves authoring clarity.

This work started from a mostly visual checklist. The checklist should stay operational, but completed implementation should move to `Done` and uncertain browser/editor judgment should live in `Ready for Human QA`.

## Project Organization

- Conceptual doc: [content-blocks.md](content-blocks.md)
- Spike process reference: [how-to-spike.md](../how-to-spike.md)
- Related visual direction: [visual-design.md](../visual-design.md)
- Shared style docs: [design-system.md](../design-system.md)
- Adjacent active work at the time: [misc1.todo.md](misc1.todo.md), [mobile-qa1.todo.md](../mobile-qa1.todo.md)

## General Principles

- Keep the public frontend as the source of truth for final visitor-facing rendering.
- Prefer shared-component recipes for block families so writing posts, case studies, and editor adapters stay coherent.
- Do not force exact frontend/editor parity; editor fixes should make authoring legible and predictable.
- Use existing Blue Atlas tokens: `--border-window`, hard shadows, surface levels, primary signal blue, and shared caption/type mixins.
- Avoid overlap with misc1 while that spike is in flight: nav, writing archive row layout, route transition layer, and detail page shells are out of scope here.
- Treat visual judgment separately from mechanical implementation. Move completed code that still needs eyes to `Ready for Human QA`, not straight to `Done`.

## Current State Overview

- The main content-block polish checklist has been implemented and reviewed through several human QA feedback cycles.
- Typography, quote, table, embed/video, file, accordion/details, inline code, media/text, image float, editor caption, Gallery, and Mega Gallery polish all have implementation entries in `Done`.
- Gallery behavior now respects CMS column/crop/alignment choices, keeps left-to-right row grouping, uses mobile composition capped at three columns, and lets mobile wide/full galleries break toward the viewport edge.
- Native browser audio controls remain intentionally uncustomized in this spike; the custom audio player replacement is captured as a separate active spike.
- Focused verification has passed after each substantive batch: editor stylesheet generation, relevant ESLint targets, and frontend typecheck.
- Full `corepack pnpm check` remains blocked by unrelated in-flight footnote lint errors, not by this content-block work.

## To Do

No active implementation items remain in this spike.

Remaining non-implementation bookkeeping before retiring the spike:

- Decide whether to run full `corepack pnpm check` after the unrelated footnote lint work is repaired.
- Decide whether this spike should be archived now, or left active briefly while the current visual QA session cools down.
- Replacing native browser audio controls was promoted into its own spike and later archived at [audio-player.md](audio-player.md) / [audio-player.todo.md](audio-player.todo.md).

## Ready For Human QA

No active human QA items remain. The user reviewed the work through the feedback cycles and marked the human QA complete.

## Done

### 2026-06-28 First Implementation Batch

- [x] Removed desktop inline padding on H2-H6 so headings align flush with paragraph text; kept mobile inset behavior.
- [x] Tightened table framing by moving the hard border/shadow to the table scroll frame and keeping captions below/outside the framed table.
- [x] Added first-pass border/shadow treatment to embeds, video, gallery images, media/text media, and Mega Gallery candidate surfaces.
- [x] Added first-pass audio wrapper treatment, later marked for revision after browser QA showed native controls remain white and the outer figure border reads wrong.
- [x] Added first-pass file block signal strip and arrow animation, later marked for revision because it did not match the established slip pattern.
- [x] Added first-pass accordion hard shadow and larger toggle, later marked for revision because the bordered cream icon box reads wrong and the requested animation is missing.
- [x] Added first-pass inline code CRT treatment, later marked for refinement to derive from the active code-block background custom property.
- [x] Added first-pass floated image spacing, later marked for revision because the real need is a stronger page-ground mat around floated images.
- [x] Added first-pass WordPress editor caption placement fix, later marked for revision because the result is still not readable enough.
- [x] Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css`.

### 2026-06-28 Human Review Fix Batch

- [x] Changed blockquote material from cream to `--color-surface-faint` so it keeps the prior translucent paper feel at 0.5 alpha.
- [x] Expanded embed/video sizing so YouTube, Vimeo, fallback embeds, and video blocks share the larger article-frame width while guarding against mobile overflow.
- [x] Removed the first-pass audio figure border/background; audio now leaves native controls alone and keeps only width/accent-color handling.
- [x] Split audio captions out of raw `v-html` so they use the shared figure-caption recipe.
- [x] Reworked the file download arrow to use the established slip-out/slip-in keyframe pattern from footnotes.
- [x] Removed the accordion toggle's cream bordered square while keeping the larger toggle size and adding plus/minus rotation motion.
- [x] Reduced h3 bottom margin to `0.2rem` and scaled h4 below h3.
- [x] Changed inline code to derive its background from `--code-crt-bg` with the ink fallback used by code blocks.
- [x] Fixed media/text image framing through Vue scoped `:deep()` selectors so normal and wide media/text blocks actually receive the border/shadow treatment.
- [x] Removed residual border/shadow/background from full-width images.
- [x] Increased the floated-image page-ground mat from 10px to 20px.
- [x] Strengthened WordPress editor image/gallery caption selectors so nested gallery captions render below media with frontend-style caption treatment.
- [x] Added border + hard shadow treatment to Mega Gallery image and video triggers.

### 2026-06-28 Second Review Fix Batch

- [x] Set h4 bottom margin to `0`.
- [x] Scaled h5 below h4.
- [x] Removed Mega Gallery video overflow clipping and line-height whitespace so the trigger border hugs media and shadows remain visible.
- [x] Added a real clipped wrapper around the file download arrow so the keyframe reads as slipping through an invisible slit.
- [x] Increased the accordion +/- glyph size by roughly 50%.
- [x] Added theme-surface values for code themes and passed the selected code theme to the content-flow wrapper so inline code can follow Midnight/Phosphor/Signal backgrounds.
- [x] Added extra right-side shadow clearance for floated images.

### 2026-06-28 Third Review Fix Batch

- [x] Scaled h6 slightly below h5 while keeping all-caps styling.
- [x] Fixed inline code theme variables so the inherited selected syntax theme surface is no longer overridden locally on the code element.
- [x] Added a bit more breakout-side whitespace for floated images.
- [x] Drafted a custom audio player scratch spike at `docs/scratch/audio-player.md`; later promoted and archived at `docs/archive/audio-player.md` / `.todo.md`.
- [x] Confirmed floated-image lightbox behavior is already covered by `docs/scratch/lightbox.md`.

### 2026-06-28 Inline Code Final Polish

- [x] Brightened inline-code backgrounds per syntax theme: Midnight `#2438A4`, Signal `#163A39`, Phosphor `#352826`.
- [x] Added per-theme inline-code foregrounds with AA contrast: Midnight `#E0EAFF`, Signal `#66FFA9`, Phosphor `#FECC55`.
- [x] Removed the inline-code border.

### 2026-06-28 Column-Aware Gallery Layout

- [x] Replaced the default Gallery block's simple auto-fit grid with a column-aware row layout.
- [x] Treated the CMS column setting as the authorial row grouping instead of streaming every image through one global justified chain.
- [x] Preserved source order and left-to-right reading.
- [x] Preserved source image aspect ratios when gallery cropping is disabled.
- [x] Respected gallery cropping when enabled by switching those rows to equal-column cropped cells.
- [x] Used three columns as the frontend interpretation of Gutenberg's `columns-default`, while allowing explicit `columns-N` / block attributes to override it.
- [x] Avoided CSS masonry columns because they break left-to-right reading order.
- [x] Avoided reusing Masonry.js because Mega Gallery already owns that heavier behavior.
- [x] Added a `ResizeObserver`-based container-width measurement so rows recompute only when the gallery width changes.
- [x] Kept initial mobile behavior simple: gallery items stacked full-width on phone. Later revised in the mobile gallery composition follow-up.
- [x] Rendered gallery-level captions once under the full gallery with the shared figure-caption treatment.

### 2026-06-28 Justified Gallery QA Fix

- [x] Fixed phone overflow caused by justified rows staying `nowrap` while phone items were forced to `100%` width.
- [x] Added client-side natural image ratio correction so justified row math uses loaded image dimensions when WordPress width/height attributes are missing or unreliable.

### 2026-06-28 Human QA Accepted

- [x] User reviewed the content-block changes during feedback cycles and marked human QA done.
- [x] Custom audio player work was identified as a separate future spike, drafted at `docs/scratch/audio-player.md`, and later promoted and archived at `docs/archive/audio-player.md` / `.todo.md`.

### 2026-06-28 Gallery Alignment Follow-Up

- [x] Added a gallery alignment fallback from structured block attributes so `alignwide`, `alignfull`, `alignleft`, `alignright`, and `aligncenter` survive even when rendered root classes are incomplete.
- [x] Added frontend gallery styling for wide and full alignments through the content-flow geometry.
- [x] Added frontend gallery styling for left and right floated alignments, with phone stacking behavior.

### 2026-06-28 Mobile Gallery Composition Follow-Up

- [x] Kept gallery floats collapsed on phone while preserving gallery-internal composition.
- [x] Changed phone gallery rows from forced one-column stacking to an editorial grid capped at three columns.
- [x] Preserved the CMS column intent on mobile up to the three-column cap, so a five-image default gallery can render as a three-item row followed by a two-item row.
- [x] Added wide-landscape detection so very wide gallery images can span the full mobile row.
- [x] Made mobile wide/full galleries break out toward the viewport edge instead of staying inside the article gutter.
- [x] Hardened gallery alignment discovery so alignment can come from structured attributes or any rendered gallery-related class list.

### Verification History

- [x] `corepack pnpm styles:wp-editor` passed after the first batch.
- [x] `corepack pnpm typecheck` passed after the first batch.
- [x] `corepack pnpm styles:wp-editor` passed after the second review fix batch.
- [x] Focused ESLint passed for touched content block Vue files: `BlockRenderer.vue`, `AudioBlock.vue`, `FileBlock.vue`, and `MegaGalleryBlock.vue`.
- [x] `corepack pnpm typecheck` passed after the second review fix batch.
- [x] `corepack pnpm styles:wp-editor`, focused ESLint, and `corepack pnpm typecheck` passed after the third review fix batch.
- [x] `corepack pnpm styles:wp-editor`, focused ESLint for `BlockRenderer.vue` / `syntax-highlighting.ts`, and `corepack pnpm typecheck` passed after inline-code final polish.
- [x] `corepack pnpm styles:wp-editor`, focused ESLint for `GalleryBlock.vue`, and `corepack pnpm typecheck` passed after justified gallery implementation.
- [x] Focused ESLint for `GalleryBlock.vue`, `corepack pnpm typecheck`, and `corepack pnpm styles:wp-editor` passed after justified gallery QA fix.
- [x] Focused ESLint for `GalleryBlock.vue`, `corepack pnpm typecheck`, and `corepack pnpm styles:wp-editor` passed after the column-aware gallery refinement.
- [x] Focused ESLint for `GalleryBlock.vue`, `corepack pnpm typecheck`, and `corepack pnpm styles:wp-editor` passed after the gallery alignment follow-up.
- [x] Focused ESLint for `GalleryBlock.vue`, `corepack pnpm typecheck`, and `corepack pnpm styles:wp-editor` passed after the mobile gallery composition follow-up.
- [x] Focused ESLint for `GalleryBlock.vue`, `corepack pnpm typecheck`, and `corepack pnpm styles:wp-editor` passed after the wide-gallery mobile width correction.
- [ ] `corepack pnpm check` was attempted, but failed on unrelated in-flight footnote lint errors in `FootnoteBottomSheet.vue` and `FootnoteInNote.vue`.
