# Misc 1 Spike — To Do

## Status: ✅ Complete

See `docs/misc1.md` for rationale on each item.

---

- [x] Copyright: change `{{ new Date().getFullYear() }}` to `2014–{{ new Date().getFullYear() }}` in SiteFooter.vue
- [x] Writing archive rows: make rows flush full-width left and right
- [x] Cream transition glitch (forward): mask/delay cream title background during card-to-detail animation
- [x] Cream transition glitch (reverse): title clone ground color was cream on detail→home; fixed `cloneTitleGroundColor` in `FeaturedMediaTransitionLayer.vue` to always use white (`--color-surface`), matching the card plate it lands on
- [x] Cream page background fade: replaced `background-color: transparent` (hue-shifts through black) with `@keyframes cream-bg-in` / `cream-bg-out` animations synchronized to `--featured-media-flight-duration` and `--article-bodyplate-exit-duration`; uses `--color-surface-warmer-0` (`#f3efe500`) as the alpha-zero keyframe endpoint
- [x] Interior nav scroll-aware visibility: hidden on initial load for case study, writing archive, and side-projects pages; auto-reveals when user scrolls up. Writing detail pages start hidden during a hero-transition arrival, auto-reveal when the transition lands, then follow scroll rules. About page always visible.
