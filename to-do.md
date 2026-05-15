# My Website Progress

This document tracks where the project actually is now. It is deliberately practical: finished work is only work that exists in the repo, and CMS/editor polish is treated as active work rather than as solved parity.

## Current State

### Architecture And Runtime

- The repo is a working monorepo for a Nuxt SSR frontend and a headless WordPress CMS
- Nuxt runs on the host during development for Vite HMR
- WordPress, MariaDB, and Caddy run through Docker Compose
- Production-oriented Docker Compose files exist, including a frontend container and Caddy production config
- Node is pinned to `22`
- pnpm is pinned to `10.18.3`
- Root scripts cover local dev, Docker lifecycle, lint, typecheck, build, editor CSS generation, formatting, and block QA seeding
- WordPress core is pinned to `6.9.4`
- `wp-graphql` is pinned to `2.11.0`
- `wp-graphql-content-blocks` is pinned to `v4.8.4`
- ACF Pro can be installed from `docker/private-plugins/advanced-custom-fields-pro.zip` without committing the private zip

### Frontend App

- Nuxt 3 SSR is scaffolded and wired to WordPress data through GraphQL
- Homepage data comes from a mix of ACF front-page fields, posts, case studies, and footer settings
- Homepage has the first-pass BLUF hero, vital-info section, Selected Work section, Employer Testimonials section, Side Projects link section, Latest Writing section, and global footer
- The Writing archive route exists with cursor-based Load More pagination; case studies now browse from the homepage Selected Work section instead of a standalone archive
- Writing and case-study detail routes exist with loading, error, and not-found states
- Case-study detail pages include looping previous/next bottom navigation
- Featured media is queried for posts and case studies
- Post cards and case-study cards are visually distinct component families
- A minimal `/side-projects` holding page exists
- A first-pass `/about` page exists and is linked from the homepage vital-info section and footer fallback links
- The global footer is ACF-backed and redesigned as a tall electric-blue footer
- Interior pages use a small local `SiteNav` affordance (electric-blue, fixed, hide-on-scroll) in place of a full global navbar; the homepage has no nav bar
- Card-to-detail route transitions are custom, not Nuxt page transitions and not browser View Transitions
- Card hover/focus prefetch warms post/case-study detail data, featured media, and exact block renderer modules after detail data resolves
- Home and Writing listing surfaces are warmed for common return/archive navigation paths
- The project bootstrap plugin provides a short-lived public WPGraphQL response cache for repeated unauthenticated GraphQL query responses
- Non-hero article images default to lazy loading/async decoding, and preserved audio/video block media defaults to metadata preload
- Mega Gallery videos defer source attachment until the video tile nears the viewport
- Case-study and writing detail pages can transition back to their matching card surfaces from local navigation or browser back navigation when the source card exists
- Routes without a usable shared-media target use a snappy fade/slide fallback transition
- Internal footer links use client-side Nuxt navigation so fallback/shared transitions can run from the footer too
- Transition timing is centralized in the Sass motion palette and exported as CSS custom properties
- Route transition JavaScript reads CSS timing values where cleanup must match CSS
- The custom transition coordinator suppresses premature scroll-to-top jumps during card-to-detail transitions
- Shiki-backed code highlighting is wired with a custom Hopscotch-inspired theme

### CMS And Content Model

- Regular posts are the writing/blog content type
- `case_study` is registered as the evergreen case-study content type
- Pages remain available for Home and future one-off content
- About is currently a frontend standalone page, not a CMS-managed WordPress page
- The assigned WordPress front page uses ACF fields for structured homepage content
- The large Gutenberg body editor is hidden on the front page
- Footer settings are managed through an ACF-backed options/settings page
- The project bootstrap plugin handles CPTs, ACF fields, GraphQL field exposure, defaults, and QA tooling
- The editor-facing theme is `My Website Editor Theme`
- The project blocks plugin is `My Website Blocks`
- Unused default themes and Akismet are excluded from project-owned `wp-content`
- WordPress uploads are ignored by Git and treated as media/data, not source
- Frontend favicon is generated from the project source image and the WordPress admin Site Icon is bootstrapped programmatically

### Gutenberg Rendering

