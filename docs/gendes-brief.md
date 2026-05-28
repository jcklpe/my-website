# Generative Design Brief — `gendes-henry.copilot`

## Branch

- Branch name: `gendes-henry.copilot`
- Baseline branch: `gendes-academia`
- Reference site: https://henry.codes/ (Henry Desroches)
- Working title: "Dispatches from the Design Machine"

## Thesis

This direction treats the portfolio as a publication — specifically an underground editorial dispatch, somewhere between a zine, a tabloid, and a personal journal of practice. The site should feel like something you stumbled upon rather than something handed to you. The running identity conceit is "DISPATCHES FROM THE DESIGN MACHINE," a recurring title that appears in the nav, footer, and section headers, giving the whole site the feeling of a serialized artifact.

The palette goes dark: near-black warm ground with warm cream type, editorial red-orange as the single accent. Typography flips from the soft IBM Plex Mono italic headings of the academia baseline to Bebas Neue for display/editorial headings (large, condensed, ALL CAPS) and IBM Plex Mono as the body face (reinforcing the terminal/dispatch aesthetic). Article detail pages switch to a light paper reading surface, echoing how physical publications use dark covers with light interior pages.

## References

- **henry.codes** — primary reference. The numbered portfolio index, metadata-rich writing cards, season versioning in the nav, editorial section headers, running status strip in the footer, and "letter from the editor" hero framing.
- What to borrow: ALL CAPS editorial labels, numbered case study index `(01)` `(02)`, metadata fields on writing cards (`PUBLISHED`, `READ MORE →`), dark surface with warm cream type, season/version branding in nav, marquee/ticker in footer.
- What to avoid: Direct copying of henry's specific conceits (his "TRUE TERRORS" title, his weather/GPS widget). Translate the spirit rather than the letter.

## Palette

- Ground/background: near-black warm `#0d0c09` — global default surface
- Ink/text: warm cream `#e8e3d0` — global default text on dark
- Muted: warm grey-tan `#7a7364`
- Accent: editorial red-orange `#d44f2b` — replaces the academic blue, used for numbered labels, links, and emphasis
- Paper (article reading surface): warm off-white `#f7f5ef` with near-black ink `#0c112b` — for article detail interiors only
- Contrast: all text/background pairings must meet WCAG AA minimum

## Typography

- Display headings: **Bebas Neue** (Google Fonts, free) — condensed, ALL CAPS, single weight. Used for h1, h2, major section labels, the site identity banner, numbered case study labels.
- Body/UI text: **IBM Plex Mono** — repurposed as the body face. Gives a typewriter/terminal dispatch feel. Used for body prose, nav links, card metadata, captions, and all UI text.
- Code: IBM Plex Mono (unchanged)
- Scale: body size reduced slightly for mono legibility; heading sizes pushed large and bold
- Style: heading style is `normal` (Bebas has no italic); body keeps italic for emphasis
- What not to do: no decorative serif flourishes; no mixing multiple display faces; no lorem ipsum in key editorial positions

## Surface and Material

- Surface logic: dark ground is the default everywhere except article detail body content, which switches to the warm paper surface. The nav stays dark on all pages. The hero sections of detail pages are dark (full-bleed image + overlay). Only the `BlockRenderer` content area switches to paper.
- Borders/rules: use `rgba(cream, 0.18)` on dark surfaces for subtle ruled lines; use `rgba(dark-ink, 0.14)` on paper surfaces. Strong editorial rules (2px red-orange) on numbered card overlays.
- Texture: keep the subtle grid texture from the academia baseline — it reads as barely-visible cream lines on dark, giving a graph-paper dispatch quality.
- Shadows: hardcoded dark shadows (not ink-derived) since ink is now light cream.
- Media framing: full-bleed case study cards keep their image-as-background treatment with an editorial numbered overlay panel.

## Layout and Composition

- Homepage: dark surface throughout. Hero becomes an editorial dispatch header — large "DISPATCHES FROM THE DESIGN MACHINE" display banner, then the CMS title as a large Bebas Neue headline, subtitle as lower-case italic mono paragraph. HomeVitalInfo becomes an "ABOUT THE AUTHOR" section with a CSS marquee label.
- Case study cards: keep full-bleed image layout (transition system requires it) but restyle the overlay panel — replace frosted glass with a solid dark panel with red-orange top border rule, add large `(01)` numbered label in Bebas Neue, title in large Bebas Neue ALL CAPS.
- Writing cards: transform from image-dominant grid cards to editorial horizontal entries — left column has metadata (date), title in Bebas Neue, excerpt; right side keeps the FeaturedMediaFrame as a fixed-size thumbnail.
- Writing archive: dark editorial header, list stacks as editorial index rows rather than a grid.
- Footer: dark surface with a CSS marquee info strip at the top scrolling "DISPATCHES FROM THE DESIGN MACHINE — DESIGN × TECHNOLOGY — FIELD NOTES FROM THE EDGE —"; heading and links resttyled in editorial mono/caps.
- Nav: season branding on left (`✦ SS26`); links as ALL CAPS with arrow decorators.
- Article rhythm: paper surface; Bebas Neue for article headings; IBM Plex Mono for article body.
- Mobile: maintain single-column stacking; marquees should pause under `prefers-reduced-motion`.

## Motion and Interaction

- Keep featured-media card-to-detail transition hooks exactly as-is (clip-path, data attributes)
- Hover on case study cards: image brightness increase, overlay panel border emphasis
- Hover on writing cards: subtle background brightening, read-more arrow nudge
- Marquee: CSS `translateX` loop animation, paused under `prefers-reduced-motion: reduce`
- Page motion: keep existing route fade/slide timing
- No parallax, no cursor effects for this branch

## Accessibility and Usability

- All cream-on-dark text pairings must clear 4.5:1 contrast ratio
- Paper-surface article text must clear 4.5:1 against the warm off-white paper
- Red-orange accent `#d44f2b` on dark `#0d0c09` must be used at large text sizes only (Bebas Neue at display sizes passes contrast at that ratio)
- Focus states: visible focus rings must be preserved; update ring colors to work on dark surfaces (cream outline)
- Link affordances: editorial `READ MORE →` and arrow labels are readable descriptors, not generic "click here"
- Marquees must have `aria-hidden="true"` on the decorative repeated text content

## Anti-Goals

- Avoid reproducing henry's specific conceits verbatim ("TRUE TERRORS", "dear reader" letter text, his GPS/weather widget)
- Avoid making it look like a coding bootcamp dark theme or a VS Code color scheme
- Avoid flat, logo-free, generic dark portfolio look — this should feel editorial and handmade
- Avoid breaking the featured-media transition hooks under any restyle
- Avoid touching CMS schema, GraphQL queries, block registry, or deploy scripts

## Implementation Notes for the Agent

This brief has already been implemented in the `gendes-henry.copilot` branch. The key change centers are:

- `packages/styles/_color-palette.scss` — dark ground, paper surface tokens, red-orange accent
- `packages/styles/_type-palette.scss` — Bebas Neue display font, IBM Plex Mono as body
- `packages/styles/_type-fonts.scss` — Bebas Neue added to Google Fonts import
- `packages/styles/_effect-palette.scss` — dark-surface-aware shadows and borders
- `packages/styles/context-role/_vue-frontend.scss` — paper token exports, `.reading-surface` class
- `apps/frontend/components/navigation/SiteNav.vue` — season branding, ALL CAPS, arrow style
- `apps/frontend/components/navigation/SiteFooter.vue` — marquee strip, dark editorial footer
- `apps/frontend/pages/index.vue` — dispatch banner hero, editorial structure
- `apps/frontend/components/home/` — editorial section headers and HomeVitalInfo author section
- `apps/frontend/components/navigation/cards/` — numbered CaseStudyCard, editorial PostCard
- `apps/frontend/components/navigation/lists/` — CaseStudyList passes index; PostList goes single-column
- `apps/frontend/pages/writing/index.vue` — dark editorial archive header
- `apps/frontend/pages/writing/[slug].vue` — reading-surface on content
- `apps/frontend/pages/case-studies/[slug].vue` — reading-surface on content

## Handoff Summary

When the branch is ready for human review, summarize:

- Main visual decisions:
- Files changed:
- Known compromises:
- Screens or routes that need special QA:
- Whether static generation was smoke-tested:
