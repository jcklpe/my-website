# Syntax Highlighting Improvements — To Do

## Status: Active, First Pass Ready For Visual QA

See [syntax-highlighting.md](syntax-highlighting.md) for the conceptual model,
constraints, current implementation notes, and open design questions.

---

## Background

The current code-block system is already distinctive: Shiki-generated syntax,
custom Enzo grammar support, CRT-style code block surfaces, inline code colors
that track the selected theme, and three visual modes: Midnight, Phosphor, and
Signal.

This spike should refine that system rather than replace it. The known pain
points are:

- Midnight does not feel distinctive enough from the other themes.
- Some Midnight token colors, especially orange/red/pink accents, do not feel
  sufficiently "midnight blue."
- Enzo constructs like `Loop` and `then` can read too much like comments or dim
  structural noise.
- The fixed floating syntax theme switcher feels awkward and too heavy.
- A subtle CRT/shader pass might add character, but it could easily tip into
  gimmick or reduce readability.

## Project Organization

- Conceptual doc: [syntax-highlighting.md](syntax-highlighting.md)
- To-do doc: this file
- Origin scratch note: `docs/scratch/syntax-highlighting.md` promoted here on
  2026-06-29
- Spike process reference: [how-to-spike.md](how-to-spike.md)
- Related intake process: [how-to-misc0.md](how-to-misc0.md)
- Main theme registry: `apps/frontend/utils/syntax-highlighting.ts`
- Theme files:
  - `apps/frontend/utils/midnight-theme.ts`
  - `apps/frontend/utils/phosphor2-theme.ts`
  - `apps/frontend/utils/signal-theme.ts`
- Enzo grammar: `apps/frontend/utils/enzo-grammar.json`
- Code block component: `apps/frontend/components/content/blocks/CodeBlock.vue`
- Old selector component: `apps/frontend/components/dev/CodeThemeSwitcher.vue`
  removed during this spike
- Theme state composable: `apps/frontend/composables/useCodeTheme.ts`
- Shared styles: `packages/styles/shared-components/_code-block.scss`

## General Principles

- Preserve readability first. A beautiful theme that makes code harder to scan
  is a regression.
- Keep Shiki as the highlighting engine.
- Tune theme semantics deliberately; do not randomly recolor individual tokens
  until the palette "looks cool."
- Maintain at least WCAG AA contrast for meaningful token text wherever
  practical.
- Keep the selector accessible through real controls and clear labels.
- Avoid hover-only interactions as the only path, because code blocks appear on
  touch devices too.
- Keep the implementation boring and local. This is not a new design-system
  architecture.
- Treat CRT effects as optional seasoning, not the meal.

## Current State Overview

- `syntax-highlighting.ts` exposes `CODE_THEME_LABELS`, `CODE_THEME_SURFACES`,
  and `highlightCode()`.
- Inline code colors are already synchronized to the selected code theme through
  `BlockRenderer.vue` and `CODE_THEME_SURFACES`.
- `CodeBlock.vue` applies per-theme CRT shell custom properties in a local
  computed style.
- `_code-block.scss` owns the CRT shell, scanlines, glow, language label, and
  inline code recipe.
- The old fixed floating `CodeThemeSwitcher.vue` has been removed.
- `CodeBlock.vue` now renders local theme-color dot controls in the code-block
  chrome. On desktop, the dots sit in a small outside-right vertical rail. At
  rest only the active dot is visible; hovering or focusing the code block
  reveals all options. The selected theme state remains global through
  `useCodeTheme()`, so changing any code block changes all code blocks on the
  page.
- Phone dot controls have 48px hit areas and sit in the block chrome rather than
  relying on hover.
- Signal currently maps Enzo control-flow keywords to dim green structural
  color, which likely explains why `Loop` / `then` read too low-emphasis.
- First theme-semantics pass is implemented:
  - Midnight data tokens now stay in their semantic hue lanes while bending
    toward the Midnight vibe: cool rose-red variables, cool magenta-violet
    references, electric peach binding/attributes, and light rose member
    indexes.
  - Signal control-flow keywords now use a lit terminal green that reads as
    syntax above comments/punctuation while staying below cobalt declarations.
  - Blueprint field names now lean slightly more red-magenta/purple so they
    separate from plain variables and read more connected to Blueprint syntax.
  - Blueprint `<[` / `]>` delimiters now match the bluer Blueprint
    name/instance lane across all three themes instead of the more purple
    abstract-type lane.
  - Changed colors were contrast-checked against their theme grounds and clear
    WCAG AA in the quick luminance check.

## To Do

### 1. Discussion / Decisions Before Implementation

- [ ] Decide the desired degree of Midnight retuning:
  - [ ] light touch: cool the worst orange/pink offenders only
  - [x] medium touch: shift the warm data family toward electric violet/cyan
        while keeping semantic contrast
  - [ ] heavy touch: redefine Midnight's token semantic map as a more
        blue-forward theme
- [ ] Decide how Enzo flow constructs should read in each theme:
  - [ ] same hue family as structural keywords, but brighter
  - [ ] same treatment as declaration keywords
  - [x] a separate "control flow" emphasis level between comments and
        declarations
- [ ] Decide selector placement:
  - [ ] retain one global selector but restyle it smaller
  - [x] render a small selector beside every code block
  - [ ] render one contextual selector beside hovered/focused code blocks
  - [x] combine selector with existing code language label/chrome
- [x] Decide mobile selector behavior. Dots live in the code-block chrome with
      48px touch targets rather than relying on hover.
- [ ] Decide whether CRT effects are in scope for this spike or should stay
      exploratory.

### 2. Theme Audit

- [ ] Capture screenshots or visual references for all three themes on the same
      representative code blocks.
