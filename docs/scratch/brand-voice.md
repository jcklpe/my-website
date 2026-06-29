# Brand Voice & Visual Consistency Spike

This doc is for concentrated noodling on overall brand direction and identifying places where the site's voice, visual language, and hierarchy feel unresolved or inconsistent. Best reviewed once the technical foundation is more stable (transitions, baked halftone pipeline, general content fixes).

---

## Where things stand

The site has a clear aesthetic DNA: IBM Plex Mono/Sans, ink-on-cream, brutalist structure, signal blue as the one accent. The design system is consistent at the token level. The inconsistencies are more compositional and tonal — specific sections that don't fully commit to the language, or that feel like placeholder decisions.

---

## Open questions by section

### BLUF Hero (homepage top)

The hero is the first thing anyone sees and it currently reads as a card-within-a-page rather than a definitive opening statement. The black border makes it feel small — more like a content block than a hero.

Questions to noodle on:
- Should the hero be full-bleed (no border, extends to viewport edges), or is the boxed-card treatment intentional (architectural, framed)?
- If full-bleed: what's the relationship between the hero photo and the cream page? Hard edge? Fade? A halftone-dissolution?
- If boxed: does it need a different proportion or weight to feel like a CHOICE rather than an accident? (A much thicker border, a shadow, a different background material?)
- The BLUF ("Bottom Line Up Front") text block inside the hero — is the layout right? Is the typography punchy enough relative to the photo?
- The hero photo treatment (currently halftone) will eventually use the baked pipeline. Does the halftone belong on the hero, or is that a card-only thing?

### Selected Work section

Currently "Selected work" is the section title. The label styling (right-aligned, preceded by a cobalt rule, italic mono) is close to right but feels understated against the big editorial rows below it.

Questions:
- Is the right-alignment + rule approach the right grammar for section labels? The Latest Writing section uses a completely different treatment (left-aligned in a boxed panel). Should these be more consistent?
- Should "Selected Work" read with more weight — full-caps, much bigger, or a fundamentally different graphic device (e.g., a vertical label on the left edge)?

### Testimonials section

The testimonial cards now use thick window borders and hard shadow (matching page card styling). The background texture is an ACF radio in the WP admin — switchable between signal dots, paper grid variants, blueprint field, scanline, and plain.

Questions remaining:
- Does the overall section composition feel right, or does the layout (sticky heading sidebar + card grid) need revisiting?
- Does the sticky heading sidebar work at all viewport sizes, or is it getting in the way on tablet?
- Is the dark `var(--color-surface-screen)` background the right material for this section, or should it be light (cream) with the texture on top?

### About page

*Content and structure has its own spike (`about-page.md`, to be created). Remove from here once that spike exists.*

The about page design can't be properly evaluated until the content exists. Brand-voice questions for here once content is drafted: does the visual language (typography, layout, image treatment) match the register of the writing?

### Navigation

The "is-local" pill nav (shows up on interior pages) feels slightly separate from the site's main design language. The bordered pill with underline links inside it is its own micro-system.

Questions:
- Should the local pill nav look more like the rest of the system, or is its "aside-ness" a feature?
- The Home link in the local nav: removing its border (done in this session) helps. Is there a better way to communicate "you are here / go back home" without the link looking like just another nav item?

### Writing section

The bento-grid layout for writing previews is different from the editorial-row language of Selected Work. This is intentional (different content type, different grammar), but the section label (boxed panel with a crosshair decoration) doesn't fully match either grammar.

Questions:
- Is the bento approach right for the writing section, or should it be a more editorial list?
- The "View writing archive" button — now centered. Does the button style (outline, mono, uppercase) feel right as a CTA, or should it read differently?

### Case study detail pages

The hero treatment + transition into the page is the most considered part of the whole system. Questions for later:
- Once the baked halftone is in place, is the transition between the home card and the detail page hero visually seamless?
- The textual content area (article content) — does the type system feel right for longform reading? The retroterm code blocks, the blockquotes, the image captions — do they form a coherent visual voice?

---

## Reference points

### `temp-ref-assets/footnote-demo.html`

