# Generative Design Brief

## Branch

- Branch name: `gendes-seamless.cc`
- Baseline branch: `gendes-academia`
- Mood-board folder: `docs/gendes-moodboard/gendes-seamless.cc/` (notes only — the reference is a live website, not images)
- Working title: **Seamless Gallery**

## Thesis

A dark, gallery-lit portfolio whose defining idea is *motion as material*: media does not cut between states, it travels. The signature move is a featured image that begins large and full-bleed and then resolves into a tall arched frame — rounded at the top, square at the foot — leaving a short echoing trail as it settles. The site should feel like an exhibition that reveals itself: quiet green-black walls, warm sand light on the titles, sage-grey wayfinding, and a single recurring silhouette (the arch) tying cards, heroes, and article media together. Where the academic baseline is a calm reading room, this branch is a lit room you move *through*.

The work being shown is interaction and design-technology craft, so the transitions are the argument: shared elements that morph seamlessly across navigation are the portfolio piece, not decoration.

## References

Primary reference is a live website, reviewed directly (not a mood board):

- Reference: Codrops "Intro Image Trail Animation" demo — https://tympanus.net/Development/IntroTrailEffect/ and its article https://tympanus.net/codrops/2022/05/03/image-trail-animation-for-an-intro/
- What to borrow:
  - The **big-image → arched-frame** resolution (`border-radius` tween from rectangle to `~20vw 20vw 0 0`).
  - The **trail effect**: a moving shared element is cloned a few times and the clones are staggered along its motion path (fading 0→1→0) so the move leaves an echo.
  - GSAP **Flip** as the engine for shared-element layout deltas (records state, reparent/restyle, animates the delta — including border-radius).
  - The **palette**: green-black ground, warm sand titles/accent, sage-grey links/secondary text, near-white body text.
  - **Atmosphere**: a slow breathing light overlay (the demo uses an animated `shadow.png`; we recreate it with an animated radial gradient — no external asset), ghosted/layered display headings, wipe-away underline links, fill-from-bottom buttons.
  - Tall **portrait media** that bleeds off the bottom edge.
- What to avoid:
  - The demo's fake **loader gate** and its single-screen, non-scrolling "experience" shell — this is a real multi-page content site.
  - Its Typekit faces (Kudryashev / Acumin) — use free analogues.
  - Reproducing the demo's copy or images. Original content only.

## Palette

- Ground/background: green-black `#161a19`; deeper `#101312` for the deepest surfaces, slightly lifted `#1c211f` for panels.
- Ink/text: warm near-white `#f4efe9`; secondary text sage-grey `#9aa8a2`.
- Accent behavior: warm **sand** `#dbb59b` carries titles, the active accent, and link hover — used as light, not as fill. Sage-grey is the resting link / wayfinding color.
- Image treatment: full-bleed and dark-friendly; arched frame as the recurring silhouette; gentle scale-in on the morph.
- Contrast constraints: near-white body and sand titles clear AA on the green-black ground; sage-grey reserved for large or secondary text where it stays ≥ 4.5:1. No sand text on sand-adjacent surfaces.

## Typography

- Primary body face: **Mulish** (light humanist sans, weight 300 body / 400–600 emphasis) — stands in for Acumin Pro's light humanist body.
- Heading voice: **Playfair Display** (high-contrast didone display, italic available) — stands in for Kudryashev's extreme thick/thin contrast; set large for hero/monogram/section titles.
- Scale and rhythm: display titles run very large and tight; body stays generous and light. Italic display accents echo the reference's `em` italics.
- Letter-spacing/weight behavior: tight negative tracking on big display; uppercase + wider tracking on small labels/eyebrows.
- What not to do: don't reuse other branches' faces (Fraunces, Bodoni Moda, Clash, Archivo Black, IBM Plex). Don't set body in the display face.

## Surface and Material

- Surface logic: dark gallery walls; translucent dark "slip" panels carry titles over media (existing slip-surface recipe, re-tinted dark with a faint light hairline).
- Borders/rules: faint light hairlines on dark (light-alpha borders).
- Texture/noise: replace the light paper-grid with a near-invisible light grid on dark plus the breathing radial-gradient atmosphere overlay; keep it subtle.
- Shadows/depth: dark drop shadows; depth mostly from the breathing light and the arch silhouette rather than heavy shadows.
- Media framing: the **arch** — `border-radius` rounded top, square foot — on cards, hero, and article featured media. Portrait bias where layout allows.

## Layout and Composition

- Homepage: hero-only adaptation (no loader gate). The top of the homepage does a single **trail reveal** on load — eyebrow, big Playfair title, and lead media animate in with a short echo — then normal sections scroll below.
- Cards: dark, media-led, arched silhouette; title in a dark slip panel; sand on hover.
- Article rhythm: case-study **hero is the showpiece** — the card's featured media flies in and morphs from full-bleed rectangle to arched frame as the hero settles, trailing a couple of echoes. Body content keeps the content-flow grid intact.
- Footer/nav: keep the contextual model; restyle to the dark palette; wipe-underline links.
- Mobile behavior: trail count and motion reduce; arch radius scales down; layouts stay single-column and legible.
- Composition experiments to attempt: ghosted/layered hero heading (offset duplicate letters), breathing light overlay, portrait media bleeding off the bottom edge of the hero.

## Motion and Interaction

