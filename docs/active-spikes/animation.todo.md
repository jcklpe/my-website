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
- CSS and the Web Animations API first; canvas at low FPS only where genuinely needed. No general animation library is currently installed. Adding one or more small libraries remains open when a concrete parallax or choreography prototype justifies the dependency and performs better than local code.
- Autonomous motion should usually stay off information-carrying surfaces, but subtle scroll-, pointer-, entry-, and hover-driven motion on text, headings, images, lists, and cards is open when it preserves legibility and stable layout.
- Everything must survive static generation + CDN hosting and must be SSR-safe (browser APIs inside `onMounted`/client-only).
- Decide scope/priority with the user before building — this doc lists the menu.

## Current State Overview
- Site motion today: the featured-media morph; slit-slip arrows on the footnote toggle, file-download button, PhotoSwipe arrows and (as of 2026-08-05) the three "→" CTAs; and two ambient pieces — Conway on the Side Projects card and the page-wide reaction-diffusion skin. **Both ambient pieces are homepage-only. Every interior page is still entirely static.**
- The reaction-diffusion skin is the largest thing in this spike by a wide margin: a WebGL2 Gray-Scott simulation with a drifting fertility mask, cursor attraction on desktop, device-tilt response on touch, a measured dead zone behind the wordmark, and baked opening states. If you are touching it, read the `Done` entry for Thread B and the durable lessons first — several of its parameters are load-bearing in non-obvious ways, and the failure modes are well documented there precisely because they were expensive to find.
- The homepage BLUF hero is a settled responsive composition with a real ACF-swappable portrait (brand-voice, closed 2026-07-29). Reaction-diffusion in the hero is now an *alternative/companion* to that portrait, not an assumed replacement.
- `useFeaturedMediaTransitionState()` exposes an `active` flag; `pages/index.vue` already watches it for the home transition choreography — the same gate is the hook for pausing ambient motion.

## Key file pointers
- `apps/frontend/components/home/HomeEmployerTestimonials.vue` — testimonials texture background (drift candidate A1).
- `apps/frontend/pages/index.vue` — BLUF hero (grain A2, reaction-diffusion B), Side Projects link section, transition-state watcher.
- `apps/frontend/components/home/HomeSideProjectsLink.vue` — Side Projects card (Conway C).
- `apps/frontend/components/home/HomeReactionDiffusionBackground.vue` — the RD skin (Thread B).
- `apps/frontend/pages/dev/rd.vue` — the RD debug harness: mask/drift/nucleation toggles, F/k presets, raw-field views, and the influence point (mouse/touch/tilt ball) with a magenta marker and its own sliders. Kept as a possible easter egg.
- `apps/frontend/components/home/HomeSelectedWorkSection.vue` — Selected Work label rule (pulse A3).
- `apps/frontend/composables/useFeaturedMediaTransition.ts`, `useHomeTransitionChoreography.ts`, `useFeaturedMediaTransitionState.ts` — the transition system (audit G; the `active` gate).
- `packages/styles/_motion-palette.scss` — shared timing/easing tokens.
- `packages/styles/context-role/_vue-frontend.scss` — texture token definitions.
- `packages/styles/shared-components/_slit-slip.scss` — the shared slit-slip recipe (Thread D). `@include arrow-cta-slit('.selector')` is the whole API.
- `apps/frontend/assets/rd-seeds/` — baked RD opening states; globbed at build time, so adding a PNG is the entire procedure.
- `docs/scratch/reaction-diffusion-case-study.md` — plain-language write-up of the finished RD system and what each control does. The fastest way to understand that component without reading the shader.
- Slit-slip existing callsites: footnote "more/less" button, file-download block, PhotoSwipe lightbox arrows (find via grep for the clipped-slot pattern).

