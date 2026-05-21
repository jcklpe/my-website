# Generative Design Brief — Pop Colors

This is the active handoff brief. It replaces the template for the `gendes-pop-color.cc` branch.

## Branch

- Branch name: `gendes-pop-color.cc`
- Baseline branch: `gendes-academia`
- Mood-board folder: `docs/gendes-moodboard/pop-colors/`
- Working title: **Pop Colors / Riso Riot**

## Thesis

The academic baseline says "the work speaks for itself, we don't need color." This branch says the opposite: **color is part of the work, and the person making it is alive, loud, and has taste.** It is joy as a design value.

The mood board is a family of high-chroma, anti-minimalist poster work with shared DNA: saturated spot color sitting fearlessly next to spot color, paired with either a bold flat shape language or a print-shop texture (halftone dots, risograph grain, misregistration). We are deliberately leaning into three of its dialects:

1. **Riso / screenprint maximalism** — dense, layered, overprinted spot inks, halftone, energetic. (The Japanese KISS magazine cover, the Pepsi sticker-bomb, Weltform, COART, Midweek Mayhem.)
2. **Psychedelic / op-art** — vibrating complementary pairs, radial/concentric pattern, ornate. (mano-dharma, Plastics Nomadic Orchestra.)
3. **Neon-on-black** — electric hues glowing on near-black. (In the Name of Art.)

This is explicitly a generative-design **experiment**, not an exercise in good taste or restraint. Be ambitious. Go a little crazy. The interesting design question is not "can a portfolio be colorful" — it is "what happens to a reading-and-browsing product when you push it all the way into poster territory and let different sections live in different worlds." Mix light, dark, and neon **by section** so the homepage reads as a stack of distinct posters rather than one flat theme.

It should still be a working site: real links, focus states, reduced-motion fallbacks, one `h1` per page. But it does not need to be quiet, and it does not need to pass for tasteful.

## References

- Reference: Risograph gig posters / zine print (KISS mag cover, Midweek Mayhem, Summer Salt) — `docs/gendes-moodboard/pop-colors/`
  - What to borrow: overprinted spot-ink palette, halftone dots, slight misregistration, ALL-CAPS poster headlines, dense "spec text" labels in mono.
  - What to avoid: literal paper-texture photoreal scans; we want a *suggestion* of print, done in CSS.
- Reference: Op-art / psychedelic concert posters (mano-dharma, Plastics Nomadic Orchestra)
  - What to borrow: radial/conic ray fields, vibrating complementary color, ornate framing as section dividers.
  - What to avoid: full-bleed seizure-grade vibration behind body text; keep op-art in the chrome, not under reading.
- Reference: Neon-on-black (In the Name of Art)
  - What to borrow: a dark section where type and rules glow in electric hues.
  - What to avoid: skeuomorphic tube-light realism; a flat neon palette with a soft glow is enough.
- Reference: Flat bold vector (Malika Favre pool series, Wild in der Küche) — present in the board, used here as the *discipline* under the maximalism so layouts still resolve.

## Palette

A multi-hue pop kit, not a single accent. Spot inks used as flat fields.

- Ground/background: rotates by section — warm riso cream, electric marigold, tomato, and near-black neon are all valid grounds.
- Ink/text: near-black (slightly violet) on light grounds; near-white on the neon ground. Always derive ink-alpha tokens from the active ink so dividers/borders track the skin.
- Accent behavior: a pop kit — cobalt, hot pink, flame orange, marigold, acid green, electric violet, cyan. Each section may adopt one as its `--accent` for links/borders/hovers (loose color-as-wayfinding). Hovers are color **swaps/inverts**, not fades.
- Image treatment: featured media can take a duotone/overprint tint and a halftone overlay. Placeholders are loud color fields.
- Contrast constraints: keep body copy and metadata legible (dark-on-light, light-on-dark). Decorative chrome (loud-on-loud) is allowed to be aggressive. Do not remove focus-visible rings or break reduced-motion.

## Typography

- Primary body face: IBM Plex Sans (kept — it stays readable under all this).
- Heading voice: a heavy display grotesque (**Bricolage Grotesque**, weights 700–800), upright (not italic), tight tracking, frequently ALL CAPS for page-level heroes and section heads. This is the poster-headline voice.
- Label/meta voice: IBM Plex Mono, ALL CAPS, wide tracking — the "spec text" / kicker role from gig posters.
- Scale and rhythm: page heroes go big and loud. Article-body headings use the display face but stay sized for reading — no 5rem headings inside prose.
- What not to do: do not set body copy in the display face; do not uppercase long-form prose.

## Surface and Material

- Surface logic: sections are poster panels. Each panel owns a skin (paper / marigold / neon / flame) that remaps the semantic color tokens locally, so everything inside inherits the section's world.
- Borders/rules: bold. Heavy solid strokes, not hairlines.
- Texture/noise: a CSS halftone dot field and a subtle riso grain over grounds; conic/radial ray fields for op-art dividers. All pure-CSS so static generation and hydration stay clean.
- Shadows/depth: a hard offset "sticker" shadow (solid color, no blur) as the primary card depth cue, in place of the soft ambient shadow.
- Media framing: thick-bordered frames; optional duotone + halftone on the image.

## Layout and Composition

- Homepage: a stack of differently-skinned poster panels — loud hero, then alternating light/marigold/neon sections, so scrolling feels like flipping through a poster set.
- Cards: poster objects. Flat color field or duotone media, heavy border, hard offset shadow, color-swap on hover. Preserve the `clip-path` + `data-featured-*` transition hooks exactly.
- Article rhythm: the reading column stays a calm measure, but it sits inside a loud framed surface; headings, pullquotes, code, and buttons carry the pop voice.
- Footer/nav: nav is a bold bar; footer is a full neon-on-black panel — the loudest closing note.
- Mobile behavior: panels stack; keep the skins, drop the densest texture if it costs legibility.
- Composition experiments to attempt: halftone/duotone media frames; an op-art ray divider between sections; a neon footer; color-swap card hovers; oversized ALL-CAPS hero.

