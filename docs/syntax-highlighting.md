# Syntax Highlighting Improvements Spike

## Purpose

Refine the site's code-block language so syntax highlighting feels deliberate,
distinctive, and easier to use without turning code blocks into novelty props.

The site currently has three Shiki-backed visual themes:

- **Midnight** — cobalt/electric-blue terminal world
- **Phosphor** — amber phosphor CRT world
- **Signal** — green terminal/signal world

The broad direction is right: code blocks are one of the site's strongest
editorial surfaces. The next pass should tune the color semantics and selector
UI so the system feels less like three experimental palettes and more like a
small, intentional instrument.

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
  the local theme-dot selector.
- `packages/styles/shared-components/_code-block.scss` owns the code block CRT
  surface, language label, theme-dot selector, inline code styling, scanlines,
  and glow.
- `apps/frontend/components/content/BlockRenderer.vue` applies the selected
  theme surface values to inline code.

The code path is readable enough that this spike should improve it in place
rather than introduce a new highlighting architecture.

## Themes

### Midnight distinctiveness

Midnight currently blends too much with Phosphor and Signal. The orangered used for certain tokens and the magenta-red for references feel neither blue nor distinct — they read as generic rather than "midnight blue." The theme's color should have a clearer cobalt/electric-blue signature distinct from the amber of Phosphor and green of Signal. Specific pain points:
- The orangered token color doesn't read as part of the blue family
- The magenta-red for references is too pink and too orange; should feel more like a cooler reference violet

### Enzo constructs

In the Enzo language theme, constructs like `Loop` and `then` are styled the same color as comments. They should be brighter and higher contrast than comments — same hue family but more opaque/saturated, so they read as language keywords rather than meta-commentary.

Current code note: Signal intentionally maps Enzo control-flow keywords to dim
green structural glue. That makes sense as a theory, but user review says
constructs like `Loop` and `then` should read more like language syntax and less
like commentary. The fix should probably keep them in the Signal hue family but
raise contrast and perceived opacity.

---

## Selector UI

The old theme selector was a fixed floating overlay in the lower-right corner.
It felt like a dev tool and competed with the article.

The active direction is a local dot selector just outside the code block: a
small vertical rail of theme-color buttons for Midnight, Phosphor, and Signal.
At rest, only the active theme dot is visible. Hovering or focusing the code
block reveals all three options. Clicking any dot changes the syntax theme for
the whole page through `useCodeTheme()`.

Taste constraints:

- The selector should be visible enough to discover, but quiet enough to stay
  subordinate to the code itself.
- Dots should communicate theme identity by color: midnight blue, phosphor
  amber, Signal green.
- On phone, the dots sit above/with the code block chrome and keep at least 48px
  touch targets rather than trying to hang off the viewport edge.
- The selector should remain accessible: native buttons or radios, clear labels,
  visible focus, and no color-only accessible name.

---

## Exploratory / Fun

### CRT shader effects

Could code blocks benefit from a subtle CRT/cathode-ray-tube visual filter? Options: CSS `filter` (scanlines via a repeating linear-gradient overlay), SVG `feTurbulence` for screen noise, slight barrel-distortion via `perspective` transform. This risks skeuomorphism overload but could feel characterful given the terminal aesthetic.

Worth prototyping with just CSS `filter` before committing to anything heavier.

Treat this as optional. The existing scanline/glow treatment is already close to
the line between tasteful and too skeuomorphic. Any CRT pass should be subtle,
reduced-motion safe, and easy to remove if it cheapens readability.

---

## Non-Goals

- Do not replace Shiki.
- Do not rewrite the Enzo grammar unless token scopes are proven to be the
  blocker.
- Do not add a new global theme framework.
- Do not make code blocks harder to read in pursuit of CRT character.
- Do not turn the selector into a large settings panel.

## Open Questions

- Should Midnight move away from orange/pink data colors more aggressively, or
  only cool those accents enough to feel less generic?
- Should theme choice persist in local storage, or is per-page `useState`
  enough?
- How much CRT effect is additive before it becomes costume?

---

## Files

- `apps/frontend/utils/syntax-highlighting.ts` — Shiki theme definitions
- `packages/styles/shared-components/_code-block.scss` — code block and selector styling
- `apps/frontend/components/content/blocks/CodeBlock.vue` — selector UI component
- `apps/frontend/composables/useCodeTheme.ts` — global page theme state
