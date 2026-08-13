# Animation & Motion Spike
## Status
Active. Threads B, C, and D are closed, G was dropped, and **the Thread A comparison lab is ready for Human QA**. No broader ambient production direction is settled yet. Read "Where this stands" immediately below before anything else.

## Where this stands (2026-08-12)
Three of the seven original threads have shipped and the broader ideation phase has begun:

- **C — Conway on the Side Projects card:** shipped and approved.
- **B — Reaction-diffusion page skin:** shipped and approved, including the revised Android tilt composite. Desktop ambient drift and touch behavior are independently tunable, and an accountless temporary HTTPS tunnel removes the static-generation/CDN loop from device testing. This was by far the largest piece of work in the spike and generated most of its durable lessons — see the `Done` section of the to-do doc, which is worth reading in full before touching that component. A plain-language write-up of the system lives at `docs/scratch/reaction-diffusion-case-study.md`.
- **D — Slit-slip arrow CTAs:** shipped and confirmed working.
- **A — Ambient background motion:** the brainstorm produced a CMS-backed `/dev/motion` comparison lab, now in iterative Human QA. Catalog shuffle with practice/discipline plus engagement context is selected for eventual production integration; a 140ms bottom-slit entrance is selected for writing rows; and a 140ms lateral wipe is selected for testimonials. Case-study depth motion, display-heading motion, RD accents, and the image-treatment/plate direction still need testing before production integration.
- **E (accordion spin):** already existed before this spike; it is not outstanding work. **F (button hover):** still speculative and taste-gated.
- **G — jank audit:** dropped 2026-07-29; jank cleared on its own.

The homepage now has a **permanently animating full-viewport background** plus a second animating surface on the Side Projects card, while **every interior page is still completely static**. This does not imply that the homepage's motion budget is spent. Treat the RD as a subtle baseline material and continue ideating from the desired "living atlas" feeling, judging additions by their actual coexistence, legibility, performance, and distinctness rather than by a predetermined count of animated surfaces.

Continues from: docs/archive/brand-voice.md

Operational checklist and decision tracking: [animation.todo.md](animation.todo.md).

Promoted 2026-07-29 from `docs/scratch/animations.md` and `docs/scratch/conways-game-of-life.md` (both retired into this spike). Also folds in the ambient-motion / reaction-diffusion / featured-media-transition-jank material routed out of the brand-voice spike once the responsive BLUF hero locked across all three breakpoints. The hero being settled was the prerequisite the ambient-hero ideas were waiting on.

## Goal
Add deliberate, characterful **motion and life** across the site. The site's design language ("Blue Atlas" — warm cream ground, near-black ink, signal blue as structural signal, blueprint/grid textures, hard outlines, editorial/manual composition) wants to read as a *living document* — technical, specimen-like, quietly alive — not a dead page. This spike is the umbrella for ambient material motion, dimensional scroll/pointer behavior, interaction choreography, and the existing route-transition system.

This is a **broad, multi-candidate spike**, not one pre-decided implementation. Expect to pick candidates off individually, each behind human visual/taste QA, rather than shipping everything.

## Decisions & Direction (2026-07-29)
Locked in with the user when the spike was promoted:

- **First implementation slice: Conway's Game of Life on the Side Projects card (Thread C).** Self-contained, high-delight, fully speced. Start here. (Doing it first also lets us build the shared motion infrastructure — reduced-motion opt-in, IntersectionObserver offscreen pause, and the `useFeaturedMediaTransitionState().active` pause gate — that later canvas work reuses.)
- **Reaction-diffusion is REFRAMED (Thread B): it is NOT a hero element.** The ACF portrait stays as the hero. Instead, reaction-diffusion becomes a **page-wide, semi-interactive ambient texture that overlays the existing paper-grid background across the ENTIRE site** — a living "skin" on the grid paper, not a hero object. This is the centerpiece of the site-wide-motion direction and the single most ambitious and performance-sensitive item in the spike, because it is full-viewport. It needs its own ideation pass and very careful engineering (deterministic, low-resolution, low-FPS, offscreen/transition pause, reduced-motion static frame, and genuinely cheap on mobile — a full-page canvas is the exact thing that can tank a phone). "Semi-interactive" is undefined so far — likely a gentle cursor/scroll influence — and needs specifying.
- **Featured-media transition jank audit (Thread G): DROPPED.** Human QA 2026-07-29 — the jank has effectively cleared up; the morph looks good now, so no audit is needed. Reopen only if it regresses.
- **Ambient reach: site-wide subtle motion** — but *what that means concretely* needs significant ideation before broad implementation. The RD page-skin is the anchor idea; testimonials drift, accent-rule pulse, hero grain, and Conway are complementary signature moments. Expect an explicit ideation phase.

