# Case Study Hero — Slip Background Problem

## Status

Open spike. Not blocking — the Blue Atlas direction is merged to main and this is deferred refinement work. The "slip panel" approach is the working interim solution. This doc captures the problem and the three candidate directions so we can dig in deliberately later.

## Background

The case study card (`apps/frontend/components/navigation/cards/CaseStudyCard.vue`) and the case study detail page (`apps/frontend/pages/case-studies/[slug].vue`) both use a "slip panel" — a white or near-white box overlaid on top of the featured image — to hold the title and excerpt. The card is the source of the featured-media card-to-detail transition; the detail page is the landing target. The same vocabulary is reused on the writing detail page (`pages/writing/[slug].vue`).

The slip panel exists because the title needs to be **legible against an unknown image**. Case study heroes are photographic and CMS-authored. They can be light, dark, busy, calm, or anything in between. A bare white-text overlay can't guarantee contrast on a light image; a bare dark-text overlay can't guarantee contrast on a dark image. The slip panel solves this by giving the text its own opaque (or near-opaque) background.

The compromise: the slip panel reads as a *hack*. A white box plopped over a photograph is the engineering portfolio equivalent of a stock-image PowerPoint slide with a translucent rectangle dropped over the text. It works, but it doesn't feel art-directed. It also conflicts visually with the rest of the Blue Atlas direction, which is about structural panels and document precision — the slip panel reads as something more like "OS desktop screenshot label."

The transition system (`composables/useFeaturedMediaTransition.ts`, `components/transitions/FeaturedMediaTransitionLayer.vue`) is built around the slip panel's geometry. Any solution we adopt has to either keep a slip-panel-shaped region for the title or rewrite the transition system to point at different geometry. The transitions are working well and shouldn't be the casualty of a slip-panel rework.

## Anchoring constraints

- **Editorial flexibility**: case studies are CMS-authored. The art director (you) controls the image, but each case study has its own image. We cannot assume one image will look like the next.
- **Legibility floor**: title and excerpt must meet WCAG AA contrast (4.5:1 normal, 3:1 large) on top of whatever image is behind them.
- **Volume**: case studies number in the single digits today and will probably never exceed ~20. The cost of curating per-image rules is low.
- **Transitions**: the card-to-detail and detail-to-card featured-media transitions read geometry from the slip panel. The transition is part of the site's signature and must not regress.
- **Mobile**: whatever the solution is, it has to work on small viewports where the image and text are both compressed.

## Candidate Directions

The three options below are *orthogonal* — they solve the same problem in different planes (technical, editorial, structural). They are also potentially *combinable* — option 2 plus option 1 is reasonable, for example.

### Option 1 — Filter-based art direction

Apply a CSS filter and/or overlay to the case study hero image at render time, constraining the visual gamut into a known range. The filter lives in the design system; the editor uploads any image they want and the filter pulls it into the gamut where text legibility is guaranteed.

**Treatments to consider:**

- `filter: grayscale(1) contrast(1.1) brightness(0.7)` — converts every image to high-contrast monochrome. Strong art direction. Borderline-aggressive transformation of the editor's image.
- `mix-blend-mode: multiply` with a periwinkle or near-black tint layer — duotone effect. Holds image identity better than full grayscale. The blend layer can carry the cobalt accent.
- A scrim gradient that fades the lower-left third of the image into a near-black or near-periwinkle solid, with the title placed in that region. Gives the title a *predictable* zone behind it while letting the rest of the image breathe.
- Posterization / threshold filter — turns the image into a poster-style two-tone graphic. Reads as designed artifact rather than photograph.

**Pros:**

- Title legibility becomes a CSS guarantee, not an editorial concern.
- Art direction is uniform across case studies — they all *look like they belong to the same site*.
- Editorial process stays simple: upload any image, get the right look.
- Filters degrade gracefully — if a browser doesn't support a filter, the image falls back to itself.

**Cons:**

