# WordPress Editor Polish

Active spike for CMS/editor-side readability and authoring-quality issues.

The goal is not perfect frontend parity. The editor should be predictive enough
that authored content is comfortable to write, scan, and QA before checking the
public frontend.

This spike is deliberately small. It covers editor polish that affects the
authoring surface without changing public frontend rendering.

## Current Context

The WordPress editor uses the generated stylesheet at
`apps/cms/wp-content/themes/my-website-editor-theme/editor.css`, sourced from
`packages/styles/context-role/_wp-editor.scss`.

Frontend block recipes are the source of truth for public rendering, but editor
CSS should adapt the same visual language where it helps authoring clarity:
typography, captions, links, inline code, block frames, alignment previews, and
other cues that make CMS content legible while editing.

## Scope

This spike is about the WordPress editor experience only:

- make inline code easier to spot while editing
- make links inside footnotes visibly read as links while editing
- keep the editor calm and useful rather than chasing exact frontend parity

Out of scope:

- changing frontend inline code, footnote, or sidenote behavior
- redesigning the editor canvas
- trying to make every editor block visually identical to the frontend

## Items From Misc0

### Inline Code Visibility

Inline code on the CMS side needs to be more visible. Right now inline code text
in the editor does not read strongly enough as code; it can look too much like
ordinary body copy.

Desired direction:

- Match the frontend inline-code intent closely enough that authors can spot
  inline code while editing.
- Keep it readable against the editor's cream ground.
- Avoid making inline code look like a button or selected text.
- Prefer using the shared code/inline-code recipe path where possible, so future
  inline code styling changes are not duplicated between CMS and frontend.

Likely files:

- `packages/styles/context-role/_wp-editor.scss`
- `packages/styles/shared-components/_code-block.scss`
- `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` (generated)

Implementation model:

- Use the shared `code-block.inline-code-styles` mixin so the editor does not
  invent a separate inline-code visual language.
- Define editor-scoped inline-code color variables because the editor does not
  have the frontend code theme selector state.
- Default to the Midnight-style blue treatment, which is visible on the cream
  editor ground and consistent with the current frontend code default.

### Footnote Link Styling In The Editor

Links inside footnotes on the CMS side need to be styled so they are visibly
links. They should follow the same general link language as paragraph text, not
read as unstyled footnote prose.

Preserve the nuance:

- This is specifically about the CMS/editor authoring experience.
- The user needs to be able to tell, while editing, that a footnote contains a
  link.
- It should feel like normal rich text link styling rather than a special
  footnote-only invention.

Likely files:

- `packages/styles/context-role/_wp-editor.scss`
- Footnote-related editor selectors emitted by WordPress, to inspect in the CMS
- Shared link mixin, if available for editor context

Implementation model:

- Target WordPress core footnote markup using `.wp-block-footnotes` and the
  editor block wrapper selector `[data-type='core/footnotes']`.
- Use the shared rich-link mixins so footnote links feel like ordinary authored
  links, not a one-off footnote style.

## Verification

Run:

- `corepack pnpm check`

Human QA should happen in the WordPress editor on posts/pages that contain
inline code and core footnotes with links.

## Human QA

- Inline code should be easy to spot in CMS body content.
- Footnote links should visibly read as links in the editor.
- The editor should remain calm and authorable, not over-styled.
