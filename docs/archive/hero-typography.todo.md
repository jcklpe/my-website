# Homepage Hero Typography — To Do

Operational breakdown for the hero-typography spike. Read `docs/hero-typography.md` for the concept, decisions, and the scaling-approach analysis. This doc tracks concrete work.

## Background

Main currently ships a CMS-driven hero (`mega-text` / `hero-title` / `hero-subtitle` in a framed diagram panel). This spike replaces it with the hardcoded "Bottom / Line / Up Front" overlapping wordmark from `gendes-blue2.claudecode`, and makes that composition scale as a locked unit using container-query units (`cqw`, Approach C). The hero ACF fields are removed as part of the work.

## Project Organization

Reference branch (visual target only, not a solved technique): `gendes-blue2.claudecode` — read its `apps/frontend/pages/index.vue` via `git show`.

Files in play:

- `apps/frontend/pages/index.vue` — hero markup + scoped `<style>` (the composition).
- `packages/styles/_type-fonts.scss` — `@font-face` for Edwardian Script ITC + Bodoni Z37.
- `packages/styles/_type-palette.scss` — `$font-edwardian`, `$font-bodoni`.
- `packages/styles/context-role/_vue-frontend.scss` — `--font-edwardian`, `--font-bodoni` (quoted).
- `apps/cms/wp-content/plugins/project-bootstrap/project-bootstrap.php` — hero ACF field defs (`mega_text` / `hero_title` / `hero_subtitle`, around lines 78–102) and their GraphQL registrations (`megaText` / `heroTitle` / `heroSubtitle`, around lines 813–857).
- `apps/frontend/composables/useWordPress.ts` — home-content GraphQL query (hero fields around lines 88–89) and normalization (around lines 718–735).
- `apps/frontend/composables/useHomeSurfacePrefetch.ts` — `getHomeContent()` consumer.

Token-name mapping when porting: blue2.claudecode `--font-script` → main `--font-edwardian`; `--font-display-serif` → `--font-bodoni`; `--font-mono` unchanged.

## General Principles

- The composition is typesetting, not layout. Tune the overlap in pixels at a reference size first, then convert the *locked* values to `cqw` so the whole thing scales as one unit. Do not try to make it reflow.
- Preserve the hand-tuned glyph relationships — especially the "Line" L-flourish overlapping "Bottom"'s descenders.
- One `h1`. The visible accessible name must read "Bottom Line Up Front". The B.L.U.F. badge and star ornament are decorative.
- Removing CMS fields touches schema-adjacent code (bootstrap plugin + GraphQL). Keep the removal complete and symmetric: definition, exposure, query, consumption, and stored data.
- Verify the live paper-grid texture doesn't fight script legibility; add a subtle scrim only if needed.

## Current State Overview

- Conceptual doc promoted to `docs/hero-typography.md`; decisions locked (replace, hardcode, `cqw`).
- Main hero = CMS-driven, responsive, not the wordmark. Nothing ported yet.
- blue2.claudecode wordmark = pixel-pinned reference, phone-stacks. No `cqw` work exists anywhere yet.
- Fonts already load on main (`@font-face` + tokens present); `apps/frontend/public/fonts/` must be populated locally.

## To Do

### Phase 1 — Port the composition onto main

- Replace main's `.hero-region` / `.hero-display` markup in `index.vue` with the wordmark structure: B.L.U.F. badge (`hero-kicker` + `aria-hidden` star), `h1` with three spans (`title-script-1` "Bottom", `title-script-2` "Line", `title-serif` "Up Front").
- Port the scoped styles from blue2.claudecode, mapping font tokens to main's `--font-edwardian` / `--font-bodoni` / `--font-mono`.
- Keep the framed-panel treatment consistent with main's Blue Atlas surface language (border-window, hard shadow, paper-grid) unless it competes with the script.
- Stop consuming `homePageContent` hero fields in the hero render.

### Phase 2 — Make it scale as a unit (Approach C, `cqw`)

