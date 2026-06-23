# Featured-Media Transition — Conceptual

Archived 2026-06-23. Durable guidance from this spike has been folded into
`docs/visual-design.md`, `docs/design-system.md`, and `AGENTS.md`; this document
is preserved for background and implementation history.

The choreographed transition that morphs a case study's (or post's) featured
image — and its title — between the **home card** and the **detail hero**, in
both directions, across a real page navigation. Grew out of the case-hero spike
([case-hero.md](case-hero.md), closed 2026-06-17) but became its own
cross-cutting system.

Archived operational tracking and history live in
[featured-media-transition.todo.md](featured-media-transition.todo.md).

---

## What it is, in one sentence

When you click a card, its photo appears to **lift off and fly** to become the
detail page's hero (and the title flies with it); when you go back, it flies
home and lands on its card, with the home page assembling in around it.

## The colour journey

The featured image is shown in **duotone at browsing distance** (on the home
cards) and resolves to **full colour on arrival**. The preferred implementation
is now a **browser-baked halftone bitmap** generated from the rectangular source
image (`case-study-halftone-*` media sizes) by rendering the same CSS
halftone/K-layer recipe in headless Chrome. The transition carries that treated
bitmap as a normal image: the flying clone should animate geometry only, with
no CSS dot/K stack to rasterize mid-flight.

The old live CSS/SVG/K-layer halftone remains a migration fallback for media
that has not yet had baked derivatives generated. The WordPress PHP/Imagick
generator is also fallback-quality only; exact visual parity comes from the
host-side `corepack pnpm bake:halftones` Chrome bake. Safari, coarse-pointer
devices, and phone-sized viewports still use a defensive fallback for the old
live path. Once the featured image has baked halftone sizes, every browser can
follow the simpler bitmap path.

---

## Why this is genuinely hard (the core constraint)

The transition **crosses a page navigation**. The photo on the home card and the
photo on the detail hero are two *different DOM elements on two different pages*.
Navigating tears down the source page (card and all) and builds the destination
page (hero and all) — so there is **never a single instant where both exist** to
morph one into the other; the start element is gone before the end element is
born.

Consequences that shape every decision here:

- **A flying clone is unavoidable.** We render a third element — a copy of the
  photo (and title) — in a persistent layer that floats above the page and
  survives the navigation, so there is always something on screen to fly from
  the old spot to the new spot. A pure CSS/FLIP transform on the *real* element
  works beautifully **within** one page but cannot reach across a navigation.
- **We rejected the platform's built-in answer.** The View Transitions API does
  cross-navigation morphs, but by **rasterising** snapshots — which blurs/distorts
  the crisp halftone and is a cross-fade, not a true morph. Crispness is a core
  value here, so we hand-build instead, and accept the complexity that comes with
  it.
- **Source and destination must be bridged in time.** Things that *exit* animate
  on the source page **before** navigation; things that *enter* animate on the
  destination page **after** navigation; the clone is the only continuous thread
  across the cut.

## Non-goals

- Not a general page-transition system. A separate, simple **fallback page
  transition** (`plugins/fallback-page-transition.client.ts`) handles ordinary
  navigations and is explicitly suppressed while a featured-media transition
  runs.
- Not trying to morph arbitrary content across navigation — only the featured
  image, the title, and (as choreography) the body and the home surroundings.
- Not chasing pixel-identical behaviour across every browser/condition; chasing
  *robustness* — no random glitches a careful eye can catch.

---

## The architecture (where things live)

- **`composables/useFeaturedMediaTransition.ts`** — the orchestrator. Holds the
  shared transition state and runs the forward
  (`navigateWithFeaturedMediaTransition`) and reverse
  (`navigateFromFeaturedMediaTarget`) sequences. Reads geometry from
  `data-featured-*` attributes on the real source/target elements.
- **`components/transitions/FeaturedMediaTransitionLayer.vue`** — renders the
  flying clones into two teleported, fixed layers:
  - `.ftml-layer--media` (z-index **1**) — the halftone photo clone.
  - `.ftml-layer--text` (z-index **901**) — the slip/title/meta clone.
  - The page's article content sits at z-index **2**, *between* them, so the body
    can render over the photo but under the title.
- **`composables/useHomeTransitionChoreography.ts`** — the home "surroundings"
  (sibling sections + sibling cards) assembling out/in around the clicked card.
