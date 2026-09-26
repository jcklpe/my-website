# Performance and Optimization — Final Analysis
## Decision — 2026-09-26
The user accepts the current static preview as matching or exceeding the prototype and prefers to preserve it. Extra rapid-interruption testing is dropped at the user's request, not recorded as passed. Verification consolidation and the final McMaster-Carr synthesis are complete. No further runtime changes are justified merely to finish this spike. Archival is a separate documentation step; deployment is not included.

## McMaster-Carr: what was left unfinished
The public browsing investigation already completed: the earlier U3 record documents Home → Screws → Metric → Back without authentication, preserving recognizable search/filter context. The unfinished part was the synthesis into decisions for this website. The conceptual doc's older login-gate limitation is superseded by that successful journey.

Evidence has three distinct levels:
- **Our historical browser observation:** context remains recognizable and Back restores the browsing state. This is interaction evidence, not a latency benchmark or proof of a particular cache/DOM implementation. The current [public catalog](https://www.mcmaster.com/) was checked again for reference; no new timed browsing study was performed.
- **Historical first-hand technical inspection:** [Wes Bos's walkthrough](https://www.linkedin.com/posts/wesbos_how-is-this-website-so-fast-a-tweet-about-activity-7253071128129089536-ZO3F) observed hover-triggered HTML requests, partial-page navigation, inline initial CSS and caching. These are dated client-side observations, not a verified description of today's backend or field performance.
- **General browser guidance:** [prefetching](https://web.dev/articles/link-prefetch) trades additional downloads for earlier readiness, while [rendering performance](https://web.dev/articles/rendering-performance) depends on fitting work into the browser's frame schedule. Those mechanisms support our analysis without attributing unobserved internals to McMaster-Carr.

## Translation to this site
| Principle | Current implementation/evidence | Final recommendation |
| --- | --- | --- |
| Prepare likely next content | `useContentDetailPrefetch.ts` warms selected images, generated payloads and exact block modules. Case-study viewport work is queued; background preparation waits around active transitions. Writing intent warms its block renderers too. | Keep the existing policy. More speculative work is not automatically faster. |
| Keep browsing context coherent | Persistent site layout, remembered source geometry and explicit destination handoff support returning to cards/rows. The user accepts the resulting static transitions. | Preserve the accepted sequence and full morph; continuity is part of perceived speed. |
| Serve content already prepared | Explicit static generation produces HTML/payloads for CDN delivery. The local artifact inspection passes. | Keep this architecture. CMS tuning does not remove work from a static visitor's transition. |
| Avoid visible catch-up | Source/destination paint readiness, GPU trails and the corrected first-frame clock address demonstrated defects. | Retain these fixes; do not shorten animation merely to improve a timing number. |
| Keep optional work away from the interaction | Existing traces still show about 100 ms in the Writing margin-decoration setup callback, in both prototype and integrated builds. | This is the strongest optional next experiment; see below. |
| Cache only where it pays | Existing image/payload reuse and bounded trail textures already provide reuse. Current CDN cache performance was not remeasured. | No new service worker, cache framework, blanket preloading or framework rewrite is supported by this analysis. |

## One worthwhile optional experiment
**Delay offscreen Writing organism initialization until it is useful.** `ArticleMarginOrganisms.vue` positions patches starting well below the initial viewport and mounts `HomeReactionDiffusionBackground` with `paused` set. That component still calls `setup()` on mount, creating a WebGL2 context and linking five programs before its paused state governs ongoing simulation. The comparison traces attribute roughly 100 ms to the patch-placement callback and resulting component setup; they do not isolate the exact share of each GPU API call.

A bounded experiment could initialize a patch shortly before it approaches the viewport, preserving its reserved geometry and visual design. Compare the existing and changed build on Writing entry and the first scroll to those decorations. Keep it only if entry work decreases without a new scroll hitch, late appearance or simulation discontinuity. Do not move the same cost into the user's next scroll and call that a win. This is an analysis recommendation, not an implemented change, promised saving, required closeout item or new QA assignment.

The prototype's preload-all-five GPU policy is a weaker lead: it differs from the bounded current cache, but repeated flights already passed visual QA, and first-use timing varied between samples. No broad GPU prewarming change is recommended on that evidence. Likewise, initial hydration was complete before the sampled interactions; making the application “more static” is not supported as the next remedy.

## Consolidated verification
Accepted preview: public-CMS, non-indexable generated output at `http://127.0.0.1:3002`. Current homepage SHA-256 matches `prototype-comparison-20260926/artifact.json`'s accepted `afterIndexSHA256`. This identifies the retained artifact; it is not a claim that a homepage hash verifies every asset independently. No rebuild or runtime modification occurred during this consolidation.

| Coverage | Evidence and outcome |
| --- | --- |
| Human presentation | 2026-09-26 acceptance: corrected preview matches or exceeds S59, including later integration fixes. No further visual QA is requested for these trails. |
| Source/build/delivery | Latest `check.log`, `build.log`, and `inspect.log` under `report/performance-optimization/prototype-comparison-20260926/`: lint/typecheck pass with existing About/Now warnings, preview generation succeeds, generated asset/media and discovery checks pass. |
| Current trail correctness | `corrected-trails.json`: source-aligned first frames, visible GPU pixels, both directions and cleanup for case studies, loops, Latest Writing and archive; no failures. |
| Current return blink | `home-return.json`: photo-level return regression passes, no page errors. |
| Current choreography | `transitions.json`: both case-study configurations and archive pass. Latest Writing retains the two known shell/nav checker findings; human QA accepts the shell and does not reproduce nav disappearance. The full suite is not entirely green. |
| Responsive and fallback | Earlier GPU candidate's `gpu-trails/narrow.json`, `no-webgl.json`, `reduced-motion.json`, `context-loss.json` pass. These were reused for unaffected paths; they were not rerun on the final clock-only change. Desktop final-clock coverage is fresh. |
| Timing/hydration comparison | `baseline.json`, `geometry.json`, `corrected-comparison.json`: Chrome 153, 1726×923/DPR2; both builds hydrated before measured clicks, first-frame mismatch corrected. Callback timing is not a physical-display certification. |

All report paths above are ignored local evidence. Earlier delayed-readiness and reduced-motion results remain supporting history. No new interruption campaign was run. This consolidation does not certify the current artifact on production CDN, real phones or every browser. Those are scope limits, not new blocking tasks.

## Closeout scope
Renderer and trail work is committed. Existing dirty PostCard corners and shared archive-return timing belong to Route Choreography; scratch notes and root diagnostic scraps are not swept into this spike. Loop-title alignment and new route pairs remain in Route Choreography. SSR chug stays low priority. The optional Writing-decoration experiment may be picked up deliberately later; the accepted static experience does not depend on it.
