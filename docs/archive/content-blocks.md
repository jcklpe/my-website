# Content Blocks Polish Pass

## Goal

A comprehensive styling and UX pass over the rendered Gutenberg block types used in articles and case studies. Most of these are small-to-medium individual fixes that don't warrant their own spikes but are visually noticeable and affect reading experience across all long-form content.

---

## Scope

### Typography and Headings

**H2–H6 left padding on desktop** — Currently headings have a left padding/indent that makes them not flush with paragraph text. On desktop, headings should align flush left with the content column, same as paragraphs.

### Block Quotes

**Translucent paper background** — Block quotes should keep the prior white/paper material, but reduce its opacity so they feel less stark against the page ground. Use the existing faint surface level (`--color-surface-faint`, 0.5 alpha) rather than a cream fill. The treatment should be understated — a quoted passage, not a dramatic callout.

Related: see `brand-voice.md` for the broader cream/white harmony discussion and the pull-quote-vs-block-quote question for long quoted text.

### Tables

**Interior padding** — Tables currently have extra internal padding that makes the content feel separated from the border. Interior cells should be flush with the thick outer border.

**Caption placement** — Table captions should appear outside the table element (below it), not inside where they overlap content and conflict with the bordered frame.

### Video Embeds

**Default size** — Video embeds are currently too small. They should default to a larger display size (approximately the same width as the content column, similar to standard/wide image blocks).

**Border and shadow** — Video embeds should receive the same border + hard shadow treatment as image blocks, so they read as part of the same system.

### Audio Block

**On-brand treatment** — The audio block should use a cream background and ink-colored controls so it reads as part of the page ground rather than a foreign browser-default widget. The goal is invisible integration — it fades into the cream page, not a UI element that stands out.

### File Download Block

**Left strip accent** — Add an electric blue left-edge strip (similar to the footnote in-note's left border treatment) to visually connect the download block to the site's primary accent color.

**Arrow slip animation** — The download arrow should use the same slip-out-down / slip-in-from-top animation established elsewhere on the site. See `animations.md` for the animation pattern.

### Details / Accordion Blocks

**Mobile width** — Wide details and accordion blocks should be wider on mobile than their current treatment. They should feel like they're using the full available width.

**Accordion button size** — The +/- toggle button for accordion items should be slightly larger. It currently feels too small as a tap target.

**Accordion shadow** — The accordion block shadow should follow the brand pattern (hard shadow matching cards/images) rather than the diffuse drop-shadow it currently has.

### Inline Code

**Restyling** — Inline code should feel more visually connected to the code block aesthetic. Currently it reads as a generic browser default. Direction: something with a subtle surface treatment that references the CRT/terminal character of the code blocks, without being as heavy as a full code block.

### Media Layout (Gallery) Blocks

**Column-aware gallery layout** — The default Gallery block should respect the
editorial choices expressed in the CMS gallery controls. The WordPress column
setting defines the row grouping. If cropping is enabled, the frontend uses an
equal-column cropped row treatment. If cropping is disabled, the frontend
preserves source image aspect ratios and justifies each author-defined row to
the available width. This keeps left-to-right reading order, avoids CSS masonry
column ordering, and avoids reusing the full Masonry.js behavior reserved for
Mega Gallery.

**Gallery captions** — Gallery-level captions should render once below the
whole gallery, styled like other figure captions. They should not be treated as
an individual image caption or forced into a single gallery item width.

**Gallery alignment** — Gallery blocks should respect Gutenberg alignment
controls. Wide and full alignments should use the same content-flow geometry as
other media blocks. Left and right aligned galleries should float predictably on
larger screens and stack back into the article flow on small screens.

**Mobile gallery composition** — Gallery floats should not persist on mobile,
but the gallery composition itself should not automatically collapse to one
image per row. Mobile galleries should keep an editorial grid rhythm capped at
three columns, with very wide landscape images allowed to span the full row.

**Shadows and outlines** — Gallery and Mega Gallery images/videos should have the same shadow + border treatment as standalone image blocks and cards. Currently some gallery media is unstyled.

### Media + Text Blocks

**Non-full-width shadows** — Media+Text blocks that aren't full-width should have the same border + shadow treatment as standalone images. Currently they render without the image frame treatment.

### CMS-Side Fixes

**Caption placement (admin)** — In the WordPress block editor, image and media layout captions currently overlap the image content, making them hard to read during authoring. Captions should appear below the image in the editor view, not overlaid. (This is a `_wp-editor.scss` fix.)

### Floated Image Polish

**Breathing room** — Left and right floated images could use slightly more horizontal padding/breathing room. Add roughly 20px extra space on the side adjacent to wrapping text without changing the actual footprint/width of the image.

---

## Files

- `packages/styles/shared-components/_image-block.scss`
- `packages/styles/shared-components/_quote-block.scss`
- `packages/styles/shared-components/_heading-block.scss`
- `packages/styles/shared-components/_code-block.scss`
- `packages/styles/shared-components/_pullquote.scss`
- `packages/styles/context-role/_vue-frontend.scss`
- `packages/styles/context-role/_wp-editor.scss`
- `apps/frontend/components/content/blocks/` (various block components)

---

## Non-Scope

- Syntax highlighting themes — covered in `docs/scratch/syntax-highlighting.md`
- Pull quote vs block quote UX decision — covered in `brand-voice.md`
- Lightbox styling — covered in `docs/scratch/lightbox.md`
- Animation patterns (arrow slip, accordion spin) — see `docs/scratch/animations.md`; these are referenced here as requirements but the animation design belongs there
