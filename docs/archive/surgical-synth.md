# Surgical Synthesis — Final Visual Polish

## Status

**Phase 1**: ✅ Complete (2026-06-02) — Safe surgical edits implemented (table header blue underline, footer blue borders).

**Phase 2**: ✅ Complete (2026-06-25). Archived at `docs/archive/surgical-synth.md` / `.todo.md`.

## Background

During the generative design synthesis phase, specific visual treatments from two branches stood out as refinements worth preserving:

- `gendes-blue2.claudecode` — strong post card styling (rounded corners, white space, shadow), table treatments (italic + blue underline), footer blue top border, and a clean Latest Writing section banner with a symbol that breaks out
- `gendes-blue2.codex` — good hover state for post cards, better View Archive button styling, interesting section sizing/color

This doc captures those treatments so they can be integrated cleanly once the homepage Latest Writing section and post card architecture stabilize through the bento-writing spike.

---

## From `gendes-blue2.claudecode`

### 1. Post Cards — Rounded Corners + White Space + Shadow

**What**: Post cards have rounded corners, a bit of white space (padding) above the featured image inside the card frame, and the shadow treatment looks correct.

**Current state**: Cards are square-cornered with `border-window` and `shadow-hard-low`. The featured image sits flush at the top of the card with no padding between the card border and the image.

**Conflict**: ⚠️ **bento-writing spike** will redesign the post card layout for the homepage bento grid. This change should wait until that spike completes, then apply to the final post card structure.

**Git extract command**:
```bash
git show gendes-blue2.claudecode:apps/frontend/components/navigation/cards/PostCard.vue
```

