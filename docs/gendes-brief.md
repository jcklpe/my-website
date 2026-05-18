# Generative Design Brief — gendes-blue1.1

## Branch

- Branch name: `gendes-blue1.1`
- Baseline branch: `gendes-academia`
- Mood-board folder: `docs/gendes-moodboard/gendes-blue1.1/`
- Working title: Blueprint Brutalism

## Thesis

This direction treats the portfolio as a live systems interface — something between a technical dashboard and a blueprint print run. The site should read as a designed artifact from an engineer-designer who thinks in systems: structured, legible, precise, with cobalt blue as a structural color rather than a decorative accent. Every section is a panel. Every label is a system callout. The grid is always present, even when invisible.

The goal is not pastiche tech-company design or generic dark-mode brutalism. It is closer to an engineering drawing that has been inhabited by real editorial content — a site that would feel at home between a hardware product page and a systems architecture document, but that still has warmth from the cream ground and confidence from the bold display typography.

## References

- **Signal Garden** (`docs/gendes-moodboard/gendes-blue1.1/prime-example.png`) — the primary visual reference. The full-page layout, panel vocabulary, ALL CAPS monospace nav and section headers, cobalt blue structural color, and graph-paper grid texture are all direct sources.
  - What to borrow: panel-as-module grid layout, cobalt blue panel headers/borders, monospace ALL CAPS for UI labels and section titles, graph-paper grid as a feature texture, terminal aesthetic for code/data content, bold upright display headlines contrasting with functional label type
  - What to avoid: literal dashboard widgets or live-data readout gimmickry, the specific "Signal Garden" branding elements, making the site feel like a product rather than a portfolio

## Palette

- **Ground/background**: Warm off-white — close to `#F5F3EE` or a light cream. Not pure white. The warmth keeps it from reading as clinical.
- **Ink/text**: Near-black — very dark navy or near-neutral (`#1A1A1A`–`#111827` range). High contrast against the cream ground.
- **Accent behavior**: Cobalt blue is structural, not decorative. Use it for panel header backgrounds, section borders/rules, active nav states, highlighted labels, and diagram/grid overlays. The reference uses something close to `#2563EB` or `#1D4ED8` — a clear, saturated engineering blue. It should feel like it is holding the layout together, not highlighting individual words.
- **Image treatment**: Unaltered. No filters. Featured media sits as a fact inside a thin-bordered panel frame.
- **Contrast constraints**: All text on cream must meet WCAG AA. Blue panel headers with white or near-black text must meet AA. Cobalt blue must not be used as body text color against cream — only for structural elements and short UI labels.

## Typography

- **Primary body face**: IBM Plex Mono — already loaded in the project. Use it as the primary face for all UI labels, navigation, section headers, metadata, and caption-level text. The monospace grid reinforces the systems register.
- **Heading display voice**: Bold, upright, high-contrast. Use a weight that reads as confident rather than loud. IBM Plex Mono Bold works for most headings. Consider IBM Plex Sans Bold or a geometric sans (e.g. Inter) for large display headlines if Mono at display size feels too mechanical — but only if Mono is genuinely insufficient. The reference uses a contrasting bold upright sans for its largest display text.
- **Scale and rhythm**: Tight. Labels are small and dense. Body type is comfortably readable but not generous. Headings earn their size through structure, not padding. Line-height should feel more like a document than a magazine.
- **Letter-spacing/weight behavior**: ALL CAPS for section headers, panel labels, nav items, metadata keys. Use `letter-spacing: 0.05em–0.1em` on all-caps labels to aid legibility at small sizes. No loose tracking on body or display type.
- **What not to do**: Do not introduce a script or italic face. Do not use a serif. Do not use loose, generous line-heights or large paragraph spacing — this direction is document-tight, not editorial-airy.

## Surface and Material

