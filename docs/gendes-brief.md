# Generative Design Brief — Jackalope

This is the active brief for the current generative design branch. It is a port, not a fresh mood-board direction: a faithful translation of the author's first hand-built WordPress theme ("Jackalope") into the Vue frontend.

## Branch

- Branch name: `gendes-Jackalope.cc`
- Baseline branch: `gendes-academia`
- Reference source: `temp-ref-assets/Jackalope/` (the original WordPress theme — there is **no** `docs/gendes-moodboard/` folder for this branch; the theme itself is the reference)
- Working title: **Jackalope**

## Thesis

A loud, scrappy, maximalist personal site — the author's first theme, ported forward. This is late-2000s/early-2010s personal-site energy: skate/zine grunge brush-lettering fused with glossy heavy-drop-shadow web 2.0 and parallax. It is confident, hand-made, a little chaotic, and proudly un-tasteful in the refined sense. Where the academic baseline is calm warm-paper daylight and the sibling branches are jewel-box or blueprint exercises in restraint, **Jackalope is the opposite of restraint**: black ground, electric blue, brush-font shouting in stacked black highlighter bars.

The governing identity is the **marker-label heading**: display text set in a grunge brush face, wrapped in a black bar with a hard electric-blue rim and deep stacked drop shadows, where the bar extends past the text and slides/retracts on hover. Everything else — angled clip-path panels, bracketed links, flip-up nav, heavy sticker-pop shadows, parallax media — orbits that move.

This is a deliberately literal port. Per the author's direction it is **maximally literal**: where the original's choices fight the gendes accessibility floor (e.g. body text set black-on-electric-blue), we reproduce the original look rather than sand it down. The contrast/AA debt on the loud surfaces is an intentional stance for *this* branch, documented in Anti-Goals / Accessibility below — not an oversight.

## References

The single reference is the original theme at `temp-ref-assets/Jackalope/`. Key source files the port draws from:

- `assets/src/scss/base/mixins.scss` — the marker-label recipe lives here: `block-title`, `block-subheading`, `card-heading`, and their `-hover` variants (the stacked `box-shadow` with the blue rim and the bar-slide), plus `heavy-shadow`.
- `assets/src/scss/base/variables.scss` — palette: blue `#2657eb`, black `rgb(20,20,20)`, off-white `#d2cec2`, code fg/bg `#c85e7c`/`#322931`, the `cubic-bezier(0.84,.01,0.19,.93)` "AniCurve".
- `assets/src/scss/base/typography.scss` — brush display font (`dead_stock`), Aller body (Aller / AllerLite / AllerBold), the 5em uppercase `h2.section-heading`.
- `assets/src/scss/base/hyperlinks.scss` — the bracketed `[ link ]` treatment with the blue fill-up hover and the inline external-link SVG icon.
- `assets/src/scss/components/ui/hero.scss` — the rotated (`rotate(-5deg) scale(1,.75)`) brush title card; the glitch-video hero (translated, see Motion).
- `assets/src/scss/components/sections/case-studies-frontpage.scss`, `aboutMe.scss`, `side-projects-grid.scss` — the angled-panel composition (`clip-path: polygon(0 0, 100% 5vw, 100% 100%, 0 100%)` + negative-margin overlap), parallax background media, hover bar-slide on titles.
- `assets/src/scss/components/nav/nav.scss` — uppercase letterspaced nav links that flip up to a bold duplicate (`data-hover`).
- `assets/src/scss/components/posts/article.scss` — the article body (electric-blue `section.content`, black-label `h2/h3/h4`).

## Palette

Source of truth is `packages/styles/_color-palette.scss`, emitted as CSS custom properties in the context-role files.

- Ground/background: **pure black / near-black** (`--color-surface` ≈ `rgb(20,20,20)`, with `#000` and `#040319` deep-navy siblings for hero/panels).
- Panels: **deep cobalt navy** (`#002771`, `#040319`) for set-piece sections; a **teal-dark** (`rgb(10,55,45)`) for the side-projects ground.
- Accent: **electric blue** `#2657eb` — the rim color on every label, link underline/fill, focus, CTA. A **cyan** `#00b0ff` secondary pop. The link fill-up animation uses the original's red-orange (`#E63120`) sparingly as the slide-up variant.
- Ink/text: white on the dark world and on the black labels; off-white `#d2cec2` / `#f2f2f2` for softer body passages.
- Code: foreground `#c85e7c` on background `#322931` (ported verbatim).
- Image treatment: full-bleed, oversized, parallax-offset, with heavy stacked drop shadows and dark inset vignettes. Featured-media transition clones kept clean so the clip-path transition still matches.

## Typography

