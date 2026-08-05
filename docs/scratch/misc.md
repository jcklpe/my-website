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

## Latest Routing Session
Reviewed 2026-07-30. This was a deliberately limited routing pass, not a full inbox triage.

- Created [`content-toc-underlap.md`](../active-spikes/content-toc-underlap.md) for the related File/Accordion surface regressions, frontend-only cream matte leakage, Side Projects context, and TOC occlusion/rail-position work; the user then promoted it to active work.
- Moved the static case-study loop-navigation defect into [`production-deploy.md`](production-deploy.md) with the client-only data-loading/static-endpoint diagnosis preserved.
- Moved the `llms.txt` idea into [`production-deploy.md`](production-deploy.md) alongside robots and sitemap policy, marked as optional discovery metadata rather than a launch blocker.
- Left all other inbox items unrouted for a later full review.
