# About Page

## Intent

Convert the About page from a Nuxt frontend standalone page with hardcoded copy into a CMS-managed WordPress page driven through GraphQL. The About page is more compositionally structured than a typical writing post — not purely linear Gutenberg body.

## Key constraints

- Main body content is Gutenberg blocks, but supporting structured data (employment history, skills, contact links, etc.) likely warrants ACF fields
- Keep the ACF field set minimal; lean toward Gutenberg body for narrative content
- The Gutenberg body editor should remain visible (unlike the home page where it is intentionally hidden)
- Frontend route exists at `/about`; currently renders hardcoded Vue copy
- About is currently linked from the homepage vital-info section and footer fallback links — those paths must continue to work

## Open questions

- What structured data fields does the About page actually need? (employment timeline, skills list, contact links, social links?)
- Should structured sections (experience, contact) use ACF fields or custom Gutenberg blocks?
- Does the page need a featured image / hero treatment, or does it open directly into content?
- Should it use the same `content-flow` article shell as writing/case-study detail pages, or a custom layout?

## Rough work items

- Audit current `pages/about.vue` for all hardcoded copy and structure
- Decide ACF field set for structured About data
- Register ACF fields in the bootstrap plugin and expose through GraphQL
- Rewrite `pages/about.vue` to fetch from WordPress
- Seed initial About content in the CMS
- Update `SiteNav` routing if About page title or nav behavior changes