## Motion Philosophy
The bar the site sets for itself: motion should feel **authored and intentional**, never decorative-for-its-own-sake, and never at the cost of readability, accessibility, or the primacy of the featured-media transition.

"Subtle" (for the ambient-background family) means:
- **Slow** — 5–30 second loops for ambient fields; barely perceptible on first look. Contemplative, not frantic.
- **Cheap** — prefer CSS transforms/`background-position` (compositor-only, ~0 cost) over per-frame JS. Where a canvas is needed, target **low FPS** (8–15fps for organic/grain feel), not 60fps.
- **Readable** — autonomous motion should usually live on *backgrounds, textures, decorative surfaces, and interactive affordances*. Scroll- or pointer-linked movement may involve text, headings, images, or cards when it adds shallow dimensionality without destabilizing layout, interfering with reading, or obscuring meaning.
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

### B. Reaction-diffusion as a page-wide living skin over the grid paper (the big one)
**Reframed 2026-07-29 (see Decisions):** NOT a hero object. The portrait stays. Reaction-diffusion becomes a **full-viewport, semi-interactive ambient texture overlaying the existing paper-grid page background across the whole site**. Reference for the visual feel: https://www.kerkstra.dev/lab/reaction-diffusion .

This is the most ambitious and perf-sensitive item in the spike. Design/engineering constraints that are non-negotiable for a full-page canvas:
- **Deterministic + low-resolution** — coarse simulation grid, upscaled; never a per-pixel full-res sim.
- **Low FPS** — 8–15fps, `setTimeout` step + `rAF` draw; never 60fps.
- **Restrained ink/blue values, low opacity** — it must read as a subtle skin *on* the grid paper, never overpowering content. The grid paper stays visible through/under it.
- **Offscreen + transition pause** — pause when the tab/section isn't visible and while any featured-media transition is `active`.
- **Reduced-motion → static frame**, not blank.
- **Cheap on mobile** — a full-viewport canvas is the classic phone-killer; the mobile story (smaller grid, lower FPS, or disabled) must be settled before shipping.
- **Static-generation compatible** — works in generated HTML, doesn't break hydration or the transition system on CDN output.

Spec (2026-07-30, from the user + a mockup):
- **Model:** Gray-Scott reaction-diffusion (coral/leopard-like organic pattern), rendered low-res and upscaled soft for a buttery look.
- **Palette:** light, faint, **pale periwinkle**, low contrast against the paper-grid ground — a whisper, not a statement.
- **Motion:** very slow, buttery-smooth **oozing** — not fast.
- **Scale/density:** decently **large scale** with **low density** — sparser than the reference mockup.
- **Asymmetric, with negative space:** it must NOT fill the whole background. Use **selective inhibitors** (a spatial mask / fertility field) so patterns only sustain in some regions, leaving wide open negative space so it doesn't overwhelm.
- **Hover:** clear **growth under the cursor** — the pattern blooms where the mouse is. Growth should be **semi-temporary** (fades over time) so it doesn't leave permanent trails everywhere.
- **Perf/placement:** page-wide fixed canvas behind content, over the paper grid; low-res sim + low FPS; pause offscreen + during featured-media transitions; reduced-motion → static developed frame; mobile perf is the gating concern (adaptive resolution / possibly disabled on phones). Starting on the homepage; can be promoted to a site-wide layout later.
- Expect several tuning rounds (sparseness, negative-space mask, temporariness, colour/alpha, speed) like Conway needed.

