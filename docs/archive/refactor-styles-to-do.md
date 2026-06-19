# Background

The shared SCSS styles files — primarily `_wp-editor.scss` and `_vue-frontend.scss` — currently use grouped multi-selector rules to share values between block types. For example, `.wp-block-paragraph, .wp-block-details, .wp-block-accordion { max-width: var(--article-column); margin-inline: auto; }`. This couples unrelated block types together through coincident value sharing rather than named design intent, making each block harder to understand in isolation and harder to change independently.

The refactor replaces all cross-element grouped rules with self-contained per-component rule blocks or shallow nested rule trees. Each block type gets its own complete set of declarations, referencing shared tokens (CSS custom properties, Sass variables, mixins) independently. Full rationale and philosophy are in `docs/refactor-styles.md`.

## Project organization

Add new items to complete to the `# To Do` section. When those items are completed move them either to `# Ready for human QA` or `# Done`. Update the `# Current State Overview` with an overview of the current state.

Keep tasks concrete, atomic, and specific. The preference is for tasks like "split the `.wp-block-paragraph, .wp-block-details, .wp-block-accordion` group in `_wp-editor.scss` into three separate rule blocks" or "nest `.wp-block-details > summary` under a `.wp-block-details` rule tree" rather than "restructure the editor styles."

## General principles

- Split grouped selectors into individual component blocks. Each block type owns its own complete rule or shallow nested rule tree.
- Do not change any values during the refactor. This is a pure structural reorganization; visual output must be identical before and after.
- Shared values belong in tokens (CSS custom properties, Sass variables) or named mixins — not in selector groups.
- Use shallow SCSS nesting when it expresses real hierarchy, such as context-role wrapper → block type → child element/state.
- Do not use nesting to smuggle cross-component grouping back in. Prefer separate nested rule trees for separate block types.
- Universal normalization resets (`*, *::before, *::after`, bare `img`, etc.) and modifier rules (`.wp-block-quote.alignwide`) are allowed to remain grouped; they are intentional groupings, not coincident ones.
- Run `corepack pnpm check` after each file to confirm no visual regressions via lint/typecheck; verify against the QA fixtures at `http://my-website.localhost/writing/block-qa-kitchen-sink-post` and `http://my-website.localhost/case-studies/block-qa-kitchen-sink-case-study`.
- Do not refactor and change logic at the same time. The refactor is a separate pass.
- Prefer semantic HTML over redundant semantic classes where the native element already carries the meaning.
- Prefer Vue SFC scoped styles for frontend component-owned styling. For classed frontend block components, `width-alignment()` calls live inside the shared-component recipe mixins. The SFC includes those recipe mixins in its scoped style and gets content-flow behavior along with everything else.
- `_vue-frontend.scss` is for global tokens, page/body base, the `.content-flow` grid tracks/container, wrapper-structural rules (`.float-breakout-flow`, `.fallback-html`), and bare-element hooks for native elements without a recipe home — nothing else. No block-class-specific selectors belong here. Route/page-shell transition styles belong in the layout or component that owns the affected shell element.
- Use shared-component recipes for named reusable visual/behavioral patterns, not merely because two components share a value.
- Do not import emitting global style partials into Vue scoped styles. If an SFC needs shared Sass, use the non-emitting SFC Sass API or create one deliberately.

## Current State Overview

The style refactor is complete. All structural and token hygiene work is done. The refactor spike is ready to archive.

`_vue-frontend.scss` is a thin context-role: token exports, page/body base, `.content-flow` grid tracks, `.fallback-html`, and wrapper-only `.float-breakout-flow` structure. No block-class-specific selectors remain.

All block-level styling lives in Vue SFCs backed by shared-component recipes. Paragraph, list, heading, image, quote, pullquote, details, accordion, code, table, file, gallery, embed, button, button-group, separator, group, columns, and media-text blocks all follow the recipe pattern.

`_wp-editor.scss` uses shallow nesting organized by block type rather than grouped cross-block selectors. Each block type owns its own nested rule tree.

The token system has been consolidated: shadow scale uses `soft-low/mid/high`; surface colors use descriptive names (`surface`, `surface-warm`, `surface-warmer`, `surface-soft`, `surface-softer`); border scale uses `border-subtle/default/strong`; the color ink scale includes `ink-08`, `ink-04`, and `ink-025`; the type scale uses `type-small/base/large`; motion values include `ease-snappy`, `featured-media-flight-duration`, `motion-route-content-delay`, and `slow-duration`; the z-index scale uses `z-lower/low/mid/high/higher/highest`; the breakpoint mixin has one max-width name (`phone` at 767px) plus `tablet-down`, `tablet`, `desktop`, and `desktop-lg`.

Dead code and visual cruft have been removed: chips spans and all chips CSS from `HomeContentSection.vue`, dead mobile CSS from `CaseStudyCard.vue`, Material Design easing replaced with project easing tokens.

# To Do

_All items complete — see # Done._

# Ready for human visual QA

# Done

## Token hygiene — final pass

- Renamed shadow scale to `shadow-soft-low/mid/high`
- Consolidated surface colors to `surface`, `surface-warm`, `surface-warmer`, `surface-soft`, `surface-softer`; removed legacy `color-surface-paper`
- Added `color-ink-08`, `color-ink-04`, `color-ink-025` to the ink opacity scale; removed illegitimate `color-mix()` calls
- Added border scale `border-subtle/default/strong` to `_effect-palette.scss`
- Removed `$font-serif` alias and updated all nine consumers
- Renamed type scale from `type-step-*` to `type-small/base/large`; removed unused type steps
- Added `slow-duration: 500ms` to `_motion-palette.scss` for image zoom and heavyweight media transitions
- Added z-index scale `z-lower/low/mid/high/higher/highest` (values 1/2/3/4/900/1000) to `_spatial-palette.scss`; exported as CSS custom properties in `_vue-frontend.scss`
- Consolidated breakpoint mixin to one max-width name: `phone` (767px); removed `mobile` (720px) and `wide-mobile` (820px); converted all 10 callsites
- Removed `motion-interaction` token — hover durations left as hardcoded 200ms since coupling them to a token that happens to share a value with route transitions creates a false relationship
- Removed dead chips spans and ~70 lines of dead chips CSS from `HomeContentSection.vue`
- Removed dead mobile-layout block and dead `.subheading span` rule from `CaseStudyCard.vue`; replaced Material Design easing with `var(--slow-duration) var(--ease-snappy)`
- Ran `corepack pnpm check` — clean



