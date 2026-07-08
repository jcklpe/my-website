# Image Resizing Spike

## Purpose

This spike verifies and, if needed, fixes how WordPress Gutenberg image resize intent flows through to the Nuxt frontend.

The user-facing problem is simple: if an author drag-resizes an image in the WordPress editor, the public frontend should respect that editorial choice unless a stronger layout mode intentionally overrides it.

The technical risk is less simple. The frontend does not render WordPress image blocks as one raw HTML blob. `ImageBlock.vue` parses WordPress-rendered block HTML and reconstructs a Vue-controlled `<figure>` / `<img>` structure so the site can apply local styling, lightbox behavior, captions, and link rules. That reconstruction may preserve image attributes while accidentally dropping figure-level sizing data or letting shared CSS override the width Gutenberg intended.

## Non-Goals

This is not a broad responsive image pipeline spike.

Do not use this spike to redesign the image block, replace WordPress media handling, add a CDN image transform layer, or change the static deploy media rewriting model.

The goal is to preserve author resizing intent for existing image block behavior while keeping current content-block styling, lightbox behavior, responsive loading metadata, and static generation assumptions intact.

## Current Mental Model

Gutenberg image resizing can surface in more than one place:

- The block comment attributes can include values such as `width`.
- The rendered `<figure>` may include classes such as `is-resized`.
- The rendered `<figure>` may include inline width styling in some WordPress/Gutenberg versions.
- The rendered `<img>` commonly includes `width` and `height` attributes.

A representative serialized image block looks like:

```html
<!-- wp:image {"id":42,"width":480,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large is-resized">
  <img src="..." alt="" class="wp-image-42" width="480" height="320"/>
</figure>
<!-- /wp:image -->
```

The actual project must inspect real GraphQL output before choosing the fix. WordPress/Gutenberg behavior changes by version and by editor settings, and this project has a custom block-rendering path.

## Frontend Rendering Context

Image blocks currently go through `apps/frontend/components/content/blocks/ImageBlock.vue`.

That component:

- reads `block.renderedHtml`
- extracts the root figure and first image
- removes WordPress frontend classes that should not leak into the public frontend
- preserves safe `<img>` attributes such as `src`, `alt`, `width`, `height`, `srcset`, and `sizes`
- reconstructs the public markup in Vue
- wraps lightbox-enabled images in a native `button`
- preserves non-media links as normal links
- renders figcaptions with the shared caption and inline-rich-text treatment

The current weak spot is that the component only forwards figure classes. If Gutenberg encodes resize intent on the figure, especially as inline width style, the frontend may lose it.

The shared image recipe at `packages/styles/shared-components/_image-block.scss` also makes most image media fluid with `width: 100%`. That is correct for normal responsive images, but it may overpower a resized image’s HTML `width` attribute unless the figure or wrapper establishes a narrower width.

## Layout Semantics

Image resizing should be understood as editorial sizing inside an existing layout mode.

Default and centered images are the most likely places where drag-resized width should be honored exactly, constrained by the article column and viewport.

Wide and full images already have stronger layout semantics:

- `alignwide` means use the wide content track.
- `alignfull` means use the full viewport treatment.

If a Gutenberg-resized image is also wide or full, implementation should inspect what the CMS emits and choose a conservative rule. Do not casually let a tiny inline width defeat an explicit wide/full alignment, but do preserve the underlying intrinsic dimensions and responsive loading metadata.

Floated images also have special site semantics. They use fixed editorial float widths and, on phone, remain floated at a constrained size for visual rhythm. Resized float behavior should be tested rather than guessed.

### Resized Floats

Resized floated images need their own model. They should not behave like the normal full-size breakout float with only the media inside it shrinking.

The desired feel is: the image gets smaller in place. It should retain a meaningful relationship to the text column instead of pulling farther into the outside gutter as it shrinks. The text should still wrap around it in a way that reads as intentional editorial composition.