A chatbot-generated annotation pattern demo that's worth keeping as a visual calibration target. Its design DNA is nearly identical to the current Blue Atlas direction — `#f4efe4` warm paper, `#123cff` cobalt blue, IBM Plex Mono throughout, graph paper grid, thin rules — but with more full commitment to the language than the current site achieves. Specific things it does better:

- **Graph paper as page background** (not a texture token on panels only): gives the whole page a material feel, makes the content cards feel like they're sitting *on* something.
- **`h2` headers**: ALL CAPS mono with a `blue-soft` background fill and bottom border. Very distinctive and consistent — every section reads as part of one system.
- **Note markers styled as system elements**: small mono bordered labels (not plain superscript numerals), fills to blue-on-white on hover. Feels like the markers are part of the design, not a browser default.
- **Sage as a secondary accent** (`#9fb7a6`): used for margin note borders. A good complement to cobalt that the current site doesn't have.

This is not a "we should change direction" signal — it's a "we should commit more fully to the direction we already have" signal. Keep as a reference for the brand-voice spike.

---

## Recurring patterns to evaluate

1. **Section label grammar**: right-aligned inline (Selected Work) vs. boxed panel (Latest Writing) vs. bare heading (Testimonials sidebar). Should these unify?
2. **Full-bleed vs. boxed**: Some sections bleed to viewport edges, some are contained. Is the logic consistent?
3. **Dark panels**: The Testimonials section uses a screen texture background. Should there be a more considered use of dark / inverted panels for visual rhythm on the homepage?
4. **Icon / ornament language**: The crosshair circle decoration on the writing section, the dash rule above the section label in Selected Work, the stripe pattern above testimonial quotes. These are all one-off graphic moments. Worth either leaning into a unified ornament vocabulary or stripping them back to pure typography.
5. **Motion**: The transition system is the most animated part of the site. Everything else is static or very subtle. Is that the right balance?
6. **Textures as section break devices**: The testimonials background uses switchable texture tokens (`--texture-paper-grid`, `--texture-blueprint-field`, `--texture-terminal-scanline`, etc.) from the frontend context-role. In future, these same texture tokens may play a role in article/blog post section breaks — alternating background bands with a different texture to punctuate a long read. Consider this when designing brand voice for long-form content.

---

## Items from Misc Pass

### Cream vs White Surface Harmony

There is a perceptible hue/temperature contrast between the cream page surfaces and the brighter white card surfaces. The cream is good — aged paper, warm — but the white reads like printer paper laid on top of it. The overall effect is more "collision of two separate materials" than "considered tonal range."

Goals: either shift the white card surfaces slightly warmer (less cold white, more warm white), or shift the cream to be lighter where it meets white, or find a transition treatment that makes the contrast feel intentional. This is a systemic token-level change — not a single component fix.

Related: the blockquote cream treatment in `content-blocks.md` is a micro instance of this broader harmony question.

### Block Quotes for Longer Quoted Text

Pull quotes work well for short, punchy display quotations — the big typographic treatment is appropriate. Block quotes (for longer passages of quoted text, attribution, etc.) don't currently have a strong visual identity. They read as generic.

This isn't necessarily a size/weight problem — it may be that the material (the cream ground, a subtle left border, a distinct type treatment) needs to differentiate block quotes from regular paragraphs without competing with pull quotes. Worth exploring a restrained "marginalia" feeling for block quotes.

### Homepage Hero — More Dynamic

The homepage hero reads as static. The typography is good but the whole composition feels like it's waiting to animate. After the halftone work and the case study transitions, the hero feels behind.

Directions to explore:
- A slow ambient animation on the hero image itself (subtle parallax, slow zoom, or halftone dissolution effect that breathes)
- A generative element (a slowly-animating SVG, canvas element) as a background layer
- Video or animated image treatment in the hero photo slot
- A more dramatic typography entrance on first load

See `animations.md` for related ambient animation work.

### Home Nav — Scroll-Aware Visibility

The top navigation on the homepage (HOME, WRITING, etc.) is visible immediately on page load. A cleaner entry: hide it on initial load and reveal it only when the user scrolls back up (scroll-up reveal pattern). If complete hide-on-load feels too extreme, a small collapsed state or notch that expands to full nav on hover could bridge it.

The goal is a cleaner, less cluttered first impression. The nav is fully discoverable via normal scroll behavior.
