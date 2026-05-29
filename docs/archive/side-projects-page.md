# Side Projects Page

## Intent

The Side Projects page is not a collection of a custom post type. It is a single manually-authored page with sections — closer to an article or landing page that the site owner updates periodically with pictures, links, and descriptive copy. No CPT, no archive, no filtering.

## Settled Decisions

**CMS model: WordPress Page with Gutenberg body content.**
The page is editorial, not structured data. A pure Gutenberg body is the right surface — it gives the author full layout flexibility (images, columns, links, code blocks, etc.) without bespoke ACF schema. The `seo_description` ACF field (already registered on all Pages via `group_my_website_page_seo`) covers the one structured metadata need.

**Layout: `content-flow` article shell.**
The side projects page shares the same `.content-flow` CSS named grid layout used by writing and case-study detail pages. This is the sensible default for any long-form WordPress Page — no bespoke layout needed. The section heading is inlined markup in the Vue page component, not a shared component.

**No hero / featured image at this stage.**
The page opens directly into the section heading and then the block-rendered body. A featured image or hero treatment can be added in a gendes branch if a design direction calls for it.

**No CPT, no archive, no filtering.**
There is intentionally no `/side-projects/:slug` route and no `side_project` post type. Side projects are authored as a single living document.

## Key Constraints

- Frontend route exists at `/side-projects`; currently a minimal scaffold with an `EmptyState` holding message
- The homepage has a Side Projects link section that already links to this page
- `SiteNav` on this page shows Home only (per existing nav model)
- `queryWordPressPageByUri(uri)` in `useWordPress.ts` is the right fetch function — it already handles Page-by-URI queries, block data, and normalization
- The ACF `seo_description` field is already wired on all WordPress Pages; `queryPageSeoDescription(uri)` fetches it

## Relationship to Other Spikes

- About page spike is converting a similar frontend-standalone page to CMS-backed; this spike follows the same pattern
- Gendes design agents will author the visual treatment on top of whatever structure this spike puts in place; keep markup and styles readable and straightforward