**Implementation notes**:
- Add `border-radius` to `.post-card` (likely `4px` or `6px`)
- Add top padding inside the card before the `FeaturedMediaFrame` to create white space above the image (check if it's on `.link` or a wrapper div)
- Verify shadow values match current `--shadow-hard-low` or if the claudecode version has a different offset/blur

**File**: [apps/frontend/components/navigation/cards/PostCard.vue](apps/frontend/components/navigation/cards/PostCard.vue)

---

### 2. Latest Writing Section — Circle Symbol Breakout

**What**: The crosshair/target circle symbol visually breaks out of the section banner's top and bottom border lines. The symbol is sized larger than the banner height and positioned absolutely so it extends beyond the banner boundaries.

**Current state**: ❌ The circle is clipped by `overflow: hidden` on `.section-label`. The symbol sits inside a card-like container with a border, shadow, and gradient background. The symbol is a `::after` pseudo-element positioned at the bottom-right corner, but because `.section-label` has `overflow: hidden`, the circle cannot extend beyond the box.

**Conflict**: ⚠️ **bento-writing spike** will redesign the Latest Writing section layout. This should wait.

**Git extract command**:
```bash
git show gendes-blue2.claudecode:apps/frontend/components/home/HomeLatestWritingSection.vue
```

**Implementation notes** (from claudecode):
- Replace `.section-label` card structure with a simpler `.section-banner` — no box shadow, no gradient background, just top and bottom blue border lines
- Change the heading style: uppercase, letterspaced, normal weight, smaller size (not the large italic style)
- Make the symbol an actual element (`.symbol`) or absolutely-positioned `::after` without `overflow: hidden` on the parent
- Size the symbol larger than the banner height (claudecode uses `clamp(3.5rem, 6vw, 5rem)`) so it naturally extends above/below the banner
- Position: `position: absolute; top: 50%; transform: translateY(-50%);` on the symbol to center it vertically, making half extend above and half below
- Remove `overflow: hidden` from the parent container

**Alternate approach** (if keeping current card structure):
- Move the circle outside `.section-label` entirely — make it a sibling positioned absolutely relative to `.latest-writing-section`
- Use negative margins or absolute positioning with `z-index` layering to overlap the card

**File**: [apps/frontend/components/home/HomeLatestWritingSection.vue](apps/frontend/components/home/HomeLatestWritingSection.vue)

---

### 3. Tables — Italic Headings + Blue Underline

**What**: Table `<th>` elements are italicized **and** have a blue underline (not just an ink underline).

**Current state**:
- Table headings are already italic (`font-style: italic` exists in `table-header-cell` mixin) ✓
- Table headings use `border-bottom: effect.$border-strong` which is `2px solid rgba($color-ink, 0.22)` — a semi-transparent INK border

In claudecode, the table header has a blue border-bottom. The fix is to change the table-header-cell mixin specifically, not the global `$border-strong` token.

**Conflict**: ✅ **Safe to implement.** This is purely editorial block styling and doesn't touch any spike surfaces.

**Git extract command**:
```bash
git show gendes-blue2.claudecode:packages/styles/shared-components/_table-block.scss
```

**Implementation notes**:
- Change the `@mixin table-header-cell` in `packages/styles/shared-components/_table-block.scss`
- Change `border-bottom: effect.$border-strong;` to `border-bottom: 2px solid color.$color-primary;`
- This makes ONLY the table header use a blue underline, without affecting other elements that use `$border-strong` (like footer, which we'll handle separately)

**File**: [packages/styles/shared-components/_table-block.scss](packages/styles/shared-components/_table-block.scss)

---

### 4. Footer — Blue Top Border

**What**: Footer has a solid blue line border on top.

**Current state**: Footer has `border-top: var(--border-strong)` which maps to `2px solid rgba($color-ink, 0.22)` — a semi-transparent ink border.

In claudecode, the footer has `border-top: 1px solid var(--color-primary)` — an explicit blue border.

**Conflict**: ✅ **Safe to implement.** Footer structure is stable.

**Git extract command**:
```bash
git show gendes-blue2.claudecode:apps/frontend/components/navigation/SiteFooter.vue
```

**Implementation notes**:
- Change `.site-footer` border-top from `var(--border-strong)` to `1px solid var(--color-primary)` or `var(--border-signal)` if that token exists
- The claudecode version also changes the `.base` section's border-top to blue: `border-top: 1px solid var(--color-primary)`
- This keeps the footer borders independent from the global `$border-strong` token

**File**: [apps/frontend/components/navigation/SiteFooter.vue](apps/frontend/components/navigation/SiteFooter.vue)

---

## From `gendes-blue2.codex`

### 5. Case Studies Title Bar — Archive for Reference

**What**: A graphic title bar treatment for the Selected Work section that includes a "CASE STUDIES" label in a bordered card with decorative elements.

**User note**: "I like the case studies title bar piece but don't know if we really want to use that. I just think that kind of graphic element is something we should be looking at using. But I don't want the BTAK sort of double labeling of things. That section is labeled Selected Works already. So maybe this piece doesn't need to be integrated really."

**Action**: Extract the code and stow it in a scratch reference file for potential future use. **Do not integrate into the main site.**

**Git extract command**:
```bash
git show gendes-blue2.codex:apps/frontend/components/home/HomeSelectedWorkSection.vue > docs/scratch/case-studies-title-bar-reference.txt
```

**Implementation notes**:
- This is a "maybe later" piece. Extract the HTML + CSS for the title bar treatment and save it as a reference snippet.
- Could be useful for other section headers or future page types, but not for Selected Work where it would create redundant labeling (BTAK: performing meaning it doesn't carry).

---

### 6. Latest Writing Section — Sizing and Color Preference

**What**: The Latest Writing section sizing and color treatment from codex, but **keep the circle breakout mechanic from claudecode**.

**Current state**: The section heading is `clamp(2rem, 4vw, 3.5rem)` italic mono uppercase in a bordered card with gradient background. The codex version has different sizing, background gradient, and positioning but the claudecode version has the better circle breakout.

**Conflict**: ⚠️ **bento-writing spike** will redesign this entire section. This change should wait.

**Git extract command**:
```bash
git show gendes-blue2.codex:apps/frontend/components/home/HomeLatestWritingSection.vue
```

**Implementation notes**:
- This is subjective polish and requires visual comparison
- The codex version has a larger card area (`min-height: 13rem`), positioned circle with rotation (`transform: rotate(-8deg)`), and a gradient background on the section itself
- The claudecode version has the cleaner banner-with-breakout structure
- **Synthesis approach**: Use claudecode's structural approach (banner + symbol breakout) but incorporate codex's color/gradient preferences if they're stronger
- Needs human visual QA to decide which palette/sizing is better

**File**: [apps/frontend/components/home/HomeLatestWritingSection.vue](apps/frontend/components/home/HomeLatestWritingSection.vue)

---

### 7. Post Card — Blue Hover Highlight

**What**: Post cards have a blue highlight hover state (not just the lift + border color change — possibly a background tint or stronger visual change).

**Current state**: Post cards have:
```scss
.post-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-hard-mid);
  transform: translate(-0.15rem, -0.15rem);
}
```

The border changes to blue and the card lifts. The codex version may add a background color change.

**Conflict**: ⚠️ **bento-writing spike** will redesign post card layout. This should wait.

**Git extract command**:
```bash
git show gendes-blue2.codex:apps/frontend/components/navigation/cards/PostCard.vue
```

**Implementation notes**:
- Compare hover state between codex and current main
- Likely adds `background: var(--color-signal-soft)` or `background: var(--color-surface-screen)` on hover for a subtle blue tint
- Verify it doesn't conflict with the featured-media transition mechanics (the transition hides certain elements, so background changes need to coordinate)
- May also include hover effects on the title or metadata

**File**: [apps/frontend/components/navigation/cards/PostCard.vue](apps/frontend/components/navigation/cards/PostCard.vue)

---

### 8. View Writing Archive Link — Codex Style + Center Alignment

**What**: The "View writing archive" link styled like the codex version (simpler, less bordered-button treatment) and centered below the post grid.

**Current state**: The link is styled as a bordered button with mono font, uppercase, padding, and hover background fill:
```scss
.more-link {
  display: inline-flex;
  margin-inline: var(--space-6);
  padding: var(--space-2) var(--space-4);
  border: var(--border-signal);
  color: var(--color-primary);
  /* ... */
}
```

It's left-aligned (no `margin-inline: auto` or centered wrapper).

**Conflict**: ⚠️ **bento-writing spike** will redesign this area. This should wait.

**Git extract command**:
```bash
git show gendes-blue2.codex:apps/frontend/components/home/HomeLatestWritingSection.vue
```

**Implementation notes**:
- Compare link styling between codex and current main
- Codex version may be simpler: no border, just text with arrow, underline animation, or simpler visual treatment
- Add centering: change `margin-inline: var(--space-6)` to `margin-inline: auto` and ensure the link width is `inline-flex` or `inline-block` so the centering works
- Verify codex text is "View writing archive" or has different label

**File**: [apps/frontend/components/home/HomeLatestWritingSection.vue](apps/frontend/components/home/HomeLatestWritingSection.vue)

---

## Implementation Strategy

**Phase 1 Status**: ✅ Complete (2026-06-02) — Table header blue underline and footer blue borders implemented and verified.

**Phase 2 Status**: ⏳ Waiting for bento-writing spike to complete.

---

### Phase 1 — Safe to Do Now (No Spike Conflicts) ✅ COMPLETE

~~These can be done immediately without interfering with case-hero or bento-writing:~~

1. ✅ **Table header blue underline** — ~~Change `table-header-cell` mixin to use `border-bottom: 2px solid color.$color-primary;`~~ **DONE**
2. ✅ **Footer blue top border** — ~~Change `.site-footer` to use `border-top: 1px solid var(--color-primary);`~~ **DONE**
3. ✅ **Extract Case Studies title bar code for reference** — ~~archive in `docs/scratch/`~~ **DONE** (archived at `docs/scratch/case-studies-title-bar-reference.txt`)

### Phase 2 — After bento-writing Spike Completes

These touch surfaces the bento-writing spike is redesigning. Wait until that spike lands on main, then integrate:

4. **Post card rounded corners + white space + shadow**
5. **Latest Writing section circle breakout** (claudecode structure)
6. **Latest Writing section sizing/color synthesis** (codex palette + claudecode breakout)
7. **Post card blue hover highlight**
8. **View Writing Archive link codex style + centering**

---

## Git Commands Summary

Extract all relevant code at once:

```bash
# claudecode sources
git show gendes-blue2.claudecode:apps/frontend/components/navigation/cards/PostCard.vue > /tmp/claudecode-PostCard.vue
git show gendes-blue2.claudecode:packages/styles/shared-components/_table-block.scss > /tmp/claudecode-table-block.scss
git show gendes-blue2.claudecode:packages/styles/_effect-palette.scss > /tmp/claudecode-effect-palette.scss
git show gendes-blue2.claudecode:apps/frontend/components/navigation/SiteFooter.vue > /tmp/claudecode-SiteFooter.vue
git show gendes-blue2.claudecode:apps/frontend/components/home/HomeLatestWritingSection.vue > /tmp/claudecode-LatestWriting.vue

# codex sources
git show gendes-blue2.codex:apps/frontend/components/home/HomeSelectedWorkSection.vue > /tmp/codex-SelectedWork.vue
git show gendes-blue2.codex:apps/frontend/components/home/HomeLatestWritingSection.vue > /tmp/codex-LatestWriting.vue
git show gendes-blue2.codex:apps/frontend/components/navigation/cards/PostCard.vue > /tmp/codex-PostCard.vue

# Archive case studies title bar reference
git show gendes-blue2.codex:apps/frontend/components/home/HomeSelectedWorkSection.vue > docs/scratch/case-studies-title-bar-reference.txt
```

Then review the diffs and integrate the specific features listed above.

---

## Notes

- **Phase 1 complete**: Table header blue underline and footer blue borders implemented by changing the specific component styles (not the global `$border-strong` token). The table-header-cell mixin now uses `border-bottom: 2px solid color.$color-primary;` directly, and the footer uses `border-top: 1px solid var(--color-primary);` on both `.site-footer` and `.base` sections. This keeps the changes surgical and doesn't affect other uses of `$border-strong`.
- **The circle breakout requires structural changes**: The current `.section-label` has `overflow: hidden` which clips the symbol. The claudecode version uses a different structure (`.section-banner` with borders but no overflow clipping) where the symbol can naturally extend beyond the boundaries.
- **Post card and Latest Writing changes are waiting**: The bento-writing spike will reshape these surfaces significantly. Integrating visual polish now would create merge conflicts and potentially duplicate work.
- **The Case Studies title bar is reference-only**: Extracted and archived at `docs/scratch/case-studies-title-bar-reference.txt` as a pattern to potentially use elsewhere, but not integrated into Selected Work where it would be redundant labeling.