- Gutenberg block data is fetched through `editorBlocks(flat: true)`
- Frontend rendering starts at `BlockRenderer.vue`
- Recursive/nested block rendering is handled by `BlockChildren.vue`
- Unknown blocks are isolated through `UnsupportedBlock.vue`
- The block registry currently covers paragraph, heading, image, quote, list, group, columns, column, gallery, spacer, separator, code, preformatted, table, pullquote, embed, HTML fallback, buttons, button, media/text, audio, video, file, details, accordion, and Mega Gallery
- Cover and verse blocks are intentionally outside the current first-class frontend block surface
- Float-breakout grouping wraps left/right aligned images, quotes, and pullquotes with nearby compatible text blocks so frontend text can wrap in normal flow
- The default gallery block remains supported
- The project-owned `my-website/mega-gallery` block supports mixed image/video galleries with Masonry layout and PhotoSwipe lightbox; images and videos both open in the lightbox; the block has a columns control (1–6) and alignwide/alignfull support

### Styles And Design System

- `docs/design-system.md` documents the project vocabulary: palettes, context-roles, and shared-components
- Sass palettes define source values
- Context-role files emit runtime-specific CSS
- `_vue-frontend-component.scss` remains non-emitting and is injected into Vue SFC styles
- `_vue-frontend.scss` emits frontend global CSS, including token exports, page base, `.content-flow` grid/container structure, native fallback element hooks, and wrapper-level float-breakout behavior
- `_wp-editor.scss` emits WordPress editor CSS
- `_type-fonts.scss` owns the emitting font resource request; `_type-palette.scss` owns non-emitting type source values; paragraph, list, and heading styling lives in shared-component recipes
- Shared-component recipes exist for reusable block styling and, for classed frontend block components, their content-flow width/alignment declarations consumed by Vue SFC scoped styles
- IBM Plex Mono Italic is the current heading accent face; IBM Plex Serif has been removed from the article system
- The visual baseline is "non-brand academic": warm off-white body, near-black ink text, electric blue used sparingly, no purple accent
- `$color-accent` (purple) is fully removed from the palette and all consumers
- `$color-poster-black` has been removed; all prior uses were replaced with `$color-ink`
- Article body heading scale is applied directly in the shared heading-block recipe; `_type-palette.scss` keeps reusable type source values rather than one-off heading-level exports
- Footer is warm off-white with ink text; nav is surface-colored with a subtle border
- Generated `editor.css` is committed because WordPress loads CSS assets directly

### QA And Fixture Coverage

- `corepack pnpm check` regenerates editor CSS, then runs frontend lint and typecheck
- `corepack pnpm seed:cms:qa` creates or updates one QA post and one QA case study
- `corepack pnpm seed:cms:qa:more` creates or updates 30 fixture writing posts for archive load-more QA
- The QA fixture covers realistic text rhythm, nested lists, text alignment, quotes, pullquotes, image alignment, image breakout variants, gallery, Mega Gallery, media/text, columns, groups, code, tables, embeds, audio, video, file, details, accordion, separators, spacers, and buttons
- The writing load-more fixture gives each seeded post featured media, an excerpt, and a realistic mixed-block article body
- Local block QA routes: `http://qa.my-website.localhost/writing/block-qa-kitchen-sink-post` and `http://qa.my-website.localhost/case-studies/block-qa-kitchen-sink-case-study`
- The QA fixture is broad but not exhaustive. Some registered block renderers exist because WordPress may produce those blocks, even when they are not part of the preferred editorial workflow

## Completed

