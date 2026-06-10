# Case Study Hero — To Do

## Background

Conceptual doc: `docs/case-hero.md`. This doc tracks the gated implementation.

Working direction: CSS halftone duotone filter on case study hero images, slip panel removed, with future phases for transition animation, frame-breaking gestures, and writing-detail divergence. Specimen-plate / split-layout / scrim variants are held in reserve as aesthetic backups, not legibility fallbacks.

## Project Organization

This spike is **gated**. Each phase ends at a decision checkpoint with human visual QA. We do not move to the next phase until the current one is confirmed visually right (or until we decide it's wrong and pivot). The "To Do" section below lists only the *active* phase plus its decision gate; later phases live under "Future Phases (Gated)" as scoped intent, not decided work.

Each gate is a real decision point. It can:

- **Proceed** to the next phase.
- **Iterate** within the current phase (adjust parameters, retry).
- **Pivot** to a reserve direction (specimen plate, split layout, etc.) if the current direction isn't landing.

## General Principles

- One piece at a time. Filter first, then transition, then frame-breaking. Do not pre-decide downstream phases.
- Visual QA between every phase. Each phase produces something the user can see in a browser before we decide what's next.
- **BTAK rule**: no decorative labels that perform meaning ("CASE STUDY · 2024", date strips, etc.). Materials carry the meaning, not labels.
- The featured-media transition contract (`data-featured-*` attributes, slip-source geometry hooks) must remain intact even if the visible slip is removed — the transition code reads geometry from these hooks. The title region needs to stay addressable.
- CSS-only halftone (leanrada's approach). Do not reach for SVG/WebGL/canvas — validated as unnecessary, and CSS is friendlier for animation, hover, and perf.
- Use existing FLIP infrastructure. Do not add GSAP.

## Current State Overview

- `packages/styles/shared-components/_featured-media-overlay.scss` defines `slip-surface` and `slip-title` mixins. Currently consumed by `CaseStudyCard.vue`, `pages/case-studies/[slug].vue`, and `pages/writing/[slug].vue`. The mixin renders as a near-opaque cream rectangle (`color-mix(var(--color-surface) 93%, transparent)`) with a faint ink border on top of the featured image. **This spike only touches the case-study consumers**; the writing-detail consumer is the bento-writing spike's responsibility. Leave the mixin file in place after Phase 1 since the writing detail page may still use it until that spike lands.
- The featured-media transition (`composables/useFeaturedMediaTransition.ts`, `components/transitions/FeaturedMediaTransitionLayer.vue`) reads geometry from `data-featured-*` hooks on cards and details. Working and not to be regressed.
- No filter is currently applied to featured images — they render in native gamut.
- No halftone implementation in the codebase yet.
- Existing case study image set is small and admittedly mediocre; the halftone may forgive or expose this. Treat existing images as the QA fixture set for phase 1.

## Status — decision pending between two directions (2026-06-04)

The halftone direction has been implemented end-to-end (across detail hero, card, and transition layer) and explored across multiple sub-variations (CMYK leanrada-faithful, soft separate-K, true duotone via SVG color matrix, tritone, chromatic aberration overlay, duotone bleed). Conclusion from that exploration: the technique works but doesn't fit Blue Atlas as a *dominant* register, and a global halftone filter does not solve WCAG-AA legibility for text-on-image.

A nine-variant settings matrix was then captured against two case-study images (artifact: `temp-ref-assets/hero-comparison.pdf`) and reviewed on 2026-06-04. That review surfaced a path the original pivot didn't account for. See the "Halftone exploration — what we found," "Reconsideration — alternative directions on the table," and "Settings-matrix review — what surfaced (2026-06-04)" sections in the conceptual doc (`docs/case-hero.md`) for the full writeup, including the durable lessons.

**Two directions are now on the table; the decision is the immediate blocker:**

- **(A) Editorial-split / alternating bands.** Layout change. Title sits in a solid text band; image band sits above (or below). Halftone optionally preserved as image-band styling. Reference: henry.codes / `gendes-henry.copilot` branch.
- **(B) Figure-ground-inversion image treatment.** No layout change. A variant from the {crisp engraving, ink + signal-blue + cream, ink title} family (or its softer linear cousin) renders the illustration as blue ink on cream paper; the title sits in the cream zones on solid ground by virtue of the technique inverting figure and ground. Variant #6 in the matrix is the strongest candidate within this family; variants #1 and #4 are the softer cousins.

Either direction is consistent with the durable lessons in the conceptual doc. The choice is between scope (layout vs. image-only) and the resulting visual register.

**Halftone implementation stays in the codebase** as a reference while the decision is open. The spike-controls panel in `pages/case-studies/[slug].vue` also stays — it's the affordance that makes the comparison possible.

## To Do — make the direction decision, then execute (active)

The single immediate blocker is the (A) vs. (B) decision. Everything after it forks on which direction wins.

- [ ] **Decide between (A) editorial-split and (B) figure-ground-inversion image treatment.** Decision artifact: `temp-ref-assets/hero-comparison.pdf` plus the conceptual doc's 2026-06-04 review. Considerations: brand-fit (does the resting register read as Blue Atlas?), subject-robustness (does it hold across the existing uneven case-study image set?), scope (layout change vs. image-treatment change), and whether the card-to-detail transition wants the image and title spatially together (B) or separated (A).

### If (A) editorial-split wins

- [ ] Prototype a banded layout on the case-study detail hero: full-width image band on top, full-width text band below carrying title (and excerpt if useful). Reference: `gendes-henry.copilot` branch.
- [ ] Decide whether the image band keeps the halftone treatment, runs the raw photo, or uses something else. Working hypothesis: preserve halftone within the image band, where text legibility is not at stake.
- [ ] Title typography in the text band: mono italic per Blue Atlas. Ink-on-cream or cream-on-ink depending on band alternation. WCAG AA unconditional since the ground is solid.
- [ ] Verify the card-to-detail featured-media transition. With image and title spatially separated, the current "fly the image clone" approach may want to evolve. Geometry hooks (`data-featured-*`) must stay intact regardless.
- [ ] Reconcile the card. Card currently carries halftone; decide whether it follows the detail's new layout or diverges.

### If (B) figure-ground-inversion wins

- [ ] Lock in the variant settings as the committed default in `_halftone-image.scss`. Working candidate is variant #6 (crisp engraving, ink + signal-blue + cream pair, ink title).
- [ ] Remove the spike controls panel from `pages/case-studies/[slug].vue`.
- [ ] Verify the card and `FeaturedMediaTransitionLayer` render the committed variant consistently (the halftone is already wired into all three surfaces; this is a settings-alignment check, not new implementation).
- [ ] Verify the title sits reliably in cream-ground zones across the existing case-study images. If specific images fail, decide between per-image tuning (low cost given ~single-digit case-study count) or an editorial gamut rule for future images.
- [ ] Re-test the card-to-detail transition end-to-end.

### Decision gate (after either path lands)

- Does the case-study hero read as Blue Atlas (structural / specimen / diagram register), not as a stylized image?
- Is title legibility unconditional? (For A: text on solid ground. For B: title reliably in cream-ground zones across all current case-study images.)
- Does the card-to-detail transition still work?
- Is the spike narrative complete enough to archive: conceptual doc + this to-do moved to `docs/archive/`, durable lessons folded into `docs/visual-design.md`, mixin library either retained (B) or marked image-band-only (A)?

If yes → close the spike. If no → back to the conceptual doc's reconsideration list (which now has more options on it than when this spike opened).

## Likely future work — held loosely

Direction sketches, not committed plans. Listed so they don't get lost; expect them to evolve or get dropped as we learn from the current work. Don't let this list pre-frame the next step's design.

- **Halftone as image-band styling.** If editorial-split lands, the halftone treatment we built is a candidate for styling the image band specifically. Already implemented and tunable via the existing mixin/customprop interface.
- **Specimen plate / labeled card** as an alternative to full alternating bands — still on the table per the reconsideration section in the conceptual doc.
- **Frame-breaking gesture (rounded corner)** — still in play once the layout direction is settled.
- **Card and transition update** — once the detail's layout is settled, the card hero and the transition both need to be brought in line. The current state has halftone on all three surfaces; whatever the detail becomes, the card and transition should follow.
- **Cleanup and archive** — when settled: coordinate with the bento-writing spike before deleting shared mixin code; fold durable lessons into `docs/visual-design.md`; move spike docs to `docs/archive/`.

## Ready for Human QA

_(nothing yet — Phase 1 implementation has not started)_

## Done

_(nothing yet — spike just opened 2026-06-01)_

## Notes / scratch

### Converging settings (in-progress — 2026-06-03)

After extensive iteration on the leanrada halftone implementation, the working settings the user has tuned to:

```
Size:          8px
Bleed:         0.45
Contrast:      1000
Sepia:         0.35
Saturation:    1.50
K image br:    0.80
K mode:        Soft (highlight detail) — see below
```

**Soft K vs Crisp K**: the user landed on **soft K** as the resting choice. Soft K diverges from leanrada's faithful implementation by stripping the threshold filter chain from the K pane — instead of `brightness() blur() contrast(1000) blur()`, the soft K pane uses just `blur() blur()`. This makes the K layer carry continuous-tone luminance that multiplies with main as a soft shadow plate, preserving highlight detail. K dots become soft gradient blobs in mid-tones/shadows instead of crisp threshold dots; the main pane still carries the crisp CMY halftone aesthetic.

Trade-off the user named explicitly: soft K gains highlight detail but loses some vibrancy compared to "no K" mode. Both look good for different purposes.

### Reserved alternate: "No K" vibrant variant for hover/active states

The user noted that **No K layer + same other settings** has a punchier, more vibrant read that could work well as a *hover state* (or other transient state) on top of the soft-K default. The vibrancy/highlight-detail trade-off becomes a useful dynamic gesture: soft-K detail at rest → no-K pop-art vibrancy on hover. Worth holding for the Phase 2 transition animation work — could be wired alongside the dot-density animation.

Settings for the "No K" hover-state variant: same as above except K mode = Off.

### Structural facts about leanrada CSS halftone (durable lessons)

These are worth folding into `docs/visual-design.md` when the spike closes:

- The technique is fundamentally posterizing — contrast(1000) thresholds each color channel to 0/1, producing at most 8 RGB primaries per pixel. Per-pixel highlight detail is structurally not possible; detail is carried by cell-level dot-size modulation and (in soft-K) by continuous K shading on top.
- Sepia at the outer box is leanrada's softening pass that desaturates the harsh CMYK primary output into "muted printed photo" register. Without sepia (or some equivalent saturation drop), the output reads pop-art.
- The two rotated ink planes (`::before` at 30°, `::after` at -21° + translate) need much more pseudo-extension than leanrada's `inset: -30%` for wide aspect ratios — we use `inset: -100%`.
- The K layer's structural role is shadow density, not highlight detail. The "highlight detail" the user wants is best served by either (a) the soft-K continuous-tone shading multiplied with main, or (b) accepting the threshold trade-off and using vibrancy/contrast as the visual signature instead.


- Trail/echo animation from `gendes-seamless.codex` is a future consideration only — phase 2 starts with halftone-density animation on the existing FLIP morph, not a new motion system.
- BTAK reminder: no "CASE STUDY · 2024" or similar labels on the panel/title. Materials, not labels.
- The user has noted current case study images (Travis County, USCIS, Job Corps) are uneven in quality. A halftone filter forgives mediocre source material more than a clean composition does — this is a practical benefit of the filter direction.
- The body-text overlap reference is the author's older desert-jackalope portfolio in `temp-ref-assets/`. The overlap candidate has been **moved out of this spike**; it now lives in the bento-writing spike as a candidate for writing-detail frame-breaking. Phase 3 here is rounded-corner-or-equivalent, not overlap.
- The writing detail page (`apps/frontend/pages/writing/[slug].vue`) is **out of scope** for this spike. The bento-writing spike owns writing-side hero treatment so the homepage writing section and the writing detail page can be redesigned coherently together.
