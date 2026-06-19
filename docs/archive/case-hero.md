# Case Study Hero — Slip Background Problem

## Status

**Active spike** (promoted from `docs/scratch/` on 2026-06-01, after the gendes-blue.synth → main merge).

**Direction decided (2026-06-10): editorial-split won.** The slip panel is gone; the case-study card is now an editorial-split — halftoned image area on top, cream text plate below. The active front has moved from "what replaces the slip" to "how the Selected Work section composes": the uniform card silhouette reads as a repeating slab, and the current work is a composition/variance pass (see "The composition problem" below). The detail-page hero still needs to be brought in line with the split. The work proceeds one piece at a time with visual-QA checkpoints between them; concrete steps live in the to-do doc (`docs/case-hero.todo.md`). This conceptual doc captures the problem, the explorations, the decisions, and the open philosophical questions.

## Background

The case study card (`apps/frontend/components/navigation/cards/CaseStudyCard.vue`) and the case study detail page (`apps/frontend/pages/case-studies/[slug].vue`) both use a "slip panel" — a near-opaque cream box overlaid on top of the featured image — to hold the title and excerpt. The card is the source of the featured-media card-to-detail transition; the detail page is the landing target.

The same slip-panel vocabulary is also currently reused on the writing detail page (`apps/frontend/pages/writing/[slug].vue`), but writing-side hero treatment is **not** in scope for this spike — it lives in the Latest Writing bento spike (`docs/bento-writing.md`) so the two writing surfaces (homepage section + detail page) can be redesigned coherently together. This spike is strictly the case-study side.

The slip panel exists because the title needs to be **legible against an unknown image**. Case study heroes are photographic and CMS-authored. They can be light, dark, busy, calm, or anything in between. A bare white-text overlay can't guarantee contrast on a light image; a bare dark-text overlay can't guarantee contrast on a dark image. The slip panel solves this by giving the text its own opaque (or near-opaque) background.

The compromise: the slip panel reads as a *hack*. A near-white box plopped over a photograph is the engineering portfolio equivalent of a stock-image PowerPoint slide with a translucent rectangle dropped over the text. It works, but it doesn't feel art-directed. It also conflicts visually with the rest of the Blue Atlas direction, which is about structural panels and document precision — the slip panel reads more like "OS desktop screenshot label."

The transition system (`composables/useFeaturedMediaTransition.ts`, `components/transitions/FeaturedMediaTransitionLayer.vue`) is built around the slip panel's geometry. Any solution we adopt has to either keep a slip-panel-shaped region for the title or rewrite the transition system to point at different geometry. The transitions are working well and shouldn't be the casualty of a slip-panel rework.

## Re-reading the problem

There are two problems hiding in the slip, and conflating them led the original draft astray:

- **Legibility (functional)**: the title must remain readable on any image. WCAG AA contrast must hold.
- **Aesthetic intent**: even a perfectly legible slip can read as apologetic — "we put a box behind the text because we couldn't solve the design." This is the look-and-feel problem.

The aesthetic problem is the leading edge. Legibility is a floor that any solution must clear; aesthetic intent is the actual design move. Refining the slip's translucency or border weight does not address the underlying read; only changing what the composition *does* will.

This reframing matters because it un-couples the slip-as-scrim (functional) from the slip-as-visual-object (aesthetic). If legibility is solved upstream, the slip becomes a purely aesthetic decision — keep it because it's a strong design move, or drop it because it isn't.

## Anchoring constraints

- **Editorial flexibility**: case studies are CMS-authored. The art director (you) controls the image, but each case study has its own image. We cannot assume one image will look like the next.
- **Legibility floor**: title and excerpt must meet WCAG AA contrast (4.5:1 normal, 3:1 large) on top of whatever image is behind them.
- **Aesthetic intent**: the result must read as designed, not as a legibility band-aid. "Looks like a hack" is a failure mode regardless of contrast scores.
- **Volume**: case studies number in the single digits today and will probably never exceed ~20. The cost of curating per-image rules is low.
- **Transitions**: the card-to-detail and detail-to-card featured-media transitions read geometry from `data-featured-*` hooks on cards and details. The transition is part of the site's signature and must not regress.
- **Mobile**: whatever the solution is, it has to work on small viewports where the image and text are both compressed.
- **BTAK rule**: no decorative labels that perform meaning (e.g. "CASE STUDY · 2024" headers). Materials, not labels.

## Candidate Directions — original exploration

Four directions were sketched when this spike was first drafted. They remain a useful conceptual map; the working direction (below) is a synthesis that draws primarily from Option 1.

### Option 1 — Filter-based art direction

Apply a CSS filter and/or overlay to the case study hero image at render time, constraining the visual gamut into a known range. The filter lives in the design system; the editor uploads any image they want and the filter pulls it into the gamut where text legibility is guaranteed.

**Treatments to consider:**

- `filter: grayscale(1) contrast(1.1) brightness(0.7)` — converts every image to high-contrast monochrome. Strong art direction. Borderline-aggressive transformation of the editor's image.
- `mix-blend-mode: multiply` with a periwinkle or near-black tint layer — duotone effect. Holds image identity better than full grayscale. The blend layer can carry the cobalt accent.
- A scrim gradient that fades the lower-left third of the image into a near-black or near-periwinkle solid, with the title placed in that region. Gives the title a *predictable* zone behind it while letting the rest of the image breathe.
- Posterization / threshold filter — turns the image into a poster-style two-tone graphic. Reads as designed artifact rather than photograph.
- **Halftone duotone** — print/registration-style halftone screen rendering the image in two palette tones. The treatment selected in the working synthesis; see below.

