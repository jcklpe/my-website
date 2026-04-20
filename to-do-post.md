# Post And Case Study Body To-Do

This is a focused backlog for the rendered WordPress/Gutenberg article body system. It comes from reviewing the block QA kitchen-sink post and should help us improve posts and case studies without mixing every detail into the main project roadmap.

## Big Picture

- Turn the current block rendering from "all blocks exist" into a coherent editorial article system.
- Keep WordPress block semantics and class names intact.
- Keep each supported block mapped through a focused Vue component.
- Use `packages/styles/_wordpress-blocks-baseline.scss` for Gutenberg baseline layout/rhythm.
- Move reusable art-directed recipes into `packages/styles/shared-components` only when the same treatment needs to cross contexts.
- Use the QA seed routes as regression pages:
  - `http://my-website.localhost/writing/block-qa-kitchen-sink-post`
  - `http://my-website.localhost/case-studies/block-qa-kitchen-sink-case-study`

## Article Layout Rhythm

- Define a clearer default readable text column width.
- Define intentional breakout widths for media, embeds, tables, and layout blocks.
- Normalize vertical spacing before and after common blocks.
- Make section-to-section rhythm feel deliberate instead of randomly spaced.
- Revisit whether article headings should be centered by default.
- Make the transition from article body into footer feel resolved rather than abrupt.
- Make post and case-study body layouts visually consistent while preserving post-only metadata.

## Hero And Entry Header

- Refine the title label position against featured media so it does not feel cramped.
- Reduce visual tangling between the title label and busy hero images.
- Confirm whether the title label should keep the same label-tape language as cards.
- Decide whether excerpt text belongs in case-study/post heroes at all.
- Ensure hero/title layout still supports the custom card-to-detail transition cleanly.

## Typography

- Increase or otherwise refine body text readability.
- Clarify the heading hierarchy for `h2`, `h3`, `h4`, and deeper levels.
- Normalize heading spacing relative to paragraphs and media.
- Improve nested list indentation, spacing, and hierarchy.
- Improve caption sizing, contrast, spacing, and relationship to media.
- Design the verse block so it reads as intentionally different from normal prose.
- Rework pullquote sizing and line length so large quotes do not break awkwardly.
- Make quote and pullquote styling distinct but related.

## Links

- Revisit paragraph link styling so it is clear, readable, and not visually noisy.
- Test links inside paragraphs, lists, captions, quotes, buttons, and file blocks.
- Ensure hover/focus states are accessible and consistent.

## Image Alignment

- Refine `alignleft` and `alignright` breakout behavior so media can sit partially outside the normal text column.
- Preserve wrapped text around floated left/right images.
- Increase breathing room between floated images and wrapped text.
- Confirm float clearing behavior after long and short floated media examples.
- Improve captions for floated media so they remain attached to the image.
- Make centered, wide, and full-width image treatments feel intentionally different.
- Decide how to handle images with awkward aspect ratios and black side gutters.
- Keep WordPress image alignment rules in the block baseline unless a non-WordPress image component needs the same recipe.

## Gallery

- Design a more intentional gallery grid.
- Improve gallery spacing relative to section headings and surrounding blocks.
- Handle mixed aspect ratios gracefully.
- Decide whether galleries should crop, contain, or preserve original image ratios by default.
- Add stronger caption handling if gallery captions become part of normal authored content.

## Cover Block

- Redesign the cover block treatment.
- Define cover height rules.
- Define image crop/object-position behavior.
- Define overlay behavior and text contrast rules.
- Define cover inner-content positioning.
- Make cover captions, if present, behave predictably.
- Confirm the block works with and without a background image.

## Media/Text

- Make the media/text block feel like a designed editorial component rather than tiny raw layout output.
- Define desktop media/text proportions.
- Define mobile stacking behavior.
- Improve spacing between media and copy.
- Ensure headings and paragraphs inside media/text inherit sensible rhythm.

## Columns And Groups

- Improve default column spacing and width behavior.
- Make columns readable rather than tiny.
- Decide how much visual styling column blocks should receive by default.
- Design group blocks as neutral containers unless a class/style indicates a stronger callout.
- Create a callout treatment for grouped content when appropriate.
- Test nested blocks inside groups and columns.

## Code And Preformatted Text

- Keep Shiki-backed syntax highlighting.
- Add support for custom language grammars/themes when real project-specific code samples are ready.
- Strengthen the retroterm/cathode-ray-tube code block treatment.
- Consider a clearer code-block frame, label, padding, and scanline treatment.
- Make long lines scroll safely without breaking page layout.
- Make preformatted blocks visually related to code blocks but clearly not syntax-highlighted code.
- Ensure code styling remains usable in the WordPress editor context where appropriate.

## Tables

- Design table headers, body rows, footers, and captions.
- Increase cell padding.
- Add clear horizontal overflow behavior for narrow screens.
- Decide whether tables get a frame/card treatment.
- Make raw HTML tables and Gutenberg table blocks feel compatible.
- Test wide tables with more columns.

## Embeds

- Style YouTube embeds with a deliberate frame and caption treatment.
- Style Vimeo embeds consistently with YouTube.
- Improve generic embed fallback styling so bare URLs do not feel accidental.
- Decide whether embed providers should get labels or provider-specific affordances.
- Ensure responsive aspect-ratio behavior is stable.
- Add loading/fallback/error treatment if iframe embeds fail.

## Audio, Video, And File Blocks

- Give audio blocks a designed container instead of relying only on browser controls.
- Harmonize video block styling with embeds.
- Improve video captions.
- Create a file/download block treatment that reads as a file card.
- Style file links and download buttons clearly.
- Test file blocks with and without download buttons.

## Details And Accordion

- Style Details and Accordion as interactive blocks with clear affordances.
- Improve summary/button typography and spacing.
- Add obvious open/closed state styling.
- Improve inner content padding.
- Ensure keyboard and focus states are visible.
- Confirm whether Accordion is a core block in the current WordPress install or plugin-provided behavior.

## Separators And Spacers

- Decide how much visual difference should exist between default, wide, and dots separators.
- Normalize separators so they feel like intentional section dividers.
- Ensure spacer blocks do not create awkward holes in real posts.
- Consider limiting or restyling large spacers if they become editorially dangerous.

## Buttons

- Make button blocks stronger and more intentional.
- Distinguish default and outline button styles.
- Align button styling with the larger label-tape / electric-blue / black-white visual language.
- Test button groups with multiple buttons and alignment options.
- Ensure hover/focus states are accessible.

## QA Fixture Expansion

- Add real examples when new supported block behavior appears.
- Add a wider table example with more columns.
- Add button alignment variants.
- Add gallery captions if those become part of normal content.
- Add examples of images with different aspect ratios.
- Add examples of custom syntax-highlighted language once the custom language grammar is ready.
- Keep the fixture representative rather than combinatorially exhaustive.

## Accessibility And Performance

- Check article pages with automated accessibility tooling after block styling stabilizes.
- Confirm headings remain semantically ordered even when visually stylized.
- Preserve keyboard access for interactive blocks.
- Avoid hover-only affordances for important interactions.
- Keep media blocks responsive and avoid layout shift where possible.
- Ensure embeds and media do not wreck mobile performance.

