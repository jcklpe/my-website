# Image Resizing Spike

## Goal

Verify (and fix if needed) that when an image is resized in the WordPress Gutenberg block editor, the resized dimensions flow through to the frontend and render correctly. The concern: Gutenberg lets you drag-resize images, which serializes a `width` (and sometimes `height`) attribute on the block. If the frontend Vue block component ignores that attribute, images will always render at their intrinsic/CSS-constrained width regardless of what the editor shows.

---

## What Gutenberg serializes

A resized image block in Gutenberg serializes roughly like:

```html
<!-- wp:image {"id":42,"width":480,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large is-resized">
  <img src="..." alt="" class="wp-image-42" width="480" height="320"/>
</figure>
<!-- /wp:image -->
```

The `width` and `height` attributes are on the `<img>` tag as HTML attributes. The block comment also has them in the block `attrs` JSON.

---

## How content reaches the frontend

Images go through `apps/frontend/components/content/blocks/ImageBlock.vue`. The block receives either:

1. **`renderedHtml`** — the WordPress-rendered inner HTML, which includes the `<img>` with its `width`/`height` attributes.
2. **Block `attrs`** — structured JSON with `width`, `height`, `url`, `alt`, etc.

Check which path `ImageBlock.vue` actually uses. If it renders `renderedHtml` via `v-html`, the `width`/`height` on the `<img>` should come through automatically. If it constructs the `<img>` from block attrs, it needs to explicitly pass `width` and `height` as attributes.

---

## Investigation checklist

1. **Open the CMS and resize an image block** to a non-default width. Save the post.
2. **Inspect `renderedHtml` vs block attrs** coming from the GraphQL query (log the block data in `BlockRenderer.vue` or add a temporary `console.log`).
3. **Check `ImageBlock.vue`** — does it render `renderedHtml` directly? Does it use `<NuxtImg>` or a plain `<img>`? Does it forward width/height from attrs?
4. **Check the frontend in the browser** — does the image render at the resized width, or does CSS override it?

---

## Likely fix patterns

### If `renderedHtml` is used (most likely)

The `<img width="480" height="320">` in `renderedHtml` passes through `v-html` fine. But CSS may override it:

```scss
// If the image recipe has max-width: 100% and no explicit width, the HTML attribute is effectively the hint, not the rule.
img { max-width: 100%; height: auto; } // standard responsive CSS — overrides width attribute
```

For user-resized images, the intent is to constrain the image to a specific width rather than let it fill the column. The correct CSS approach:

```scss
// Respect the HTML width attribute as an inline max-width:
.wp-block-image.is-resized img {
  width: attr(width px, 100%); // CSS attr() for width — browser support limited; use JS or inline style instead
}
```

Simpler: render the width as an inline style from `renderedHtml`. Gutenberg actually emits `style="width: 480px"` on the figure in some cases. Check what WordPress actually outputs.

### If block attrs are used

In `ImageBlock.vue`, pass `width` and `height` as inline style attributes:

```vue
<img
  :src="block.attrs.url"
  :alt="block.attrs.alt"
  :style="block.attrs.width ? `width: ${block.attrs.width}px; height: auto;` : undefined"
/>
```

### If `<NuxtImg>` is used

`<NuxtImg>` accepts `width` and `height` props for hint-based optimization. Pass them through from the block attrs. But note: `<NuxtImg>` with a fixed `width` may conflict with responsive CSS — test carefully.

---

## WordPress responsive image behavior

WordPress auto-generates `srcset` and `sizes` attributes on image blocks when they are attached media items. The frontend `<img>` should preserve these for proper responsive loading. If the frontend discards `srcset`, images always load at their full size.

Check: does `ImageBlock.vue`'s rendered output include `srcset`? If not, it's falling back to the single URL from attrs. The easiest fix is to render `renderedHtml` directly rather than reconstructing the `<img>` from attrs — WordPress's rendered markup already has `srcset` and `sizes`.

---

## Related concerns

- **Gallery block images**: Gallery blocks (multiple images) likely go through a separate `GalleryBlock.vue` or `MegaGalleryBlock.vue`. Check if the same resize behavior applies there.
- **`@nuxt/image` provider**: If `@nuxt/image` is configured with an image provider (Cloudinary, Imgix, etc.), resized dimensions should be passed as width/height to the provider's transform URL, not hardcoded in HTML.
- **Static export**: At static generation time, `srcset` URLs must be crawlable from the public CMS. Verify with `corepack pnpm inspect:static` that resized image URLs are not pointing at CMS-only internal addresses.

---

## Files to look at

- `apps/frontend/components/content/blocks/ImageBlock.vue`
- `apps/frontend/components/content/blocks/GalleryBlock.vue`
- `apps/frontend/components/content/blocks/MegaGalleryBlock.vue`
- `packages/styles/shared-components/_image-block.scss`
- `apps/frontend/composables/useWordPress.ts` — the GraphQL query for post content
- `nuxt.config.ts` — `@nuxt/image` configuration if present

---

## Open questions

- Does WordPress emit `style="width: Xpx"` on the figure, or only as attrs on the `<img>`?
- Is `<NuxtImg>` used in `ImageBlock.vue` today, or plain `<img>`?
- For the static export path, are CMS-hosted image URLs rewritten to CDN URLs before export? If so, does the width transform param need to be passed to the CDN URL?