## Type font resource emission cleanup

- Added `_type-fonts.scss` as the explicit owner of the external font resource request
- Removed the external font import from `_type-palette.scss` so the type palette is non-emitting and safe for shared recipes consumed by Vue scoped styles
- Imported `_type-fonts.scss` from the emitting frontend and WordPress editor context-role files
- Verified the Vue SFC Sass API compile no longer emits the font import or any selectors
- Updated design-system and refactor docs to remove the tabled type-palette font-import exception

## Quote/pullquote/button-group complete recipe pass

- Added complete root recipe mixins for quote, pullquote, and button-group blocks
- Moved quote text-alignment modifiers, wide/full child-copy rules, and deep `p`/`cite` styling out of `QuoteBlock.vue` and into `_quote-block.scss`
- Moved pullquote text-alignment modifiers, deep `blockquote`/`p`/`cite` styling, and wide/full child-copy rules out of `PullquoteBlock.vue` and into `_pullquote.scss`
- Moved button-group justification modifiers out of `ButtonsBlock.vue` and into `_button-group.scss`
- Updated `QuoteBlock.vue`, `PullquoteBlock.vue`, and `ButtonsBlock.vue` so each SFC applies a single complete recipe mixin to its root element
- Updated `_wp-editor.scss` to reuse the shared quote, pullquote, and button-group modifier helpers where the editor DOM still needs explicit child selector adaptation
- Verified focused Sass compiles for the frontend SFC Sass API, frontend context-role CSS, and WordPress editor context-role CSS

## Columns/media-text complete recipe pass

- Added complete root recipe mixins for columns, individual columns, and media/text blocks
- Moved columns count detection, vertical alignment modifiers, phone stacking, and block rhythm out of `ColumnsBlock.vue` and into `_columns-block.scss`
- Moved individual column stack rhythm and vertical alignment states out of `ColumnBlock.vue` and into `_columns-block.scss`
- Moved media/text surface, media-on-right, vertical alignment, child-part styling, and phone stacking rules out of `MediaTextBlock.vue` and into `_media-text-block.scss`
- Updated `ColumnsBlock.vue`, `ColumnBlock.vue`, and `MediaTextBlock.vue` so each SFC applies a single complete recipe mixin to its root element
- Updated `_wp-editor.scss` to reuse shared columns count, alignment, phone-stack, and column-stack helpers while keeping editor-only media/text resize clamps explicit
- Verified focused Sass compiles for the frontend SFC Sass API, frontend context-role CSS, and WordPress editor context-role CSS

## File/table/gallery/embed/code complete recipe pass

- Added complete root recipe mixins for file, table, gallery, embed, code, and preformatted blocks
- Moved file child-role styling, hover/focus states, download-link alignment, icon styling, and phone stacking out of `FileBlock.vue` and into `_file-block.scss`
- Moved table scroll wrapper styling, deep table cell/header/row styling, and caption styling out of `TableBlock.vue` and into `_table-block.scss`
- Moved gallery column modifiers and deep child figure/image/caption styling out of `GalleryBlock.vue` and into `_gallery-block.scss`
- Moved embed frame, iframe, fallback, and caption styling out of `EmbedBlock.vue` and into `_embed-block.scss`
- Moved code shell, Shiki content, line/code normalization, and language-label styling out of `CodeBlock.vue` and into `_code-block.scss`
- Moved preformatted block styling out of `PreformattedBlock.vue` and into `_code-block.scss`
- Updated all six SFCs so each applies a single complete recipe mixin to its root element
- Updated `_wp-editor.scss` to reuse shared direct-DOM helpers for code and table blocks while keeping Gutenberg-specific adapters explicit
- Verified focused Sass compiles for the frontend SFC Sass API, frontend context-role CSS, and WordPress editor context-role CSS

## Image/details/accordion complete recipe pass

- Added complete root recipe mixins for image, details, and accordion blocks
- Moved image wide/full/center/float composition plus link, image, and caption child styling out of `ImageBlock.vue` and into `_image-block.scss`
- Moved details summary, marker, open-state divider, panel, and deep panel rhythm styling out of `DetailsBlock.vue` and into `_details-block.scss`
- Moved accordion item separators, toggle, toggle icon state, panel, and deep panel rhythm styling out of `AccordionBlock.vue` and into `_accordion-block.scss`
- Updated `ImageBlock.vue`, `DetailsBlock.vue`, and `AccordionBlock.vue` so each applies a single complete recipe mixin to its root element
- Updated `_wp-editor.scss` to reuse shared direct-DOM helpers for details and accordion blocks while keeping Gutenberg-specific adapters explicit
- Verified focused Sass compiles for the frontend SFC Sass API, frontend context-role CSS, and WordPress editor context-role CSS

## Paragraph/list/heading recipe ownership pass

- Added shared-component recipes for paragraph, list, and heading blocks
- Moved paragraph width, rhythm, typography, float-breakout participation, rich-link styling, and text-alignment states out of `ParagraphBlock.vue` and into `_paragraph-block.scss`
- Moved list width, rhythm, indentation, nested-list behavior, item rhythm, rich-link styling, and float-breakout participation out of `ListBlock.vue` and into `_list-block.scss`
- Moved heading typography, article-frame rhythm, width alignment, float-breakout participation, h2 divider treatment, and text-alignment states into `_heading-block.scss`
- Updated `HeadingBlock.vue`, `ParagraphBlock.vue`, and `ListBlock.vue` so they render semantic roots and include shared recipes locally
- Updated `_wp-editor.scss` so Gutenberg paragraph, list, and heading blocks consume the same recipes, with editor-specific heading rhythm overrides where needed
- Narrowed `_type-palette.scss` back toward palette responsibilities by removing emitted `body`, heading, paragraph, list, `li`, and `dd` selector rules; context roles now own page/body base
- Verified focused Sass compiles for the frontend SFC Sass API, frontend context-role CSS, and WordPress editor context-role CSS