- Display / headings: **`dead_stock`** brush font (grunge marker face) — uppercase, large, the marker-label identity. Ported from `temp-ref-assets/Jackalope/assets/fonts/BrushFonts/`.
- Body: **Aller** (humanist sans) in three weights — Aller (regular), AllerLite (light body copy), AllerBold (emphasis/labels). Ported from `temp-ref-assets/Jackalope/assets/fonts/Aller/`.
- Mono: **IBM Plex Mono** retained for code blocks (the original used the proprietary "Input"; Plex Mono is the licensed stand-in already wired into the pipeline).
- Behavior: display is set huge (hero/section ~5–7vmax), uppercase, tight; body is comfortable humanist sans. The "eyebrow/meta" micro-voice is uppercase letterspaced Aller (replacing the academic italic-mono).

### Font handling (local-only binaries)

The brush + Aller font files are **not committed**. They are copied into `apps/frontend/public/fonts/jackalope/` (served at `/fonts/jackalope/…`) and that folder is added to the root `.gitignore`, mirroring the moodboard-media convention. `_type-fonts.scss` declares the `@font-face` rules against those local paths. A fresh checkout will fall back to the declared system stacks until the files are copied back in.

## Surface and Material

- Surface logic: a single dark world (no light "vitrine" register — that was a sibling-branch idea). Black/near-black ground; navy and teal-dark set-piece panels.
- The signature material is the **marker label**: `box-decoration-break: clone` black bars + electric-blue rim + stacked drop shadow, ported as a shared-component mixin set in `packages/styles/shared-components/_jackalope.scss` (replacing `_glasshouse.scss`).
- Borders/rules: hard, high-contrast — black bars, blue rims, white hairlines. No soft hairline glazing bars.
- Shadows/depth: **heavy stacked sticker-pop shadows** everywhere (`heavy-shadow`, `block-title`), the defining depth language. This replaces the academic flat look and the nocturnal ambient shadow.
- Texture: subtle film-grain / scanline is acceptable behind dark panels; the hero carries the generative glitch field. No paper grid, no caustic light.
- Media framing: full-bleed parallax media with dark inset vignette + heavy shadow; transition clip-path hooks (`data-featured-*`, `clip-path`) untouched.

## Layout and Composition

- Homepage: a stack of full-bleed **angled panels** separated by diagonal clip-path edges with negative-margin overlap. Flow maps onto existing components: glitch hero → Selected Work (deep-navy parallax case-study panels with big marker-label titles) → Vital Info / About → Side Projects (teal-dark image-tile grid, hover-reveal captions) → Latest Writing → black footer.
- Cards: `CaseStudyCard` becomes an immersive full-bleed media object with a marker-label title overlay and hover bar-slide + image parallax-translate. `PostCard` gets the marker-label treatment on a dark card with heavy shadow.
- Hero: rotated (`rotate(-5deg)`) brush-font marker-label title card floating over the generative glitch field.
- Article rhythm: ported literally — `section.content` electric-blue ground, black marker-label `h2/h3/h4`, large body type. (This is the main intentional-AA-debt surface; see Accessibility.) Pullquote becomes a large brush-font marker statement; quote/caption use the uppercase-letterspaced Aller micro-voice; code keeps the `#c85e7c`/`#322931` scheme.
- Footer/nav: footer is pure black with the sign-up affordance; nav is transparent-over-dark with uppercase flip-up links.
- Mobile: panels and labels hold; clip-path angles and parallax degrade gracefully; brush type scales down.

## Motion and Interaction

- Hero: the original's YouTube glitch-video background is **translated to a deterministic generative glitch field** (canvas/SVG scanlines + RGB-split + noise), in the spirit of the sibling branches' generative ornaments. SSR-safe, deterministic, and **static under `prefers-reduced-motion: reduce`**. No video embed.
- Hover: marker-label bars slide/retract (animating the `box-shadow` x-offsets); card media parallax-translates; bracket-links fill upward.
- Nav: links flip up to a bold duplicate on hover/focus.
- Page/route motion: existing route + featured-media transitions preserved (hooks intact); the original's swup fade+slide-down feel is approximated within the existing transition system, not a new library.
- Parallax: ported as progressive enhancement; off under reduced-motion.
- Reduced-motion: the generative glitch, all bar-slides, parallax, and link fills gate to static/instant under `prefers-reduced-motion: reduce`.

## Accessibility and Usability

This branch carries **intentional, documented contrast debt** on its loud surfaces, per the author's "maximally literal" direction:

- The article/case-study body ports the original electric-blue ground with dark and white text; some combinations do not meet WCAG AA. This is a deliberate stylistic stance for the Jackalope branch and is recorded here rather than silently corrected.
- Where it costs nothing visually, prefer the higher-contrast pairing (white-on-black labels, white-on-navy panels all pass; keep those).
- Focus states: keep the global `:focus-visible` fallback in `_base.scss`; provide a visible blue/cyan ring that reads on black and navy.
- Keyboard behavior, native link/button/disclosure semantics, and link affordances (bracket links remain real links) preserved.

