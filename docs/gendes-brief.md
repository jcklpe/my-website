# Generative Design Brief — Organic Dream

This is the handoff brief for the `gendes-organic-dream.cc` design branch. It supersedes the generic template for this branch. The blank template structure is preserved in `git` history and in `docs/gendes.md` if a future branch needs it.

## Branch

- Branch name: `gendes-organic-dream.cc`
- Baseline branch: `gendes-academia`
- Mood-board folder: `docs/gendes-moodboard/organic-dream/`
- Working title: **Organic Dream — The Generative Specimen Plate**

## Thesis

The natural world seen through a dreaming, systematizing eye. Every mood-board image is a *biological specimen* — a flower, a neuron, a shell, a radiolarian, a seedpod — presented through a *formal framework*: a scientific wall chart, a cosmological diagram, a wireframe blueprint, or generative line-math. Organic content, structured presentation. Soft and glowing on one face; precise, annotated, and diagrammatic on the other.

The site becomes a **naturalist's plate of dream-organisms**. Each piece of work is a specimen, drawn with the precision of a printed plate but lit with the glow of a psychedelic reverie. This direction is *true* to the project rather than borrowed, because the work being shown is itself generative design: the linework on the page is literally generative (harmonograph / spirograph curves), so the site illustrates its own method. The reading surface is **pastel dream paper**; a **dark cosmic-jewel register** surfaces only at concentrated set-pieces (hero, footer, featured-media frames) for contrast and drama. The single expressive accent across both registers is an **iridescent glow** — a soft chromatic aura, not a flat brand color.

This is an ambitious branch. It should go well beyond token substitution: a generative SVG linework system, a recomposed specimen-plate card layout, an annotation typographic layer, and an iridescence treatment are all in scope. It should still read as a calm, legible portfolio that someone can actually read long-form articles on.

## References

Mood-board images live in `docs/gendes-moodboard/organic-dream/`.

- **Reference: spirograph/harmonograph botany plate** (`aba0fd0…jpg`)
  - Borrow: fine mathematical line-curves forming symmetrical organisms; the specimen-plate composition (organisms floating, evenly spaced, on warm cream); the soft pink/lilac/sage/red linework.
  - Avoid: literal flower clip-art; density so high it reads as noise.
- **Reference: wireframe orchid blueprint** (`9f6912…jpg`)
  - Borrow: organism-as-mesh-wireframe; crosshair measurement lines, technical annotation text, bracket ticks as an aesthetic layer; iridescent blue/violet/green on dark.
  - Avoid: full sci-fi HUD pastiche; unreadable micro-text used as real content.
- **Reference: Thai Traibhumi cosmology poster** (`670d32…jpg`)
  - Borrow: pale lilac-periwinkle-pink pastel ground; genuine editorial hierarchy and diagram conventions; fine labeled callouts; the sense that a layout is a *map* of something.
  - Avoid: religious/cultural literalism; busy all-over diagramming on every page.
- **Reference: Haeckel-style radiolaria plate** (`f914bc…jpg`)
  - Borrow: dense bilateral/radial symmetry; naturalist specimen-plate framing; muted jewel tones on white.
  - Avoid: Victorian fussiness; ornament for its own sake.
- **Reference: Auzoux/Sougy neuron wall chart** (`f142b8…jpg`)
  - Borrow: bold flat specimen forms labeled A–I on a dark ground; the *plate label* typographic voice; confident mid-century scientific-poster structure.
  - Avoid: high-saturation primary palette; hard graphic flatness that fights the dream softness.
- **Reference: cosmic shells, "Pumpkin"** (`20b4cd…jpg`)
  - Borrow: the dark cosmic-jewel register — deep cobalt/black, gold filigree hairlines, teal accents, radiating dotted lines and stars; objects rendered as celestial bodies.
  - Avoid: tarot/zodiac kitsch; gold everywhere; new-age crystal clip-art.
- **Reference: airbrush dreamscape** (`1fabc9…jpg`)
  - Borrow: glowing chromatic halos (magenta→amber→teal) as the light/depth model; risograph softness; auras instead of hard shadows.
  - Avoid: AI-slop gradient mush; halos on everything.
- **Reference: generative ink wisps** (`81a626…png`)
  - Borrow: the idea of generative fluid linework drifting across a ground; motion as slow drift/bloom.
  - Avoid: chaotic splatter that reads as a glitch.

External touchstones: Ernst Haeckel, *Kunstformen der Natur*; harmonograph and spirograph generative drawing; vintage Auzoux/Sougy pull-down anatomy charts; risograph print halation; holographic/iridescent foil.

## Palette

Two registers sharing one iridescent accent. Source values live in `packages/styles/_color-palette.scss`; expose them as CSS custom properties as the existing palette does. Values below are a committed starting point — tune for AA, don't drift the intent.