- Supersede the original `initial-prompt.md` planning doc with durable agent guidance in `AGENTS.md`
- Set up root workspace tooling and repo structure
- Scaffold Nuxt frontend app
- Scaffold WordPress app, bootstrap plugin, and editor theme
- Create shared SCSS package for palettes, frontend context-role styles, and selected shared component specs
- Pin WordPress GraphQL plugin versions for reproducibility
- Get Docker Desktop based local CMS stack working
- Verify structured Gutenberg block rendering from WordPress to Nuxt
- Move secrets workflow toward committed examples and untracked real env files
- Refactor the homepage into smaller Vue components
- Move semantic typography rules into shared global SCSS
- Pull homepage hero copy from WordPress with safe defaults
- Rename CMS theme and plugin labels away from portfolio language
- Stop tracking WordPress uploads in Git
- Add optional private-plugin installation flow for ACF Pro
- Move homepage hero editing to structured ACF fields on the front page
- Add ACF-backed homepage vital-info fields and footer site settings
- Add an ACF-backed Employer Testimonials homepage section with repeatable testimonial rows
- Add featured image GraphQL/frontend support for posts and case studies
- Add a first-pass About page and link it from homepage vital info plus footer fallback links
- Add looping previous/next bottom navigation to case-study detail pages
- Add reverse featured-media transitions from case-study detail pages back to homepage cards
- Add reverse featured-media transitions from writing detail pages back to homepage Latest Writing cards
- Add reverse featured-media transitions from writing detail pages back to matching writing archive cards
- Add cursor-based Load More behavior to the writing archive and seed 30 extra fixture posts for testing
- Preserve loaded writing archive state so older loaded posts can reverse-transition back to their archive cards
- Add fallback page-level fade/slide motion for route changes without a shared-media target
- Add prefetching and cache support for post/case-study detail navigation so clicked content appears immediately when warmed
- Add Home and Writing listing-surface prefetching for common return/archive navigation paths
- Add a short-lived public WPGraphQL response cache for repeated unauthenticated GraphQL query responses
- Split writing and case-study listing cards into separate component families
- Add custom featured-media transitions from post/case-study cards to detail heroes, including media, title, and writing metadata
- Add route scroll handling and detail-page guard states for more reliable SPA navigation
- Move route transition timing into the motion palette and have JS read the exported CSS duration for cleanup synchronization
- Document the project design-system terminology and reorganize the SCSS package around palettes, shared components, and context-roles
- Add and wire a WordPress editor context-role for shared editor styling
- Centralize font loading through the shared `_type-fonts.scss` context-role support partial and remove the separate Nuxt Google Fonts module / editor font shim
- Keep the compiled WordPress editor `editor.css` committed because WordPress loads CSS assets directly, not the Sass source
- Regenerate the WordPress editor stylesheet automatically as part of root `check` and `build`
- Stop tracking temporary reference assets and ignore future `temp-ref-assets/` / `temp-reference-assets/` folders
- Reorganize frontend component folders away from generic `layout`/`ui` buckets and into content, navigation, transitions, and home roles
- Start migrating authored Vue component classes away from BEM-style internals toward scoped semantic role/state classes
- Refactor navigation cards, detail pages, and the homepage hero toward scoped semantic role/state classes
- Finish the first pass of the authored Vue class-name refactor; remaining BEM-shaped frontend class names are WordPress/Gutenberg conventions
- Improve the editorial Gutenberg content-rendering baseline for common post/case-study body blocks
- Add Shiki-backed customizable syntax highlighting for code blocks
- Add frontend support for the core Accordion block
- Improve WordPress image alignment handling for left/right/center/full-width media
- Expanded the WP-CLI-powered block QA fixture with heading hierarchy, text alignment, nested lists, image alignment, width variants, media/layout block variants, embed variants, file/audio/video, details, accordion, spacer, separator, and button variants
- Style Case Study cards distinctly from Post cards
- Add Side Project page as a minimal scaffold with an empty-state holding message
- Remove BEM-style cruft and over-abstracted indirection from Vue components; component system is now legible and explicit
- Audit and replace hardcoded color values with CSS custom property references across cards, pages, and transitions
- Remove `$color-poster-black` from the color palette and migrate all uses to `$color-ink`
- Configure Prettier `vueIndentScriptAndStyle: true` and turn off conflicting ESLint indent rules so Vue SFCs indent on save
- Remove WordPress implementation class cruft from all block components where Vue controls the rendered markup
- Extract `BlockChildren.vue` for cleaner recursive/nested block rendering
- Redesign the site footer to be full-bleed electric blue, tall and spacious, with ACF-backed heading, footer links, and a GitHub source link
- Add a project license
- Refactor the article body onto a CSS named grid shell (`.content-flow`); normal, wide, full, tables, embeds, media/text, columns, and floated content place against named grid tracks instead of self-centering independently
- Implement float-breakout grouping (`.float-breakout-flow`) so left/right aligned images, quotes, and pullquotes pull adjacent copy into a shared shell item
- Extract editorial block visual recipes into individual shared-component SCSS files: `_quote-block.scss`, `_pullquote.scss`, `_details-block.scss`, `_accordion-block.scss`
- Distinguish accordion as grouped-panel exclusive-open behavior and details as a simple disclosure pattern
- Add a real download CTA with iconography to file blocks
- Remove IBM Plex Serif from the article system; IBM Plex Mono Italic is now the heading accent face, consolidated in `_type-palette.scss`
- Add a custom Hopscotch-inspired Shiki syntax theme (`utils/hopscotch-theme.ts`) faithful to the original tmTheme palette
- Complete the first pass of WordPress editor heading alignment work with rem-based heading track variables
- Expand block QA seed fixture with prose-interspersed quote/pullquote tests, multiple accordion items, normal vs. wide column variants, and live embed URLs
- Complete a first hardening pass of the article body system across common block families: text, headings, lists, quotes, pullquotes, images, gallery, tables, embeds, audio, video, media/text, columns, groups, code, files, details, accordion, buttons, and separators
- Add the custom `my-website/mega-gallery` Gutenberg block in the project blocks plugin
- Add frontend Mega Gallery rendering with Masonry layout and PhotoSwipe lightbox behavior
- Fix the mobile Mega Gallery Masonry layout so two-column mobile galleries do not show false vertical gaps within a single gallery
- Reduce `SiteNav` from a global primary navbar to a small local affordance on interior pages; remove the homepage SiteNav bar entirely
- Add homepage section anchors (`id="selected-work"`, `id="latest-writing"`) so contextual nav links land at the right section
- Remove the standalone `/case-studies` archive route; case studies now browse from the homepage Selected Work section
- Add a homepage Side Projects link section and a contextual "Read More" link from the Latest Writing section to the writing archive
- Adapt `SiteNav` per route: Home-only on case-study detail (→ `/#selected-work`), Home + Writing on writing detail, Home-only on all other interior pages
- Complete visual redesign toward "non-brand academic" baseline: remove `$color-accent` (purple), neutralize footer to warm off-white, calm nav to surface-colored with ink text, remove blue radial glow from body background, calm article block recipes (quote, accordion, code, file), override article body heading scale toward document rhythm, calm card visual weight, audit homepage sections for accent usage
- Restructure shared-component recipe files: consolidate single-callsite mixins inline, rename shell/root/base abstractions to match the block name, extract reusable layout helpers (`content-flow-child`, `heading-article-frame` with `@content`), move audio block styling to its own file, deduplicate WordPress editor wide/full wrapper expansion rules (now declared once on `.wp-block` rather than per-block)
- Complete the non-brand academic visual calm pass and style refactor spike; consolidate palette, context-role, and shared-component SCSS architecture
- Add Mega Gallery video tile support with deferred source attachment and PhotoSwipe lightbox integration
- Implement static generation to Bunny CDN with media upload, URL rewriting, and automated cache purge
- Achieve Lighthouse performance score of 97 via static CDN deploy
- Static deploy spike — static generation to Bunny CDN is working end-to-end, media upload/rewrite is automated, cache purge is integrated, the public/QA CMS split exists, local backup/restore exists, and the durable manual publish checklist lives in `docs/static-publish-runbook.md`; retired spike docs live in `docs/archive/`
- "Next case study" at the bottom of case study pages — implemented as looping previous/next navigation
- Smoother card-to-detail and detail-to-card transitions — implemented as the featured-media transition system
- Nav bar not showing "Writing" when on the writing archive — implemented per the contextual SiteNav model (writing archive shows Home only)

