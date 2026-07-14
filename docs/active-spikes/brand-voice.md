# Brand Voice & Visual Consistency Spike
## Status
Active as of 2026-07-10.

Operational checklist and decision tracking: [brand-voice.todo.md](brand-voice.todo.md).

## Purpose
This doc is for concentrated noodling on overall brand direction and identifying places where the site's voice, visual language, and hierarchy feel unresolved or inconsistent. The technical foundation is now stable enough to make these decisions deliberately: transitions, content blocks, static publishing, and most major CMS/content surfaces have settled.

---

## Where things stand
The site has a clear aesthetic DNA: IBM Plex Mono/Sans, ink-on-cream, brutalist structure, signal blue as the one accent. The design system is consistent at the token level. The inconsistencies are more compositional and tonal — specific sections that don't fully commit to the language, or that feel like placeholder decisions.

---

## Open questions by section
### BLUF Hero (homepage top)
The hero is the first thing anyone sees and it currently reads as a card-within-a-page rather than a definitive opening statement. The black border makes it feel small — more like a content block than a hero.

Audit note 2026-07-10: the current hero is no longer a photo + text hero. It is a framed blueprint-field wordmark panel in `apps/frontend/pages/index.vue`, with the hardcoded "Bottom / Line / Up Front" composition and no current hero photo slot. Treat the photo/halftone questions below as legacy prompts to reframe: the active question is whether the wordmark panel needs stronger page-level presence, an image/material layer, or motion, not how to tune an existing hero photo treatment.

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

Audit note 2026-07-10: the default testimonial section is light/screen material (`var(--color-surface-screen)` plus texture), not a dark panel. The scanline texture option can make it dark-like, but the active source currently reads as a light section with white-ish cards and a sticky heading column.

Questions remaining:
- Does the overall section composition feel right, or does the layout (sticky heading sidebar + card grid) need revisiting?
- Does the sticky heading sidebar work at all viewport sizes, or is it getting in the way on tablet?
- Is the dark `var(--color-surface-screen)` background the right material for this section, or should it be light (cream) with the texture on top?

### About page
The About page has gone through its CMS migration and Now-page follow-through, but brand voice still depends on the public reading experience.

Questions:
- Does the visual language (typography, layout, image treatment) match the register of the writing?
- Are any About-specific changes really brand-voice decisions, or should they become a separate content/page-composition spike if the work gets larger?

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
7. **Mobile composition rhythm**: Phone layouts risk becoming a long stack of
   full-width blocks. Explore whether a light bento/mosaic rhythm can work on
   mobile for selected surfaces without harming readability, target size, or
   left-to-right scan order. This is not a request to make every mobile section
   dense; it is a prompt to find moments where two-up cards, offset rows, or
   small editorial clusters add visual interest the way floated images and dense
   galleries do.

---

## Items from Misc Pass
### Cream vs White Surface Harmony
There is a perceptible hue/temperature contrast between the cream page surfaces and the brighter white card surfaces. The cream is good — aged paper, warm — but the white reads like printer paper laid on top of it. The overall effect is more "collision of two separate materials" than "considered tonal range."

Goals: either shift the white card surfaces slightly warmer (less cold white, more warm white), or shift the cream to be lighter where it meets white, or find a transition treatment that makes the contrast feel intentional. This is a systemic token-level change — not a single component fix.

Discussion direction 2026-07-13: the raised panels should remain deliberately separate lighter sheets laid over the atlas ground, not collapse into the same paper stock. Treat the adjustment as balanced two-sided tuning rather than an asymmetrical correction: make the `#f7f5ef` cream only slightly lighter, make the `#fefefd` raised white a little warmer, and let the two colors meet roughly halfway while remaining visibly distinct. Exact colors remain open for visual comparison.

First implementation candidate 2026-07-13: use `#f8f6f0` for the atlas ground and `#fcfaf5` for raised paper, with the lighter raised-paper variants warmed to the same family. Preserve borders and shadows so the reduced temperature/value gap still reads as deliberate sheet layering.

Human QA revision 2026-07-13: the first raised-paper candidate felt a smidgen too dark. Keep the `#f8f6f0` atlas ground and brighten raised paper one step to `#fdfbf7`, preserving the warm tint and distinct-sheet model.

Final warmth candidate 2026-07-13: move raised paper one minimal step toward cream, from `#fdfbf7` to `#fdfaf6`, without changing the atlas ground or the lighter/translucent surface variants.

