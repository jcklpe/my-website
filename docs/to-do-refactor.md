# Background

The shared SCSS styles files — primarily `_wp-editor.scss` and `_vue-frontend.scss` — currently use grouped multi-selector rules to share values between block types. For example, `.wp-block-paragraph, .wp-block-details, .wp-block-accordion { max-width: var(--article-column); margin-inline: auto; }`. This couples unrelated block types together through coincident value sharing rather than named design intent, making each block harder to understand in isolation and harder to change independently.

The refactor replaces all cross-element grouped rules with self-contained per-component rule blocks. Each block type gets its own rule block with its own complete set of declarations, referencing shared tokens (CSS custom properties, Sass variables, mixins) independently. Full rationale and philosophy are in `docs/refactor-styles.md`.

## Project organization

Add new items to complete to the `# To Do` section. When those items are completed move them either to `# Ready for human QA` or `# Done`. Update the `# Current State Overview` with an overview of the current state.

Keep tasks concrete, atomic, and specific. The preference is for tasks like "split the `.wp-block-paragraph, .wp-block-details, .wp-block-accordion` group in `_wp-editor.scss` into three separate rule blocks" rather than "restructure the editor styles."

## General principles

- Split grouped selectors into individual component blocks. Each block type owns its own complete rule.
- Do not change any values during the refactor. This is a pure structural reorganization; visual output must be identical before and after.
- Shared values belong in tokens (CSS custom properties, Sass variables) or named mixins — not in selector groups.
- Universal normalization resets (`*, *::before, *::after`, bare `img`, etc.) and modifier rules (`.wp-block-quote.alignwide`) are allowed to remain grouped; they are intentional groupings, not coincident ones.
- Run `corepack pnpm check` after each file to confirm no visual regressions via lint/typecheck; verify against the QA fixtures at `http://my-website.localhost/writing/block-qa-kitchen-sink-post` and `http://my-website.localhost/case-studies/block-qa-kitchen-sink-case-study`.
- Do not refactor and change logic at the same time. The refactor is a separate pass.

# Current State Overview

The SCSS files are working but structured around grouped multi-selector rules that couple unrelated block types. `_wp-editor.scss` is the most visibly grouped. `_vue-frontend.scss` also has several grouped rules across quote, code/preformatted, embed/video/audio, and column block families. `_type-palette.scss` has grouped heading context rules (`.wp-block-heading:is(h2), .wp-block-html > h2, .content-flow > h2`) that may benefit from per-context separation. `_structural-relations.scss` has `.wp-block-*` rules without explicit context scoping that should be reviewed. `corepack pnpm check` passes clean.

# To Do

## `_wp-editor.scss` — grouped selector splits

- Split `.wp-block-paragraph, .wp-block-details, .wp-block-accordion { max-width: var(--article-column); margin-inline: auto; }` (lines ~100–103) into three separate self-contained rule blocks
- Split `.wp-block-image figcaption, .wp-block-gallery figcaption` caption rule (lines ~381–382) into two separate rules, one per block type
- Split `.wp-block-gallery img, .wp-block-cover img` (lines ~578–579) into two separate rules
- Split `.wp-block-code, .wp-block-preformatted` if grouped (check current state) into separate rule blocks

## `_vue-frontend.scss` — grouped selector splits

- Split `.wp-block-quote, .quote-block` groups (around lines ~174, ~194) into per-component blocks; each should independently reference the relevant shared mixin or token
- Split `.wp-block-buttons, .button-group` group (around line ~310) into two separate rule blocks
- Split `.wp-block-image, .image-block` group (around line ~334) into two separate rule blocks
- Split `.wp-block-code, .wp-block-preformatted, .code-block` group (around lines ~528–531) into three separate rule blocks
- Split `.wp-block-code, .wp-block-preformatted, .preformatted-block` second group (around lines ~543–551) if it exists separately into three rule blocks
- Split `.wp-block-embed, .wp-block-video, .wp-block-audio, .audio-block, .embed-frame-fallback` group (around lines ~626–650) into per-component blocks
- Split `.wp-block-columns, .columns-block` group (around line ~737) into two separate rule blocks
- Split `.wp-block-column, .column-block` group (around line ~760) into two separate rule blocks
- Split `.wp-block-group, .group-block` group (around line ~782) into two separate rule blocks
- Split `.wp-block-separator, .separator-block` group (around line ~512) into two separate rule blocks

## `_type-palette.scss` — per-context heading rules

- Evaluate whether `.wp-block-heading:is(h2), .wp-block-html > h2, .content-flow > h2` should be separated into three rule blocks (one per context: Gutenberg, raw HTML output, content-flow). These three selectors represent different rendering contexts. If any context needs independent adjustment in the future, they should be independently expressible.
- Same evaluation for h3 and h4 grouped rules
- Note: this may be a lower-priority refactor than the editor/frontend context-role files since these are already scoped by element type

## `_structural-relations.scss` — scoping review

- Audit all `.wp-block-*` rules in `_structural-relations.scss` that appear without `.content-flow` or `.editor-styles-wrapper` scoping
- For each unscoped rule, decide: does it belong in `_structural-relations.scss` (content-flow context), in `_wp-editor.scss` (editor context), or is it truly global? Add explicit scoping accordingly.

# Ready for human QA

# Done
