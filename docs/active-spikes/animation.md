# Animation & Motion Spike
## Status
Active as of 2026-07-29.

Continues from: docs/archive/brand-voice.md

Operational checklist and decision tracking: [animation.todo.md](animation.todo.md).

Promoted 2026-07-29 from `docs/scratch/animations.md` and `docs/scratch/conways-game-of-life.md` (both retired into this spike). Also folds in the ambient-motion / reaction-diffusion / featured-media-transition-jank material routed out of the brand-voice spike once the responsive BLUF hero locked across all three breakpoints. The hero being settled was the prerequisite the ambient-hero ideas were waiting on.

## Goal
Add deliberate, characterful **motion and life** to a site that is currently almost entirely static. The only motion today is the custom featured-media card→detail morph (route transitions) and a handful of micro-interactions. The site's design language ("Blue Atlas" — warm cream ground, near-black ink, signal blue as structural signal, blueprint/grid textures, hard outlines, editorial/manual composition) wants to read as a *living document* — technical, specimen-like, quietly alive — not a dead page. This spike is the umbrella for every "make it move" idea, from barely-perceptible ambient background motion to a bold generative hero field to sharpening the existing transition system.

This is a **broad, multi-candidate spike**, not one pre-decided implementation. Expect to pick candidates off individually, each behind human visual/taste QA, rather than shipping everything.

## Motion Philosophy
The bar the site sets for itself: motion should feel **authored and intentional**, never decorative-for-its-own-sake, and never at the cost of readability, accessibility, or the primacy of the featured-media transition.

"Subtle" (for the ambient-background family) means:
- **Slow** — 5–30 second loops for ambient fields; barely perceptible on first look. Contemplative, not frantic.
- **Cheap** — prefer CSS transforms/`background-position` (compositor-only, ~0 cost) over per-frame JS. Where a canvas is needed, target **low FPS** (8–15fps for organic/grain feel), not 60fps.
- **Non-informational** — never animate anything that carries meaning: text, navigation, cards, headings. Motion lives on *backgrounds, textures, decorative surfaces, and interactive affordances*.
- **Off by default under `prefers-reduced-motion`** — use the affirmative `@media (prefers-reduced-motion: no-preference)` opt-in form so motion is off unless the user has expressed no preference. Canvas surfaces should still render a single **static frame** so nothing looks blank.
- **Paused when not visible** — IntersectionObserver to pause offscreen; nothing should burn GPU/CPU below the fold.

Micro-interaction motion (hovers, toggles, the slit-slip family) can be quicker and more graphic — those reinforce interactive *character* rather than ambient calm — but still respect reduced-motion.

## Relationship to the existing motion systems — READ THIS FIRST
The site already has a real motion system; new motion must not fight it.

- **Featured-media route transition** (`useFeaturedMediaTransition.ts`, `useHomeTransitionChoreography.ts`, `useFeaturedMediaTransitionState.ts`): the custom card↔detail image+title morph across navigation, ~600ms, driven by GSAP (already a project dependency). This is "the most considered part of the whole system" and the transition system **wins**. Its timing lives in the Sass **motion palette** (`packages/styles/_motion-palette.scss`), exported as CSS custom properties, and read by JS where cleanup timing must match CSS. See AGENTS.md → "Route Transition and Motion Rules" and `docs/design-system.md`.
- **HARD RULE — pause ambient motion during featured-media transitions.** Any continuously-running ambient field (reaction-diffusion, Conway, canvas particles, even heavy CSS animations) MUST pause while a featured-media transition is active, so ambient GPU/paint work never competes with the morph. `useFeaturedMediaTransitionState()` exposes an `active` flag to gate on (the homepage already `watch`es it — see `pages/index.vue`).
- **Slit-slip motion** is an *already-established* micro-motion pattern (see §D). New micro-interactions should reuse it rather than inventing new arrow/glyph motions.
- **Motion palette tokens**: shared timing/easing (e.g. `$slow-duration` for heavyweight transitions like image zoom; hover/interaction durations are bespoke ~200ms per callsite by deliberate choice — do not couple them to a shared token just for sharing a number). If new animation timings become genuinely shared, add tokens to `_motion-palette.scss`; otherwise keep them local.

