---
status: captured
---
# Static runtime and prototyping comparison
Consider direct static-artifact experiments or a smaller delivered runtime only if a measured, feature-equivalent comparison justifies them. Prefer making the existing WordPress/Nuxt/static-delivery stack work; preserve component/SCSS authoring. S55 was itself a compiled Nuxt artifact, so its subjective smoothness did not show that removing the framework caused improvement.

Compare the same content/media, live-dot treatment, parallax and transitions, responsive behavior, reduced motion, fallback and accessibility. Measure visitor JavaScript, interaction latency, displayed frame pacing, CPU/GPU cost and memory under matched conditions; keep build time separate. Distinguish renderer scheduling from transition ownership.

Keep frozen controls, source/diff records, exact artifact/media mappings and checksums, matched conditions, and early end-to-end integrations. Separate source verification, timing, visible behavior and user acceptance. The old port/handoff status is historical; see the [archived investigation](../archive/performance-optimization.strobe-handoff.md). No architecture migration is chosen.

Captured 2026-09-23. From the former future-ideas list; full source remains in `8e518de:docs/scratch/future-ideas.md`.
