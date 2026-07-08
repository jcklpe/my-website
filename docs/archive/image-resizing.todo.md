# Image Resizing To Do

## Background

This spike is active as of 2026-06-29.

The goal is to make sure WordPress Gutenberg image resize choices survive the journey from CMS editor to public Nuxt frontend. Gutenberg lets authors drag-resize image blocks. The frontend should respect that authorial sizing where it makes sense, without breaking the existing image block treatment, lightbox behavior, captions, responsive image metadata, or static generation path.

The conceptual companion doc is [`image-resizing.md`](image-resizing.md).

## Project Organization

Primary files:

- `apps/frontend/components/content/blocks/ImageBlock.vue`
- `packages/styles/shared-components/_image-block.scss`

Likely supporting files:

- `apps/frontend/utils/block-html.ts`
- `apps/frontend/components/content/BlockRenderer.vue`
- `apps/frontend/components/content/blocks/GalleryBlock.vue`
- `apps/frontend/components/content/blocks/MediaTextBlock.vue`
- `apps/frontend/components/content/blocks/MegaGalleryBlock.vue`
- `apps/frontend/composables/useImageLightbox.ts`
- `packages/styles/context-role/_wp-editor.scss`
- `apps/cms/wp-content/themes/my-website-editor-theme/editor.css`

Verification surfaces:

- QA CMS editor image block resized by drag handles.
- QA/public frontend article route containing the resized image.
- Mobile viewport for overflow and width clamping.
- Lightbox behavior on resized images.

## General Principles

- Inspect real CMS output before choosing the implementation.
- Preserve author resize intent for default/centered images unless a stronger alignment mode clearly overrides it.
- Treat wide, full, and floated images carefully because they already carry site-specific layout semantics.
- Preserve WordPress image metadata, especially `srcset`, `sizes`, `width`, and `height`.
- Keep lightbox behavior intact for media-file/unlinked images.
- Prefer a narrow fix in `ImageBlock.vue` and the shared image recipe over a broad image system rewrite.
- Avoid relying on unsupported CSS such as `width: attr(width px)`.
- Sanitize any style/attribute forwarding. Do not pass arbitrary CMS inline styles through just because they exist.

## Current State Overview

`ImageBlock.vue` currently parses `block.renderedHtml` and reconstructs the public figure in Vue.

What appears to be preserved today:

- safe image attributes parsed from the `<img>`
- caption HTML
- image links, with media-file links converted into lightbox opens
- non-media links preserved as links
- figure class information after WordPress frontend class cleanup

What appears vulnerable:

- figure-level inline styles are not forwarded
- any Gutenberg resize information that only exists outside the `<img>` may be lost
- the shared image recipe applies `width: 100%` to normal image media, which may override plain HTML width attributes
- the lightbox `button` wrapper also uses `width: 100%`, so resized behavior must account for wrapper width, not only image width

Current design direction for resized floats:

- Do not treat them as normal breakout floats with only the inner image shrinking.
- The image should feel like it gets smaller in place, not like it is pulled farther out of the text as it gets smaller.
- Normal/medium resized floats can keep the established breakout depth.
- Larger-than-normal resized floats should be possible on desktop. Once a float grows past the medium band, its extra size should come from deeper outside-margin breakout while preserving a sane text-side edge and readable paragraph measure.
- Extra-large float breakout is distinct from mat and text-gap spacing. Mat is the cream frame; gap is the prose breathing room; large breakout is the outside-margin push that only appears after the image exceeds the medium band.
- Large floats still need a visual cap. A 600-ish pixel floated image can be useful; a 900px floated image crushes adjacent prose and should be clamped in presentation even if Gutenberg stores the larger author value.
- Medium resized floats should keep a meaningful relationship to the text column while the visual shell hugs the resized image.
- Very small resized floats should tend back toward an in-column float rather than hanging half in and half out of the article column.
- Text gap and mat/negative space should scale down with the resized image. A tiny image does not need the same whitespace budget as a normal float.
- Mobile still keeps float behavior. The large desktop breakout band should collapse to the existing constrained mobile float model, not stack everything into a single column.
- The WordPress editor does not need perfect frontend parity, but it should approximate the frontend composition closely enough that authors can predict float depth, text wrap, and breathing room.

