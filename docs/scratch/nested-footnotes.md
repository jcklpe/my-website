---
status: captured
---
# Nested footnotes
Consider literary/hypertext footnotes containing other footnote markers, including intentional cycles. The earlier proposal kept first-level behavior unchanged, rendered deeper notes inside their parent with distinct styling, and bounded recursion with visited-note tracking and a depth cap of roughly 3–4.

Authoring is the unresolved part: the original exploration found a flat native WordPress footnote model with no nested-marker UI, and suggested a custom block or shortcode. Recheck those constraints before any implementation; this is a saved possibility, not a plan.

From the former future-ideas list; full source remains in `8e518de:docs/scratch/future-ideas.md`.
