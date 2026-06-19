# Featured-Media Transition — Conceptual

The choreographed transition that morphs a case study's (or post's) featured
image — and its title — between the **home card** and the **detail hero**, in
both directions, across a real page navigation. Grew out of the case-hero spike
([archive/case-hero.md](archive/case-hero.md), closed 2026-06-17) but is now its
own cross-cutting system.

Operational tracking and history live in
[featured-media-transition.todo.md](featured-media-transition.todo.md).

---

## What it is, in one sentence

When you click a card, its photo appears to **lift off and fly** to become the
detail page's hero (and the title flies with it); when you go back, it flies
home and lands on its card, with the home page assembling in around it.

## The colour journey

The featured image is shown in **duotone at browsing distance** (on the home
cards) and resolves to **full colour on arrival** (the detail hero rests in full
CMYK halftone, `duotoneMode: 'off'`). The transition carries this: the flying
clone is full colour; the reverse hand-off cross-fades the home card's duotone
**in** as the clone lands. The forward hand-off is colour→colour (the clone and
the detail hero match), so it should be an invisible swap, not a visible fade.

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

- **Detail-only metadata reveal.** Some text exists only on the destination
  detail page, so it cannot participate in the shared source→target morph. For
  writing posts, the author name currently pops in after the card title lands.
  Preferred direction: a native CSS masked reveal (overflow-hidden wrapper +
  translated inner span) so non-shared metadata feels intentionally introduced
  rather than abruptly mounted.
- **Title wrapping is part of the morph.** The system can animate position,
  size, font properties, and colour, but it cannot smoothly interpolate a line
  break. Source and target title surfaces need compatible width and typography
  constraints, especially writing cards→writing `h1` and bottom case-study nav
  links→case-study hero titles.
- **Source/destination surfaces are transition machinery.** Cards, detail heroes,
  and bottom previous/next nav links are not only static designs; they are the
  geometry anchors for the transition. Restyling those surfaces must preserve
  data hooks and should be judged by motion as well as static appearance.
- **Mobile QA is not just responsive styling.** Mobile case-study and writing
  surfaces can look cramped even when the motion algorithm works. Because the
  same cramped surfaces become the transition source/target geometry, mobile
  visual QA belongs in this spike until the card/hero/nav compositions settle.
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
