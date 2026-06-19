# WCAG + SEO Pass 2

Draft parking lot for a later qualitative accessibility, legibility, and design-readiness pass.

Do not mix this with the already-completed practical baseline pass unless the user explicitly promotes it. Pass-1 history lives at `docs/archive/wcag-seo1.md` and `docs/archive/wcag-seo1.todo.md`; durable accessibility and SEO rules live in `AGENTS.md` and `docs/visual-design.md`.

Possible future scope:

- deeper qualitative legibility review after one or more generative design branches exist
- design-theory/accessibility critique beyond mechanical WCAG checks
- richer structured data or social sharing polish
- automated axe/pa11y tooling if pass 1 reveals enough repeated issues to justify it
- production-launch SEO checks that depend on the final domain and provider configuration
- impeccable.styles skills check

## Lighthouse Parking Lot — 2026-06-18 Local Dev Run

Report: `/Users/aslan/Downloads/download.pdf`

Captured June 18, 2026 at 2:54 PM CDT against `http://my-website.localhost/#selected-work` using Lighthouse 13.2.0, emulated desktop.

Scores:

- Performance: 77
- Accessibility: 100
- Best Practices: 100
- SEO: 100

Interpretation:

- This run was against the local Nuxt/Vite dev surface, not generated static output or CDN preview. It includes Vite client/module requests (`@vite/client`, `.vue?type=...`), source maps, no compression, no useful cache headers, and local CMS media. Do not compare this directly to the previous static-preview performance score of 97.
- Lighthouse also reported "Clearing the browser cache timed out," so rerun before treating the number as a baseline.
- The route-transition code appears in the dev module list, but the main score drop is unlikely to be caused by transition animation itself; Lighthouse is measuring the initial page load, not an active card-to-detail transition.
- Real follow-up signal: image delivery. Lighthouse estimated about 9.5 MiB of image savings, especially large PNGs used by case-study card/K-layer media (`img.card-k-image`) and oversized uploaded PNG variants.
- Production-relevant follow-up should be a warmed Lighthouse run against generated/static preview or Bunny preview, then a separate image-delivery pass: responsive image sizes for K layers, modern formats/compression, cache headers, and CDN behavior.
