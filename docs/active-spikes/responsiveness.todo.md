# Responsiveness — Tasks
## Background
Improve smoothness and response without simplifying the established design. Constraints and comparison method are in `responsiveness.md`.
## General Principles
- Measure input work and warm re-entry; do not optimize an aggregate score.
- Keep existing motion, rendering surfaces, and preparation that prevent startup hitches.
- Use matched static artifacts and preserve raw evidence.
- Commit bounded verified candidates; human interaction feel remains explicit QA.
## Current State Overview
Pre-change checkpoint prepared. Application source is unchanged from the latest production artifact. First candidate is limited to distant homepage heading geometry work.
## To Do
- Capture a matched baseline for homepage pointer work, deep scrolling, and heading re-entry.
- Reduce distant heading geometry work while preserving visible motion and warming before entry.
- Verify the candidate with matched browser measurements, reduced motion, route return, and `corepack pnpm check`.
## Ready For Human QA
None yet.
## Done
- Preserve a pre-change checkpoint with the application untouched and the retained production artifact available for comparison.