- The filter is a visual signature that has to be *good* on its own merits. A bad filter feels worse than no filter.
- Photographic fidelity is lost. If the case study is *about* a specific design artifact whose color is the point, the filter destroys that information.
- Brand-y; can read as Instagram-filter for portfolios. Risk of looking dated when filter trends move.
- Mobile performance: filters can be expensive on lower-end devices.

**Sketch direction:** if we pursue this, the duotone or two-tone scrim is most aligned with the blueprint vocabulary. Avoid grayscale or "fake film" filters.

### Option 2 — Gamut restriction (editorial discipline)

Document a rule for case study hero images: "the lower-left third must be dark and visually quiet; the upper-right two-thirds can carry the subject." Treat it as a typography rule — enforced editorially, not technically. Each case study gets a hero image that *already meets the legibility floor* because the art director picked it that way.

This is the cheapest and most honest option. It puts the cost on the editorial side, where humans can make case-by-case judgments. It doesn't require any code change beyond removing the slip panel and replacing it with bare text-on-image.

**Process:**

- Write a `docs/case-study-hero-guidelines.md` describing acceptable hero images (compositional rules, dark-zone requirement, contrast minimum, aspect ratio).
- When authoring a new case study, the image is either chosen or art-directed to meet the guidelines.
- If no image meets the guidelines, the case study gets a placeholder or a generated graphic, not a half-broken slip panel over a busy photo.
- A `linter` or QA checklist confirms hero image contrast before publish.

**Pros:**

- No CSS hack, no JS, no filter. The image *is* the design.
- Photographic fidelity is preserved — what the editor uploads is what readers see.
- Honest with the visual language: case study heroes look art-directed because they *are* art-directed.
- Removes the slip panel entirely; the case study card and detail page become simpler.
- Lowest engineering cost; highest editorial cost.

**Cons:**

- Editorial burden never goes away. Every new case study is an act of curation.
- If a future case study has a perfect image that *doesn't* meet the guidelines (e.g. a bright product photo that's intrinsically the artifact), there's no fallback.
- Requires writing and maintaining the guidelines doc, and using it.
- Discoverability problem: someone unfamiliar with the rules might upload a non-compliant image. Needs a process gate.

**Sketch direction:** the working assumption for `gendes-blue2` should be that this is the eventual answer if we don't find a compelling technical solve. It's the option that requires the least *new design* — just discipline.

### Option 3 — Editorial split (image area + text area)

Stop putting text over the image entirely. The case study hero becomes a two-row layout — image above, panel below — and the title/excerpt lives in a clean cream-and-ink band underneath the photograph. The image is allowed to *be* an image; the text is allowed to *be* type.

This is the layout used by most engineering portfolios (e.g. Stripe Press, Pentagram, many WordPress blog templates). It works without art direction and gives the title 100% legibility for free.

**Layout sketch:**

```
+--------------------------------------+
|                                      |
|         featured image               |
|         (full bleed)                 |
|                                      |
+--------------------------------------+
|  KICKER · CASE STUDY                 |
|  Case Study Title                    |
|  Short excerpt or descriptor.        |
+--------------------------------------+
```

The transition system would need to point at the panel below the image rather than a slip panel on top. The card view would also need to be restructured — currently the card is image+title in a single overlapping unit; the new version is image+title in a stacked unit.

**Pros:**

- Unconditional legibility. The title never has to fight the image.
- Photographic fidelity 100%.
- Cleanest typographic surface — works with any of the Blue Atlas vocabulary (panel header, mono labels, periwinkle rule).
- No CSS filters, no editorial gamut rules.

**Cons:**

- Loses the "magazine cover" feel of title-floating-over-photo. That feel is a real design value; it makes case studies feel like artifacts in themselves rather than blog posts about artifacts.
- Requires reworking the transition system. The card and detail pages both need their hero structure changed; the transition geometry has to be re-derived.
- Less distinctive — looks like most engineering portfolios. Risk of "looking like everyone else's site."
- The card view changes shape entirely; the card-to-detail transition becomes a different choreography.

**Sketch direction:** if we go this way, the panel below the image should use the established `panel-header` vocabulary — periwinkle background strip with mono label, then title in display serif, then subtitle. The image above gets the cream-ground breathing room. The transition becomes the image animating in while the panel slides up from below.

