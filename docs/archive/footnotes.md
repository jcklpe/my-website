# Footnotes Spike

## Goal

Add rich footnote support to writing posts and case studies using native WordPress core footnotes (WP 6.3+, no plugin). The frontend renders a progressive, context-aware interaction: sidenotes in the right margin on desktop, an expanding in-note toggle on mobile and as fallback, with the canonical `<ol>` list always present at the bottom for accessibility, print, and screen readers.

This replaces the Academic Blogger's Toolkit approach used on prior portfolio sites (`temp-ref-assets/Jackalope/`, `temp-ref-assets/desert-jackalope/`) — ABT's tooltip-only interaction was JS-dependent and broke in headless/static contexts.

See `temp-ref-assets/footnote-demo.html` for a visual reference of the interaction patterns explored during design discussion.

---

## Architecture Decisions

### Source of truth: native WP core footnotes

No plugin. Authors write footnotes using the native Footnotes toolbar button in the block editor (available since WP 6.3). WordPress manages:
- Inline markers: `<sup data-fn="uuid" class="fn"><a href="#fn-uuid" id="fnref-uuid">1</a></sup>` embedded inside paragraph HTML
- A `core/footnotes` block at the end of the post: `<ol class="wp-block-footnotes"><li id="fn-uuid">…content…<a href="#fnref-uuid">↩︎</a></li></ol>`

Footnote content supports rich blocks — images, links, inline formatting. Authors can add images but placement in the editor is slightly awkward; that's acceptable friction.

### Fallback stack (evaluated in order)

1. **Sidenote** — prose paragraph in body context, right margin available, note can be placed within proximity threshold of its marker → renders as a right-margin sidenote
2. **In-note toggle** — margin blocked (wide/full block in collision range, repositioning exhausted), or footnote is inside a compositional block → renders as an expanding inline toggle
3. **Canonical list** — always rendered at the bottom of the article, always visible; the no-JS, print, and screen-reader baseline

Conditions 1 and 2 are progressive enhancement on top of condition 3.

### Sidenote placement

A post-render layout composable (`useFootnoteLayout`) runs after `nextTick` and resolves sidenote positions:

1. Build a footnote content map `{ uuid → content }` from the `core/footnotes` block data
2. Measure each `<sup data-fn>` marker's Y position (getBoundingClientRect, scroll-adjusted)
3. Build a collision map: vertical spans of all wide/full-width blocks, all floated elements
4. Solve placement top-to-bottom: ideal position = marker Y; push down if collision with prior note or blocked region
5. If a note cannot be placed within ~75vh of its marker, mark it for in-note fallback
6. Write resolved positions as inline styles or CSS custom properties on each sidenote element

Sidenote layout re-runs on viewport resize (debounced).

### Sidenote sizing and "see more"

Sidenotes have a capped max-height (short, predictable). If content overflows, a "see more" control expands the note to full height. Only one note can be fully expanded at a time — opening a second collapses the first.

### In-note expansion model

The in-note does not inject content inline into the paragraph body. It opens a full-width block *between* the text segments on either side of the marker, visually separating them — a full expanding line break, not a mid-sentence insertion. Implementation: the paragraph renderer splits paragraph HTML at each `<sup data-fn>` marker and inserts the toggle mechanism between the two text fragments. A `display: block` span inside the `<p>` breaks the inline formatting context, creating the gap.

The in-note stays open until explicitly closed (click/tap the marker again). This is intentional: notes may contain images or links, so a hover-dismiss tooltip is not appropriate.

### Mobile: in-note vs. bottom sheet

Two viable options for mobile, not yet decided:

