# Brand Voice & Visual Consistency To-Do
## Background
Promoted from `docs/scratch/brand-voice.md` on 2026-07-10.

This spike is a design/refinement spike, not a single pre-decided implementation pass. The scratch note mixes small browser-polish items, system-level visual consistency questions, and bigger ideation topics such as the homepage hero and motion relationship. Start with review and decision-making before changing code.

## Project Organization
- Active conceptual doc: `docs/active-spikes/brand-voice.md`
- Active operational doc: `docs/active-spikes/brand-voice.todo.md`
- Former scratch source: `docs/scratch/brand-voice.md` deleted during promotion
- Related visual source of truth: `docs/visual-design.md`
- Related future motion work: `docs/scratch/animations.md`
- Related production/metadata work: `docs/scratch/production-deploy.md` and `docs/scratch/wcag-seo2.md`

## General Principles
- Treat this as a decision-first spike. Inspect the live surfaces and decide what belongs together before implementing.
- Preserve the Blue Atlas direction: warm cream ground, near-black ink, signal blue as structural signal, blueprint/grid texture vocabulary, hard outlines/shadows, and editorial/manual composition.
- Prefer deeper commitment to the existing language over a new visual direction.
- Separate small polish from system decisions and large compositional experiments.
- Do not let the homepage hero, animation work, About content, production metadata, or WCAG/SEO work swallow the whole spike by accident.
- Keep accessibility constraints active while exploring visual polish: contrast, focus visibility, reduced motion, target sizes, and readable longform text still win.

## Current State Overview
- No active spike docs were present before promotion.
- `docs/scratch/brand-voice.md` has been moved into `docs/active-spikes/brand-voice.md`.
- The current site already has consistent tokens, fonts, and component recipes; the unresolved problems are mostly compositional, tonal, and hierarchy-related.
- The homepage contains several different visual grammars at once: BLUF hero, Selected Work editorial rows, testimonial window cards, side-project band, and Latest Writing bento.
- Longform content has a strong article system, but block quotes, pullquotes, captions, TOC underlap material, and surface warmth should be reviewed together.

## Source Audit Notes 2026-07-10
This was a source-and-doc audit only. The local Nuxt frontend was not running (`127.0.0.1:3001` refused; Caddy returned 502), so live screenshots and browser interaction QA still need a later pass.

Current source realities:

- `apps/frontend/nuxt.config.ts` has viewport and icon metadata but no `theme-color`. This is a good small first implementation slice.
- There are no global `::selection` styles and no branded scrollbar styles in `packages/styles/context-role/_vue-frontend.scss` or `packages/styles/_base.scss`. Selection color is a good small first implementation slice; scrollbar styling is optional and should stay subtle if pursued.
- The homepage BLUF hero is now a framed blueprint-field wordmark panel in `apps/frontend/pages/index.vue`, with no current hero photo slot. Reframe old "hero photo / halftone" questions as "does the wordmark panel need stronger page presence, image/material layering, or motion?"
- The homepage has no visible `SiteNav` today. `layouts/default.vue` suppresses `SiteNav` on the home route, so the old "home nav hide-on-load" item is stale unless a new homepage nav is deliberately introduced.
- Testimonials are currently light/screen material by default (`HomeEmployerTestimonials.vue` uses `var(--color-surface-screen)` plus a configurable texture), not a dark panel. The sticky heading + card grid question remains active, but the dark/light premise should be corrected.
- `VideoBlock.vue` uses `figure-caption`, and `_embed-block.scss` uses `editorial-caption`; the video/embed caption follow-up appears already implemented by the embed-media-support spike. Keep a live visual audit item, but this is probably confirm-and-close rather than new work.
- Surface harmony is a real token-level question: `$color-surface-soft` is nearly white (`#fefefd`) while page and article grounds are warmer (`#f7f5ef`, `#f3efe5`). Direct `--color-surface-soft` consumers are Vital Info, testimonial cards, writing cards, writing archive rows, accordions, and a small number of fallback surfaces; blockquotes use the translucent `--color-surface-softest`, and the accordion toggle also has one literal white background. Tables and media frames use related paper/elevation treatments but are not direct `--color-surface-soft` consumers. Any palette change should still be screenshot-checked across the broader surface family.
- Section-label grammar is the clearest system decision. Current homepage grammar includes a large right-aligned Selected Work label with a blue rule, a two-rule Latest Writing banner with crosshair ornament, a sticky Testimonials eyebrow/title stack, card/local eyebrows, and the terminal Side Projects register. These do not need to become identical, but they need a stated family rule.
- Writing archive/header treatment is quieter than the homepage writing section. Decide whether route-level archive/detail headers should remain deliberately document-like or receive a stronger Blue Atlas label grammar.
- Case-study and writing detail hero surfaces are transition-sensitive. Any visual change that alters media frame geometry, title wrapping, or source/target text metrics needs motion QA, not just static screenshots.

