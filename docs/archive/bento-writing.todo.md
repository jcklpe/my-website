# Writing Surfaces - To Do

## Background

**Spike closed 2026-06-24.** Durable lessons folded into `docs/visual-design.md`. Archived at `docs/archive/bento-writing.md` / `.todo.md`.

Conceptual doc: `docs/bento-writing.md`.

This spike owned the homepage Latest Writing bento layout and the writing archive and detail hero surfaces.

## Project Organization

This spike is gated. The homepage bento ships before the writing detail hero. The writing detail hero waits for the case-hero spike's first visual gate so the writing side can choose whether to reuse, soften, or reject the case-study halftone treatment.

The "To Do" section lists the active planning/implementation phase. Later phases are kept under "Future Phases (Gated)" until the preceding gate clears.

## General Principles

- Preserve the featured-media transition contract: `data-featured-*` attributes, slug-based transition keys, and semantic card links must keep working.
- Keep `PostList.vue` generic for the writing archive unless there is a strong reason to change it.
- Prefer a homepage-specific list component over burying dense bento logic in `HomeLatestWritingSection.vue`.
- Prefer CSS-first layout for the first 10-post pass.
- If the CSS pattern fails visual QA and `@bentogrid/core` comes back, make the SSR/static fallback, mobile behavior, and cleanup explicit.
- Do not import the broad `gendes-blue1.1` homepage changes wholesale.
- Do not delete slip-surface mixins while case-study or writing surfaces still consume them.

## Current State Overview

- `docs/scratch/bento-writing.md` has been promoted into active spike docs.
- `HomeLatestWritingSection.vue` renders `HomeBentoPostList.vue` for the
  homepage-specific 10-post bento composition.
- `PostList.vue` remains the generic uniform-grid list for `/writing`.
- `PostCard.vue` has small layout, image-size, and excerpt-visibility props
  while preserving the featured-media transition source hooks.
- Homepage writing cards are headline-first and excerpt-free. Whether writing
  archive cards should keep excerpts is pinned in `docs/deferred-decisions.md`.
- `useHomeSurfacePrefetch.ts` currently fetches `HOME_POST_COUNT = 10`.
- `gendes-blue1.1` attempted a JS-packed bento using `@bentogrid/core`, an 11-item repeating pattern, compact horizontal card variants, and dense min-width/min-height fixes.
- Case-study/writing featured-media transition history now lives in
  `docs/archive/featured-media-transition.todo.md`; bento card changes should
  continue to preserve those hooks and should be QAed in motion, not only at
  rest.

## To Do - Phase 1: Homepage Bento Implementation (Active)

**Goal**: ship a first 10-post CSS bento pass for the homepage Latest Writing section.

- [x] Promote conceptual doc from `docs/scratch/bento-writing.md` to `docs/bento-writing.md`.
- [x] Create `docs/bento-writing.todo.md`.
- [x] Inspect `gendes-blue1.1` with `git show`.
- [x] Decide homepage post count for Latest Writing: keep 10.
- [x] Decide implementation model: first pass is CSS-first, no BentoGrid dependency.
- [x] Add `HomeBentoPostList.vue` as a homepage-only list component.
- [x] Add small explicit `PostCard.vue` props for layout, image `sizes`, and excerpt visibility.
- [x] Preserve `PostList.vue` for the `/writing` archive.
- [x] Keep homepage bento cards excerpt-free so the section relies on headlines.
- [x] Revise the first CSS pattern after user feedback: increase grid resolution, shrink card units, and use unique placements instead of predictable row groups.
- [x] Revise the second CSS pattern after user screenshot feedback: remove large gaps and keep card aspect ratios moderate.
- [x] Verify lint/typecheck.
- [x] Browser-check desktop and phone layout.
- [x] Verify card-to-detail and reverse featured-media transitions.
- [x] Decide after visual QA whether CSS bento is enough or whether BentoGrid should be reconsidered.

### Discussion Notes From `gendes-blue1.1`

- The 11-item pattern is valuable if we keep 10 posts, but it may be overbuilt for a homepage section that should probably be more editorially selective.
- The compact horizontal-card treatment is likely worth reusing as a concept, even if not as direct code.
- The branch's `min-width: 0` comments are real implementation knowledge and should be preserved in code if a dense grid lands.
- The branch's rounded-card `PostCard` restyle is not part of the current plan.
- The dependency question remains the main fallback fork: CSS grid gives SSR simplicity; BentoGrid gives packing control but adds client-side layout behavior.