- [ ] Include Enzo code in the audit, especially examples with `Loop`, `then`,
      flow/control constructs, references, variables, functions, variants, and
      comments.
- [ ] Include at least one common language such as JavaScript/TypeScript.
- [ ] Check token contrast for proposed color changes.
- [ ] Confirm whether Enzo grammar scopes expose the distinction needed for the
      desired keyword treatment.

### 3. Midnight Retuning

- [x] Adjust Midnight token colors so the theme has a clearer cobalt/electric
      blue identity.
- [ ] Specifically revisit:
  - [x] variables
  - [x] reference values
  - [x] binding operators
  - [x] tags / attributes
  - [ ] CSS selectors
- [x] Keep token roles distinguishable without leaning on the same amber/green
      register as Phosphor or Signal.
- [x] Update theme comments so the semantic color rationale matches the new
      palette.

### 4. Enzo Keyword Emphasis

- [x] Identify the scopes emitted for `Loop`, `then`, and related Enzo flow
      constructs.
- [x] Tune Signal so flow constructs are brighter and higher contrast than
      comments.
- [ ] Check whether Midnight and Phosphor need parallel changes for consistency.
- [ ] Avoid making every keyword maximum-emphasis; preserve hierarchy between
      flow glue, declarations, functions, and values.

### 5. Selector UI

- [x] Replace or restyle the fixed floating selector.
- [x] Use theme-color dots or similarly compact controls.
- [x] Keep the selected theme state global via `useCodeTheme()`.
- [x] Give controls accessible labels such as "Use Midnight syntax theme."
- [x] Preserve keyboard focus and activation.
- [ ] Decide whether theme choice should persist beyond the current Nuxt page
      state.
- [x] Remove or repurpose `CodeThemeSwitcher.vue` only after the new selector
      path exists.

### 6. Optional CRT / Surface Polish

- [ ] Prototype only if theme/selector work is stable.
- [ ] Explore subtle scanline/filter additions before SVG/filter-heavy effects.
- [ ] Verify reduced-motion behavior if anything animates.
- [ ] Compare readability before and after; reject effects that lower code scan
      quality.

### 7. Verification

- [ ] Run focused lint on touched Vue/TS files.
- [ ] Run `corepack pnpm typecheck`.
- [ ] Run `corepack pnpm check` when feasible.
- [ ] Browser-check a writing post with multiple code blocks.
- [ ] Browser-check a post with inline code mixed into paragraphs.
- [ ] Browser-check mobile behavior if selector placement changes.

## Ready For Human QA

Theme semantics and selector UI first pass are ready for visual review once a
representative code page is open in-browser.

Expected QA surfaces once implemented:

- Midnight theme distinctiveness against Phosphor and Signal.
- Enzo examples where `Loop` and `then` should read as language constructs, not
  comments.
- Selector discoverability and taste.
- Selector keyboard and mobile behavior.
- Inline code color harmony after theme changes.
- CRT/surface effect, if any, for "characterful but still readable."

## Done

- [x] 2026-06-29 — Promoted `docs/scratch/syntax-highlighting.md` into active
  spike docs.
- [x] 2026-06-29 — Inspected the current syntax theme implementation,
  code-block shell, global selector, inline-code theme bridge, and Enzo/Signal
  control-flow treatment.
- [x] 2026-06-29 — Implemented the first theme-semantics pass:
  Midnight variables/references/binding/HTML accents shifted into cooler
  rose/magenta/peach colors that preserve the semantic hue scalar, and Signal
  Enzo flow keywords shifted from dim green to lit terminal green.
- [x] 2026-06-29 — Corrected the initial Midnight over-shift after review. The
  first attempt moved data roles too far into periwinkle/violet/cyan and broke
  the hue-scalar intent; revised colors keep variables red, references magenta,
  and binding orange while making each lane less orange/hot and more Midnight.
- [x] 2026-06-29 — Refined Blueprint semantics across the three themes:
  Blueprint field names moved slightly toward red-magenta/purple for better
  distinction from variables, and Blueprint `<[` / `]>` delimiter scopes moved
  from abstract Blueprint Types to the bluer Blueprint name/instance lane.
- [x] 2026-06-29 — Verification passed for theme-semantics pass: changed colors
  quick-checked for WCAG AA contrast, focused ESLint passed for
  `midnight-theme.ts` / `signal-theme.ts`, and `corepack pnpm typecheck` passed.
- [x] 2026-06-29 — Verification passed after Blueprint semantic refinement:
  changed colors quick-checked for WCAG AA contrast, focused ESLint passed for
  `midnight-theme.ts` / `phosphor2-theme.ts` / `signal-theme.ts`, and
  `corepack pnpm typecheck` passed.
- [x] 2026-06-29 — Implemented the first selector UI pass. Replaced the old
  fixed floating desktop-only switcher with local theme-color dot controls in
  `CodeBlock.vue`; retained global theme state through `useCodeTheme()`; removed
  `CodeThemeSwitcher.vue` and `useHasCodeBlocks()`.
- [x] 2026-06-29 — Refined selector placement after review. Theme dots now sit
  outside the right side of the code block on desktop, are smaller visually, and
  show only the active theme at rest while revealing all options on hover/focus.
- [x] 2026-06-29 — Verification passed after selector UI pass: focused ESLint
  passed for touched Vue/TS files and full `corepack pnpm check` passed,
  including regenerated WordPress editor CSS.
- [x] 2026-06-29 — Verification passed after selector placement refinement:
  focused ESLint passed for `CodeBlock.vue` / `syntax-highlighting.ts`, and full
  `corepack pnpm check` passed, including regenerated WordPress editor CSS.
