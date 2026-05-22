# Generative Design Brief — Organic Dream

## Branch

- Branch name: `gendes-organic-dream.copilot`
- Baseline branch: `gendes-academia`
- Mood-board folder: `docs/gendes-moodboard/organic-dream/`
- Working title: The Naturalist's Atlas

## Thesis

A portfolio that reads like a private scientific atlas — the work of someone who observes things carefully and annotates what they find. Warm parchment ground, fine hairline rules, scholarly type, and accents that glow like bioluminescent specimens. The site has been catalogued with care. This is not a digital aesthetic: it draws from pre-digital traditions of scientific illustration, chromolithography, anatomical charts, and cosmological diagrams.

The moodboard holds two ground modes in tension: cream/parchment surfaces (spirograph organisms, Thai cosmological diagram, surrealist landscape with glowing orbs) and deep dark atmospheric surfaces (Auzoux neuron chart, orchid wireframe blueprint). The light ground is the primary reading surface. The dark ground appears in selective high-drama contexts: case study hero regions, code blocks, callout/pullquote moments, and footer.

## References

- Ernst Haeckel's *Kunstformen der Natur* — radially symmetric organisms drawn with mathematical precision; fine linework; biological wonder as graphic system
- Auzoux anatomical teaching charts (1940s) — bold educational diagrams on dark ground; luminous saturated color; the chart as a beautiful object
- Thai Buddhist cosmological diagrams — diagrammatic composition; annotated; layered; soft pastel palette; the universe as organized, labeled, understood
- Orchid technical wireframe blueprint image in moodboard — precise grid, glowing organic form, the living thing as engineering document
- Spirograph organism illustration in moodboard — mathematical curves generating lifelike radial forms; cream ground; fine ink
- What to borrow: fine hairline linework, the "specimen card" framing device, diagram annotation language, the macro/micro resonance between cosmic and cellular, two-surface (light/dark) palette system
- What to avoid: anything that looks like a science-fair poster, generic "nature" photography backgrounds, watercolor wash effects, literal plant/leaf motifs, gradients that look like Instagram UI

## Palette

Light surface (primary reading surface):
- Ground: `#F7F3EB` — warm parchment, aged scientific paper
- Ink: `#1A1714` — near-black with warm brown undertone, India ink quality
- Secondary/metadata: `#6B6157` — warm medium brown for captions and labels
- Accent rose: `#C4637A` — dusty rose, spirograph organism pink
- Accent teal: `#5A9A96` — muted botanical teal
- Accent amber: `#C99A45` — illuminated-manuscript gold
- Hairline/rule: `#C8BFB0` — warm tan for fine rules and borders

Dark surface (selective — heroes, code blocks, pullquotes, footer):
- Ground: `#13100D` — near-black with warm undertone, forest floor depth
- On dark: `#F0D4B8` — luminous warm cream
- Glow rose: `#E8768A` — bioluminescent coral
- Glow teal: `#5FC4C0` — electric marine teal
- Glow amber: `#F0C052` — warm luminous amber

Contrast constraints: parchment text (`#1A1714` on `#F7F3EB`) must clear WCAG AA for all body copy. Accents used as text color must be verified against both light and dark grounds before use.

## Typography

Three-voice system replacing the IBM Plex defaults entirely:

- **Cormorant Garamond** — display/headings. Scholarly elegance with extreme thick/thin stroke contrast that mirrors the moodboard's fine linework. Beautiful calligraphic italic. This is the dominant expressive voice; use at large sizes where the contrast is visible. Load: Regular, Italic, SemiBold, SemiBold Italic.
- **Newsreader** — body text and long-form reading. A variable serif designed for immersive reading. Warm and unhurried. Replaces IBM Plex Sans for all body copy.
- **DM Mono** — metadata, annotations, code. The "specimen label" voice. Precise, legible, just enough personality. Replaces IBM Plex Mono.

Scale and rhythm: Cormorant Garamond headings should be large — the extreme contrast only reads at display sizes. `h1` in the 4–6rem range on desktop. Body in Newsreader at ~1.1–1.15rem, leading ~1.75. Generous spacing throughout; this is an atlas, not a dashboard.

Letter-spacing: Cormorant headings — slightly tracked out for display use (~0.02–0.04em). Metadata in DM Mono — normal tracking. Body — no artificial tracking; let the font breathe.

