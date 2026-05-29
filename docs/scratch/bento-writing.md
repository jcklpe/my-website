# Latest Writing — Bento Grid Layout

## Status

Open spike stub. The card styling (window-chrome, `border-window`, hard shadow, lift on hover) is done. This spike is about the layout algorithm: replacing the current uniform auto-fit grid with a bento-style layout where cards have varied sizes and the section reads as a composed surface rather than a row of identical tiles.

## Background

The homepage Latest Writing section (`apps/frontend/components/home/HomeLatestWritingSection.vue`) currently renders posts through `PostList.vue`, which uses an `auto-fit` grid with `minmax(min(100%, 14rem), 1fr)` — uniform columns, all cards the same height. It's functional and consistent but doesn't leverage the visual vocabulary of the Blue Atlas direction, where different sections earn different surface treatments.

A bento layout would:

- Make the first post (most recent) a featured card — wider, taller, more visual weight
- Let subsequent cards fill the remaining space in a tighter grid
- Reinforce the "designed artifact" reading of the homepage: each section has its own compositional logic, not a shared generic grid
- Pair naturally with the card's existing window-chrome treatment, which already reads as a panel in a dashboard

The card-to-detail featured-media transition must keep working. The `data-transition-source`, `data-featured-slip-source`, and `FeaturedMediaFrame` mechanics on `PostCard.vue` must not be disturbed.

## Current state

- `HomeLatestWritingSection.vue` — section shell, `.section-label` heading card, deep overrides `padding-inline` on `.post-list`
- `apps/frontend/components/navigation/lists/PostList.vue` — `auto-fit` grid; renders one `PostCard` per list item
- `apps/frontend/components/navigation/cards/PostCard.vue` — the window-chrome card; has `border-window`, `shadow-hard-low`, lift on hover

The homepage fetches up to 5 posts for this section (verify the exact count in `apps/frontend/pages/index.vue`).

## Design questions to resolve before implementation

1. **How many posts?** The featured-first bento makes most sense with 4–6 items where 1 is featured and the rest fill a 2- or 3-column secondary row. If the count is fixed at 5, a clean layout is: 1 featured (full width or 2/3 width) + 4 in a 2×2 or 4-column strip.

2. **Does the featured card use a larger image?** `PostCard` already has `FeaturedMediaFrame` with `sizes="(max-width: 760px) 100vw, 34vw"`. The featured position would want a wider `sizes` hint.

3. **Grid or named areas?** CSS `grid-template-areas` is explicit and readable for a fixed count but brittle if the post count varies. A CSS grid with column spans is more resilient.

4. **Should PostList.vue grow to know about featured-first, or should HomeLatestWritingSection.vue handle the layout wrapping?** The cleanest separation is probably a new `BentoPostList.vue` (or `HomeBentoPostList.vue`) specifically for the homepage use case, leaving `PostList.vue` as the generic grid used elsewhere (writing archive, etc.).

5. **What happens at phone?** The bento layout should collapse to a single-column stack. The existing phone breakpoint in `HomeLatestWritingSection.vue` handles some of this already.

## Candidate approaches

### Approach A — CSS grid with named areas (explicit, fixed count)

Define `.bento-post-list` with `grid-template-areas` for a fixed N-card layout. First `li:first-child` gets `grid-area: featured`. Clean, readable, requires knowing post count at compile time. Falls back gracefully if count is less than expected (CSS grid handles missing items cleanly).

### Approach B — First child span via `:nth-child`

Keep the auto-fit base, add `.post-list li:first-child { grid-column: span 2; grid-row: span 2; }`. Simple to write, slightly fragile when the container width changes — the span may not behave as expected in the fluid range. Could be constrained to a `min-width` media query.

### Approach C — Subgrid or explicit track definitions

Define explicit column tracks (e.g., `3fr 2fr 2fr` or similar) and assign items to specific tracks. Most control over proportions but most brittle to post count variation.

**Recommendation**: Approach A with a dedicated `HomeBentoPostList.vue` is the clearest separation of concerns. It keeps `PostList.vue` generic, makes the homepage layout easy to read, and lets the featured card get a different `sizes` hint for the image.

## Key constraints

- Do not touch `PostCard.vue`'s transition mechanics (`data-transition-source`, `data-featured-slip-source`, `FeaturedMediaFrame`)
- The back-animation from writing detail → homepage card must still target the right card; the transition key is slug-based and position-independent, so layout changes should not affect it
- Reduced-motion: the bento layout itself has no motion; only the card hover and the transition use motion, both already handled
- The section is inside a `.content-flow` grid context on the homepage; the negative `margin-inline` on `.latest-writing-section` achieves the current full-bleed; keep this

## Files involved

- `apps/frontend/components/home/HomeLatestWritingSection.vue`
- `apps/frontend/components/navigation/lists/PostList.vue` (read-only unless adding a sibling)
- `apps/frontend/components/navigation/cards/PostCard.vue` (transition mechanics; do not change)
- Possibly a new `apps/frontend/components/navigation/lists/HomeBentoPostList.vue`