Hard shadows should primarily communicate an interactive or genuinely elevated object. The current shadow usage mostly follows that model, so this is an audit rule rather than a call for broad shadow removal. The clearest compositional exception is the homepage BLUF hero: its border and hard shadow make the opening read as a contained card, and the current direction is to explore removing that frame so the wordmark/blueprint composition belongs directly to the page.

First unframed candidate 2026-07-13: remove the BLUF region's background, border, and hard shadow while preserving its existing typography, diagram ornament, dimensions, spacing, clipping, and responsive behavior. Let the homepage atlas ground carry through the hero so this pass tests containment alone before changing desktop composition, mobile composition, or motion.

Human QA revision 2026-07-13: keep the borderless, shadowless integration but restore color through a page-level fading blueprint band rather than a bounded panel. Extend the blueprint material to the homepage gutters behind the upper hero, then fade both its tint and grid into the ordinary atlas ground through the lower hero. Release the hero's visual overflow so the rotated target diagram is not clipped at the top edge.

Homepage rhythm direction 2026-07-13: preserve the compositional divergence between Selected Work strata, Latest Writing bento, Testimonials, and Side Projects. The coherence problem is not that these sections use different grammars; it is that several visually forceful compositions meet without enough neutral atlas ground or optical transition space. Use small, boundary-specific spacing adjustments rather than a shared section wrapper or a uniform global gap.

First breathing-room candidate 2026-07-13: rendered geometry showed 32px between the desktop BLUF hero and Vital Info, 48px between the Selected Work label and its first strata row, and no neutral ground between the pale Testimonials field and dark Side Projects band. Increase only those transitions: 48px between desktop BLUF and Vital Info while retaining 32px on phone, 72px between the Selected Work label and strata, and an atlas-ground pause after Testimonials of 72px desktop / 48px phone. Leave the existing 72–96px transition space at other section boundaries unchanged.

Human QA revision 2026-07-13: the neutral atlas pause between Testimonials and Side Projects fragments the material sequence. Remove it and place the breathing room inside each section instead: enlarge the pale Testimonials field and dark Side Projects field through their own top/bottom padding. Also loosen the case-study text plates themselves, especially the first banner's excerpt; give Latest Writing more space between its banner, bento, and archive link; and make the Latest Writing label sentence-case ink so it belongs to the broader heading voice while its blue rules and crosshair retain the signal register.

Second Human QA revision 2026-07-13: the first revision removed the atlas strip between Testimonials and Side Projects but left Selected Work's 72px trailing atlas padding above Testimonials. Remove that padding so the last case study touches the pale field directly. Increase Testimonials to 128px top/bottom interior space, make Side Projects more bottom-weighted with 128px top and 144px bottom interior space, and increase the intentional atlas transition from Side Projects to Latest Writing to 128px desktop / 96px phone.

Third Human QA revision 2026-07-13: the first banner case-study plate still needs more actual inset, while the inline plates need a looser title/excerpt relationship without taller rows. Increase banner plate padding to 24px top / 32px sides and bottom, and increase the shared desktop title/excerpt gap to 16px while preserving the compact phone override. Remove the meaningless crosshatch ornament from Side Projects entirely; the section should remain quiet until the future Conway's Game of Life background work supplies purposeful visual activity.

Fourth Human QA revision 2026-07-13: increase only the first/banner plate's vertical inset one final small step, from 24px/32px top/bottom to 28px/36px, keeping its 32px side inset and leaving inline row geometry unchanged.

The pale blueprint and screen grounds are best understood as diagram-panel materials, not as a new general surface category. Current examples are the BLUF hero's blueprint field and the Testimonials section's pale screen ground. Their continued use should depend on whether the section genuinely reads as a diagram, instrument, specimen field, or other distinct register; they should not become generic substitutes for warm paper.

Related: the blockquote cream treatment in `content-blocks.md` is a micro instance of this broader harmony question.

### Block Quotes for Longer Quoted Text
Pull quotes work well for short, punchy display quotations — the big typographic treatment is appropriate. Block quotes (for longer passages of quoted text, attribution, etc.) don't currently have a strong visual identity. They read as generic.

This isn't necessarily a size/weight problem — it may be that the material (the cream ground, a subtle left border, a distinct type treatment) needs to differentiate block quotes from regular paragraphs without competing with pull quotes. Worth exploring a restrained "marginalia" feeling for block quotes.

### Homepage Hero — More Dynamic
The homepage hero reads as static. The typography is good but the whole composition feels like it's waiting to animate. After the halftone work and the case study transitions, the hero feels behind.