- Page/route motion: GSAP Flip drives the card→detail shared-media morph (geometry + border-radius), with cloned, staggered trail echoes layered on the motion path. Preserve the existing `data-featured-*` hooks and `_motion-palette.scss` tokens; Flip reads the same source/target frames.
- Hover/touch behavior: wipe-away underline on links; fill-from-bottom on the primary/enter-style button; gentle media scale on card hover.
- Scroll behavior: standard scrolling; no scroll-jacking. Optional one-shot hero reveal on load only.
- Reduced-motion expectation: under `prefers-reduced-motion: reduce`, no trail clones, no morph animation, no breathing overlay — fall back to an instant or simple cross-fade. The existing transition already early-returns on reduced motion; keep that contract.

## Accessibility and Usability

- Color contrast: near-white body and sand titles AA on green-black; sage-grey only where it clears 4.5:1.
- Focus states: keep the global `:focus-visible` outline; dark-theme focus ring must stay visible (light/sand ring on dark).
- Keyboard behavior: cards stay real links, buttons stay native; Flip/trail is presentation only and must not gate navigation.
- Link affordances: descriptive link text; wipe-underline is decorative, not the only affordance.
- Readability: light body on dark must stay comfortable — generous line-height, not too-thin a weight at small sizes (Mulish 300 floors at body size, heavier for small UI text).

## Anti-Goals

- Avoid: a loader/splash gate or a single-screen non-scrolling "experience" — this is a browsable content site.
- Avoid: looking like `gendes-nature` (Glasshouse Nocturne). Differentiate via motion/trail, the sand+sage gallery palette, and the arch silhouette — not botanical/vitrine language.
- Avoid: scroll-jacking, autoplaying heavy motion, or trail effects that fire on every hover and become noise.
- Avoid: pastiche of the reference's specific content, fonts, or imagery.

## Implementation Notes for the Agent

Adds GSAP + the Flip plugin as a dependency for this branch (wired through a client-only Nuxt plugin). Flip coexists with the existing clip-path transition; the `data-featured-*` source/target hooks and `_motion-palette.scss` timing tokens are preserved. Edits center on `packages/styles/` (palette, type, effect, motion, frontend context-role, featured-media-overlay recipe), the transition composable/layer, the case-study hero, cards, and the homepage hero. Content model, GraphQL shape, block registry, CMS schema, Docker, and static deploy machinery stay intact.

Expected checks:

- `corepack pnpm check`
- Visual QA via `corepack pnpm generate:static:preview` (user-driven)
- Static generation smoke test before this branch is called a candidate

## Handoff Summary

First implementation pass — ready for human visual QA via `generate:static:preview`.

- Main visual decisions:
  - Dark gallery palette: green-black ground, near-white ink, sand (`#dbb59b`) accent, sage-grey (`#9aa8a2`) secondary — driven entirely through `_color-palette.scss` tokens.
  - Type: Playfair Display (titles, via `--font-display`) + Mulish (body, `--font-sans`); IBM Plex Mono kept for code and retained as the small-label/eyebrow accent.
  - Signature move: card slab → arched detail hero. Media frames capture `border-radius`; the transition layer tweens it (square → `--media-arch-radius` arch) alongside geometry, with GSAP-driven trail echoes riding the same path.
  - Route transition timing bumped to 560ms so the morph + trail read cinematically; all layers read the same token.
  - Atmosphere: breathing radial-gradient light overlay (`body::before`), dark wall texture, dark shadows.
- Files changed:
  - Styles: `_color-palette.scss`, `_effect-palette.scss`, `_motion-palette.scss`, `_type-palette.scss`, `_type-fonts.scss`, `context-role/_vue-frontend.scss`, `context-role/_wp-editor.scss`, `shared-components/_accordion-block.scss`, `_embed-block.scss`.
  - Transition: `composables/useFeaturedMediaTransition.ts` (radius capture), `components/transitions/FeaturedMediaTransitionLayer.vue` (radius morph + GSAP trail).
  - Components/pages: `index.vue` (hero reveal), `case-studies/[slug].vue` (arched hero), cards (`CaseStudyCard`, `PostCard`), home sections, `SiteNav`, `SiteFooter`, `CaseStudyLoopNav`, `HomeSideProjectsLink`, `about.vue`, `side-projects/index.vue`, `writing/index.vue`, `writing/[slug].vue` (title font + dark-theme color fixes).
  - Dependency: `gsap` added to `apps/frontend`.
- Known compromises:
  - GSAP is used for the trail timeline and homepage reveal; the main media morph stays CSS-transition-driven (Flip not wired in — the fixed-clone model didn't need it). Flip plugin not imported.
  - Free font substitutes (Playfair/Mulish) stand in for the reference's Typekit faces; Playfair is a didone, not a contrast *sans*.
  - Block-level dark theming is first-pass: code block (already dark) untouched; spot-fixed accordion/embed. Other blocks (table, quote, file, etc.) want a QA sweep for any remaining light-theme assumptions.
- Screens or routes that need special QA:
  - Case-study detail: card→hero morph + trail, reverse (detail→home), detail→detail loop nav.
  - Writing detail/archive transitions; block QA kitchen-sink post + case study for dark-theme block legibility.
  - Reduced-motion: no trail, no breathing overlay, no hero reveal — confirm fallbacks.
  - Contrast: sand titles + sage-grey secondary on green-black; focus rings on dark.
- Whether static generation was smoke-tested: not yet — `corepack pnpm check` passes (lint + typecheck + editor CSS). Static smoke test pending before calling this a candidate.
