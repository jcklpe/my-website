# Interaction Polish — Tasks
## Background
User QA from 2026-09-20; scope and rationale in `interaction-polish.md`.
## General Principles
- Match the cursor to the actual interaction; retain readable/selectable article text and accessible links.
- Use real Home membership for conditional reverse transitions, not visit history.
- Preserve previous performance candidates and test against a separate static artifact.
## Current State Overview
Cursor correction is verified in an isolated static build. Eight computed-style assertions pass: case-study card excerpt/title and Latest Writing date use the hand, testimonial text and article list/heading use text selection, and writing archive excerpt/heading use the hand. Reading text reports selectable `user-select:auto`; case-study link text retains its existing `none`. No selection behavior was changed. `corepack pnpm check` passes with two existing v-html warnings. No foreground control.
## To Do
- Await visual feedback; no further code changes scheduled for these two fixes.
## Ready For Human QA
- Direct-entry writing → Home: use the shared-element return when the post is in Latest Writing; retain normal page navigation for an absent post, including failure fallback and static-only payload lookup. **Outcome:** membership comes from the actual Home posts data; static clients use Nuxt's generated Home payload, with hover/focus preparation and an immediate-click lookup. A fresh included-post profile with empty Home data and source registry reaches the moving reverse morph; an absent post and an injected membership-fetch failure use ordinary navigation with no clone. A subsequent normal Home → detail → Home trip also morphs in both directions. All runs finish without errors or leftover transition nodes. Direct-entry visual link: `http://127.0.0.1:3058/writing/why-design-systems-are-not-component-libraries-1e44ee417e58`.
- Correct reading and card cursors on article lists/headings, case-study cards, writing archive rows, Latest Writing dates and testimonial body text. Implemented in the shared shell: reading elements get the text cursor, interactive descendants override it with the hand, lightbox rules retain precedence. Computed-style checks pass on all eight sampled surfaces. Manual preview: `http://127.0.0.1:3058/?trails=on#selected-work`.
## Done
- Preserve ignored verification under `report/performance-optimization/diagnosis/s31-interaction-polish-20260920/`: checksummed source copy, static build, server boot/media provenance, raw browser results and reproducible harness. Earlier preview ports/evidence remain intact. Initial cursor harness expected an excerpt on a Latest Writing layout that does not render one; removed that nonexistent-surface assertion and retained the failed run. Corrected cursor suite passes without application changes.