- **Surface logic**: Every distinct content region is a **panel** — a clearly bordered module with a thin 1px rule, often with a short ALL CAPS monospace label at the top (the panel header). The cream background shows through between panels. Cards become data panels with labeled headers rather than purely image-led objects.
- **Borders/rules**: 1px solid lines in near-black or cobalt blue. Panel headers use a cobalt blue background fill with near-white or cream text. Horizontal rules between sections are thin and functional.
- **Texture/noise**: Blueprint graph-paper grid as a subtle background texture on feature sections (hero panel, a section break). The grid is cobalt blue at very low opacity — present but not heavy. It is the only texture; no film grain, no noise overlays elsewhere.
- **Shadows/depth**: None. Flat. Depth comes from the structural panel system and color contrast, not from shadow or blur. If elevation must be signaled, use a 1px border shift or a background color change, not a drop shadow.
- **Media framing**: Featured images sit inside thin-bordered panel frames — no rounded corners, no shadows, no overlapping treatment. The panel border is the frame.

## Layout and Composition

- **Homepage**: The homepage is the most important canvas. Treat the hero/top region as the primary dashboard panel — large type, panel header, a supporting cobalt rule or grid-texture treatment. Below it, the Selected Work and Latest Writing sections are distinct panels with labeled headers, laid out on a structured column grid. The overall effect should feel like a well-organized status board, not an editorial landing page.
- **Cards**: Cards are data panels. Each card has a thin border, a short panel header label (e.g. "CASE STUDY" or "WRITING"), then the card content: headline, short descriptor, image. No card lift or hover shadow — instead, a border color shift to cobalt blue on hover.
- **Article rhythm**: Article pages are document-like. The `.content-flow` grid stays intact. Body paragraphs in a comfortable reading width. Section breaks marked with a cobalt horizontal rule rather than generous whitespace alone.
- **Footer/nav**: Navigation is ALL CAPS monospace, minimal. The `SiteNav` affordance on interior pages uses monospace label weight. The footer is structured like a document colophon — dense, organized, functional.
- **Mobile behavior**: The panel grid collapses gracefully to a single-column stack. Panel headers and monospace labels scale down cleanly because monospace type is already mechanically tight. No horizontal scroll or overflow behavior.
- **Composition experiments to attempt**: (1) Give the homepage hero section a blueprint graph-paper grid background texture behind the headline. (2) Add panel header labels to each homepage section (e.g. a cobalt-blue ruled banner reading "SELECTED WORK" before the cards section). (3) Try cobalt-blue panel headers on case study and writing cards. (4) On article pages, render the post metadata (date, category) as a small monospace data block — like a technical callout — rather than inline flowing prose.

## Motion and Interaction

- **Page/route motion**: Keep the existing featured-media card-to-detail transition system intact — do not touch the transition data hooks. Route motion should otherwise be minimal and fast. No elaborate page-enter animations. Panels appear; they do not fade in one by one.
- **Hover/touch behavior**: Card hover changes the panel border from near-black to cobalt blue. No scale transform, no shadow lift, no image zoom. The border color shift is the interaction signal.
- **Scroll behavior**: No parallax. No scroll-driven reveals. Content appears as the viewport reaches it via normal browser scroll. The direction is document-like, not cinematic.
- **Reduced-motion expectation**: Because this direction is already minimal in motion, the reduced-motion fallback is nearly identical to the default. The border-color hover shift may remain; skip any fade or entrance animations.

## Accessibility and Usability

