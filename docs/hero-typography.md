# Homepage Hero Typography — B.L.U.F. Composition

## Status

Active spike (promoted from `docs/scratch/` on 2026-05-29). The Blue Atlas direction is merged to main; this is the first design follow-on spike picked up after that merge.

Locked decisions for this spike (detail in `## Decisions`):

- **Target composition:** port the "Bottom / Line / Up Front" overlapping wordmark from the `gendes-blue2.claudecode` branch and make it the homepage hero, *replacing* the CMS-driven kicker/title/subtitle hero currently on main.
- **Copy:** hardcoded wordmark — not CMS-driven. The hero ACF fields are removed (see the To-Do doc).
- **Scaling technique:** Approach C — container-query units (`cqw`) — is the committed lead. Approaches A/B/D below are preserved as analysis and fallback, not the plan.

The operational breakdown lives in `docs/hero-typography.todo.md`.

## Background

The homepage hero is the front door of the site. The Blue Atlas direction calls for an expressive, art-directed typographic moment that pairs three voices:

- **"Bottom" / "Line"** — Edwardian Script ITC, the flowing script voice, periwinkle (`--color-primary`)
- **"Up Front"** — Bodoni Z37, condensed bold serif, ALL CAPS, ink
- **"B.L.U.F."** — IBM Plex Mono Italic, the small technical badge in the corner

The phrase is "Bottom Line Up Front" — the acronym B.L.U.F. is a real piece of communication doctrine (lead with the conclusion), so the hero is both a name treatment and a thesis statement about how the author works. The composition is modeled on the Signal Garden moodboard reference, where a script phrase weaves diagonally through structural type and a small mono label anchors a corner.

This is deliberately *not* CMS-driven. The typography is the design; the words are fixed. The hero ACF fields (`mega_text`/`megaText`, `hero_title`/`heroTitle`, `hero_subtitle`/`heroSubtitle`) are not merely ignored — this spike *removes* them from the bootstrap plugin, GraphQL, the frontend query, and both running CMS instances (see the To-Do doc). Other front-page ACF fields (`aboutTagline`, `quickLinks`, `employerTestimonials`) are unaffected.

## Decisions

Settled with the user on 2026-05-29 before the spike was promoted:

- **Replace, don't evolve.** The wordmark from `gendes-blue2.claudecode` replaces main's current CMS-driven hero outright. It is the ambitious art-piece direction, accepted with eyes open.
- **Hardcoded copy.** The headline phrase ("Bottom Line Up Front" / the B.L.U.F. badge) is fixed in markup. Consequence: the three hero ACF fields are removed rather than left orphaned.
- **Scale as a unit via `cqw` (Approach C).** Positions *and* font-sizes go in container-query-width units so the whole composition scales together with the hero container. This is the committed plan; A/B/D remain documented as fallback only.
- **No new motion.** The only transform is the static `-3deg` script rotation. No animation, so no `prefers-reduced-motion` work is required for the hero itself.

## Current state

Two different heroes are in play, and the distinction is the whole reason this spike exists.

**What is on `main` today** (`apps/frontend/pages/index.vue`): a *CMS-driven* hero, not the wordmark. It renders three ACF-backed pieces — `mega-text` (Edwardian script, defaults to "B.L.U.F."), `hero-title` (Bodoni, ACF `title`), `hero-subtitle` (ACF `subtitle`) — inside a framed panel with concentric-circle diagram ornaments. It is already responsive (CSS grid + `clamp`). This is the thing being *replaced*.

**The target reference** (`gendes-blue2.claudecode` branch, `apps/frontend/pages/index.vue`): the "Bottom / Line / Up Front" overlapping wordmark. Note this branch is the visual reference for the *look*, not a solved responsive technique — it is pixel-pinned exactly like the sketch below and abandons the composition on phones. Its composition:

