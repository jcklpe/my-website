# Generative Design — To Do

## Background

The non-brand academic baseline is done. The first implemented generative branch explored a Moss Conservatory direction. This branch is different: it uses the old Jackalope WordPress theme under `temp-ref-assets/Jackalope/` as the creative source and aims for a fairly literal visual port into the current Nuxt frontend.

Read `docs/gendes.md` for the full methodology. Read `docs/visual-design.md` for the baseline this work forks from. Read `docs/gendes-brief.md` for the Jackalope-specific translation contract.

---

## General Principles

- Treat `temp-ref-assets/Jackalope/` as the primary reference input for this branch.
- Preserve the old theme's visual grammar where feasible: black label strips, electric-blue understrikes, brush display type, diagonal panels, media-heavy cards, bracketed links, and energetic hover motion.
- Translate the old WordPress theme into the current Vue/Sass architecture rather than recreating old PHP, Bootstrap, jQuery, Swup, or parallax dependencies.
- Preserve the transition system hooks, content-flow grid, block rendering architecture, SEO composable usage, and static-generation safety.
- Accessibility does not get deferred. If a literal old-theme behavior would remove visible focus, hide text, or rely on invisible overlay links, translate the intent in an accessible way instead.
- Use static preview as the user's visual QA path for this branch.
- Do not make commits.

---

## Current State Overview

- Branch: `gendes-Jackalope.codex`
- Reference project: `temp-ref-assets/Jackalope/`
- Previous branch state: the working tree contained broad visual changes from the Moss Conservatory pass, including modified docs, Vue surfaces, palette/effect/type files, shared block recipes, and generated editor CSS.
- Current state: first Jackalope Revival implementation pass is complete and ready for human static-preview visual QA.
- Static preview: preferred visual QA loop is explicit static generation followed by `corepack pnpm start:static:preview`.

---

## To Do

### Human Visual QA

- Generate the static preview from the desired CMS source and review with `corepack pnpm start:static:preview`.
- Compare the Nuxt translation against `temp-ref-assets/Jackalope/` for literalness:
  - black label strips and blue understrikes
  - brush display type presence
  - diagonal case-study and writing panels
  - white article sheets
  - bracketed prose links
  - hover/focus motion and reduced-motion behavior
- Record visual mismatches or desired intensity changes before the next tuning pass.

### Follow-Up Decisions

- Confirm whether the copied old font assets are acceptable for the production branch if this direction wins.
- Run `corepack pnpm inspect:static` before deploy-oriented review.
- Tune after human QA, especially mobile panel cropping, article density, and any places where the port should be more or less literal.

### Review Matrix

- Home desktop and mobile: hero, Selected Work, Vital Info/About, Employer Testimonials, Side Projects, Latest Writing, footer
- Writing archive desktop and mobile: alternating slabs, Load More, empty/error states
- Writing detail: hero panel, article entry, headings, links, media, code, quote/pullquote, lists, table, embeds, audio/video, file/download, details/accordion
- Case-study detail: hero panel, featured-media transition, content-flow rhythm, bottom previous/next navigation
- About page: CMS-authored page with prominent display heading and Gutenberg body
- Side Projects page: CMS-authored secondary page and empty/holding states
- Keyboard/focus states, reduced motion, color contrast, link affordances, and hover/touch parity
- Static generation and static inspect before a winner is merged

---

## Ready for Human Visual QA

- Jackalope Revival first implementation pass.
- Verification completed:
  - `corepack pnpm check`
  - `corepack pnpm build`
  - `git diff --check`
- Recommended preview loop:
  - `corepack pnpm generate:static:public` or `corepack pnpm generate:static:qa`
  - `corepack pnpm start:static:preview`

---

## Done

- Rewrote `docs/gendes-brief.md` for Jackalope Revival
- Updated `docs/gendes.todo.md` so the branch tracks Jackalope work rather than the prior Moss Conservatory direction
- Updated `docs/gendes.md` so reference-project branches are recognized alongside mood-board branches
- Inspected the old Jackalope WordPress theme palette, typography, motion, links, hero, case-study panels, writing archive, article, About, Side Projects, footer, and detail/navigation patterns
- Identified old behavior to translate rather than copy literally: focus outline removal, invisible overlay anchors, jQuery/Bootstrap behavior, Swup route classes, parallax dependencies, and old ACF-specific field names
- Copied old theme font assets into `apps/frontend/public/fonts/jackalope/` and mirrored them into the WordPress editor theme
- Made Jackalope font-face emission context-aware so Nuxt and the WordPress editor use served paths appropriate to their host
- Ported palette, type, effect, and motion tokens to the Jackalope black/blue/white/off-white/chartreuse/code system
- Replaced soft glass surfaces with hard black labels, blue understrikes, chunky shadows, clipped media panels, and white article sheets
- Restyled homepage, Selected Work, writing archive/cards, detail heroes, article bodies, shared editorial blocks, nav, footer, empty states, unsupported states, and transition overlay for the Jackalope first pass
- Preserved reduced-motion fallbacks, semantic links/buttons, SEO composable usage, content-flow placement, Gutenberg block rendering, and featured-media transition hooks
- Ran `corepack pnpm check` successfully on May 27, 2026
- Ran `corepack pnpm build` successfully on May 27, 2026
- Ran `git diff --check` successfully on May 27, 2026
- Non-brand academic baseline — palette, typography, article body, cards, footer, nav, homepage sections
- Static CDN deploy with Lighthouse 97
- Homepage refinement complete; archived spike docs live at `docs/archive/homepage.md` and `docs/archive/homepage.todo.md`
- About page CMS migration complete; archived spike docs live at `docs/archive/about-page.md` and `docs/archive/about-page.todo.md`
- Side projects page complete; archived spike docs live at `docs/archive/side-projects-page.md` and `docs/archive/side-projects-page.todo.md`
- Copy cleanup complete; archived spike docs live at `docs/archive/copy-cleanup.md` and `docs/archive/copy-cleanup.todo.md`
- Card-to-detail, detail-to-card, and detail-to-detail featured-media transitions
- Transition timing tokens in `_motion-palette.scss`, JS reads CSS custom properties
- `docs/visual-design.md` documents the baseline visual direction