### Option 4 (mentioned for completeness) — Punk-rock label tape

White text with a near-black or near-periwinkle span behind each character, like punk-rock-show flyer typography or the title cards on Wes Anderson films. The dark span gives unconditional legibility against any image; the all-caps mono with the tape backing reads as an explicit design move rather than a hack.

Doesn't fit the current Blue Atlas direction (the vocabulary is structural panels, not tape labels). Worth noting because it's the only option that works *over any image* without art-direction cost. If the site ever moves in a more underground/zine direction, this comes back.

## Recommendation (current lean)

**Option 2 (gamut restriction) plus Option 1 (subtle filter as a safety net).**

Reasoning:

- Case studies are few and curated; the editorial burden is reasonable.
- Gamut restriction preserves photographic intent on the images that *do* meet the guidelines.
- A subtle filter (light multiply tint or a corner-scrim gradient) provides a safety net for images that drift from the guidelines without being aggressive enough to feel like an Instagram filter.
- The slip panel can be deleted, simplifying the card and detail templates significantly.
- The transition system can keep pointing at the title region, just now without the white box behind it.

**Option 3 is the conservative answer if Option 2 turns out to be too brittle in practice.** It is also a fine direction in its own right and would suit a calmer/more editorial version of the site.

**Option 1 alone is the most ambitious.** It would mean inventing a filter that becomes a visual signature — something like a duotone treatment that *says* "this is a Blue Atlas case study card." Worth designing if we have the energy and the right filter idea presents itself.

## Open questions

- What does the case study editorial workflow actually look like today? Is the author uploading their own image, or sourcing from a stock catalog? The answer affects how much editorial discipline can realistically be enforced.
- Are there existing case studies with images that *already* violate the legibility floor? If so, fixing them is part of the spike scope.
- Does the static-generated build path need any changes to support filters or new transition geometry?
- Should the case study card and the case study detail share the same hero treatment, or can they diverge? Right now they share; that's been a design constraint but isn't a technical one.
- The writing detail page uses the same slip-panel vocabulary. Does the writing surface need the same solution as the case study surface, or can they diverge? Writing post images may have different editorial constraints (more candid, less art-directed).

## Implementation when picked up

The spike will probably want to:

1. Pick the direction and write a tight one-page spec.
2. Update `apps/frontend/components/navigation/cards/CaseStudyCard.vue` and `apps/frontend/pages/case-studies/[slug].vue` together.
3. Re-derive the featured-media transition geometry: the source on the card and the target on the detail page must be consistent.
4. If Option 1: define the filter as a reusable mixin or CSS custom property under `packages/styles/shared-components/` so it can be applied uniformly.
5. If Option 2: write `docs/case-study-hero-guidelines.md` and reference it from the CMS authoring docs.
6. If Option 3: redesign the card layout (image above, text panel below) and update the transition source/target accordingly. This is the largest of the three.
7. QA across the existing case study set and any block-QA fixture pages.
8. Static generation smoke test.

## Related files

- `apps/frontend/components/navigation/cards/CaseStudyCard.vue` — card; source of the transition
- `apps/frontend/pages/case-studies/[slug].vue` — detail page; transition target
- `apps/frontend/pages/writing/[slug].vue` — same slip-panel vocabulary, may share or diverge
- `apps/frontend/components/content/FeaturedMediaFrame.vue` — image frame and aspect ratio handling
- `apps/frontend/composables/useFeaturedMediaTransition.ts` — transition logic
- `apps/frontend/components/transitions/FeaturedMediaTransitionLayer.vue` — flying clone during the transition
- `packages/styles/shared-components/_featured-media-overlay.scss` — slip-surface and slip-title mixins

## Not in scope

- Reworking the transition timing or motion curves. That's working and stays.
- Changing the case study content model. Title, excerpt, featured image stay; only their presentation changes.
- The writing detail page may or may not adopt the same answer; that's a downstream decision.
- The home page hero (`pages/index.vue`) uses a different composition entirely and is unaffected.