**Pros:**

- Title legibility becomes a CSS guarantee, not an editorial concern.
- Art direction is uniform across case studies — they all *look like they belong to the same site*.
- Editorial process stays simple: upload any image, get the right look.
- Filters degrade gracefully — if a browser doesn't support a filter, the image falls back to itself.

**Cons:**

- The filter is a visual signature that has to be *good* on its own merits. A bad filter feels worse than no filter.
- Photographic fidelity is lost. If the case study is *about* a specific design artifact whose color is the point, the filter destroys that information.
- Risk of looking like an Instagram-filter portfolio if the filter is generic; mitigated by picking a filter aligned with the design system's print/diagram vocabulary.
- Mobile performance: filters can be expensive on lower-end devices.

### Option 2 — Gamut restriction (editorial discipline)

Document a rule for case study hero images: "the lower-left third must be dark and visually quiet; the upper-right two-thirds can carry the subject." Treat it as a typography rule — enforced editorially, not technically. Each case study gets a hero image that *already meets the legibility floor* because the art director picked it that way.

This is the cheapest and most honest option. It puts the cost on the editorial side, where humans can make case-by-case judgments. It doesn't require any code change beyond removing the slip panel and replacing it with bare text-on-image.

**Pros:**

- No CSS hack, no JS, no filter. The image *is* the design.
- Photographic fidelity is preserved.
- Honest with the visual language: case study heroes look art-directed because they *are* art-directed.
- Removes the slip panel entirely; the case study card and detail page become simpler.

**Cons:**

- Editorial burden never goes away. Every new case study is an act of curation.
- Current case study image set is admittedly mediocre; the discipline has to be sustained, not just promised.
- Discoverability problem: someone unfamiliar with the rules might upload a non-compliant image.

### Option 3 — Editorial split (image area + text area)

Stop putting text over the image entirely. The case study hero becomes a two-row layout — image above, panel below — and the title/excerpt lives in a clean cream-and-ink band underneath the photograph. The image is allowed to *be* an image; the text is allowed to *be* type.

**Pros:**

- Unconditional legibility. The title never has to fight the image.
- Photographic fidelity 100%.
- Cleanest typographic surface.
- No CSS filters, no editorial gamut rules.

**Cons:**

- Loses the "magazine cover" feel of title-floating-over-photo.
- Requires reworking the transition system. The card and detail pages both need their hero structure changed.
- Less distinctive — looks like most engineering portfolios.
- Reintroduces the boxiness problem (two stacked rectangles).

### Option 4 — Punk-rock label tape

White text with a near-black or near-periwinkle span behind each character, like punk-rock-show flyer typography. The dark span gives unconditional legibility against any image.

Doesn't fit the current Blue Atlas direction. Worth noting because it's the only option that works *over any image* without art-direction cost. If the site ever moves in a more underground/zine direction, this comes back.

## Working Direction (current synthesis)

The synthesis below was developed through a noodling pass after the spike was promoted. It is the current best guess but the gated plan (next section) lets us pivot at each phase if reality disagrees.

### Spine