## To Do

### Promote And Align Docs

- [x] Move `docs/scratch/image-resizing.md` to `docs/image-resizing.md`.
- [x] Expand the conceptual doc around current frontend architecture and spike boundaries.
- [x] Create this active `.todo.md` companion using the project spike structure.
- [x] Update `to-do.md` to mark the image resizing spike as active.

### Confirm Scope With User

- [x] Confirm default behavior: default and centered resized image blocks should honor CMS resize width, clamped to the article column/mobile viewport.
- [x] Confirm wide/full behavior: likely preserve wide/full alignment as stronger than arbitrary drag width unless real CMS behavior argues otherwise.
- [x] Confirm floated behavior: inspect and avoid disrupting the current float system, especially phone floats.
- [x] Confirm whether gallery/media-text/Mega Gallery resizing is in scope now or only a follow-up if evidence shows they are affected.

### Investigate Real CMS Output

- [x] Create or identify a QA post containing a resized `core/image` block.
- [ ] Inspect the WordPress editor serialized output if available.
- [x] Inspect GraphQL/rendered frontend output for the resized block.
- [x] Check whether resize data appears as figure style, figure class, image width/height attrs, block attrs, or some combination.
- [x] Compare CMS editor rendering against frontend rendering.
- [x] Capture at least one default/center case and one alignment edge case if convenient.

Notes:

- User created `http://my-website.localhost/writing/image-resizing-test-doc` and confirmed regular resizing looks good.
- The observed defect was specific to resized floated images. The resized media was shrinking, but the float figure shell kept the default float frame width, creating increasingly large cream whitespace as the image got smaller.
- Browser inspection showed the resized lightbox trigger/media width was present, but the outer `.alignleft.is-resized` float frame was still behaving like a fixed-width float shell.
- After the first float-shell fix, the shell hugged the resized image better, but the composition was still wrong: smaller floats visually pulled away from the paragraph and barely impeded the text. The better model is not linear shrinkage of the whole breakout system; it is a curve where smaller floats remain visually related to the article column and eventually behave more like in-column floats.
- CMS/frontend mismatch is part of the problem. The CMS editor currently gives a better approximation for small floats than the frontend. Future CSS should bring the frontend behavior closer to the authoring mental model, and editor CSS should remain close enough to be predictive.

### Implement Conservative Fix

- [x] Preserve the minimum safe resize data needed from rendered HTML or structured attrs.
- [x] If using figure inline style, parse and whitelist only width-related values that are safe and expected.
- [x] If using image attributes, translate width into a wrapper/figure sizing rule that CSS cannot accidentally override.
- [x] Ensure resized display width is clamped to available viewport/column space.
- [x] Ensure the lightbox trigger wrapper follows the resized width correctly.
- [x] Preserve `srcset`, `sizes`, `width`, `height`, `loading`, and `decoding`.
- [x] Avoid changing unrelated gallery, media/text, or Mega Gallery behavior unless investigation proves the same bug exists there.

### Refine Resized Float Composition

- [x] Define resized float CSS variables for resized width, shell width, mat, text gap, and breakout depth rather than deriving everything from the normal float frame.
- [x] Keep large resized floats close to the current full-size float behavior.
- [x] Make medium resized floats stay visually deep enough in the article column to wrap text meaningfully.
- [x] Make very small resized floats become mostly or fully in-column rather than half-gutter objects.
- [x] Scale mat and text gap down with resized width using conservative `clamp()` values.
- [x] Align editor float-resize approximation with the frontend behavior enough for authoring confidence.
- [x] Preserve phone float behavior and avoid horizontal overflow.