**Pastel dream paper — primary reading register**

- Ground/background: warm oyster `#f2efe6` (a touch warmer and dreamier than the baseline `#f7f5ef`); reserve a faint cool-lilac variant for differentiated surfaces.
- Ink/text: deep cosmic indigo-violet `#1b1733` — near-black, but with a cobalt/violet undertone that ties the light register to the dark one. Replaces the baseline navy ink as the house ink.
- Muted/meta: muted violet-gray ~`#565073` (verify AA on the oyster ground for metadata and mono labels).
- Differentiated surface: warmer/cooler oyster `#ece6da`; soft elevated surface stays a near-white veil (`rgba(255,255,255,0.72–0.85)`).
- Soft pastel specimen tints (for linework, faint fills, plate accents): sage, lilac, blush-rose, periwinkle — drawn from the spirograph plate. Decorative; never the carrier of text contrast.

**Dark cosmic jewel — contrast register (set-pieces only)**

- Ground: deep cosmic cobalt-black `#0b0f2b`; secondary panel `#121a40`.
- Filigree/hairline/accent: muted gold `#c9a24b`; teal `#3fb9a8`.
- Text on dark: warm cream `#f2efe6` / oyster tints (must hit AA on the cobalt-black).

**Iridescent accent — the one expressive move, shared across registers**

- A chromatic sweep: teal `#3fb9a8` → periwinkle `#6f8be0` → orchid `#c77dd0` → rose `#ec6f9a` → amber `#f2a35e`.
- Delivered as: blurred glow halos behind specimens/cards on hover/focus; gradient hairline rules; gradient display headings via `background-clip: text`; an iridescent focus-ring accent; faint edge-glow on featured-media frames.
- Iridescence is **decorative only**. It never carries body-text contrast, never encodes meaning by hue alone, and must degrade to a solid AA-compliant color where it would sit under text.

- Image treatment: media sits in frames that can adopt the dark-cosmic register with a soft iridescent edge-glow. Do not recolor or duotone authored photography by default.
- Contrast constraints: WCAG 2.1 AA for body text, metadata/mono labels, and link/action states on the oyster ground and on the cobalt-black ground. Pastel must not become an excuse for washed-out low-contrast text.

## Typography

- Primary body face: **IBM Plex Sans** — kept for long-form readability and continuity. The display face does the expressive work; the body stays calm.
- Heading/display voice: **Fraunces** (variable; Google Fonts, open source). Lean into its `SOFT` and `WONK` axes and high optical-display contrast so headings feel grown, organic, and a little dreamlike — an old-style naturalist serif that flowers at large sizes. This is the ambitious, new move; it replaces IBM Plex Mono Italic as the heading face. Use generous optical sizing at hero scale, restrained `WONK`/`SOFT` in article-body headings so reading rhythm stays quiet.
- Annotation / specimen-label voice: **IBM Plex Mono**, demoted from headings to the diagrammatic layer — plate labels, crosshair callouts, metadata, captions, eyebrows. Uppercase, tracked-out, small. This is what makes the page read like a scientific plate.
- Scale and rhythm: heroes and page titles can carry real display scale in Fraunces; article-body h2/h3/h4 stay close to the existing quiet document rhythm (do not collapse page-heading and article-heading recipes — the baseline rule still holds). Body measure stays readable (~`70ch` / existing `$type-measure-readable`).
- Letter-spacing/weight: Fraunces headings set tight with optical sizing; mono labels tracked out (~0.08–0.14em) and small.
- What not to do: do not set body copy in Fraunces display; do not set article-body headings at hero scale; do not use the mono label voice for running prose.

Mechanism: add Fraunces to the font request in `packages/styles/_type-fonts.scss`; introduce `$font-display` (Fraunces) in `_type-palette.scss` alongside `$font-sans` and `$font-mono`. Keep the font-loading mechanism intact.

## Surface and Material

- Surface logic: pastel paper as the calm ground; cards and work items presented as **specimens** floating on the plate — minimal frame, generous breathing room, a fine mono plate-label, optional corner crosshair ticks. The dark-cosmic register is applied deliberately to whole set-pieces, not sprinkled.
- Borders/rules: hairline rules at sub-pixel-feel weights; some rules carry the iridescent gradient. Section dividers can be **generative SVG harmonograph curves** rather than straight lines.
- Texture/noise: a very faint paper grain on the light ground; an optional subtle iridescent sheen / star-speckle on dark set-pieces. Keep texture quiet and static.
- Shadows/depth: prefer **soft diffuse glow halos** over hard drop-shadows — depth is read as luminous aura (the airbrush model), not as a box shadow.
- Media framing: featured media frames may adopt the dark register with an iridescent edge-glow. **Hard constraint:** the `clip-path` and `data-featured-*` attributes on cards and `FeaturedMediaFrame` are transition mechanism, not decoration — preserve them exactly. Any frame restyle must keep the card-to-detail / detail-to-card transition working.

