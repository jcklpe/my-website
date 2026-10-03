# Manual Table of Contents Collapse — Tasks
## Background
Three readers have objected to automatic TOC collapse. Remove the desktop scroll-distance trigger while keeping deliberate controls and article apparatus behavior.
## General Principles
- Scrolling must not change the reader’s expanded/collapsed choice.
- Keep authored content layering, heading tracking/navigation, and accessible controls.
- Preserve mobile/tablet layout and close-before-navigation behavior.
## Current State Overview
Desktop collapse now changes only through the Contents button and resets open for a new article. The scroll-distance listener, bookkeeping, and heading-navigation suppression timer are removed. The separate geometry-based obscuration system still protects authored content overlap. Implementation is ready for reader review at `http://127.0.0.1:3078`.
## To Do
None.
## Ready For Human QA
- Remove desktop scroll-triggered collapse and its state/listener, retaining manual controls and new-article reset. — Implemented by deleting 61 lines from `ArticleToc.vue`, with no markup/style changes. Scroll a long writing or case-study article, then deliberately collapse/reopen Contents. The open list should remain available throughout reading wherever authored content does not obscure it. Review from the homepage at `http://127.0.0.1:3078`, or directly at `http://127.0.0.1:3078/case-studies/design-system-operations-at-uscis`.
## Done
- Verify long writing and case-study scroll, manual toggle semantics, heading navigation, active tracking, new-article reset, and phone close-before-scroll behavior. — Baseline reproduces automatic collapse; candidate remains expanded through scrolling to 5600px and back. Both long route types start expanded; native desktop collapse preserves inert/ARIA semantics and remains collapsed while scrolling; reopening and heading navigation work, with active headings changing during scroll. Native phone taps open Contents and select a heading, then close/inert the list before scrolling; the heading settles within 1px of the viewport top in both builds. No browser errors. Evidence: ignored `temp-ref-assets/toc-manual-collapse/2026-10-02/{baseline,candidate}.json`. `corepack pnpm check`, targeted Prettier, diff whitespace check, and public-CMS static generation pass (two existing `v-html` lint warnings). Normal client navigation and canonical direct entry work; an existing trailing-slash direct-entry issue in the comparison fixture is captured in the scratch inbox.
- Update durable TOC guidance to describe manual desktop expansion. — Updated `AGENTS.md`, `docs/design-system.md`, and `docs/visual-design.md`; preserved overlap and mobile behavior guidance.
