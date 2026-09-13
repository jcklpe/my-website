# WCAG + SEO Pass 2
Closed 2026-09-13 after completing the agent-executable accessibility and search/share audit, repairing confirmed defects, applying the user-approved USCIS and Side Projects image alternatives in WordPress, and recording durable regression rules. The user accepted the remaining manual, cross-browser, assistive-technology, and exhaustive production checks as “won't do” for this spike. This is a pragmatic good-enough closeout, not a formal claim of WCAG conformance.

Continues from: docs/archive/wcag-seo1.md
Continues from: docs/archive/animation.md
Continues in: docs/active-spikes/content-audit.md

## Active Scope And Completion Boundary
Audit representative Home, Writing archive, writing detail, case-study detail/loop, About, Now, and Side Projects routes. Include long-form QA fixtures for complex blocks without publishing those fixtures. Record route, build/release, browser/device, reproduction steps, severity, and retest evidence for each finding. Automated scores supplement manual review; they do not establish WCAG compliance.

Own keyboard access, focus restoration, screen-reader semantics, zoom/reflow, contrast, reduced-motion and animation accessibility, lightbox/media controls, descriptive names, heading order, language, alt-text plumbing, canonicals, robots, sitemap, structured data, and social metadata. Editorial review and repair of the current portfolio continues in the content-audit spike; this spike verifies that the system preserves accessible content and records the minimum authoring contract needed to prevent regressions.

Runtime speed, media transfer budgets, GPU allocation, hydration, and frame pacing belong to the separate performance spike. The post-archive case-study strobing/geometry regression was repaired here and accepted by the user on 2026-09-09; preserve that repair and the destination-first overlap model during accessibility changes. Do not deploy, change indexing, or alter CMS content merely to run an audit. Production status and publishing remain user-owned and do not gate local audit work.

Complete when agreed high-impact defects are fixed and retested, lower-priority exceptions have explicit dispositions, and a repeatable production regression checklist is recorded. No redesign or speculative structured-data expansion without an observed need.

This is the active second pass, not a reopening or replacement of the completed practical baseline. Pass-1 history lives at `docs/archive/wcag-seo1.md` and `docs/archive/wcag-seo1.todo.md`; durable accessibility and SEO rules live in `AGENTS.md` and `docs/visual-design.md`.

## Audit Standard And Evidence
Working target: applicable WCAG 2.2 Level A/AA criteria for the public frontend, with reduced-motion usability retained as an additional project requirement. Use the [W3C quick reference](https://www.w3.org/WAI/WCAG22/quickref/) to record pass, fail, not applicable, or not tested for each criterion. A representative audit is not a certification that every future article conforms. Accepted exceptions remain exceptions, not passes.

Separate template defects, CMS authoring obligations, third-party embed limitations, and browser/tooling limitations. Keep exact route/build/state, expected and observed behavior, criterion where applicable, severity, reproduction, and retest alongside each finding. Recheck deployed observations against the current generated artifact before changing source: older cached pages and newer local fixes are not the same baseline.

Automated checks cover settled pages and open dialogs/disclosures. Manual work covers complete keyboard tasks, actual assistive-technology output, responsive composition, and motion. An accessibility-tree snapshot is useful evidence but is not a screen-reader session. Missing tooling must be recorded, not silently counted as a pass.

## Preserve The Design, Remove Barriers
Keep approved typography, cursors, halftone, pointer effects, trails, and organisms unless an evidenced barrier requires adjustment. Test decorative versus informative motion separately. The footer marquee was reviewed against [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html): reduced-motion users receive a static presentation, and the user has declined a visitor-facing pause control for the default presentation. Record this as an accepted WCAG 2.2.2 exception rather than a pass. Do not reopen animation ideation or equate AAA interaction-animation guidance with an AA requirement.

Test accessible content and controls rather than pursuing an arbitrary Lighthouse score. SEO owns accurate crawlable HTML, internal navigation, canonical consistency, usable social previews, and truthful structured data. Follow [Google's canonical sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap); preserve deliberate external cross-post canonicals. No promises of ranking gains, speculative schema types, or claim that llms.txt is required for search indexing.

## Execution And Human Decisions
First establish provenance and coverage, then complete discovery before choosing broad fixes. Fix unequivocal semantic or mechanical defects in small batches with regression checks. Escalate changes to visible composition, motion-control placement, editorial meaning, or publishing configuration with concrete options and evidence. No user input is required to continue discovery.

The user owns factual alt descriptions, captions/transcripts, retention decisions, and copy choices when meaning cannot be inferred reliably. The content-audit spike inventories the Drive drafts and public CMS content before this editorial work begins; do not spend effort drafting alternatives for case studies that may be removed. Request narrowly scoped Android/TalkBack or other real-device acceptance only where the agent cannot perform it; do not substitute desktop emulation for that evidence.

Closeout requires a filled coverage matrix, disposition of every finding, verified repairs, explicit remaining editorial/third-party limitations, and a repeatable checklist. Record local artifact evidence precisely; production publishing and status remain the user's responsibility, and production inspection is performed only when requested or when it directly resolves an audit uncertainty. Runtime/performance work can share this matrix but keeps its own findings and commits. A later performance pass must rerun the accessibility/transition smoke checks.

## Historical Scope Intake
The original possibilities below are preserved, not a second active backlog. Automated checks, production SEO correctness, and warmed-production accessibility are now included above. Generative-design critique, unspecified external skill checks, and speculative richer schema are not prerequisites for this spike.

Possible future scope (original intake):

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
