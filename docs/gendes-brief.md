# Generative Design Brief — Desert Jackalope

## Branch

- Branch name: `gendes-desert-jackalope.copilot`
- Baseline branch: `gendes-academia`
- Mood-board folder: `docs/gendes-moodboard/desert-jackalope/`
- Working title: Desert Jackalope

## Thesis

This is the mythic American Southwest direction. Not a palette swap to terracotta — it should feel like a place. The personality is warm, restrained, and slightly folkloric: a studio in the high desert that does serious work and doesn't over-explain itself. The jackalope is the tell — an impossible creature that Westerners insist is real. The site should carry that quality: grounded, specific, and real, but with something just slightly uncanny beneath the surface if you look closely.

The academia baseline was cold, legible, and functional. This direction is warm, tactile, and has a place identity. The goal is not to decorate the same layout with a tan coat — it is to ask compositional questions that the desert landscape poses: wide open space, layered horizontal bands, careful use of a single bold element against a quiet ground, the drama of night against day. The moodboard's line-art branding register (thin strokes, spaced small caps, high white space) and its colorfield landscape register (flat layered planes, sun circle, paper grain) are both real sources. The design should hold both.

## References

- **Desert landscape paintings / layered colorfield** — the flat horizontal band compositions in the moodboard (terracotta hills, blush sky, orange sun/moon circle). Borrow the compositional logic for homepage sections and the value structure for the palette. Do not make the site literal landscape illustration.
- **Artisan branding marks** — ORO circle logo, Grove deli label, Sahara Palms arch illustration, Letter Co. gazelle heraldry. Borrow the typographic restraint (wide-tracked caps, spaced small caps), thin single-stroke line marks, and the high-white-space composure. Do not reproduce the illustration style itself in the UI.
- **Dark navy + gold contrast register** — the crane medallion and deer head mark in the moodboard. Use as the basis for an inverted night/dark surface treatment (footer is the primary candidate). Do not spread it everywhere — it earns its weight as contrast.
- **Paper grain / woodcut texture** — the coyote folk-art print and subtle paper texture in several pieces. Borrow the idea of surface that has slight tooth. Apply as a very subtle noise texture to card surfaces or background. Do not make it heavy or retro-kitschy.
- **Sun/moon circle motif** — recurring compositional element across the board. Use as a decorative structural element: section separator, footer mark, or accent. Do not turn it into a logo.

## Palette

The core value structure is two registers: **warm sand day** and **deep navy night**. Neither register should be used everywhere — their contrast is the point.

- **Ground/background (day):** Warm sand/cream — not cold white, not gray-white. Something in the `#f5ede0`–`#f0e6d2` range. Slight warmth, visible paper quality.
- **Ink/text (day):** Near-black with warm undertone — not pure `#000`. Something like `#1e1812` or `#231c15`. Warm enough to read as ink, not screen cold.
- **Primary accent:** Burnt terracotta / clay red — `#b84c36`–`#c15a3a` range. The dominant chromatic note. Used for accent marks, active states, rule lines, pull elements.
- **Secondary accent:** Ochre/amber — `#c4953a`–`#c99a3a` range. Warm yellow-gold. Used for the night register as the gold, and as a day-register secondary.
- **Muted sage:** Desaturated desert green — `#7a8c6e`–`#849577` range. Used sparingly as a quiet third accent.
- **Cool slate:** Dusty blue-gray — `#6b7c8a`–`#7a8c96` range. The highway-cut-through-the-desert cool note. Used sparingly for a cool counterpoint.
- **Night ground:** Deep navy — `#0e1d2c`–`#111f30` range. The footer and any dark section.
- **Night ink:** Near-white with warm tint — `#f0e8d8` on navy, not cold white.
- **Night accent:** Ochre/gold — same `#c99a3a` value crosses both registers.
- **Contrast constraint:** All text/background pairings must meet WCAG AA (4.5:1 for body, 3:1 for large text). The navy+gold pairing needs special checking — gold on dark navy can fail. Use `#d4a843` or lighter for text-size uses on dark.

## Typography

The moodboard's typographic signal is consistently wide-tracked, restrained, and spacious — space over weight. The academia baseline's IBM Plex Mono Italic heading move was expressive but cold. This direction should feel warm and deliberate.

- **Display/heading voice:** A delicate, optically-refined typeface — something with historical character but not heavy. A refined humanist serif or a delicate transitional serif. Consider `Cormorant Garamond` (Google Fonts, free) or `Playfair Display` as candidates for display headings. Wide tracking in all-caps or small caps for section labels and meta. Do not go heavy or blocky.
- **Body face:** A warm, readable serif or warm humanist sans. If display is serif, body can be a clean sans with warmth — something like `DM Sans`, `Outfit`, or `Lato`. If body is serif, keep it optical-size-appropriate and comfortable at small sizes. IBM Plex Sans can stay if nothing better fits, but try to give it more warmth through line-height and color.
- **Scale and rhythm:** Generous line-height (1.7–1.8 for body). Ample paragraph spacing. The article reading surface should feel unhurried. Heading scale should be quiet but confident — not oversized.
- **Letter-spacing/weight behavior:** Section labels and nav items in wide-tracked small caps or tracked uppercase. Body weight restrained — regular/400 or medium/500, not bold. Accent elements in the terracotta accent.
- **What not to do:** No IBM Plex Mono Italic as the primary heading move. No heavy display type. No tight tracking on headings. No neon or cold-white type on dark surfaces.

