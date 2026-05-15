# Homepage Refinement

## Intent

The homepage is the primary browsing and first-impression surface. The first pass is wired and live. This spike covers the next round of refinement: typography and visual rhythm, content model decisions for section control, and replacing placeholder copy once real content exists.

## Visual and Layout Refinement

- Refine the hero section typography and rhythm — type scale, spacing, and the interplay between the BLUF headline, subtext, and vital-info
- Refine vital info / quick links layout and link styling
- Audit homepage section spacing — ensure vertical rhythm holds across viewport sizes, including between Selected Work, Employer Testimonials, Side Projects link section, and Latest Writing

## Content Model

The current ACF front-page field set is functional but minimal. As the homepage grows, decide:

- Section headings and optional intros — whether each homepage section (Testimonials, Side Projects link, etc.) should have an ACF-backed heading or intro field, or whether headings are hardcoded in the Vue component
- Section visibility controls — whether any sections should be conditionally shown/hidden via an ACF toggle, or if hiding is always done by omitting content
- Footer links capacity — if the current ACF footer links repeater becomes too limited (too few rows, no descriptions, no grouping), decide whether to expand the field set or move footer content elsewhere

These are editorial design decisions, not just engineering. They should be made with actual content in mind, not speculatively.

## Copy Replacement

- Replace placeholder Employer Testimonials copy with real employer quotes once content exists
- This is a content task, not an engineering task; blocked on having real quotes

## Notes

- Copy cleanup for LLM placeholder text throughout the site is a separate spike: `docs/scratch/copy-cleanup.md`
- The homepage has no global SiteNav bar by design
- Homepage section anchors (`#selected-work`, `#latest-writing`) are already in place