## The work, grouped
Seven threads, roughly ordered from lowest-risk ambient to biggest art-direction to a separate performance audit. Priorities/scope are open (see Open Questions) — this is the menu, not a commitment to all of it.

### A. Ambient background motion (CSS-first)
Lowest-risk, highest-payoff-per-effort. Candidates:
1. **Texture drift on the Testimonials section.** The testimonials `.inner` uses a radial-gradient signal-dot pattern; a very slow `@keyframes` on `background-position` gives a drifting parallax. Zero JS, ~0 cost. Cons: translate-only, can't pulse/shimmer. Good first slice.
2. **Film-grain shimmer on the BLUF hero.** If/when the hero gets a noise/grain overlay (SVG turbulence data-URI or PNG grain), animating its `transform`/`background-position` with `steps()` gives a grain shimmer. Natural companion to the baked-halftone pipeline when it lands.
3. **Section-divider / accent-rule pulse.** Very slow opacity pulse on `--color-primary` accent rules (e.g. the Selected Work label rule, section dividers) — a quiet "breathing indicator."
4. **Canvas particle / ink-diffusion field** (higher fidelity, heavier). A `<canvas>` behind page content at low FPS (12–15) for floating particles or ink diffusion. Needs IntersectionObserver pause, resize handling, reduced-motion, JS payload. Reserve for a *deliberately animated surface*, not generic ambient background.

### B. Reaction-diffusion hero specimen (the big art-directed one)
A tall **reaction-diffusion "specimen" field** as a foreground compositional object in the hero — occupying the right side, crossing the BLUF/Vital boundary — rather than a hero-wide background. Reference: https://www.kerkstra.dev/lab/reaction-diffusion . Approach: settle a **static** frame first (size, crop, border, overlap, mobile recomposition), then animate *without changing geometry*. Deterministic + low-resolution, restrained ink/blue values, offscreen pause, static reduced-motion frame, cheap on mobile, and pause during featured-media transitions.

**Important tension:** the hero now has a real, ACF-swappable **portrait** (shipped in brand-voice). Reaction-diffusion is an **alternative *or* companion** to the portrait — NOT assumed to replace it. Evaluate it *against* the portrait. This is the biggest open art-direction decision in the spike.

### C. Conway's Game of Life — Side Projects card background
A GoL simulation as a background layer behind the **Side Projects** homepage card, fitting that section's "technical playfulness" tone. Cobalt/signal-blue cells at low opacity (reads as texture, not content), transparent background (cream shows through), toroidal wrapping, ~8–12 FPS, cell size 4–6px, ~25–30% initial density. Full technical design (component, `Uint8Array` double-buffer, neighbor counting, low-FPS loop, IntersectionObserver pause, ResizeObserver, reduced-motion static frame, styling) is captured in the to-do doc.