## Recipe ownership architecture — full consolidation pass

- Confirmed and fully implemented the recipe ownership architecture: shared-component recipe files own a block's complete styling including `width-alignment()`, `float-breakout-wrapping-content()`, and `float-breakout-lead($side)` calls inline alongside visual declarations; SFCs include the recipe shell mixin and get everything together
- Moved all remaining content-flow placement, fill resets, and float-breakout hooks out of `_vue-frontend.scss` into owning recipe files: `_accordion-block.scss`, `_details-block.scss`, `_quote-block.scss`, `_pullquote.scss`, `_code-block.scss`, `_table-block.scss`, `_file-block.scss`, `_group-block.scss`, `_button-group.scss`, `_embed-block.scss`; frontend-only interactive blocks such as Mega Gallery, spacer, and audio/video use SFC-local styles where appropriate
- `_vue-frontend.scss` achieved its target end-state: no block-class-specific rules; only `.content-flow` grid, tokens, page/body base, and wrapper-structural rules remain
- Renamed `float-breakout-item()` to `float-breakout-wrapping-content()` to match the `.float-breakout-wrapping-content` wrapper class; added `float-breakout-lead($side)` for directional float-as-lead behavior
- Image, quote, and pullquote blocks own float-lead behavior through a `*-float-lead` mixin called from inside their shell mixin; SFCs call the shell and get float geometry automatically; tablet-down responsive collapse lives inside each `*-float-lead` mixin
- Centralized caption typography into `editorial-caption` mixin in `_type-palette.scss`; all recipe caption delegations call `type.editorial-caption`
- Decoupled wide/full viewport geometry from `_image-block.scss`; `$breakout-wide-width` now lives in `_spatial-palette.scss` and is consumed independently by image, code, and gallery recipes; full-breakout geometry is stated inline in each recipe
- Updated `## General principles` and `# Current State Overview` to reflect the achieved architecture
- `corepack pnpm check` passes clean

## Layout-owned fallback transition cleanup

- Moved `.site-main` fallback page-transition styles from `_vue-frontend.scss` into `apps/frontend/layouts/default.vue`, which renders the shell element and applies the fallback transition classes
- Kept motion timing custom properties exported from the frontend context role for the layout and transition code to consume
- Updated `docs/refactor-styles.md`, `docs/design-system.md`, and this to-do doc so route/page-shell transitions are documented as layout/component-owned when there is a clear owner
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## Paper-grid texture token extraction

- Moved the frontend grid-paper background layers and background-size list from `_vue-frontend.scss` into named effect palette values in `_effect-palette.scss`
- Exported `--texture-paper-grid` and `--texture-paper-grid-size` from the frontend context role alongside the other effect custom properties
- Kept `body` as the application site for the page background, now consuming the named texture variables
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## Separator recipe ownership cleanup

- Kept `SeparatorBlock.vue` rendering a bare semantic `<hr>` while replacing its temporary local debug rule with `@include separator-root`
- Added `separator-root` to `_separator-block.scss` so the separator recipe owns content-flow placement, base shell, wide style, and dots style together
- Updated `_wp-editor.scss` to consume the same separator recipe for `.wp-block-separator`
- Removed the direct `> hr` separator styling and the separator recipe import from `_vue-frontend.scss`, leaving `.content-flow` focused on defining the article grid tracks
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## Image/embed caption ownership cleanup

- Removed the broad `.content-flow > figure:not(.pullquote):has(> img)` image fallback tree and the broad `.content-flow > figure:not(.pullquote) figcaption` caption hook from `_vue-frontend.scss`
- Changed `ImageBlock.vue` from rendering the full figure body with `v-html` to rendering the image, optional linked-image wrapper, and figcaption as explicit template nodes
- Moved image block content-flow placement, alignwide/alignfull sizing, aligncenter handling, float handling, media treatment, and caption styling into the image shared-component recipe consumed by `ImageBlock.vue`
- Added an `embed-caption` recipe and applied it in `EmbedBlock.vue` so Vimeo/YouTube embed captions no longer rely on the global image-figure caption fallback
- Kept `.float-breakout-flow` figure rules in `_vue-frontend.scss` because they describe wrapper-level float grouping, not normal image block presentation
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## Gallery block SFC ownership pass

- Moved full `.gallery-block` visual recipe from `_vue-frontend.scss` into `GalleryBlock.vue` scoped styles
- Used `:deep(> figure)` for `gallery-item`/`gallery-image`/`gallery-caption` since `ImageBlock` components are child components rendered as `<figure>` roots
- Removed `@use '../shared-components/gallery-block'` and `@use '../shared-components/columns-block'` from `_vue-frontend.scss` (both were only used inside `.gallery-block`)
- `image-block` import in `_vue-frontend.scss` retained — it serves the `.image-block` rule and float-breakout context heavily
- Verified `corepack pnpm check` passes clean; DOM audit confirmed `margin-bottom: 48px`, two-column grid, figure children rendering
- Re-run browser visual QA on default, wide, full, and columns-2 through columns-6 gallery variants

## Media-text SFC ownership pass

- Moved full `media-text-block` visual recipe from `_vue-frontend.scss` into `MediaTextBlock.vue` scoped styles
- Both `&.stack-on-mobile` and `&:not(.stack-on-mobile)` phone-breakpoint branches preserved as-is (both collapse to `grid-template-columns: 1fr`)
- Removed `@use '../shared-components/media-text-block'` from `_vue-frontend.scss`; kept content-flow placement rules
- Verified `corepack pnpm check` passes clean; DOM audit confirmed `margin-bottom: 48px` + two-column grid layout
- Re-run browser visual QA on default, wide, full, and media-on-right variants

