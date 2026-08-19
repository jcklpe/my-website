# Misc Inbox
Live inbox for loose observations. Use `skills/triage-project-misc/SKILL.md` for routing workflow.

Use this file only for genuinely new unclustered notes. Once a note has a clear home, move it into the relevant spike doc and delete it from here. Keep only the latest routing session as a short handoff; replace it on the next review.

## Unrouted Items
- **Footnote orphan sidenote regression watch** (moved from future ideas 2026-07-13). Observed on `http://my-website.localhost/writing/footnote-qa-all-combinations`: footnotes near the bottom of the page, especially markers inside non-paragraph blocks, sometimes failed to show their desktop sidenotes.

  Likely cause/fix applied: orphan sidenotes were originally discovered only once on mount. Writing body blocks are lazy-loaded, and nested/non-paragraph DOM can arrive after that first scan. `OrphanSidenoteRenderer.vue` now watches the footnote map and observes `.content-flow` mutations, rebuilding the orphan list when late markers appear. `FootnoteSidenote.vue` marks orphan-generated sidenotes so the collector does not mistake its own previous render for paragraph-owned coverage.

  If this resurfaces, inspect:

  - whether the missing marker has `sup[data-fn]`
  - whether `footnoteMap.value[uuid]` exists
  - whether an orphan `.footnote-sidenote[data-uuid][class*=is-orphan-sidenote]` was rendered
  - whether the sidenote exists but was classified `is-overflow`

  This is a watch item, not an active spike unless the bug reappears.
- are there any lessons we can take from this to improve performance? https://dev.to/svsharma/the-surprising-tech-behind-mcmaster-carrs-blazing-fast-website-speed-bfc
- maybe should add a colophon page.
- other potential stuff is flocking behavior animations
- we should migrate the footnotes test post that's currently on the public server to the qa server so that it can still be used to test things.
- same with the image resizing testing blog post in public also.
- When testing on phone I noticed that navigating from home to a detail page, and then navigating back home animates the transition different than if you navigate from home to a detail page and then hit the browser "back" button. Hitting the back button looks more janky, not sure why.
- Custom mouse icons?
- don't forget to try the transition effect trials thing.
- Side projects title needs to be CMS controlled.
- we have a bug when we transition to a blog post where the ground behind the title sort of blinks out and then back in. This bug appeared around the tiem we started fiddling with the TOC being invisibile on initial load if covered by anything, so may have something to do with that idk.
- despite what an agent said this: "  const DRIFT_SPEED_POINTER = 0.7; // noise units per second, desktop" does not actually control the speed of the drift on mobile with the motion controls. so this needs to be fixed. We need to make it so that we have healthy fast drift on desktop and then on mobile the tilt doesn't create insanely fast tiger striped strobing effects.
- the deadzone behond Bottom Line doesn't appear to be working. Not sure why.
- **Bodoni beyond the BLUF hero.** The `/dev/motion` lab's Bodoni display headings feel distinctive and unexpectedly chic, though their current tracking is too tight. Consider whether Bodoni should become a selective display voice elsewhere—section openings or other deliberately art-directed headings—without replacing the site's mono editorial hierarchy wholesale. This is a typography/design-system question, not approval of the lab's exact spacing.
- **Reassess the case-study halftone treatment in context.** The baked halftone remains useful for making weak or low-resolution legacy project imagery feel intentional and visually consistent, but it is now largely isolated to Selected Work and no longer demonstrates the liveliness of the former real-time effect. During the animation/card-hover work, compare real CMS cards with baked halftone, untreated source imagery, and deliberately aesthetic or slightly abstract generated hero imagery—not merely neural restoration. Existing source images are often atmospheric illustrations rather than project evidence; the real risk in generated replacements is an overly generic, conspicuously "AI" look that invites negative judgment. Decide whether halftone should be better integrated into the wider visual language, retained as a pragmatic case-study-only treatment, paired with carefully art-directed generated imagery, or eventually retired. Do not discard it before accounting for its image-quality camouflage role and its coupling to the featured-media transition.

## Latest Routing Session
Reviewed 2026-08-19. This was a deliberately limited routing pass, not a full inbox triage.

- Moved the desktop TOC's fast, downward-only auto-collapse observation into the now-archived Content, TOC, and Underlap spike as P32; successive human QA settled the allowance at `200vh`.
- Moved the inaccurate mobile TOC heading navigation into the same archived spike as P33; human QA confirmed that closing the in-flow list before smooth scrolling fixed the landing position.
- Left all other inbox items unrouted for a later full review.