Current discussion direction 2026-07-13: remove the target/radar glyph. It was more defensible as internal texture in the former framed panel; in the unframed composition it competes with the wordmark and badge without carrying meaning, and its generic technical-diagram register makes the hero feel assembled from decorative motifs. Its removal is an approved subtraction, not a complete solution to the larger composition problem: the wordmark still behaves as a horizontal stack above the page.

The current portrait mock offers a stronger structural direction than another background ornament. A tall image sheet crosses the BLUF/Vital boundary, occupies the right side asymmetrically, and makes the wordmark and Vital Info read as parts of one opening composition. This does center the site's author more strongly and risks an AI-authored impression if the image treatment feels synthetic, so the exact asset and prominence remain open. Treat a portrait as a secondary compositional interruption rather than a full-width hero image.

First implemented portrait candidate 2026-07-14: use the existing blue-and-cream About portrait rather than generating a new asset. On desktop, narrow the wordmark field toward the left, place the portrait as a tall raised sheet on the right, and let the Vital Info sheet overlap its lower-left edge so all three elements form one opening composition. On phone, recompose the wordmark into three large vertical lines, omit the small badge, then stagger the portrait and Vital Info as contained overlapping sheets. Human QA should judge whether the portrait's stronger self-centering feels appropriate, whether the sheet is too visually dominant, whether the desktop overlap reads as one composition rather than three stacked objects, and whether the new phone lockup preserves the intended first-view force. The copied frontend portrait derivative is provisional mock infrastructure; if this direction survives QA, choose a canonical CMS/shared-media source rather than retaining an unexplained duplicate.

Second desktop proportion candidate 2026-07-14: preserve a clean gap between the script wordmark and portrait rather than overlapping the portrait behind “Bottom.” Let the wordmark occupy nearly the full desktop canvas, move “Bottom” and “Line” upward/left within that field, and shift `UP FRONT` left enough to avoid a compositional tangent with the terminal of “Line.” Enlarge and inset the portrait, then move it left far enough for Vital Info to overlap its lower-left edge as an explicit raised-sheet relationship. Reserve additional space below the intro so the larger portrait cannot collide with Selected Work. The pale rectangular halos in the Photoshop assembly are reference-image artifacts, not a visual treatment to reproduce.

Human QA correction 2026-07-14: the second candidate over-interlocked the wordmark and made Vital/portrait overlap the wide-desktop default. Keep “Bottom” at the larger scale, but move “Line” farther left and `UP FRONT` right until the three phrases have deliberate separation. Make Vital Info seven columns wide so it clears the portrait on wide screens and allow overlap only as the viewport contracts. Stack the quick links beneath “More about me” to give the narrower panel useful vertical mass, increase the Line-to-panel gap, and reduce the intro's oversized lower reserve so the already right-aligned Selected Work heading follows the portrait without a large empty field.

Further Human QA correction 2026-07-14: shifting the lower wordmark phrases left did not solve the portrait collision; it clipped the left flourish of “Line” while the final `T` in `UP FRONT` still sat behind the portrait. Keep the lower phrases in-bounds and preserve their relationship, then solve the collision by making the portrait smaller and moving it farther right. Restore Vital Info to an eight-column desktop sheet with the quick links in their right-hand column; the smaller portrait should also reduce the empty field below the panel without making the panel unnecessarily tall.

Selected Work integration refinement 2026-07-14: use the negative field beneath Vital Info and left of the continuing portrait for the section label instead of right-aligning the label beneath the portrait. On desktop, constrain the label to a left-side region, left-align the words, and retain the short rule on the region's far edge so the label bridges the intro and strata without moving the case-study cards themselves. Preserve the existing compact right-aligned treatment on phone, where the portrait is in flow and does not create the same side field.

Selected Work vertical correction 2026-07-14: horizontal realignment alone left the old intro portrait reserve and section top padding stacked together, so the label still landed beneath the available field. Remove the intro's obsolete lower reserve and reduce the section's top padding one step, allowing the label to sit beneath Vital Info and alongside the lower portrait. The label's own height and bottom margin continue to hold the full-width case-study strata below the portrait.

Reaction diffusion is a separate ambient-motion option, already present in scratch intake. A restrained, branded field could replace generic diagram decoration and make the opening feel alive, but animation alone does not break the horizontal stack: a moving rectangular background remains a rectangle. Evaluate portrait/artifact integration and reaction diffusion separately first. If reaction diffusion advances, use a deterministic low-resolution field, restrained ink/blue values, offscreen pausing, a static reduced-motion state, and conservative mobile cost; do not combine it at equal visual strength with a portrait in the first experiment.