## Surface and Material

- **Surface logic:** Day surfaces are warm sand. Night surface is deep navy. Cards have a slightly off-white panel feel against the sand ground — barely differentiated, almost flush. Their identity comes from a thin ruled border, not shadow lift.
- **Borders/rules:** Thin (1px) warm-tinted rules. Terracotta for active/accent lines. Warm gray (sand-adjacent) for structural separators. Avoid cold gray borders entirely.
- **Texture/noise:** Subtle noise grain on card backgrounds and possibly the page ground — film grain quality, not heavy paper. Should register at close inspection but not announce itself. SVG or CSS filter noise approach. Do not make it look retro-designed.
- **Shadows/depth:** Minimal. The day surface is essentially flat. The navy footer creates depth through value contrast, not shadow. If lift is needed on a card hover state, use a very soft warm shadow rather than a cold box-shadow.
- **Media framing:** Near-frameless — let images breathe. Featured media in cards and detail pages should have minimal visible frame. The content-flow grid and the image's own proportions do the structural work.
- **Sun/moon circle:** A thin-stroked circle (terracotta or ochre) used as a decorative structural mark — section separator, footer accent, nav mark. It should appear intentionally, not everywhere.

## Layout and Composition

The moodboard's landscape paintings suggest horizontal layering as a compositional language. The homepage is the strongest place to apply this.

- **Homepage:** Experiment with sections that each have their own slightly differentiated warm ground — not identical backgrounds but close enough that it reads as one surface with layers. Like sand, ochre, then blush — very subtle value shifts. The Selected Work section and the Latest Writing section can each carry a slightly different ground tint. The hero/top region stays route-local markup; it should have the most sky/space — generous white/sand above the main heading.
- **Cards:** Lighter visual weight than the academia baseline. The border IS the card object — a thin ruled rectangle. No heavy shadow. The featured image sits flush or with minimal padding. Card hover: a very gentle opacity or border-color shift; nothing theatrical.
- **Article rhythm:** Wide margins, generous leading. The article surface should feel like reading something printed on good paper. Let headings breathe; use generous whitespace above section headings. The sun/moon circle mark could appear as a decorative section break `---` element in article bodies.
- **Footer/nav:** Footer is the night register — deep navy ground, near-white warm ink, ochre/gold accent links. The sun/moon circle motif belongs here as a decorative mark. `SiteNav` stays minimal and light; it is a small contextual affordance, not a bar.
- **Mobile behavior:** The horizontal layering stays readable on mobile as stacked sections. Cards go to single column. Typography stays generous — do not tighten the scale aggressively on mobile.
- **Composition experiments to attempt:**
  - Horizontal color-band section backgrounds on the homepage (subtle, not garish)
  - Sun/circle motif as a footer or section-separator mark
  - Dark navy footer as a deliberate night contrast
  - Subtle noise grain on card surfaces
  - Wide-tracked small-caps section labels instead of the academia-style plain labels

## Motion and Interaction

The desert doesn't rush. Motion should feel unhurried and inevitable, not snappy or bouncy.

- **Page/route motion:** Keep the existing featured-media card-to-detail transition system intact (it is a mechanism, not a style choice). Fade/slide page transitions should be slow and gentle — longer durations than the academia baseline's defaults.
- **Hover/touch behavior:** Cards: gentle opacity shift or border-color warmth change. No loud scale jumps. No heavy shadow appear. Navigation links: subtle color shift to terracotta. The overall feeling is a warm, quiet acknowledgment rather than a theatrical response.
- **Scroll behavior:** No aggressive scroll-triggered animations. If scroll behavior is added, it should be slow parallax on the homepage landscape-layer sections — very subtle, almost subliminal. Do not implement heavy scroll-jacking.
- **Reduced-motion expectation:** Parallax and any decorative scroll motion must be gated behind `prefers-reduced-motion: no-preference`. The featured-media transition must remain reduced-motion-safe per the existing system.

## Accessibility and Usability

- **Color contrast:** All body text on warm sand ground must meet 4.5:1. Terracotta on sand must be verified — pure terracotta may need to be darkened for text uses. Gold/ochre on navy night surface must be verified for text; use a lighter gold (`#d4a843` or higher) for text-size uses on dark backgrounds.
- **Focus states:** The global `:focus-visible` fallback stays. Component-level focus rings should use the terracotta accent or a warm-tinted outline, not the default browser blue. Must be visible on both sand and navy surfaces.
- **Keyboard behavior:** No changes to interactive semantics. All cards remain real links. Load-more remains a native button. All existing keyboard/accessibility contracts hold.
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
