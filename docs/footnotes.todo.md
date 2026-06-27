# Footnotes Spike — To Do

## Status: 🟡 Active — Phase 2 complete, Phase 3 (sidenote layout) next

See `docs/footnotes.md` for architecture decisions and data flow.

---

## Phase 1: Discovery

### 1. CMS verification

- [ ] Open the WP block editor and confirm the Footnotes toolbar button is present and functional
- [ ] Write a test post with footnotes: plain text, a link, an image inside a footnote
- [ ] Verify the WP editor saves and renders footnotes correctly in both the editor preview and the WordPress frontend

### 2. GraphQL / content-blocks audit ✓

- [x] `wp-graphql-content-blocks` does NOT expose `core/footnotes` structurally — no `CoreFootnotes.php` in the plugin. Falls through to the generic block handler.
- [x] The block arrives with `renderedHtml` containing the WP-rendered `<ol class="wp-block-footnotes">`. UUIDs in `<li id="fn-{uuid}">` are the join key.
- [x] `<sup data-fn="{uuid}">` markers survive in paragraph `renderedHtml` and come through `v-html` in `ParagraphBlock.vue` intact.

---

## Phase 2: Core Implementation

### 3. Footnote data composable ✓

- [x] `usePostFootnotes(blocks)` in `composables/usePostFootnotes.ts`
  - Accepts the full block list as a readonly Ref; finds `core/footnotes` block and parses its `renderedHtml`
  - Parses each `<li id="fn-{uuid}">` to build `FootnoteMap: { [uuid]: { number, contentHtml } }`
  - Strips back-link anchors from content HTML; preserves rich content (images, links)
  - `provide`s the map via `FOOTNOTE_MAP_KEY` injection key
  - `useFootnoteMap()` helper for consumers
  - Wired up in `writing/[slug].vue` and `case-studies/[slug].vue`

### 4. Paragraph renderer ✓

- [x] `ParagraphBlock.vue` uses `useFootnoteMap()` to inject the map
- [x] `hasFootnotes` computed: skips click handling when no map or no `data-fn` in HTML
- [x] `@click.capture` on the `<p>` intercepts clicks on `sup[data-fn]`, prevents hash navigation, toggles `openNoteId`
- [x] `FootnoteInNote` rendered as sibling below the `<p>` when a note is open

### 5. Footnote marker styling ✓

- [x] `p :deep(sup[data-fn] a)` — mono bordered superscript label; fills blue on hover/focus
- [x] `aria-expanded` / `aria-controls`: deferred to Phase 4 QA pass (currently native `<a>` in `v-html`)

### 6. FootnoteInNote component ✓

- [x] `components/content/footnotes/FootnoteInNote.vue`
  - Blue left border, soft background, mono "Note N" label, close button
  - `role="note"`, focus moved to close button on mount
  - Slide-in animation (opacity + translateY); respects `prefers-reduced-motion`
  - Supports rich content via `v-html` (images, links styled with `rich-link` mixin)
  - Stays open until explicitly closed (close button click)

### 7. FootnotesBlock component ✓

- [x] `components/content/blocks/FootnotesBlock.vue`
  - Parses `renderedHtml` to extract `<ol>` inner HTML; renders as `<footer class="footnotes-block">`
  - "Notes" label in mono blue; styled list; back-links de-emphasised
  - Rich content support (images); `rich-link` mixin on all anchors
  - Registered as `core/footnotes` in `block-components.ts`

---

## Phase 3: Sidenote Layout (Desktop)

### 8. Layout composable

- [ ] Write `useFootnoteLayout` composable
  - Post-render (runs in `onMounted` + `nextTick`)
  - Builds collision map: wide blocks, full-width blocks, floated elements (by bounding rect)
  - Solves sidenote Y positions top-to-bottom (ideal = marker Y, push down if collision)
  - Marks notes that can't be placed within threshold (currently 50vh — tunable via MAX_DISPLACEMENT_VH in useSidenoteLayout.ts) as in-note fallback
  - Writes resolved positions to sidenote elements (inline style or CSS custom properties)
  - Re-runs on resize (debounced ~200ms)

### 9. FootnoteSidenote component

- [ ] `FootnoteSidenote.vue` — the right-margin sidenote
  - Positioned absolutely by `useFootnoteLayout`
  - Fixed column width (tune with content; likely `14–18rem`)
  - Capped max-height; overflow fades to "see more" trigger
  - "See more" expands to full height; only one note fully expanded at a time (opening a second collapses the prior)
  - Supports rich content (images, links)
  - Hidden on narrow viewports (breakpoint-gated; in-note takes over)

### 10. Article layout column

- [ ] Add sidenote column to the article/prose layout
  - Two-column grid: `[prose] [sidenote-gutter]`
  - Sidenote column only active at wide enough viewport (where it doesn't crowd prose)
  - Wide and full-width blocks must span both columns (or collapse sidenote column in that row)
  - Leave right-margin clearance for eventual floating ToC (future spike); sidenote column should not claim the far-right edge

---

## Phase 4: Polish and Edge Cases

### 11. Compositional block detection

- [ ] Audit which block types should force in-note fallback (Media+Text, wide/full tables, multi-column, pullquotes)
- [ ] Flag these blocks in the renderer so their descendant paragraph transformations know to emit in-notes regardless of viewport

### 12. Mobile interaction decision

- [ ] Decide between in-note toggle and bottom sheet for mobile (see `docs/footnotes.md` — "Mobile: in-note vs. bottom sheet")
  - In-note: no extra component, consistent with desktop fallback, displaces text
  - Bottom sheet: richer feel, better for images/links, requires a sheet/overlay component
  - Test both on real devices during QA before committing
- [ ] If bottom sheet: implement `FootnoteBottomSheet.vue` (slide-up sheet, overlay dismiss, Escape to close)

### 13. Reduced-motion

- [ ] `@media (prefers-reduced-motion: reduce)`: disable in-note expand animation and bottom-sheet slide; note appears/disappears immediately

### 13. Print stylesheet

- [ ] Sidenotes and in-notes collapse/hide on print; canonical list is the print representation
- [ ] Verify `@media print` handles this without special JS

### 14. QA

- [ ] Test post with: plain text footnotes, footnote with a link, footnote with an image
- [ ] Test at phone / tablet / desktop widths
- [ ] Test with wide block immediately before/after a footnoted paragraph
- [ ] Test with a floated image near a footnoted paragraph
- [ ] Test with footnote inside a Media+Text block (should fall back to in-note)
- [ ] Test keyboard navigation: Tab to marker, Enter/Space to open, Escape to close
- [ ] Test with screen reader (VoiceOver or NVDA); canonical list must be accessible
- [ ] Test with JS disabled: verify canonical list renders, no broken UI

---

## Done

_(empty — spike just opened)_
