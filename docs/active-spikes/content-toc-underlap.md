# Content, TOC, and Underlap Fixes
## Status
Active as of 2026-07-30.

Operational checklist and decision tracking: [content-toc-underlap.todo.md](content-toc-underlap.todo.md).

Promoted 2026-07-30 from `docs/scratch/content-toc-underlap.md`, which clustered related detail-content regressions from the misc inbox plus the non-cream Side Projects context discovered during discussion.

## Goal
Make authored content, the desktop TOC rail, and their overlap treatment behave as one deliberate system without erasing block backgrounds, clipping elevation, or painting cream into contexts that do not use the article's cream ground.

## Current Context
The desktop TOC is low-priority marginal apparatus. Authored wide, full, floated, and compositional blocks paint above it, while `underlap-matte` provides cream negative space where needed so overlaps read as paper layering rather than clutter. The current symptoms suggest that the implementation may be treating "quiet the TOC overlap with cream" as a universal block treatment instead of a context-dependent article-ground treatment.

Several observations may share that root cause, but verify each one before assuming they are identical bugs. The wide Accordion interior's background appears to have been fixed somewhere along the way, while its shadow behavior may still be wrong.

## Working Model
The matte exists to resolve a relationship between two layers: authored content and the desktop article TOC. It is not intrinsically part of a File block, Accordion, Embed, Image, or other content block, and cream is not correct in every page context.

This distinction should guide implementation:

- A block's own surface, border, and elevation remain part of the block and must paint intact.
- TOC-clearing material is contextual apparatus and should appear only where the overlap relationship exists.
- The WordPress editor has no frontend TOC, so it should not inherit TOC-clearing material.
- Non-cream page contexts, including Side Projects, should not receive a cream halo simply because a block can be wide or full aligned.
- A single large obstruction can matter more than several small ones; TOC visibility should respond to meaningful covered area as well as intrusion count.
- Matte painting and TOC collision measurement should follow the same visible surface rather than a wider transparent layout shell. Full-width alignment does not make a height-capped image visually full-width.
- Settled page entry should not reveal a partially clipped TOC. If entry finds a meaningful overlap, keep the rail hidden until that overlap clears completely; small temporary crossings can remain tolerable after the rail later returns to normal scrolling behavior.

## Underlap Architecture And Block Regressions
- The wide downloadable File block has been observed without its off-white background or signal-blue left bar. The cream underlap matte may be painting over the block's own surface treatment; compare this with the earlier Blockquote handling.
- The wide Accordion interior was observed as matte rather than off-white, although this appears to have been fixed later. Reproduce before changing it.
- Accordion shadows are cut off, and wide accordions have been observed with no visible shadow at all. The cream underlap matte may be covering the hard shadow rather than merely clearing space behind the block.
- The cream matte has appeared in the WordPress editor even though the TOC does not exist there. Editor rendering should not inherit a frontend-only overlap-clearing treatment.
- Remove or disable the cream matte negative space on the Side Projects page, whose ground is not cream. More broadly, decide whether the matte should accept the active page ground, be explicitly disabled by context, or be applied only inside article contexts that actually render the desktop TOC.

## TOC Behavior And Geometry
- Make the desktop TOC auto-hide heuristic account for one large obstruction, not only several separate intrusions. A single wide embed that covers roughly half or more of the expanded TOC should be enough to hide it even if it is the only overlapping object.
- Move the desktop TOC roughly another 25px to the left so it sits mostly outside the main rail used by wider content.

## Open Questions
- Should the underlap treatment remain a pseudo-element on each block, move to a wrapper or apparatus layer, or use another paint-order model that cannot cover the block's own background, border, and shadow?
- Should the matte's color derive from page context, or should non-article/non-cream contexts opt out explicitly?
- Should TOC auto-hide use overlap area, a percentage of the expanded TOC rectangle, a percentage of the visible rail, or a combination of area and intrusion count?
- Which blocks genuinely need a matte, and which already have an opaque surface that can provide their own separation from the TOC?

## Constraints
- Preserve the established model where authored content paints above the low-priority TOC rail.
- Do not solve block-surface bugs by raising the TOC above content.
- Do not chase exact editor/frontend parity; remove frontend-only apparatus from the editor while preserving useful block styling.
- Keep any TOC visibility heuristic conservative, geometry-based, and easy to remove.
- Preserve wide/full Gutenberg authoring intent and the `.content-flow` grid contract.
- Verify writing, case-study, and Side Projects contexts rather than fixing only the first reproduction route.

## Human QA Surfaces
- Writing and case-study detail pages with wide/full File, Accordion, Embed, Image, Quote, Table, and other matte-bearing blocks.
- The Side Projects page, especially wide/full content against its non-cream ground.
- WordPress editor previews of wide/full blocks, confirming no frontend-only cream clearing appears.
- Desktop TOC behavior with several small overlaps, one very large overlap, and no overlap.
- Desktop widths near the TOC's responsive cutoff, confirming the additional left offset does not clip or crowd the rail.

## Non-Goals
- A general redesign of article blocks or the TOC.
- Reworking mobile/tablet TOC presentation, which already uses an in-flow collapsed block rather than the desktop rail.
- Changing content width/alignment semantics or the Gutenberg block model.
- Treating every content visual issue as part of this spike; scope is the TOC/underlap relationship and the regressions it causes.
