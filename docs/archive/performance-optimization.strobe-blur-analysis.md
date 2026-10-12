---
attention: historical
---
# Transition Strobe — Blur Experiment Analysis
2026-09-19. Supplement to the [current investigation handoff](performance-optimization.strobe-handoff.md). This report analyzes the user's latest static comparison recording and relates it to the preceding development-toolbar experiment. It does not establish a trails-preserving repair.

## Conclusion
The small static blur patch reduces the recorded severity substantially but does not eliminate the failure. The user's impression is supported by the recording. Four no-blur forward trips contain 37 recorded samples with complete image loss; the two blur forward trips contain one. These are unequal groups in one six-trip sequence, not an estimated population failure rate. One blur trip with no identified complete loss is not a visual pass: the user reports strobing and that trip also contains a 50ms recording-sample gap.

The development toolbar's blur remains a demonstrated causal contributor to the earlier development result: removing it introduced failure and restoring it removed the user-visible strobe in that test. Adding a visually similar patch to production is a different intervention and is insufficient. Neither result identifies the exact browser-internal fault.

The evidence increasingly favors a rendering/presentation interaction involving the animated scene. It does not support returning to speculative payload-prefetch patches. The remaining distinction is between renderer-path selection, raster/resource delivery, and synchronization of the independently updated layers. Direct browser renderer measurements are needed to distinguish them.

## Recording And Run Identity
- Original movie: `/Users/aslan/Desktop/Screen Recording 2026-09-19 at 3.24.43 PM.mov`; 459,894,012 bytes; SHA-256 `4090dd2dc0f887229ec8be7ac593846e9c897c676d3f75e39fe5b937534bc93d`.
- Duration 53.400000s; 3450×1842; nominal 59.756100fps. The actual sample timestamps, rather than nominal frame rate, were used for inspection.
- Filmed run prefix `aa0e06` matches `report/performance-optimization/diagnosis/static-blur-1789848572895/aa0e068e-e999-43da-bdd7-44d8ee385e32/telemetry.json`; SHA-256 `1f1b46a307db0c8d66df61db94a71fe12601c6f94087f9737372ec8b47069489`.
- Chrome 152, viewport 1728×922, DPR2; six USCIS round trips; sequence none/blur/none/none/blur/none; no harness error. Every flight records eight visible original DOM echoes, no canvas, and 600ms primary transitions.
- At movie 10.000s the filmed counter reads 9267.3ms; at 40.000s it reads 39263.0ms. Derived alignment is movie time = telemetry time +0.735s, uncertainty approximately ±30ms. Original telemetry is unchanged.
- Analysis root: `report/performance-optimization/diagnosis/quicktime-static-blur-20260919-152443/`. It contains provenance, derived aligned telemetry, every decoded flight frame, full contact sheets, selected evidence images, `analysis-summary.json`, and a SHA-256 analysis manifest. The movie entry there is a symlink; the Desktop original was not modified.

## All Twelve Flights
Decoded 1,052 samples spanning 0.15s before through 1.30s after each flight-verification event. Reviewed the complete frame sequences in all twelve contact sheets, then enlarged the ambiguous and partial-loss examples. The first decoder sample can be clipped to the requested window boundary; it is excluded from cadence comparisons. These are approximately 60fps recording samples, not every refresh of the 120Hz display.

| Round | Patch | Forward complete-image loss samples | Return complete-image loss samples | Additional observations |
| --- | --- | ---: | ---: | --- |
| 1 | No blur | 5 | 5 | Forward includes consecutive missing samples. Return also loses the title and test panel; some heading letters are absent at 7.950–7.967s. |
| 2 | Blur10px | 0 identified | 0 identified | Image geometry progresses; 12.400→12.450s is a 50ms sample gap. User-reported strobe is not overturned by zero complete-loss samples. |
| 3 | No blur | 10 | 6 | Repeated complete losses, including two- and three-sample sequences; missing regions recur after intervening intact frames. |
| 4 | No blur | 12 | 0 identified | Return at 32.4667s loses the opaque main image and title ground while faint echoes, title ink and test panel remain. Counted separately from complete-image loss. |
| 5 | Blur10px | 1 | 0 identified | Clear full image/title/test-panel loss at 36.9000s; article text and the small blur patch remain. Adjacent samples are intact. |
| 6 | No blur | 10 | 7 | Partial primary-image loss at 44.9167s precedes complete failures; return also loses the image/test panel and some heading letters. |

Forward complete-loss sample times are stored individually in `analysis-summary.json`. The visually reviewed forward counts agree with near-zero colorful-pixel occupancy from the full-resolution source frames. Return counts were reviewed separately because other Home images remain visible and invalidate a whole-frame color threshold. Partial losses are examples, not an exhaustive automated partial-loss score.