- **Color contrast**: Cream background (`~#F5F3EE`) with near-black text must meet WCAG AA (4.5:1 for normal text, 3:1 for large). Cobalt blue on cream for large text (panel headers, section labels) must meet 3:1. Cobalt panel headers with light-colored label text must meet 4.5:1.
- **Focus states**: The global `:focus-visible` outline from `_base.scss` must remain. Consider a cobalt blue focus ring to match the structural accent color — it is visible against cream and most panel surfaces.
- **Keyboard behavior**: No changes to interactive semantics. Cards remain links. Load more is a native button. Accordion aria attributes unchanged.
- **Link affordances**: Text links in body copy should be distinguishable by color alone against the cream ground (cobalt blue underline or cobalt blue color is acceptable, as long as contrast holds). Do not rely solely on hover to indicate interactivity.
- **Readability**: Monospace at small body sizes can degrade. Use IBM Plex Mono for labels, headers, and metadata — not as the primary body reading face for long prose. Prose paragraphs should use IBM Plex Sans or the existing body face if monospace at that size strains legibility.

## Anti-Goals

- Avoid: Dark-mode versions of this direction. The cream ground is non-negotiable — it is what separates Blueprint Brutalism from generic "hacker terminal" aesthetics.
- Avoid: Decorative data widgets (animated counters, fake live metrics, spinning spinners). The dashboard register comes from structure and typography, not from component theater.
- Avoid: Rounded corners, card shadows, gradient backgrounds, soft depth effects — anything that reads as current-SaaS-product design language.
- Avoid: Loose, generous whitespace pacing. This direction is tight and document-dense. Breathing room comes from the cream ground and clear panel separation, not from padding inflation.
- Avoid: Script faces, editorial serifs, or playful display type. The typographic world is monospace ALL CAPS labels + bold upright display. That is the full palette.
- Avoid: Overloading the blue. Cobalt is structural. If it appears on every interactive element, every border, and every heading simultaneously, it stops being structural and becomes noise.

## Implementation Notes for the Agent

The agent may edit palette files, shared-component recipes, scoped SFC styles, and supporting SFC markup where the visual direction needs it. Preserve the content model, GraphQL query shape, block registry, transition data hooks (`clip-path`, `data-featured-*` attributes), static deploy scripts, Docker infrastructure, and CMS schema.

Key implementation targets:

1. **`packages/styles/_color-palette.scss`** — replace or extend the palette with the cream ground, near-black ink, and cobalt blue structural accent. Export as CSS custom properties.
2. **`packages/styles/_type-palette.scss`** and **`_type-fonts.scss`** — ensure IBM Plex Mono is loaded and positioned as the primary label/heading face. Set up a clear type scale with tight line-heights.
3. **Panel header pattern** — establish a reusable SCSS mixin or shared-component utility for the cobalt-blue panel header treatment (full-width colored background strip, ALL CAPS monospace label).
4. **Card components** — update `CaseStudyCard.vue` and `PostCard.vue` scoped styles to use the panel vocabulary: thin border, panel header label, cobalt-hover border shift.
5. **Homepage sections** — update `components/home/` section components with panel header labels and the graph-paper grid texture on the hero region.
6. **Navigation** — update `SiteNav.vue` and `SiteFooter.vue` type styles to ALL CAPS monospace.
7. **Blueprint grid texture** — implement the graph-paper grid as a CSS `background-image` using SVG or `linear-gradient` repeating pattern at very low opacity in cobalt blue.

Expected checks:

- `corepack pnpm check`
- SSR review via `corepack pnpm dev` at `http://my-website.localhost`
- Spot-check: homepage, a case study detail, a writing detail, the writing archive, the about page
- Static generation smoke test before a winning branch is merged

## Handoff Summary — Round 2 (rework after review)

Round 1 misread the moodboard as "cobalt chrome everywhere." Round 2 corrects this: cobalt is accent-only (data, highlights, kicker labels), not structural chrome. Panels are black-bordered and round-cornered. The expressive typographic contrast (display italic vs. mono labels) is now the defining visual move.

