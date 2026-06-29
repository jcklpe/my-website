# Image Lightbox Spike

## Goal

Clicking a content image opens a full-screen lightbox: the image fills the viewport, a close button or backdrop click dismisses it, keyboard navigation (Escape, arrow keys for multi-image sequences) works. Images in article content (WordPress block content rendered in `ImageBlock.vue`) are the primary target. May extend to gallery blocks if they exist.

## Approach options

### Option A: Roll our own with CSS and a simple composable

- Each `ImageBlock.vue` emits a click event (or the `<img>` element gets a click handler).
- A `useLightbox` composable manages: `isOpen`, `currentSrc`, `currentAlt`.
- A `<Lightbox>` component (in `layouts/default.vue` or teleported to `<body>`) renders the full-screen overlay.
- Transition: the image scales up from its source position (similar to the featured-media transition, but simpler — no clone, just a CSS scale/opacity transition on the overlay).
- Pro: full control, no dependencies, consistent with the site's existing transition approach.
- Con: needs to handle srcset, responsive sizes, and loading states.

### Option B: Use a lightweight library

Options worth evaluating:
- `@nuxt/image` lightbox — if the site uses `@nuxt/image`, there may be a lightbox mode.
- `yet-another-react-lightbox` — React, not applicable.
- `v-viewer` (Vue 3) — wraps the Viewer.js library. Mature, supports zoom/pan/keyboard. Adds ~50KB.
- `vue-easy-lightbox` — simpler, Vue 3, ~20KB.
- Vanilla Fancybox v5 — framework-agnostic, ~50KB, excellent accessibility.
- Pro: saves implementation time, handles edge cases (zoom, pinch-to-zoom, keyboard).
- Con: visual customization effort, external dependency.

**Recommendation**: Roll our own for single images (Option A) — it's simpler and on-brand. Add a library only if multi-image gallery support is needed.

## What needs to happen

### 1. Add click-to-open to `ImageBlock.vue`

In `ImageBlock.vue`, the `<img>` (or the wrapping `<a>` if the image has a link) needs a click handler that opens the lightbox with that image's full-resolution URL. The full URL comes from the WordPress image block attributes (already available in `renderedHtml` or the block's `attrs`).

The linked-image case (`<a>` wrapping `<img>`) is tricky: the link should probably be suppressed if the href is a raw image URL (WordPress default behavior), and the lightbox should open instead. If the link goes to an external page, preserve the link.

### 2. Create `<AppLightbox>` component

In `components/app/AppLightbox.vue` (or similar):
- `v-teleport="'body'"` overlay so it renders above everything.
- Full-screen backdrop (semi-opaque, `backdrop-filter: blur` optional).
- Centered `<img>` with `max-width: 90vw; max-height: 90vh; object-fit: contain`.
- Close button (top-right ✕, keyboard: Escape).
- `aria-modal`, `role="dialog"`, focus trap.
- Entry/exit transition (scale + opacity, ~200ms).

### 3. State: `useLightbox` composable

```ts
const lightboxSrc = ref<string | null>(null);
const lightboxAlt = ref('');
function openLightbox(src: string, alt: string) { ... }
function closeLightbox() { lightboxSrc.value = null; }
```

Provide/inject or use a Nuxt `useState` so `ImageBlock` (anywhere in the content tree) can open the lightbox that lives in the layout.

### 4. Mount in layout

In `layouts/default.vue`, add `<AppLightbox />`. It renders nothing when closed.

### 5. Cursor signaling

Add `cursor: zoom-in` to images that have lightbox enabled in `_image-block.scss` (via a `has-lightbox` class on the figure).

## Accessibility

- Focus should move into the lightbox on open (to the close button or the image).
- Escape closes it.
- When closed, focus returns to the triggering element.
- Screen reader: `<dialog>` element with `aria-label="Image lightbox"` and the image `alt` text.

## Files to look at

- `apps/frontend/components/content/blocks/ImageBlock.vue`
- `apps/frontend/layouts/default.vue`
- `packages/styles/shared-components/_image-block.scss`
- `apps/frontend/composables/` — for composable placement

## Open questions

- Should lightbox respect the image's `link` setting (WordPress images can have a link to the media file, the attachment page, or a custom URL)? If the link target IS the media file URL (very common default), intercept it and open lightbox instead.
- Do gallery blocks exist on the site and should they get a multi-image carousel mode?
- Zoom/pan inside the lightbox — needed for detailed images?
- Should the lightbox reuse the featured-media transition system's overlay layer, or be entirely independent?

---

## Additional Items

### Brand Styling

The lightbox, once implemented, should be styled to match the site's voice:
- Background scrim: dark ink-tinted (`--color-ink` at 85–90% opacity) rather than generic black
- The enlarged image should have the same border + hard shadow treatment as image blocks
- The close button (✕) should use the primary accent color and the mono font, matching the footnote close button treatment
- Consider a subtle cream-tinted inner glow or mat around the image, referencing the image mat treatment
- Controls should be customized as part of the Blue Atlas system, not left as generic overlay chrome:
  - previous/next controls use signal-blue, mono labels or compact symbols, and the established arrow-slip motion where appropriate
  - focus states remain visible and signal-blue
  - touch targets are large enough on mobile
  - disabled/loading states should feel deliberate rather than browser-default

### Mobile Images

On mobile, content images currently behave as links to the raw image URL (WordPress default `<a>` wrapping behavior). This means tapping an image on mobile opens the raw file in the browser, not a lightbox. Once `AppLightbox` is implemented, mobile should get the same lightbox behavior — intercept the raw-image link and open the lightbox instead.
