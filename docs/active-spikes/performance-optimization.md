# Performance and Optimization
Promoted 2026-09-13. On 2026-09-14 the user authorized a bounded implementation experiment: treatment-aware destination-image warming and static payload preparation, with unchanged animation and before/after verification. Compare baking once then resizing using disposable image artifacts before changing the production treatment pipeline. CMS content edits and deployment are not included.

Continues from: docs/archive/wcag-seo2.md
Continues from: docs/archive/animation.md

## Audit Decision Rules
The user's clarification after the initial audit is controlling: performance means the website feels snappy, solid, silky smooth, and visually compelling. Animation is load-bearing branding, not optional overhead. Do not remove effects, shorten the roughly 600ms authored media transition, or reduce visual quality merely to improve a metric. That transition is useful presentation and an opportunity to prepare the destination while maintaining visual continuity. Reduced-motion measurements are diagnostic controls and accessibility behavior, not a proposed default experience.

Bytes, CPU, RAM, and GPU use are explanatory measurements, not independent success criteria. Extra prefetching can be a good optimization if it makes the next interaction seamless. Smaller downloads or less idle work count as visitor-performance wins only when they improve readiness, responsiveness, or smoothness without compromising the design. Compare current behavior as a legitimate contender; do not assume less speculative loading is better.

The primary target is the generated static site as delivered through the CDN, including its hydrated client-side interactions. SSR is the development/design-preview workflow and a secondary optimization target. The existing local static artifact audit chose the right rendering mode, but its local media origin and cache behavior do not establish production interaction performance.

Measure candidate costs before recommending repairs. Record scope, evidence, confidence, expected benefit, readability cost, regression exposure, and dependence on future content changes. Micro-optimizations are eligible when their cumulative effect is measurable and worth their cognitive cost. A finding that no change is worthwhile is a valid outcome. Preserve designer-readable Vue, explicit data flow, and the existing block model.

Prioritize reusable delivery/runtime findings before the human-led content audit; postpone optimizations tied to individual articles likely to change. Future content/styling changes should rerun a small baseline rather than treating today's numbers as permanent budgets. Historical Lighthouse scores below are context, not the current baseline.

Record each completed audit batch and its next step in the companion todo document so an interrupted session can resume without rediscovery.

## Goal
Make the art-directed static website feel immediate and composed under real navigation, scrolling, and media interaction. Use McMaster-Carr as a north star for dependable perceived speed, not for stripped-down visual style or minimal resource consumption.

## Experience-First Audit
Image-variant count is a design/delivery tradeoff, not a target to minimize blindly. Distinguish original versus baked visual treatment, stored responsive resolutions, and distinct assets actually downloaded during one journey. Shared card/clone/detail image reuse is desirable where it preserves sharpness and texture. A single large asset may avoid a later request but delay first display; a single smaller asset may blur the hero. Preserve CMS originals and useful responsive options until a measured, visually equivalent replacement is chosen. Source-rendered halftones can differ in apparent dot density across sizes, so consolidation requires texture comparison as well as transfer/readiness measurements.

Measure click/tap-to-first-visible-response separately from intentional animation duration. Track whether destination content and a sufficiently sharp decoded image are ready at the reveal, whether frames stall during the transition or scroll, and whether back navigation restores the expected composition and position. Include direct entry, immediate taps without hover, deliberate hover/focus, and repeat navigation under cold and warm caches. Test normal motion as the primary experience; preserve reduced-motion correctness separately. Do not stretch the transition to hide a newly introduced delay.

Compare current prefetch behavior against alternatives only with that experience evidence. A large image request is a lead: it may buy useful readiness, compete with the current hero, or arrive too late to help. The first inventory did not determine which. Prefetch timing, request priority, cache reuse, and image decode readiness deserve investigation before reducing coverage.

## McMaster-Carr Lessons And Evidence Boundary
The [live catalog](https://www.mcmaster.com/) exposes search and extensive category/product navigation directly. Its usefulness as the user's speed reference is not a mandate to copy its aesthetics. Public-source inspection confirms early resource hints and inline styles; an automated browser reports a service-worker controller, but its cache policy was not established. A login gate prevented a successful automated category-navigation comparison. Wes Bos's historical first-hand walkthrough supplies additional client-side observations; derivative articles remain idea sources, not backend evidence. Detailed observations and limits live in the companion todo doc.

Transferable hypotheses for our site: prepare likely next destinations before the visitor asks; retain useful loaded state on return; make feedback immediate; and use build-time preparation/CDN delivery so interaction time is spent on presentation rather than avoidable preparation. Browser guidance supports the underlying tradeoff: [prefetching can improve future navigation by spending extra bytes in advance](https://web.dev/articles/link-prefetch), while [rendering performance depends on completing frame work on time](https://web.dev/articles/rendering-performance). These are general mechanisms, not claims about McMaster-Carr's implementation. Our equivalent should keep the visual richness and make it feel equally dependable.

## Current Context
Reference: https://dev.to/svsharma/the-surprising-tech-behind-mcmaster-carrs-blazing-fast-website-speed-bfc

The site already has important performance choices in place: static generation and CDN delivery, responsive media handling, lazy loading, prefetching, bounded deploy concurrency, and a historical Lighthouse score of 97. The active audit identifies the next useful optimization questions without assuming that every technique from the reference applies to this Nuxt and WordPress architecture. The article is secondary inspiration, not verified evidence of another site's implementation or a mandate to add its infrastructure.

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
- Which small experiments should be authorized after reviewing the initial audit?

## Rough Work Items
- Read the reference article and extract principles that are relevant to this site's delivery model.
- Establish a small repeatable baseline across representative static routes and phone/desktop conditions.
- Inspect generated media sizes, preload/lazy-loading choices, hydration payloads, and client-only animation costs.
- Record optimizations that are worth testing and explicitly discard techniques that do not justify their complexity.

## Optional Future Validation Surfaces
These are coverage possibilities, not a required human testing queue. The initial audit uses agent-run browser diagnostics. Real-device feel and field performance remain unmeasured unless separately pursued.

- Homepage first load and scroll on a real phone.
- Writing and case-study detail routes from static CDN output.
- Card-to-detail and reverse featured-media transitions under cold and warm cache conditions.
- Motion-heavy homepage and article surfaces with reduced motion enabled and disabled.