## To Do
Priority set 2026-07-29: **Conway (C) is the first implementation slice.** Reaction-diffusion (B) is reframed to a page-wide skin over the grid paper (the portrait stays the hero). Jank audit (G) is dropped (jank cleared). Site-wide ambient reach is confirmed but needs an ideation phase. Per-candidate taste is still open — see the conceptual doc's Open Questions.

**Current priority, updated 2026-08-11 — START HERE IF YOU ARE PICKING THIS UP COLD.**

B's main system, C, and D shipped. The live implementation slice is a narrow **B mobile-tilt stabilization and phone-preview workflow**, now in Human QA. The **A brainstorm is underway**, but no broader ambient direction is approved for implementation yet.

The brainstorm is deliberately broader than Thread A's original list. The user does not consider the homepage motion budget spent and wants the site to feel alive, including a possible feeling of diving deeper into a living atlas. The original testimonials drift, hero grain, accent pulse, and canvas-field ideas were agent-generated candidates, not user requests. Current idea families include shallow scroll/pointer parallax, persistent editorial ticker bands, scroll-driven display movement, stronger hover choreography, restrained animated line/squiggle effects, staggered entrances, and sparse interior RD patches. Continue ideation before choosing a build slice.

**E is not outstanding:** the accordion icon already swaps +/− with a 220ms rotation in the shared accordion recipe. **F** (button hover character) remains speculative and is now part of the broader interaction-motion discussion.

Deferred B items (B6 mobile perf, B7 site-wide promotion, B8 scroll-coupling, B10 phone liveliness) are listed under that thread and are not blocking. B7 and B10 are the two most likely to come up during the Thread A conversation, since both are about motion beyond the homepage.

### Thread A — Ambient background motion (CSS-first)
- A0. BRAINSTORM IN PROGRESS: expand the candidate space before implementation. The agreed next vehicle is a fake-content `/dev/motion` lab with a floating debug control: all sample case-study cards use the same selected hover treatment rather than assigning a different variant to each card. Preserve the full comparison slate—inner-image parallax, moving partitions, print misregistration, aperture reveals, clipped catalog/metadata shuffles, and project-specific animated signals—alongside restrained SVG-filter/clip/mask motion, per-letter display-heading parallax, purpose-built animated glyphs, an RD eyebrow, one-time staggered entrances for writing rows and testimonials, and sparse interior RD patches. The Side Projects page is not a list-reveal target. Judge each candidate by character, coexistence, legibility, performance, reduced-motion behavior, and whether it adds a genuinely different kind of motion from RD/Conway. Do not build the lab until the Android RD phone-QA loop works.
- A1. PRIOR AGENT CANDIDATE, NOT SELECTED: Testimonials texture drift — slow `@keyframes` on `background-position` of the signal-dot field, affirmative reduced-motion opt-in. OPEN: always-on vs hover/focus-within.
- A2. PRIOR AGENT CANDIDATE, NOT SELECTED: Hero film-grain shimmer — only once a grain/noise overlay exists on the hero. `steps()` transform shimmer. OPEN: hero-only vs page-level.
- A3. PRIOR AGENT CANDIDATE, NOT SELECTED: Accent-rule pulse — very slow opacity breathing on `--color-primary` rules. Easy to tune or remove.
- A4. DEFERRED: Canvas particle / ink-diffusion ambient field. RD and Conway already cover generative simulation territory; only revisit for a specific art-direction need that those systems cannot meet.