## Anti-Goals

- Do **not** quietly "fix" the loud low-contrast surfaces into a tasteful neutral — that defeats the port. (Contrast debt is acknowledged above, not erased.)
- Avoid sibling-branch moves: no lit "specimen vitrine" reading register, no glass material, no caustic light, no botanical/harmonograph ornament, no Didone/Fraunces display, no blueprint grid.
- No literal YouTube/video-background hero.
- No new block renderer, registry, GraphQL, CMS, or transition-system changes.

## Implementation Notes for the Agent

Editable: palette/token files under `packages/styles/`, shared-component recipes, scoped SFC styles, supporting SFC markup, and a new generative glitch ornament component. Preserve the content model, GraphQL query shape, block registry, transition data hooks (`data-featured-*`, `clip-path`), static deploy scripts, Docker infra, and CMS schema.

Specifics:

- Rename/replace `shared-components/_glasshouse.scss` with `_jackalope.scss` (the marker-label + bracket-link + heavy-shadow recipe home); update the `@use` references in `_color-palette`, `_effect-palette`, `_type-palette`, both `context-role/_vue-frontend*` and `_wp-editor`, and rename `components/ornament/GlasshouseOrnament.vue` → `JackalopeGlitch.vue` (the generative glitch hero ornament).
- Copy fonts into `apps/frontend/public/fonts/jackalope/` and add that path to root `.gitignore`.

Expected checks:

- `corepack pnpm check`
- Visual QA via `corepack pnpm generate:static:preview` (static preview) across the review matrix.
- Static generation smoke test before a winning branch is merged.

## Handoff Summary

- Main visual decisions: single dark world (black ground, electric-blue accent, navy/teal panels); marker-label brush-font headings as the identity (`_jackalope.scss` mixins); bracketed fill-up links + external-link arrow; heavy stacked sticker shadows; generative glitch hero ornament replacing the video background; `dead_stock` brush display + Aller body (mono kept as IBM Plex Mono); fonts local-only/gitignored.
- Files changed: `packages/styles/` — `_color-palette`, `_type-palette`, `_type-fonts`, `_effect-palette`, new `shared-components/_jackalope.scss` (replaced `_glasshouse.scss`), `_heading-block`, `_link`, `_pullquote`, `_quote-block`, `_button`, `_featured-media-overlay` (`slip-title`), both `context-role/_vue-frontend*`. `apps/frontend/` — `pages/index|about|side-projects/index|writing/index|writing/[slug]|case-studies/[slug]`, `components/navigation/SiteNav|SiteFooter|CaseStudyLoopNav|cards/PostCard|cards/CaseStudyCard`, `components/home/*` (5), new `components/ornament/JackalopeGlitch.vue` (removed `GlasshouseOrnament.vue`). Editor CSS regenerated. Fonts copied to gitignored `apps/frontend/public/fonts/jackalope/`.
- Marker recipe split: `marker-label` (inline `<span>`, true per-line `box-decoration-break: clone` bars) for markup we control (hero, card/loop-nav/page titles); `marker-box` (block-safe single rectangle, no clone) for authored article/editor headings where a `<span>` can't be injected. Card→detail title transition uses `marker-box` on the title element so the composable captures the black bar's `background`/`box-shadow` and it flies across the transition.
- Token-name reuse: the prior branch's mixin/token names are kept and repurposed so all `@include` sites carried over — `glass-pane` → dark sticker card, `caustic-*` → scanline grain, `vitrine-surface`/`vitrine` tokens → the electric-blue **article register**, `specimen-label` → uppercase letterspaced Aller micro-voice.
- Known intentional compromise: contrast/AA debt on the loud body surfaces (black text on electric-blue article ground; black-on-black marker boxes on the darkest heroes read via blue rim + shadow rather than fill contrast), per the maximally-literal direction.
- Not yet ported (follow-ups, low risk): code-block keeps the baseline retroterm recipe rather than the original verbatim `#c85e7c`/`#322931`; angled clip-path panel *overlap* between homepage sections is available as `angled-panel-top/both` mixins but not yet wired into the section composition; parallax-on-scroll is approximated by hover parallax on cards only.
- Verification: `corepack pnpm check` (editor CSS + lint + typecheck) passes; `corepack pnpm build` (full SSR bundle) succeeds. Static `generate:static:preview` QA is the human step and not yet run. QA focus: brush font actually loading from `/fonts/jackalope/`; card→detail marker-bar transition continuity; article body legibility on the electric-blue ground; glitch hero under reduced-motion; mobile clip/rotation.
</invoke>
