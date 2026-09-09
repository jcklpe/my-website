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

## Latest Routing Session
Reviewed 2026-09-02.

- Deleted items addressed by the animation and production-deploy spikes, the retained halftone decision, and the already CMS-controlled Side Projects heading.
- Moved transition-effect trials into the active animation spike.
- Created scratch seeds for miscellaneous launch cleanup and performance/optimization work.
- Logged flocking animations, a colophon page, and custom mouse icons as future ideas.
- Pinned the design-token tooling evaluation for a later cross-tool need.
- Browser-back transition concern was subsequently closed by human QA in animation; only the footnote orphan-sidenote regression watch remains unresolved intake.
