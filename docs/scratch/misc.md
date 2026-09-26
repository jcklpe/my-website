# Misc Inbox
Live inbox for loose observations. Use `skills/triage-project-misc/SKILL.md` for routing workflow.

Use this file only for genuinely new unclustered notes. Once a note has a clear home, move it into the relevant spike doc and delete it from here. Keep only the latest routing session as a short handoff; replace it on the next review.

## Unrouted Items
- **Offer shorter versions of long case studies** (2026-09-23; candidate for the content-audit spike). Human readers have consistently said the USCIS case study is too long, while LLM feedback has valued its depth as evidence of serious engagement with the subject. The user currently leans toward preserving the longer version, while acknowledging that not every reader wants that much detail and that several other case studies likely should be shorter. Explore whether a long-form case study could remain canonical while a cheeky, optional popup or invitation offers a shortened version. Do not assume the interaction should be a popup; evaluate tone, accessibility, discoverability, reading flow, SEO/canonical content, editorial effort and whether other case studies need direct shortening instead.

- **Case-study sheen may be unnecessary after live shader work** (2026-09-23). Now that the case studies have a live halftone treatment, snappy transitions and a compelling parallax effect, the intermittent sheen animation may be redundant. This is a later design consideration, not a request to remove it now; revisit it during the interaction-polish spike after the remaining parallax and hover-zone behavior is understood.

- **Footnote orphan sidenote regression watch** (moved from future ideas 2026-07-13). Observed on `http://my-website.localhost/writing/footnote-qa-all-combinations`: footnotes near the bottom of the page, especially markers inside non-paragraph blocks, sometimes failed to show their desktop sidenotes.

  Likely cause/fix applied: orphan sidenotes were originally discovered only once on mount. Writing body blocks are lazy-loaded, and nested/non-paragraph DOM can arrive after that first scan. `OrphanSidenoteRenderer.vue` now watches the footnote map and observes `.content-flow` mutations, rebuilding the orphan list when late markers appear. `FootnoteSidenote.vue` marks orphan-generated sidenotes so the collector does not mistake its own previous render for paragraph-owned coverage.

  If this resurfaces, inspect:

  - whether the missing marker has `sup[data-fn]`
  - whether `footnoteMap.value[uuid]` exists
  - whether an orphan `.footnote-sidenote[data-uuid][class*=is-orphan-sidenote]` was rendered
  - whether the sidenote exists but was classified `is-overflow`

  This is a watch item, not an active spike unless the bug reappears.

  - if you go from home to detail, the navigation is initially hidden. This is good, and intended behavior. But as soon as you scroll down it briefly pops in before rehiding. The rehiding on scroll is intended behavior but not the pop in to then rehide.

## Latest Routing Session
Reviewed 2026-09-23.

- Added the user's optional shorter-version idea for long case studies as content-audit intake, and the possible removal of case-study sheen as deferred interaction-design intake. The footnote watch remains. No item was promoted or decided in this session.