- Put `container-type: inline-size` on the hero stage.
- Convert the locked desktop composition: positions (`top`/`left`) AND font-sizes to `cqw` so the whole graphic scales with the container width.
- Verify the internal overlaps survive at min and max container widths (not just the tuning width).
- Close the tablet gap (768px → desktop) that the old pixel-pinned version drifted through.

### Phase 3 — Mobile / portrait

- Decide: a scaled-down version of the same `cqw` composition, or the existing flow-stacked fallback — whichever reads better small. Implement and verify nothing clips off the panel.

### Phase 4 — Remove the hero CMS fields

- Remove the three ACF field definitions (`mega_text`, `hero_title`, `hero_subtitle`) from `project-bootstrap.php`.
- Remove their GraphQL field registrations (`megaText`, `heroTitle`, `heroSubtitle`).
- Remove the hero fields from the `useWordPress.ts` home-content query and normalization; confirm `getHomeContent()` consumers don't break.
- Confirm no seed/bootstrap step re-creates or re-seeds these fields.
- Clean stored data in both running CMS instances (public + QA): delete the orphaned postmeta on the front page (e.g. `wp post meta delete <front-page-id> mega_text` etc.) so nothing lingers. Public CMS container and QA (`cms_dev`) both.
- Regenerate editor CSS if any editor-facing change results (`corepack pnpm styles:wp-editor`).

### Phase 5 — Accessibility + legibility

