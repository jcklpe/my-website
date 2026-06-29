# Future Ideas

Exploratory or retired ideas that don't belong on the active roadmap. Kept here for reference rather than discarded entirely.

* **Password-protected case studies** — considered, decided against; revisit only if a specific client confidentiality need arises
* **Parallax mouse effects on cards** — was in the Jackalope theme; felt too extreme for the current direction; may revisit if the generative design work suggests a lighter-touch version
* **Content strategy discussion** — too vague to act on; deferred until the site has real content and a clearer audience in mind
* Table of contents on posts/case studies

## Nested footnotes (hypertext literature mode)

**Concept:** Footnotes whose content itself contains footnote markers — Terry Pratchett / House of Leaves style. Footnote 1 contains a `^2` which expands to another note, which might contain `^3`, etc. Cycles are the point (A→B→A), not a bug.

**WordPress barrier:** The native `core/footnotes` block stores a flat `{ uuid → contentHtml }` map. The WP block editor has no UI for entering a footnote *inside* footnote text — you'd need a custom block or a shortcode like `[fn]...[/fn]` that the note renderer parses recursively.

**Rendering approach:** 
- Depth-1 notes: normal sidenote/in-note behavior per existing rules.
- Depth-2+ notes: always in-note only (never margin sidenote) — rendered recursively inside the parent note's `FootnoteInNote` or `FootnoteSidenote` content div. Different visual treatment: slightly smaller font, indented left border, different border color.
- Cycle detection via a `seen: Set<uuid>` passed down the render tree; depth cap at 3–4 levels.

**Effort:** ~3–5 days. The Vue rendering side is tractable. The hard part is the WP authoring UX — the editor would need a way to insert a nested marker inside footnote text, which isn't supported natively.

**Why it's worth thinking about:** It's a genuinely distinctive capability for hypertext-style writing. Most CMSes can't do this at all.

## Now Page

A `/now` page (à la nownownow.com convention) showing what's currently being worked on, read, or thinking about. Could be a standalone page or integrated with the About page. Low-stakes content that keeps the site feeling alive without requiring big posts.

## Sketchfab Embeds

The site should eventually support Sketchfab 3D model embeds in articles and case studies. Sketchfab provides an iframe-based embed. Medium priority — only relevant once 3D work appears in the content.
