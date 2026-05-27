# Generative Design Brief — Jackalope

This is the handoff brief for the `gendes-Jackalope.codex` branch.

## Branch

- Branch name: `gendes-Jackalope.codex`
- Baseline branch: `gendes-academia`
- Reference project: `temp-ref-assets/Jackalope/`
- Working title: Jackalope Revival

## Thesis

This branch is a direct translation of the old Jackalope WordPress theme into the current Nuxt frontend. The goal is not to borrow a vibe loosely. The goal is to preserve the old theme's visual grammar as literally as the current architecture allows: black label strips, electric-blue understrikes, brush display type, clipped image panels, chunky hover motion, bracketed links, dense media surfaces, and a handmade web-experiment attitude.

The current site should still remain a portfolio and writing site with the modern content model intact. WordPress is now the CMS/API, Nuxt owns public rendering, and Gutenberg blocks are rendered through Vue components. The port should therefore translate the old theme's composition, typography, surface language, and interaction behavior into the existing Vue/Sass system rather than recreating old PHP templates or jQuery behavior directly.

## References

- Reference: `temp-ref-assets/Jackalope/`
- Primary style files:
  - `assets/src/scss/base/variables.scss`
  - `assets/src/scss/base/typography.scss`
  - `assets/src/scss/base/hyperlinks.scss`
  - `assets/src/scss/components/ui/hero.scss`
  - `assets/src/scss/components/sections/case-studies-frontpage.scss`
  - `assets/src/scss/components/pages/blog-archive.scss`
  - `assets/src/scss/components/posts/blog-post/blog-post.scss`
  - `assets/src/scss/components/sections/aboutMe.scss`
  - `assets/src/scss/components/sections/side-projects-grid.scss`
  - `assets/src/scss/components/footer/`
- Primary templates:
  - `index.php`
  - `archive.php`
  - `single.php`
  - `single-case_study.php`
  - `template-parts/frontpage-hero.php`
  - `template-parts/hero.php`
  - `template-parts/sections/case-study-panels.php`
  - `template-parts/ui/case-study-links.php`

## What To Preserve

- Black label text blocks with extended horizontal shadows.
- Electric blue `#2657eb` as the hard accent and understrike.
- White article surfaces against black or blue page/chrome backgrounds.
- Diagonal clipped panels and overlapped section seams.
- Tall case-study panels that behave like large media thresholds.
- Writing archive items as alternating split image/text slabs.
- Hover/focus behavior where label shadows slide and media moves from offset/blurred toward clear.
- Bracketed prose links with blue fill on hover.
- Brush display typography for major page and panel headings.
- Aller-like body typography and Input-like code typography where asset/licensing handling is acceptable.
- Black footer/newsletter energy translated into the current footer content model.

## What Not To Preserve Literally

- Do not recreate the old PHP rendering model.
- Do not reintroduce raw whole-post HTML rendering.
- Do not remove focus outlines or make interactive overlays inaccessible.
- Do not depend on jQuery, Bootstrap collapse, Swup, old lazy-load plugins, or old parallax libraries.
- Do not use invisible full-card anchors when Vue can render semantic links directly.
- Do not add CMS fields only to reproduce old ACF names such as `html_title` or `overlay_background_grad`.
- Do not break the custom featured-media transition hooks.

## Palette

The palette should return to the old theme's hard poster contrast:

- Ground/background: black and near-black page chrome, with white article surfaces.
- Primary accent: electric Jackalope blue `#2657eb`.
- Secondary editorial neutrals: off-white `#d2cec2`, just-off-white `#f2f2f2`, charcoal `#32373c`.
- Alert/highlight accents: chartreuse-yellow `#d9ff00`, occasional orange from old hover states.
- Code: dark plum background `#322931`, rose foreground `#c85e7c`.
- Text: white on black/blue panels, near-black on white article surfaces.

Contrast must remain AA for text, metadata, links, buttons, and focus rings.

## Typography

- Display headings should use the old brush-poster voice where feasible. The old theme used `dead_stock` for hero, archive, section, and case-study labels.
- Body text should move toward the old Aller/AllerLite feeling: friendly, rounded, humanist sans rather than the current academic mono-led voice.
- Code should use the old Input-like monospace direction where feasible.
- If bundled reference fonts are copied into the Nuxt app, keep them in a clear public font folder and treat them as project reference assets. If licensing becomes uncertain, use system fallbacks that preserve the same hierarchy and document the compromise.
- Avoid negative letter spacing. Keep responsive type stable rather than viewport-fluid everywhere, even where the old theme used `vmax`.

