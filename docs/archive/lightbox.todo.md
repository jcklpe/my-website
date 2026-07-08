# Image Lightbox — To Do

## Status: Closed 2026-06-29

See [lightbox.md](lightbox.md) for the conceptual model, constraints, current
implementation notes, and open design questions.

---

## Background

The site already has a PhotoSwipe-based lightbox foundation:

- Mega Gallery opens PhotoSwipe for image and video slides.
- `useImageLightbox()` opens single-image PhotoSwipe instances.
- Footnote images already use that single-image composable.
- PhotoSwipe CSS is globally loaded through `nuxt.config.ts`.

This spike should not rebuild the system from scratch. The work is to make the
existing PhotoSwipe chrome match the Blue Atlas visual system and extend
lightbox entry-points to image surfaces where users expect them.

## Project Organization

- Conceptual doc: [lightbox.md](lightbox.md)
- To-do doc: this file
- Origin scratch note: `docs/scratch/lightbox.md` promoted here on 2026-06-29
- Spike process reference: [how-to-spike.md](how-to-spike.md)
- Main composable: `apps/frontend/composables/useImageLightbox.ts`
- Existing gallery lightbox: `apps/frontend/components/content/blocks/MegaGalleryBlock.vue`
- Normal image block: `apps/frontend/components/content/blocks/ImageBlock.vue`
- Core gallery block: `apps/frontend/components/content/blocks/GalleryBlock.vue`
- Footnote image entry-points:
  - `apps/frontend/components/content/footnotes/FootnoteSidenote.vue`
  - `apps/frontend/components/content/footnotes/FootnoteInNote.vue`
- Relevant style recipes:
  - `packages/styles/shared-components/_image-block.scss`
  - `packages/styles/shared-components/_gallery-block.scss`
  - `packages/styles/context-role/_vue-frontend.scss`

## General Principles

- Use PhotoSwipe as the single lightbox substrate.
- Keep dynamic imports inside client-only interactions; avoid SSR breakage.
- Brand the PhotoSwipe controls with Blue Atlas language rather than accepting
  generic default chrome.
- Preserve PhotoSwipe accessibility and keyboard/touch behavior.
- Preserve intentional links. Intercept only media-file image links and explicit
  lightbox triggers.
- Keep lightbox affordances clear: `button` wrappers where possible, `zoom-in`
  cursor for clickable images, useful accessible labels.
- Do not let lightbox work trigger broad image/gallery/mobile layout churn.
- Test mobile carefully; lightboxes are inherently touch-heavy, but the fix
  should not collide with the separate mobile QA spike.

## Current State Overview

- `MegaGalleryBlock.vue` builds PhotoSwipe slide arrays locally and opens a
  PhotoSwipe instance from the clicked gallery item.
- Mega Gallery handles image dimensions and custom video slide HTML locally.
- `useImageLightbox()` supports single-image opening and shared image slide
  arrays with a starting index.
- Footnote components call `openImage(src, alt)` for images embedded in rich
  footnote content.
- `ImageBlock.vue` renders WordPress image blocks from parsed `renderedHtml` and
  opens unlinked images and media-file image links through PhotoSwipe. External
  or intentional non-media links remain normal anchors.
- Core `GalleryBlock.vue` renders custom rows from child image blocks and now
  passes a per-gallery PhotoSwipe sequence to child image blocks.
- `MediaTextBlock.vue` now opens default and wide Media/Text images in
  PhotoSwipe while leaving full-width variants alone for now.
- PhotoSwipe default UI has a second Blue Atlas material pass: ink-tinted
  backdrop, ink controls, warm-surface text glyphs, hard shadow, signal-blue
  focus rings, slit-slip arrow glyphs, and a centered spinning close glyph. The
  dedicated zoom button is hidden because the image itself supports click/tap
  zoom.

## To Do

### 1. Discussion / Decisions Before Implementation

- [x] Confirm PhotoSwipe remains the shared foundation.
- [x] Decide whether standalone Image blocks open as single-image slides only.
- [x] Decide whether core Gallery blocks open as per-gallery sequences.
- [x] Decide whether all post images should ever form one page-level sequence.
- [x] Decide how much image frame/border/shadow treatment belongs inside the
      PhotoSwipe overlay.
- [x] Decide whether Mega Gallery video slides need branded controls in this
      spike or only regression coverage.

### 2. Existing Implementation Audit

- [x] Inspect `useImageLightbox()` and identify what it needs to support
      reusable slide sets.
- [x] Inspect `MegaGalleryBlock.vue` PhotoSwipe setup and determine what can be
      shared without making the component less readable.
- [x] Inspect footnote image click handling and preserve its current behavior.
- [x] Inspect `ImageBlock.vue` linked-image parsing and identify reliable media
      URL detection.
- [x] Inspect `GalleryBlock.vue` child image data and identify the best source
      for full-size image URLs, `srcset`, alt text, and captions.
- [x] Inspect PhotoSwipe's rendered DOM/classes in-browser before styling.

### 3. Branded PhotoSwipe Chrome

- [x] Add a global PhotoSwipe style layer in the appropriate frontend style
      context.
- [x] Use an ink-tinted backdrop rather than generic black.
- [x] Restyle close/arrow/zoom controls with warm surface / ink material,
      mono/system rhythm, and visible focus states.
- [x] Keep signal blue restrained: focus rings or small active accents only, not
      the main control fill/color.
- [x] Keep controls large enough on mobile.
- [x] Avoid over-framing the image; do not create a fake browser/device frame.
- [x] Style captions, loading states, and disabled states if PhotoSwipe exposes
      them in the used flows.