## Layout and Composition

- Homepage: hero as a **dark cosmic-jewel set-piece** with a generative SVG "organism bloom" (harmonograph linework) and an iridescent Fraunces display heading; Selected Work recomposed as a **specimen plate** — work items as organisms floating on the plate with mono plate-labels and crosshair annotation; Latest Writing as a quieter pastel index; footer in the dark register with gold hairlines.
- Cards: specimen entries — restrained on the page, fine annotation, iridescent glow blooming on hover/focus, gentle lift. Writing and case-study cards stay distinct but belong to one specimen system.
- Article rhythm: keep the `.content-flow` named grid and all block width/alignment semantics intact (normal/wide/full/float-breakout are positional facts, not styling). Quiet pastel reading surface; Fraunces headings at document scale; harmonograph hairline dividers; pullquotes/blockquotes/code/details as variations of one quiet system with soft halo accents.
- Footer/nav: `SiteNav` stays an unobtrusive interior affordance, restyled into the register (mono label feel acceptable). Footer becomes a dark cosmic-jewel surface, differentiated by register rather than only by weight.
- Mobile behavior: the specimen plate reflows to a single column; generative ornaments scale down or simplify; the dark set-pieces stay legible and don't swamp the small viewport. The direction must hold across breakpoints, not just on a wide hero.
- Composition experiments to attempt: generative SVG harmonograph line-bloom in the hero and as section dividers; corner-crosshair annotation system for specimens; iridescent gradient display headings; specimen-plate grid for Selected Work; an annotation/label layer that makes index views read like a plate.

## Motion and Interaction

- Page/route motion: slow bloom and drift; harmonograph linework can **draw on** as a section enters. Keep route transitions coherent with the existing transition system.
- Hover/touch behavior: iridescent halo blooms softly behind a specimen/card; gentle scale/lift. Touch parity — no hover-only affordances.
- Scroll behavior: optional subtle parallax drift of background organisms; keep it gentle and never load-bearing for comprehension.
- Reduced-motion expectation: every bloom, drift, parallax, and draw-on collapses to a static state under `prefers-reduced-motion`; iridescent animation becomes a static gradient. New motion must ship with its reduced-motion fallback in the same change.

## Accessibility and Usability

- Color contrast: body ink, metadata, mono labels, and link/action states meet WCAG 2.1 AA on both the oyster ground and the cobalt-black ground. Iridescence degrades to a solid AA color anywhere it sits under or behind text.
- Focus states: keep the global `:focus-visible` fallback in `_base.scss`; an iridescent focus accent may supplement it but must remain visible against both registers.
- Keyboard behavior: full keyboard operability; specimen cards are real links, load-more a native button, accordions keep `aria-expanded`/`aria-controls`.
- Link affordances: links remain identifiable without relying on hue alone (the iridescent shimmer is supplemental, not the only signal).
- Readability: long-form reading stays the priority; the dark register and decorative linework never intrude on the article reading column.

## Anti-Goals

- Avoid: garish full-spectrum "gamer RGB" iridescence; keep the sweep soft, pearlescent, and tasteful.
- Avoid: AI-slop airbrushed gradient mush spread across every surface; halos are accents, not wallpaper.
- Avoid: new-age / tarot / zodiac / crystal kitsch despite the cosmic register; stay closer to scientific-plate seriousness than to mysticism.
- Avoid: pastel-as-washed-out — low-contrast text is a regression, not a mood.
- Avoid: full dark mode swallowing the whole site; the reading surface stays light.
- Avoid: spirograph/harmonograph ornament so dense it reads as visual noise; restraint and negative space carry the plate.
- Avoid: decorative SVG that secretly carries real content; ornaments are `aria-hidden` and meaning lives in real markup.

## Implementation Notes for the Agent

The agent may edit palette files, `_type-fonts.scss` / `_type-palette.scss`, shared-component recipes, scoped SFC styles, and supporting SFC markup where the direction needs it. Preserve the content model, GraphQL query shape, block registry, transition data hooks (`clip-path`, `data-featured-*`), the `.content-flow` grid and block width/alignment semantics, static deploy scripts, Docker infrastructure, and CMS schema.

Technique notes:

- Iridescence via CSS conic/linear gradients with `background-clip: text`, masks, and blurred glow layers — not images.
- Generative linework as inline SVG (authored or path-generated), `aria-hidden`, with a reduced-motion-safe static state.
- The user reviews visually with `corepack pnpm generate:static:preview` (static preview), not the SSR dev loop — do not depend on Docker container availability for the agent's own checks, and do not worry about container port conflicts.