## Group-block SFC ownership pass

- Moved `group-shell`, `margin-bottom`, and child spacing from `_vue-frontend.scss` into `GroupBlock.vue` scoped styles
- Used `:deep(> * + *)` for child spacing since `BlockChildren` renders block components as direct children
- Kept `width-alignment(default)` content-flow placement and `.content-flow > &` fill reset in `_vue-frontend.scss` (the reset counters `group-shell`'s own centering when standalone; inside `.content-flow` the grid handles placement)
- Removed `@use '../shared-components/group-block'` from `_vue-frontend.scss`
- Verified `corepack pnpm check` passes clean; DOM audit confirmed `margin-bottom: 48px` and second-child `margin-top: 16px`
- Re-run browser visual QA on default and wide group blocks

## Embed/audio/video SFC ownership pass

- Moved frontend embed frame shell, iframe aspect-ratio fill, embed fallback states, audio fill, and video fill from `_vue-frontend.scss` into `EmbedBlock.vue`, `AudioBlock.vue`, and `VideoBlock.vue`
- Used scoped `:deep(audio)` and `:deep(video)` in `AudioBlock.vue` and `VideoBlock.vue` for elements rendered via `v-html`
- Fixed: video block wrapper was using `audio-shell` mixin (semantically wrong name); replaced with explicit `width: 100%` in `VideoBlock.vue`
- Removed `.embed-frame`, `.embed-frame-fallback`, and `.embed-fallback` top-level rules from `_vue-frontend.scss`; these now live as nested rules inside `.embed-block` scoped styles in `EmbedBlock.vue`
- Removed `@use '../shared-components/embed-block'` from `_vue-frontend.scss`
- Kept `width-alignment()` content-flow placement for all three blocks in `_vue-frontend.scss`
- Verified `corepack pnpm check` passes clean and DOM audit confirmed computed styles match (frame overflow/shadow, iframe 16/9 ratio, audio/video fill and margin)
- Re-run browser visual QA on default, wide, and full embed/audio/video blocks, plus embed fallback states

## Code/preformatted/table SFC ownership pass

- Moved frontend code-block retro terminal shell, Shiki content styling, language label, and inner line/code handling from `_vue-frontend.scss` into `CodeBlock.vue`
- Moved frontend preformatted retro terminal shell/content styling from `_vue-frontend.scss` into `PreformattedBlock.vue`
- Moved frontend table shell, scroll wrapper, table element, cells, header, row, and caption styling from `_vue-frontend.scss` into `TableBlock.vue`
- Used scoped `:deep(...)` in `CodeBlock.vue` and `TableBlock.vue` for markup inserted through `v-html`
- Kept code, preformatted, and table content-flow hooks, wide/full alignment behavior, and fill resets in `_vue-frontend.scss`
- Removed now-unused code/table shared-component imports from `_vue-frontend.scss`
- Verified both frontend and editor Sass entrypoints compile, then verified with `corepack pnpm check` and `git diff --check`
- Re-run browser visual QA on default, wide, full, syntax-highlighted code, preformatted, and table blocks

## Columns/column SFC ownership pass

- Moved frontend columns-block shell (`columns-shell`), column-count `:has()` logic (`columns-three-up-compact`, `columns-explicit`), vertical-alignment modifiers (`columns-align-top/center/bottom`), and phone `grid-template-columns: 1fr` breakpoint override from `_vue-frontend.scss` into `ColumnsBlock.vue`
- Merged the existing vertical-align modifiers that were already in `ColumnsBlock.vue` into the consolidated scoped rule tree
- Moved column shell (`column-shell`) and child spacing (`column-stack`) from `_vue-frontend.scss` into `ColumnBlock.vue`; nested the existing individual-column vertical-align modifiers under the `.column-block` rule tree
- Kept `columns-block` and `column-block` content-flow placement in `_vue-frontend.scss`; `.column-block` has no placement rule since it is never a direct `.content-flow` child
- Verified `columns-block` shared-component import remains needed in `_vue-frontend.scss` for the `.gallery-block.columns-N` column modifier rules
- Verified `corepack pnpm check` passes clean
- Re-run browser visual QA on default, wide, full, and phone-stacked columns layouts

## Dead-rule cleanup

- Removed `.content-shell`, `.link-rich` (+ hover), and `.button-solid` (+ hover) from `_vue-frontend.scss` — none appeared in DOM audit
- Removed redundant `.gallery-block .content-flow > &` back-reference that duplicated the unconditional `@include gallery-block.gallery-frame` directly above it
- Moved frontend button-group shell and justification styling from `_vue-frontend.scss` into `ButtonsBlock.vue`
- Moved frontend file block shell, child-part styling, download button styling, and phone stacking from `_vue-frontend.scss` into `FileBlock.vue`
- Kept button-group and file-block content-flow hooks, wide/full alignment behavior, fill resets, and float-breakout behavior in `_vue-frontend.scss`
- Added scoped-style specificity guards to the remaining `.content-flow` fill reset hooks so context rules still beat SFC root shell styles without using scoped `:global(...)`
- Removed now-unused button/button-group/file imports from `_vue-frontend.scss`
- Verified both frontend and editor Sass entrypoints compile, then verified with `corepack pnpm check` and `git diff --check`
- Re-run browser visual QA on default, wide, full, justified, and narrow/mobile button groups and file download blocks

## Details/accordion SFC ownership pass

- Removed the redundant `.details-block` class from `DetailsBlock.vue` and styled the component root through the native `details` selector
- Moved frontend details and accordion readable root box styling into `DetailsBlock.vue` and `AccordionBlock.vue`
- Kept `details` and `.accordion-block` content-flow hooks, wide/full alignment behavior, and float-breakout behavior in `_vue-frontend.scss`
- Moved shared details/accordion body-copy type declarations into the existing shared shell recipes so the Vue SFCs and `_wp-editor.scss` share the same disclosure recipe while continuing to consume the non-emitting type palette safely from scoped Vue styles
- Removed now-redundant `type.editorial-body-copy` calls from the details and accordion editor adapter rules
- Verified both frontend and editor Sass entrypoints compile, then verified with `corepack pnpm check` and `git diff --check`
- Re-run browser visual QA on default, wide, full, and float-breakout details/accordion blocks in both frontend and editor![1777919959157](image/refactor-styles-to-do/1777919959157.png)

## Frontend heading semantic context-hook pass

- Moved direct content-flow placement/rhythm hooks for native `h2` through `h6` out of the `.content-flow` container tree and into the owning native heading rule trees in `_vue-frontend.scss`
- Historical pass later superseded by the paragraph/list/heading recipe ownership pass: heading typography and article-frame behavior now live in `_heading-block.scss`, with `_type-palette.scss` providing non-emitting type values
- Later superseded: `HeadingBlock.vue` now includes the shared heading recipes directly on semantic heading roots
- Kept content-flow/page-context behavior in `_vue-frontend.scss`; no scoped `:global(.content-flow)` selectors were introduced
- Verified with frontend Sass compilation and `corepack pnpm check`
- Re-run browser visual QA on article h2 through h6 rhythm, h2 divider treatment, text alignment, and float-breakout headings

## Paragraph/list semantic type baseline cleanup

- Historical pass later superseded by the paragraph/list/heading recipe ownership pass: paragraph and list typography now live in `_paragraph-block.scss` and `_list-block.scss`, with `_type-palette.scss` providing non-emitting type values
- Later superseded: paragraph/list width, block rhythm, padding, article list indentation, nested-list spacing, and rich-link handling now live in the shared paragraph/list recipes rather than directly in the SFCs
- Later superseded: list item rhythm now lives in `_list-block.scss`
- Verified with frontend Sass compilation and `corepack pnpm check`
- Re-run browser visual QA on article paragraphs/lists and spot-check navigation/home lists for unintended inherited color or line-height shifts

## Frontend paragraph/list semantic HTML + SFC ownership pass

- Removed redundant `.paragraph-block` and `.list-block` root class emission from `ParagraphBlock.vue` and `ListBlock.vue`
- Moved paragraph/list root width, rhythm, padding, type, nested-list rhythm, and rich-link styling into scoped SFC styles
- Used scoped `:deep(a)` / `:deep(li + li)` only for component-owned content inserted through `v-html`
- Kept content-flow placement and float-breakout behavior in `_vue-frontend.scss`, targeting native `p`, `ul`, and `ol` hooks
- Added a specificity guard to `float-breakout-item()` so context rules beat scoped Vue root selectors without using scoped `:global(...)`
- Verified with frontend Sass compilation and `corepack pnpm check`
- Human browser QA passed on paragraph/list rhythm, links, text alignment, nested lists, and float-breakout copy

## `_mixins.scss` / frontend placement-helper naming cleanup

- Replaced `content-flow-block`, `content-flow-readable-block`, and `content-flow-alignments` with `width-alignment(default|wide|full)`
- Kept `width-alignment(default)` terse: it emits content-track placement without taking a declaration block
- Added `width-alignment(default-wide)` for native editorial headings that default to the wide track while still owning their measure and rhythm locally
- Made `width-alignment(wide)` and `width-alignment(full)` work like breakpoint helpers so each component owns its wide/full declarations locally
- Renamed `float-breakout-copy-block` to `float-breakout-item` and removed the extra readable/content-flow alias layer
- Updated `_vue-frontend.scss` call sites so readable width, content-flow fill resets, and wide/full max-width behavior stay in the owning native element or component rule tree

## Content-flow placement pass: embed, code, media-text, columns, quote, pullquote

- Added direct `width-alignment(default/wide/full)` calls to `EmbedBlock.vue`, `CodeBlock.vue`, `MediaTextBlock.vue`, `ColumnsBlock.vue`, `QuoteBlock.vue`, and `PullquoteBlock.vue` scoped styles
- Moved `margin-bottom: var(--space-5)` from the context-role into `QuoteBlock.vue`; moved `margin-bottom: var(--space-7)` and the pullquote `float-breakout-item { max-width: var(--article-column-tight); margin-bottom: var(--space-5); }` block into `PullquoteBlock.vue`
- Restructured flat `.quote-block.*` and `.pullquote-block.*` top-level rules into a single nested `.quote-block { ... }` / `.pullquote-block { ... }` tree in each SFC
- Moved `alignwide`/`alignfull` frame sizing for code, quote, and pullquote into the `width-alignment(wide/full)` blocks alongside `grid-column` — same pattern as gallery; removed the now-redundant standalone `.code-block.alignwide/.alignfull`, `.quote-block.alignwide/.alignfull`, `.pullquote-block.alignwide/.alignfull` flat rules
- Removed `.embed-block`, `.code-block`, `.media-text-block`, `.columns-block`, `.quote-block`, and `.pullquote` from `_vue-frontend.scss`; `@use` imports for `quote-block` and `pullquote` retained — consumed by `.float-breakout-flow` float rules
- Verified `corepack pnpm check` passes clean
- Re-run browser visual QA on default, wide, and full variants of all six block types; check quote/pullquote float-breakout rendering
- Updated `docs/refactor-styles.md` with the more explicit width-alignment and float-breakout-item philosophy
- Verified both frontend and editor Sass entrypoints compile
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## Frontend/editor style QA

- Human browser QA passed after the type/structural cleanup, including the details/accordion wide-width behavior
- Focus areas included headings, captions, details/accordion, verse, media-text, and nested blocks in groups/columns

## `_wp-editor.scss` — float wrapper consolidation

- Consolidated the repeated `.wp-block[data-align="left/right"]` and `.block-editor-block-list__block[data-align="left/right"]` selector chains into one nested editor-wrapper tree
- Kept shared float sizing, directional left/right margins, floated inner-content reset, image resize-handle clamp, and clear-below-floats behavior together as one editor float mini-system
- Removed redundant image-specific margin rules that repeated the generic left/right float margins
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_wp-editor.scss` — wide/full wrapper and image/gallery consolidation

- Consolidated repeated wide/full child adapter selectors for `.wp-block` and `.block-editor-block-list__block` into one nested editor-wrapper tree
- Moved button-group and embed/video/audio wrapper alignment adapters into the central wide/full wrapper tree, leaving direct `.alignwide` / `.alignfull` behavior in each block tree
- Nested `.wp-block-image` base width, figure reset, image sizing, direct align image-height limits, and caption styles under the image block tree
- Merged the split `.wp-block-gallery` sections so image fitting, figure reset, figure-image sizing, and captions live under one gallery block tree
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_wp-editor.scss` — heading, table, and breakpoint nesting

- Nested heading max-width, h2 decoration, and root-container vertical rhythm under `.wp-block-heading` / `.is-root-container` trees
- Converted flat `.wp-block-table` selectors into a table block tree with table element, cell, header, row, and caption rules nested locally
- Kept raw HTML table fallback behavior under `.wp-block-html` so Gutenberg table and raw HTML table contexts remain distinct
- Nested the phone breakpoint overrides under `.editor-styles-wrapper`
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_wp-editor.scss` — file block download alignment fix

- Switched editor `.wp-block-file` from the simple file shell to the grid file shell so file text and the download button occupy opposite sides of the box
- Added direct `alignwide` and `alignfull` guards to `.wp-block-file` so both Gutenberg alignment shapes preserve the expanded file box width
- Added a phone breakpoint fallback so file blocks stack cleanly and the download button returns to the left on narrow screens
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_wp-editor.scss` — top-level wrapper sectioning

- Consolidated repeated top-level `.editor-styles-wrapper` blocks into four labeled sections: editor base/article primitives, editor alignment adapters, editorial block recipes, and layout/utility block recipes
- Moved the generic `alignwide` / `alignfull` editor rules into the alignment-adapter section while keeping their cascade position before block recipes
- Moved the small cover image fitting rule into the cover block's layout/utility tree so cover styles are no longer split across two sections

## `_wp-editor.scss` — section polish and accordion cleanup

- Added subsection comments inside the editorial and layout/utility recipe sections so the four large editor sections are easier to scan without collapsing everything into one giant wrapper
- Nested accordion heading, toggle, item-divider, panel, and panel-rhythm rules under `.wp-block-accordion` while preserving selectors needed for editor and saved-markup compatibility
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_vue-frontend.scss` — first grouped selector split pass

- Split button group shell rules into independent `.wp-block-buttons` and `.button-group` blocks
- Split image/gallery base width and figure reset rules into independent block-owned rules
- Split separator shell, wide, and dots rules for Gutenberg, raw HTML, and content-flow contexts
- Split code/preformatted shell, content, Shiki, line, and inline-code groups across Gutenberg, raw HTML, `.code-block`, and `.preformatted-block` contexts
- Split embed/video/audio/raw-HTML shell rules, media-element rules, fallback shell rules, and audio element rules into per-context blocks
- Split columns, column, group, spacer, verse, and phone column-stacking groups into independent rules
- Preserved values and mixin calls; this was a structural split only
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_vue-frontend.scss` — quote and pullquote tree split

- Replaced the flat quote/pullquote selector cluster with separate rule trees for `.wp-block-quote`, `.wp-block-pullquote`, raw HTML `.wp-block-html > blockquote`, `.content-flow` fallback quote/pullquote selectors, and `.float-breakout-flow` float adapters
- Kept quote shell/copy/cite, wide/full frames, float frames, text alignment, and wide-copy mixin calls attached to each owning context
- Preserved existing Gutenberg, raw HTML, content-flow fallback, and float-breakout selector coverage while removing the cross-context grouped rules
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_vue-frontend.scss` — image, gallery, and cover tree split

- Replaced grouped image/gallery/cover rules with separate trees for `.wp-block-image`, `.wp-block-gallery`, `.wp-block-cover`, raw HTML `.wp-block-html` image alignment fallbacks, `.content-flow` figure fallbacks, `.float-breakout-flow` figure adapters, and `.gallery-block`
- Kept wide/full frames, capped media, float frames, centered image behavior, captions, and gallery column recipes attached to their owning contexts
- Preserved the old cascade for Gutenberg gallery child images that also carry `.wp-block-image`, so the refactor does not change their effective object-fit behavior
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_vue-frontend.scss` — table tree split

- Replaced grouped table rules with separate trees for Gutenberg `.wp-block-table`, raw HTML `.wp-block-html > table` fallback behavior, and the custom `.table-block` component
- Kept table shell, table element, cell, header-cell, even-row, last-row border, caption, and scroll mixin calls attached to the contexts that previously received them
- Preserved the narrower raw HTML behavior: raw HTML tables keep shell and cell treatment without inheriting the Gutenberg/component table-element, header, even-row, or caption rules
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_vue-frontend.scss` — media-text tree split

- Replaced grouped media-text rules with separate trees for Gutenberg `.wp-block-media-text` and the custom `.media-text-block` component
- Kept right-side media direction, child direction reset, media image sizing, surface, media wrapper, copy wrapper, and vertical alignment mixin calls attached to their owning contexts
- Split the phone breakpoint media-text stacking rules so Gutenberg and custom component selectors are no longer grouped together
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_vue-frontend.scss` — stale Gutenberg fallback cleanup

- Audited `docs/scratch/dom.html` and confirmed the app subtree still emits `wp-block-paragraph` and `wp-block-list`, but no longer emits the structured block classes such as `.wp-block-quote`, `.wp-block-image`, `.wp-block-table`, `.wp-block-embed`, `.wp-block-columns`, or `.wp-block-file`
- Removed stale structured `.wp-block-*` and `.wp-block-html` fallback recipes from `_vue-frontend.scss` now that semantic Vue block classes own those visual recipes
- Kept active frontend paragraph/list link styles, semantic block recipes, content-flow figure/separator rules, and float-breakout adapters that still match the rendered semantic DOM
- Verified the remaining `wp-block-*` selectors in `_vue-frontend.scss` are limited to paragraph/list link styling
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## Frontend paragraph/list semantic class conversion

- Changed `ParagraphBlock.vue` and `ListBlock.vue` to emit `paragraph-block` and `list-block` instead of `wp-block-paragraph` and `wp-block-list`
- Preserved non-WordPress root classes from list markup by stripping only the frontend WordPress class noise before applying the semantic `list-block` class
- Moved paragraph/list typography declarations into `type-palette` mixins so frontend semantic classes and editor Gutenberg classes can share values without sharing selectors
- Updated `_vue-frontend.scss` link styling and paragraph/list layout rules to target the semantic frontend classes
- Re-applied the shared paragraph/list type mixins inside `_wp-editor.scss` so the CMS editor keeps its Gutenberg hooks and visual behavior
- Verified there are no remaining `wp-block-paragraph` or `wp-block-list` selectors in frontend components, `_vue-frontend.scss`, or `_type-palette.scss`
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_type-palette.scss` / frontend structure — remaining frontend Gutenberg selector cleanup

- Removed the remaining shared/frontend `wp-block-*` and raw `.wp-block-html` selectors from `_type-palette.scss` and the frontend structural rules
- Added named type mixins for editorial headings, media-text copy, and verse copy so editor and frontend can share values without sharing selectors
- Kept frontend typography attached to semantic content-flow and block classes (`.content-flow`, `.media-text-block`, `.verse`, etc.)
- Re-applied heading, details, accordion, caption, media-text, and verse typography mixins inside `_wp-editor.scss` so Gutenberg editor hooks keep their CMS-side visual behavior
- Replaced the legacy structural fallback groups with semantic frontend block classes such as `.quote-block`, `.details-block`, `.table-block`, `.audio-block`, `.video-block`, and `.mega-gallery-block`
- Verified `_type-palette.scss` and `_vue-frontend.scss` contain no `wp-block-*` / `.wp-block-html` selectors
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_vue-frontend.scss` — frontend structural partial merge

- Folded the frontend-only `.content-flow`, semantic block rhythm, float-breakout copy, global alignwide/alignfull, fallback HTML, and content-shell structural rules into `_vue-frontend.scss`
- Removed obsolete `_structural-relations.scss` and `_wordpress-blocks-baseline.scss` partials now that they no longer represent a shared CMS/frontend layer
- Updated active style-system docs to describe `_vue-frontend.scss` as the owner of frontend article structure and `_wp-editor.scss` as the owner of editor-specific Gutenberg layout adapters

## `_vue-frontend.scss` — component-oriented consolidation pass

- Moved paragraph, list, quote, details, accordion, pullquote, gallery, mega-gallery, code, table, embed/audio/video, media-text, cover, columns, group, spacer, file, and verse layout declarations into their owning rule trees
- Merged the content-flow figure/separator fallback recipes into the main `.content-flow` article-structure section under a titled comment
- Merged float-breakout clearfix, figure adapters, quote adapters, pullquote adapters, and captions into one `.float-breakout-flow` tree
- Nested cover, columns, file, embed, and button-group child/state rules so each component's behavior can be read in one place
- Corrected the column child rhythm selector shape while preserving the existing intended value (`margin-top: var(--space-4)`)

## `_vue-frontend.scss` — component-owned responsive rules

- Moved the phone fallback for content-flow floated figures inside the `.content-flow` article-structure tree
- Moved tablet-down float-breakout stacking behavior inside `.float-breakout-flow`
- Moved phone column stacking, media-text stacking, and file download stacking behavior inside `.columns-block`, `.media-text-block`, and `.file-block`
- Removed the detached bottom breakpoint blocks so responsive behavior now lives with the component or structural rule tree it modifies

## `_vue-frontend.scss` / `_mixins.scss` — component-owned content-flow placement

- Added the first frontend content-flow placement mixin pass to `_mixins.scss`
- Moved semantic frontend block content-flow participation out of dense `.content-flow > :is(...)` selector registries and into the owning block trees
- Kept `.content-flow` responsible for grid tracks, fallback bare elements, fallback figure/separator behavior, and true adjacent-block rhythm relationships
- Kept readable prose content-flow behavior explicit for `.paragraph-block` and `.list-block` through a named placement helper
- Removed a stale `MegaGalleryBlock.vue` scoped-style comment that still referenced the deleted `_structural-relations.scss` partial
- Updated `docs/refactor-styles.md` to record the component-owned content-flow placement pattern as style guidance

## `_vue-frontend.scss` — content-flow rhythm simplification

- Removed the dense `.content-flow` adjacency matrix that set spacing based on specific neighboring block pairs
- Removed the grouped fallback margin rules for direct `p`, heading, list, blockquote, figure, details, and separator elements
- Kept `.content-flow` focused on the article grid plus current direct bare elements: heading blocks, image figures, and separators
- Expanded direct heading fallback rules so each heading level owns its own content-flow margin, width, and padding values
- Moved details, accordion, and preformatted flow participation into their component-owned rule trees
- Updated `docs/refactor-styles.md` to prefer block-owned rhythm over container-owned adjacency matrices
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_type-palette.scss` / heading semantics cleanup

- Historical pass: moved heading declarations away from grouped selectors and toward independently readable heading rules
- Later superseded by the paragraph/list/heading recipe ownership pass: heading selector styling now lives in `_heading-block.scss`, not in `_type-palette.scss`
- Removed context-specific `.content-flow`, `.pullquote`, `.media-text-block`, and `.verse` selectors from `_type-palette.scss`
- Moved details, accordion, media-text copy, and verse type mixin applications into their owning frontend rule trees
- Reduced `HeadingBlock.vue` scoped styles toward semantic heading-root recipe application
- Updated `docs/refactor-styles.md`, `docs/code-style.md`, and `docs/design-system.md` with the durable semantic-HTML/type-palette direction
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_type-palette.scss` / shared component copy cleanup

- Clarified `_type-palette.scss` ownership around non-emitting font-family source values, reusable type scale values, semantic type values, and type-related Sass variables
- Extracted body color, body size, body line-height, list line-height, list item rhythm, and readable measure into named Sass tokens
- Kept readable measure in `_type-palette.scss` as a typography concern and exported it through context-role CSS custom properties
- Exported reusable body, list, and measure type tokens from `_vue-frontend.scss` and `_wp-editor.scss`; heading-level one-off values later moved inline to `_heading-block.scss`
- Moved media-text copy and verse copy recipes into their owning shared component recipe files
- Updated frontend and editor context roles to use `media-text-block.media-text-copy` and `verse-block.verse-copy`
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_mixins.scss` / readable content-flow placement cleanup

- Narrowed the readable placement helper so it only places readable blocks on the content grid track
- Removed duplicated readable placement output from the helper file
- Moved readable block width ownership into `.paragraph-block`, `.list-block`, `.details-block`, and `.accordion-block`
- Removed duplicate content-flow-generated `max-width`, `margin-inline`, and `padding-inline` declarations from readable block DevTools cascades
- Updated `docs/refactor-styles.md` to clarify that readable placement helpers should not own readable box styling
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_mixins.scss` / layout content-flow placement cleanup

- Narrowed the default placement helper so it only places blocks on the content grid track
- Removed the old generic width, max-width, margin, padding-reset, and margin-bottom behavior from the placement helper
- Moved direct content-flow fill overrides into the owning frontend block recipes for float-breakout, button-group, gallery, preformatted, table, embed, audio, video, group, file, and verse blocks
- Kept wide/full participation as focused helper behavior
- Updated `docs/refactor-styles.md` to clarify that layout/media content-flow fill exceptions belong inside the component rule tree
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_vue-frontend.scss` / `_mixins.scss` — semantic float-breakout copy hooks

- Added the first float-breakout item helper to `_mixins.scss` so float-breakout behavior can be emitted from native element and component rule trees
- Removed the dense `.float-breakout-copy` selector registry for child width, padding, and rhythm rules
- Kept `.float-breakout-copy` responsible only for wrapper-level first-child cleanup
- Attached float-breakout copy behavior to native `p`, `ul`, `ol`, `h2` through `h6`, `blockquote`, and `details` selectors instead of reinforcing extra semantic classes
- Kept class hooks for richer/non-native frontend components such as `.accordion-block`, `.pullquote`, `.button-group`, and `.verse`
- Moved frontend details layout from `.details-block` to the native `details` selector while leaving the existing Vue class in place for the component-local visual recipe
- Added local `alignwide` and `alignfull` width behavior for native `details` and `.accordion-block`
- Updated `docs/refactor-styles.md` with the semantic-element-first float-breakout pattern
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_wp-editor.scss` — button group wide/full regression fix

- Restored editor `alignwide` and `alignfull` width behavior for `.wp-block-buttons` after the shared button-group shell narrowed the block back to `var(--article-column)`
- Added Gutenberg wrapper `data-align="wide"` and `data-align="full"` adapters for nested `.wp-block-buttons` so the rule matches the CMS editor DOM
- Kept justification rules (`is-content-justification-left`, `center`, `right`) local to the button-group tree so right-aligned groups have the intended wide container to align within
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_wp-editor.scss` — shallow nesting readability pass

- Converted repeated `.editor-styles-wrapper .wp-block-*` flat chains into shallow `.editor-styles-wrapper { ... }` nesting where the hierarchy is real
- Nested `.wp-block-paragraph` link base/hover/focus rules under its own paragraph block tree
- Nested `.wp-block-list` list internals and link base/hover/focus rules under its own list block tree, separate from paragraph links
- Simplified editor list selectors to target nested Gutenberg `.wp-block-list` blocks directly, with root `ul.wp-block-list` / `ol.wp-block-list` marker restoration
- Nested `.wp-block-details` child/state rules (`> summary`, `[open] > summary`, content children) under a self-contained details block tree
- Nested `.wp-block-accordion` owned child rules for editor internals, heading buttons, panels, and panel rhythm while preserving standalone accordion editor selectors where needed
- Nested obvious block-owned sections for quote, pullquote, button, button group, gallery, code/preformatted, media/text, columns, group, cover, file, verse, and separator blocks
- Left broad alignment and remaining raw HTML adapter rules flat where they are editor layout or cross-context adapter rules rather than one component's private tree
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_wp-editor.scss` — embed/video/audio adapter cleanup

- Split the grouped `.wp-block-embed`, `.wp-block-video`, `.wp-block-audio`, and raw HTML figure base width rule into per-block rule trees
- Split embed/video/audio `alignwide` and `alignfull` direct-class rules into each block's own nested rule tree
- Consolidated wrapper `data-align="wide"` and `data-align="full"` adapters around the shared editor wrapper states while keeping the block targets explicit
- Nested embed iframe, video element, and audio element rules under their owning block rules
- Kept raw HTML figure sizing as a separate `.wp-block-html > figure` adapter
- Switched the editor column/media-text stacking query to `@include mixins.breakpoint(phone)` to use the shared breakpoint vocabulary
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`

## `_wp-editor.scss` — grouped selector splits

- Split `.wp-block-paragraph, .wp-block-details, .wp-block-accordion { max-width: var(--article-column); margin-inline: auto; }` into three separate self-contained rule blocks
- Split the caption rule for `.wp-block-image figcaption`, `.wp-block-gallery figcaption`, and `.wp-block-html > figcaption` into separate per-context rule blocks
- Split `.wp-block-gallery img, .wp-block-cover img` into separate rule blocks
- Split editor code/preformatted/raw-HTML preformatted sizing rules into separate `.wp-block-code`, `.wp-block-preformatted`, and `.wp-block-html > pre` rule blocks
- Split editor code/preformatted/raw-HTML preformatted content recipe rules into separate `.wp-block-code pre`, `.wp-block-preformatted`, `.wp-block-html > pre`, and `.wp-block-code .shiki` rule blocks
- Regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` and verified with `corepack pnpm check`