For large resized floats, the normal float breakout can still apply.

For medium resized floats, the image should keep most of the established float depth while the shell hugs the resized media.

For very small resized floats, the image should tend back toward an in-column float. A tiny image should not hang halfway out in the gutter with only a token effect on the paragraph text.

For very large resized floats, the image may exceed the normal float width, but the extra size should be paid for with outside margin space, not by crushing the paragraph measure. Put differently: once the float is large enough, its text-side edge should be bounded while its outside edge moves deeper into the gutter or wide margin. This keeps the prose readable while allowing a more dramatic art-directed floated image when the viewport has room.

The large-float breakout should be its own behavior, not an accidental side
effect of mat or text-gap math. The mat controls the visual cream surround. The
text gap controls breathing room between prose and media. The large breakout
controls only the outside-margin push that starts after the image has exceeded
the medium float band. That keeps medium resized floats predictable while still
allowing extra-large floats to become more dramatic on wide desktop viewports.

Even large floats need an upper bound. The intended visible image cap is roughly `38rem`, which makes a 600-ish pixel image possible while preventing a 900px author value from turning the adjacent paragraph into a narrow vertical strip. If the author enters a larger width, the stored CMS value may remain larger, but frontend and editor presentation should clamp the rendered float to the safe visual cap.

The surrounding negative space should scale with the resized image. The mat and text gap were originally tuned for normal floated images; a very small image should get proportionally less whitespace than a 200px-plus image.

On mobile, floats still remain floats. Large desktop breakout behavior should collapse into the existing constrained phone float model rather than stacking into a single-column image/prose sequence.

The CMS editor should give a decent approximation of this behavior. It does not need to match the frontend pixel-for-pixel, but authors should be able to use the editor to understand roughly how much text wraps around a resized float, where the image sits relative to the column, and how much breathing room it has.

The editor can also use outside margin space for large resized floats. It cannot reproduce the frontend's grid math exactly, but it should avoid the failure mode where an oversized float remains entirely in the editor column and crushes nearby prose.

## Responsive Image Metadata

WordPress-generated `srcset` and `sizes` attributes are valuable and should not be discarded. A successful fix should preserve:

- `src`
- `alt`
- `width`
- `height`
- `srcset`
- `sizes`
- `loading`
- `decoding`

If the resized display width changes, check whether the rendered `sizes` attribute still describes the display reality closely enough. This spike should avoid over-engineering `sizes`, but it should not knowingly make responsive loading worse.

## Relationship To Lightbox

Lightbox support was added before this spike and must remain intact.

Resized image behavior has to work with the lightbox trigger wrapper. In practice, that means the display width may need to apply to the figure and/or button wrapper, not only to the nested `<img>`.

Clicking the resized image should still open the same full-size lightbox source as before.

## Related Surfaces

Primary surface:

- `core/image` rendered by `ImageBlock.vue`

Secondary surfaces to inspect only as needed:

- `core/gallery` rendered by `GalleryBlock.vue`
- project-owned Mega Gallery block rendered by `MegaGalleryBlock.vue`
- media/text images rendered by `MediaTextBlock.vue`

Do not broaden implementation into those secondary surfaces unless the investigation shows they share the same resize path or the user explicitly wants the behavior there.

## Open Questions

- What exactly does the current WordPress/CMS output contain after a drag resize: figure style, image width attr, block attrs, or some combination?
- Does WPGraphQL Content Blocks expose the image block width in structured attributes for this project, or is rendered HTML the reliable source?
- Should resized width be ignored, clamped, or translated for wide/full/floated alignments?
- Does the current frontend still preserve `srcset` and `sizes` after reconstruction on real QA content?
- Is any static generation/media rewrite logic sensitive to the preserved attributes?
- What exact breakpoint or curve should shift a resized float from normal breakout behavior toward an in-column float?
- Does the current large-breakout threshold (`32rem`) and cap (`6rem`) feel right after visual QA on the live test page?
