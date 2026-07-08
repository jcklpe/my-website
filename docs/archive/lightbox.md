# Image Lightbox Spike

## Purpose

Make image lightboxes feel like part of the Blue Atlas site system and extend
lightbox behavior to image surfaces that should already have it.

This is not a greenfield lightbox spike. The project already uses PhotoSwipe:

- `MegaGalleryBlock.vue` opens PhotoSwipe for Mega Gallery images and videos.
- `useImageLightbox.ts` opens single-image PhotoSwipe instances.
- Footnote sidenotes and in-note footnotes already use `useImageLightbox()` for
  images inside footnote content.

This spike standardized that existing solution, branded the PhotoSwipe chrome,
and added missing entry-points such as normal image blocks, floated images, core
gallery images, and default/wide Media/Text images.

## Current Implementation

### PhotoSwipe Is The Lightbox Substrate

`photoswipe/style.css` is globally loaded from `apps/frontend/nuxt.config.ts`.
PhotoSwipe itself is dynamically imported only when a lightbox opens, which keeps
SSR and initial page load safe.

Keep that model. Do not add a second lightbox library and do not roll a custom
modal unless PhotoSwipe proves unable to support a required interaction.

### Existing Entry-Points

`apps/frontend/components/content/blocks/MegaGalleryBlock.vue`

- Builds a PhotoSwipe slide list from Mega Gallery image/video items.
- Preloads image dimensions before opening so PhotoSwipe does not distort slides.
- Handles video slides through PhotoSwipe `html` slide content.
- Owns a small global style block for `.pswp-video-wrap` and `.pswp-video`.

`apps/frontend/composables/useImageLightbox.ts`

- Opens single-image PhotoSwipe instances and shared image slide arrays.
- Loads natural image dimensions before opening.
- Is used by footnotes, image blocks, gallery blocks, and Media/Text blocks.

`apps/frontend/components/content/footnotes/FootnoteSidenote.vue` and
`FootnoteInNote.vue`

- Attach image click handling to rich footnote content.
- Use cursor `zoom-in` for footnote images.

### Added Entry-Points

`ImageBlock.vue`

- Renders normal WordPress image blocks, including linked-image markup.
- Opens unlinked images in PhotoSwipe.
- Intercepts media-file image links so they open PhotoSwipe instead of the raw
  file.
- Preserves intentional external/custom links as normal anchors.

`GalleryBlock.vue`

- Renders core WordPress galleries with custom row/column/crop/alignment logic.
- Opens a per-gallery PhotoSwipe sequence.
- Preserves authored order and uses the best available image source for the
  lightbox slide.

`MediaTextBlock.vue`

- Opens default and wide Media/Text images in PhotoSwipe.
- Leaves full-width Media/Text variants alone for now so edge-to-edge
  compositions do not receive extra behavior without a concrete need.

Floated/aligned images

- Normal image blocks can be aligned left/right/wide/full. Those variants should
  trigger the lightbox where appropriate, including floated left/right images.

## Brand Direction

PhotoSwipe's default controls are functional but generic. The site should keep
PhotoSwipe's interaction model and restyle the chrome so it belongs to the Blue
Atlas system.

Target feeling:

- dark ink-tinted viewing field, not generic black
- warm surface / ink controls rather than gray-gradient library defaults
- signal blue used sparingly for focus rings or tiny active accents, not as the
  dominant control color
- mono labels or compact symbols where labels are needed
- visible focus states that fit the existing accessibility contract
- large enough touch targets
- controls that feel deliberate but do not over-frame the image
- image surface can use the established dark outline / hard shadow treatment
  where it helps, but avoid a fake device/browser frame
- previous/next controls should use the site's slit-slip motion vocabulary:
  real arrow glyphs (`←` / `→`) move through a tight invisible slot on hover
- close controls can use the accordion-like plus-to-close glyph proportions with
  restrained spin motion

The lightbox should feel like a quiet viewing instrument: functional, crisp,
and branded. It should not become a theatrical overlay that competes with the
image.

## Accessibility And Interaction Contract

Keep PhotoSwipe's baseline behavior:

- Escape closes.
- Arrow keys move through multi-image sequences.
- Swipe and touch gestures work on mobile.
- Focus states remain visible.
- Controls are native buttons from PhotoSwipe or equivalent accessible controls.

If PhotoSwipe default controls are restyled, do it with CSS against stable
PhotoSwipe classes or through PhotoSwipe options. Do not replace controls with
non-semantic custom DOM unless needed.

For links:

- If a WordPress image link points to the image/media file itself, intercept it
  and open PhotoSwipe.
- If the link points to an external URL, attachment page, or intentional custom
  destination, preserve navigation.
- Do not block normal modified-click behavior for intentional links.

## Settled Technical Direction

Use PhotoSwipe as the single lightbox foundation.

The implementation:

1. Keeps PhotoSwipe dynamically imported from client-side open actions.
2. Keeps PhotoSwipe CSS globally loaded before the site stylesheet so the
   frontend context can override default chrome.
3. Uses `useImageLightbox()` for single images and reusable image slide arrays.
4. Keeps Mega Gallery video slide handling local to `MegaGalleryBlock.vue`,
   because it is the only special video lightbox callsite.
5. Styles global PhotoSwipe DOM from the frontend context-role, because
   PhotoSwipe appends to `document.body`.
6. Hides the dedicated zoom button; users can click/tap the image itself to
   zoom.

## Non-Goals

- Do not add a second lightbox library.
- Do not replace PhotoSwipe with a custom modal.
- Do not redesign Mega Gallery layout.
- Do not change core image/gallery responsive layout unless needed for lightbox
  affordance.
- Do not implement a heavy image editor, annotation layer, or download/share UI.
- Do not force lightbox behavior onto intentional external/custom image links.

## Closed Decisions

- Core Gallery opens one PhotoSwipe sequence per gallery block.
- Standalone Image blocks open as single-image slides, not as part of a post-wide
  image sequence.
- Video lightbox behavior remains limited to Mega Gallery.
- PhotoSwipe chrome uses ink and warm-surface material, with signal blue reserved
  for focus/glow accents.
- Previous/next controls use real arrow glyphs and slit-slip motion.
- The close control is drawn from centered bars rather than a font glyph so it
  spins around its visual center.

## Files

- `apps/frontend/composables/useImageLightbox.ts`
- `apps/frontend/components/content/blocks/ImageBlock.vue`
- `apps/frontend/components/content/blocks/GalleryBlock.vue`
- `apps/frontend/components/content/blocks/MegaGalleryBlock.vue`
- `apps/frontend/components/content/footnotes/FootnoteSidenote.vue`
- `apps/frontend/components/content/footnotes/FootnoteInNote.vue`
- `packages/styles/shared-components/_image-block.scss`
- `packages/styles/shared-components/_gallery-block.scss`
- `packages/styles/context-role/_vue-frontend.scss`
- `apps/frontend/nuxt.config.ts`
