# Live Halftone Renderer — Start Here
Updated 2026-09-23 at the Astra → Opus 5.5 handoff. This is the current plan for bringing the S55 live halftone renderer into the normal Nuxt/static build. It supersedes the renderer paragraphs scattered through the interaction spike and the strobe handoff; those remain history. Read this, then the source files it names. Consult the [strobe handoff](performance-optimization.strobe-handoff.md) and [experiment ledger](performance-optimization.strobe-experiments.md) only when a specific past result matters.

Continues from: docs/archive/interaction-polish.md

Motion choreography (surroundings, shells, slits, route pairs) is no longer part of this work. It lives in `docs/active-spikes/route-choreography.md`, and its round-trip check (`corepack pnpm check:transitions`) must stay green with the renderer on.
## What The User Wants
- Live halftone on case-study cards, the flying photo, its echoes and the landed hero, with a fixed on-screen 11 CSS-pixel dot while the image changes size, crop and shape. Switching back to baked images during ordinary navigation is rejected.
- The accepted look is the S55 five-pass treatment: screen/multiply CMYK dots, blur/threshold, soft K, as a reproduction of the existing CSS treatment rather than generic subtractive CMYK.
- Accepted in the S58 diagnostic preview (user QA 2026-09-23): no parallax snap on click, and independent dot parallax over both the photo and text plates. The star spin-shrink and number/per-row excerpt slit exits are also accepted and already live in mainline source.
- Case-study trails may be removed if they threaten smoothness. Writing trails have separate requirements.
- Native DOM text, full geometry and corners, reduced motion, and a coherent fallback when WebGL is unavailable or its context is lost.
- The target is the feature-equivalent CDN-delivered static site. A framework or build rewrite is not on the table unless a measured current-stack integration fails.
## What The Prototype Actually Is
Audited 2026-09-23 from the retained artifacts under `report/performance-optimization/diagnosis/`.

S55, S58 and S59 are each a generated static site served by a bespoke Node `server.mjs` that does three things the real site does not:
1. Rewrites every CMS media URL to a same-origin `/__s26/media/<sha256>` file (`media-provenance.json`).
2. Serves original, un-baked PNGs at the baked halftone URLs through a hand-written map (`shader-media-map.json`: 15 baked URLs → 5 originals), so the shader can sample the real photo.
3. Injects `shader.js` (about 250 lines) and `manual.js` (a speed knob) into every HTML page.

`shader.js` keeps one WebGL1 context and renders a five-pass pipeline per surface (composite dots → blur → threshold → blur → soft-K/sepia). Each result is copied into a 2D canvas overlaid on the `<img>`, so clipping and stacking follow the DOM. Trails are drawn by monkeypatching `CanvasRenderingContext2D.prototype.drawImage`, `roundRect` and `clearRect` on the app's trail canvas. Redraws are woken by a document-wide MutationObserver plus scroll, resize, pointer and click timers. S58 adds one change: card inline-style mutations (parallax offsets) wake a redraw. S59 uses the identical `shader.js` (same SHA-1) on newer app source.

Mainline `apps/frontend/utils/halftone-shader.client.ts` is a near-verbatim copy of S55/S58 `shader.js`, including the S58 redraw observer, gated behind `?experimentalHalftone=1` by `apps/frontend/plugins/halftone-shader.client.ts`. Its differences are exactly the parts that never worked:
- Its `sourceFor()` returns the `<img>`'s own path, which is the baked halftone, and fetches it as a relative URL through `/api/image-proxy` (`apps/frontend/server/api/image-proxy.ts`). Even a working proxy would re-halftone an already halftoned image. The elements already carry `data-original-src` with the full-size original, but nothing reads it. A server route also cannot exist on the static CDN build, and as written it proxies arbitrary URLs.
- It uploads each texture without setting filtering or wrapping and then calls `generateMipmap`. In WebGL1 a non-power-of-two texture with the default mipmap filter is incomplete and samples black, and `generateMipmap` rejects it. This is read from source against WebGL1 rules and has not been observed in a browser. The prototype's `texture()` helper sets LINEAR/CLAMP first, which is why it works.
- Once installed it adds a body class that hides every CSS halftone layer globally, before any live surface is ready. Photos would flash untreated or stay untreated if a fetch fails.
## What Integration Requires
1. **Media source.** Every card's media object already carries the baked `case-study-halftone-*` sizes and the full-size original (`apps/frontend/utils/featured-media.ts`). The generated Home HTML references the original `.png`, and the static deploy's media plan copies every referenced upload to same-origin `/media/` (`apps/frontend/scripts/static-deploy-bunny.mjs`), so a direct `fetch` on the delivered site needs no proxy and no CORS. `FeaturedMediaFrame` and the clone images already emit `data-original-src`; have the renderer read it instead of the baked `currentSrc`. Originals are 0.5–2.5 MB PNGs; add a web-sized un-baked "live source" variant to `scripts/bake-case-study-halftones.mjs` rather than fetching raw originals. In dev and local `static:preview`, media stays on `cms.my-website.localhost` (cross-origin), so either add CORS headers to the Caddy media route or keep those surfaces on the CSS treatment. Delete the proxy route.
2. **Textures.** LINEAR/CLAMP, no mipmaps, upload a decoded `ImageBitmap`, and mark the source ready only after the upload succeeds.
3. **Per-surface readiness.** Keep the CSS treatment visible on each surface until its live canvas has drawn once, then swap that surface only. No global hide.
4. **Explicit ownership.** Replace document-wide observation and prototype hooks with registration from the components that own each surface: card (`CaseStudyCard.vue`), clone frame (`FeaturedMediaTransitionLayer.vue`), landed hero (`pages/case-studies/[slug].vue`), and trails (`utils/featured-media-trails.ts` calling the renderer directly instead of a patched Canvas2D). Each surface registers on mount, invalidates when its own geometry or parallax changes, and unregisters on unmount.
5. **Scheduling.** Draw inside the existing flight RAF where one is running; stay idle when nothing changed (S58's idle probe measured zero draws when settled).
6. **Failure.** Context loss or shader failure reverts every surface to the CSS treatment together. Clean up on unmount and `pagehide`.
## Slices
Each slice lands behind the existing flag, is verified, and then the flag default flips at the end.
1. Media source, textures and per-surface readiness for cards only. Compare against S58 on 3089 side by side.
2. Clone frame and landed hero with explicit registration; the round-trip check must stay green.
3. Trails through a direct renderer call; measure pacing with trails on and off, and drop case-study trails if they cost smoothness.
4. Default on, delete the proxy and the prototype hooks, keep S58 as the frozen control until human acceptance on Retina.
## Verification
- `corepack pnpm check` for lint and types. It cannot compile GLSL.
- `corepack pnpm check:transitions` against a fresh static preview, with the renderer on.
- A renderer probe that reports per-surface state (CSS, live, failed), draw counts while settled (should be zero) and shader or texture errors.
- Human QA on physical Retina for look and pacing. Prototype smoothness is not evidence for the integrated build.
