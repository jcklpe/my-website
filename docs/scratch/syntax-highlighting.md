# Syntax Highlighting Improvements

Notes for a future refinement pass on the code block syntax themes (Midnight, Phosphor, Signal) and the theme selector UI.

---

## Themes

### Midnight distinctiveness

Midnight currently blends too much with Phosphor and Signal. The orangered used for certain tokens and the magenta-red for references feel neither blue nor distinct — they read as generic rather than "midnight blue." The theme's color should have a clearer cobalt/electric-blue signature distinct from the amber of Phosphor and green of Signal. Specific pain points:
- The orangered token color doesn't read as part of the blue family
- The magenta-red for references is too pink and too orange; should feel more like a cooler reference violet

### Enzo constructs

In the Enzo language theme, constructs like `Loop` and `then` are styled the same color as comments. They should be brighter and higher contrast than comments — same hue family but more opaque/saturated, so they read as language keywords rather than meta-commentary.

---

## Selector UI

The current theme selector (the floating overlay that pops out to the side) is awkward. A cleaner alternative: three small dot buttons adjacent to each code block. Each dot's color signals the theme (midnight blue, phosphor amber, signal green). Clicking any dot changes the syntax theme for the whole page.

Interaction options:
- All three dots always visible next to each code block
- One dot visible; the other two appear on hover of that area
- Dots appear only on hover of the code block itself

The current floating selector is a UI element with too much visual weight for what it does.

---

## Exploratory / Fun

### CRT shader effects

Could code blocks benefit from a subtle CRT/cathode-ray-tube visual filter? Options: CSS `filter` (scanlines via a repeating linear-gradient overlay), SVG `feTurbulence` for screen noise, slight barrel-distortion via `perspective` transform. This risks skeuomorphism overload but could feel characterful given the terminal aesthetic.

Worth prototyping with just CSS `filter` before committing to anything heavier.

---

## Files

- `apps/frontend/utils/syntax-highlighting.ts` — Shiki theme definitions
- `packages/styles/shared-components/_code-block.scss` — code block and selector styling
- `apps/frontend/components/content/blocks/CodeBlock.vue` — selector UI component