- Confirm the `h1` reads "Bottom Line Up Front"; badge reads sensibly (decide whether "B.L.U.F." needs an expanded `aria-label`); star `aria-hidden`.
- Contrast: periwinkle script and ink serif over the *live* paper-grid texture, AA (large-text 3:1 floor easily met at display size; verify, don't assume).
- SSR/static: confirm no bad FOUT while local fonts load; the `font-display: swap` fallback chain should degrade to cursive/serif gracefully.

### Phase 6 — Verify

- `corepack pnpm check` (lint, typecheck, editor CSS).
- Static generation smoke test (`generate:static:public`) — confirm the hero renders and fonts resolve in generated output, not just dev.

## Ready for Human Visual QA

_(Nothing pending — Phase 3 closed. Phase 4 is code-only cleanup; Phase 5 has small a11y items that may land here.)_

## Done

- **Phase 6 — final verification.** `corepack pnpm check` green on the final state (lint, typecheck, editor CSS regen). Static generation smoke test run by the user — `generate:static:public`, `inspect:static`, and `start:static:preview` all clean: hero renders correctly in built output, local fonts resolve through the static bundle, no leaks. Spike complete.
- **Phase 5 — accessibility + legibility verified.** Single-h1 invariant confirmed: the homepage's only `<h1>` is the hero title; all home sections use `<h2>`; `HomeVitalInfo` correctly has no heading. The `<h1>` reads "Bottom Line Up Front" as its accessible name (concatenated from the three spans; `display: contents` doesn't break heading semantics in current browsers). The B.L.U.F. badge is left letter-by-letter — DOM order is badge → h1, so screen readers naturally read the acronym then its expansion, mirroring the visual idea. An `aria-label` expansion would duplicate the h1 redundantly. Star ornament stays `aria-hidden="true"`. Contrast against the lightest blueprint-field stop (`#edf1f6`): periwinkle script (`#2657eb`) 4.72:1 — passes AA for normal text and AAA Large at display size; ink serif (`#0c112b`) 15.7:1; badge periwinkle text 4.72:1. FOUT chain degrades gracefully: cqw positions are font-metric-independent so the layout doesn't reflow while `cursive` / `'Bodoni MT'` / `'Didot'` / `serif` stand in. One concrete improvement applied: the hero `<section>` now carries `aria-labelledby="home-hero-title"` (paired with `id="home-hero-title"` on the h1), promoting it from a generic section to a labeled region landmark — consistent with the labeled-nav convention in AGENTS.md. No motion is added by the hero (only the static `-3deg` script rotation), so no `prefers-reduced-motion` handling is needed.
- **Phase 4 — orphaned hero CMS fields removed end-to-end.** Deleted the entire `group_my_website_homepage_hero` ACF field group (the group only contained the three hero fields) from `project-bootstrap.php`, plus the three `register_graphql_fields('Page', …)` entries (`heroTitle` / `megaText` / `heroSubtitle`). Removed the three fields from the home-content GraphQL query and the `queryHomePageContent` normalization in `useWordPress.ts`, and dropped them from `HomePageContent` and `WordPressHomePageResponse` in `types/wordpress.ts`. `getHomeContent` consumers (vital-info / quick-links / testimonials / SEO description) are unaffected — the homepage's hero no longer references `homePageContent` at all. Deleted the stored postmeta on the front page (post ID 4) in both running CMS instances via `wp post meta delete` over docker: `mega_text` + `_mega_text`, `hero_title` + `_hero_title`, `hero_subtitle` + `_hero_subtitle` in both `my-website-cms-1` (public) and `my-website-cms_dev-1` (QA). `corepack pnpm check` green; straggler grep across `apps/` and `packages/` returns zero matches. 2026-05-29.
- **Phase 3 — phone keeps the same cqw composition, scaled down + retuned.** The flow-stacked fallback was removed; the wordmark stays a wordmark on small screens. Phone gets its own overrides inside the `@include breakpoint(phone)` block: tighter outer padding (`.home-page` padding-inline `space-4 → space-3`; `.hero-region` padding `space-5 → space-3`, margin-top `space-4 → space-3`), a slightly more landscape canvas (`--hero-canvas-h: 295 → 380`, aspect ~1.95:1 instead of desktop's ~2.51:1), "Up Front" raised and grown to anchor the composition (`top: 170 → 200`, `font-size: 80 → 140` design units), and "Line" pulled toward the left edge (`left: 55 → 20`). Human QA confirmed on Pixel 7 emulation 2026-05-29 after two tuning rounds (overcorrected to a more-square 1.57:1 first, then dialled back; Up Front was initially dropped to top 290 then raised to 200 to slot beside Line instead of below it).
- **Phase 2 — `cqw` conversion + fill the panel + kerning.** The composition now scales as one locked unit via container-query units against a tunable design canvas, with four knobs on `.hero-display`: `--hero-canvas-w` (text size), `--hero-canvas-h` (box height), `--hero-max-vh` (viewport-height ceiling, prevents the hero ever exceeding ~92vh by capping stage width on wide/short viewports), and the three `top:` values on `.title-script-1 / -2 / .title-serif` (vertical position of the wordmark). Restored the pale-blue blueprint-field panel background and the target / radar diagram graphic (relocated to the upper-right, sized up, `z-index: 0` so it reads as texture behind the type). Kerning on `.title-script` fixed by explicitly enabling OpenType `kern` / `liga` / `clig` / `calt` / `dlig`, `font-variant-ligatures`, `font-kerning: normal`, `text-rendering: optimizeLegibility`, consistent font-smoothing, and removing the global negative `letter-spacing` so the font's designed pair metrics carry the joins (e.g. i→n in "Line", o→m in "Bottom"). Human QA confirmed final state 2026-05-29 after several tuning rounds (width cap removed, text size up, wordmark shifted up to overlap the target, box height trimmed). Final values: `--hero-canvas-w: 740`, `--hero-canvas-h: 295`, `--hero-max-vh: 92vh`, script tops `40 / 130 / 170`, serif `170 / 370`.
- **Phase 1 — wordmark ported onto main (reference pixels).** Hero renders the B.L.U.F. badge + "Bottom / Line / Up Front" wordmark, token-mapped to `--font-edwardian` / `--font-bodoni` / `--font-mono`, in a framed panel (diagram-circle ornament intentionally dropped to match the reference; later restored as the target graphic in Phase 2). Human QA confirmed the look 2026-05-29; only note was "make it bigger / fill the container," addressed in Phase 2.
- Spike promoted from scratch + scoped 2026-05-29.

## Carried Open Questions (from the conceptual doc)

- Should the script+serif+mono treatment generalize into a reusable display-type system (e.g. writing index), or stay a one-off hero signature?
- Behavior at extreme aspect ratios (very tall/narrow vs very wide/short).
- Does the paper-grid behind the type need a subtle scrim / reduced opacity behind the words specifically?
