# Featured-Media Transition — To Do

Historical operational tracking for the card↔detail featured-image morph.
Conceptual model, architecture, and durable lessons:
[featured-media-transition.md](featured-media-transition.md).

## Closeout

Closed 2026-06-23.

The final visual QA pass is accepted. The case-study and writing featured-media
transitions now feel stable enough to stop treating this as an active spike:
forward/reverse motion, card frame gating, author/card-extra slip beats, mobile
case-study titleplate composition, baked halftone media, and bottom case-study
previous/next nav are all in the shipped direction. The newly landed writing
archive/list work also removes the last observed writing title-wrap shiver from
this spike's critical path.

Durable lessons have been folded into `docs/visual-design.md`,
`docs/design-system.md`, `docs/deferred-decisions.md`, and `AGENTS.md`. This file
is now historical implementation context, not an active checklist.

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
- Event-driven hand-off, right-and-out body exit, source-media hand-off,
  halftone clone readiness, card frame gating, mobile case-study titleplate
  tuning, and bottom previous/next nav restyling are all implemented. The
  remaining work is mostly final QA, static/CDN/Safari verification, and deciding
  whether any lingering title-wrap edge cases are real blockers or acceptable
  launch polish.
- Mobile/Safari halftone performance fallback added after friend QA exposed
  heavy stutter/freezes on case-study transitions. Fragile contexts now get a
  direct-image case-study photoplate treatment instead of the full live
  CSS/SVG/K-layer halftone stack, and the flying clone skips the halftone stack
  entirely in that mode.
- Browser-baked halftone media path added. `corepack pnpm bake:halftones`
  renders the existing CSS halftone/K-layer recipe in headless Chrome and writes
  `case-study-halftone-600`, `case-study-halftone-1200`, and
  `case-study-halftone-1800` derivatives into WordPress attachment metadata.
  The frontend prefers those derivatives for case-study cards/heroes when
  present. In that mode the flying clone is a normal bitmap and the live ink/K
  stack is skipped. The old live stack and PHP/Imagick generator remain
  fallback paths for media whose derivatives have not been browser-baked yet.
- Homepage writing cards are now headline-first and excerpt-free. This removes
  the slightly awkward homepage writing excerpt exit/reveal from the main
  transition path while preserving `PostCard` excerpt support for the writing
  archive or future card surfaces. The archive excerpt decision is pinned in
  `docs/deferred-decisions.md`.
- The first/banner case-study card now has an explicit photoplate/textplate
  divider again. The visible line is drawn as transition-aware card styling, so
  it can stay hidden during the reverse morph and appear only after the flying
  plate has landed.
- Case-study bottom previous/next nav has been pulled into the current
  case-study card language. It now uses the shared selected-work photo-treatment
  presets, baked halftone derivatives when available, duotone-at-rest /
  color-on-hover behavior, a compact excerpt-bearing editorial titleplate, and
  masked slip beats for the non-shared previous/next label and excerpt. The
  old dark magnify-on-hover panel is gone. Previous/next indices are passed
  through so `auto` treatments match the homepage cycle. A follow-up right-edge
  clipping bug on the Next card was fixed by making the titleplate border-box
  sized and containing the title/excerpt width.

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

### Remaining polish notes — added 2026-06-18, updated 2026-06-19

- **Card border pre-empts the morph (detail→home) — implemented, pending visual QA.** The case-study card now keeps a transparent real border for layout, then draws the visible ink frame with transition-aware pseudo-elements. During reverse transitions that frame is hidden until the flying clone has seated, then fades in with the hand-off. The banner-card photoplate/textplate divider follows the same rule. This avoids the old receiving-card outline cutting across the photoplate mid-flight.

- **Writing author pop-in — implemented, pending visual QA.** On
  Home→writing-detail, the author separator/name now use a masked inline reveal:
  an overflow-hidden wrapper with an inner span translating up into place, in
  the spirit of the Codrops `oh` / `oh__inner` title reveal. This remains
  separate from the shared title/media morph unless the metadata becomes a true
  source/target element.
- **Reverse surroundings timing — implemented, pending visual QA.** Home
  surroundings now read `--content-delay` as a base delay for reverse/inbound
  assembly only. Forward lift-off timing is unchanged. The intent is to let the
  photoplate get closer to its destination before sibling cards/sections close
  back around it.
- **Case-study card extra text reveal — implemented, pending visual QA.** The
  card-only ordinal number and excerpt now use the same masked-slip family as
  the writing author metadata instead of fading in with the whole text plate.
  Source-card excerpts/ordinals slip upward out of their clipping mask on exit,
  while destination-card extras can still slip up into place from below after
  the clone seats. The shared clone still owns the title morph; the real title
  hides instantly while the clone is active.
- **Writing card excerpt reveal — implemented, mostly parked.** Writing card
  excerpts can use the same direction-aware masked slip instead of the old
  opacity fade: upward on source-card exit, from below on destination reveal.
  Homepage writing cards no longer render excerpts, so this mainly matters for
  the `/writing` archive or any future writing card surface that opts excerpts
  back in.