- **`layouts/default.vue`** — owns destination page **visibility** during a
  transition (`is-featured-media-incoming`).
- **Detail pages** (`pages/case-studies/[slug].vue`, `pages/writing/[slug].vue`)
  — the body rise-in / slide-out, and the `data-featured-*` target hooks.
- **`components/navigation/cards/CaseStudyCard.vue`** — the source card; hides its
  own photoplate during flight and cross-fades the duotone back at hand-off.
- **`components/navigation/CaseStudyLoopNav.vue`** — the bottom previous/next
  source surface on case-study detail pages. It uses the same selected-work
  photo-treatment presets as the homepage cards so bottom-nav media can morph
  from the same duotone/halftone visual language.
- **`utils/case-study-photo-treatment.ts`** — shared case-study photo-treatment
  presets and helpers used by both homepage cards and the bottom loop nav.
- **`components/navigation/SiteNav.vue` / `SiteFooter.vue`** — the reverse
  triggers. **Custom-mode** `NuxtLink`s (they render their own `<a>`) so our click
  handler owns navigation timing — a plain `NuxtLink` fires its own `router.push`
  the instant it's clicked and *races/defeats* our orchestration.
- **`packages/styles/_motion-palette.scss`** — the duration tokens.

### The clone's geometry phase vs. page visibility (kept separate)

Two concerns that used to be tangled in one switch, now deliberately split:

- **`phase`**: `'idle' | 'starting' | 'moving'` — *where the clone is*. `'starting'`
  = clone sits at its source rect (`from`); `'moving'` = clone animating to its
  destination rect (`to`).
- **`hideDestination`** (boolean): *whether the freshly-navigated destination page
  is allowed to be visible*. True while the destination has mounted but isn't yet
  positioned (scrolled to the card, surroundings placed); the layout hides it so
  its un-transitioned top doesn't flash before it's revealed in place.

Tangling these caused real bugs (see the todo doc): exits animating on an
invisible page, and the home "Bottom Line" hero flashing on the way back.

### Timing tokens (all independent of the route/flight duration)

So slowing the flight for QA doesn't drag the small beats with it:

- `--featured-media-flight-duration` — the flight (clone morph) itself.
- `--article-bodyplate-exit-duration` — the detail bodyplate's exit.
- `--card-extra-slip-duration` — the short preflight beat for card-only extras
  (case-study numbers/excerpts, optional writing excerpts) to slip away before
  the shared clone covers the source card.
- `--content-delay` — the small staging gap used where surrounding content
  should wait for the load-bearing photo/title morph to get closer to its seat.
- `--duotone-fade-duration` — the hand-off duotone cross-fade.
- `--surroundings-duration` — the home surroundings assembling out/in.

---

## The settled conceptual model (the durable lessons)

These are the principles we converged on after a lot of patch-then-observe. They
should shape future work more than any single code detail.

### 1. Measured, not hardcoded

Animate to **real, read-from-the-DOM geometry**, not to constants. A constant
distance (`translateY(100vh)`) is simultaneously *too far* (the element clears
the frame partway through, so the rest of the duration is invisible dead-time +
the easing front-loads the visible half into a whip) and *brittle* (it ignores
scroll position and viewport). "Leave the frame" is a different instruction from
"travel 100vh," and the first is the one we mean. The home surroundings do this
(each travels exactly far enough to clear its edge), and the bodyplate exit now
uses the same principle: measure the visible article plate, set the clear-out
endpoint, and wait for the real animation end.

### 2. Event-driven, not timer-scripted

The hand-off must fire from a real "the clone arrived" event, not from a
parallel stopwatch. A previous `setTimeout` ran alongside the clone's CSS
transition and trusted the clocks to finish together; under load, focus-throttle,
or a slow decode, they drifted and produced ghosting/pops. The current model uses
the media clone's `transitionend`, with a guarded fallback timer only as a safety
net.

### 3. Prepare off-screen / hidden, then reveal — never reveal early

Both "flash" bugs were the same mistake in different costumes: showing something
before it was ready.

- **Black flash** = either revealing the flying photo before its filter stack has
  painted, or hiding the original source image before the clone is visually
  equivalent. The final forward fix keeps the source media visible underneath the
  clone during hand-off.
- **"Bottom Line" flash** = revealing the home page before it had been *scrolled
  to the card and its surroundings positioned* (so you saw the top-of-page jump).

The cure is always the same shape: do the not-yet-ready work invisibly, reveal
only when ready.

