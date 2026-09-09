# WCAG + SEO Pass 2
Promoted 2026-09-09: final accessibility and search/share correctness audit of the settled design, using an identified production artifact. Preserve the historical intake below; it is context rather than evidence of current compliance.

Continues from: docs/archive/wcag-seo1.md

## Active Scope And Completion Boundary
Audit representative Home, Writing archive, writing detail, case-study detail/loop, About, Now, and Side Projects routes. Include long-form QA fixtures for complex blocks without publishing those fixtures. Record route, build/release, browser/device, reproduction steps, severity, and retest evidence for each finding. Automated scores supplement manual review; they do not establish WCAG compliance.

Own keyboard access, focus restoration, screen-reader semantics, zoom/reflow, contrast, reduced-motion and animation accessibility, lightbox/media controls, descriptive names, heading order, language, alt-text plumbing, canonicals, robots, sitemap, structured data, and social metadata. Editorial quality of future content remains the author's responsibility; test the system with realistic content and document authoring requirements.

Runtime speed, media transfer budgets, GPU allocation, hydration, and frame pacing belong to the separate performance spike. The case-study strobing defect remains owned by animation; this audit verifies the eventual motion safety result, not a duplicate implementation task. Do not deploy, change indexing, or alter CMS content merely to run an audit.

Complete when agreed high-impact defects are fixed and retested, lower-priority exceptions have explicit dispositions, and a repeatable production regression checklist is recorded. No redesign or speculative structured-data expansion without an observed need.

Do not mix this with the already-completed practical baseline pass unless the user explicitly promotes it. Pass-1 history lives at `docs/archive/wcag-seo1.md` and `docs/archive/wcag-seo1.todo.md`; durable accessibility and SEO rules live in `AGENTS.md` and `docs/visual-design.md`.

Possible future scope:

- deeper qualitative legibility review after one or more generative design branches exist
- design-theory/accessibility critique beyond mechanical WCAG checks
- richer structured data or social sharing polish
- automated axe/pa11y tooling if pass 1 reveals enough repeated issues to justify it
- production-launch SEO checks that depend on the final domain and provider configuration
- a warmed-production accessibility pass against the stable Bunny release, routed here from production-deploy rather than duplicated as a launch blocker; runtime and delivery performance measurement now belongs to `docs/scratch/performance-optimization.md`
- impeccable.styles skills check

## Lighthouse Parking Lot — 2026-06-18 Local Dev Run
Scope clarification, 2026-09-07: preserve the report below as historical context. Future payload, image-delivery, hydration, loading-speed, and animation-cost investigations belong to the performance draft. This spike owns accessibility, keyboard/screen-reader behavior, legibility, reduced-motion usability, semantic structure, and search/social metadata correctness. Both audits may use the same production build and routes without duplicating findings or implementation tasks.
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
