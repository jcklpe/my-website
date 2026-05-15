# WCAG + SEO

## Intent

Verify the site meets WCAG 2.1 AA accessibility standards and has solid basic SEO. Lighthouse performance is already at 97 via static CDN deploy — this spike covers the non-performance dimensions.

## WCAG

- Run automated WCAG audit (axe DevTools, Lighthouse accessibility tab, or pa11y)
- Use impeccable.style skills review as a complementary pass — catches design-level contrast, spacing, and legibility issues alongside automated tooling
- Address any failures at AA level
- Key areas to check:
  - Color contrast — electric blue on various backgrounds, ink on off-white
  - Focus indicators — visible keyboard focus on all interactive elements
  - Image alt text — coverage across cards, heroes, block images
  - Keyboard navigation — full site navigable without mouse
  - Screen reader landmark structure — header, main, nav, footer
  - Mega Gallery keyboard and screen reader behavior (noted as needing improvement)

## SEO

- Verify title tags and meta descriptions are set correctly per route (check `useSeoMeta` calls)
- Verify canonical URLs — especially important for static deploy where the CDN URL is canonical
- Verify Open Graph / social sharing meta (og:title, og:description, og:image)
- Verify sitemap — static generate should produce one; confirm it is being deployed and is correct
- Structured data / schema.org — nice-to-have, not a blocker; Article schema for writing posts is worth considering

## Notes

- Lighthouse performance: 97 (done)
- Canonical Medium cross-post links are covered in `docs/scratch/writing-section.md`
- IndieWeb and ActivityPub are separate spikes