Suggested first implementation batch after discussion:

- Add `theme-color` metadata using the primary electric blue for this first pass; verify it does not feel too heavy on mobile browser chrome.
- Add global `::selection` styling with primary-blue background and cream/surface foreground, then verify long prose and code blocks visually.
- Add subtle scrollbar styling now, centered on the primary blue but restrained enough to remain usable.
- Confirm video/embed captions are already on the shared caption path, then mark that item done if browser QA agrees.

## To Do
### Discussion And Scoping First
- Review the conceptual doc with the user and agree on the spike boundaries before implementation.
- Decide whether this spike should produce one broad visual polish pass or a set of smaller follow-up spikes.
- Decide which surfaces need human taste review before code changes: homepage full page, writing archive/detail, case-study detail, About/Now, longform block QA, and mobile.
- Decide whether to create a short decision matrix for each candidate item: keep as-is, small polish, medium system change, large exploration, defer/split.

### Small Polish Candidates
- Mouse cursor styling: likely defer unless a specific interactive surface genuinely earns it.

### Medium System Decisions
- Elevation grammar: preserve hard shadows primarily for interactive or genuinely elevated objects. Current usage mostly appears justified; review the remaining static specimen/document surfaces individually rather than removing shadows broadly. Treat the BLUF hero frame as the clearest likely exception.
- Section label grammar: decide whether Selected Work, Latest Writing, Testimonials, and article section headings should share a stronger common label system.
- Block quote identity: define a restrained long-quote treatment distinct from pullquotes.
- Local nav visual language: decide whether the interior pill nav should remain aside-like or become more integrated with the Blue Atlas system.
- Home nav visibility: decide whether homepage navigation should hide on initial load and reveal on scroll-up, or remain visible.
- Mobile composition rhythm: identify places where two-up cards, offset rows, or editorial clusters help without harming scan order or readability.

### Large / Ideation-Heavy Decisions
- Homepage BLUF mobile composition: create a phone-specific, more vertical arrangement of the existing wordmark that preserves its "big, bold, up front" first-viewport impact rather than simply shrinking the desktop lockup. Treat this as responsive recomposition rather than responsive scaling.
- Homepage hero motion: decide whether this belongs in this spike or should continue into `docs/scratch/animations.md`.
- Testimonials composition: decide whether sticky sidebar + card grid + dark screen material is the right section architecture.
- Writing section grammar: decide whether the bento layout and boxed label treatment still feel right next to Selected Work.
- Case-study detail reading voice: review whether the longform type system, retroterm code blocks, blockquotes, captions, and transition handoff form one coherent voice.

### Validation Plan To Decide Before Implementation
- Choose desktop and mobile viewports for visual review.
- Decide whether screenshots are enough for each item or whether interaction/motion QA is required.
- Run `corepack pnpm check` after any implementation pass that touches Vue, Sass, or generated editor CSS.
- Use human visual QA for any change whose success is taste, motion feel, or brand fit rather than terminal-verifiable behavior.