The older detector returned forward counts 3/0/5/5/1/4. It required an isolated low-color frame between two colorful neighbors, so it missed consecutive losses as well as partial loss. The revised review gives 5/0/10/12/1/10. Do not compare these new totals with historical detector totals as if the measurement method were unchanged, or treat a zero detector count as a smoothness result.

### What Actually Disappears
The symptom extends beyond transparent trail echoes. At 36.9000s, with blur active, the primary image, its title and the separate opaque diagnostic panel disappear together; article text and the small patch remain visible. At 44.9167s, without blur, a rectangular portion of the primary image is absent while the faint echoes and opaque title/panel remain. Several return samples lose the image and panel while the surrounding Home composition remains.

This is not simply the whole frame freezing or the trails following their authored fade. The diagnostic panel is a separate fixed body child at z-index2147483647; the harness updates its status text but does not animate or hide its panel. The nearby recorded DOM samples verify the intended echo visibility, but are not per-frame proof of every element's state. The source also gives individual Home heading letters their own transform promotion, with no per-letter opacity animation in the inspected heading/parallax code. Missing letters are consistent with separate layer involvement; their precise rendered state at each missing sample was not instrumented.

Selected evidence: `blur5-dropout.jpg`, `forward6-partial.jpg`, `reverse1-loss.jpg`, and `reverse4-detail.jpg` under the analysis root. The blur5 triptych is especially useful because it shows an intact image, a missing image/title/panel with article text retained, and an intact image again on consecutive recorded samples.

### Judder, Size Updates And Capture Cadence
Complete losses and partial losses are separate from size-update continuity. The earlier canvas recording has a documented held title/image size followed by a jump at 5.9833→6.0000s while translation progresses. That remains an independent unresolved quality problem; this new original-DOM-trail experiment does not validate the canvas candidate.

The new blur round2 shows progressive title/image growth in the enlarged 12.050–12.167s sequence (`blur2-growth.jpg`). This is not a quantitative certification of smooth interpolation. No long whole-flight freeze like the earlier cold canvas failure was identified in this review. The recording has three internal sample gaps over25ms within the inspected windows: round1 forward 3.9667→4.0000s, round2 forward 12.4000→12.4500s, and round2 return 16.0667→16.1000s. The sampled complete failures elsewhere are actual decoded pictures, not gaps between timestamps. Conversely, a gap cannot tell us whether the application, presentation, or recorder skipped an update. Approximately60fps capture can miss individual120Hz display failures.

## What Was And Was Not Matched
The static test held patch bounds exactly at `[792.5,883,128,30]`, opacity1, visible/block. The recorded actual filter was `blur(10px)` on rounds2/5 and `none` otherwise. The earlier development test and this static test have matching viewport, DPR and Chrome major version. All eight complete echo keyframe/timing definitions match exactly across all twelve forward flights from both runs, and likewise all twelve reverse flights. This includes source/destination dimensions, translation, corners, opacity, stagger and easing—not just the echo count.

However, the real development toolbar and the artificial patch are not equivalent rendering structures:

| Development toolbar | Static diagnostic patch |
| --- | --- |
| Panel inside the DevTools shadow root and a fixed transformed anchor | Direct fixed body child |
| Absolute panel, transformed anchor and panel, overflow clipping, shadow, flex contents and live DevTools runtime | Fixed128×30 rectangle, border/translucent background, no equivalent ancestry or runtime |
| Flight samples approximately `[800.34,883,127.32,30]`; original toolbar can resize outside those samples | Constant `[792.5,883,128,30]` |
| Existing `transition: all .6s`; harness waits for the computed blur value before each trip | Immediate diagnostic filter change before each trip |

The source/readiness interval also differs between builds. Thus “same blur value” does not prove that both scenes produce the same render passes, layers, raster work, or presentation timing. The development result supports blur as a contributor in that scene; it does not establish that a128×30 blur anywhere on the page must reproduce the same immunity.

