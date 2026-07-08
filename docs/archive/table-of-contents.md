# Table of Contents (Article Outline) Spike

## Goal

Add an article outline / table-of-contents affordance to long writing posts and
case studies. It should make longer pieces easier to orient in without turning
the page into a documentation site.

The working model:

- Lists the article's meaningful headings in source order.
- Highlights the currently-visible section as the user scrolls.
- Clicking a TOC item scrolls to that heading and updates the URL hash.
- Starts visible on large screens, then quietly collapses after the reader is
  underway.
- Can be manually reopened by the reader.
- Stays out of the way on phone/tablet until we deliberately design the small
  screen behavior.

This is an article apparatus feature: closer in spirit to footnotes/sidenotes
than to global navigation.

## Final Outcome

The spike shipped a progressive article TOC for long writing posts and case
studies.

- `ArticleToc.vue` renders a Blue Atlas article-apparatus outline.
- `useArticleToc.ts` scans rendered `h2` through `h6` headings, generates
  missing IDs, tracks the active section, and scrolls with hash updates.
- `BlockRenderer` exposes an apparatus slot inside `.content-flow` so the TOC
  lives on the article ground instead of in a separate shell.
- Desktop uses a left rail that starts open, auto-collapses after the reader is
  underway, and respects manual reopen.
- Phone/tablet uses an in-flow collapsed Contents block aligned with the
  paragraph column.
- Short posts suppress the TOC.
- Authored content paints above the TOC. Blocks that cross the TOC lane use
  cream backgrounds or underlap mattes to quiet the overlap.

Human QA confirmed writing/case-study behavior, manual reopen, short-post
suppression, mobile placement/clickability, and the underlap-matte approach.

## Reference Point: Maggie Appleton

Reference repository:
`https://github.com/MaggieAppleton/maggieappleton.com-V3`

Relevant file inspected:
`src/components/layouts/TableOfContents.astro`

Useful behavior from that implementation:

- Desktop TOC starts expanded and sticky in the left rail.
- A compact header toggles collapsed/open state.
- When the rail reaches its sticky top position during normal scrolling, it
  auto-collapses once.
- Manual interaction clears the auto-collapse state so the reader can reopen it.
- TOC links smooth-scroll to headings and push the hash into history.
- Mobile uses a separate collapsed contents block instead of the desktop sticky
  rail.

Useful taste lesson:

- The behavior is helpful because it gives orientation at the beginning, then
  gets out of the way. It is not just "sticky nav forever."

Differences for this site:

- Maggie's visual language is soft and botanical; ours should be Blue Atlas:
  mono/sans, ink/cream, signal blue accents, quiet but more structural.
- This site's right margin already belongs to footnotes/sidenotes. The TOC
  should live on the left side and avoid competing with sidenotes.
- We should preserve the existing local `SiteNav` behavior and not create a
  second global nav.

## Layout Considerations

The article content currently occupies a centred column (`--article-column`, now 76ch). A TOC rail would sit to the left of that column, in the negative space between the column left edge and the viewport edge.

The layout approach:

- The article body uses `.content-flow`, which currently defines content, wide,
  and full tracks. It does not define a left TOC rail.
- The TOC can either be integrated through a new outer article apparatus shell
  or positioned independently from measured content-column geometry.
- The rail should appear only when there is genuinely enough space. A cramped
  rail is worse than no rail.

Possible layout options:

1. **Outer article apparatus shell**  
   Wrap the article body and TOC in a grid that has `toc | content | margin`
   zones. The TOC sits in the left zone; `.content-flow` remains responsible for
   block alignment inside the content zone.

2. **Measured sticky rail**  
   Render the TOC as a sibling of `.content-flow`, then position it with CSS
   custom properties or JS measurements based on the content column's left edge.
   This avoids reshaping the article grid but adds measurement complexity.

3. **Inside `.content-flow` as a wide/full child**  
   Least attractive: the current grid has no left-only rail track, so this would
   either fight existing content-flow logic or require changing the global
   article grid for a component that should be optional.

Implemented direction: `BlockRenderer` exposes an article-apparatus slot inside
`.content-flow`. `ArticleToc` renders into that slot as a low-priority absolute
rail while the actual Gutenberg blocks remain normal `.content-flow` children.
This keeps content/wide/full alignment in one place and avoids a separate
measured shell that would need to mirror the article grid.

The breakpoint at which the rail appears needs measurement. The current article
layout uses `--article-frame` and `--article-column`; the TOC likely needs at
least 12-16rem of usable left-side room.

### Interaction With Wide, Full, Floated, And Layout Blocks

The TOC tracks headings (`h2` through `h6`) in document order. The harder design
problem is not outline extraction; it is how the left-rail apparatus behaves
when authored content occupies or crosses the same left-side space.

Settled working model:

- Authored content has priority over the TOC.
- The TOC is a low-priority layer: it should feel printed on the page ground.
- Wide/full media, columns, media/text, galleries, and left-floated media may
  visually pass over the TOC lane.
- The TOC should not try to dodge every possible block with a collision system.
- When content overlaps the TOC lane, the TOC can pass underneath or be obscured.
  That is preferable to the TOC overlaying media or pushing authored layout
  blocks around.
- Hidden/covered TOC links do not need to remain clickable. The TOC is an
  enhancement, not essential navigation.

This implies the rail should use a lower z-index than authored media/layout
objects and avoid opaque card/window surfaces.

However, overlapped areas still need to feel intentional. Wide, full, floated,
and other media/layout blocks that cross the TOC lane may need neutral paper
ground, matting, or breathing-room treatment so the page does not read as noisy
layers of text, outline, borders, and imagery all competing at once. The target
feeling is "article object over quiet paper apparatus," not accidental visual
clutter.

