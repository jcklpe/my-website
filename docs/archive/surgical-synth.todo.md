# Surgical Synthesis — To Do

## Background

Conceptual doc: `docs/surgical-synth.md`. This doc tracks the implementation of visual refinements from the `gendes-blue2.claudecode` and `gendes-blue2.codex` branches.

Working strategy: Phase 1 items are safe to implement now (no spike conflicts). Phase 2 items touch surfaces actively being reshaped by the case-hero and bento-writing spikes and must wait until those spikes complete and merge to main.

## Project Organization

This is **not** a gated spike — it's a cleanup/polish pass with two discrete phases:

- **Phase 1**: Safe-to-implement items that don't conflict with active spikes. These can be done now.
- **Phase 2**: Items that touch surfaces being redesigned by bento-writing. These must wait for that spike to complete, then integrate against the new structure.

Each phase's tasks are independent surgical edits, not iterative design exploration. Visual QA happens after each phase completes, not between individual tasks.

## General Principles

- Keep changes surgical: one file, one specific visual treatment per task. Do not expand scope.
- Verify behavior doesn't regress: featured-media transitions, responsive behavior, reduced-motion fallbacks.
- Run `corepack pnpm check` after each group of changes to verify lint/typecheck/editor CSS generation.
- Git extract commands are documented in `docs/surgical-synth.md` for reference when implementing each item.

## Current State Overview

- **Tables**: ✅ Blue underline on `th` — done in Phase 1.
- **Footer**: ✅ Blue top border — done in Phase 1.
- **Latest Writing section**: `.section-label` is a card-like box (`border-window`, gradient background, `shadow-hard-low`, `overflow: hidden`). The crosshair circle `::after` is clipped by `overflow: hidden` and cannot break out of the box. The section now renders `HomeBentoPostList` (bento-writing shipped). The `.more-link` archive link is already centered (`margin-inline: auto`).
- **Post cards**: Square-cornered, `border-window` thick outline, `shadow-hard-low`. Featured image is flush at the top inside the border — no top padding. Hover lifts the card and changes border to signal blue; no background tint. Cards now have bento layout props (`layout`, `showExcerpt`, `imageSizes`) from the bento-writing spike.
- **Case Studies title bar**: Codex version archived at `docs/scratch/case-studies-title-bar-reference.txt` for reference only.

---

## To Do — Phase 1: Safe surgical edits (no spike conflicts)

(Phase 1 complete — items moved to Ready for Human Visual QA)

---

### Phase 1 Completion Gate

- [x] Run `corepack pnpm check` — verify lint, typecheck, and editor CSS generation pass
- [x] Visual QA: load homepage, case study detail, writing detail, and writing archive in browser
- [x] Verify tables (if present in content) have blue underlines on headers
- [x] Verify footer has blue top borders (at top of footer and above base section)
- [x] Verify no regressions to featured-media transitions, responsive behavior, or reduced-motion fallbacks

**Phase 1 Complete** — items moved to Done section.
## To Do — Phase 2: Complete (2026-06-25)

---

### 3. Post Card — Rounded Corners + White Space + Shadow

**Goal**: Add rounded corners, padding above featured image inside card frame.

- [ ] Extract current claudecode post card styling: `git show gendes-blue2.claudecode:apps/frontend/components/navigation/cards/PostCard.vue > /tmp/claudecode-PostCard.vue`
- [ ] Compare with new post-bento-writing main version
- [ ] Add `border-radius` to `.post-card` (likely `4px` or `6px` based on claudecode)
- [ ] Add top padding/margin inside the card to create white space above `FeaturedMediaFrame`
- [ ] Verify featured-media transition still works (geometry hooks must stay intact)
- [ ] Verify at phone width

**File**: [apps/frontend/components/navigation/cards/PostCard.vue](apps/frontend/components/navigation/cards/PostCard.vue)

---

### 4. Latest Writing Section — Circle Symbol Breakout

**Goal**: Make the crosshair/target circle visually break out of the section banner's top/bottom boundaries.

**Current problem**: `.section-label` has `overflow: hidden`, clipping the circle symbol inside the box.

**Claudecode solution**: Uses `.section-banner` (not `.section-label`) — simpler structure with top/bottom border lines (no gradient background or box shadow), and the symbol sized larger than the banner height so it naturally extends beyond boundaries.

- [ ] Extract claudecode Latest Writing section: `git show gendes-blue2.claudecode:apps/frontend/components/home/HomeLatestWritingSection.vue > /tmp/claudecode-LatestWriting.vue`
- [ ] Compare with new post-bento-writing main version
- [ ] Decide structural approach:
  - Option A: Replace `.section-label` card structure with simpler `.section-banner` (borders but no overflow clipping)
  - Option B: Keep bento-writing's structure but move the circle outside the overflow container as an absolutely-positioned sibling
- [ ] Ensure the symbol extends above/below the banner boundaries visibly
- [ ] Verify at phone width

**File**: [apps/frontend/components/home/HomeLatestWritingSection.vue](apps/frontend/components/home/HomeLatestWritingSection.vue)

---

### 5. Latest Writing Section — Sizing and Color Synthesis

**Goal**: Incorporate codex sizing/color preferences while keeping claudecode's circle breakout mechanic.

**Approach**: This is subjective polish and requires visual comparison between codex and claudecode versions against the new bento-writing structure.