### C. Conway's Game of Life — Side Projects card background (FIRST SLICE)
A GoL simulation as a background layer inside the **Side Projects** homepage card. Crucially, that section is **NOT cream** — it is a **dark terminal-scanline surface** (`--texture-terminal-scanline` background, white text, `--color-terminal` #218d4e green accents; see `HomeSideProjectsLink.vue`). A **phosphor-green Game of Life over a scanline terminal ground** is a thematically perfect fit for the section's terminal vibe.

Locked params (2026-07-29):
- **Cells in terminal/dark green** — the `--color-terminal` (#218d4e) family; exact shade tunable at build. (Resolve to a fixed rgba in canvas — `var()` won't resolve in a 2D context.)
- **~20% opacity as a STARTING point — re-tune.** The 20% was chosen under a mistaken "over cream" premise; over the dark scanline ground, green cells at 20% read very differently, so treat opacity + shade as a paired tuning task during build.
- **Restart fresh on each viewport-enter** — re-randomize every time the card scrolls into view. This is also the chosen answer to the GoL **stagnation** problem (an ambient board settles into still-lifes/blinkers within a minute and stops being interesting); restarting on arrival means it's always lively and never shows a dead board.
- **Hover injects life near the cursor** — `mousemove` over the card seeds gliders/clusters at the pointer. Note the canvas is `pointer-events: none`, so track the pointer on the card/link element, not the canvas. **Mobile hover-inject story is OPEN** (touch has no hover — tap-to-seed vs simply non-interactive on touch).
- Transparent canvas, toroidal wrapping, ~8–12 FPS, cell size 4–6px, ~25–30% initial density, pause offscreen + during featured-media transitions, reduced-motion → single static frame.

Full technical design (component, `Uint8Array` double-buffer, neighbor counting, low-FPS loop, IntersectionObserver pause, ResizeObserver, reduced-motion static frame, styling) is captured in the to-do doc.

### D. Slit-slip motion expansion
**Slit-slip motion** is an established pattern (footnote "more ↓ / less ↑" button, file-download arrows, PhotoSwipe lightbox arrows). It is NOT a plain translate/nudge: the moving glyph is masked by a tight **clipped slot**, exits in the direction it points, jumps invisibly to the opposite side, and re-enters through the same slot — as if passing through an invisible slit. Borrowed from the Content Layout Transition demo (https://tympanus.net/Development/ContentLayoutTransition/). **Preserve the clipped-slot aspect** — a transform across open space is not the same animation. Use the phrase "slit-slip motion."
Expansion targets: file-download block arrow (↓ slips down, re-enters top), homepage "More about me" CTA (→ slips right), "View Writing Archive" CTA (→ slips right), PhotoSwipe prev/next arrows (already), and other arrow CTAs site-wide.

### E. Accordion +/- spin
The accordion toggle should animate between + and − with a brief **spin** (e.g. + rotates 45° toward ×, or rotates through to −) rather than a static symbol swap — reinforcing its interactive character.

### F. Button hover character
Button hover states are currently generic (darken/opacity). Explore something more graphic: a brief flash of accent blue on hover-entry, or a "fill" animation rather than a plain color change.

### G. Featured-media transition frame-pacing audit — DROPPED (2026-07-29)
Human QA 2026-07-29: the previously-reported case-study/writing morph jank has effectively cleared up; the transition looks good now. No audit needed. The original investigation plan (reproduce case-study vs writing, forward/reverse, cold/warm cache, desktop/phone; performance trace over the ~600ms flight; isolate filter/layer vs geometry cost; prototype transform-first/FLIP geometry) is preserved here only in case it regresses — do not pursue unless the jank returns.

## Constraints & guardrails
- `prefers-reduced-motion: reduce` → all motion off; canvas surfaces render one static frame.
- Pause offscreen (IntersectionObserver, `rootMargin` ~100px lookahead).
- Pause during featured-media route transitions (gate on `useFeaturedMediaTransitionState().active`).
- Low FPS for canvas (8–15fps), `setTimeout` for step timing + `requestAnimationFrame` for draw.
- Cheap on mobile — the phone must not pay a 60fps canvas tax.
- **Static-generation compatibility.** The public site is statically generated + CDN-hosted; canvas/JS animation works in static HTML (no SSR concerns for the sim itself), but verify hydration and that animated components don't break `static:generate` / the featured-media transitions on generated output. (Related open bug from misc intake: the case-study loop nav didn't render on a CDN push — watch for lazy-load/generation interactions when adding client-only animated components.)
- Do not apply perpetual deformation or distracting autonomous motion to information-carrying surfaces. Subtle scroll-, pointer-, entry-, and hover-driven motion on text, headings, images, lists, or cards remains open for deliberate art direction.
- SSR/`onMounted` hygiene: lazily import/instantiate canvas + browser-only APIs (matchMedia, IntersectionObserver, ResizeObserver) inside client-only interactions or `onMounted`.

## Technical toolbox
- **CSS animations** — first choice for ambient (drift, grain, pulse). Compositor-friendly properties only (`transform`, `opacity`, `background-position`).
- **Web Animations API** — already used by the homepage route-transition choreography for coordinated, cancelable timelines without an animation dependency.
- **Animation/parallax libraries** — none are currently installed. One or more small libraries remain allowed when a concrete prototype benefits from their scheduling, interpolation, input normalization, or cleanup; dependency count is not itself the design criterion.
- **SVG filters, masks, clips, and duplicate text layers** — candidate tools for localized material/typographic motion. Keep animated filter regions small, preserve real text underneath or alongside decorative copies, and profile on mobile because animated displacement is paint-heavy.
- **Canvas 2D** — for Conway / reaction-diffusion / particles. `Uint8Array` grids + double-buffering to avoid GC pressure; draw only alive/changed cells.
- **WebGL** — already required by RD. Do not multiply independent WebGL contexts casually; structural RD accents should first test one renderer, one simulation sampled into several windows, or a single accent instance per route.
- **IntersectionObserver** (offscreen pause), **ResizeObserver** (canvas re-sizing), **matchMedia** (reduced-motion).
- **Motion palette** (`packages/styles/_motion-palette.scss`) for shared timing tokens if any become shared.

## Non-goals
- No 60fps full-screen canvas (mobile cost).
- No animation that competes with or degrades the featured-media transition.
- No scroll-jacking, pinned "pop into place" sequences, or snapping that takes control of ordinary scrolling.
- No generic identical hover pasted over every case study when the intended character is art-directed variation within a shared motion language.
- No transforms on measured transition surfaces without an explicit click-preflight contract that settles them before geometry is captured. Inner decorative layers and non-transition headings remain available.
- Not a redesign — this is motion layered onto the settled Blue Atlas composition.

## Open questions
### Resolved 2026-07-29 (see Decisions)
- Scope/priority: start with Conway (C). Ambient reach: site-wide. RD: page-wide skin, not hero, portrait stays. Jank audit (G): dropped.

### Resolved 2026-08-05 by shipping
**Reaction-diffusion page-skin (B) — the main visual/compositing questions are answered in code.** "Semi-interactive" became: the cursor makes the area under it *more hospitable* so existing growth reaches toward it, rather than seeding or painting anything; on touch, device tilt shifts the whole fertility field like water in a shallow pan. It composites as a fixed full-viewport WebGL canvas at `z-index: -1` over the paper grid and under all content, pale periwinkle `#cddeff` at 0.62 alpha. Density and negative space come from a drifting fertility mask rather than from opacity. Mobile runs the same simulation at a smaller grid, but the tilt implementation was reopened 2026-08-11 after a strobing/tiger-stripe report; ambient touch drift, tilt translation, and tilt reaction deformation are now separate controls awaiting real-device QA.

### Still open — needs ideation (this is where the conversation should keep going)

**Site-wide ambient meaning (Thread A) — BRAINSTORM UNDERWAY.** "Site-wide subtle motion" is a direction, not a plan. The original testimonials drift, accent-rule pulse, hero grain, and extra-canvas ideas were agent-generated candidates, not user requests or commitments. Start with fewer assumptions and explore several distinct motion families before choosing implementation slices.

The user explicitly does **not** consider the homepage's motion budget spent. The target feeling can extend deeper into a living atlas, provided additions stay performant, legible, and different enough from RD and Conway that the site does not become a collection of similar simulations.

Higher-resolution candidate map from the 2026-08-11 brainstorm:

- **Dimensional movement:** combine shallow scroll position and pointer position as independent inputs into the same transform variables. Display headings, ornaments, and non-measured inner image layers are stronger candidates than prose. Scroll remains direct and reversible: no pinning, snapping, or delayed catch-up that makes the page feel commandeered.
- **Case-study hover as a prototype grammar:** the current treatment mostly removes the colour filter. Human QA selected clipped catalog metadata plus colour reveal for eventual production integration and approved the catalog's two editorial roles: a short **practice/discipline** line describing the work performed (for example, “Design systems · Operations”) and a short **engagement context** line describing the situation or intervention (for example, “Cross-department product delivery”). Both should become explicit CMS fields rather than inferred categories or decorative status copy. Moving partitions, aperture reveals, project-specific signals, and print misregistration are rejected. Parallax remains under evaluation: the first perspective-tilt inset did not fit, so the lab now adapts the original portfolio's locally pointer-relative, friction-eased, translation-only model to the inset image alone while leaving the text plate fixed. Keep the measured outer media/title/slip shells stable; any accepted depth motion must occur on inner layers that can settle during the existing preflight beat before transition geometry is captured. Keep the existing duotone-to-colour hover independently switchable while tuning so its interaction with each candidate stays visible. The original halftone rationale—reducing gamut enough to support overlaid text—did not hold up in practice, and the separate text plate solved legibility while also enabling compositional variance. Reassessing halftone is therefore valid, but any future plate alternative must preserve that variance rather than collapsing Selected Work into identical image boxes; compare untreated imagery with localized scrims, authored negative-space placement, or other asymmetrical image/text relationships before replacing the current plate model.
- **Ticker/editorial rail:** a generic homepage marquee has no settled content. A homepage version would need a genuine live-status or editorial function rather than filler. Article metadata is a more semantically grounded target: date, author, and any future category/reading metadata could inhabit a slow rail at the top of a post. Do not repeat two facts merely to manufacture a marquee.
- **Text as moving material:** candidates include very low-amplitude `feTurbulence` + `feDisplacementMap` ooze, animated masks that erode or pool a colour fill, print-registration copies moving under clipped bands, slow variable-font axis motion where an actual variable face supports it, per-letter wave/stagger choreography on display text, and SVG stroke drawing for purpose-built glyphs. Preserve the semantic text and confine filters or path copies to small display/accent regions.
- **Selected Work heading motion:** human QA provisionally locked the combined scroll-entry cascade and second-letter pointer pivot. It has been removed from the comparison lab; the remaining approval gate is testing the same combination on the actual homepage heading in context with the rest of the page motion.
- **RD as a structural accent:** a tiny live colour eyebrow is plausible, but several independent WebGL canvases are not the starting architecture. First test one small RD strip on a route, sampling a mature texture through a narrow window rather than simulating at the strip's awkward aspect ratio. If the idea expands to several accents or sparse margin organisms, one shared renderer should service multiple viewport/scissor windows or a page-level canvas should reveal itself only through measured masks.
- **One-time row choreography:** the visual grammar is settled and has been removed from the comparison lab: writing archive rows use a 140ms bottom-up slit entrance, and homepage testimonials use a 140ms lateral wipe. Production integration must tie each single entrance to normal page arrival and the existing forward/reverse transition state so returning through the card transition assembles the destination intentionally. Side Projects is not a list-reveal target in its current composition.
- **Interior organisms:** keep them sparse and spatially justified by actual empty margin geometry. They should read as the same living material surfacing through the atlas, not as new decorative particles.

**Conway (C) — RESOLVED 2026-07-29:** ~20% opacity starting point, restart-fresh on each viewport-enter, hover-injects-life near the cursor, terminal/dark-green cells over the section's dark scanline ground. Still open: the final green shade + opacity (tuned together over the dark background), and the mobile/touch hover-inject story (tap-to-seed vs non-interactive).

**Micro-interaction taste:** button and case-study hover treatment; which arrow CTAs get slit-slip. Accordion rotation already exists and is not an open implementation candidate.

**Guardrails:** any surfaces explicitly off-limits to motion?
