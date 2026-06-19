# Featured-Media Transition — To Do

Operational tracking for the card↔detail featured-image morph. Conceptual model,
architecture, and durable lessons: [featured-media-transition.md](featured-media-transition.md).

## Background

Started inside the case-hero spike (the layered detail hero + the card→detail
photo morph) and grew into its own cross-cutting transition system spanning the
home surface, the detail pages, the nav/footer, the layout, and a dedicated
overlay component. Split out into its own spike so the case-hero docs can stay
about the *hero visual design* and this can track the *motion system*.

The work has been a long patch-then-observe loop with the user QAing in the
browser at slowed-down flight durations (up to 50000ms). The user cannot be
out-paced on visual judgement; agents cannot see motion (only screenshots +
measured computed styles), so several "fixes" were validated by the wrong
measurement and had to be re-done. That history is preserved below on purpose.

## Current State Overview

Working and verified (by value where motion couldn't be seen):

- Forward (home→detail) and reverse (detail→home) both complete and settle
  clean — clones removed, page opacity restored, no overflow, no console errors,
  `corepack pnpm check` passes.
- Photo + title morph between card and hero in both directions.
- Home surroundings assemble **out** (forward) and **in** (reverse), staggered,
  in-frame only, around the clicked card, fully opaque (no fade).
- Detail body rises in on arrival; slides out before the rest on departure.
- Destination page is hidden-until-positioned in both directions (no top-of-page
  flash).
- Black flash from a **variant mismatch** fixed (clone reuses the source's
  displayed image variant).
- Residual forward black isolated to the source/clone hand-off; forward source
  media now remains visible underneath the clone instead of disappearing
  immediately.

Recently fixed / awaiting final eyes:

- The residual home→detail black was isolated with a temporary Transition Lab:
  "keep source" fixed it, while gate on/off did not. Durable fix: forward source
  media is no longer immediately hidden, so the original card image remains under
  the clone during hand-off. The debug UI was removed after diagnosis.
- Event-driven hand-off, right-and-out body exit, source-media hand-off, and
  halftone clone readiness are all implemented. The remaining work is visual
  polish, wrapping/rhythm consistency, mobile QA, and friend-QA feedback.

---

## To Do — the "rock solid" pass (3 targeted fixes, in priority order)

Agreed framing: this is **three focused, independent fixes**, not a from-scratch
rewrite. Do the foundation (events/measurements) first; the body redesign then
falls out of it cheaply rather than being bolted onto timer-driven machinery.

### 1. Event-driven hand-off — DONE (2026-06-17, pending slow-mo QA)

Implemented; agent-verified by measurement. Moved to **Ready for Human QA** (the
ghost/pops are visual — only the user, in slow-mo, can confirm they're gone).
`completeTransitionAfterMotion()` now hands off on the media clone's
`transitionend` (any of its flight properties, `event.target === frame` to ignore
bubbling), with: a flight-duration+120ms **fallback** timer (a `done` flag makes a
late fire a no-op), and a **re-entrancy guard** (captures `key`, bails if a newer
navigation has taken over). Reduced motion is unaffected (the transition is
skipped upstream, so this path isn't reached). See Ready for Human QA for the
verification trace.

### 2. Right-and-out body exit — DONE (2026-06-18, pending slow-mo QA)

Body departure changed from down-and-out (`translateY(100vh)`) to
**right-and-out** in both detail pages. Current direction: measure the visible
article bodyplate before the exit starts, set `--detail-content-exit-x` to the
right-edge clear-out endpoint, use the branded `--snappy-ease-in` easing, and
hand off on the real `animationend`. This should make the duration token mean the
visible bodyplate-exit beat again while avoiding the old off-screen tail pause.
Article root gets `overflow-x: clip` while `.is-leaving` so the slide can't spawn
a scrollbar.

### 3. Residual black — DONE (2026-06-18, pending final visual QA)

There were multiple black-flash failure modes. Earlier fixes were still worth
keeping: the clone reuses the source image's `currentSrc`, uses sync decode, and
waits for the clone's required image layers before revealing a forward halftone
flight. But the user still saw black until a temporary Transition Lab isolated
the decisive clue: **Gate on/off did not matter; "keep source" fixed it.**

Final durable fix: on forward source→detail transitions, `FeaturedMediaFrame`
does not immediately hide the source-side media frame. The original card image
stays underneath the clone during lift-off, so there is no black/empty plate
state between the real source and the flying clone. Destination/reverse hiding
still works where duplicate plates or empty card frames would be worse.

### Then re-confirm the whole choreography end-to-end

After the three land, re-walk: forward, reverse, reverse-from-scrolled, both
detail types (case study + post), reduced-motion, and a fast double-click /
interrupt. Watch for new dangling-listener or re-entrancy issues introduced by
the event-driven hand-off.

### Remaining polish notes — added 2026-06-18

- **Writing author pop-in.** On Home→writing-detail, the author name appears
  after arrival rather than participating in the shared clone. Consider a
  masked inline reveal for detail-only metadata: an overflow-hidden wrapper with
  an inner span translating up/in from below, in the spirit of the Codrops
  `oh` / `oh__inner` title reveal. Keep this separate from the shared
  title/media morph unless the metadata becomes a true source/target element.
- **Case-study bottom nav styling + wrap parity.** `CaseStudyLoopNav.vue` still
  carries older gendes-academic styling. Pull it into the current case-study
  visual language and make sure the previous/next title typography, width,
  line-height, and wrapping are compatible with the destination case-study hero
  title. The current mismatch can create jitter when the nav title morphs into a
  destination hero with different line breaks.
- **Writing title wrap flicker.** Writing card titles and writing detail `h1`
  can wrap subtly differently, causing flicker during/at hand-off. CSS cannot
  tween line breaks, so reduce the mismatch by sharing font family, weight,
  line-height, letter spacing, max-width, and white-space behavior between
  source/target states where practical. If wrapping remains unstable, consider a
  transition-specific title constraint or measured target width so the clone
  never changes lines unexpectedly.
- **Mobile visual QA belongs here for now.** Mobile transition motion is broadly
  acceptable, but the source/destination compositions need responsive polish:
  unwrapped case-study hero titles can exceed the hero/text composition, selected
  work card photoplate rhythm can feel squashed, writing cards/details have
  similar mobile pressure, and the bottom case-study nav needs mobile wrapping
  parity too. Keep this in the transition spike because these are source/target
  surface-compatibility issues, not only standalone responsive design issues.

### Deferred easing cleanup

The bodyplate duration and content delay tokens have been renamed to
`$article-bodyplate-exit-duration` / `--article-bodyplate-exit-duration` and
`$content-delay` / `--content-delay`. Leave the remaining easing token naming
alone until the ease-in/ease-out curves are settled.

---

## Ready for Human QA

(Move items here when an agent has done them but they need the user's eyes in
slow-mo — agents can't see motion.)

- **Fix #1 — event-driven hand-off (2026-06-17).** Please confirm in slow-mo that
  the **ghost on return** (double photoplate/title during the cross-fade) and the
  **random pops** are gone. Agent verification (route 3000ms): on the reverse the
  clone eased to its seat (mediaTop 138→299) with the duotone held at **0.00 the
  entire flight**, and the cross-fade (0→1) began only once mediaTop was stable at
  299 — i.e. the cross-fade can no longer start while the clone is mid-flight. Also
  tested a **mid-flight interrupt** (clicked Home during a forward flight): landed
  on home with no stuck clones, page visible, no overflow. Forward/reverse both
  settle clean; no console errors; `corepack pnpm check` passes.
  - Watch especially: the *intermittent* cases that used to depend on window focus
    / the screenshot tool — those were the timing-drift symptom this fix targets.

- **Fix #2 — right-and-out body exit, measured endpoint (2026-06-18).** On
  detail→home the article now slides RIGHT off the edge (not down), with its
  endpoint measured from the visible bodyplate before the animation starts.
  Confirm in slow-mo: (a) no "big pause" between the body leaving and the
  photo/title starting, (b) the declared bodyplate-exit duration feels like the
  full visible beat again, and (c) **from a scrolled position** it just slides off
  the side with no
  awkward gap. Deliberate asymmetry: comes *up* in, goes *right* out.

- **Fix #3 — residual black, source hand-off fix (2026-06-18).** The temporary
  Transition Lab showed the useful binary result: **Gate on/off changed nothing;
  Keep source fixed it.** The final fix keeps the forward source media frame
  visible underneath the clone during lift-off instead of immediately applying
  `visibility:hidden`. Confirm in slow-mo that home→detail no longer has a black
  photoplate flash at normal or slowed durations. The earlier clone safeguards
  remain: reuse source `currentSrc`, sync decode, and required clone-layer
  readiness before revealing forward halftone flights.

---

## Known edge cases / open questions

- **Reverse from a scrolled position:** body gap (addressed by To Do #2); photo
  morphing in from off-screen (judged acceptable; "teleport into view then morph"
  parked).
- **Snap-to-top on return:** rejected (scroll-jacking).
- **Focus/throttle dependence:** artifacts change when the window loses focus
  (e.g. arming the macOS screenshot tool) — a tell that the remaining issues are
  timing races (To Do #1).
- **Token values are mid-tuning:** the user keeps `_motion-palette.scss` durations
  set to whatever they're currently QAing (often very slow). Don't treat a given
  value as "the" value; the tokens are knobs.

---

## Likely future work — held loosely

Direction sketches, not committed plans (rehomed from the case-hero spike at its
close, 2026-06-17). Don't let these pre-frame the rock-solid pass above.

- **Phase B "morphing arrival" — mostly absorbed.** The original idea: the clone
  morphs radius `0 → carve`, duotone → colour, coarse → final screen, and the slip
  dissolves plate-into-ground as it lands. Most of this is *already done* (radius
  morphs from the source corner; the duotone hand-off cross-fades; the clone now
  matches the hero at 11px). The unbuilt remainder: an actual *screen-resolution*
  morph during flight (we matched sizes instead of animating coarse→fine), and the
  slip "dissolving into the shelf." Revisit only if the arrival ever feels like it
  *pops* rather than *resolves*.
- **Phase C — deliberate transition ghosts, behind a control.** A *creative* effect
  (not the ghost *bug*): a full-treatment motion trail (Codrops read) vs. dot-field
  misregistration echoes (print-native read) that resolve into the final plate.
  Build first, judge visually, profile after. Purely additive flourish — only after
  the system is rock-solid.

---

## Done (preserve the chain of reasoning — newest last)

History is kept messy-but-true on purpose (see how-to-spike.md). These are the
moves that got us here, with the *why*.

- **Layered detail hero + flying-clone morph.** The card→detail transition uses a
  teleported clone reading geometry from `data-featured-*` attributes; not a
  Vue/Nuxt page transition (those rasterise, which we reject).
- **Two-layer overlay split.** Media clone at z-index 1, text clone at z-index
  901, so the article body (z-index 2) renders *between* them — body over photo,
  under title. Fixed "body renders under the hero photo during the transition."
- **Body rise gated.** `detail-content-rise` was removed (it played on plain
  refresh) then re-added as `is-arriving`, set only when the page is *arrived at
  via the transition* (the transition's `active` flag is still set at mount).
- **Custom-mode reverse links (key unlock).** SiteNav Home + writing items and
  SiteFooter's selected-work link were plain `NuxtLink`s → NuxtLink's own
  `router.push` fired instantly and *defeated* our handler's timing. Converting to
  custom mode (render our own `<a>`) gave our handler control. This is why the
  reverse timing was uncontrollable before. The cards (forward) were already
  custom mode — that's why the forward always felt better.
- **Two-step reverse hand-off + reliability.** Clone flies *fully* into the card,
  *then* the duotone cross-fades in (card photoplate held hidden the whole
  flight). Bumped `TRANSITION_TARGET_READY_TIMEOUT` so the real card is found
  rather than falling back to a stale cached rect (which read as "pop into place
  at 75%").
- **Body exit added.** `is-leaving` on the detail body, driven by a watcher that
  catches `active` flipping on *after* mount (= departure, not arrival).
- **Body clone (tried, then reverted).** Briefly cloned the article body into the
  overlay to fly it out on the home page; the whole tall article rendering over
  home read as chaos. Reverted to sliding the **real** body out on the detail page
  *before* navigating (a short, token-controlled hold).
- **Surroundings choreography (Phase 2).** `useHomeTransitionChoreography` collects
  sibling top-level sections + sibling cards (excluding the clicked card's section,
  then re-collecting its sibling cards), splits them above/below the clicked card
  by measured geometry, and animates with the Web Animations API, staggered by
  distance, in-frame only. Forward = out, reverse = in (cued *after* the card is
  scrolled into view, so it's measured at its real landing spot).
- **Independent duration tokens.** Added `--article-bodyplate-exit-duration`,
  `--duotone-fade-duration`, `--surroundings-duration` (with CSS
  fallbacks) so slowing the route for QA doesn't drag the small beats.
- **The big layout bug — exits animating on an invisible page.** `layouts/default.vue`
  was hiding `.site-main` whenever `phase !== 'moving'`, which includes
  `'starting'` — exactly when the body/surroundings exits play. They were
  animating on an `opacity: 0` page (agent measured the *element* opacity and
  missed the *parent* at 0). Fixed by **decoupling visibility from geometry**:
  added `hideDestination`, hid only the freshly-navigated destination (not the
  outgoing source mid-exit), in both directions. This also fixed the "Bottom Line"
  top-of-page flash on return (home hidden until scrolled + surroundings placed).
- **Black flash — variant mismatch (root cause #1).** The clone was loading a
  *different image variant* than the card displayed: card showed e.g. `…768x384`
  but the clone, at `sizes="100vw"` with the full srcset, picked the original
  `…_0.png` — uncached → real fetch → `contrast(1000)` halftone paints black while
  it loads. Fixed by making the clone reuse the source img's `currentSrc` (the
  exact cached variant), dropping the srcset re-pick. Verified: variant matches at
  multiple widths, `complete: true`. (Removed an earlier `decoding="sync"` patch
  that did nothing.)
- **Easing: exits use snappy ease-in.** Bodyplate exits now use
  `--snappy-ease-in`; entrances and settle motions remain on
  `--snappy-ease-out` unless a specific choreography needs otherwise.
- **Surroundings made fade-free.** Rewrote the surroundings keyframes to be pure
  translate **off-frame** (per-element measured distance) with **no opacity** — they
  stay fully opaque and simply leave.
- **Halftone size matched (forward hand-off made seamless).** Detail hero rested at
  `--halftone-size: 6px` while the clone is `11px`, so the photo "resolved down" on
  landing (a vibration) and the colour→colour cross-fade became visible. Set the
  detail hero to `11px` to match the clone (same size *and* `is-halftone-separate-k`
  treatment) → the forward hand-off lands on a pixel-identical plate.
- **Residual black isolated with Transition Lab, then fixed.** Temporary debug
  controls proved the decisive factor: keeping the source media visible removed
  the flash, while clone reveal gate on/off did not. Removed the debug UI and
  kept the durable rule: forward source media remains visible under the clone
  during lift-off; destination/reverse hiding remains available where needed.
