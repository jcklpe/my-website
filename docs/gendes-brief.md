# Generative Design Brief — Semplice

The active brief for the current generative design branch. Pulled from a live website reference rather than an image mood board.

## Branch

- Branch name: `gendes-semplice.cc`
- Baseline branch: `gendes-academia`
- Mood-board folder: `docs/gendes-moodboard/semplice/` (web reference, not image assets)
- Working title: **Editorial Gallery**

## Thesis

This direction pulls from Tobias van Schneider's personal site, `vanschneider.com` — itself the reference implementation of Semplice, the portfolio platform he built. The feeling is **expressive minimalism with a designer's confidence**: a bright, cool, gallery-white world where whitespace is a deliberate compositional device, type is large and self-assured, and color arrives in **deep saturated slabs** rather than as sprinkled accents.

Where the academic baseline whispers (warm paper, near-black ink, one timid accent, italic mono headings doing all the expressive work), this branch *declares*. It keeps the restraint of generous space and a near-monochrome reading surface, but pushes hard on the three things the baseline deliberately suppresses: **big upright display type**, **full-bleed jewel-tone color set-pieces**, and **an editorial-gallery composition** where sections alternate between airy white and immersive color. It should read like a beautifully art-directed print magazine that happens to be a portfolio — calm but never timid.

This is a portfolio site reading from a portfolio platform's reference site. The alignment is the point.

## References

- **Reference:** `vanschneider.com` (House of van Schneider / DESK Magazine)
  - **What to borrow:** bright cool near-white ground; near-black charcoal text; deep saturated full-bleed color panels (navy, oxblood, burnt clay) as section and project set-pieces; big confident upright grotesque display type; ALL-CAPS tracked declarative statements; clean caption blocks laid over imagery; flat surfaces (no paper texture, minimal shadow); vertical-rule dividers and arrow `→` CTAs; generous vertical rhythm with alternating white/color bands.
  - **What to avoid:** literal cloning of his layout; his actual brand typeface (Maison Neue is a paid Milieu Grotesque license — substitute, do not ship it); a single flat white site with no color courage; warm/beige academic paper; pervasive italics.

- **Typeface substitution (deliberate, with personality):**
  - **Display:** **Clash Display** (Fontshare, free for commercial use) — a confident editorial grotesque for big upright statements and ALL-CAPS section labels. This is where the personality lives.
  - **Body / UI:** **Switzer** (Fontshare, free for commercial use) — a clean neo-grotesque in the Helvetica/Maison Neue lineage; neutral and highly readable for prose.
  - **Mono / typographic detail:** **IBM Plex Mono** retained for code blocks, captions, kickers, and small spec-style labels — the third voice in a Display / Sans / Mono system.

## Palette

A near-monochrome bright reading surface punctuated by deep jewel slabs and one warm spot accent.

- **Ground/background:** bright, cool-neutral gallery white (`#f4f5f6`). Flat — the academic paper-grid texture is removed in this branch.
- **Ink/text:** neutral charcoal near-black (`#15171b`), replacing the baseline's navy ink. Crisper, more gallery-neutral.
- **Secondary/muted:** neutral gray (`#5c626b`), not the baseline's blue-gray.
- **Accent behavior:** a single warm **persimmon / burnt-orange** spot (`#bb3f15`), used sparingly — links, focus rings, hover marks, small kicker dots. Most links lean on ink + animated underline; the accent is a punctuation, not a flood. Must stay AA-legible on the light ground.
- **Color slabs (the signature move):** deep saturated full-bleed panels — **ink-navy** (`#182542`), **oxblood** (`#5a2531`), **burnt clay** (`#8a3c1f`) — carrying light text. These stage the hero, Side Projects, footer, and rotate behind Selected Work cards.
- **Image treatment:** minimally framed, near-full-bleed where it earns it; little or no border/shadow. Let imagery sit cleanly in the composition.
- **Contrast constraints:** body text, metadata, links, and focus rings meet WCAG 2.1 AA on both the white ground and the color slabs. Light-on-slab text uses the bright ground color, not pure white, to stay in family.