## Motion and Interaction

- Page/route motion: keep the featured-media transition system intact. A snappy color-block feel is welcome within the existing timing tokens.
- Hover/touch behavior: color inversions and hard-shadow shifts rather than soft fades.
- Scroll behavior: standard; no scroll-jacking.
- Reduced-motion expectation: every new motion has a `prefers-reduced-motion` off-switch.

## Accessibility and Usability

- Color contrast: body text and metadata must stay readable on their section's ground. Loud-on-loud is fine for purely decorative chrome only.
- Focus states: keep the global `:focus-visible` ring; supplement, never remove.
- Keyboard behavior: unchanged — real links, native button for load-more, native disclosure semantics.
- Link affordances: links remain visibly links (highlight/underline swap), not color-only.
- Readability: prose stays at a comfortable measure and line-height.

## Anti-Goals

- Avoid: "Corporate Memphis" blob-people and lazy squiggle confetti.
- Avoid: flat-design genericness with no print-texture soul — the riso grain/halftone is what keeps it from looking like a default template.
- Avoid: gradient-mesh vaporwave as the whole identity (one section can flirt with it; the site is not built on it).
- Avoid: vibration/strobe under body text; keep op-art energy in the chrome.

## Implementation Notes for the Agent

Palette files, shared-component recipes, scoped SFC styles, and supporting SFC markup are all in play. Preserve the content model, GraphQL query shape, block registry, transition data hooks, static deploy scripts, Docker infrastructure, and CMS schema. Keep the shared Sass palette variable names intact so the WordPress editor context-role (`_wp-editor.scss`) keeps compiling.

Architecture note: derive ink/surface alpha tokens from the base `--color-ink` / `--color-surface` via `color-mix`, then implement section worlds as `.skin-*` classes that remap only the base tokens. Components keep consuming `var(--color-…)` and inherit whatever skin they sit in.

Expected checks:

- `corepack pnpm check`
- SSR review via `corepack pnpm start:frontend` at `http://my-website.localhost`
- Static generation smoke test before a winning branch is merged

## Handoff Summary

First implementation pass (agent). Ready for SSR visual review.

**Main visual decisions**

- Token architecture: ink/surface **alpha tokens are now derived** from base `--color-ink` / `--color-surface` via `color-mix`, and the pop accent kit + `--accent` + hard-shadow + print textures are exported from the frontend `:root`. Section worlds are `.skin-paper` / `.skin-marigold` / `.skin-flame` / `.skin-neon` classes that remap only the base tokens; everything inside inherits.
- Palette: warm riso cream default ground, plus a spot-ink kit (cobalt, pink, flame, marigold, acid green, violet, cyan). Neon-on-black ground for the side-projects band and footer.
- Type: headings now ride **Bricolage Grotesque** (700–800, upright, ALL CAPS, tight tracking); body stays IBM Plex Sans; IBM Plex Mono is the kicker/"spec text" label voice.
- Material: pure-CSS riso grain on every ground, opt-in halftone dot field (`.has-halftone`), an op-art ray divider (`.op-divider`), and a hard offset "sticker" shadow as the primary depth cue.
- Homepage reads as a stack of differently-skinned poster panels (cream hero → cream work → marigold testimonials → neon side-projects → flame writing → neon footer).
- Cards are self-contained paper objects (pinned readable ink/surface) with a colored accent cap and a press-into-shadow hover; each card slot rotates its accent for the riso multi-color feel.
- Links became marker-highlights (fill-on-hover); buttons became sticker buttons.

**Files changed**

- Tokens/recipes: `_color-palette.scss`, `_type-fonts.scss`, `_type-palette.scss`, `_effect-palette.scss`, `context-role/_vue-frontend.scss`, `context-role/_wp-editor.scss`, `shared-components/{_link,_button,_heading-block,_pullquote,_featured-media-overlay}.scss`.
- Components/pages: home `index.vue` + all `components/home/*`, `SiteNav`, `SiteFooter` (+ layout `default.vue`), `PostCard`/`CaseStudyCard`/`PostList`/`CaseStudyList`, `CaseStudyLoopNav`, `FeaturedMediaFrame`, and `writing/index`, `writing/[slug]`, `case-studies/[slug]`, `about`, `side-projects`.

**Known compromises**

- Contrast is intentionally aggressive in decorative chrome per the brief; body/metadata kept legible. Not yet audited against WCAG AA across every band — needs a contrast pass before this could be a merge candidate.
- The featured-media transition flying-clone slip border may differ slightly mid-flight from the new solid keyline (cosmetic; the static source/target states match).
- Reduced-motion guards exist on cards/CTAs/route motion; the sticker-button press transform is instant under reduced-motion rather than removed.

**Screens/routes needing special QA**

- Card→detail and detail→detail featured-media transitions (writing + case study) now that titles use the display face.
- The flame Latest Writing band and neon footer/side-projects bands for legibility.
- Block QA fixtures: `/writing/block-qa-kitchen-sink-post` and `/case-studies/block-qa-kitchen-sink-case-study`.

**Static generation:** not yet smoke-tested. `corepack pnpm check` (sass + eslint + nuxt typecheck) passes. All textures are pure CSS/data-URI, so no expected hydration/static hazards, but the static smoke test still needs to run before merge.