Implementation notes:

- Frontend resized floats now derive `--image-mat`, `--image-resized-gap`, and `--image-resized-breakout` from `--image-resized-width`.
- Breakout depth clamps to `0px` for very small resized images, ramps up for medium resized images, and caps at the normal article float offset for large resized images.
- The float shell still hugs the resized image plus the scaled mat, rather than keeping the normal float width.
- Phone keeps the existing constrained float model, with no negative breakout and no mat.
- The WordPress editor float wrapper now uses `:has(.wp-block-image.is-resized)` to hug resized image blocks more closely. It does not mirror frontend breakout math exactly, but it should better approximate the author-facing composition.
- Follow-up feedback showed the frontend text-side gap was too tight because the resized-float margin subtracted the mat from the desired gap. A later adjustment made the text-side gap part of the floated box itself by adding side-specific padding and widening the float box. This makes the browser's float exclusion area include the breathing room, instead of depending on an outer margin that did not reliably affect line wrapping in the breakout flow.
- The CMS approximation also reserves text-side breathing room inside its resized float wrapper, so it should better track the frontend composition without needing exact pixel parity.
- Browser inspection found the live Gutenberg output stores resized width as `img style="width:...px;height:auto"` rather than an image `width` attribute. `ImageBlock.vue` now reads image inline style width as the authoritative resize source when the figure is `is-resized`.

### Enable Large Desktop Resized Floats

- [x] Increase the desktop resized-float maximum so the current largest float can read as medium rather than the absolute cap.
- [x] Let larger floats grow by increasing outside-margin breakout depth.
- [x] Bound the text-side edge of large floats so paragraph text keeps a readable measure.
- [x] Add an explicit extra-large breakout variable so oversized floats push farther into the outside margin without changing medium-float spacing.
- [x] Add viewport clamps so large floats scale back when there is not enough margin space.
- [x] Keep mobile floated behavior active, but collapse large desktop breakout to the existing constrained phone float model.
- [x] Keep editor approximation directionally predictive for large resized floats.

Implementation notes:

