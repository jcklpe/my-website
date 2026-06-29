# Footnotes Spike — To Do

## Status: ✅ Complete

See `docs/archive/footnotes.md` for architecture decisions, implementation notes, and data flow.

---

## Phase 1: Discovery ✅

- [x] CMS verification — native WP core/footnotes block confirmed working
- [x] GraphQL / content-blocks audit — core/footnotes not exposed structurally; falls through to renderedHtml with `<ol class="wp-block-footnotes">`; `<sup data-fn>` markers survive in paragraph renderedHtml

---

## Phase 2: Core Implementation ✅

- [x] `usePostFootnotes(blocks)` composable — builds FootnoteMap { uuid → { number, contentHtml } }; strips back-link anchors; provides via FOOTNOTE_MAP_KEY injection
- [x] `ParagraphBlock.vue` — click.capture intercepts sup[data-fn] clicks; splits paragraph HTML at marker; renders FootnoteInNote between text fragments
- [x] Footnote marker styling — mono bordered superscript; fills blue on hover/open; × when open; 48px tap target
- [x] `FootnoteInNote.vue` — blue left border, cream background, enter/leave animations, resize collapse via matchMedia listener, Escape to close
- [x] `FootnotesBlock.vue` — `<details>` endnotes list; opens via window.beforeprint for print

---

## Phase 3: Sidenote Layout (Desktop) ✅

- [x] `useSidenoteLayout.ts` — two-pass collision-aware layout; obstacle detection; truncation detection; hasExpandedUpstream flag; document.fonts.ready timing
- [x] `useSidenoteExpanded.ts` — module-level singleton expanded state
- [x] `FootnoteSidenote.vue` — right-margin sidenote; positioned by layout; "more ↓/less ↑" with arrow-slip hover animation; sidenote ref click pulses body marker
- [x] Article layout — existing content-flow grid extended with right margin column; `@media screen and (max-width: 1199px)` gates sidenote visibility

---

## Phase 4: Polish ✅

- [x] Bottom sheet for mobile — `FootnoteBottomSheet.vue` with scrim overlay; z-index above nav (--z-highest + 1)
- [x] Overflow/compositional fallback — in-note on desktop when sidenote is overflow-displaced
- [x] Reduced motion — all animations respect prefers-reduced-motion: reduce
- [x] Print stylesheet — sidenotes hidden; endnotes opened via beforeprint; nav/footer hidden; floated images re-enabled; image height capped at 40vh in endnotes
- [x] Resize bug — open in-note collapses immediately when viewport widens to desktop
- [x] startClose() delay mechanism — 160ms leave animation plays before component unmounts

---

## Done ✅

All phases complete.