- **Card-extra preflight beat — implemented, pending visual QA.** Forward
  source-card transitions now run a preflight state before the shared clone
  mounts. Case-study ordinals/excerpts and writing excerpts get
  `--card-extra-slip-duration` to slip upward out of their clipping masks, then
  the title/media clone starts. Cards without source extras skip the delay.
- **Case-study bottom nav styling + wrap parity — implemented, visually accepted.**
  `CaseStudyLoopNav.vue` now uses the same case-study photo-treatment presets as
  the homepage cards, including baked halftones, duotone rest states, and color
  reveal on hover. The titleplate is now a compact solid surface below the
  photoplate with the case-study excerpt restored. Previous/next direction
  labels and excerpts are card-only extras, so they use the same masked preflight
  slip-away beat as homepage card numbers/excerpts before the shared title/media
  clone starts. The Next card is right-aligned on desktop. A right-edge clipping
  bug from `width: 100%` plus padding was fixed with `box-sizing: border-box`
  and contained title/excerpt widths. Keep an eye on long-title wrapping in
  final mobile/static QA, but the bottom-nav restyle itself is no longer an
  active transition-spike blocker.
- **Title wrap flicker / line-break popping.** Writing card titles and writing
  detail `h1`s can wrap subtly differently, and case-study bottom-nav titles can
  wrap differently from their destination hero titles. CSS cannot tween line
  breaks, so reduce the mismatch by first sharing font family, weight, size,
  line-height, letter spacing, max-width, and white-space/text-wrap behavior
  between each source/target pair. If wrapping remains unstable, consider a
  transition-specific title width: measure the destination title surface, apply
  that width to the flying clone for the final part of the flight, and let the
  real destination text appear only after the clone has seated.
- **Mobile visual QA belongs here for now.** Mobile transition motion is broadly
  acceptable, but the source/destination compositions need responsive polish:
  unwrapped case-study hero titles can exceed the hero/text composition, selected
  work card photoplate rhythm can feel squashed, writing cards/details have
  similar mobile pressure, and the bottom case-study nav needs confirmation
  after its restyle. Keep this in the transition spike because these are
  source/target surface-compatibility issues, not only standalone responsive
  design issues.
  New browser-performance wrinkle: Safari/coarse/mobile contexts use the
  halftone performance fallback, so QA must check both the full-halftone path
  and the fallback path as intentional variants.
- **Baked halftone QA/migration.** Existing uploads need a one-time browser-bake
  pass (`corepack pnpm bake:halftones` for case-study featured media, or
  `-- --attachment=<id>` for a single image). `wp my-website
  regenerate-halftones` still exists as a PHP/Imagick fallback, but exact parity
  with the CSS recipe comes from the Chrome bake. After that, QA should compare:
  baked card rest, baked hover reveal, baked home→detail, baked detail→home,
  Safari desktop, and mobile Safari. The goal is preserving the printed-image
  register while making the moving media a cheap bitmap.

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
- **Browser-baked halftone path added.** Safari/mobile QA showed the live
  CSS/SVG/K-layer halftone was too expensive and too browser-sensitive to remain
  the default moving-media strategy. The preferred bake now renders the actual
  CSS halftone/K-layer stack in headless Chrome, writes
  `case-study-halftone-*` PNG derivatives into attachment metadata, and Nuxt
  asks for that treatment explicitly on case-study cards/heroes. The transition
  layer treats baked halftones as ordinary images in flight. The procedural live
  stack and PHP/Imagick generator are retained as fallbacks.
- **Masked one-sided text beats.** Detail-only writing author metadata and
  card-only case-study extras now use masked slip reveals instead of abrupt
  mounts/fades. Forward source cards run a short preflight beat so card-only
  extras can slip upward out of view before the shared photo/title clone covers
  the card.
- **Homepage writing cards made headline-first.** Homepage writing excerpts were
  removed after the exit slip felt visually noisy there. The transition path now
  focuses on the writing card title/photoplate, while excerpt support remains in
  `PostCard` for the archive or future surfaces.
- **Receiving case-study card frame gated.** The visible card frame, including
  the banner photoplate/textplate divider, is now drawn as hand-off styling that
  can stay hidden during reverse flight and appear only after the photoplate has
  landed.
- **Case-study bottom loop nav restyled.** The previous/next case-study nav no
  longer uses the old magnify-on-hover dark image panel. It shares the same
  case-study photo-treatment helper as the homepage selected-work cards, so CMS
  treatment choices and `auto` cycling flow into the loop nav too. Resting media
  is duotone/tinted, hover reveals color, baked halftone media is preferred, and
  the title source is a compact editorial textplate that still participates in
  the featured-media title/slip transition. The previous/next label and excerpt
  are now separate card-extra slip elements, the next card is right-aligned on
  desktop, and the Next titleplate clipping bug was fixed by making the plate
  border-box sized and constraining wrapped text inside it.
