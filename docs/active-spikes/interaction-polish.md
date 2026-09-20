# Reading And Browsing Interaction Polish
## Background
Promoted from the user's 2026-09-20 QA report while reviewing the performance preview. Reading text and clickable card content were advertising the wrong cursor, and a writing post opened directly could not use the shared-element return to its Home card.
## Intended Behavior
Selectable article list text/headings and testimonial quotations use the text-selection cursor. Entire-card links, including case-study excerpts/headings, Latest Writing dates and writing archive content, use the hand cursor. Preserve selection behavior, real link semantics and the lightbox's more specific zoom cursor.

Writing detail → Home should use the existing full shared-element transition whenever that post actually appears in Latest Writing, regardless of prior navigation history. Posts absent from Home use ordinary page navigation. Static clients consult the generated Home payload, never local WordPress. Failed membership lookup falls back without stranding clones. Hover/focus may prepare the membership data; clicking must also work without either.
## Scope And Boundaries
This is interaction correctness, not a new animation design. Preserve the accepted title coherence repair, full dimensions/crop/corners, canvas trails and destination-first handoff. Do not infer that this QA report accepts all remaining strobe/return-pause work. Performance investigation authority stays in `performance-optimization.strobe-handoff.md`. No foreground control, push or deployment.