- [ ] Extract both versions:
  - `git show gendes-blue2.codex:apps/frontend/components/home/HomeLatestWritingSection.vue > /tmp/codex-LatestWriting.vue`
  - `git show gendes-blue2.claudecode:apps/frontend/components/home/HomeLatestWritingSection.vue > /tmp/claudecode-LatestWriting.vue`
- [ ] Compare heading size, section padding, background colors/gradients between codex, claudecode, and new main
- [ ] Decide which palette/sizing treatment is strongest
- [ ] Integrate chosen treatment while preserving the circle breakout from claudecode (or item #4 above)
- [ ] Visual QA — does the section composition feel balanced?

**File**: [apps/frontend/components/home/HomeLatestWritingSection.vue](apps/frontend/components/home/HomeLatestWritingSection.vue)

---

### 6. Post Card — Blue Hover Highlight

**Goal**: Add background color change on post card hover (not just border + lift).

**Codex treatment**: Likely adds `background: var(--color-signal-soft)` or `background: var(--color-surface-screen)` on hover for a subtle blue tint.

- [ ] Extract codex post card: `git show gendes-blue2.codex:apps/frontend/components/navigation/cards/PostCard.vue > /tmp/codex-PostCard.vue`
- [ ] Compare hover state between codex and new main
- [ ] Add background color change to `.post-card:hover`
- [ ] Verify it doesn't conflict with featured-media transition (which hides certain elements — background changes need to coordinate)
- [ ] Verify reduced-motion fallback

**File**: [apps/frontend/components/navigation/cards/PostCard.vue](apps/frontend/components/navigation/cards/PostCard.vue)

---

### 7. View Writing Archive Link — Codex Style

**Goal**: Decide whether to simplify the View Archive link styling.

**Current state**: Bordered button (`border-signal`, signal blue, uppercase mono), already centered (`margin-inline: auto`). Centering is done.

**Codex treatment**: Possibly simpler — text with arrow or underline animation rather than a bordered button.

- [ ] Extract codex Latest Writing section: `git show gendes-blue2.codex:apps/frontend/components/home/HomeLatestWritingSection.vue > /tmp/codex-LatestWriting.vue`
- [ ] Compare link styling between codex and current main — if codex is genuinely stronger, adopt it; otherwise leave the bordered button as-is
- [ ] Verify prefetch hooks still work
- [ ] Verify link is keyboard-accessible and has correct focus styles

**File**: [apps/frontend/components/home/HomeLatestWritingSection.vue](apps/frontend/components/home/HomeLatestWritingSection.vue)

---

### Phase 2 Completion Gate

After implementing items 3–7:

- [ ] Run `corepack pnpm check` — verify lint, typecheck, and editor CSS generation pass
- [ ] Visual QA: load homepage, verify Latest Writing section and post cards render correctly
- [ ] Verify featured-media transitions from homepage post cards to writing detail pages still work
- [ ] Verify responsive behavior at phone/tablet widths
- [ ] Verify reduced-motion fallbacks for any new hover/transition effects

**Ready for Human Visual QA**: (items move here after implementation but before marking complete)

---

## Done

### Phase 1: Safe Surgical Edits ✓

Completed 2026-06-02. All items verified and merged.

**1. Table Header Blue Underline**
- Changed `@mixin table-header-cell` in `packages/styles/shared-components/_table-block.scss`
- `border-bottom: effect.$border-strong;` → `border-bottom: 2px solid color.$color-primary;`
- Table headers now render with electric blue underline instead of semi-transparent ink

**2. Footer Blue Top Borders**
- Changed `.site-footer` and `.base` in `apps/frontend/components/navigation/SiteFooter.vue`
- Both now use `border-top: 1px solid var(--color-primary);` instead of `var(--border-strong)`
- Footer renders with blue lines at top edge and above copyright/source section

### Phase 2: Post-Bento-Writing Polish ✓

Completed 2026-06-25. All items verified.

**3. Post Card — Rounded Corners**
- Added `border-radius: 8px` and `overflow: hidden` to `.post-card` base class
- The rounded clip is the visual effect — no explicit top padding needed
- Removed redundant `overflow: hidden` from the three layout variant rules (now inherited)
- Neither reference branch had a background hover tint; current border + lift is correct

**4. Latest Writing Section — Circle Breakout + Banner Restructure**
- Replaced `.section-label` card (border-window, gradient, shadow, overflow:hidden) with `.section-banner` (top + bottom 1px signal-blue borders, no card framing)
- Moved crosshair symbol from `::after` pseudo-element to a real `<span class="symbol">` so it isn't clipped
- Symbol is `clamp(4rem, 7vw, 6rem)` — larger than the banner padding — so it bleeds above and below both rules
- Title: smaller (`clamp(1.5rem, 2.5vw, 2.1rem)`), signal blue, italic mono uppercase

**5. View Writing Archive Link**
- Dropped bordered button in favour of a text link using the `rich-link` / `rich-link-hover` mixin (same animated underline as paragraph links — eliminates the code division)
- Font size bumped to `var(--type-base)`
- `→` arrow in `::after` with `translateX(4px)` nudge on hover

**6. "More about me" Link (HomeVitalInfo)**
- Moved inline `→` from template text to `::after`, matching the archive link pattern
- Added `align-items: center; gap: 0.4em` to the existing `inline-flex` layout
- Added `translateX(4px)` nudge on hover; `font-style: normal` on `::after` so arrow doesn't inherit italic
