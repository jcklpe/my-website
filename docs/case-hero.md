# Case Study Hero — Slip Background Problem

## Status

**Active spike** (promoted from `docs/scratch/` on 2026-06-01, after the gendes-blue.synth → main merge).

The "slip panel" is being replaced by a CSS halftone treatment on the case-study hero. The work proceeds one piece at a time with visual-QA checkpoints between them; concrete steps and any phase-shaped intent live in the to-do doc (`docs/case-hero.todo.md`). This conceptual doc captures the problem, the original four-direction exploration, the synthesized working direction, and the open philosophical questions.

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

## Open questions

- **Halftone parameter space** — texture size, bleed, color pair (signal-blue + cream, ink + cream, signal-soft + cream). To be tuned in phase 1 with real images.
- **Title placement on the filtered image** — upper-left, center-left, leave room for body overlap? Resolved during phase 1 visual QA.
- **Filter application strategy** — direct CSS filter on the image element, layered mix-blend-mode overlay, or SVG `<filter>` referenced from CSS. Implementation detail for phase 1; CSS-only is the constraint.
- **Existing case study images** — current set is admittedly mediocre. The halftone may forgive or expose this; image upgrade is separate but related work.
- **Static-generation path** — filters are CSS so should be fine, but the trail/transition work in phase 2 should be sanity-checked against `static:preview`.
- **Card and detail consistency** — do we want the same filter density on card and detail, or visibly different (coarse on card, fine on detail) for the transition to have something to resolve into? Decide during phase 2.

## Not in scope

- Reworking the featured-media transition motion curves or core mechanics. Still fine.
- Changing the case study content model.
- Card title treatment / case-study composition refresh beyond what these phases require — that lives in `to-do.md` under "Later" as a separate deferred spike.
- **Writing surfaces** — the writing detail hero and the homepage Latest Writing section are out of scope. Both live in the bento-writing spike (`docs/bento-writing.md` once promoted). Filter and frame-breaking patterns established here may be ported there, but those decisions belong to that spike.
- The home page hero (`pages/index.vue`) uses a different composition entirely and is unaffected.

## Related files

- `apps/frontend/components/navigation/cards/CaseStudyCard.vue` — card; source of the transition
- `apps/frontend/pages/case-studies/[slug].vue` — detail page; transition target
- `apps/frontend/components/content/FeaturedMediaFrame.vue` — image frame and aspect ratio handling
- `apps/frontend/composables/useFeaturedMediaTransition.ts` — transition logic
- `apps/frontend/components/transitions/FeaturedMediaTransitionLayer.vue` — flying clone during the transition
- `packages/styles/shared-components/_featured-media-overlay.scss` — current slip-surface and slip-title mixins
- `temp-ref-assets/` — desert-jackalope portfolio reference for the body-text overlap idea