**A CSS halftone duotone filter** on every case study hero, in Blue Atlas palette tones (signal-blue + cream, or ink + cream — to be tuned). Implemented via pure-CSS halftone (per leanrada's approach at https://leanrada.com/notes/pure-css-halftone/), which has been validated by the author against photographs with small-texture / more-bleed settings.

This is a stronger version of Option 1 because halftone is a **print vocabulary** — registration dots, newspaper rotogravure, screen-printed posters — that belongs with `border-window`, `shadow-hard-low`, and the blueprint-field texture. A duotone halftone in Blue Atlas tones reads unmistakably as part of this design system rather than as a generic filter.

The filter does three jobs at once:

1. **Legibility floor**: every hero image is reduced to a known two-tone gamut, making title-on-image contrast a calculation rather than an assumption.
2. **Brand voice**: case study heroes become unmistakably part of the Blue Atlas system, even with mediocre source images. This is a real practical benefit given the current case study image set is in disrepair.
3. **Transition gesture**: animating halftone density (coarse → fine) on card-to-detail gives the existing featured-media transition a "resolving" gesture rather than just "thing gets bigger." Coarse on card, fine on detail; the image *focuses* as it lands.

### Implications

- **The slip panel becomes purely aesthetic, not functional.** Once the filter handles legibility, there is no need for a scrim behind the title. The first concrete step is to **remove the slip entirely** and see how the composition reads with the title sitting directly on the filtered image.
- **Specimen plate, split layout, and corner-scrim variants are held in reserve** as aesthetic options if title-on-filtered-image turns out to read poorly. They are not legibility fallbacks.
- **No "CASE STUDY · 2024"-style label headers.** That was floated in noodling and is a BTAK violation. If a panel does come back, its materials (`border-window`, `shadow-hard-low`, paper-grid interior) carry the meaning, not a label.

### Frame-breaking — beyond rectangles

The current composition is rectangular and stacked; the working direction wants something more dynamic without sacrificing the editorial honesty that rectangles provide (no info cropping). Two gestures considered, each addressing the "easy frame" complaint:

- **One signature rounded corner** on the hero image — bold but committed; bites into a known image zone that authors learn to compose around (like the iPhone Dynamic Island). The radius can be generous or restrained; both work, each gives a different feel.
- **Body-text overlap** of the photo/page boundary — type rises from the page and crosses the lower edge of the hero, tying article body to hero. Requires the first content block to be default-width (no float, wide, or full). Referenced in the author's older desert-jackalope portfolio (`temp-ref-assets/`).

These can be combined or used independently. **Not committed** — to be reconsidered once the filter is in place and we can see the composition fresh. Working hypothesis is that the rounded-corner move is the case-study-side answer; the body-text-overlap candidate is mentioned here because it came out of the same noodling session, but its actual home is the writing surface (handled in the bento-writing spike).

### What this preserves

- Full case-study image authorship (any image works; filter handles the rest).
- The featured-media transition's geometry contract — the transition can keep pointing at the title region; the title just renders without a panel behind it.
- Magazine-cover energy: title still floats over photo, just over a halftoned photo.

### What this drops

- The slip panel (functional purpose absorbed by the filter).
- Any future "small mono label header" temptation — BTAK.

## Halftone exploration — what we found (2026-06-03)

The halftone direction described above was implemented and explored extensively over multiple iterations. The implementation went all the way to:

- Pure-CSS CMYK process halftone faithful to leanrada's full source recipe (sepia + saturate outer wrapper, four staggered radial-gradient ink planes per pseudo, rotated to 30°/-21° to mimic CMYK plate misregistration, brightness/blur/contrast(1000)/blur threshold chain).
- Separate-K mode with the K plate as a soft continuous-tone shadow layer — a deliberate divergence from leanrada-faithful crisp-K to preserve highlight detail.
- Duotone post-processing via inline SVG `feColorMatrix` + `feComponentTransfer` filters (true luminance-to-tone mapping; both 2-tone duotone and 3-tone tritone forms).
- Chromatic-aberration overlay and duotone-bleed gradient variants.
- A tuned default setting: size 8px (later 11px), bleed 0.45, contrast 1000, sepia 0.35, saturation 1.5, K image brightness 0.8, soft K mode.
- Applied across all three surfaces: case-study detail hero, `CaseStudyCard`, and `FeaturedMediaTransitionLayer` (so the halftone reads consistently through the card-to-detail transition).

Findings worth carrying forward:

**1. Halftone is technically working and visually distinctive, but it does not naturally fit Blue Atlas.** Blue Atlas's register is *structural / specimen / diagram* — engineer-designer-thinks-in-systems, field notebook, diagram surface, specimen plate. Halftone's register is *pop / expressive / vintage print*. They are adjacent print-vocabulary languages but they are not the same. The halftone result reads as "stylized image" rather than as a "designed Blue Atlas artifact." This is a brand-fit issue, not a technique issue.

**2. Halftone does not solve WCAG AA legibility for text-on-image.** The original framing claimed the halftone would constrain the visual gamut and make title-on-image contrast a calculation. In practice — even with duotone post-processing (which DOES properly constrain the output gamut via the SVG filter) — the luminance still varies meaningfully across the image. A navy title placed on a varied photo will pass AA in some regions and miss it in others. Halftone doesn't change this.

**3. There is a structural trade-off the technique cannot resolve.** Halftone's threshold pass produces output that is inherently posterized — the photo's continuous-tone information collapses to a small set of values. "Visual interest" and "highlight detail" come from this posterization. Constraining the gamut further (duotone) eliminates the visual interest. Loosening the contrast threshold restores tonal detail but destroys the halftone aesthetic. There is no parameter set that gives "vibrant halftone aesthetic + continuous-tone detail + WCAG-AA-safe text overlay" simultaneously. Pick at most two.

**4. The halftone work is not wasted.** As an *image styling treatment* applied to an image area that does NOT carry text overlay, the halftone is a legitimate aesthetic move (and an interesting one). The CSS infrastructure in `packages/styles/shared-components/_halftone-image.scss` (box / pane / ink / K-layer mixin family, plus duotone-direct SVG-filter mode) is sound and can be reused in image-only regions where its trade-offs are acceptable.

## Reconsideration — alternative directions on the table

Given the findings above, the spike direction is being reconsidered. Current candidates:

- **Editorial split / alternating bands.** The original Option 3 from the candidate-directions exploration, reframed not as a fallback but as the primary direction. The hero rhythms as alternating full-width image bands and full-width text bands. References: the henry reference site and the project's own `gendes-henry.copilot` branch. This solves legibility unconditionally (text always sits on solid ground), fits Blue Atlas (alternating panels read as specimen plates / diagram surfaces), and **can preserve the halftone work** as the image-band styling. Strongest current candidate.
- **Specimen plate / labeled card.** Close cousin to editorial split: title in a card with `border-window` + `shadow-hard-low` sitting over the image. Less radical than full bands but solves legibility similarly. The spike's original "specimen plate" reserve idea.
- **Abstract giant-halftone with hover/click reveal.** Make the halftone so coarse the image reads as a pattern rather than as a photo at rest; on hover, reveal full color; on click (route transition), animate halftone density toward the detail state. Interesting motion-led direction but it accepts that the resting state of every case-study card is content-illegible, which probably violates basic browsing expectations at scale.
- **Engraving style** (per Cloudfour's CSS blend-modes article: https://cloudfour.com/thinks/the-power-of-css-blend-modes/). Same family as halftone — stylize the image and accept the legibility trade-off. Different texture but same fundamental constraint. Worth testing only if the editorial-split path doesn't pan out.

The current lean is **editorial-split / alternating bands** with halftone preserved as a styling option for the image bands. This pivot is the open work as of the latest spike checkpoint.

## Settings-matrix review — what surfaced (2026-06-04)

A nine-variant settings matrix was captured against two case-study images and reviewed as a comparison document (`temp-ref-assets/hero-comparison.pdf`). The matrix swept mode (direct duotone linear, crisp duotone engraving 2-color, duotone bleed, tritone), tone pair (signal-blue+cream, ink+signal-blue, ink+signal-blue+cream), and title color (ink vs. cream).

What the review surfaced that wasn't on the table when the editorial-split pivot was first written:

**A figure-ground-inversion cluster solves legibility without a layout change.** Variants in the family {crisp engraving, ink + signal-blue + cream pair, ink title} (and its softer linear cousin {direct linear, signal-blue + cream, ink title}) render the illustration as blue ink on cream paper. The title sits in the cream zones, on solid ground, by virtue of the technique inverting figure and ground — not by virtue of a scrim, a panel, or a layout split. This is the same legibility win that motivated editorial-split, achieved at the image-treatment layer instead of the layout layer.

**The "best variant" depends on subject.** The matrix used two images of different visual density. The saturated direct-duotone variants flatter messier subjects (more material to halftone *into*) but read as solid fields on cleaner subjects. The crisp-engraving variants hold up across both — they translate line work cleanly and still flatter denser imagery. This subject-robustness is a real consideration given the existing case-study image set is uneven.

**Tritone variants drift off-brand.** The third tone (rose/magenta ghost) breaks the cobalt discipline Blue Atlas commits to. Not a fit.

**Bleed variants read decorative at rest.** The directional gradient sweep is interesting *as a transition* (an arrival or departure gesture on the FLIP morph) but on a static hero reads as decoration rather than structure. Hold as a transition-motion candidate, not as a resting state.

The decision still open after this review: commit to a figure-ground-inversion variant (image-treatment only, no layout change) **or** commit to editorial-split / alternating bands (layout change, halftone optionally inside the image band). The matrix has been the artifact for that decision; this section captures what it told us so a future reader doesn't have to re-derive it from the PDF.

## Decision — editorial-split wins (2026-06-10)

Direction (A) won. The case-study card is an editorial-split: halftoned image area on top (most of the card's height), cream text plate below carrying title + excerpt, ink text always. The plate provides its own neutral ground, so legibility is unconditional — no figure-ground gymnastics, no scrim. The halftone work is preserved exactly where the durable lessons said it belongs: as image-area styling, where no text overlay is at stake, with variants cycled across cards by seed presets.

Direction (B) — figure-ground inversion — was not chosen. Its findings (the settings matrix, the crisp-engraving family) remain documented above, and those variant settings remain real candidates *for the image-area styling within the split*; legibility just no longer depends on them.

Two card-level additions landed with the split:

- **Ordinal badge.** A zero-padded catalog number (`01`, `02`, …) in signal-blue mono above the title. Judged a little BTAK-ish but not severely — the ordinal carries real editorial meaning (position in the selected-work catalog) rather than performing fake precision. It stays, and the composition work below gives it a bigger job.
- **Hover gesture.** Hovering the text plate drops the duotone filter and fine-grains the halftone — the color-reveal lives on, scoped to the click target.

## The composition problem — uniform slab read (2026-06-10)

With the split in place, a new problem surfaced at the section level: every card has the same silhouette (full-width rectangle, image-above-plate, title left-anchored), so the homepage Selected Work section reads as a uniform repeating slab. Halftone variants and the ordinal badge are content-level variance inside a macro-level constant — the scrolling eye reads silhouettes and negative space first and never gets to them.

### What the henry reference actually teaches

The henry reference site (case-study archive + homepage selected works; see the `gendes-henry.*` branches) was the named reference for richer variance. Two readings matter:

- His title-drift (left / left-center / center / right-center / right) registers because his rows are **light** — type on white, lots of air. Our cards are **heavy** image plates, so title position can't be the first variance carrier; card geometry has to be.
- His row interruptions (thorn bands, collar photo, crown panel) work because they are a different *material* than the rows — and because they're his established personal iconography, not invented filler. Borrow the idea (interruption as material change), not the form.

### Variance axes, ranked

1. **Card silhouette — width + horizontal anchor + height.** The load-bearing axis. Cards stop being uniformly full-bleed: some inset to ~55–75% width anchored at varying stops, some full; heights vary between tall plate and short panoramic band. This changes the negative space, which is what the scrolling eye actually reads. Print-honest: a specimen book doesn't print every plate at the same format.
2. **Caption-plate anchor stops.** The text plate need not span the card — a 40–60% plate anchored at one of ~5 stops under the image reads as a specimen-book caption plate. Editorial-split stays intact (image above, text below, solid ground). Second melody line over the silhouette rhythm.
3. **Margin ordinal.** When a card is inset, the exposed cream beside it gets claimed by the ordinal — oversized, mono, signal-blue, like a figure number in a document gutter. Same true ordinal, scaled as typographic emphasis; it makes the negative space look authored instead of leftover. Also the badge's scale-variance carrier (small in-plate on full-width cards, large in-margin on inset cards).

Supporting voice: **halftone coarseness coupled to card scale** — big full-bleed cards get coarser screens (poster register), inset cards finer (magazine register). This gives the existing variant cycling a *reason*, which is the difference between rhythm and noise.

### Score, not pattern

Strict L/R alternation is a two-stop metronome — the failure mode in different clothes. With single-digit case-study counts the sequence is hand-authored like a phrase: vary both interval (how far the anchor jumps) and amplitude (full vs. inset, tall vs. short); open full, close full, put the irregular moves in the middle. Realistic launch count is ~4 case studies (several inherited decade-old studies will likely be culled); the score must degrade gracefully from 3 to ~8. The Selected Work section is acknowledged to be a *composition* the author curates, not a neutral container.

### CMS authorability

The intended end state is per-case-study authored control from WordPress: an ACF radio for the photo treatment (already under consideration) and a similar control selecting the compositional preset a case study occupies. Prototype hardcoded first — the existing per-index seed-preset provide() pattern in `HomeSelectedWorkSection.vue` is the delivery mechanism — and promote to ACF only after the direction survives visual QA. Same principle as spike controls being dev affordances.

### BTAK discard pile (from the 2026-06-10 brainstorm)

- Crop marks, registration marks, ruler ticks, `FIG.` prefixes — fake-print chrome performing precision the page doesn't have. The bare ordinal is honest; a costume on it would not be.
- Invented divider glyphs — henry's thorns work because they're *his* established iconography; inventing a glyph whose only job is rhythm-breaking is decoration-first.
- Tilt/rotation/scatter — not BTAK strictly, but wrong register; nothing in a blueprint sits at 3°.

### Held, not discarded

- **Interstitial coarse-halftone bands.** A short full-bleed band that is an ultra-coarse (~40–60px screen) halftone detail crop of an adjacent case study's own image — pure dot-field at rest, the work's own material zoomed past legibility. The rejected "abstract giant-halftone" idea finding a legitimate home where legibility isn't required. Honestly flagged: it fails the strict removal test, so it's the most BTAK-adjacent move on the table. Second-pass material, only if the silhouette score alone doesn't break the slab read; the user wants to see it before judging.
- **Ghost repeated-title wallpaper / zine register generally.** Initially discarded as register mismatch, but the user is *not* categorically against the zine register and is willing to produce bespoke editorial imagery where it serves the voice. Standing caveat: most of the user's current visual work is neural-network generated, and the site must not drift into a generic-AI-art look — editorial imagery enters only with a clear idea of what it contributes. Held as an open register question, not a rule.

### Constraints carried into the composition work

- Variance via grid placement and real widths, **not** `transform: translate` — the FLIP transition reads `getBoundingClientRect` truth from the `data-featured-*` hooks, and transforms poison it.
- The text plate stays a single clean rectangle — slip-source geometry must remain a sane box.
- Mobile: horizontal variance mostly compresses away; height/aspect variance and any interstitials carry the rhythm on phones. henry's title-drift dies on mobile too; this is expected, not a failure.

### Revision — bands, not floating plates (2026-06-10)

The first cut of the silhouette score varied **card width** (insets at 56–78% with varying anchors). Built, then vetoed at review for a register reason the axis ranking missed: width variance is *bento's* vocabulary. The bento-writing spike will compose Latest Writing from packed cells of varied size; a Selected Work section made of floating varied-width plates speaks the same grammar, and the two content families blur. The user also named what the henry archive actually does right: it **still reads as bands** — every row strongly horizontal, full-width strata — with the variance carried *inside* the band.

The re-rank: the axes that work inside bands are the ones bento can't use.

1. **Height register** (tall plate / mid plate / short panoramic band) — full-width rows of varying depth read as strata, never as mosaic. Survived from v1 unchanged.
2. **Caption-plate drift** — Axis 2 promoted from "held" to primary. The cream text plate stops spanning the card and becomes a bordered specimen-caption block (`border-window`, `shadow-hard-low`, page cream beside it) docked at one of 5 stops (L / CL / C / CR / R) under the full-width image band. The eye path comes from the plate's x-position, which is the henry homepage move adapted to materials we already own. Bonus: the FLIP transition launches from the plate's real geometry, so the drift carries into the motion.
3. **Counterweight ordinal** (replaces the margin ordinal) — with no side margins, the oversized ordinal's candidate home is the *opposite* end of the plate row from the docked plate. Queued behind QA.

A single inset card stays held as a possible *accent* — one tipped-in plate among bands reads as deliberate interruption, not a grid system — but never as a pattern.

**Second iteration, same day:** the docked caption plate (narrowed, bordered, hard-shadowed, cream beside it) was built and vetoed in browser review — breaking the plate out of the band undercut the slab unity the editorial split had established; it read as floating, not as strata. The settled form, proposed by the user: **both plates stay full-width** — the card is one unbroken band — and only the *text block inside the text plate* drifts between the five stops. This is the purest version of the reference-homepage read (full-width bands, focal text at varying x-positions within the band) and it keeps every structural element band-shaped. The stop mechanism carried over unchanged; it just moved from the plate to the inner text block.

### Register refinement — naturalist's field book (2026-06-10)

Reviewing the flush-stacked bands, the user named the emphasis they want within Blue Atlas: **"less like an engineering notebook and more like a biologist's sketchbook and note-taking book."** Both halves were always in the register ("field notebook, specimen plate, diagram surface") — this chooses the naturalist reading over the engineering one. Two consequences:

- **Interstitial specimen strips promoted from "held" to built.** Under the naturalist reading the coarse-halftone detail crop stops being decoration-adjacent: a dot-field magnification of the case study's own image is *the specimen under the lens* — tissue on a slide. Implemented as `CaseStudyInterstitialStrip.vue`: short bands (one after every second card, never after the last) showing the *next* case study's image at a 44px screen, crisp blue-cream duotone, aria-hidden, non-interactive, rendered inside the preceding card's list item so the list semantics stay clean.
- **The centered-plate occlusion worry mostly dissolves.** The user pointed out the halftoned images are "mostly just color and texture" — low-legibility fields, not subjects with centers. A text plate centered on the image is back on the table as a live candidate (it is the rehabilitated specimen plate: committed materials — `border-window`, hard shadow — rather than an apologetic scrim). Strongest as the *detail-page* hero move, where a single committed placard doesn't create sequence uniformity.

A third candidate from the same conversation is on deck but not bought into: **text home + giant drifting ordinal** ("atlas numerals") — captions consistent and left-anchored on every band, with the oversized signal-blue plate number as the expressive element that drifts, scales, and possibly crops off the band edge. The user is willing to see a try after judging the strips.

### v4 — the center label band (2026-06-10)

Strip review verdict: intentional-looking, but as an interstitial line it's "just another slab" — it didn't break the block rhythm. The user's next proposal synthesizes their earlier centered-plate instinct with the band grammar: **the photo plate fills the card and the text plate slices across its vertical center as a full-width cream label band** — image above, image below, `border-window` top and bottom where the band cuts the image. Nothing floats (the band spans), legibility stays unconditional (solid ground), and the magazine-cover energy returns without the slip panel's apology. The occlusion worry is void per the user: under the halftone the images are "mostly just color and texture." Text drift and height registers carry over; the strips stay on probation inside the new composition.

Typography contract made explicit during this iteration (a v3-era cap had silently broken it): **the card title runs as one unwrapped horizontal line** (phone excepted), and **the excerpt wraps at ~90ch and is allowed to be wide**. The text block sizes to its content.

### Editorial illustration — a tool in the bag (2026-06-10)

The user generated Midjourney test plates in Haeckel-radiolarian and engraved-botanical registers — squarely the naturalist field-book voice. Verdict: editorial illustration is **an available material, not the committed solution**. Conditions: generated plates need editing before use (remove AI-gibberish text, color-correct into signal blue / ink / cream), and the standing guard applies — nothing that reads as generic AI art; bespoke plates enter only with a clear editorial idea. Candidate uses if called on: interstitial material richer than the dot-field strips, section furniture, or detail-page endpapers.

**Refinement, same day: use actual public-domain Haeckel plates** rather than generated imitations — license-clean, period-authentic to the register, and it sidesteps the AI-look concern entirely. Generated plates remain useful as quick mockup stand-ins.

### v5 — varied widths + editorial figures (2026-06-10)

Verdicts from the v4 review reset the board: the center label band isn't working, the dot-field strips aren't adding much, and — decisively — **of everything tried, v1's varied widths "worked best."** The bento-collision veto that killed v1 is downgraded from a blocker to a watch-item, with a differentiator hypothesis: what separates a varied-width *archive page* from a bento grid is the presence of **pasted-in editorial material** between the rows (the henry archive's actual anatomy: varied rows + interspersed graphic blocks).

v5 therefore combines:

1. **The v1 silhouette score** — editorial-split cards at varied widths/anchors/heights, tight-stacked, bookend fulls, phrased inset middle.
2. **Editorial figure rows** (`CaseStudyEditorialFigure.vue`) — bordered illustration plates interrupting the stack at authored points (`FIGURE_PLACEMENTS`): a left-docked partial-width plate and a full-width band in the mockup. Decorative, non-interactive, `role="presentation"` so the case-study list semantics stay clean. Mock material is gitignored temp imagery; the intended material is curated public-domain Haeckel plates color-corrected to the palette.

The text-drift stop machinery from v3/v4 remains available on the card (`--plate-margin-left/right`, unset = home left) but no score currently uses it.

### v7 — the inversion: text-dominant rows, photos as the interruption (2026-06-10)

v6 review verdict, in the user's words: "even if you do fill in these gaps… what do we really have? A series of randomly inserted illustrations — it largely breaks up the row stuff but not in a way that I think is fully distinct from the bento box we have down below." The root insight followed: **the henry archive works because it is all text, with editorial illustrations as the interruption.** Every attempt so far built image-dominated rows and tried to interrupt them with more images — which is why it kept collapsing into slabs or bento. The user's sketch inverts it (verbatim, the decision artifact):

```
photoplate = ##case study number###    Text plate = ---case study number--

#######01######
------01-------
#02#-----02----
----03-----#03#
######04#######
-----------04--
```

Text plates are the section's **steady vertical rhythm**; the case study's **own hero image** is the interrupting editorial material — a full banner band above some rows, an inline plate docked left or right beside others. Text-block alignment (left/right within the plate) adds horizontal rhythm. "By and large the vertical rhythm remains the same while the horizontal rhythm varies."

Consequences:

- **The borrowed Haeckel figures are retired from this section.** The photos themselves take the editorial-illustration role, so no imported material is needed — which also dissolves the figures-vs-clickable ambiguity (every image *is* part of an entry) and the bento-collision question (every row is full width; the section is unambiguously strata). `CaseStudyEditorialFigure.vue` and the temp-image scaffolding stay on disk as unused spike artifacts; public-domain Haeckel plates remain a recorded tool for *other* surfaces.
- **Card grows layout variants** (`banner` / `photo-left` / `photo-right` + `plateAlign`), delivered as props from the list's beat score. Inline photos crop to their text-height row — compositional material, cut to fill, per the v6.2 contract.
- **The v6.3 treatment unification was vetoed** — the user liked the six-preset variety and found a single duotone family "a little overly monochrome." The original cycling seed presets are restored; the palette-vs-variety dial belongs to the user, tuned per preset rather than collapsed by rule.
- Every case study still carries its image in all variants, so the featured-media transition always has a source.

### v6 — shared rows (2026-06-10)

v5 review surfaced that the figure implementation missed the reference anatomy: the henry archive's blocks don't occupy their own rows, they **share rows** with content — docked beside it. v6 makes the list a 12-column grid: card slots are column spans, and a figure placed before an inset card in source order auto-flows into the same row, filling the columns the inset leaves open. The row is genuinely broken into two materials.

Two principles settled in this iteration:

- **Figures blend by material, distinguish by structure.** The figures run the same halftone/duotone treatment as the cards (one register coarser) so everything belongs to one printed world. What says "not clickable" is the *absence of the card's anatomy* — no text plate, no ordinal, no hover response — not a different visual finish. Making figures look "different enough to not click" would re-break the material unity.
- **The ping-pong fallback is pre-agreed and cheap.** If shared rows don't land, simple left/right alternation is one score edit (`MIDDLE_PHRASE` alternating two insets, `FIGURE_PLACEMENTS` emptied). The user named this as the likely landing spot if the composed version keeps failing; nothing in the machinery resists it. A boring solution that satisfies the requirement is an acceptable end state for this spike.

**Durable lesson (fold into `docs/visual-design.md` at spike close): each homepage section needs its own compositional grammar.** The hero is a wordmark composition, Selected Work is horizontal strata, Latest Writing is a bento field. When two sections start speaking the same layout language, the homepage flattens into "sections of cards" regardless of how good each section is alone. Composition variance should be checked against the *neighboring sections'* grammar, not just against the section's own previous state.

## The detail hero — carved plate direction (2026-06-12)

With the homepage Selected Work composition settled (v7), the spike's remaining front is the detail page. Direction decided in conversation; three pitches were considered (carved plate / registration-ghost transition / specimen mount) and synthesized into a phased plan. The governing principle, which resolves the form-vs-function tension the user named: **a box-break must create ground** — every cut into the rectangle has to give the page something usable (the title's home), never just style a corner. A giant single arc defended as drafting vocabulary: a compass arc, singular and committed, not a soft-UI rounded corner.

Decisions:

- **Plate dissolves to ground.** On the homepage, text rides on plates (bordered objects in rows); on the detail page, text sits on the page itself. The carve's cove is page ground flooding into the image's corner; the title lands there with no plate, no border. Legibility is unconditional and the transition story follows: the card's flying cream plate sheds its objectness as it lands (Phase B).
- **The color journey.** Duotone was only ever load-bearing for legibility; once the title sits on carved ground the image owes legibility nothing. So: duotone at browsing distance (homepage) → color through a finer screen on hover (built) → **full color through a generous screen on arrival** (detail hero resting state). Distance = abstraction, arrival = truth. This also closes the old "card vs. detail density" open question: both density and color resolve on arrival.
- **Title only in the cove** — the excerpt did its job on the card.
- **Ghosts: build both, judge with eyes.** Full-treatment trail (Codrops read) and dot-field misregistration ghosts (print-native read) both go in behind a control; profiling comes after seeing, not before.
- **Konami retirement.** At spike close the controls panel goes behind a Konami-code listener as a shipped easter egg instead of being deleted — the backstage panel becomes content.

Phases: **A** — carved hero static composition + rebuilt control panel (landed 2026-06-12; implemented as a page-ground shelf with one explicit elliptical arc carved into the plate's bottom corner). **B** — the morphing arrival (radius/color/density resolve on the FLIP clone; plate-to-ground dissolve; reverse direction is the risk). **C** — transition ghosts, both modes. Each gated.

### Phase A revision — the layered hero (2026-06-12)

A.1 review verdict: **the carve and the mount are both out** — the user's preferred prior experiment was the plainest version ("just a 500px bottom-right radius and that was basically it"). Lesson recorded against the "box-break must create ground" principle: it over-applied. A small committed ornament that admits it's ornament can beat ornament disguised as function; the bare radius works because it's one gesture on an otherwise untouched plate and doesn't need a job.

The replacement direction came as a user sketch that took two read-backs to land (the agent kept adding mechanism — concave carves, text wrapping along the arc — that the sketch never contained). The actual move is **layering**:

- Photo plate at the top, anchored to one side, its outer bottom corner swept by one giant **circular** radius — the plate's own corner, a *curve in*, never a carve out of it.
- The title column is **plain page ground layered over the plate's lower inner region** — a straight, borderless column that ignores the curve entirely. The page rises over the mounted plate (the desert-jackalope overlap, finally landing in-system). The article's opening paragraphs ride in the column.
- Legibility is unconditional (text always on its own ground); the column is the slip-target rectangle for the Phase B plate-to-ground dissolve; the color journey is unchanged.

**Open question, deliberately held at the gate:** the journal-vs-exhibit split. The layered/overlap gesture may ultimately be the *writing* detail hero (journal entry — paper on a desk dipping its head up) with case studies keeping a simpler full-bleed band + corner radius as their formal "exhibit" arrival — or the layered form may simply win the case-study slot too. The user is living with the layered hero on case studies first; both forms are one control away. Whatever wins here, the loser's form is the leading candidate for the writing side (bento-writing spike's territory).

## Durable lessons (carry forward)

These are the things worth preserving when this spike eventually archives, regardless of which direction wins. Candidates for folding into `docs/visual-design.md` at spike close.

**Halftone vs. Blue Atlas register.** Halftone is a print vocabulary adjacent to Blue Atlas but not the same. Blue Atlas reads as *structural / specimen / diagram* — engineer-designer-thinks-in-systems. Halftone reads as *pop / expressive / vintage print*. A halftone treatment used as the dominant register for case-study heroes pulls the page out of Blue Atlas; used as a *texture* within a contained image area, it can sit inside the system. The lesson is about scope of application, not about the technique being good or bad.

**The three-way trade-off.** The halftone technique cannot deliver more than two of the following simultaneously:

1. Vibrant halftone aesthetic (recognizable dot screen, color punch).
2. Continuous-tone detail (highlight nuance, photographic information).
3. WCAG-AA-safe text overlay (gamut tight enough that title contrast is a calculation, not an assumption).

Picking two is fine and produces real, defensible variants. Asking for all three loops indefinitely. Any future "let's add a halftone treatment somewhere" idea should declare which two it wants up front.

**Legibility-floor-via-filter is unreliable.** The original spike framing claimed a CSS halftone filter would constrain the gamut and make title-on-image contrast a calculation. Even with a true SVG-`feColorMatrix` duotone post-pass — which DOES properly constrain the output gamut — the luminance still varies meaningfully across the image. A title placed on a varied photo will pass AA in some regions and miss it in others. **If you need text overlay legibility to be unconditional, solve it with figure-ground (the title sits on a known ground via the technique inverting figure and ground), with layout (the title sits in a separate band), or with a scrim (the original slip). Don't expect a global filter to do it.**

**CSS halftone is sufficient.** The leanrada pure-CSS technique (rotated radial-gradient ink planes per pseudo, brightness/blur/contrast threshold chain) is enough. SVG/WebGL/canvas is not necessary for halftone *rendering*. Inline SVG `feColorMatrix` is appropriate as an optional post-pass for true duotone gamut control — that's a different concern (color-matrix tone mapping, not raster halftone). The `_halftone-image.scss` mixin family is the durable artifact even if no callsite uses it after this spike.

**Soft K vs crisp K.** A divergence from leanrada-faithful that proved useful: the K plate runs `blur() blur()` only (no threshold), so K carries continuous-tone luminance that multiplies with main as soft shading. Crisp CMY halftone on top, soft K underneath, gives highlight detail without losing the dot aesthetic. "No K" (K-mode off) is punchier — useful as a hover-state variant. The trade-off is named explicitly: detail vs. vibrancy.

**Sepia at the outer box is the leanrada softening pass.** Without sepia (or some equivalent saturation drop), the raw CMY threshold output reads pop-art. The sepia + saturate pair desaturates the primary output into "muted printed photo" register. This is structural to the technique, not optional tuning.

**Featured-media transition contract.** The card-to-detail FLIP transition reads geometry from `data-featured-*` attributes on cards and `FeaturedMediaFrame`. These are structural hooks for the transition system and must not be removed during reskins, even when the visual slip panel is gone. The transition can survive any of the directions on the table; what it cannot survive is the geometry hooks disappearing.

**Spike-controls panels are development affordances.** The `[slug].vue` page currently carries a control panel exposing every knob in the matrix. This is a dev artifact for visual QA, not part of the page contract. Whichever direction wins, the controls panel comes out at spike close.

## Open questions

Refreshed 2026-06-10 after the editorial-split decision; earlier phrasings assumed title-on-filtered-image and are superseded.

- **Composition authorship model** — the score is authored, and the user wants it CMS-authorable per case study (ACF radio alongside the photo-treatment control). Open: the exact preset vocabulary the radio offers, and how index-phrased sequencing and per-study choices reconcile when studies are added or removed.
- **Detail-page reconciliation** — the case-study detail hero still renders title-on-halftoned-image and carries the spike controls panel. It needs its own editorial-split pass, and the card-to-detail transition needs re-verifying once both ends are split.
- **Which halftone variants survive** — seed presets currently cycle six variants; the composition work should narrow toward a committed set, possibly coupled to card scale (coarse on full-bleed, fine on inset).
- **Existing case study images** — set is uneven, and several inherited decade-old case studies will likely be removed before launch (~4 realistic). Image upgrade remains separate-but-related work.
- **Static-generation path** — all-CSS, should be fine, but sanity-check the final composition against `static:preview` before spike close.
- **Card and detail halftone density** — same density on both ends, or coarse-card → fine-detail so the transition has something to resolve into? Decide during transition reconciliation.

## Not in scope

- Reworking the featured-media transition motion curves or core mechanics. Still fine.
- Changing the case study content model.
- Card title treatment / case-study composition refresh beyond what these phases require — that lives in `to-do.md` under "Later" as a separate deferred spike.
- **Writing surfaces** — the writing detail hero and the homepage Latest Writing section are out of scope. Both live in the bento-writing spike (`docs/bento-writing.md` once promoted). Filter and frame-breaking patterns established here may be ported there, but those decisions belong to that spike.
- The home page hero (`pages/index.vue`) uses a different composition entirely and is unaffected.

## Related files

- `apps/frontend/components/navigation/cards/CaseStudyCard.vue` — card; source of the transition
- `apps/frontend/components/home/HomeSelectedWorkSection.vue` — Selected Work host; provides per-index halftone seed presets (and the future layout score) to cards
- `apps/frontend/components/navigation/lists/CaseStudyList.vue` — list wrapper the composition rhythm lives in
- `apps/frontend/pages/case-studies/[slug].vue` — detail page; transition target
- `apps/frontend/components/content/FeaturedMediaFrame.vue` — image frame and aspect ratio handling
- `apps/frontend/composables/useFeaturedMediaTransition.ts` — transition logic
- `apps/frontend/components/transitions/FeaturedMediaTransitionLayer.vue` — flying clone during the transition
- `packages/styles/shared-components/_featured-media-overlay.scss` — current slip-surface and slip-title mixins
- `temp-ref-assets/` — desert-jackalope portfolio reference for the body-text overlap idea
