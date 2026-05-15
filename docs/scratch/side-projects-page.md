# Side Projects Page

## Intent

The Side Projects page is not a collection of a custom post type. It is a single manually-authored page with sections — closer to an article or landing page that the site owner updates periodically with pictures, links, and descriptive copy. No CPT, no archive, no filtering.

## Key constraints

- Frontend route exists at `/side-projects`; currently a minimal scaffold with an empty-state holding message
- The homepage has a Side Projects link section that already links to this page
- Content is editorial, not queryable or filterable
- `SiteNav` on this page shows Home only (per existing nav model)

## Open questions

- WordPress Page with ACF structured sections, or pure Gutenberg body?
- Does it need a featured image or hero, or does it open directly into sections?
- Should it share the `content-flow` article shell layout with writing/case-study detail pages?

## Rough work items

- Decide the CMS model (Page + ACF vs. pure Gutenberg body)
- Author initial Side Projects content in WordPress
- Rewrite `pages/side-projects/index.vue` to fetch from WordPress
- Apply appropriate layout (article shell or bespoke)