- [x] Replace default SVG-like arrow/close presentation with text-glyph controls
      that match the site's slit-slip and accordion motion vocabulary.
- [x] Preserve the hidden-slit aspect of the arrow animation: the arrow glyph is
      clipped by a tight slot and moves through that mask rather than translating
      across open space.
- [x] Hide the dedicated PhotoSwipe zoom button; users can zoom by clicking or
      tapping the image itself.

### 4. Shared Lightbox Composable / Helpers

- [x] Extend `useImageLightbox()` to support slide arrays and starting index.
- [x] Keep single-image `openImage(src, alt)` easy for footnotes and image
      blocks.
- [x] Centralize natural-dimension loading if it reduces duplication.
- [x] Preserve Mega Gallery video slide support, either locally or through a
      clear shared slide type.
- [x] Avoid premature abstraction if only one callsite needs a special case.

### 5. Normal Image Blocks

- [x] Add lightbox behavior to unlinked image blocks.
- [x] Intercept image/media-file links and open the lightbox instead of the raw
      file.
- [x] Preserve external/custom links and attachment-page links.
- [x] Preserve image alt text, captions, `srcset`, `sizes`, width/height, and
      lazy/async loading behavior.
- [x] Ensure floated left/right images trigger lightbox correctly.
- [x] Add or verify `zoom-in` cursor/affordance only where lightbox is active.

### 6. Core Gallery Blocks

- [x] Add PhotoSwipe triggers to gallery items.
- [x] Open gallery items as a per-gallery sequence with correct starting index.
- [x] Preserve authored order and current row/column/crop/alignment behavior.
- [x] Use the best available full-size source for each slide.
- [x] Preserve alt text and captions in slides where possible.
- [x] Verify normal, wide, full, left, and right gallery alignments still render
      correctly.

### 7. Existing Entry-Point Regression

- [x] Verify footnote sidenote images still open.
- [x] Verify in-note mobile footnote images still open.
- [x] Verify Mega Gallery image slides still open with correct dimensions.
- [x] Verify Mega Gallery video slides still play/pause as expected.

### 8. Media/Text Blocks

- [x] Add lightbox behavior to default-width Media/Text image media.
- [x] Add lightbox behavior to wide Media/Text image media.
- [x] Decide whether full-width Media/Text image media should open in the
      lightbox after seeing default/wide behavior.

### 9. Verification

- [x] Run focused ESLint on touched Vue/TS files.
- [x] Run `corepack pnpm typecheck`.
- [x] Run `corepack pnpm check` when feasible.
- [x] Browser-check desktop normal image, floated image, gallery, Mega Gallery,
      and footnote images.
- [x] Browser-check mobile normal image, floated image, gallery, Mega Gallery,
      and footnote images.
- [x] Keyboard-check Escape, arrow navigation, focus visibility, and close
      control.

## Ready For Human QA

Human QA completed and accepted on 2026-06-29.

Accepted surfaces:

- Branded PhotoSwipe controls against the Blue Atlas visual system.
- Normal Image block lightbox behavior.
- Floated image lightbox behavior.
- Core Gallery per-gallery sequence behavior.
- Mega Gallery image/video regression.
- Footnote image regression.
- Mobile touch behavior and no horizontal overflow.
- Keyboard behavior and visible focus.
- Media/Text default and wide image lightbox behavior.

## Done

- [x] 2026-06-29 — Promoted `docs/scratch/lightbox.md` into active spike docs.
- [x] 2026-06-29 — Reframed the spike around the existing PhotoSwipe
  implementation rather than a new custom lightbox/modal.
- [x] 2026-06-29 — Settled the brand direction for controls: use ink and warm
  surface materials rather than bright signal-blue controls; reserve signal blue
  for focus/active accents.
- [x] 2026-06-29 — Implemented shared image slide support in
  `useImageLightbox()` while preserving the footnote-friendly
  `openImage(src, alt)` API.
- [x] 2026-06-29 — Added lightbox entry-points for normal Image blocks:
  unlinked images and media-file image links open PhotoSwipe, while
  external/custom links remain anchors.
- [x] 2026-06-29 — Added per-gallery PhotoSwipe sequences for core Gallery
  blocks without changing the existing row/column/crop/alignment layout.
- [x] 2026-06-29 — Added first Blue Atlas PhotoSwipe material pass in the
  frontend context: ink-tinted backdrop, warm-surface/ink controls, hard shadow,
  and signal-blue focus rings.
- [x] 2026-06-29 — Verification passed for first implementation pass: focused
  ESLint passed for touched Vue/TS files, `corepack pnpm typecheck` passed, and
  `corepack pnpm styles:wp-editor` regenerated the editor stylesheet.
- [x] 2026-06-29 — Human QA confirmed normal images, floated images, core gallery
  sequences, footnote images, Mega Gallery, and mobile lightbox behavior are
  working.
- [x] 2026-06-29 — Refined PhotoSwipe control branding: switched controls to an
  ink background with warm-surface text glyphs, added slit-slip animation for
  previous/next arrow glyphs, and added a spinning close glyph that borrows the
  accordion plus/close proportions.
- [x] 2026-06-29 — Added PhotoSwipe behavior for default and wide Media/Text
  image media using the existing rendered media figure.
- [x] 2026-06-29 — Hid the redundant PhotoSwipe zoom button and corrected the
  close glyph centering so its hover spin rotates around the button center.
- [x] 2026-06-29 — Final QA accepted the PhotoSwipe control refinements. The
  zoom button remains hidden, click/tap image zoom remains available, and the
  close glyph is drawn from centered bars so it spins around its visual center.