Reaction-diffusion composition refinement 2026-07-13: a tall reaction-diffusion specimen sheet can do the same structural work as the portrait mock if it occupies the right side, crosses the BLUF/Vital boundary, and remains a foreground compositional object rather than a hero-wide background. This is a viable portrait alternative: it avoids centering the author while supplying asymmetry, vertical continuity, purposeful motion, and an authored technical-organic register. The frame itself should remain quiet so the evolving field is the object; do not add diagram ornaments around it. Compare a static reaction-diffusion frame first, then animate it without changing geometry. Pause the simulation during featured-media route transitions so ambient GPU/paint work cannot compete with the transition system.

Human QA also reports that the existing featured-media transitions still feel janky. Treat this as a motion audit rather than trying to mask it with ambient hero movement. Identify the affected route type, direction, cache state, and visible failure before tuning timing or adding new animation.

Source audit refinement 2026-07-13: the reported problem sounds like subtle frame stutter rather than choreography. The transition currently animates `width` and `height` on the flying media frame and text plate, while the title also animates width, height, font size, line height, letter spacing, and transform. Case-study flights additionally carry layered halftone/filter rendering. These are plausible layout, paint, and rasterization costs despite `will-change`. Performance tracing should distinguish main-thread layout/paint pressure from GPU raster/compositing pressure, compare plain writing flights against halftone case-study flights, and test a transform-first/FLIP geometry prototype before changing timing.

Responsive direction 2026-07-13: the desktop BLUF lockup should not merely shrink on phone. Mobile needs an alternate, more vertical arrangement that preserves the same "big, bold, up front" first-view impact. Treat this as responsive recomposition rather than responsive shrinking: reorganize the display typography and diagram material into a tall phone composition.

Responsive composition refinement 2026-07-14: use three intentional lockups. Wide desktop keeps the approved horizontal composition. Tablet and narrow desktop use a taller wordmark stage with “Bottom” above, “Line” in the left middle, and a single `UP FRONT` in the lower-right; Vital Info and the portrait then share a normal grid row, with a controlled one-column overlap and no absolute-height reserve. Phone keeps the existing three-line vertical wordmark and staggered in-flow sheets. This intermediate mode should cover `768–1199px`, where the wide desktop geometry becomes crowded but the phone stack would surrender too much compositional force.

Directions to explore:
- A slow ambient animation on the hero image itself (subtle parallax, slow zoom, or halftone dissolution effect that breathes)
- A generative element (a slowly-animating SVG, canvas element) as a background layer
- Video or animated image treatment in the hero photo slot
- A more dramatic typography entrance on first load

See `animations.md` for related ambient animation work.

### Home Nav — Scroll-Aware Visibility
The top navigation on the homepage (HOME, WRITING, etc.) is visible immediately on page load. A cleaner entry: hide it on initial load and reveal it only when the user scrolls back up (scroll-up reveal pattern). If complete hide-on-load feels too extreme, a small collapsed state or notch that expands to full nav on hover could bridge it.

The goal is a cleaner, less cluttered first impression. The nav is fully discoverable via normal scroll behavior.

Audit note 2026-07-10: this item appears stale. `layouts/default.vue` suppresses `SiteNav` on the homepage, and `index.vue` does not render a replacement top nav. Do not implement homepage nav hide/reveal unless a new homepage nav surface is reintroduced deliberately.

### Browser Chrome And Micro-Visual Polish
Several small browser-adjacent surfaces still read as defaults rather than Blue Atlas:

- **Text selection / highlighted text**: needs a brand-voice-compliant selection color. Likely signal-blue or signal-blue wash with ink/cream foreground, but verify contrast and legibility in long prose.
- **Mobile browser theme color**: add/update the relevant meta color (`theme-color`) so mobile address/status bars harmonize with the cream/signal-blue system.
- **Scrollbars**: consider branded scrollbar styling for browsers that support it. Keep it subtle and accessible; avoid making scrollbars harder to see or grab.
- **Mouse cursors**: possibly customize cursors for highly specific interactive affordances, but treat this cautiously. Custom cursors can become gimmicky quickly and should not replace semantic pointer/focus feedback.

These are polish items, not launch blockers. They belong together because they tune the perceived material of the site around the actual content surfaces.

### Editorial Block Material Follow-Ups
- Pullquotes should keep or gain enough actual cream ground to remain readable if they ever overlap imagery or other complex surfaces.
- Video/embed captions should use the same shared figure-caption styling as established image/table/audio/gallery captions.
