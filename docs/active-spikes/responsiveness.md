# Responsiveness
## Purpose
Make pointer response, scrolling, and route entry smooth and snappy while preserving the current art direction and motion branding. The user authorized a pre-change checkpoint and bounded implementation on 2026-10-01. Lower resource counts are useful only when they improve the experience; they are not acceptance criteria.
## Constraints
Preserve live halftone, trails, physical route choreography, timings, typography, and decorative motion. Retain prepared DOM and compositor surfaces when that avoids cold entry. Do not trade background savings for a visible hitch when a section returns. Preserve reduced-motion behavior and destination-first transition handoff. Route choreography's existing visual QA remains separate.
## Starting Evidence
The latest deployed artifact is retained under `.releases/static/20261001T204005Z-4d0cb271d2d0/public/`. Its homepage and entry JavaScript were verified against production. The automated findings suggest repeated layout reads and background work, but resource estimates and score changes do not establish a visible regression. Browser/engine differences also prevent treating the historical report as a controlled comparison.
## First Investigation
The four homepage heading fields measure each letter after global pointer movement and scrolling, including headings far outside the viewport. Investigate avoiding that distant geometry work with generous preparation distance, while keeping the same visible calculations, easing, markup, and layers. Resume before entry rather than mounting on visibility. Leave continuous CSS decoration and GPU surfaces intact in this first pass.
## Validation
Compare the retained baseline and candidate static artifacts in the same browser with the same viewport and input sequence. Record geometry calls and main-thread work separately from frame intervals; counters alone do not prove perceived smoothness. Exercise rapid deep scrolling, re-entry, reduced motion, and route return. Reject a candidate that introduces delayed visible response or changes the design. Store scripts and raw evidence under ignored `temp-ref-assets/responsiveness/`.
## Checkpoint
The first commit carrying `Spike: responsiveness` records the untouched application plus this plan. Find it with `git log --grep='Spike: responsiveness$' --reverse`. Production remains the retained baseline until an explicitly authorized deployment.
