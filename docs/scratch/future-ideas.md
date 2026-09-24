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

## Direct static-site manipulation and prototyping workflow
Captured 2026-09-23 from the user's reflection on the halftone experiments and the subsequent architecture discussion. The question concerns the performance of the **final CDN-delivered site for visitors**, not local authoring or build time. The user likes components, SCSS and a build pipeline and prefers to make the current WordPress/Nuxt/static-delivery stack work if possible. Direct editing of static files, a smaller generator, a framework-free runtime, Web Components or an Astro-style islands architecture remain possibilities to investigate only if a measured, feature-equivalent comparison justifies them. This is not an architecture decision or migration task.

Clarification from source inspection: S55 is **not buildless**. It serves a frozen, compiled Nuxt S48 static artifact, with an injected WebGL renderer, diagnostic media mapping and a separate redraw loop. The current application has the original S55 shader fragment restored in a disabled experimental port, but that port still lacks working static-compatible image loading and coherent renderer ownership/readiness. The prototype's subjective smoothness is evidence that its renderer and surrounding conditions merit study; it does not show that removing Vite, Vue or Nuxt caused the improvement. Earlier conversation suggested reduced framework work as one possible explanation, but no matched measurement establishes that.

Keep these dimensions separate: source organization (HTML, templates, components), build transformations (Sass, static generation, bundling), delivery (prebuilt HTML/CDN versus request-time server), content timing (CMS at publish time versus browser/server fetch), browser runtime (none, small modules, Web Components, hydrated framework), navigation/transition ownership (document loads, client router, standalone controller) and media rendering/scheduling (CSS, Canvas2D, WebGL). A static CDN build can still hydrate Vue in the visitor's browser. A buildless page can still execute expensive JavaScript. The question is which delivered runtime performs the **same** art-directed job with less browser work.

Current working hypothesis to test first: integrate the S55 renderer, its image preparation and its redraw ownership cleanly into the existing generated site, preserving the accepted slit/star exits and full route morph. Distinguish transition choreography scheduling (preflight, clone ownership, paint and destination handoff) from renderer scheduling (which changing surface wakes a draw, when it can sleep, and who owns cleanup). Both types already exist in source; copied code does not prove that their interface is complete. The S55 prototype itself misses continued-hover invalidation and still shows a click snap, so it is a useful control and a source of repair candidates, not a final answer.

A future architecture comparison must hold functionality and conditions constant: same CMS content and original media, fixed 11 CSS-pixel live dots on card/flight/landed hero (and echoes if used), parallax over both hover zones, continuous click and reverse transitions with changing crop/corners, accepted slit/star exits, responsive behavior, reduced motion, failure fallback and accessibility. Compare first load, total shipped/executed JavaScript, interaction latency, displayed frame pacing, GPU/CPU cost and memory under matched viewport/DPR/cache conditions. Build time can be recorded separately but is not the visitor-performance criterion. Astro islands and selectively hydrated or script-free Nuxt are possible ways to author a smaller runtime; either would still need an explicit transition controller if the present continuity crosses a document boundary. A framework switch has no presumed performance benefit without this comparison.

Prototype method to revisit: give each candidate an immutable baseline artifact, source revision and dirty-diff record, a named change, an exact served URL, media mapping, checksums, matched test conditions, explicit differences from the current application and a stated next integration boundary. Keep a frozen control. Use small end-to-end current-source integrations early enough to expose CMS/static-delivery and ownership problems, while preserving useful prototype divergences as measured hypotheses. Record source verification, automated timing, actual displayed behavior and user acceptance separately. Explore a shared renderer core with thin adapters or a reproducible artifact-patching process; neither is mandated yet. Current repair work remains in the [strobe handoff](../active-spikes/performance-optimization.strobe-handoff.md#continuation-contract--2026-09-23) and [interaction spike](../archive/interaction-polish.md).
