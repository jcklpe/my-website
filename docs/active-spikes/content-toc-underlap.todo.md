# Content, TOC, and Underlap To-Do
## Background
Promoted 2026-07-30 from `docs/scratch/content-toc-underlap.md` after a limited misc-inbox routing pass. Conceptual doc: [content-toc-underlap.md](content-toc-underlap.md). The spike groups detail-content regressions connected to the desktop article TOC, the cream `underlap-matte` treatment introduced to quiet content crossing the TOC rail, and contexts where that treatment is inappropriate.

## Project Organization
- Conceptual doc: `docs/active-spikes/content-toc-underlap.md`
- Operational doc: `docs/active-spikes/content-toc-underlap.todo.md`
- Promoted scratch source: `docs/scratch/content-toc-underlap.md` (deleted during promotion)
- Related durable docs: `AGENTS.md` → Gutenberg rendering rules; `docs/design-system.md` → editorial content rendering; `docs/visual-design.md` → article-body and TOC surface notes
- Historical context: `docs/archive/table-of-contents.md` / `.todo.md`, `docs/archive/content-blocks.md` / `.todo.md`, and `docs/archive/editor-polish.md` / `.todo.md`

## General Principles
- Treat underlap clearing as contextual TOC apparatus, not an intrinsic visual ingredient of every wide/full block.
- Preserve each block's own background, border, and hard shadow.
- Verify suspected shared causes before changing the shared mixin.
- Keep the TOC below authored content and make its auto-hide behavior conservative and geometry-based.
- Do not emit frontend-only TOC-clearing material in the WordPress editor.
- Do not paint cream into non-cream page contexts such as Side Projects.
- Prefer the smallest boring fix that makes the layering model explicit and repeatable.

## Current State Overview
- `packages/styles/_mixins.scss` defines `underlap-matte` as an oversized cream `::before` pseudo-element with negative z-index inside an isolated stacking context.
- Several shared-component recipes apply the matte to wide/full content, including File and Accordion.
- The File block has been observed losing its off-white surface and signal-blue left bar at wide alignment.
- Accordion interiors were observed with the wrong surface, although that specific background symptom may already be fixed; Accordion hard shadows remain reported as clipped or absent, especially when wide.
- The cream matte has appeared in the WordPress editor even though the editor has no frontend TOC.
- Side Projects uses a non-cream page context, so a cream clearing halo is visually wrong there.
- `ArticleToc.vue` currently auto-hides after at least three qualifying overlaps; it does not account for one object covering a large fraction of the expanded TOC.
- The desktop TOC should move roughly another 25px left to reduce routine contact with the wider content rail.

## Key File Pointers
- `packages/styles/_mixins.scss` — `underlap-matte` and width-alignment helpers.
- `packages/styles/shared-components/_file-block.scss` — File surface, left rule, alignment, and matte callsites.
- `packages/styles/shared-components/_accordion-block.scss` — Accordion surface, hard shadow, alignment, and matte callsites.
- `packages/styles/context-role/_wp-editor.scss` — editor adapters and shared-recipe consumption.
- `apps/frontend/components/content/ArticleToc.vue` — desktop rail geometry and overlap-count auto-hide heuristic.
- `apps/frontend/components/content/blocks/FileBlock.vue` and `AccordionBlock.vue` — frontend roots consuming the shared recipes.
- `apps/frontend/pages/side-projects/index.vue` — non-cream contextual QA surface.

## To Do
### Phase 4 — Validation And Closeout
- P12. Verify representative writing, case-study, Side Projects, and editor surfaces across default/wide/full blocks, then prepare the visual QA checklist below.

