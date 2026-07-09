# Mobile Polish Spike - To Do

## Background
This spike targets a small, concrete mobile polish pass for case-study surfaces. It was promoted from scratch notes so the work can be tracked as active implementation instead of floating as draft intent.

## Project Organization
- Conceptual doc: `docs/archive/mobile-polish.md`
- This operational doc: `docs/archive/mobile-polish.todo.md`
- Related scratch intake source: `docs/scratch/misc.md`
- Potential durability destinations after closeout: `docs/design-system.md`, `docs/visual-design.md`, and `AGENTS.md` (only if rules/patterns change)

## General Principles
- Fix the owning geometry where the bug originates.
- Do not hide layout bugs with broader overflow clipping.
- Keep mobile density intentional: do not flatten editorial layout behavior by default.
- Keep changes small and legible in Vue/SCSS files.

## Current State Overview
- We have two specific bug reports to anchor this pass:
  - Case-study detail bodyplate starts too tight after hero handoff on phone widths.
  - Case-study card border/shadow appears clipped on the right side on phone widths.
- Root-cause diagnosis for first pass:
  - Card clipping was tied to the case-study card frame overlay painting outside the card bounds (`.case-study-card::after { inset: -2px; }`) while section-level overflow guards clipped overflow on phones.
  - Bodyplate breathing room on layered mobile hero was controlled by `.content.has-paper-top` phone override in `apps/frontend/pages/case-studies/[slug].vue`; previous offset still felt too tight.
- Human visual QA has confirmed this spike as passing.

## To Do
- [x] Reproduce both issues at representative phone widths and document exact selector/element ownership for each bug.
- [x] Determine whether each issue is static layout, transition-state, or mixed.
- [x] Implement the smallest geometry fixes in owning components/styles.
- [x] Verify no new horizontal scrolling is introduced in code-level geometry (human visual confirmation still required).
- [x] Run `corepack pnpm check`.
- [x] Capture before/after notes in this doc's `Done` section.

## Ready for Human QA
- [x] On a phone-width viewport, case-study detail body starts with clearly improved breathing room after hero media.
- [x] On a phone-width viewport, case-study card border and shadow are fully visible without right-edge clipping.
- [x] No hidden-overflow side effects appear on adjacent surfaces.

## Done
- Promoted `docs/scratch/mobile-polish.md` to active-spike docs:
  - `docs/active-spikes/mobile-polish.md`
  - `docs/active-spikes/mobile-polish.todo.md`
- Updated TODO index to mark this spike active.
- Implemented first-pass mobile polish geometry fixes:
  - `apps/frontend/components/navigation/cards/CaseStudyCard.vue`
    - Changed `.case-study-card::after` from `inset: -2px` to `inset: 0` so the border overlay stays inside the card bounds and does not get clipped by section/page overflow guards on phone widths.
  - `apps/frontend/pages/case-studies/[slug].vue`
    - Increased layered mobile bodyplate handoff offset in `.content.has-paper-top` from `calc(clamp(4.5rem, 24vw, 6.25rem) + 25px)` to `calc(clamp(4.5rem, 24vw, 6.25rem) + 50px)`.
- Implemented second-pass card layout cleanup after QA feedback:
  - `apps/frontend/components/home/HomeSelectedWorkSection.vue`
    - Removed `overflow-x: clip` from `.selected-work-section` so card rendering is not masked by section-level clipping.
  - `apps/frontend/components/navigation/cards/CaseStudyCard.vue`
    - Added `box-sizing: border-box` on `.case-study-card` so its 2px frame border is included in width calculations and does not push rows past the viewport.
  - `apps/frontend/components/navigation/lists/CaseStudyList.vue`
    - Removed the old row overlap hack (`margin-top: -2px`) now that borders are in-bounds, to avoid spacing artifacts between cards.
- Implemented third-pass seam cleanup after QA feedback:
  - `apps/frontend/components/navigation/cards/CaseStudyCard.vue`
    - Removed the transparent structural border (`border: 2px solid transparent`) from `.case-study-card`.
    - Kept frame rendering on `.case-study-card::after` only, so adjacent cards do not expose cream seams between rows.
- Implemented fourth-pass border-consistency fix after QA feedback:
  - `apps/frontend/components/navigation/lists/CaseStudyList.vue`
    - Passed `is-first-card` into `CaseStudyCard`.
  - `apps/frontend/components/navigation/cards/CaseStudyCard.vue`
    - Added an `isFirstCard` prop and non-first-card class.
    - Suppressed top frame stroke on non-first cards (`.case-study-card.is-not-first-card::after { border-top: 0; }`) so seams between adjacent cards render as a single border width instead of a doubled stroke.
- Validation:
  - Ran `corepack pnpm check` successfully.
  - Lint warnings remained the expected baseline `vue/no-v-html` warnings in `apps/frontend/pages/about.vue` and `apps/frontend/pages/now.vue`.
- Spike closeout:
  - Human QA marked this spike as passing on 2026-07-08.
  - Spike docs moved from `docs/active-spikes/` to `docs/archive/`.