### Underlap Matte Pattern

When a block can cross the TOC lane, it may need an **underlap matte**: a visual
cream quiet zone that paints above the TOC but does not change the block's
layout footprint. This is implemented with the shared Sass mixin
`underlap-matte($size: 25px)` in `packages/styles/_mixins.scss`.

Use it for authored objects where TOC text showing behind the object would make
the composition noisy: Mega Gallery, wide/full media/text, columns, code,
tables, videos/embeds, file downloads, details, and accordions. Code blocks use
the same 25px matte idea through a spread shadow so their CRT pseudo-elements
remain available.

Transparent content areas should use a real cream background instead of only a
matte. Media/Text copy, Columns, and Audio are examples: their interiors need to
block the underlapping TOC, not merely their perimeter.

## Technical approach

### 1. Extract Headings From Rendered Block Content

The article body is rendered from structured Gutenberg blocks through
`BlockRenderer`, not as one giant post HTML blob. Headings are actual DOM nodes
after render. Options:

- **Post-render DOM scan**: In `onMounted`, query `h2` and `h3` inside the
  article content element and build the TOC list from IDs and text content.
- **Server-side extraction**: Parse the heading structure from the rendered HTML string before it hits the DOM (can use a regex or a lightweight HTML parser). This is more SSR-friendly.
- **WordPress GraphQL field**: Add a custom GraphQL field that returns the heading structure (title, level, anchor) as structured data. Cleanest API, slightly more work.

Recommendation: DOM scan on mount for the first pass. It is the smallest, least
schema-heavy path, and the TOC is navigational enhancement rather than primary
content.

Heading levels:

- Track `h2` through `h6`.
- Style deep levels conservatively so h5/h6 do not make the rail noisy. Depth
  should read through indentation, small type shifts, and active state rather
  than through a big typographic hierarchy.
- Suppress the TOC for short pieces, probably fewer than 3 headings.

Heading IDs:

- Use existing heading IDs if present.
- If a rendered heading lacks an ID, generate a stable client-side slug from
  text and de-dupe within the article.

### 2. `useToc` composable

```ts
interface TocHeading { id: string; text: string; level: 2 | 3 | 4 | 5 | 6; }
const headings = ref<TocHeading[]>([]);
const activeId = ref<string | null>(null);
```

- Scans the article element for headings on mount.
- Uses an `IntersectionObserver` (with a top-biased rootMargin) to track which heading is currently in view and updates `activeId`.
- Provides `scrollTo(id)` that scrolls to the heading and updates the URL hash.
- Tracks whether the TOC has auto-collapsed and whether the user manually
  reopened it.
- Respects `prefers-reduced-motion` by avoiding smooth scroll when reduced
  motion is requested.

### 3. `<ArticleToc>` component

- Renders a `<nav aria-label="Article outline">`.
- Uses normal anchor links (`href="#heading-id"`) for baseline behavior.
- Active item is highlighted with signal blue, probably plus a small rule/dot.
- Sticky position on large screens.
- Has a compact header that can collapse/expand the list.
- Starts expanded, then auto-collapses after the reader scrolls far enough that
  the rail reaches its sticky state or after a small scroll threshold.
- Manual reopening should be respected. Do not immediately auto-collapse again
  after the user intentionally opens it.

Visual direction:

- Small mono/sans label: "Contents" or "Outline" rather than a large title.
- Ink/cream structure, signal-blue active dot/rule.
- No floating card unless it needs a surface for legibility.
- Should feel like marginalia / reading apparatus, not app chrome.

### 4. Layout integration

Both `writing/[slug].vue` and `case-studies/[slug].vue` need the TOC rail. Options:
- Add a shared layout wrapper (a new `article-with-toc` layout, or extend `default.vue`).
- Add the TOC component inside each detail page, in a left-column grid slot.

Start by integrating directly in `writing/[slug].vue` and
`case-studies/[slug].vue`. If duplication becomes awkward, extract a small
article apparatus component after the behavior is proven.

### 5. Small-Screen Behavior

Use a mobile/tablet version similar in spirit to Maggie Appleton's mobile TOC:

- Inline collapsed "Contents" block near the top of the article, after the hero
  / header and before body copy.
- Default collapsed.
- Expands on tap, closes after link selection.
- Not fixed or floating.
- No persistent mobile rail.

This avoids adding a third persistent control surface alongside local nav and
mobile footnote interactions.

## Files to look at

- `apps/frontend/pages/writing/[slug].vue` — content layout grid
- `apps/frontend/pages/case-studies/[slug].vue` — content layout grid
- `apps/frontend/components/content/` — where a new `ArticleToc.vue` would live
- `packages/styles/shared-components/` — for any shared TOC styles
- `packages/styles/context-role/_vue-frontend.scss` — `.content-flow` grid and
  global article shell mechanics
- Maggie reference:
  `https://github.com/MaggieAppleton/maggieappleton.com-V3/blob/main/src/components/layouts/TableOfContents.astro`

## Open questions

- Label: "Contents", "Outline", or something more site-specific?
- Exact collapse trigger: sticky-top contact, scroll distance, active section
  after first h2, or elapsed scroll direction?
- Should user-opened state persist only until page unload, or across route
  navigations via session state?
- Should the rail auto-expand again when the user scrolls back near the top?
- Do case studies and writing posts get the same visual treatment, or should
  case studies suppress TOC unless they have enough headings?
- Which block surfaces need additional neutral ground/matting once the TOC rail
  exists underneath them?