## Causal Interpretation
1. **Supported: trails and scene composition contribute.** Hiding the trails removed the earlier reproduced strobe while retaining the primary morph. Removing/restoring only development-toolbar blur changed the development outcome. Adding static blur reduces recorded complete losses but is insufficient. None of these interventions requires static delivery itself to be defective: production SSR also fails.
2. **Leading hypothesis: a rendering-path or layer-synchronization interaction.** Multiple unrelated visible regions can disappear while others remain. That pattern, the blur reversal, and capture sensitivity make this more plausible than destination data arriving late. It does not yet prove a Chromium defect, an OS defect, a particular resource-limit failure, or a specific Core Animation bug.
3. **Still viable: raster/resource pressure interacting with presentation deadlines.** Eight large echoes change dimensions/corners while the main image/title also change. Higher pixel counts and refresh cadence could expose resource or synchronization problems. The improvement from an extra blur operation argues against a simple “less total work always fixes it” account, but blur can also change rendering structure, so generic GPU pressure is not ruled out.
4. **Weakened: a pure navigation/prefetch/clone-lifecycle explanation.** Production SSR also fails; unchanged animation definitions can produce different visual outcomes; the separate test panel disappears too. Existing readiness and lifecycle candidates have not fixed the issue. Sparse DOM sampling still cannot exclude every possible style mutation at a particular video frame, so do not claim a formal proof that application state is always correct.

The inspected exact Chrome152 source provides a testable mechanism: a render-pass quad with backdrop filters is rejected by the direct Core Animation path; capture/copy requests can also disable that path. The code records `Compositing.Renderer.CALayerResult`. But the animated nonuniform corners can themselves reject the path, and optimization/render-pass structure may differ between toolbar and patch. No saved measurement establishes which path these actual flights took. A rejection code means a different rendering path was selected, not that a visual error occurred. [Exact running-version source](https://chromium.googlesource.com/chromium/src/+/4334922f44c77b1208072c4deac29db3af39bbea/components/viz/service/display/ca_layer_overlay.cc).

Other unresolved comparisons remain explicitly bounded. Built-in versus external confounds pixel count and120Hz/60Hz cadence. Normal Chrome152 versus in-app-reported153 confounds engine version. Chrome tab capture uses Viz, whereas the tested native window-capture path uses ScreenCaptureKit; the latter is not proven to set the same Viz bypass flag. The previous window-capture trial also combined an active stream with MediaRecorder encoding. QuickTime preserves the observed failure, but may still affect its frequency. None of these comparisons independently names the fault.

## Next Discriminating Work
Stop treating blur as a candidate repair. Measure renderer selection in the existing failing Chrome152 session around a named, fixed artifact before changing more CSS. The existing histogram is a low-intrusion starting point, but it is browser-global and must not be mistaken for page-specific per-frame evidence. If obtainable, per-frame Core Animation status plus renderer/GPU trace data should be aligned with a QuickTime failure. Status instrumentation requests frames and may perturb the symptom, so retain an uninstrumented failing control.

Then compare the same frozen artifact in a controlled diagnostic browser with the Core Animation renderer enabled versus explicitly disabled, keeping GPU acceleration, eight trails, the complete morph, pixel dimensions and display fixed. First establish a failing default control in that exact browser version; the installed Chrome153 binary is not automatically comparable with the existing152 process. If disabling this path removes failures and restoring it restores them, that narrows the cause. If failures occur while the path is already rejected in both cases, reject the simple direct-Core-Animation hypothesis and inspect raster/resource/presentation synchronization instead. Avoid calling any flag change the production fix.

This turn used offline files only. Foreground permission for the previously proposed browser-counter inspection is unanswered; no computer control was taken. No application source or frozen artifact was changed, no build was regenerated, and nothing was pushed or deployed. Trails-off remains the only user-validated local mitigation; canvas and blur are not accepted repairs. The investigation remains open.

## Follow-Up: Native Counter Inspection At16:00
After explicit user permission, the existing normal-Chrome152 window was inspected through native accessibility controls without requesting screenshots, claiming an extension tab or starting a recording/share. Its Window menu offered only the external monitors as move destinations; new diagnostic tabs stayed in that user-positioned built-in window. Native `chrome://version` confirms152.0.7977.84 and the previously inspected source revision.

Five filtered cumulative histogram downloads bracketed two10.4s single-round-trip3038runs. The no-blur interval adds4524CoreAnimation successes and no rejection buckets. The blur interval adds4626successes and937backdrop-filter rejections, with no change in other buckets, including nonuniform corners or Viz capture. This is new evidence that blur affects actual renderer selection in this session. It is **not** evidence that a particular missing frame was caused by that selection: counters cover the whole browser, and the wide intervals include idle/switching time while blur is enabled only during its trial. Successful-path counts in the blur interval therefore do not prove the renderer switched during a flight.

Both saved run telemetries verify eight original visible echoes,600ms,1728×922,DPR2,correct actual filter and no error. No video was taken. The user subsequently said they were not watching; visual outcome is explicitly unknown. Exact IDs, snapshot hashes, full counts and methodological incident record are in `report/performance-optimization/diagnosis/ca-histograms-20260919-155944/results.json`. Temporary tabs closed and foreground control end announced. No flags, application code, artifacts or deployment changed. This follow-up fulfills the earlier counter-access permission request; any next foreground session needs its own agreed scope.