- `.hero-display` is a `position: relative` stage with `min-height: clamp(22rem, 52vh, 40rem)`.
- `.title-script-1` ("Bottom"): `position: absolute; top: 100px; left: 220px; transform: rotate(-3deg)`
- `.title-script-2` ("Line"): `position: absolute; top: 190px; left: 55px; transform: rotate(-3deg)`
- `.title-serif` ("Up Front"): `position: absolute; top: 230px; left: 370px`
- `.hero-badge` (B.L.U.F. + star): `position: absolute; top: 0; right: 0`
- Font sizes are fluid (`clamp(4.5rem, 13vw, 12rem)` for script, `clamp(2.25rem, 6vw, 5rem)` for serif) but **positions are fixed pixels**.
- A phone breakpoint (`max-width: 767px`) drops the absolute composition entirely and stacks the pieces in normal flex flow so nothing clips.

It looks good at the desktop width it was tuned at. The hand-tuning was done in DevTools in a few minutes; it is a sketch, not a final solution. The work of this spike is to bring that composition onto `main` and make it scale as a locked unit (Approach C).

**Token-name caveat when porting:** `gendes-blue2.claudecode` uses `--font-script` / `--font-display-serif`; `main` uses `--font-edwardian` / `--font-bodoni`. Map to the `main` names. The mono badge uses `--font-mono` on both.

## Why this is hard

There's a real tension between two things we both want:

1. **Tight, intentional spacing.** Script faces like Edwardian Script ITC have dramatic flourishes and connecting strokes. Getting "Bottom" and "Line" to overlap so the L-flourish curls beneath the descenders — and getting "Up Front" to tuck into the negative space — requires *per-pixel* control of where each word sits. This is typesetting, not layout. CSS auto-layout (flex/grid/flow) can't express "nudge this glyph 12px left so its tail kisses that other glyph."

2. **Responsiveness.** Fixed pixel positions only compose correctly at one viewport width. The font sizes scale with `clamp`, but the *positions* don't, so as the viewport changes the words drift out of their intended relationships. Worse: because font-size scaling (clamp) and position (fixed px) scale on different curves, even proportional guesses drift.

The naive fixes each have a cost:

- Converting px → `%` / `vw`: scales positions, but text dimensions don't scale linearly with the container, so the precise overlap breaks at the edges of the range.
- Pure flow/grid layout: responsive, but can't express the tight overlapping composition at all (this is what produced the "words spread to opposite edges" failure in an earlier attempt).

The key realization: **the composition wants to scale as a single locked unit, not reflow.** If the whole arrangement — words, positions, rotations, overlaps — is treated as one graphic that scales up and down together, the internal relationships stay perfect and only the overall size changes. That reframes the problem from "responsive layout" to "scale a fixed canvas."

## Candidate approaches

### Approach A — Scale a fixed-dimension stage (CSS `transform: scale`)

Define the hero composition inside a stage element with a fixed intrinsic size (say `1000 × 520`), position everything with absolute pixels inside it (exactly the hand-tuned sketch we already have), then scale the entire stage to fit the available width:

```scss
.hero-stage {
  position: relative;
  width: 1000px;   // intrinsic design size
  height: 520px;
  transform: scale(var(--hero-scale));
  transform-origin: top left;
}
```

`--hero-scale` is driven by a container query or a `clamp`-of-a-ratio. The absolute px children never change; the stage just gets bigger or smaller as a whole, preserving every overlap and tracking decision exactly.

- **Pros:** keeps the pixel-perfect sketch we already have; internal relationships are frozen; conceptually simple; the design tool (DevTools nudging) maps 1:1 to the final code.
- **Cons:** `transform: scale` doesn't change layout box size, so the surrounding panel height needs to track the scaled height (solvable with `aspect-ratio` on a wrapper or a container query). Text rendered at fractional scale can look very slightly soft at some scale factors. Need to handle the scale math cleanly (container query units make this easy: `--hero-scale: calc(100cqw / 1000)` clamped to a max of 1).

### Approach B — SVG text with a viewBox

Render the whole composition as inline SVG `<text>` elements positioned with exact coordinates inside a `viewBox`. The SVG scales perfectly to any width via the viewBox with zero additional math.

```html
<svg viewBox="0 0 1000 520" class="hero-svg" role="img" aria-label="Bottom Line Up Front">
  <text x="220" y="180" class="svg-script" transform="rotate(-3 220 180)">Bottom</text>
  <text x="55"  y="320" class="svg-script" transform="rotate(-3 55 320)">Line</text>
  <text x="370" y="430" class="svg-serif">Up Front</text>
</svg>
```

