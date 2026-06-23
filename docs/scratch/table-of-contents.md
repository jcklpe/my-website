# Table of Contents (Article Outline) Spike

## Goal

A persistent left-rail outline on article pages (case studies, writing posts) that:
- Lists the article's headings (h2–h4, configurable) in hierarchical order.
- Highlights the currently-visible section as the user scrolls.
- Clicking a TOC item scrolls smoothly to that heading.
- Collapses or hides on narrow viewports (phone, tablet) — possibly an expandable drawer.

## Layout considerations

The article content currently occupies a centred column (`--article-column`, now 76ch). A TOC rail would sit to the left of that column, in the negative space between the column left edge and the viewport edge.

The layout approach:
- The article page's content grid already has named columns (see `apps/frontend/pages/writing/[slug].vue` and `apps/frontend/pages/case-studies/[slug].vue`). The TOC component would be `position: sticky; top: var(--nav-height)` in a grid column to the left of the content.
- On narrower viewports where there isn't enough room for a rail (roughly < 1200px), the TOC either hides or becomes a collapsible drawer anchored to the top/side of the screen.

The breakpoint at which the rail appears needs measurement. The current article layout uses `--article-frame: min(calc(100% - var(--space-6)), 72rem)` as the outer frame. The TOC rail needs at least `14–18rem` of room to the left of the `76ch` content column within that frame.

## Technical approach

### 1. Extract headings from rendered block content

The article body is rendered from WordPress block HTML via `v-html`. The headings are in the DOM after render. Options:
- **Post-render DOM scan**: In `onMounted`, query all `h2, h3, h4` inside the article content element and build the TOC tree from their `id` attributes and text content. WordPress adds `id` attributes to headings automatically.
- **Server-side extraction**: Parse the heading structure from the rendered HTML string before it hits the DOM (can use a regex or a lightweight HTML parser). This is more SSR-friendly.
- **WordPress GraphQL field**: Add a custom GraphQL field that returns the heading structure (title, level, anchor) as structured data. Cleanest API, slightly more work.

Recommendation: DOM scan on mount (simplest, sufficient for CSR; if SSR TOC is needed, add the GraphQL field later).

### 2. `useToc` composable

```ts
interface TocHeading { id: string; text: string; level: 2 | 3 | 4; }
const headings = ref<TocHeading[]>([]);
const activeId = ref<string | null>(null);
```

- Scans the article element for headings on mount.
- Uses an `IntersectionObserver` (with a top-biased rootMargin) to track which heading is currently in view and updates `activeId`.
- Provides `scrollTo(id)` that calls `element.scrollIntoView({ behavior: 'smooth', block: 'start' })`.

### 3. `<ArticleToc>` component

- Renders a `<nav aria-label="Article outline">` with a nested list of `<a href="#id">` links.
- Active item highlighted with `color: var(--color-primary)` or a left-border accent.
- `position: sticky; top: calc(var(--nav-height) + var(--space-5))`.
- Hierarchy: h2 at root, h3 indented `1rem`, h4 indented `2rem`.
- On phone/tablet: hidden by default, with a floating "Contents" toggle button that opens a slide-in drawer or dropdown.

### 4. Layout integration

Both `writing/[slug].vue` and `case-studies/[slug].vue` need the TOC rail. Options:
- Add a shared layout wrapper (a new `article-with-toc` layout, or extend `default.vue`).
- Add the TOC component inside each detail page, in a left-column grid slot.

The article page templates currently have a content grid. Adding a `toc` column left of the content column, visible only when the viewport is wide enough, is the cleanest approach. Use `@container` or a media query to show/hide the rail column.

### 5. Progressive disclosure on mobile

On mobile, a small floating "§" or "Contents" button (bottom-left or top-right, respecting the existing nav z-index) opens a sheet/drawer. The drawer lists all headings. Tapping one scrolls to the section and closes the drawer.

## Visual design

The rail should feel quiet — muted type, no border, just left-padding and a thin active-indicator accent. The design system's `--type-small` + `--color-muted` is a good starting point, with `--color-primary` for the active state. The rail should not fight with the article content for attention.

## Files to look at

- `apps/frontend/pages/writing/[slug].vue` — content layout grid
- `apps/frontend/pages/case-studies/[slug].vue` — content layout grid
- `apps/frontend/components/content/` — where a new `ArticleToc.vue` would live
- `packages/styles/shared-components/` — for any shared TOC styles

## Open questions

- Should the TOC appear on both writing posts AND case studies, or only one?
- What heading levels to include? h2 + h3 only, or also h4?
- If the article is short (< 3 headings), should the TOC be suppressed?
- Should the TOC state (open/closed drawer) persist across page navigations via `sessionStorage`?
- Does the site use anchor links in shared URLs, and if so, should the TOC's `scrollTo` push a hash to the URL?
