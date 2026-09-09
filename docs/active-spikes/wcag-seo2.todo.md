# Accessibility And SEO Pass 2 — Tasks
## Background
Final correctness audit before shifting emphasis to authored content. Conceptual scope: `docs/active-spikes/wcag-seo2.md`. Performance measurements stay in `docs/scratch/performance-optimization.md`.
## General Principles
- Audit an identified production artifact; distinguish deployed results from local fixes.
- Preserve visual character and the custom overlap transition. Fix evidenced barriers rather than optimizing scores alone.
- Keep QA fixtures out of public publishing. Never infer accessibility compliance from automated scores.
## Current State Overview
Promoted 2026-09-09. Scope prepared; no new audit results claimed. Production case-study photoplate strobing remains an animation blocker.
## To Do
- S1. Record release/build provenance and a representative route/device matrix, including cold entry and client navigation.
- S2. Run automated accessibility checks on representative settled routes and open UI states; triage actual violations with reproducible evidence.
- S3. Manually test keyboard order, visible focus, disclosures, TOC, pagination, lightbox focus trapping/restoration, media controls, and browser Back.
- S4. Test screen-reader names/roles, landmark and heading structure, link purpose, image alt handling, errors, and loading states.
- S5. Check contrast, text zoom/reflow at narrow widths, touch target usability, and content legibility with representative long titles and blocks.
- S6. Verify reduced-motion alternatives and review continuous animation/flash exposure, including the repaired case-study transition. Identify any required pause controls without assuming prefers-reduced-motion alone suffices.
- S7. Inspect generated HTML for titles/descriptions, canonical and cross-post overrides, social-card URLs, JSON-LD accuracy, and exactly one page h1.
- S8. Verify production robots/sitemap URLs, indexability, redirects, missing-page status behavior, dev/QA exclusions, and llms.txt accuracy. Do not change discovery settings during measurement.
- S9. Fix confirmed findings in bounded batches; retest each and record any accepted limitations.
- S10. Produce a small repeatable regression checklist and editorial accessibility requirements; prepare closeout for approval.
## Ready For Human QA
None yet. Findings will identify exact surfaces requiring human judgment.
## Done
- Scope promoted and separated from runtime/delivery performance work.