## Ready For Human QA
- Homepage BLUF hero: current direction is to explore removing the border and hard shadow so the blueprint/wordmark composition integrates with the page instead of reading as a card. Decide the resulting page relationship, hero extent, text force, and whether the blueprint field remains bounded in some quieter way before implementation. Implemented the first static candidate by making the hero region transparent and removing its outer border and hard shadow while preserving typography, diagram ornament, dimensions, spacing, clipping, and existing responsive behavior. Human QA should judge whether the desktop/tablet opening now feels integrated with the atlas rather than under-framed, and confirm only that phone behavior has not regressed; the intentional phone recomposition remains a separate To Do item. `corepack pnpm check` passed with the two existing `vue/no-v-html` warnings, and agent screenshot review at 1440px, 900px, and 390px confirmed the desktop/tablet integration without finding a new phone regression.

## Done
- [x] Surface harmony: direction agreed 2026-07-13. Raised panels should remain visibly separate lighter sheets laid over the atlas. Tune both sides in a roughly balanced way without converging on one color: make the `#f7f5ef` cream only slightly lighter and the `#fefefd` raised white a little warmer. Compare candidate pairs on Vital Info, writing cards/archive rows, testimonials, accordions, blockquotes, and representative media/table surfaces before settling the tokens. Implemented the first candidate with atlas ground `#f8f6f0`, raised paper `#fcfaf5`, lighter raised paper `#fdfbf7`, and matching translucent raised paper. Replaced the accordion toggle's literal white with the shared raised-paper token. `corepack pnpm check` passed with the existing `vue/no-v-html` warnings in `about.vue` and `now.vue`; agent screenshot review covered the homepage at desktop and phone sizes plus the writing archive without finding layout regressions. Human QA found the first raised paper a smidgen too dark, so the follow-up brightened it to `#fdfbf7` and advanced the lighter raised-paper variants while keeping the `#f8f6f0` atlas ground. Human QA should compare the homepage ground against Vital Info, Testimonials, and Latest Writing cards, then inspect a writing archive/detail page with accordions or blockquotes if available. Human QA approved the revised palette on 2026-07-13.
- [x] Promote the scratch brand-voice note into an active spike pair. Moved `docs/scratch/brand-voice.md` to `docs/active-spikes/brand-voice.md`, added active status and the operational doc link, created this to-do doc, and updated the project index.
- [x] Run a first source-and-doc audit before implementation. Confirmed several old scratch assumptions are stale (no current homepage nav, no current hero photo slot, testimonials default to light/screen material), identified the small browser-polish candidates as genuinely self-contained, and marked transition-sensitive detail surfaces as requiring motion QA before reskinning.
- [x] Validate the first browser-polish implementation slice. `corepack pnpm check` passed on 2026-07-10 with the existing `vue/no-v-html` warnings in `about.vue` and `now.vue`.
- [x] Text selection / highlighted text: choose a brand-compliant selection color and verify readability in long prose. Implemented as global primary-blue selection with cream foreground in `packages/styles/context-role/_vue-frontend.scss`; human QA confirmed the selection treatment looks great.
- [x] Mobile browser theme color: add or update `theme-color` if this belongs here rather than WCAG/SEO or production deploy. Implemented in `apps/frontend/nuxt.config.ts` as `#2657eb` primary electric blue for this first pass; human QA confirmed the theme color looks great.
- [x] Scrollbar styling: decide whether branded scrollbars are worth doing, and only pursue if subtle and usable. Implemented subtle primary-blue scrollbar thumbs with a warm-cream track in `packages/styles/context-role/_vue-frontend.scss`; human QA confirmed the scrollbars look great.
- [x] Video/embed caption follow-up: audit whether the embed-media-support work already fully put video/embed captions on the shared caption path. Source audit found `VideoBlock.vue` and `_embed-block.scss` already on the shared caption path; human QA confirmed captions appear solid, so no new implementation is needed.