## Typography

- **Primary body face:** Switzer, upright, comfortable leading (~1.7–1.78). Neutral and quiet so the display face and color carry the personality.
- **Heading voice:** Clash Display, **upright** (the baseline's italic mono is gone). Big page-level and hero statements; quieter Clash for in-article headings so article bodies stay readable.
- **Scale and rhythm:** heroes and section labels go large and confident. Article-body headings stay measured — do not give prose 5rem headings. Page-level vs article-body heading recipes remain distinct.
- **Case behavior:** **ALL-CAPS with positive tracking** for big declarative statements, section labels ("SELECTED WORK", "LATEST WRITING"), kickers, and nav-local labels. **Title Case** for actual content titles (case-study names, post titles) — matching van Schneider, who keeps project titles mixed-case and reserves caps for statements.
- **What not to do:** no pervasive italics; no condensed-everything; do not set body or long prose in the display face; do not track-out body text.

## Surface and Material

- **Surface logic:** two register system — airy flat white reading surfaces and immersive full-bleed color slabs. Sections alternate to create rhythm.
- **Borders/rules:** crisp hairline ink rules; vertical-rule dividers where a section break wants articulation. Keep the existing border scale.
- **Texture/noise:** none. Flat gallery surface. Remove the paper-grid background.
- **Shadows/depth:** minimal. Prefer hairline separation and color-block contrast over soft drop shadows. Cards lean flat; reduce the heavy ambient card shadow.
- **Media framing:** clean, minimal frame; caption blocks (the slip panels) read as crisp light label cards laid over imagery, with charcoal text — kept consistent across the three featured-media transition states.

## Layout and Composition

- **Homepage:** a staged sequence alternating white and color. Open on a full-bleed **navy hero slab** carrying a big ALL-CAPS Clash Display statement and a mono kicker. Vital Info on white. Selected Work on white with project cards whose backgrounds rotate through the jewel slabs. An Employer Testimonials band that can carry color or a tinted surface. Side Projects as a full-bleed **clay or oxblood slab**. Latest Writing on white. Footer as a deep **navy slab** close.
- **Cards:** Selected Work cards keep their full-bleed media + light caption slip, but the card field rotates jewel-slab colors (navy / oxblood / clay) so load and transition states show color. Writing cards flatten toward clean hairline-bordered index entries — less shadow, more gallery.
- **Article rhythm:** unchanged structurally — `.content-flow` grid intact. Quieter Clash headings, generous space, mono captions and small labels. The reading surface stays bright white.
- **Footer/nav:** footer becomes a deep navy slab with light text and the big Clash heading. `SiteNav` stays a small unobtrusive local affordance; nav-local labels go ALL-CAPS tracked (upright, not italic).
- **Mobile behavior:** slabs go full-bleed edge to edge; display type scales down but stays confident; alternation rhythm preserved.
- **Composition experiments to attempt:** alternating white/color section bands; ALL-CAPS hero statement; rotating jewel-slab card fields; vertical-rule dividers; arrow `→` affordances on CTAs.

## Motion and Interaction

- **Page/route motion:** preserve the custom featured-media card-to-detail transition and its data hooks, clip-paths, and timing tokens. Keep slip-panel + title visuals consistent across the three transition states.
- **Hover/touch behavior:** confident but quiet — underline reveals, subtle card lift (lighter than the baseline shadow lift), arrow nudge on CTAs. Accent color appears on hover/focus.
- **Scroll behavior:** the existing scroll-hide nav stays. No heavy scroll-driven animation required.
- **Reduced-motion expectation:** all new motion respects `prefers-reduced-motion`; keep existing fallbacks.

## Accessibility and Usability

- **Color contrast:** AA for body, meta, links, and focus rings on white and on every slab color. Verify the persimmon accent as text on the light ground; darken if it falls below 4.5:1.
- **Focus states:** keep the global `:focus-visible` fallback; the accent-colored ring is fine but must remain visible on both light and slab surfaces.
- **Keyboard behavior:** unchanged — real links, native button for load-more, accordion aria attributes.
- **Link affordances:** descriptive visible text; no "read more" generics; underline or accent makes links discoverable.
- **Readability:** prose stays on the bright white surface at a comfortable measure; no long-form reading set on color slabs.

## Anti-Goals

- Avoid: shipping or faking Maison Neue, or any paid typeface without a license.
- Avoid: pastiche — a pixel-clone of vanschneider.com rather than a genuine translation onto this site's content.
- Avoid: a timid all-white site that drops the color-slab courage the direction depends on.
- Avoid: warm/beige academic paper, paper-grid texture, and the baseline's pervasive italics.
- Avoid: setting prose or content titles in the display face; over-tracking body text.

## Implementation Notes for the Agent

The agent may edit palette files, shared-component recipes, scoped SFC styles, and supporting SFC markup where the visual direction needs it. Preserve the content model, GraphQL query shape, block registry, transition data hooks, static deploy scripts, Docker infrastructure, and CMS schema.

Font loading: replace the IBM Plex Sans request with Fontshare requests for Clash Display + Switzer in `_type-fonts.scss`; keep IBM Plex Mono. Introduce a `--font-display` token rather than overloading `--font-mono`.

Expected checks:

- `corepack pnpm check`
- Static preview QA via `corepack pnpm generate:static:preview` (the user drives visual QA this way)

## Handoff Summary

- **Main visual decisions:** cool flat gallery-white ground + charcoal ink + neutral muted; single warm persimmon spot accent; deep jewel color-slabs (navy / oxblood / clay) as full-bleed set-pieces; Clash Display + Switzer + IBM Plex Mono type system via a new `--font-display` token; academic italics removed; ALL-CAPS tracked statements/labels, Title Case content titles.
- **Files changed:**
  - Tokens: `_color-palette.scss`, `_type-palette.scss`, `_type-fonts.scss`, `_effect-palette.scss`, `context-role/_vue-frontend.scss`, `context-role/_wp-editor.scss` (+ regenerated `editor.css`).
  - Components: `home/HomeVitalInfo.vue`, `home/HomeSelectedWorkSection.vue`, `home/HomeLatestWritingSection.vue`, `home/HomeEmployerTestimonials.vue`, `home/HomeSideProjectsLink.vue`, `navigation/SiteNav.vue`, `navigation/SiteFooter.vue`, `navigation/CaseStudyLoopNav.vue`, `navigation/lists/CaseStudyList.vue`, `navigation/cards/CaseStudyCard.vue`, `navigation/cards/PostCard.vue`, `content/FeaturedMediaFrame.vue`, `transitions/FeaturedMediaTransitionLayer.vue`.
  - Pages: `index.vue`, `about.vue`, `writing/index.vue`, `writing/[slug].vue`, `case-studies/[slug].vue`, `side-projects/index.vue`.
- **Known compromises:** Maison Neue substituted (Clash Display + Switzer). Color-slab boldness lives in section/card backgrounds; slip caption panels kept light to protect the three-state featured-media transition. Article-body headings now use Clash Display 600 at modest sizes — confirm they still read quiet enough in long-form prose. Editorial captions retain italic mono by design.
- **Screens or routes that need special QA:** homepage (navy hero slab, ALL-CAPS scale, card slab rotation, oxblood Side Projects band, navy footer); case-study + writing detail (featured-media transition into light slip over jewel slab); writing archive + Side Projects + About display headings.
- **Whether static generation was smoke-tested:** not yet — left for the user's `generate:static:preview` QA pass. `corepack pnpm check` passes (editor CSS regen + lint + typecheck).
