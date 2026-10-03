# Manual Table of Contents Collapse
## Purpose
On 2026-10-02 the user reported that three people dislike automatic TOC collapse and requested its removal. Desktop article outlines should remain available as readers scroll, with expansion controlled by the Contents button.
## Scope
Remove the desktop `200vh` accumulated-scroll collapse trigger and its tracking/suppression state from `ArticleToc.vue`. Keep active-heading tracking, manual collapse/reopen, new-article reset, short-article suppression, geometry-based obscuration under authored content, route-entry handling, and existing accessibility semantics. Phone/tablet remain in-flow lists that start closed and settle closed before heading navigation.
## Validation
Exercise long writing and case-study routes through more than two viewport-heights in both directions, then manually collapse/reopen and navigate headings. Verify desktop expanded state, hidden-list inert/ARIA state, active headings, new-article reset, and mobile heading positioning. Run source/format checks and preserve the current static comparison plus browser evidence under ignored `temp-ref-assets/toc-manual-collapse/2026-10-02/`. Production is unchanged until explicitly deployed.
Continues from: docs/archive/table-of-contents.md
Continues from: docs/archive/content-toc-underlap.md