### Thread B — Reaction-diffusion page-wide skin over the grid paper (portrait stays)
**DONE — QA-approved 2026-08-03 on desktop, 2026-08-05 including mobile tilt. See Done for the full record and the durable lessons. Still open, deliberately deferred rather than dropped:**
- B9. DONE 2026-08-05 — five baked seeds shipped in `apps/frontend/assets/rd-seeds/`. **Workflow for adding more:** open `/dev/rd` (its defaults mirror the homepage, so what is on screen is what the page will open on), let it develop to a composition worth keeping, press **bake seed**, and drop the downloaded PNG into `apps/frontend/assets/rd-seeds/`. That is the whole procedure — the component globs that folder at build time, so there is no list to keep in sync. Bake several; one is chosen at random per visit so the opening composition varies. Nothing touches WordPress. An empty folder is a valid state: it falls back to the procedural warm-up. **This originally used a manifest file in `public/`, and the first five baked seeds silently never loaded because the manifest was left empty — the fallback looks similar enough to pass for success. The glob removes that failure mode, and a dev-only console line reports when a baked seed is actually used.** Original note: **baked starting state.** The opening frame should be a saved, already-developed state loaded instantly, not the current warm-up-behind-a-fade. Run the sim, pause at a good moment, save that state, ship it as an asset, load it as the initial texture. Workflow that fits what already exists: add a bake button to `/dev/rd` that reads the state texture back and downloads it as a PNG (u in R, v in G), commit that, and have the component load it in place of `seed()` + warm-up. Falls back to the current warm-up if the asset fails to load. Requested 2026-08-05: the current version "costs a beat of waiting rather than being instant".
- B6. OPEN: mobile perf pass — the sim is full-viewport; confirm cost on a real phone and decide whether to lower `SIM_SCALE` / `ITERS_PER_FRAME` there. (Anecdotally fine on device through the tilt QA, but never measured.)
- B7. OPEN: promote from homepage-only to a site-wide layout (currently mounted in `pages/index.vue` only). The title dead zone is homepage-specific and would need to become per-page config.
- B8. OPEN: scroll-coupling — the skin is `position: fixed`, so it does not scroll with the page. User raised wanting it to scroll; parked deliberately. Simulating the whole document height is linear in area and expensive; a bounded per-section canvas is the viable version.
- B1. RESOLVED 2026-07-29: not a hero element; the ACF portrait stays as the hero. RD becomes a full-viewport, semi-interactive texture layered over the paper-grid page background site-wide.
- B2. IDEATION (do before building): settle what "semi-interactive" means (cursor/scroll/click-seed/none), how it composites over the grid (blend mode / opacity / full-bleed vs masked bands), palette + density, and the mobile fallback. See conceptual Open Questions.
- B3. Static prototype first — a single full-bleed frame over the grid paper — to judge density/palette/compositing before any animation.
- B4. Then the cheap engineering: coarse low-resolution sim grid upscaled (never per-pixel full-res), 8–15 FPS, offscreen + featured-media-transition pause, reduced-motion static frame, a settled mobile fallback (full-viewport canvas is the classic phone-killer), and static-generation verified. Perf is the gating concern here because it is full-viewport.

