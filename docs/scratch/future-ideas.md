# Future Ideas
Conceptual someday material that is not ready for active spike work. Kept here for reference rather than discarded entirely.

* **Password-protected case studies** — considered, decided against; revisit only if a specific client confidentiality need arises
* **Parallax mouse effects on cards** — was in the Jackalope theme; felt too extreme for the current direction; may revisit if the generative design work suggests a lighter-touch version
* Table of contents on posts/case studies

## Flocking Behavior Animations
Concept: Explore flocking or swarm-like behavior animations as a possible future motion language for the site.

Why it may matter: Flocking could provide lively ambient motion with an organic, art-directed quality.

Current blockers or reasons not now: No active surface currently requires it, so this should remain exploratory rather than becoming part of the current animation work.

## Colophon Page
Concept: Consider adding a colophon page documenting the site's design, technology, type, imagery, and making process.

Why it may matter: A colophon could provide a natural home for authorship, tools, credits, and process details.

Current blockers or reasons not now: Its content, scope, and relationship to the About page are not yet defined well enough for an active spike.

* **Custom mouse icons — completed:** accepted and implemented in the archived animation spike; not future work.

## Wide Wrap Passage / Custom Group Style
**Concept:** A custom Gutenberg Group block style for an art-directed passage where the image and nearby prose share a wider-than-default local frame, while the text still wraps around a floated image. This is distinct from a two-column/media-text layout: the prose remains one flowing text body rather than becoming a fixed text column beside an image column.

Possible editor-facing style name: **Wide Wrap Passage**.

Representative structure:

```html
<!-- wp:group {"align":"wide","className":"is-style-wide-wrap-passage"} -->
<div class="wp-block-group alignwide is-style-wide-wrap-passage">
  <!-- wp:image {"align":"left"} /-->
  <!-- wp:paragraph /-->
  <!-- wp:paragraph /-->
</div>
<!-- /wp:group -->
```

Desired behavior:

- The group uses the wide content track.
- A floated image inside the group can be larger than a normal article-column float.
- Paragraph text still wraps around the image and can flow below it.
- The CMS editor should approximate the public layout well enough for authoring confidence.
- Normal image resizing should not trigger this automatically. Widening the whole prose/image context is a separate editorial layout decision.

This may be a future custom Group block style or block variation. It is not part of the current image-resizing spike.

## Nested footnotes (hypertext literature mode)
**Concept:** Footnotes whose content itself contains footnote markers — Terry Pratchett / House of Leaves style. Footnote 1 contains a `^2` which expands to another note, which might contain `^3`, etc. Cycles are the point (A→B→A), not a bug.

**WordPress barrier:** The native `core/footnotes` block stores a flat `{ uuid → contentHtml }` map. The WP block editor has no UI for entering a footnote *inside* footnote text — you'd need a custom block or a shortcode like `[fn]...[/fn]` that the note renderer parses recursively.

**Rendering approach:**
- Depth-1 notes: normal sidenote/in-note behavior per existing rules.
- Depth-2+ notes: always in-note only (never margin sidenote) — rendered recursively inside the parent note's `FootnoteInNote` or `FootnoteSidenote` content div. Different visual treatment: slightly smaller font, indented left border, different border color.
- Cycle detection via a `seen: Set<uuid>` passed down the render tree; depth cap at 3–4 levels.

**Effort:** ~3–5 days. The Vue rendering side is tractable. The hard part is the WP authoring UX — the editor would need a way to insert a nested marker inside footnote text, which isn't supported natively.

**Why it's worth thinking about:** It's a genuinely distinctive capability for hypertext-style writing. Most CMSes can't do this at all.
