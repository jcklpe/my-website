# Performance and Optimization Scratch Spike
Conceptual performance and optimization material that is not yet ready for an active implementation spike.

## Goal
Investigate practical ways to improve perceived and measured performance across the site, using the McMaster-Carr article as a source of lessons rather than as a prescription to copy its implementation.

## Current Context
Reference: https://dev.to/svsharma/the-surprising-tech-behind-mcmaster-carrs-blazing-fast-website-speed-bfc

The site already has important performance choices in place: static generation and CDN delivery, responsive media handling, lazy loading, prefetching, bounded deploy concurrency, and a Lighthouse score of 97. This scratch spike is for identifying the next useful optimization questions without assuming that every technique from the reference applies to this Nuxt and WordPress architecture.

## Scope
- Own measured runtime and delivery performance, including the warmed-production performance pass previously parked in WCAG/SEO pass 2. Accessibility and search/share correctness history lives in `docs/archive/wcag-seo2.md`; its durable guarantees live in `AGENTS.md`.
- Fast first render and perceived loading.
- Static output, CDN delivery, caching, and media payloads.
- Nuxt hydration and client-side JavaScript cost.
- Animation, canvas, WebGL, and route-transition frame budgets.
- Measurement before and after changes on representative desktop and phone surfaces.

## Constraints
- Share representative routes and build provenance with the accessibility audit, but keep performance findings and fixes here; a performance score does not establish accessibility or SEO quality.
- Preserve the headless WordPress plus Nuxt architecture and the explicit static publishing path.
- Do not trade away editorial quality, interaction character, accessibility, or transition behavior for synthetic benchmark gains.
- Prefer measured bottlenecks and small reversible experiments over broad tooling changes.
- Keep public and QA content boundaries intact during performance testing.
- After any performance change, rerun a small accessibility and transition smoke set on representative routes: 320px reflow and text spacing, reduced-motion initial/change behavior, first-focus bypass, lightbox naming/focus restoration, and both directions of the affected card-to-detail transition. A faster result does not justify regressing these guarantees.

## Open Questions
- Which remaining costs matter most on a real phone after static CDN delivery: media transfer, hydration, animation, or route-transition work?
- Where do the McMaster-Carr techniques map cleanly to this site's static-generated architecture, and where do they not?
- Which measurements should become the baseline for future performance work?
- Does this scratch material gain enough scope and urgency to promote into the two-document active spike pattern?

## Rough Work Items
- Read the reference article and extract principles that are relevant to this site's delivery model.
- Establish a small repeatable baseline across representative static routes and phone/desktop conditions.
- Inspect generated media sizes, preload/lazy-loading choices, hydration payloads, and client-only animation costs.
- Record optimizations that are worth testing and explicitly discard techniques that do not justify their complexity.

## Human QA Surfaces
- Homepage first load and scroll on a real phone.
- Writing and case-study detail routes from static CDN output.
- Card-to-detail and reverse featured-media transitions under cold and warm cache conditions.
- Motion-heavy homepage and article surfaces with reduced motion enabled and disabled.