- **Pros:** flawless scaling at any size; exact coordinate control identical to the absolute-px sketch; rotations are trivial; crisp at all sizes (vector). The viewBox does all responsive work for free.
- **Cons:** accessibility needs care — use `role="img"` + `aria-label` for the whole thing, or `<title>`; SVG `<text>` doesn't reflow so mobile needs a separate SVG or a switch back to HTML; the fonts must be loaded and applied to SVG text (works, but webfont FOUT behaves slightly differently in SVG); selection/copy of the text is degraded. Harder to tweak casually than HTML/CSS.

### Approach C — Container query units (cqw / cqi)

Position everything in `cqw` (container-query-width) units instead of px. The composition then scales with the container's width specifically (not the viewport), scoped and predictable.

```scss
.hero-display { container-type: inline-size; }
.title-script-1 { top: 19cqw; left: 22cqw; }
```

- **Pros:** native, no transform tricks, scales with the container; modern and clean.
- **Cons:** still suffers the font-size-vs-position curve mismatch unless the font sizes are *also* in cqw (which we can do — set everything in cqw and the whole thing scales together, effectively achieving Approach A's "scale as a unit" but with units instead of transform). Vertical positions in cqw tie height to width, which is usually fine for a hero but can feel off at extreme aspect ratios.

**Note:** Approach C with *everything* in `cqw` (positions *and* font-sizes) is functionally equivalent to Approach A — both lock the composition and scale it as a unit. C does it with units; A does it with a transform. C is arguably the cleaner modern expression if browser support is acceptable (container query units are widely supported as of 2024+).

### Approach D — Leave it pixel-pinned, handle breakpoints discretely

Accept that the composition is a desktop art-directed piece, keep the absolute px, and define 2–3 discrete breakpoint variants (desktop / tablet / phone) each hand-tuned. No fluid scaling between them.

- **Pros:** every breakpoint is exactly as good as the hand-tuned desktop; no scaling softness; simplest mental model.
- **Cons:** more hand-tuning; "jumps" between breakpoints rather than fluid scaling; three sets of magic numbers to maintain; awkward widths between breakpoints still drift.

## Recommendation (current lean)

> **Decided: Approach C (everything in `cqw`).** The comparison below is preserved as the reasoning behind that choice and as the fallback ladder if C proves fiddly in implementation. A is the first fallback; B is reserved for if A/C both fight us; D is the floor.

**Approach C (everything in `cqw`) or Approach A (scale a fixed stage)** — they're two expressions of the same correct idea: lock the composition and scale it as one unit.

- If we want the cleanest modern CSS and the browser support is fine: **Approach C**, with both positions and font-sizes in container-query units, so the whole composition is one scalable graphic. Tighten the desktop look in px first (as already done), then convert the locked values to `cqw`.
- If container-query units feel risky or the math gets fussy: **Approach A** (fixed stage + `transform: scale`) achieves the same result with a more battle-tested technique.
- **Approach B (SVG)** is the most bulletproof for scaling and the most precise, and is worth prototyping if A/C prove fiddly — but the accessibility and mobile-reflow overhead make it the heaviest option. Reserve for if we decide the hero composition is truly fixed and graphical.
- **Approach D** is the fallback if fluid scaling produces softness or rendering issues we can't tolerate.

The throughline: **don't try to make the composition reflow.** Tune it once in pixels at a reference size, then scale that whole reference as a unit. The hand-tuning the human already did is not throwaway — it's the source-of-truth design that any of A/B/C preserves.

## Typography details

- **Edwardian Script ITC** and **Bodoni Z37** are licensed faces, served locally from `apps/frontend/public/fonts/` (source copies in `docker/private-plugins/`, both gitignored). `@font-face` declarations live in `packages/styles/_type-fonts.scss` with `font-weight: 100 900` so any requested weight maps to the single available cut.
- The family CSS variables (`--font-edwardian`, `--font-bodoni`) are defined explicitly with quoted strings in `packages/styles/context-role/_vue-frontend.scss` — they can't be SCSS-interpolated because "Bodoni Z37" contains a numeric token that breaks unquoted CSS font-family parsing.
- Tracking/kerning: the tightness the human wants between glyphs is part of the design. Whatever approach we pick must preserve sub-pixel relationships between "Bottom" and "Line" specifically (the L-flourish overlap).
- Rotation is a static `-3deg` on the script words. It is not animation; no `prefers-reduced-motion` handling is needed.

## Accessibility

- The visible h1 is composed of three spans ("Bottom", "Line", "Up Front") so the accessible name reads "Bottom Line Up Front" — correct.
- The B.L.U.F. badge sits outside the h1 and reads before it. Acceptable; consider whether "B.L.U.F." should have an `aria-label` expanding the acronym ("Bottom Line Up Front") or whether the letter-by-letter read is fine.
- The star ornament is `aria-hidden`.
- If we move to SVG (Approach B), accessibility must be re-established with `role="img"` + `aria-label`, and the decorative pieces marked `aria-hidden`.
- Contrast: periwinkle (`#2657eb`) script on the cream paper-grid texture must hold 4.5:1 (large-text 3:1 minimum easily met at display size). Ink "Up Front" on cream is fine. Verify on the actual paper-grid texture, not a flat swatch.

## Open questions

- ~~Is the hero composition truly fixed forever?~~ **Resolved: fixed.** The phrase is hardcoded and the hero ACF fields are removed. If the phrase ever needs to change, that is a new spike, not a parameterization burden carried now.
- Should this composition technique generalize? The writing index (`pages/writing/index.vue`) and other pages have display headlines. Is the script+serif+mono treatment a one-off hero signature, or a reusable display-type system? If reusable, that argues for a documented, parameterized approach over a bespoke pixel sketch.
- How does the composition behave at very tall/narrow vs very wide/short viewports? The reference is designed for a roughly landscape hero panel.
- Does the paper-grid texture behind the type ever compete with the script legibility? Might need a subtle scrim or reduced grid opacity behind the words specifically.
- Tablet range (768px up to the desktop tuning width) is currently the least-defined zone — the phone breakpoint stops at 767px and the desktop composition is pixel-pinned above that. This is the gap a fluid approach (A/C) closes automatically.

## Implementation when picked up

1. Finalize the desktop composition in pixels (the current sketch is the starting point — refine tracking/overlap until it's genuinely good, not just "sketched in a few minutes").
2. Pick the scaling approach (lean: C or A).
3. Convert the locked pixel composition to the chosen scalable form, verifying the internal relationships survive at min and max sizes.
4. Define the mobile/portrait behavior — either a scaled-down version of the same composition, or the existing flow-stacked fallback, whichever reads better small.
5. Verify across the tablet range explicitly.
6. Re-check contrast on the live paper-grid texture and AA for the script color.
7. Confirm SSR/static rendering doesn't FOUT badly while the local fonts load (the `font-display: swap` fallback chain should degrade to cursive/serif gracefully).

## Related files

- `apps/frontend/pages/index.vue` — the hero composition (scoped style)
- `packages/styles/_type-fonts.scss` — `@font-face` for Edwardian Script ITC + Bodoni Z37
- `packages/styles/_type-palette.scss` — `$font-edwardian`, `$font-bodoni` Sass variables
- `packages/styles/context-role/_vue-frontend.scss` — `--font-edwardian` / `--font-bodoni` CSS variables (explicitly quoted)
- `apps/frontend/public/fonts/` — the served woff2 files (gitignored)
- `docker/private-plugins/` — source copies of the licensed fonts (gitignored)
- `docs/archive/gendes-brief.md` — the synthesis brief, Typography section, describes the BLUF experiment

## Not in scope

- Changing the headline phrase or making the hero CMS-driven (it is intentionally hardcoded).
- The rest of the page composition (Vital Info, Selected Work, etc.) — this spike is only the hero type.
- Font licensing decisions — the fonts are kept local and gitignored; whether/how to ship them to production is a separate concern for the deploy path.
- Motion/animation on the hero — there is none beyond the static rotation, and none is proposed here.
