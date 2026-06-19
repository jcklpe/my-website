# Writing Surfaces - Bento Layout + Detail Hero

## Status

**Active spike** (promoted from `docs/scratch/` on 2026-06-01).

This spike covers two related writing surfaces so they can be redesigned coherently:

1. **Homepage Latest Writing section** - replace the uniform auto-fit grid with a bento-style composition where cards have varied size and rhythm.
2. **Writing detail page hero** - replace or revise the current slip-panel treatment on `apps/frontend/pages/writing/[slug].vue`.

The homepage bento is the first active area. The writing-detail hero is included here because it should share a writing-surface identity with the homepage section, but it should wait for the case-study hero spike to settle its first visual gate before borrowing or diverging from that work.

The to-do doc (`docs/bento-writing.todo.md`) tracks concrete implementation work, gates, and QA.

**Coordination note (2026-06-10):** the case-hero spike committed the homepage Selected Work section to a *horizontal strata* grammar — full-width image bands with drifting caption plates — specifically so the bento (packed cells of varied size) stays exclusive to writing surfaces. Packed/mosaic cell variance is this spike's signature; if a Selected Work move ever starts reading as bento, or a bento move here starts reading as full-width strata, one of them is drifting into the other's lane. See "Revision — bands, not floating plates" in `docs/archive/case-hero.md`.

## Background

The homepage Latest Writing section (`apps/frontend/components/home/HomeLatestWritingSection.vue`) currently renders posts through `PostList.vue`, which uses a uniform `auto-fit` grid. It is functional, responsive, and reusable, but it reads like a generic archive surface rather than a composed homepage section.

Writing wants a different behavior on the homepage:

- The newest or most important post should have more visual weight.
- Secondary posts should form a denser supporting field.
- The section should feel intentionally composed, not like identical tiles flowing into columns.
- The existing window-chrome `PostCard` treatment should remain part of the Blue Atlas vocabulary unless a later visual gate deliberately changes it.

The writing detail page has a related but separate problem. It currently uses the same slip-panel vocabulary as the case-study detail page: a near-opaque cream rectangle over featured media. The case-hero spike is exploring a halftone treatment on case-study media. This spike owns the writing-side answer, so writing does not accidentally inherit case-study decisions just because the components share transition infrastructure.

## Current Rendered Model

- `HomeLatestWritingSection.vue` owns the homepage section shell, heading treatment, archive link, and currently delegates the list to `PostList.vue`.
- `PostList.vue` is the generic writing-list grid and is also used by `/writing`.
- `PostCard.vue` owns the writing card markup, featured-media transition source hooks, hover behavior, and excerpt/date/title body.
- `apps/frontend/pages/writing/[slug].vue` owns the writing detail hero and transition target hooks.

The homepage currently fetches **10 posts** through `HOME_POST_COUNT` in `apps/frontend/composables/useHomeSurfacePrefetch.ts`. This is now the chosen count for the first bento pass. The design should treat all 10 as a composed homepage surface rather than slicing down to a smaller editorial preview.

## Prior Attempt - `gendes-blue1.1`

The half-finished branch `gendes-blue1.1` has been inspected with `git show`. It made a real attempt at the bento layout inside `HomeLatestWritingSection.vue`.

What it did:

- Added `@bentogrid/core@1.1.1`.
- Created an 11-item repeating `BENTO_PATTERN` using `1x1`, `1x2`, `3x2`, `3x1`, `2x1`, and `2x2` cells.
- Used a five-column BentoGrid instance initialized on `onMounted`.
- Treated one-row cells as compact horizontal cards with image-left/body-right layout.
- Used `min-width: 0` and `min-height: 0` aggressively to prevent card content from inflating grid columns.
- Changed `PostCard` visuals toward a softer rounded-card style.

Useful lessons:

- The layout pressure is real with 10 posts. A simple "first card spans two columns" CSS grid may look too repetitive or leave awkward whitespace.
- Compact horizontal variants are probably necessary if cards occupy one-row bento cells.
- `min-width: 0` on list items, cards, links, and bodies is not optional in dense CSS grids.
- Image sizing needs to respond to the card's position, not just to viewport width.
- The old 11-item period is a useful proof that gap-free groups can be designed mathematically. The current implementation adapts that idea into an explicit 10-card CSS pattern instead of a repeating JS-packed layout.

Risks and reasons not to copy it directly:

- It introduces a new client-side layout dependency for one homepage section.
- It measures and lays out after mount, so SSR/static output may initially render as an unpositioned list unless the fallback CSS is designed carefully.
- The layout logic lives directly inside `HomeLatestWritingSection.vue`, making the section harder to scan.
- It changes `PostCard` visual language away from the current accepted window-chrome treatment.
- It does not settle the editorial count question; it assumes a long repeating pattern.
- The branch's broader homepage edits are unrelated to this spike and should not be imported wholesale.

This branch is a reference, not a patch queue.

## Starting Direction

Start with a dedicated homepage-only list component, likely `HomeBentoPostList.vue`, rather than teaching `PostList.vue` about featured-first behavior. `PostList.vue` should remain the generic archive list.

The homepage is keeping 10 posts. The first implementation pass should still prefer CSS-first layout, but the grid should be high-resolution enough to avoid obvious row bands while staying mostly packed. The current direction is a filled 12-column desktop tiling with moderate card rectangles: no deliberate holes, one large latest card, and no routine super-skinny strips. `@bentogrid/core` remains a fallback candidate if visual QA shows the CSS pattern feels too rigid or leaves awkward rhythm at real breakpoints.

`PostCard.vue` can accept small, explicit props for layout variant, image `sizes`, and excerpt visibility. The invariant is not "never touch PostCard"; the invariant is "preserve transition hooks, semantic link/card behavior, and the accepted card identity unless a visual gate decides otherwise."

## Writing Detail Hero

The writing detail page should be handled after the homepage bento has a first stable pass and after the case-hero spike has completed its Phase 1 visual gate.

Starting hypothesis:

- Writing keeps a featured-image hero.
- The slip panel probably goes away or changes materially.
- Body-text overlap is a promising writing-specific frame-breaking gesture, but it should not depend fragilely on the first Gutenberg block being a default-width block. A safer version may overlap the content wrapper or first content band while letting `BlockRenderer` keep normal block layout inside it.
- Writing may reuse the case-study halftone utility, use a gentler variant, or avoid filtering entirely. That decision should be made visually, not inherited automatically.

## Open Questions

- Does the 10-card CSS pattern feel composed enough, or does it need true packed layout behavior?
- Should the featured item be purely "most recent," or should the CMS eventually support an editorially featured post?
- Should compact bento cards hide excerpts, shorten excerpts, or render a different card body?
- Does the homepage bento need JavaScript packing, or is a CSS-first grid enough?
- Does the writing detail hero reuse the case-study halftone treatment, diverge from it, or avoid image filtering?
- Should the `/writing` archive remain visually conservative while the homepage gets the composed bento treatment?

## Not In Scope

- Reworking the generic writing archive layout unless the bento work exposes a real shared issue.
- Changing the WordPress post content model.
- Adding a new writing-specific custom post type.
- Reworking the featured-media transition core mechanics.
- Importing the broader `gendes-blue1.1` homepage redesign.

## Related Files

- `apps/frontend/components/home/HomeLatestWritingSection.vue`
- `apps/frontend/components/navigation/lists/PostList.vue`
- `apps/frontend/components/navigation/cards/PostCard.vue`
- `apps/frontend/pages/writing/[slug].vue`
- `apps/frontend/composables/useHomeSurfacePrefetch.ts`
- `apps/frontend/composables/useFeaturedMediaTransition.ts`
- `apps/frontend/components/transitions/FeaturedMediaTransitionLayer.vue`
- `packages/styles/shared-components/_featured-media-overlay.scss`
- `docs/archive/case-hero.md` (archived)
