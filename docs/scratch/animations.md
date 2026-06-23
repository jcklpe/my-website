# Subtle Background Animations Spike

## Goal

Add gentle ambient motion to the site that reinforces its "living document" feeling without competing with the card-to-detail page transitions. The site is currently entirely static outside of the featured-media morph. Small, slow, looping animations on background textures or decorative surfaces would add warmth.

---

## What "subtle" means here

- Slow (5–30 second loop), barely perceptible on first look.
- Stops or pauses for `prefers-reduced-motion`.
- Does not repaint on every frame at full frame-rate — step animations or low-FPS canvas are preferable to 60fps canvas on mobile.
- Does not animate anything that carries information (text, navigation, cards).

---

## Candidate surfaces and approaches

### 1. Animated texture dot field (CSS animation)

The testimonials section currently uses a radial-gradient signal-dot pattern as a background. A very slow CSS animation on `background-position` creates a drifting parallax effect on the grid.

```css
@keyframes drift {
  to { background-position: 20px 20px; }
}
.inner {
  animation: drift 6s linear infinite;
}
```

Pros: zero JavaScript, zero DOM, ~0 performance cost. Cons: can only translate; can't add complexity (pulse, shimmer). Good starting point.

### 2. CSS animation on the BLUF hero texture / grain

If the hero ever gets a noise/grain overlay (CSS `url('data:...')` SVG turbulence or a PNG grain overlay), animating its `background-position` gives a film-grain shimmer.

```css
@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10%       { transform: translate(-2%, -3%); }
  30%       { transform: translate(3%, 2%); }
  60%       { transform: translate(-1%, 4%); }
  80%       { transform: translate(2%, -2%); }
}
.grain-overlay { animation: grain 0.8s steps(1) infinite; }
```

Pairs well with the baked halftone pipeline when it lands.

### 3. Slow CSS gradient animation on section dividers

The `--color-primary` accent blue could pulse very slowly in the section-label rule above "Selected Work" or in horizontal rules between page sections — like a breathing indicator.

```css
@keyframes pulse-width {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
.section-label::before { animation: pulse-width 4s ease-in-out infinite; }
```

### 4. requestAnimationFrame canvas (higher fidelity, heavier)

For more complex animation — e.g. particles floating slowly over the screen background, or an ink-diffusion effect — a `<canvas>` element behind the page content with low-FPS requestAnimationFrame (target 12–15fps for grain/organic feel) would work.

Cost: needs Intersection Observer to pause when off-screen, needs resize handling, needs `prefers-reduced-motion` check, adds JS payload. Reserve for a deliberately animated surface, not ambient background.

### 5. GSAP (already a project dependency for the transition system)

GSAP's `.to()` with `repeat: -1, yoyo: true` can drive slow animations on any CSS property. Since GSAP is already loaded for featured-media transitions, using it here adds minimal overhead.

Reasonable targets: slow shimmer on the testimonials section header rule, slow color shift on decorative border accents. Not worth importing GSAP just for these — use CSS animations if GSAP isn't already on the page for another reason.

---

## Reduced-motion requirements

All animations must be off by default for `prefers-reduced-motion: reduce`:

```scss
@media (prefers-reduced-motion: reduce) {
  .animated-surface { animation: none; }
}
```

Or use the `@media (prefers-reduced-motion: no-preference)` affirmative form to opt in:

```scss
@media (prefers-reduced-motion: no-preference) {
  .animated-surface { animation: drift 6s linear infinite; }
}
```

The affirmative form is cleaner — animation is off by default, opted in for users who haven't expressed a motion preference.

---

## Implementation priority

1. **Start with CSS-only texture drift on testimonials** — lowest risk, instant payoff.
2. **Add CSS grain animation on the BLUF hero** when the baked halftone pipeline is integrated (they're natural companions).
3. **Section-label rule pulse** — small accent, easy to tune or remove.
4. **Canvas-based particle/ink effects** only if a specific art-direction need arises.

---

## Files to look at

- `apps/frontend/components/home/HomeEmployerTestimonials.vue` — texture background lives here
- `apps/frontend/components/home/HomeBlufSection.vue` (or wherever the hero lives) — grain overlay if/when added
- `apps/frontend/components/home/HomeSelectedWorkSection.vue` — section label rule
- `packages/styles/context-role/_vue-frontend.scss` — texture token definitions
- `packages/styles/_motion-palette.scss` — add animation timing tokens here if they become shared

---

## Open questions

- Should the testimonials texture drift be opt-in (e.g. only on `hover`/`focus-within` of the section) rather than always-on?
- Is the grain effect appropriate only for the hero, or as a page-level overlay on all surfaces?
- GSAP for this: avoid unless the animation needs JavaScript coordination (e.g. syncs with scroll position).
