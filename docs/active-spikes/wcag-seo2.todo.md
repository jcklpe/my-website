# Accessibility And SEO Pass 2 — Tasks
## Background
Final correctness audit before shifting emphasis to authored content. Conceptual scope: `docs/active-spikes/wcag-seo2.md`. Performance measurements stay in `docs/scratch/performance-optimization.md`.
## General Principles
- Audit an identified production artifact; distinguish deployed results from local fixes.
- Preserve visual character and the custom overlap transition. Fix evidenced barriers rather than optimizing scores alone.
- Keep QA fixtures out of public publishing. Never infer accessibility compliance from automated scores.
## Current State Overview
Audit started 2026-09-09 after the approved animation/housekeeping commits and a verified clean working tree. Animation is archived by human acceptance; its non-reproducible strobing report is not a current blocker. First observations below are a bounded production baseline, not a compliance result.
## Initial Production Observations — 2026-09-09
- Production origin: `https://www.aslanfrench.work`. HTTP homepage Last-Modified: 2026-09-08 02:31:01 GMT; sampled at approximately 15:18 UTC on September 9. Exact release manifest identity is not yet established, so S1 remains open. Local HEAD includes later changes and must not be treated as the deployed artifact.
- Homepage browser DOM: `lang=en`, one h1, one self-canonical, expected description and production social-image URL, one main landmark and labeled Footer navigation.
- Public HTTP checks: homepage 200; apex 301 to www; `/audit-nonexistent-page-20260909` returns 404; default social PNG returns 200 with image/png. Robots allows production crawling and references the correct sitemap. The inspected sitemap contains production-origin content routes and no visible dev/QA routes.
- Writing sample: `/writing/design-principles-for-enzo-a4f9af10cd03` has one h1, logical sampled h2 structure, no images missing an alt attribute, and the expected external Medium canonical. This does not establish alt-text quality or complete accessible naming; a simple empty-button heuristic found no candidates.
- Finding for S8: that externally canonical writing URL is also included in the local sitemap. Review canonical filtering in sitemap generation; do not remove the CMS cross-post canonical or change editorial ownership to make the check pass.
- Footer repeated ticker text initially appeared duplicated in raw DOM text; local source marks repeated copies aria-hidden. Do not report a screen-reader duplicate based on textContent alone; verify the deployed accessibility tree during S4.
- S3–S6 remain untested: automated accessibility scan, keyboard/focus, assistive technology, responsive reflow/contrast, and continuous-motion pause requirements still need the full audit. No compliance claim is made from this baseline.
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