- **Main visual decisions**:
  - Cobalt blue (`#2657eb`, reusing `$color-primary`) is now the structural accent: blueprint grid texture on the page body and homepage hero, cobalt bottom border on SiteNav, cobalt panel header strips on section titles and cards, cobalt on hover states throughout
  - All headings changed from italic to upright (`$type-heading-style: normal`) with slightly heavier weight (500→600) and tighter line-height (1.78→1.65)
  - Panel header pattern (`@mixin panel-header`) introduced as the section/card label language: cobalt background, ALL CAPS, IBM Plex Mono, 0.1em letter-spacing — applied to Selected Work, Latest Writing, PostCard "WRITING" label, CaseStudyCard "CASE STUDY" label, and case-study detail header
  - SiteNav completely restyled: ALL CAPS monospace everywhere, cobalt color on hover, no background-fill animation, cobalt `border-strong` bottom border instead of the subtle ink border
  - SiteFooter: fixed `--color-paper-warm` bug (was undefined, now `--color-surface-warm`); footer links are now ALL CAPS monospace with cobalt hover; added cobalt top border
  - Box shadows eliminated across the board (PostCard no longer lifts on hover; hover is purely a border-color shift to cobalt)
  - PostCard hover: border shift to cobalt only, no shadow, no translateY
  - Writing archive "Load More" button: transparent with cobalt border, fills cobalt on hover (no lift)
  - HomeSideProjectsLink: removed italic CTA, updated to monospace uppercase

- **Files changed**:
  - `packages/styles/_effect-palette.scss` — cobalt grid texture, flat shadows, cobalt border-strong
  - `packages/styles/_type-palette.scss` — upright headings, tighter line-height, heavier weight
  - `packages/styles/_mixins.scss` — added `@mixin panel-header`
  - `apps/frontend/components/navigation/SiteNav.vue` — ALL CAPS mono nav, cobalt accent border/hover
  - `apps/frontend/components/navigation/SiteFooter.vue` — fix color bug, monospace labels, cobalt hover/border
  - `apps/frontend/components/navigation/cards/PostCard.vue` — panel header, no shadow, cobalt border hover
  - `apps/frontend/components/navigation/cards/CaseStudyCard.vue` — panel header in slip panel
  - `apps/frontend/components/home/HomeSelectedWorkSection.vue` — panel header section title
  - `apps/frontend/components/home/HomeLatestWritingSection.vue` — panel header section title, updated more-link
  - `apps/frontend/components/home/HomeVitalInfo.vue` — cobalt eyebrow, monospace about-link
  - `apps/frontend/components/home/HomeSideProjectsLink.vue` — monospace labels, no italic
  - `apps/frontend/pages/index.vue` — cobalt grid hero, upright heading, cobalt mega-text
  - `apps/frontend/pages/writing/index.vue` — monospace kicker, upright h1, cobalt load-more button
  - `apps/frontend/pages/writing/[slug].vue` — monospace meta-row, upright title
  - `apps/frontend/pages/case-studies/[slug].vue` — panel type label in header, upright title, adjusted padding

- **Known compromises**:
  - The flying transition clone (FeaturedMediaTransitionLayer) creates its own `.slip-bg` div — it won't show the cobalt panel header during the card-to-detail flight. The header appears on the card and on the landing page, but is absent during the brief animated transit. This is acceptable and invisible at normal transition speeds.
  - The blueprint grid texture in the hero section is hardcoded with the cobalt hex value (`rgba(38, 87, 235, ...)`) rather than using the CSS custom property, because `background` shorthand doesn't support CSS variables inside `linear-gradient` in the same property chain easily. If `$color-primary` changes, this value needs updating separately.

- **Screens or routes that need special QA**:
  - Homepage — hero grid texture, section panel headers, all sections
  - Writing archive — panel-style post cards, load-more button, kicker label
  - Writing detail — meta-row monospace, upright title, hero slip panel
  - Case-study detail — panel type label in header, upright title
  - Any route with SiteNav visible — check cobalt border, ALL CAPS labels
  - Footer on any page — check link style, copyright mono, cobalt border

- **Whether static generation was smoke-tested**: Not yet — this is an SSR design branch. Static smoke test deferred until a winning branch is selected for merge.