## In Progress

- updating docs in preperation for generative des (gendes) spike.

## Next

- Production deploy planning — custom domain, final DNS, production cache/header policy, metadata, rollback, and launch checklist; see `docs/scratch/production-deploy.md`
- About page — convert from frontend standalone to CMS-managed WordPress page; see `docs/scratch/about-page.md`
- Side projects page — author as a WordPress page with sections, not a CPT collection; see `docs/scratch/side-projects-page.md`
- Copy cleanup — remove LLM placeholder text throughout the site; see `docs/scratch/copy-cleanup.md`
- Update live WordPress ACF footer links manually if the saved Case Studies footer URL still points to `/case-studies`
- Homepage refinement — typography, rhythm, section field model, placeholder testimonials; see `docs/scratch/homepage.md`
- Add WordPress editor stylesheet regeneration to CMS bootstrap so the compiled `editor.css` stays current without a manual root `check` run

## Later

Work in this section is tracked as spike drafts under `docs/scratch/`. Promote a spike to a full `docs/` conceptual + to-do doc pair when it is ready for active development.

- Writing section improvements — `docs/scratch/writing-section.md`
- WCAG + SEO audit — `docs/scratch/wcag-seo.md`
- CI (lint, typecheck, build) — `docs/scratch/ci.md`
- Analytics — `docs/scratch/analytics.md`
- IndieWeb protocols — `docs/scratch/indieweb.md`
- ActivityPub — `docs/scratch/activitypub.md`
- Shop (WooCommerce, far future) — `docs/scratch/shop.md`
- Footnotes support — `docs/scratch/footnotes.md`
- idea stubs — `docs/scratch/future-ideas.md`

## Guardrails

- Keep local and production installs reproducible with pinned versions where possible
- Keep real credentials out of Git
- Prefer explicit architecture over clever shortcuts
- Preserve designer-friendly readability in the codebase
- Prefer stable editorial terminology when it already matches the real content behavior
- Add custom Gutenberg blocks only where core blocks are not enough
- Do not pursue perfect CMS/frontend visual parity at the expense of editor usability