## Surface and Material

- Labels are hard black strips, not translucent glass.
- Blue appears as a physical underline/rim/strike through `box-shadow`, borders, and hover fills.
- Cards and panels are big flat media posters with hard clipping, not soft glass cards.
- Article content lives on white paper with strong black headings and energetic inline affordances.
- Shadows should be chunky and directional, echoing the old multi-layer strip shadows.
- Section seams should use diagonal `clip-path` geometry where it works responsively.

## Layout and Composition

- Homepage: translate the old sequence into the current page structure. The top region should feel like a Jackalope splash/hero, Selected Work should become tall clipped case-study panels, About/Vital Info should become a black/blue poster section, Side Projects should become a dense work-tile invitation, and Latest Writing should echo the old writing archive slabs.
- Case-study cards: large full-bleed panels with title/subheading black strips over offset media.
- Writing cards: alternating slab objects, split between image and white text wedge when space allows, collapsing into full-media panels on mobile.
- Detail pages: keep hero media as a large clipped panel with black strip title. Body should enter as a white clipped article sheet.
- Article rhythm: readable and modern, but with Jackalope headings, bracketed links, code colors, numbered list labels, quote rules, and hard separators.
- Footer/nav: black, bracketed, local, rollover-like, not quiet glass.
- Mobile: simplify the same poster language. Keep tap targets, focus states, readable text, and no hover-only meaning.

## Motion and Interaction

- Preserve the existing featured-media transition system.
- Use the old theme's motion vocabulary selectively: image slide, blur-to-clear, label shadow shifts, and fast eccentric easing.
- Consider lightweight pointer/parallax behavior only where it does not threaten readability, hydration, or reduced-motion expectations.
- Reduced motion must collapse movement to stable color/border/opacity changes.

## Accessibility and Usability

- Restore and preserve visible focus states. The old theme removed focus outlines; this branch must not.
- Cards remain real links. Load-more remains a native button. Accordions preserve current semantics.
- Link affordances must not rely on color alone where context is ambiguous.
- Body prose must remain easy to read even if page chrome is loud.
- Static generation must continue to avoid serialized local CMS URLs in public output.

## Implementation Notes for the Agent

The agent may edit palette files, type/font loading, shared-component recipes, scoped SFC styles, and supporting SFC markup where the visual direction needs it. Preserve the content model, GraphQL query shape, block registry, transition data hooks, static deploy scripts, Docker infrastructure, and CMS schema.

Expected checks:

- `corepack pnpm check`
- Static preview review via `corepack pnpm generate:static:public` or `corepack pnpm generate:static:qa`, then `corepack pnpm start:static:preview`
- `corepack pnpm inspect:static` before deploy-oriented review

## Handoff Summary

First Jackalope Revival implementation pass completed on May 27, 2026.

Implemented:

- Rewrote the active generative-design docs around the Jackalope reference-theme workflow.
- Copied the old theme's Aller, AllerLite, AllerBold, Input, and dead_stock webfont assets into `apps/frontend/public/fonts/jackalope/` and mirrored them into the WordPress editor theme under `apps/cms/wp-content/themes/my-website-editor-theme/fonts/jackalope/`.
- Replaced the previous branch palette/type/effect/motion direction with black, electric blue, white/off-white, chartreuse, brush display type, Aller-like body type, Input-like code type, hard label shadows, and the old eccentric easing curve.
- Restyled homepage, Selected Work, Latest Writing, Vital Info/About, Testimonials, Side Projects, nav, footer, writing archive, writing detail, case-study detail, case-study loop navigation, empty/unsupported states, and featured-media transition surfaces toward the old WordPress theme's poster language.
- Restyled shared editorial block recipes for headings, paragraphs, bracketed links, lists, quotes, pullquotes, code, tables, files, images, galleries, embeds, audio, media/text, details, accordions, buttons, separators, and featured media overlays.
- Preserved the current Nuxt/WordPress architecture, semantic links/buttons, `useSiteSeoMeta` usage, Gutenberg block rendering, content-flow placement, and featured-media transition data hooks.

Verification:

- `corepack pnpm check` passed.
- `corepack pnpm build` passed.
- `corepack pnpm check` regenerated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css`.
- `git diff --check` passed.

Known follow-up:

- Human visual QA should run through the static preview path and compare the result against `temp-ref-assets/Jackalope/`.
- The copied font assets came from the old reference theme; confirm licensing/source before treating this branch as production-ready.
- Nuxt build leaves the absolute public font URLs as runtime paths, which is expected for files served from `apps/frontend/public/fonts/jackalope/`.
