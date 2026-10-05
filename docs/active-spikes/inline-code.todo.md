# Inline Code Highlighting — Tasks
## Background
Inline code currently has the shared CRT surface but one foreground color. Reuse code-block token colors with Enzo as the implicit default and optional snippet overrides.
## General Principles
- Allow fragments without parsing or language guessing.
- Preserve readable code text, semantic markup, and the existing theme/inline shell.
- Generate all theme colors before delivery; avoid browser recoloring work beyond CSS.
- Preserve native Inline Code authoring and provide a plain-text escape hatch.
## Current State Overview
Implemented and checked on 2026-10-05. The existing Enzo article contains 103 generated inline snippets; token colors follow all three code themes, with unchanged text and no horizontal overflow at 1512px and 390px. Native WordPress Inline Code remains the authoring format, with a language control under the rich-text More menu. The preview runs at `http://127.0.0.1:3078/writing/design-principles-for-enzo-a4f9af10cd03`. Production was not published.
## To Do
None.
## Ready For Human QA
- Generate inline token spans during CMS content normalization, sharing existing grammars/themes and preserving non-code HTML and preformatted blocks. — Implemented via a lazily imported HTML parser and the existing Shiki grammars/themes. Review inline colors, especially Mutation and References in the Enzo article, and switch a desktop code block’s theme dots. The existing inline surface and typography remain in place.
- Add a WordPress per-snippet language/plain-text override to native Inline Code. — Implemented in `my-website-blocks/inline-code.js`. Place the cursor in a snippet, then use **More → Inline code language → Apply**. Review the control’s authoring feel; native toggling remains available. A QA-only draft is available at `http://qa.cms.my-website.localhost/wp-admin/post.php?post=293&action=edit`.
## Done
- Verify source checks, generated content, themes, fragments/escaping, editor persistence, and phone layout; provide a local preview. — `corepack pnpm check`, targeted Prettier, JavaScript syntax, PHP lint, public-CMS preview generation, and matching preview inspection pass. The two existing About/Now `v-html` lint warnings remain. Utility checks cover fragments, entities/Unicode/whitespace, escaped markup, lists/captions, idempotence, plain/unknown languages, nested formatting/comments, malformed tags, and `<pre>` exclusion. Chrome checks verify every inline token’s theme color and text stability at desktop/phone widths. The actual WordPress menu applies a caret selection to the whole snippet, removes the override when reset to Enzo, and preserves attributes through save/reload. Evidence is under ignored `temp-ref-assets/inline-code/2026-10-05/`; the verified static artifact serves port 3078.
- Document the inline-code contract and authoring control. — Updated `docs/design-system.md`, README’s current theme/authoring overview, and the agent rendering contract. No language guessing, article-wide setting, editor tokenizer, or production publish was introduced.