### Thread C — Conway's Game of Life on the Side Projects card (FIRST SLICE)
**IMPLEMENTED 2026-07-30 — pending Human QA (see Ready For Human QA). C1–C9 done; C10 (static-gen verify) is part of QA. Steps kept below for reference.**
Section context: `HomeSideProjectsLink.vue` — the `.link` (a NuxtLink `<a>`) is `position: relative; overflow: hidden`, with a dark `--texture-terminal-scanline` background, white text, and `--color-terminal` (#218d4e) green accents; content is already `z-index: 1`. A phosphor-green GoL over that terminal ground is the intended look. Full technical design preserved below under "Reference: Conway technical design." Atomic steps:
- C1. `GameOfLifeBackground.vue`: `<canvas aria-hidden>` absolutely positioned (`inset: 0`) inside the Side Projects `.link`, `z-index: 0`, `pointer-events: none`. The link's `overflow: hidden` clips it.
- C2. Sim: `Uint8Array` grid + `next` double-buffer, toroidal neighbor counting, B3/S23 rules.
- C3. Loop: `setTimeout` step at ~8–12 FPS + `rAF` draw; draw only alive cells (`fillRect`, `cellSize - 1` for grid gaps).
- C4. IntersectionObserver (`rootMargin: 100px`) start/stop offscreen; **restart-fresh (re-randomize) on each viewport-enter** — the chosen lifecycle, which also solves GoL stagnation (never shows a settled/dead board).
- C5. ResizeObserver on the card to re-init grid dims on resize/font changes.
- C6. Reduced-motion: skip the loop under `reduce`, render one static initial frame (not blank).
- C7. Styling: cells in **terminal/dark green** (`--color-terminal` #218d4e family, resolved to a fixed rgba — `var()` won't resolve in canvas), **~20% opacity as a STARTING point — tune opacity and shade together over the dark scanline ground** (the 20% was picked under a mistaken "over cream" premise). Transparent canvas.
- C8. **Hover-inject**: `mousemove` on the `.link` element (not the canvas — it's `pointer-events: none`) seeds gliders/clusters near the pointer.
- C9. Pause on `useFeaturedMediaTransitionState().active` (in addition to offscreen pause).
- C10. Verify on static-generated output; watch for lazy-load/generation interactions (cf. the CDN loop-nav non-render bug logged in misc intake).
- OPEN: final green shade + opacity (paired); the mobile/touch hover-inject story (tap-to-seed vs non-interactive on touch).

### Thread D — Slit-slip motion expansion
**DONE 2026-08-05 — see Done. Remaining:**
- D3. OPEN (low priority): sweep for any further arrow CTAs beyond the four now converted. Nothing known outstanding; this is a "if you spot one" item, and the shared mixin makes each one a two-line change.

### Thread F — Button hover character
- F1. Explore a more graphic button-hover (accent flash on entry / fill animation) vs the current darken/opacity. OPEN: which treatment.

### Thread G — Featured-media transition frame-pacing audit
- DROPPED 2026-07-29 — see Done. (Investigation plan preserved in the conceptual doc in case of regression.)

## Ready For Human QA
- **B11 — Separate desktop ambient drift, touch ambient drift, tilt translation, and tilt-driven reaction deformation.** The current report is the opposite of B10's inherited premise: desktop drift is healthy, while mobile tilt produces a strobing tiger-stripe effect. `DRIFT_SPEED_POINTER` remains at the user's current `0.7`; touch autonomous drift starts at `0`; tilt translation has its own `TILT_DRIFT_MAX_OFFSET`, `TILT_DRIFT_EASE`, and `TILT_DRIFT_MAX_SPEED`; and `TILT_REACTION_STRENGTH` independently gates the anisotropic diffusion/advection/rate/fertility machinery that historically creates stripes. Reaction deformation starts at `0`. Android tunnel QA then proved that orientation events were active but visually inert: the bounded offset moved only the invisible fertility mask, so existing coral did not translate and slow growth/decay was the only visible consequence. Tilt now also applies the same bounded offset as display-only texture parallax after converting noise-space units to UV space. This moves the already-visible field immediately without advecting or deforming simulation state. The first separated starting cap (`0.025`) read as no response on the real phone, so the translation cap is back to the previously legible `0.05` (about an eight-second full reversal) now that reaction deformation is independently off. The phone-preview homepage exposes an explicit sensor-permission/status chip, and `/dev/rd` exposes the same permission path plus the numeric event readout and live controls. On the real phone, wait for **Tilt QA: active**, hold the device still, tilt it slowly in each direction, reverse direction, and make one sharper movement. Confirm: there is no autonomous field translation while the phone is still; tilt produces a calm bounded parallax rather than flashing or tiger stripes; reversal reads as responsive; the pattern remains recognizably coral; and no wrapped edge becomes visible. Then open `/dev/rd`, confirm `tilt:` reports events, and use `tilt max speed`, `tilt offset`, and `reaction strength` independently. Keep reaction strength at `0` for the baseline check.
- **B12 — Phone preview without static generation/CDN deploy.** The self-signed LAN preview was the wrong foundation: it produced an unreliable phone origin, the reported Android visit received placeholder/error CMS state even though later host requests succeeded, and it did not deliver usable orientation input. `corepack pnpm start:phone` now waits until the public CMS GraphQL endpoint responds, then starts Nuxt through its accountless Cloudflare Quick Tunnel integration; `corepack pnpm start:frontend:phone` starts only the tunneled frontend when the CMS is already running. No Cloudflare account or stored secret is required. The random trusted HTTPS URL and QR code change each session and are publicly reachable only while the command runs. WordPress queries and uploads remain behind the restricted same-origin Nuxt bridge. On Android, open the printed URL, confirm the real CMS portrait, testimonials, case studies, and writing load, confirm the homepage chip reaches **Tilt QA: active**, and confirm `/dev/rd` reports changing numeric orientation values. The first tunnel launch on this machine exposed an old bundled `cloudflared` auto-update failure; pinning the helper to download `latest` prevents that first-run teardown.

<!-- Original QA request, kept for the record:
- **Slit-slip on the two homepage arrow CTAs (Thread D)** — implemented 2026-08-05. "More about me →" in the Vital Info box (`HomeVitalInfo.vue`) and "View writing archive →" under Selected Writing (`HomeLatestWritingSection.vue`) now do the horizontal slit-slip on hover/focus, matching the downward one on the file-download button and footnote more/less toggle. Check: (1) hovering either link sends the arrow out to the right and brings it back in from the left, with nothing spilling outside its slot; (2) it reads at the same speed and weight as the "↓ Download" arrow — they should feel like one family; (3) keyboard focus triggers it too, not just hover; (4) the underline sweep still runs alongside it; (5) the arrow is not read out by a screen reader (it is real markup now rather than CSS content, marked aria-hidden); (6) nothing shifts in layout when the animation runs; (7) reduced-motion shows no animation.
-->

## Done
- [x] **B10. OPEN: phone reads as dead.** PARTLY ADDRESSED 2026-08-05 — the ambient drift had been lowered globally when it should only have come down on touch; desktop is back to 0.27 and touch stays at 0.085. Whether the phone still reads as inert at that value is the part that needs first-hand testing. Original note: Second-hand report 2026-08-05 (not yet reproduced first-hand — needs testing on a real device before acting). On a phone the effect may be too inert: no cursor, and if tilt is unavailable or the device is held still, the only motion left is the ambient drift at 0.085 — which was tuned down for desktop where the cursor supplies the liveliness. Candidate fixes: a higher ambient drift on touch devices specifically, or a stronger resting wander. Do not tune this from the desktop; it needs eyes on a phone. — SUPERSEDED 2026-08-11 by the opposite first-hand report: mobile tilt was too aggressive and produced strobing tiger stripes. B11 replaces this framing with independent touch ambient, tilt translation, and tilt reaction controls.
- [x] **E1. Animate the accordion toggle +/− with a brief rotation instead of a static swap.** Already present before this spike: the shared accordion recipe swaps +/− and rotates the glyph 180° over 220ms. No new implementation slice was needed.
- [x] **Thread C — Conway's Game of Life on the Side Projects card.** Approved 2026-07-30. `HomeGameOfLifeBackground.vue`, terminal-green over the scanline ground, `CELL_SIZE = 8`, opacity 0.2, restart-fresh on viewport-enter, persistent radial hover-inject. Open follow-up: the touch story (no `mousemove` on mobile).
- [x] **D1. Extract/confirm the reusable slit-slip recipe from existing callsites (footnote/file/lightbox) so it can be applied consistently (preserve the clipped-slot).** — DONE 2026-08-05. Lives in `packages/styles/shared-components/_slit-slip.scss`, forwarded to every component style block. The single entry point is `@include arrow-cta-slit('.your-link')`, which emits the clipped slot, the glyph, the hover/focus slip and the reduced-motion opt-out together, so callsites cannot drift apart. Two non-obvious constraints are recorded in that file: the keyframes live *inside* a mixin because the file is injected into every component and would otherwise emit a copy everywhere; and the arrow's font is **pinned to sans rather than inherited**, because these CTAs do not share a face (one italic, one uppercase mono) and an inherited arrow rendered as visibly different glyphs on links meant to read as the same control.
- [x] **D2. Apply to: file-download arrow, homepage "More about me" CTA, "View Writing Archive" CTA, and other arrow CTAs.** — DONE 2026-08-05. Converted: `HomeVitalInfo.vue` ("More about me"), `HomeLatestWritingSection.vue` ("View writing archive"), and `pages/now.vue`, which had a third undiscovered copy of the same pseudo-element pattern. The file-download and footnote arrows were already correct and are the reference implementation; PhotoSwipe prev/next was already done.
  - **Why these were never converted before:** they drew the arrow with `::after`. A pseudo-element cannot clip its own text — the text and the box are one element, so transforming it moves the clip along with it — so they could only nudge the arrow a few pixels. The slit needs real markup: a clipping slot wrapping a glyph that moves independently. This is the thing to check first if a future arrow "won't animate".
  - Shipped with a bug that human QA caught: the archive link rendered **two** arrows and animated neither, because the `::after` removal silently failed to apply while the new markup was added. Fixed in the same session. The lesson is in the durable list below.
- [x] **B5. Mobile motion story.** There is no pointer on touch, so the cursor attraction was desktop-only. — DONE 2026-08-05. iOS is settled by decision: `DeviceOrientation` needs a modal permission prompt, far too much friction for a background texture, so it is never requested — iOS runs on touch plus a slow wander, Android additionally gets tilt. Two framings were built and rejected before the third landed: a **rolling influence point** (the Jackalope precedent) which works and is clearly visible in the harness but gets lost in the homepage's deliberately fragmented coral; and **tilt-as-acceleration** on the drift, which integrates and so ran away, pinning at maximum and strobing. The shipped model is a **bounded position map** with a dead zone, an adaptive neutral, a re-zeroing calibration threshold, and a slew limit. Direction comes from grading the fertility threshold toward the tilt. Lessons 7–11 below all come from this item.
- [x] **Thread B — Reaction-diffusion page-wide skin.** Approved 2026-08-03. `HomeReactionDiffusionBackground.vue` — a fixed full-viewport WebGL2 canvas (`z-index: -1`, `pointer-events: none`) over the paper grid, below content, with the footer given its own positive `z-index` so it paints over it.

  **Final shape.** GPU Gray-Scott, ping-pong `RGBA16F` textures, ~15 sim passes per frame. `F 0.0496 / k 0.0619`, diffusion `0.32/0.16` at `dt 0.6` (higher than textbook so the Turing wavelength spans enough cells to read as smooth curves rather than blocky ones). Negative space from a drifting value-noise **fertility mask**; turnover from that drift plus **discrete nucleation blobs**. Cursor **lowers the local kill rate** so coral grows toward the pointer, broken up by a moving speckle field so it does not read as a painted disc. A soft elliptical **dead zone** measured from the hero script spans keeps the wordmark readable. Resize copies live state into the new textures instead of reseeding. Warm-up develops a mature pattern in chunks behind a fade-in, so the page never opens on scattered dots.

  **Durable lessons — these cost a week of wrong diagnoses. Do not relearn them.**
  1. **Simulation state must be sampled `NEAREST`.** With `LINEAR`, a `vUv` landing a hair off a texel centre makes every neighbour read a blend of two texels — a sub-texel smear applied ~1000×/sec, i.e. advection. Use a separate sampler object so the display can still upscale `LINEAR`.
  2. **Rates belong per second, not per sim step.** Decay and drift constants applied per step are silently multiplied by the iteration count; changing "speed" then changes the look. Scale by the wall-clock time each step represents.
  3. **Never seed with a per-cell hash plus a sliding offset.** `hash(cell + t)` with `t` advancing one cell per step means each firing point *draws a diagonal line*. That was the long-running "wind-blown" bug, it is inherent to the mechanism, and no tuning removes it. Use discrete blobs at random positions instead.
  4. **Growth only spreads from existing pattern**, so drift faster than the growth front strands the field in barren land and it collapses. Nucleation is what raises that ceiling, because growth can then start *ahead* of the front.
  5. **`display: contents` elements have no box** — `getBoundingClientRect()` returns zeros. Measuring `.hero-title` silently disabled the dead zone for several rounds. Measure the children that actually have layout.
  6. **`clientY` grows downward; WebGL `uv.y` grows upward.** Flip when mapping pointer or element rects into the sim, or effects land mirrored.
  7. **Tilt input is a bounded POSITION map, never an acceleration.** Acceleration integrates, so a sustained lean runs away and a phone held still keeps moving ever faster. Reference implementation: `temp-ref-assets/Jackalope/assets/src/js/customscripts/parallax.js` (Wagerfield) — note that `rellax.js` beside it is scroll-only and has no orientation code. Its calibration threshold, which re-zeroes when input strays too far, is what stops a new resting attitude reading as a permanent tilt.
  8. **Read tilt from gravity projected onto the screen plane, not raw beta/gamma.** `gamma` is ill-conditioned near vertical: at `beta ≈ 90°` it swings wildly on the smallest movement. Scaling it by `cos(beta)` takes its influence to zero exactly where it destabilises — a ±15° wobble moved the input by 1.071 in the raw model at any attitude, and by 0.009 at 89° after.
  9. **Bounding how FAR is not bounding how FAST.** A bounded offset still let a sharp tilt drive the pattern at 2.5× the ambient drift, and fast lateral movement shears coral into stripes. A slew limit on offset velocity is what actually keeps it calm. Responsiveness is then set by that cap and the excursion *together* — a reversal must cross twice the offset at the capped speed.
  10. **Check which term actually dominates before tuning.** Hours went into the tilt cap while the ambient drift, eighteen times larger, was the real source of the speed being tuned against. Compare the magnitudes first.
  11. **Directional effects that bias an axis will stripe.** Anisotropic diffusion stretches the Turing wavelength; a reaction-rate gradient matures one side faster. Both read as bands. Grading the *fertility threshold* instead gives a direction without one, because it only changes where coral may live, not how it grows.
  12. **Verify each edit landed, not just the first one.** A find-and-replace across two similar components silently matched only one, shipping a link with two arrows. Assert that every replacement actually changed the file, and grep the *whole* app for the old pattern rather than confirming the file you happened to look at.
  13. **A step that must be remembered, whose omission is invisible, is a broken design.** The baked opening states were first wired through a hand-edited manifest; five baked files silently never loaded because the manifest was left empty, and the procedural fallback looks similar enough to pass for success. Replaced with a build-time glob over the folder, plus a dev-only console line reporting when a baked seed is actually used.
  14. **Process:** the breakthrough came from building `/dev/rd` — a harness that made the reaction, mask, drift and seeding independently toggleable with raw-field views. Debugging four coupled subsystems through one composited output produced confident, repeatedly wrong theories. **Build the isolation harness early.** It is kept (not deleted) as a possible easter egg / blog toy.
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
  opacity: 0.2; // STARTING point over the dark terminal ground; tune with the shade
}
```
Resolved params: cell size 4–6px; ~8–12 FPS; ~25–30% initial density; toroidal wrap; **terminal/dark-green cells (`--color-terminal` #218d4e family, fixed rgba) over the section's dark `--texture-terminal-scanline` ground** (NOT cream); transparent canvas; **restart-fresh on each viewport-enter**; **hover-inject near the pointer** (track `mousemove` on the `.link`, not the canvas). Must also pause on `useFeaturedMediaTransitionState().active`.

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