Expected checks:

- `corepack pnpm check` (editor CSS rebuild + lint + typecheck) — failures are blocking.
- Static generation smoke test before the branch is called a candidate.

## Handoff Summary

Implemented and running. `corepack pnpm check` (editor CSS + lint + typecheck) and a full `corepack pnpm build` both pass clean.

**Main visual decisions**

- Two-register palette, token-driven so it propagates everywhere: oyster dream-paper ground (`#f2efe6`) with deep indigo-violet ink (`#1b1733`); a dark cosmic-jewel register (`#0b0f2b` + gold + cream) reserved for set-pieces. Link/accent is an orchid-violet (`#6d34a8`, 6.75:1 AA). All contrast values were verified before committing.
- Iridescent accent (teal→periwinkle→orchid→rose→amber) delivered as glow halos, gradient hairlines/dividers, and `background-clip:text` display headings. Decorative-only: it never carries body-text contrast, and `iris-text` ships a solid AA fallback. Stops are sub-3:1 on the light ground (so they're used as fills/halos there) and all AA on the dark ground (so clipped display text lives in the dark register).
- Display face is **Fraunces** (variable), with `opsz`/`SOFT`/`WONK` axes cranked for hero/display headings via `--type-heading-variation-display` and kept quiet for article-body headings. IBM Plex Mono is demoted to the **specimen-label** voice (`@mixin specimen-label`) — kickers, eyebrows, meta, plate labels. Body stays IBM Plex Sans.
- New generative component `HarmonographOrnament.vue`: deterministic damped-pendulum (Lissajous) curves stroked with the iridescent gradient, `aria-hidden`, SSR-safe (seeded PRNG, `useId`), draw-on + slow drift gated behind `prefers-reduced-motion`. Used as the homepage hero bloom.
- Homepage hero and footer and the Side-Projects link block recomposed as dark cosmic set-pieces; cards recomposed as floating "specimens" (soft halo at rest → iridescent aura on hover/focus, annotation hairline + label voice). Quote/pullquote/separator article recipes tuned into the register.

**Files changed** — see `git diff --stat`. Tokens: `_color-palette`, `_type-fonts`, `_type-palette`, `_effect-palette`, `_base`, the three context-role files, new `shared-components/_iridescence.scss`, plus `_heading-block`/`_quote-block`/`_pullquote`/`_separator-block` recipes. Components/pages: `index.vue`, the four `Home*` sections, `PostCard`, `CaseStudyCard`, `SiteNav`, `SiteFooter`, `FeaturedMediaFrame`, `CaseStudyLoopNav`, `FeaturedMediaTransitionLayer`, `about.vue`, `side-projects/index.vue`, both detail pages. New `components/ornament/HarmonographOrnament.vue`. Regenerated `editor.css`.

**Transition-system integrity** — the card→detail featured-media transition has three title states (card, flying clone, detail header) plus the loop-nav. All four were moved to Fraunces together so the title doesn't jump mid-flight. `clip-path` and `data-featured-*` hooks are untouched; the CaseStudyCard aura is an inset edge-glow because the card's clip-path would clip an outer shadow.

**Known compromises / watch-items**

- The CaseStudyCard hover aura is an *inset* glow (clip-path constraint), so it reads as an inner ring rather than an outer bloom — intentional, but worth a look.
- Fraunces is a large variable font; first paint before it loads will show the `Times New Roman`/serif fallback. Acceptable, but note it on slow connections.
- Editor preview (`editor.css`) gets Fraunces + heading axes + the iridescent divider var, but not the dark-register/cosmic tokens (article content doesn't use them).

**Screens / routes needing special QA**

- Home desktop + mobile: hero bloom legibility and the iris display heading; the three dark set-pieces (hero, Side-Projects link, footer) against the light sections.
- Card→detail and detail→card transitions on `/case-studies/...` and `/writing/...` — confirm the title font/size lands cleanly.
- Writing/case-study detail article rhythm with the new pullquote (iridescent rules + Fraunces italic) and separator.
- Block QA fixtures: `/writing/block-qa-kitchen-sink-post` and `/case-studies/block-qa-kitchen-sink-case-study`.
- Keyboard focus rings on the dark set-pieces (they re-point `--color-focus` to iridescent orchid for the 3:1 floor), and a `prefers-reduced-motion` pass (ornament + halos go static).

**Static generation** — not executed here (it needs the CMS GraphQL stack and seeded content). The full production `corepack pnpm build` compiled cleanly as an SSR/style smoke test. Run the static smoke test via `corepack pnpm generate:static:preview` during visual QA before calling the branch a candidate.
