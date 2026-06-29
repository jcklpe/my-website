# Misc 1 Spike

Small, uncategorized improvements collected from observations during earlier work. These are actionable fixes that don't cluster with the larger content-blocks or brand-voice work. The scope expanded slightly during execution as cream-transition and nav-visibility issues were exposed during QA.

---

## Items

### Copyright Year Range

The footer copyright previously showed just the current year. Changed to `© 2014–{{ new Date().getFullYear() }}`. The 2014 start date signals tenure and career seniority.

File: `apps/frontend/components/navigation/SiteFooter.vue`

### Writing Archive Rows: Full-Width Flush

Writing archive rows (`/writing`) were not extending to the full viewport width. Fixed by moving horizontal padding from the `.archive` container to inner elements (`.section-heading`, `.archive-actions`), and adding `padding-inline` to `.year-header` so the year label aligns with row content while the full-width border-bottom remains unaffected.

Files: `apps/frontend/pages/writing/index.vue`, `apps/frontend/components/navigation/lists/WritingArchiveList.vue`

### Cream Ground Transition Glitch — Forward (Home → Detail)

During the forward card-to-detail transition, the destination detail page was hidden until the clone positioned itself, then revealed — but the cream page background flashed in abruptly at that moment. Fixed by adding `is-hero-arriving` to the detail page root during the active transition, which triggers a `cream-bg-in` keyframe animation that fades the cream background in from alpha-zero over `--featured-media-flight-duration`, synchronized with the clone flight.

Files: `apps/frontend/pages/case-studies/[slug].vue`, `apps/frontend/pages/writing/[slug].vue`

### Cream Ground Transition Glitch — Reverse (Detail → Home)

The mobile stepped title ground (cream strips behind the title text) was using the detail-page cream color (`--color-surface-warmer`) for the flying clone during the reverse transition. This caused a visible cream-on-white contrast as the clone landed on the card's white plate. Fixed by always returning `--color-surface` (white) from `cloneTitleGroundColor` in `FeaturedMediaTransitionLayer.vue` — the detail title is hidden during reverse flight, so the clone is all that's visible, and it needs to match the card destination.

File: `apps/frontend/components/transitions/FeaturedMediaTransitionLayer.vue`

### Cream Background Fade — RGBA Keyframe Approach

`background-color: transparent` is `rgba(0,0,0,0)` under the hood. Transitioning from that to cream passes through semi-transparent black at intermediate steps, creating a subtle muddy hue shift. Replaced with `@keyframes` animations using `--color-surface-warmer-0` (`#f3efe500`) as the alpha-zero keyframe endpoint — same hue throughout, only opacity changes.

Two direction-aware classes on the detail page root:
- `is-hero-arriving` (forward, `sourceRole === 'source'`): `cream-bg-in` over `--featured-media-flight-duration` with `--snappy-ease-out`
- `is-hero-departing` (reverse, `sourceRole === 'target'`): `cream-bg-out` over `--article-bodyplate-exit-duration` with `--snappy-ease-in`

`animation-fill-mode: both` ensures the starting keyframe value locks in immediately on class attach, preventing single-frame flashes.

Token added: `$color-surface-warmer-0: #f3efe500` in `_color-palette.scss`, exported as `--color-surface-warmer-0` from `_vue-frontend.scss`.

### Interior Nav — Scroll-Aware Visibility

The interior nav (`SiteNav` with `variant="interior"`) was visible on initial page load across all interior pages, which felt awkward during the hero-transition arrival and on longer-content pages where the user is immediately reading.

Implemented scroll-aware visibility with page-type-specific rules:

- **About**: always visible (short content, nav context is useful from the start)
- **Writing detail**: hidden during a hero-transition arrival; auto-reveals when the transition lands (watched via `isTransitioning` falling from `true → false`); then scroll-aware (hides on scroll-down, reveals on scroll-up). Direct URL navigations reveal the nav immediately.
- **Case study detail, writing archive, side projects**: hidden on initial load; reveals only when the user scrolls up

Removed the `.is-transitioning { transform: translateY(0) }` CSS rule that was causing the nav to flash visible during transitions (the scroll-handler `isTransitioning.value` guard already covers the underlying concern).

File: `apps/frontend/components/navigation/SiteNav.vue`
