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

**Phase 2 — `cqw` conversion + fill the panel.** The composition's positions and font-sizes are now in container-query units against a reference design canvas, so the whole wordmark scales as one locked unit with the hero container. A single knob controls overall size:

- `.hero-display { --hero-canvas-w / --hero-canvas-h }` in `index.vue` is the reference design canvas in px. **Smaller `--hero-canvas-w` = BIGGER wordmark** (it fills more of the container width); `--hero-canvas-h` sets the stage aspect/height. Current starting values aim for a near-full fill — nudge to taste.
- Please QA: does it fill the panel the way you want at desktop widths, and does it hold its internal overlaps across the tablet→desktop range (resize the window — the relationships should stay locked now, no drift)?
- Watch for clipping: `hero-region` is `overflow: hidden`, so if the wordmark is pushed too big (canvas-w too small) the script edges/descenders can clip. If so, raise `--hero-canvas-w` slightly or `--hero-canvas-h`.
- Hero height on ultra-wide: stage height tracks width via `aspect-ratio`; if the hero gets too tall on big monitors, lower `--hero-canvas-h` (taller canvas number = shorter rendered hero) or revisit the `max-width` cap.

## Done

- **Phase 1 — wordmark ported onto main (reference pixels).** Hero renders the B.L.U.F. badge + "Bottom / Line / Up Front" wordmark, token-mapped to `--font-edwardian` / `--font-bodoni` / `--font-mono`, in a framed paper-grid panel (diagram-circle ornament intentionally dropped to match the reference). Human QA confirmed the look 2026-05-29; only note was "make it bigger / fill the container," addressed in Phase 2.
- Spike promoted from scratch + scoped 2026-05-29.

## Carried Open Questions (from the conceptual doc)

- Should the script+serif+mono treatment generalize into a reusable display-type system (e.g. writing index), or stay a one-off hero signature?
- Behavior at extreme aspect ratios (very tall/narrow vs very wide/short).
- Does the paper-grid behind the type need a subtle scrim / reduced opacity behind the words specifically?
