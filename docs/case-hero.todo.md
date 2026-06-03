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

## To Do — Phase 1: Halftone filter + slip removal (active)

**Goal**: replace the slip panel on the case-study **detail** hero with a halftone duotone filter applied to the featured image. Title sits directly on the filtered image. Card stays as-is for this phase (phase 2 picks it up).

- [ ] Prototype the halftone filter in isolation
  - Adapt leanrada's pure-CSS halftone (https://leanrada.com/notes/pure-css-halftone/) to take a duotone pair from CSS custom properties so we can swap palette pairs.
  - Try color pairs against real case study images: `signal-blue + cream`, `ink + cream`, `signal-soft + cream`. Pick one for phase 1; revisit later if needed.
  - Try a few texture sizes; the user has noted small-texture / more-bleed works well on photographs.
  - Land it as a reusable utility/mixin in `packages/styles/shared-components/` — suggested filename `_halftone-image.scss`. Exposed as a class or mixin a callsite can opt into.
- [ ] Apply the halftone to the **case-study detail hero only** (`apps/frontend/pages/case-studies/[slug].vue`). Card and writing detail stay unfiltered in phase 1.
- [ ] Remove the slip from the case-study detail hero. Stop calling `@include slip-surface` / `@include slip-title` there. Title and excerpt render directly on the filtered image; type stays mono italic per the existing Blue Atlas direction.
- [ ] Pick a title placement that falls naturally against the filtered image. Default starting point: keep the current location; iterate based on how it actually reads. The placement decision is informed by what we see, not pre-decided.
- [ ] Keep the featured-media transition working. The transition reads geometry from `data-featured-*` hooks; even with no rendered slip element, the hooks need to keep pointing at a valid bounding box around the title region. Verify the card → detail and detail → card transitions still land correctly.
- [ ] WCAG AA contrast verification on title and excerpt against the filtered image gamut. The filter constrains the gamut, so this should be a calculation, but verify on a couple of real case studies.
- [ ] Mobile check — halftone texture density and title legibility at phone widths. Halftone may want different parameters at small sizes; note for future work but don't over-engineer in phase 1.

### Decision gate — end of Phase 1

Visual QA needed (specifics for the user):

- **Surface**: case-study detail page for at least 2–3 existing case studies (e.g. Travis County, USCIS, Job Corps).
- **Routes**: `/case-studies/{slug}` for each of those.
- **What to look at**: does the duotone halftone look right? Does title-on-filtered-image read as designed, or does it want a panel/scrim/plate behind it after all? Does the transition from a homepage Selected Work card still land correctly?
- **Decision branches**:
  - All looks good → proceed to Phase 2 (filter on card + transition animation).
  - Filter looks wrong → iterate on color pair / texture parameters within Phase 1.
  - Title-on-image is fragile → re-introduce a reserve element. The aesthetic backups in priority order: specimen plate (opaque, window-bordered panel) > split layout (text below image, semplice.copilot style) > scrim gradient. Each is an aesthetic move, not a legibility fix — legibility is already handled by the filter.

## Likely future work — held loosely

Direction sketches, not committed plans. Listed so they don't get lost; expect them to evolve or get dropped as we learn from the current work. Don't let this list pre-frame the next step's design.

- **Halftone on the card + transition**. The card hero will eventually need the same halftone treatment once the detail is settled. The card-to-detail transition may want to animate halftone parameters (e.g. density coarse → fine) or it may stay static; existing FLIP infrastructure should be sufficient (no GSAP).
- **Frame-breaking gesture**. Rounded-corner on the hero image was floated (Dynamic Island-style: authors compose around a known cropped zone). Body-text overlap moved to the bento-writing spike as the writing-side variant. Other gestures may emerge.
- **Hover/active state using the "no K" vibrant variant**. Captured in Notes below — could be wired alongside transition animation work.
- **Duotone direction (Blue Atlas-flavored halftone)**. Replace CMYK ink colors with brand-palette tones. May also help with text legibility by reducing color busyness — relevant to the upcoming bare-text analysis.
- **Cleanup and archive**. When settled: remove unused slip-surface usage; coordinate with the bento-writing spike before deleting shared mixin code; fold durable lessons into `docs/visual-design.md`; move spike docs to `docs/archive/`.

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