### Decision Gate - End of Phase 1

Resolve after implementation:

- Does the 10-card CSS pattern feel composed with real posts?
- Are headline-only cards readable with long Medium-import titles?
- Does the lack of a packing library create visible awkwardness?
- Are the transition hooks still behaving?

## Phase 1 Visual QA Gate

User should check:

- Homepage Latest Writing section on desktop, wide desktop, tablet, and phone.
- Card rhythm with the actual current public posts, including Medium imports.
- Long titles in compact cards.
- Hover states and focus states.
- Card-to-detail transition from homepage to a writing post.
- Reverse transition from writing detail back to homepage when the card source exists.

Decision branches:

- Looks good -> proceed to writing detail hero planning.
- Layout rhythm is good but cards are cramped -> adjust card variants or post count.
- CSS grid leaves awkward gaps -> consider BentoGrid or reduce count.
- BentoGrid causes visible layout jump -> improve fallback, reduce dependency use, or pivot to CSS.

## Future Phases (Gated - Not Active)

### Phase 2 - Writing Detail Hero

- Re-evaluate after case-hero Phase 1.
- Decide whether writing uses halftone, a softer writing-specific filter, or no image filter.
- Remove or redesign the slip panel on `apps/frontend/pages/writing/[slug].vue`.
- Preserve transition target hooks.
- Explore body/content overlap as a writing-specific frame-breaking gesture.
- Avoid depending on one fragile first-block shape from Gutenberg.

### Phase 3 - Cleanup And Archive

- Coordinate with case-hero before removing `_featured-media-overlay.scss` or slip mixins.
- Fold durable writing-surface lessons into `docs/visual-design.md`.
- Update `to-do.md` if this spike changes roadmap state.
- Move `docs/bento-writing.md` and `docs/bento-writing.todo.md` to `docs/archive/` when complete.

## Ready for Human QA

- Homepage Latest Writing section at `http://127.0.0.1:3000/#latest-writing`.
- Check desktop/wide rhythm for the 10-card CSS bento, especially whether the filled tiling feels dynamic without large accidental gaps.
- Check phone stacking and long-title readability in compact cards.
- Check that headline-first writing cards still feel sufficiently informative
  without excerpts.
- Check card-to-detail transition from a homepage writing card, then reverse navigation back to the homepage source card.

## Done

- Promoted the bento-writing conceptual spike from scratch to active docs.
- Created the active todo doc.
- Inspected `gendes-blue1.1` and captured its bento attempt as reference material.
- Implemented a CSS-first 10-post homepage bento pass using `HomeBentoPostList.vue`.
- Revised the bento from a predictable row-like pattern into a smaller, higher-resolution 12-column mosaic.
- Revised the mosaic into a filled tiling to remove large gaps and avoid radical skinny cards.
- Added small `PostCard.vue` layout props for bento variants while preserving the transition hooks.
- Removed excerpts from homepage writing cards; whether `/writing` archive cards keep excerpts is pinned in `docs/deferred-decisions.md`.
- Verified card-to-detail and reverse featured-media transitions; CSS bento is sufficient — BentoGrid dependency not added.
- Phase 1 gate cleared. Phase 2 gate cleared: case-hero closed 2026-06-17; decided against image treatment on writing surfaces (deliberate divergence from case-study halftone register).
- Writing detail hero signed off as-is: plain photo plate (right-aligned, bottom-right radius carve) with cream header box overlaid. No redesign.
- Body/content overlap gesture dropped — not needed without image treatment.
- Writing archive surface implemented as a year-grouped slip-row list (`WritingArchiveList.vue` + `PostArchiveRow.vue`) with mono date + title headline + excerpt as secondary slip elements; full featured-media transition support from both archive rows and homepage cards.
- Slip animations on `PostArchiveRow`: date and excerpt slip out before the clone launches (archive→detail preflight) and slip in after it lands (detail→archive arrival), with an 80ms stagger between date and author on the detail page.
- Folded durable lessons into `docs/visual-design.md` → "Surface Notes → Writing surfaces". Spike closed 2026-06-24.
