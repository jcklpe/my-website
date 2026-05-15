# Copy Cleanup

## Intent

Remove or replace LLM-generated and early-scaffolding placeholder copy throughout the site. Much of the current visible text was written as filler and should not ship to real visitors.

## Known instances

- Writing index: "Date-driven notes, essays, and updates" — remove or replace
- Case Studies / homepage: "Evergreen work, research, and project documentation" — remove or replace
- Writing index: "File Under" label — remove
- Writing index page heading/description — review for placeholder tone
- Any error/empty-state placeholder text that reads as boilerplate
- Employer Testimonials section: fallback placeholder quotes — acceptable temporarily, block on real quotes
- Side projects page: empty-state holding message — will be replaced by the side-projects-page spike
- About page hardcoded copy — will be replaced by the about-page spike

## Approach

- Some copy should simply be deleted (no replacement needed)
- Some copy needs real authored text from the site owner
- CMS-backed copy should be updated in WordPress directly
- Vue component fallback text should be updated in the component when WordPress copy is live

## Rough work items

- Audit all visible frontend routes for placeholder language
- Remove or replace each instance, coordinating with about-page and side-projects-page spikes
- Update Vue component fallback strings where the copy is hardcoded
- Update any CMS-backed fields in WordPress
