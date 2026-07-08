# Syntax Highlighting Improvements Spike

## Purpose

Refine the site's code-block language so syntax highlighting feels deliberate,
distinctive, and easier to use without turning code blocks into novelty props.

The site currently has three Shiki-backed visual themes:

- **Midnight** — cobalt/electric-blue terminal world
- **Phosphor** — amber phosphor CRT world
- **Signal** — green terminal/signal world

This spike closed with code blocks feeling like a small, intentional instrument:
three readable CRT-flavored syntax themes, a quiet desktop-only selector, and a
surface treatment that adds depth without turning code into a novelty prop.

---

## Current Implementation

The implementation is split cleanly:

- `apps/frontend/utils/syntax-highlighting.ts` registers themes and languages,
  exposes `CODE_THEME_LABELS`, and provides `CODE_THEME_SURFACES` for inline
  code styling.
- `apps/frontend/utils/midnight-theme.ts`,
  `apps/frontend/utils/phosphor2-theme.ts`, and
  `apps/frontend/utils/signal-theme.ts` define the Shiki theme token colors.
- `apps/frontend/utils/enzo-grammar.json` defines the custom Enzo grammar.
- `apps/frontend/components/content/blocks/CodeBlock.vue` extracts code text and
  language, runs Shiki, applies theme-specific CRT shell variables, and renders
  the desktop theme-dot selector.
- `packages/styles/shared-components/_code-block.scss` owns the code block CRT
  surface, language label, theme-dot selector, inline code styling, scanlines,
  and glow.
- `apps/frontend/components/content/BlockRenderer.vue` applies the selected
  theme surface values to inline code.

The code path is readable enough that this spike should improve it in place
rather than introduce a new highlighting architecture.

## Themes

## Settled Decisions

### Theme Semantics

Midnight was retuned with a medium touch. The important correction was not to
make every token blue; it was to preserve the semantic hue scalar while bending
each lane toward the Midnight atmosphere. Variables remain red, references
remain magenta, bindings remain orange-peach, Blueprint fields lean
red-magenta/purple, and Blueprint names/delimiters stay in the bluer lane.

Signal flow keywords were lifted from dim comment-adjacent green to a brighter
terminal green so constructs like `Loop` and `then` read as language syntax.
Midnight and Phosphor were reviewed and accepted as-is for flow constructs.

Theme choice intentionally does not persist to `localStorage`; the selected
theme remains global page state through `useCodeTheme()`.

### Selector UI

The old fixed floating theme selector was removed. The final selector is local
code-block chrome on desktop: a small outside-right vertical rail of theme-color
dots for Midnight, Phosphor, and Signal. At rest, only the active theme dot is
visible. Hovering or focusing the code block reveals all three options. Clicking
any dot changes the syntax theme for all code blocks on the page.

On phone, the selector is hidden. The control was too much visual noise for a
small touch surface and not valuable enough to justify the extra chrome. Mobile
code blocks keep the language label and readable CRT surface only.

### CRT Surface

The CRT pass stayed intentionally restrained. The existing radial glow and
vignette were deepened, each theme gained edge/glass/token-bloom variables, and
a faint secondary pixel-column texture was added. The team explicitly avoided
barrel distortion, chromatic aberration, animated noise, or heavier SVG filters
because code readability is the primary constraint.

## Human QA Outcome

Human visual QA passed on 2026-06-29. The final system was accepted as richer
and more distinctive without becoming goofy or reducing readability.

---

## Non-Goals

- Do not replace Shiki.
- Do not rewrite the Enzo grammar unless token scopes are proven to be the
  blocker.
- Do not add a new global theme framework.
- Do not make code blocks harder to read in pursuit of CRT character.
- Do not turn the selector into a large settings panel.

## Files

- `apps/frontend/utils/syntax-highlighting.ts` — Shiki theme definitions
- `packages/styles/shared-components/_code-block.scss` — code block and selector styling
- `apps/frontend/components/content/blocks/CodeBlock.vue` — selector UI component
- `apps/frontend/composables/useCodeTheme.ts` — global page theme state
