# Responsiveness — Tasks
## Background
Improve smoothness and response without simplifying the established design. Constraints and comparison method are in `responsiveness.md`.
## General Principles
- Measure input work and warm re-entry; do not optimize an aggregate score.
- Keep existing motion, rendering surfaces, and preparation that prevent startup hitches.
- Use matched static artifacts and preserve raw evidence.
- Commit bounded verified candidates; human interaction feel remains explicit QA.
## Current State Overview
First candidate implemented and verified 2026-10-01; user comparison accepted 2026-10-02 as no perceptible regression, with no discernible speedup. Homepage heading fields cache proximity with a generous preparation band, keep easing and surfaces alive, and synchronously prepare after large scroll/resize/route changes. The rejected per-pointer parent-read attempt and all measurements are preserved under ignored `temp-ref-assets/responsiveness/2026-10-01/`. Local baseline: `http://127.0.0.1:3077/`; local candidate: `http://127.0.0.1:3078/`. Exact candidate artifact is also retained in the evidence folder. Production is unchanged.
## To Do
- Investigate repeated case-study scale reads/writes at mount while preserving immediate first-paint preparation. The current card measures its scale during setup and again through preference reconciliation; verify that removing repetition improves startup before changing it.
## Ready For Human QA
None for the first candidate.
## Done
- Reduce distant heading geometry work while preserving visible motion and warming before entry. **Implemented:** cached 1,500px proximity, unchanged easing/layers/design, synchronous preparation for fast jumps and route return. **Review:** move the pointer across each Home heading, scroll rapidly to Latest Writing and back, and return from writing/case-study cards; compare with the baseline for delayed response or visible catch-up. **User review 2026-10-02:** “honestly I have trouble telling them apart. Neither seems worse though.” Accept the candidate as showing no perceptible regression in the compared previews; no noticeable speedup or exhaustive route QA is claimed.
- Preserve a pre-change checkpoint with the application untouched and the retained production artifact available for comparison. **Result:** initial `Spike: responsiveness` commit precedes all application changes; the deployed release is pinned against pruning.
- Capture a matched baseline for homepage pointer work, deep scrolling, and heading re-entry. **Result:** same Chrome, viewport, input sequence, and matching heading geometry across static artifacts; source/artifact snapshots, raw reports, and SHA-256 candidate manifest retained. Build-overlap baseline excluded from timing means.
- Verify the candidate with matched browser measurements, reduced motion, route return, and `corepack pnpm check`. **Result:** identical visible transforms, first-three-frame re-entry, CSS animation names, letter count, and promotion hints. Touch and reduced motion retain zero letter reads. Final desktop samples show no intervals above 25ms or page errors. Direct heading callback work at the top drops by about 0.8ms per pointer frame in the instrumented pair; whole-page timing remains mixed. `check` and targeted Prettier check pass (two existing lint warnings). Case-study structural journeys pass; Latest Writing flags the identical source shell/nav findings on both baseline and candidate, so no blanket route-pass claim is made.