## Ready For Human QA
- P22. Add temporary opt-in TOC geometry instrumentation for the remaining initial-load failure before changing the heuristic again. Under `?toc-debug=1`, record each evaluation trigger, expanded rail rectangle, declared painted obstacle rectangles and matte outsets, overlap ratios, image readiness, and the resulting visibility decision; draw matching viewport overlays so the measured geometry can be compared directly with what is painted. Use the trace to distinguish a scheduling/readiness failure from an incorrect obstacle contract, then remove the instrumentation as part of the eventual fix. Result: `ArticleToc` now exposes an opt-in fixed diagnostic panel and viewport overlays, and emits each structured evaluation to the console without changing the production heuristic. Open the failing route with `?toc-debug=1` and capture the initial panel plus the blue/green/red rectangles before scrolling.
- P19. Let content blocks declare an explicit painted TOC obstacle so transparent wide-layout shells do not count as visual obstruction while undeclared blocks retain the conservative root fallback. Result: `ArticleToc` now prefers top-level `[data-toc-obstacle]` surfaces within each direct content child, reads an optional computed matte outset, and falls back to the direct child only when a block declares no surface. Image blocks declare the actual image, except full images whose matte-bearing figure remains the obstacle.
- P20. Add the missing article-context underlap matte to wide/full core Gallery blocks and measure the same gallery footprint for TOC occlusion. Result: core Gallery now declares its root as the obstacle and applies the shared 25px matte/outset at wide and full alignment; nested Image markers are ignored because the Gallery root owns the footprint.
- P21. Align Embed matte painting and TOC measurement around the rendered embed frame rather than its potentially wider transparent figure shell. Result: Embed now wraps its frame in a declared `.embed-surface`; provider sizing, wide/full matte painting, and the 25px measured outset all use that same wrapper.
- P18. Correct the expanded-TOC geometry calculation so an already-expanded rail does not count its list height twice and dilute the initial obstruction ratio. Result: the list height is now added only while estimating a collapsed rail's expanded footprint; an open rail uses its actual rendered height.
- P14. Prevent the desktop TOC from briefly appearing with stale initial geometry when a large image or other late-settling object already covers at least 40% of the expanded rail. Result: visibility tracking now reinitializes after the asynchronous heading scan renders the rail, keeps the rail hidden until its first observed geometry pass, and rechecks direct content blocks when their size or image-loading state changes. Initial human QA still exposed a visible rail because the expanded-height calculation double-counted the list; P18 corrects that separate geometry error.
- P17. Move the desktop TOC another 25px left while retaining the viewport clamp and desktop cutoff behavior. Result: the desktop offset moved from 70px to 95px while preserving the existing `max(var(--space-5), …)` clamp.
- P1. Reproduce the current default/wide/full File and Accordion rendering on representative writing and case-study detail routes. Record which reported symptoms still exist before changing styles: File surface, File left rule, Accordion interior, and Accordion shadow. Partial human QA confirms the wide File surface and Accordion interior are fixed; remaining alignment/shadow states are still pending.
- P2. Inspect the rendered DOM, computed styles, and stacking/paint order for each reproduction. Determine whether the oversized negative-z `::before` matte is painting over the block's own background/border/shadow, whether clipping comes from a wrapper, or whether different symptoms have different causes. Source and generated-CSS inspection established the stacking-context cause; rendered computed-style confirmation remains pending.
- P3. Check the same blocks in the WordPress editor and on Side Projects to establish exactly where cream matte output appears outside the desktop article-TOC relationship. Confirm visually that both contexts now omit the cream clearing.
- Confirm a representative writing and case-study detail page preserves the File surface and blue left rule plus the Accordion surface, border, and hard shadow at default/wide/full alignments.
- Confirm Side Projects shows no cream clearing halo around wide/full blocks and the WordPress editor shows normal block styling without frontend TOC mattes.
- Confirm the desktop TOC sits about 50px farther left than the original position, remains usable near the 1180px cutoff, is already hidden on initial render when one object covers at least 40% of its expanded area, and still reappears when unobstructed.

## Done
- P15. Make the Columns block's cream ground contextual so it remains available on TOC-bearing article flows but is transparent on Side Projects and in the WordPress editor. Result: Columns now reads the article-only matte color with a transparent fallback; regenerated editor CSS retains the grid without the cream ground. Human QA confirmed the unwanted cream ground is gone.
- P16. Make floated-image cream matting contextual so non-article content flows do not inherit an article-ground halo or its associated padding. Result: regular and resized float mat sizes plus the cream background are now supplied only by `has-underlap-matte`; Side Projects falls back to zero mat and transparent ground. Human QA confirmed the matte is gone with no regression.
- P4. Summarize the observed root cause and choose the smallest architectural boundary for the fix before editing `underlap-matte` or its callsites. Do not assume a global mixin rewrite is necessary until the reproduction matrix supports it. Result: source and generated-CSS inspection showed that an isolated stacking context paints the negative-z matte above its parent's background, border, and shadow; the fix therefore separates contextual matte activation from foreground block surfaces instead of globally replacing the mixin.
- P5. Implement the settled paint-order fix so File and Accordion backgrounds, borders, and hard shadows remain intact at default/wide/full alignments. Result: wide/full File and Accordion recipes now repaint their visual surfaces on a foreground `::after` layer above the matte while their content remains interactive above both layers.
- P6. Remove frontend TOC-clearing material from the WordPress editor without degrading normal editor block styling. Result: the editor configures the shared mixins with underlap emission disabled, the code-block matte falls back to transparent outside an opted-in article flow, and the regenerated editor stylesheet retains ordinary block recipes without cream matte pseudo-elements.
- P7. Remove or disable cream underlap clearing on Side Projects and settle whether non-cream contexts opt out or supply an appropriate contextual ground. Result: `BlockRenderer` now defaults to no matte; writing and case-study detail pages opt in explicitly, so Side Projects and other non-TOC flows remain transparent.
- P8. Audit remaining `underlap-matte` callsites for the same layering/context failure and make only evidence-backed follow-up changes. Result: remaining surfaced recipes already place their visible surface in a child or foreground layer, use the same cream as the matte, or compose the matte into their shadow; no additional block-specific changes were warranted.
- P9. Extend the desktop TOC auto-hide heuristic so either at least three meaningful intrusions or one sufficiently large obstruction can hide the expanded rail. Choose and document a conservative area/coverage threshold based on rendered geometry. Result: the rail now hides for the existing three qualifying overlaps or when one qualifying object covers at least 40% of the expanded TOC area.
- P10. Move the desktop TOC approximately 25px farther left, preserving its existing viewport clamp and verifying widths near the desktop cutoff. Result: the desktop offset changed from 45px to 70px while retaining the existing `max(var(--space-5), …)` viewport clamp; breakpoint-edge verification is queued for human QA.
- P11. Regenerate the WordPress editor stylesheet and run `corepack pnpm check`. Result: the generated stylesheet is current; check completed with no errors and only the two pre-existing `vue/no-v-html` warnings in `about.vue` and `now.vue`.
- P13. Fold any durable underlap/TOC context rule into `AGENTS.md`, `docs/design-system.md`, or `docs/visual-design.md` before archiving the spike. Result: `AGENTS.md` and `docs/design-system.md` now define matte activation as an explicit TOC-content context and require surfaced blocks to paint above it.
