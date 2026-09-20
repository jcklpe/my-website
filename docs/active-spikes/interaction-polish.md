# Reading And Browsing Interaction Polish
## Background
Promoted from the user's 2026-09-20 QA report while reviewing the performance preview. Reading text and clickable card content were advertising the wrong cursor, and a writing post opened directly could not use the shared-element return to its Home card.
## Intended Behavior
Selectable article list text/headings and testimonial quotations use the text-selection cursor. Entire-card links, including case-study excerpts/headings, Latest Writing dates and writing archive content, use the hand cursor. Preserve selection behavior, real link semantics and the lightbox's more specific zoom cursor.

Writing detail → Home should use the existing full shared-element transition whenever that post actually appears in Latest Writing, regardless of prior navigation history. Posts absent from Home use ordinary page navigation. Static clients consult the generated Home payload, never local WordPress. Failed membership lookup falls back without stranding clones. Hover/focus may prepare the membership data; clicking must also work without either.
The construction notice belongs only to a direct homepage load without a section fragment. Internal navigation and browser Back must never remount it; its existing dismiss/scroll behavior remains. Client-only eligibility avoids static HTML briefly showing it for a fragment URL.
## Scope And Boundaries
This is interaction correctness, not a new animation design. Preserve the accepted title coherence repair, full dimensions/crop/corners, canvas trails and destination-first handoff. Do not infer that this QA report accepts all remaining strobe/return-pause work. Performance investigation authority stays in `performance-optimization.strobe-handoff.md`. No foreground control, push or deployment.

## Latest Writing Surroundings
Extend the existing Home choreography to the bento writing cards. Move each sibling as one list item, preserving its internal depth/image/text treatment. Same-row cards leave left/right; same-column cards leave up/down. Diagonal and ambiguous overlaps compare center separation normalized by the combined card sizes, with vertical ties. Section furniture and other Home sections keep vertical flow. Reverse uses freshly measured destination geometry after scrolling, so responsive layouts remain authoritative. Writing staggers fit inside the existing departure hold; reduced motion skips choreography. Preserve the primary morph and do not animate both a parent section and its children.