### 4. Load-bearing vs. garnish

- **Load-bearing:** the photo (and title) morph. It's the whole idea — a small,
  well-defined gesture (one element flying between two known rects) that makes it
  feel like one continuous object across the navigation.
- **Garnish:** the body exit and the home surroundings. Gorgeous when they land —
  and *also where all the jank lives*, because they're big, full-screen,
  scroll-dependent moves. "Bulletproof" doesn't mean making everything perfect; it
  means making the garnish either **measured + event-driven** (so it can't
  overshoot or drift) or, where it can't be made robust, **gracefully simple**.

### 5. The forward/back asymmetry is principled, not a fudge

Entry and exit don't have to mirror, because the *situations* aren't symmetric:

- **Entry always happens at the top** — arriving on a detail page scrolls to the
  top, so the body reliably rises *up and in*. Always safe.
- **Exit happens from wherever you are** — so the exit is the one that must be
  scroll-proof. (Leading candidate: **right-and-out** — horizontal distance is
  predictable and scroll-independent, and sliding sideways never opens a vertical
  gap toward an off-screen photoplate.)

So "up-and-in, (something-else)-and-out" is the design *responding* to the moment,
not a compromise.

### 6. Our handler must own the timing

Anything that can navigate (the reverse links) must be in `NuxtLink` **custom
mode**, so *we* preventDefault and drive the route — otherwise NuxtLink's own
`router.push` races and defeats the whole orchestration. The forward (cards)
already worked because they were custom-mode from the start.

---

## Known seams / open design questions

- **Detail-only and card-only text reveals.** Some text exists only on one side
  of the transition, so it cannot participate in the shared source→target morph.
  Writing author metadata and card-only extras (case-study ordinals, excerpts)
  now use native CSS masked reveals: an overflow-hidden wrapper with a
  translated inner span. Forward source-card exits get a short preflight beat so
  those extras can slip away before the shared title/media clone covers them.
- **Title wrapping is part of the morph.** The system can animate position,
  size, font properties, and colour, but it cannot smoothly interpolate a line
  break. Source and target title surfaces need compatible width and typography
  constraints, especially writing cards→writing `h1` and bottom case-study nav
  links→case-study hero titles. The bottom nav now shares the current case-study
  visual language and its non-shared direction/excerpt copy slips away before
  the clone starts. Long-title wrapping still needs normal final QA, but the
  previous old-style bottom-nav mismatch is resolved.
  Treat this as a source/target parity problem first: match font family, weight,
  size, line-height, letter spacing, max-width, and wrapping rules before adding
  new transition machinery. If parity is still not enough, the next candidate is
  measured clone width near landing rather than line-splitting the text.
- **Source/destination surfaces are transition machinery.** Cards, detail heroes,
  and bottom previous/next nav links are not only static designs; they are the
  geometry anchors for the transition. Restyling those surfaces must preserve
  data hooks and should be judged by motion as well as static appearance.
- **Mobile QA is not just responsive styling.** Mobile case-study and writing
  surfaces can look cramped even when the motion algorithm works. Because the
  same cramped surfaces become the transition source/target geometry, mobile
  visual QA belongs in this spike until the card/hero/nav compositions settle.
  The next pass should look specifically at photoplate/textplate proportions on
  case-study cards, case-study heroes, writing cards, writing detail heroes, and
  bottom case-study nav links.
- **Halftone has a browser-performance ceiling.** The full case-study treatment
  combines filters, blend modes, oversized rotated dot fields, SVG tone filters,
  and a duplicate K layer. Desktop Chromium handles the live stack well; mobile
  Safari and some Safari contexts can stutter or freeze during transition. The
  fallback keeps the composition and transition geometry but drops the expensive
  print-process treatment in those contexts.
- **Body exit from a scrolled position.** Sliding *down* from mid-article opened
  an awkward empty band (the photoplate it "belonged to" was off-screen above).
  Current answer: right-and-out with a measured endpoint; keep verifying this in
  slow-mo from mid-article positions.
- **Photo morphing in from off-screen** when you return from deep in an article.
  Judged *acceptable* for now ("not a huge deal"); "teleport into view then morph"
  was considered and parked (trades a slide-in for a pop, unclear if it's an
  improvement).
- **Snap-to-top on return** was considered and **rejected** — most physically
  "honest," but scroll-jacking breaks the feeling that the reader is driving.
