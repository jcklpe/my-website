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

## Recurring patterns to evaluate

1. **Section label grammar**: right-aligned inline (Selected Work) vs. boxed panel (Latest Writing) vs. bare heading (Testimonials sidebar). Should these unify?
2. **Full-bleed vs. boxed**: Some sections bleed to viewport edges, some are contained. Is the logic consistent?
3. **Dark panels**: The Testimonials section uses a screen texture background. Should there be a more considered use of dark / inverted panels for visual rhythm on the homepage?
4. **Icon / ornament language**: The crosshair circle decoration on the writing section, the dash rule above the section label in Selected Work, the stripe pattern above testimonial quotes. These are all one-off graphic moments. Worth either leaning into a unified ornament vocabulary or stripping them back to pure typography.
5. **Motion**: The transition system is the most animated part of the site. Everything else is static or very subtle. Is that the right balance?
6. **Textures as section break devices**: The testimonials background uses switchable texture tokens (`--texture-paper-grid`, `--texture-blueprint-field`, `--texture-terminal-scanline`, etc.) from the frontend context-role. In future, these same texture tokens may play a role in article/blog post section breaks — alternating background bands with a different texture to punctuate a long read. Consider this when designing brand voice for long-form content.
