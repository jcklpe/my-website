# WordPress Editor Polish To-Do

## Background

This spike came from the `misc0` routing process. The user noticed two
editor-side authoring issues:

- inline code in the CMS editor does not stand out enough
- links inside footnotes in the CMS editor do not clearly read as links

This is not a frontend redesign. The frontend inline-code and footnote systems
already have their own behavior. The goal here is to make the WordPress editor a
better predictive authoring surface.

## Project Organization

- Conceptual doc: `docs/editor-polish.md`
- Operational doc: `docs/editor-polish.todo.md`
- Sass source: `packages/styles/context-role/_wp-editor.scss`
- Shared inline-code recipe: `packages/styles/shared-components/_code-block.scss`
- Shared link recipe: `packages/styles/shared-components/_link.scss`
- Generated editor stylesheet:
  `apps/cms/wp-content/themes/my-website-editor-theme/editor.css`

The generated `editor.css` is committed because WordPress loads CSS directly.
Do not edit it by hand. Regenerate it through `corepack pnpm styles:wp-editor`
or `corepack pnpm check`.

## General Principles

- Prefer editor usefulness over exact frontend parity.
- Reuse shared-component recipes where they express the same visual language.
- Keep editor-only selector wiring in `_wp-editor.scss`.
- Avoid styling that makes authored rich text look selected, disabled, or like
  UI chrome.
- Preserve the user's nuance from `misc0`; do not compress "inline code is hard
  to spot" into an unrelated broad editor-theme cleanup.

## Current State Overview

- `_wp-editor.scss` already imports many shared block recipes and applies them
  to Gutenberg/editor selectors.
- Paragraph links already use shared rich-link styling through
  `paragraph-block.paragraph-links`.
- Inline code styling exists as `code-block.inline-code-styles`, but the editor
  does not consistently apply it to rich-text inline code.
- Footnote links need explicit editor coverage because core footnotes have their
  own block/list markup.

## To Do

- [x] Promote `docs/scratch/editor-polish.md` to active
  `docs/editor-polish.md`.
- [x] Create this companion todo doc with the full spike structure.
- [x] Inspect existing editor/shared style hooks.
- [x] Apply shared inline-code styling to editor rich-text inline code.
- [x] Apply shared rich-link styling to editor footnote links.
- [x] Run `corepack pnpm check`.

## Ready For Human QA

- [x] In the WordPress editor, confirm inline code is visibly code-like in
  paragraph/list/heading/table/quote-style rich text without feeling like a
  selected text badge.
- [x] In the WordPress editor, confirm links inside core footnotes visibly read
  as links and have the normal hover/focus underline behavior.

## Done

- Promoted the spike out of `docs/scratch/`.
- Added a companion todo doc following the project spike structure.
- Added editor-scoped inline-code theme variables and applied the shared
  `code-block.inline-code-styles` recipe to rich-text editor code.
- Added editor footnote link styling through shared `rich-link` /
  `rich-link-hover` mixins.
- Ran `corepack pnpm check`; it passed with the existing `vue/no-v-html`
  warnings in `apps/frontend/pages/about.vue` and
  `apps/frontend/pages/now.vue`.
- Human QA passed on 2026-06-30. The CMS editor inline code and footnote link
  treatments look good to the user.