What not to do: don't use Cormorant at body sizes (the contrast collapses), don't mix Newsreader and IBM Plex, don't set headings in DM Mono.

## Surface and Material

- Surface logic: cards are specimen cards — `1px` hairline border in `#C8BFB0` on parchment ground. Clean, precise, catalogued.
- Borders/rules: hairline only (`1px`). No thick borders. Section dividers are `1px` rules in `#C8BFB0`. The fine rule is the primary structural element.
- Texture/noise: no synthetic CSS noise or grain filter. The parchment warmth comes from the palette alone.
- Shadows/depth: minimal. Cards have no box-shadow by default. On hover, a very subtle warm outer glow (radial gradient shimmer, not a drop-shadow). Featured media keeps its existing clip-path transition hooks.
- Media framing: featured images have a very thin hairline border treatment. No heavy frames or matting.

## Layout and Composition

- Homepage: large radial line ornament SVG positioned faintly behind the hero heading. Heading in Cormorant at monumental scale. The page should feel like opening an atlas.
- Cards: specimen card layout — hairline border, small caps DM Mono metadata labels, Cormorant for the card title. On hover: border warms to amber, subtle radial glow appears.
- Article rhythm: wide breathing room. Generous paragraph spacing. Section headings in Cormorant italic create a strong rhythm break. The reading surface should feel like a field notebook.
- Footer/nav: nav uses the dark ground (`#13100D`). SiteNav is minimal as before. Footer stays dark — this is the natural home for the dark-surface treatment.
- Mobile behavior: Cormorant still works at large display sizes on mobile. Tighten spacing but preserve the large heading scale.
- Composition experiments: introduce the SVG decorative vocabulary as section punctuation. Use the callout/annotation line motif on the homepage to label the "selected work" and "latest writing" sections — a small specimen-label flourish.

## SVG Decorative Vocabulary

Three elements, used sparingly. All inline SVG in Vue components.

1. **Radial line ornament** (`OrganicRadial.vue`) — 12–24 thin lines radiating from a center point, like a sea urchin or starburst. Used as hero background element (faint, large) and as section divider punctuation (small).
2. **Orbital ellipse cluster** (`OrganicOrbits.vue`) — two or three nested ellipses at slight angles, like orbital paths or the rings of a specimen slide. For card hover states or atmospheric section backgrounds.
3. **Annotation callout** (`OrganicCallout.vue`) — a small hairline circle with a fine extending line and optional label. The diagram annotation mark of the moodboard. Used on the homepage to create "specimen label" section headings.

## Motion and Interaction

- Page/route motion: keep the existing featured-media transition hooks intact. Do not change the clip-path or data-featured-* attributes. Transition timing tokens stay in `_motion-palette.scss`.
- Hover/touch behavior: cards gain a warm amber border-color transition (200ms) on hover. The radial glow shimmer is a CSS background change, not JS. Featured media hover keeps existing behavior.
- Scroll behavior: no scroll-driven animation on first pass. The composition should be beautiful at rest before motion is added.
- Reduced-motion: all hover transitions respect `prefers-reduced-motion: reduce`. SVG decorative elements are purely static.

## Accessibility and Usability

- Color contrast: `#1A1714` on `#F7F3EB` — confirmed WCAG AA (≈17:1). All accent colors used as text must be tested. Rose `#C4637A` on parchment — borderline; use only at large/bold sizes or purely decoratively.
- Focus states: keep the existing `:focus-visible` outline. Supplement with a warm amber focus ring on interactive elements to match the palette.
- Keyboard behavior: no changes to interactive semantics. Cards are still real links. Buttons are still buttons.
- Link affordances:
- Readability:

## Anti-Goals

Name the cliches, motifs, effects, and directions this branch should avoid.

- Avoid:
- Avoid:
- Avoid:

## Implementation Notes for the Agent

The agent may edit palette files, shared-component recipes, scoped SFC styles, and supporting SFC markup where the visual direction needs it. Preserve the content model, GraphQL query shape, block registry, transition data hooks, static deploy scripts, Docker infrastructure, and CMS schema.

Expected checks:

- `corepack pnpm check`
- SSR review via `corepack pnpm start:frontend` at `http://my-website.localhost`
- Static generation smoke test before a winning branch is merged

## Handoff Summary

When the branch is ready for human review, summarize:

- Main visual decisions:
- Files changed:
- Known compromises:
- Screens or routes that need special QA:
- Whether static generation was smoke-tested:
