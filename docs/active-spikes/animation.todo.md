# Animation & Motion To-Do
## Background
Promoted 2026-07-29 from `docs/scratch/animations.md` + `docs/scratch/conways-game-of-life.md` (both retired), plus the ambient-motion / reaction-diffusion / featured-media-transition-jank material routed out of the archived brand-voice spike. Conceptual doc: `docs/active-spikes/animation.md` — read it first for philosophy, the existing-motion-system relationship (esp. the HARD RULE to pause ambient motion during featured-media transitions), and the seven work threads (A–G).

This is a broad, taste-gated spike: pick candidates off one at a time, each behind human visual QA.

## Project Organization
- Conceptual doc: `docs/active-spikes/animation.md`
- Operational doc: `docs/active-spikes/animation.todo.md`
- Retired scratch sources: `docs/scratch/animations.md`, `docs/scratch/conways-game-of-life.md` (deleted during promotion)
- Continues from: `docs/archive/brand-voice.md`
- Related durable docs: `docs/design-system.md` and `AGENTS.md` → "Route Transition and Motion Rules"; `docs/visual-design.md` for the Blue Atlas language and the settled hero.

## General Principles
- The featured-media route transition wins; new motion must not compete with it and must pause while it runs.
- Ambient motion is slow, cheap, non-informational, off under `prefers-reduced-motion`, and paused offscreen.
- CSS-first; canvas at low FPS only where genuinely needed; GSAP only when JS coordination is required (it's already loaded).
- Never animate text, nav, headings, or cards.
- Everything must survive static generation + CDN hosting and must be SSR-safe (browser APIs inside `onMounted`/client-only).
- Decide scope/priority with the user before building — this doc lists the menu.

## Current State Overview
- Site motion today: only the featured-media morph + a few micro-interactions (slit-slip on footnote/file/lightbox arrows; hover states).
- The homepage BLUF hero is a settled responsive composition with a real ACF-swappable portrait (brand-voice, closed 2026-07-29). Reaction-diffusion in the hero is now an *alternative/companion* to that portrait, not an assumed replacement.
- No ambient background animation exists yet anywhere.
- `useFeaturedMediaTransitionState()` exposes an `active` flag; `pages/index.vue` already watches it for the home transition choreography — the same gate is the hook for pausing ambient motion.

## Key file pointers
- `apps/frontend/components/home/HomeEmployerTestimonials.vue` — testimonials texture background (drift candidate A1).
- `apps/frontend/pages/index.vue` — BLUF hero (grain A2, reaction-diffusion B), Side Projects link section, transition-state watcher.
- `apps/frontend/components/home/HomeSideProjectsLink.vue` — Side Projects card (Conway C).
- `apps/frontend/components/home/HomeSelectedWorkSection.vue` — Selected Work label rule (pulse A3).
- `apps/frontend/composables/useFeaturedMediaTransition.ts`, `useHomeTransitionChoreography.ts`, `useFeaturedMediaTransitionState.ts` — the transition system (audit G; the `active` gate).
- `packages/styles/_motion-palette.scss` — shared timing/easing tokens.
- `packages/styles/context-role/_vue-frontend.scss` — texture token definitions.
- Slit-slip existing callsites: footnote "more/less" button, file-download block, PhotoSwipe lightbox arrows (find via grep for the clipped-slot pattern).

## To Do
Priority set 2026-07-29: **Conway (C) is the first implementation slice.** Reaction-diffusion (B) is reframed to a page-wide skin over the grid paper (the portrait stays the hero). Jank audit (G) is dropped (jank cleared). Site-wide ambient reach is confirmed but needs an ideation phase. Per-candidate taste is still open — see the conceptual doc's Open Questions.

### Thread A — Ambient background motion (CSS-first)
- A1. Testimonials texture drift: slow `@keyframes` on `background-position` of the signal-dot field, affirmative reduced-motion opt-in. Lowest risk; likely the first slice. OPEN: always-on vs hover/focus-within.
- A2. Hero film-grain shimmer: only once a grain/noise overlay exists on the hero (pairs with the baked-halftone pipeline). `steps()` transform shimmer. OPEN: hero-only vs page-level.
- A3. Accent-rule pulse: very slow opacity breathing on `--color-primary` rules (Selected Work label rule / section dividers). Easy to tune or remove.
- A4. Canvas particle / ink-diffusion ambient field: deferred / only if a specific art-direction need arises. Heavier; reserve for a deliberate surface.

### Thread B — Reaction-diffusion page-wide skin over the grid paper (portrait stays)
- B1. RESOLVED 2026-07-29: not a hero element; the ACF portrait stays as the hero. RD becomes a full-viewport, semi-interactive texture layered over the paper-grid page background site-wide.
- B2. IDEATION (do before building): settle what "semi-interactive" means (cursor/scroll/click-seed/none), how it composites over the grid (blend mode / opacity / full-bleed vs masked bands), palette + density, and the mobile fallback. See conceptual Open Questions.
- B3. Static prototype first — a single full-bleed frame over the grid paper — to judge density/palette/compositing before any animation.
- B4. Then the cheap engineering: coarse low-resolution sim grid upscaled (never per-pixel full-res), 8–15 FPS, offscreen + featured-media-transition pause, reduced-motion static frame, a settled mobile fallback (full-viewport canvas is the classic phone-killer), and static-generation verified. Perf is the gating concern here because it is full-viewport.

### Thread C — Conway's Game of Life on the Side Projects card
Full technical design (from the retired scratch) preserved below under "Reference: Conway technical design." Atomic steps:
- C1. `GameOfLifeBackground.vue` component: `<canvas aria-hidden>` absolutely positioned inside the Side Projects card, `z-index: 0`, `pointer-events: none`; card content layer `position: relative; z-index: 1`.
- C2. Sim: `Uint8Array` grid + `next` double-buffer, toroidal neighbor counting, standard B3/S23 rules.
- C3. Loop: `setTimeout` step timing at ~8–12 FPS + `requestAnimationFrame` for draw; draw only alive cells (`fillRect`, `cellSize - 1` for grid gaps).
- C4. IntersectionObserver (`rootMargin: 100px`) to start/stop offscreen; the card is below the fold.
- C5. ResizeObserver on the card to re-init grid dimensions on resize/font changes.
- C6. Reduced-motion: skip the loop entirely under `reduce`, but render one static initial frame so the card isn't blank.
- C7. Styling: `opacity` tuned to taste (OPEN: 10–15% vs 25–30%), cells in signal/cobalt blue, transparent bg so cream shows through; respect card `border-radius` (canvas clip).
- C8. Verify on static-generated output + that it doesn't interfere with featured-media transitions (pause on `active`).
- OPEN: restart-on-enter vs resume; hover-inject gliders vs strictly non-interactive.

### Thread D — Slit-slip motion expansion
- D1. Extract/confirm the reusable slit-slip recipe from existing callsites (footnote/file/lightbox) so it can be applied consistently (preserve the clipped-slot).
- D2. Apply to: file-download arrow, homepage "More about me" CTA, "View Writing Archive" CTA, and other arrow CTAs. (PhotoSwipe prev/next already done.)

### Thread E — Accordion +/- spin
- E1. Animate the accordion toggle +/− with a brief rotation (e.g. + → × via 45° spin) instead of a static swap; respect reduced-motion.

### Thread F — Button hover character
- F1. Explore a more graphic button-hover (accent flash on entry / fill animation) vs the current darken/opacity. OPEN: which treatment.

### Thread G — Featured-media transition frame-pacing audit
- DROPPED 2026-07-29 — see Done. (Investigation plan preserved in the conceptual doc in case of regression.)

## Ready For Human QA
- (none yet)

## Done
- [x] Thread G — Featured-media transition frame-pacing (jank) audit. **Dropped 2026-07-29** without work: Human QA reports the previously-janky case-study/writing card→detail morph has effectively cleared up and looks good now, so no audit is warranted. The original investigation plan (reproduce case-study vs writing forward/reverse × cold/warm cache × desktop/phone; performance trace over the ~600ms flight; isolate filter/layer vs geometry cost; prototype transform-first/FLIP geometry) is preserved in the conceptual doc; reopen only if the jank regresses.

---

## Reference: Conway technical design (preserved from retired scratch)
### Grid + step (B3/S23, toroidal)
Flat `Uint8Array` (0=dead, 1=alive), indexed `row * cols + col`. Double-buffer (`grid`, `next`) to avoid read/write conflicts and GC churn.

```ts
function step() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const neighbors = countNeighbors(r, c);
      const alive = grid[r * cols + c];
      next[r * cols + c] =
        alive ? (neighbors === 2 || neighbors === 3 ? 1 : 0)
               : (neighbors === 3 ? 1 : 0);
    }
  }
  [grid, next] = [next, grid];
}

function countNeighbors(r: number, c: number): number {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = (r + dr + rows) % rows;   // toroidal wrap
      const nc = (c + dc + cols) % cols;
      count += grid[nr * cols + nc];
    }
  }
  return count;
}
```

### Low-FPS loop (step on setTimeout, draw on rAF)
```ts
function startLoop() {
  const FPS = 10;
  function tick() {
    step();
    requestAnimationFrame(draw);
    stepTimerId = window.setTimeout(tick, 1000 / FPS);
  }
  tick();
}
```

### Draw (alive cells only, grid gap via cellSize - 1)
```ts
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = /* resolved signal blue rgba; var() may not resolve in canvas */;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r * cols + c]) {
        ctx.fillRect(c * cellSize, r * cellSize, cellSize - 1, cellSize - 1);
      }
    }
  }
}
```

### Offscreen pause + resize
```ts
const observer = new IntersectionObserver(
  ([entry]) => { entry.isIntersecting ? startLoop() : stopLoop(); },
  { rootMargin: '100px' }
);

const resizeObserver = new ResizeObserver(() => {
  const { width, height } = canvas.value!.getBoundingClientRect();
  canvas.value!.width = width;  canvas.value!.height = height;
  cols = Math.floor(width / cellSize);  rows = Math.floor(height / cellSize);
  grid = new Uint8Array(rows * cols);   next = new Uint8Array(rows * cols);
  randomize(); // ~25–30% initial density
});
```

### Reduced motion + styling
```ts
const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
if (!motionOK) { drawStaticInitialFrame(); return; } // static frame, no loop
```
```scss
.gol-canvas {
  position: absolute; inset: 0; width: 100%; height: 100%;
  pointer-events: none;
  opacity: 0.18; // OPEN: tune 10–30%
}
```
Params: cell size 4–6px; ~8–12 FPS; ~25–30% initial density; toroidal wrap; cobalt/signal-blue cells; transparent bg. Must also pause on `useFeaturedMediaTransitionState().active`.

## Reference: reduced-motion patterns (from retired scratch)
Prefer the affirmative opt-in so motion is off by default:
```scss
@media (prefers-reduced-motion: no-preference) {
  .animated-surface { animation: drift 6s linear infinite; }
}
```

## Reference: ambient CSS snippets (from retired scratch)
Testimonials drift:
```css
@keyframes drift { to { background-position: 20px 20px; } }
.inner { animation: drift 6s linear infinite; }
```
Grain shimmer:
```css
@keyframes grain {
  0%,100% { transform: translate(0,0); }
  10% { transform: translate(-2%,-3%); } 30% { transform: translate(3%,2%); }
  60% { transform: translate(-1%,4%); }  80% { transform: translate(2%,-2%); }
}
.grain-overlay { animation: grain 0.8s steps(1) infinite; }
```
Accent-rule pulse:
```css
@keyframes pulse-width { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
.section-label::before { animation: pulse-width 4s ease-in-out infinite; }
```