- **In-note toggle (default assumption)**: same pattern as desktop fallback — marker opens/closes a full-width block in the reading flow. Consistent behavior across all contexts; no additional component needed.
- **Bottom sheet**: tapping a marker slides up a sheet from the bottom of the viewport containing the note content. Spatially separate from the reading flow (doesn't displace text), has more room for rich content, and feels native-app-ish. Requires an additional modal/sheet component and an overlay. Particularly good for rich notes (images, links) where injecting content into the paragraph would be jarring.

Either can be the implementation; resolve during Phase 3 QA when both can be tested on real devices. The canonical `<ol>` list at the bottom remains the baseline regardless.

### Compositional block fallback

Footnote markers inside the following block types always fall back to in-note, regardless of viewport:
- Media+Text blocks (already two-column; no margin available)
- Wide and full-width tables
- Multi-column blocks
- Pullquotes / blockquotes (ambiguous margin ownership)

Standard body paragraphs — including paragraphs inside constrained-width Group blocks — are eligible for sidenotes.

### Left margin / dual-margin

Deferred. A floating table of contents is planned for the left side in a future spike; the left margin is reserved for it. All sidenotes use the right margin only.

---

## Data Flow

```
WP GraphQL
  └── core/footnotes block
        ├── structural (wp-graphql-content-blocks exposes it) → structured UUID/content pairs
        └── HTML fallback → parse <ol class="wp-block-footnotes"> to build UUID map
  └── core/paragraph blocks
        └── HTML content containing <sup data-fn="uuid"> markers

Vue rendering
  └── usePostFootnotes(footnotesBlockData)
        └── builds { uuid → { content, number } } map
        └── provides to child renderers via inject/provide

ParagraphBlock.vue
  └── detects <sup data-fn> in HTML
  └── splits HTML at each marker
  └── inserts FootnoteMarker.vue (toggle trigger) + FootnoteInNote.vue (collapsible block)

FootnotesBlock.vue
  └── renders canonical <ol> list at bottom
  └── always visible (baseline)

useFootnoteLayout (composable)
  └── runs post-render (onMounted + nextTick)
  └── resolves sidenote positions
  └── marks overflow notes as in-note fallback
  └── re-runs on resize (debounced)

FootnoteSidenote.vue
  └── positioned by useFootnoteLayout
  └── max-height cap + see-more expand
  └── collapses when another note opens to full
```

---

## Open Questions to Resolve During Spike

- Does `wp-graphql-content-blocks` expose `core/footnotes` structurally, or does it fall through to HTML? (Determine at spike start — affects the data extraction path.)
- Exact proximity threshold for sidenote→in-note fallback (75vh is the starting heuristic; tune with real content).
- Does the WP GraphQL schema expose the footnote UUIDs inside paragraph content, or does the inline `<sup data-fn>` come through in the rendered paragraph HTML? (Likely the latter — verify.)
- "See more" trigger: text label, `+` button, or gradient fade with click-to-expand?
- Sidenote max-height value — needs to feel consistent with the type scale and sidenote column width.
- Print stylesheet: sidenotes and in-notes should collapse to the canonical list on print; verify CSS `@media print` handles this without special handling.
- Floating ToC: no implementation yet, but sidenote column must leave clearance for it when it arrives.

---

## References

- `temp-ref-assets/footnote-demo.html` — annotation pattern demo with 5 interaction patterns
- `https://edwardtufte.github.io/tufte-css/` — Tufte CSS sidenote reference
- `https://gwern.net/sidenote` — in-depth comparison of sidenote approaches
- `docs/scratch/footnotes.md` — early scratch notes (superseded by this doc)

---

## What Was Built

### Mobile decision

Bottom sheet (FootnoteBottomSheet.vue) was chosen for mobile — the in-note/toggle approach was kept as the desktop overflow fallback only, not for primary mobile use. Bottom sheet uses Teleport to body, has a scrim overlay at z-index above the nav (--z-highest + 1 = 1001), sheet at 1002.

### Component inventory

- `FootnoteSidenote.vue` — right-margin sidenote, positioned by useSidenoteLayout, truncation with "more ↓/less ↑" button using arrow-slip animation
- `FootnoteInNote.vue` — inline expanding block between text fragments; used on desktop when sidenote is overflow-displaced, and as the desktop fallback for overflow notes
- `FootnoteBottomSheet.vue` — mobile bottom sheet with scrim overlay; Teleport to body
- `FootnotesBlock.vue` — canonical `<details>` endnotes list at bottom; uses window.beforeprint to open the details element for print
- `useSidenoteLayout.ts` — collision-aware layout composable; GAP=8px, MAX_DISPLACEMENT_VH=0.75; two-pass (pass 1 measures, pass 2 re-runs after Vue renders "more" buttons); obstacle detection for .alignright/.alignwide/.alignfull; `truncatedSidenoteUuids` ref shared between layout and FootnoteSidenote
- `useSidenoteExpanded.ts` — module-level singleton for expand state; ensures only one note is expanded at a time; calls scheduleSidenoteLayout() on toggle

### Key technical decisions made during implementation

- `@media screen and (max-width: 1199px) { display: none }` (not `@media (max-width: 1199px)`) — scoping to `screen` prevents the hide rule from applying during print
- `startClose()` delay mechanism — keeps `openNoteId` set for 160ms after close is requested so the FootnoteInNote leave animation can play before the component unmounts
- `window.matchMedia('(min-width: 1200px)').addEventListener('change')` in onMounted — collapses open in-note immediately when viewport widens to desktop without needing a leave animation (element is already CSS-hidden at that width)
- document.fonts.ready wait before layout pass — prevents underestimated sidenote heights when custom fonts haven't loaded yet
- `hasExpandedUpstream` flag — downstream sidenotes skip overflow check when a note above is expanded, letting them displace downward rather than vanish
- Vue scoped CSS keyframe caveat: `@keyframes` in scoped styles get a hash suffix (e.g., `in-note-enter-8958e56a`); `<Transition>` CSS class names do NOT get scoped — use global styles or `:deep()` for transition classes

### Print decisions

- Sidenotes: hidden on print (`@media print { .footnote-sidenote { display: none; } }`). JS-computed absolute positions don't translate to print dimensions; attempting print sidenotes produced layout collisions.
- Endnotes: opened via `window.beforeprint` / `window.afterprint` on the `<details>` element. Chrome UA stylesheet uses `!important` on closed `<details>` content so CSS alone cannot force it open; JS is required.
- Nav/footer: hidden on print. Footer's `.inner` (heading + nav links) is hidden; `.base` (copyright line) stays visible.
- Floated images: `@media print` block in `_image-block.scss` re-enables float with simple margins (no negative breakout offsets) since the print viewport triggers the tablet-down breakpoint that disables floats.

### Open questions resolved

- Mobile: bottom sheet chosen over in-note toggle for mobile
- See-more trigger: text label "more ↓" with arrow-slip animation on hover
- Print: sidenotes hidden, endnotes opened via beforeprint, nav/footer hidden
- Proximity threshold: 75vh MAX_DISPLACEMENT_VH worked well with real content
- Floating ToC (left margin): still reserved; sidenotes use right margin only