- Added a large-float band to the CSS math. Resized floats now calculate `--image-resized-text-edge`, `--image-resized-breakout-max`, `--image-resized-frame-width`, and `--image-resized-frame-max`.
- The text-side edge is capped with a readable-measure target. When an image grows beyond that target, the extra width is absorbed by larger outside breakout instead of pushing farther into the prose.
- Added `--image-resized-render-width` as the capped presentation width. Authored widths above roughly `38rem` are still read, but the rendered float uses the capped width so huge values do not crush the paragraph.
- The breakout maximum can exceed the old `--article-float-offset` when the viewport has more available margin. This lets large desktop floats spend extra gutter/margin space.
- The frame width is also capped by the available breakout/text-edge budget and viewport width, so large resized floats scale back on narrower screens.
- Phone rules still keep images floated with the existing constrained mobile width. The large desktop breakout variables collapse to no breakout on phone, but the float itself remains active.
- The editor approximation now permits larger resized float wrappers and a responsive text-side gap, but does not attempt to reproduce the frontend's full breakout math.
- Authoring note: the frontend only renders a larger float after Gutenberg serializes a larger width, which currently appears as `img style="width:...px;height:auto"`. Authors should be able to create that value by selecting the floated Image block and dragging its resize handle or entering a larger width in the image block settings. If the editor cannot grow the image, check the editor float wrapper cap before debugging frontend rendering.
- Follow-up: the first large-float frontend pass worked mathematically, but the CMS editor still capped resized floated image wrappers too tightly for authors to create larger values. The editor resized-float wrapper cap was increased so Gutenberg has room to serialize larger image widths.
- Follow-up: Browser inspection showed `900px` was reaching the frontend, but the high-specificity `.float-breakout-flow.alignleft > figure` lead-float rule still overrode the resized width with the normal `--article-float-width`. The resized-float math now also applies inside the float-breakout lead selectors, including the phone constrained-float variant. At a 2048px test viewport, a `900px` author value rendered as a roughly `904px` image inside a `984px` float frame.
- Follow-up: a `900px` float is too large as an editorial composition. The frontend now clamps large resized float presentation to roughly `38rem` while increasing outside-margin breakout more aggressively. The editor approximation also caps resized float images and uses negative outside margin so the CMS preview is closer to the frontend's margin-spending behavior.
- Follow-up: the large-float margin push is now a named variable, `--image-resized-large-breakout`, rather than being hidden inside the mat/gap/text-edge calculations. It stays at `0px` through the medium band, starts after roughly `32rem`, and caps at `6rem`. The intent is that extra-large images stop impeding farther into the paragraph and instead spend more of the available outside margin.
- Follow-up: the first CMS approximation applied too much negative outside margin to every resized float, including tiny images, which glued left floats to the editor edge and clipped small examples. The editor now uses a bounded `--cms-resized-float-breakout` approximation so resized floats can move outward somewhat without leaving the authoring canvas. This is intentionally less exact than the frontend because editor CSS does not reliably expose the authored image width as a usable wrapper variable.
- Follow-up: float-breakout grouping wrappers use alignment classes such as `alignright`, but they are not themselves right-margin obstacles. The sidenote layout coordinator now excludes `.float-breakout-flow` wrappers from its obstacle list and continues to treat the actual aligned lead figure as the obstacle. Without that distinction, a long wrapping section could push nearby footnotes thousands of pixels down and mark them as overflow.
- Follow-up: footnotes around floated images need two safeguards. First, the sidenote layout must rerun after content images load so marker positions and float obstacles are not measured against stale geometry. Second, desktop in-note fallback boxes must establish their own float-aware formatting context so their background and border stay within the available wrapped text area instead of painting underneath a floated image. Footnote-contained figures are also capped to their note container.

### Verify

- [x] Run `corepack pnpm check` after implementation if code or generated editor CSS changes.
- [x] Browser-check resized default image.
- [x] Browser-check resized centered image.
- [x] Browser-check wide/full image behavior if touched.
- [x] Browser-check floated image behavior if touched.
- [x] Browser-check mobile for overflow and readable sizing.
- [x] Browser-check lightbox open/close from a resized image.
- [x] Confirm image captions still match frontend caption styling.
- [x] Confirm no new static/media URL assumptions were introduced.

## Ready For Human QA

Human QA completed. User confirmed the resized image behavior, floated image composition, CMS approximation, mobile behavior, and footnote interaction regressions look good enough to close the spike.

## Done

- Promoted the image resizing concept doc from scratch to active spike status.
- Added this active todo companion doc.
- User confirmed regular resized images were rendering well on the frontend test page; follow-up implementation focused on resized float shell whitespace.
- Settled the next design direction for resized floats: smaller floats should get smaller in place, not drift farther out of the text; very small floats should tend toward in-column composition; negative space should scale with image size; and editor/frontend parity should be close enough to make authoring predictable.
- Preserved Gutenberg resized image widths from rendered HTML, including the live WordPress pattern where an `is-resized` image stores its author width as `img style="width:...px;height:auto"`.
- Added resized-float CSS math so default/centered resized images, resized floated images, large desktop floats, and phone floats each get an intentional layout model.
- Added an explicit extra-large breakout variable so oversized desktop floats spend outside margin after the medium band instead of crushing the paragraph text.
- Tuned the WordPress editor approximation so resized floated images are authorable and directionally predictive without gluing small floats to the editor edge.
- Fixed float-breakout and footnote interactions: `.float-breakout-flow` alignment classes are grouping labels, not sidenote-column obstacles; sidenote layout reruns after content images load; desktop in-note fallback boxes are float-aware; images/figures inside footnotes stay bounded by their note containers.
- Verified with `corepack pnpm check` after implementation and regression fixes.