### D. Slit-slip motion expansion
**Slit-slip motion** is an established pattern (footnote "more ↓ / less ↑" button, file-download arrows, PhotoSwipe lightbox arrows). It is NOT a plain translate/nudge: the moving glyph is masked by a tight **clipped slot**, exits in the direction it points, jumps invisibly to the opposite side, and re-enters through the same slot — as if passing through an invisible slit. Borrowed from the Content Layout Transition demo (https://tympanus.net/Development/ContentLayoutTransition/). **Preserve the clipped-slot aspect** — a transform across open space is not the same animation. Use the phrase "slit-slip motion."
Expansion targets: file-download block arrow (↓ slips down, re-enters top), homepage "More about me" CTA (→ slips right), "View Writing Archive" CTA (→ slips right), PhotoSwipe prev/next arrows (already), and other arrow CTAs site-wide.

### E. Accordion +/- spin
The accordion toggle should animate between + and − with a brief **spin** (e.g. + rotates 45° toward ×, or rotates through to −) rather than a static symbol swap — reinforcing its interactive character.

### F. Button hover character
Button hover states are currently generic (darken/opacity). Explore something more graphic: a brief flash of accent blue on hover-entry, or a "fill" animation rather than a plain color change.

### G. Featured-media transition frame-pacing audit (performance thread — NOT additive motion)
Distinct from everything above: Human QA reports the case-study/writing card→detail morph **still feels janky**. This is a *fix the existing motion* thread, not add-new-motion. Approach: reproduce case-study vs writing transitions separately, forward and reverse, cold and warm cache, at desktop and phone widths; capture a **browser performance trace** and inspect long frames / layout / paint / raster / compositing during the ~600ms flight; compare plain writing clones vs layered halftone case-study clones; temporarily isolate filter/layer cost from geometry cost; then prototype transform-first / FLIP media+plate geometry instead of per-frame width/height animation *if the trace supports it*. **Do not tune duration/easing before identifying the bottleneck.** This may deserve to split into its own spike if it grows.

## Constraints & guardrails
- `prefers-reduced-motion: reduce` → all motion off; canvas surfaces render one static frame.
- Pause offscreen (IntersectionObserver, `rootMargin` ~100px lookahead).
- Pause during featured-media route transitions (gate on `useFeaturedMediaTransitionState().active`).
- Low FPS for canvas (8–15fps), `setTimeout` for step timing + `requestAnimationFrame` for draw.
- Cheap on mobile — the phone must not pay a 60fps canvas tax.
- **Static-generation compatibility.** The public site is statically generated + CDN-hosted; canvas/JS animation works in static HTML (no SSR concerns for the sim itself), but verify hydration and that animated components don't break `static:generate` / the featured-media transitions on generated output. (Related open bug from misc intake: the case-study loop nav didn't render on a CDN push — watch for lazy-load/generation interactions when adding client-only animated components.)
- Never animate text, nav, headings, or cards (information-carrying surfaces).
- SSR/`onMounted` hygiene: lazily import/instantiate canvas + browser-only APIs (matchMedia, IntersectionObserver, ResizeObserver) inside client-only interactions or `onMounted`.

## Technical toolbox
- **CSS animations** — first choice for ambient (drift, grain, pulse). Compositor-friendly properties only (`transform`, `opacity`, `background-position`).
- **GSAP** — already loaded for the transition system; usable with `repeat: -1, yoyo: true`. Do NOT import GSAP solely for ambient CSS-doable effects; reach for it only when JS coordination (e.g. scroll sync) is genuinely needed.
- **Canvas 2D** — for Conway / reaction-diffusion / particles. `Uint8Array` grids + double-buffering to avoid GC pressure; draw only alive/changed cells.
- **IntersectionObserver** (offscreen pause), **ResizeObserver** (canvas re-sizing), **matchMedia** (reduced-motion).
- **Motion palette** (`packages/styles/_motion-palette.scss`) for shared timing tokens if any become shared.

## Non-goals
- No motion on text, navigation, headings, or content cards.
- No 60fps full-screen canvas (mobile cost).
- No animation that competes with or degrades the featured-media transition.
- No importing new heavy animation libraries — CSS + existing GSAP + hand-written canvas cover everything here.
- Not a redesign — this is motion layered onto the settled Blue Atlas composition.

## Open questions (to resolve in conversation — this doc should become exhaustive)
Art direction / scope:
- Which threads are actually in scope, and in what priority order? (Ambient background vs the reaction-diffusion hero vs Conway vs micro-interactions vs the transition-jank audit.)
- Reaction-diffusion vs portrait in the hero: replace, coexist, or is the portrait now the settled answer and reaction-diffusion is dropped/deferred?
- Is the "living document" ambient motion wanted site-wide, or concentrated on a few signature surfaces (hero, testimonials, Side Projects)?

Per-candidate taste:
- Testimonials drift: always-on, or only on hover/focus-within of the section?
- Grain: hero-only, or a page-level overlay on all surfaces?
- Conway opacity: barely-visible (10–15%) or more present (25–30%)? Restart on each viewport-enter or resume? React to hover (inject gliders) or strictly non-interactive?
- Button-hover treatment: accent flash vs graphic fill vs something else?

Process:
- Should the featured-media transition-jank audit be part of this spike or its own separate performance spike?
- Any surfaces explicitly off-limits to motion?
