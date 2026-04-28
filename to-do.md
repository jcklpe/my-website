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
- The block registry currently covers paragraph, heading, image, quote, list, group, columns, column, gallery, cover, spacer, separator, code, preformatted, table, pullquote, embed, HTML fallback, verse, buttons, button, media/text, audio, video, file, details, accordion, and Mega Gallery
- Float-breakout grouping wraps left/right aligned images, quotes, and pullquotes with nearby compatible text blocks so frontend text can wrap in normal flow
- The default gallery block remains supported
- The project-owned `my-website/mega-gallery` block supports mixed image/video galleries with Masonry layout and PhotoSwipe lightbox; images and videos both open in the lightbox; the block has a columns control (1–6) and alignwide/alignfull support

### Styles And Design System

- `design-system.md` documents the project vocabulary: palettes, context-roles, and shared-components
- Sass palettes define source values
- Context-role files emit runtime-specific CSS
- `_vue-frontend-component.scss` remains non-emitting and is injected into Vue SFC styles
- `_vue-frontend.scss` emits frontend global CSS
- `_wp-editor.scss` emits WordPress editor CSS
- `_type-palette.scss` owns font imports and editorial type defaults
- `_structural-relations.scss` owns the `.content-flow` grid, block rhythm, normal/wide/full placement, and float-breakout shell behavior
- `_wordpress-blocks-baseline.scss` is now a small WordPress normalization layer, not the main article layout system
- Shared-component recipes exist for code, image, quote, pullquote, details, and accordion styling
- IBM Plex Mono Italic is the current heading accent face
- IBM Plex Serif has been removed from the article system
- `$color-poster-black` has been removed from the color palette; all prior uses were replaced with `$color-ink`
- The effect palette uses Sass color palette variables instead of hardcoded hex values
- Hardcoded `black` values in card, page, and transition components have been replaced with `var(--color-ink)`
- Generated `editor.css` is committed because WordPress loads CSS assets directly

### QA And Fixture Coverage

- `corepack pnpm check` regenerates editor CSS, then runs frontend lint and typecheck
- `corepack pnpm cms:seed-block-test-content` creates or updates one QA post and one QA case study
- `corepack pnpm cms:seed-writing-load-more-content` creates or updates 30 fixture writing posts for archive load-more QA
- The QA fixture covers realistic text rhythm, nested lists, text alignment, quotes, pullquotes, image alignment, image breakout variants, gallery, Mega Gallery, media/text, columns, groups, code, tables, embeds, audio, video, file, details, accordion, separators, spacers, and buttons
- The writing load-more fixture gives each seeded post featured media, an excerpt, and a realistic mixed-block article body
- Local block QA routes: `http://my-website.localhost/writing/block-qa-kitchen-sink-post` and `http://my-website.localhost/case-studies/block-qa-kitchen-sink-case-study`
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
- Split writing and case-study listing cards into separate component families
- Add custom featured-media transitions from post/case-study cards to detail heroes, including media, title, and writing metadata
- Add route scroll handling and detail-page guard states for more reliable SPA navigation
- Move route transition timing into the motion palette and have JS read the exported CSS duration for cleanup synchronization
- Document the project design-system terminology and reorganize the SCSS package around palettes, shared components, and context-roles
- Add and wire a WordPress editor context-role for shared editor styling
- Centralize font loading through the shared type palette and remove the separate Nuxt Google Fonts module / editor font shim
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
- Complete the first pass of WordPress editor heading alignment work with rem-based heading lane variables
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

## In Progress

- Refine the front page information architecture and first-pass visual system before going deeper on polished motion
- Continue refining the shared styles package as new real component needs appear
- Keep the frontend article style moving toward a lower-noise, calmer editorial baseline
- Keep CMS/editor styling pragmatic and usable without trying to achieve perfect frontend parity
- Continue calibrating WordPress editor headings, lists, wide/full alignments, media, columns, separators, details, and embeds
- Continue using the frontend as the source of truth for final visitor-facing rendering
- Harden the Mega Gallery block now that the first working version exists
- Refine archive/index page copy and structure so placeholder language does not ship

## Next

- Continue migrating useful surface styling from previous theme projects without importing old layout or React patterns
- Build the front page in structured passes:
  - Refine the hero section typography, rhythm, and eventual electric-blue texture treatment
  - Refine homepage contextual links now that the full homepage nav bar has been removed
  - Replace placeholder Employer Testimonials copy with real employer quotes once content exists
  - Refine vital info / quick links layout and link styling
  - Refine Latest Writing cards separately from Case Study cards
- Decide the homepage field model for the new front-page sections:
  - section headings / optional intros where needed
  - optional controls for which content appears in each homepage section
  - richer footer links/content if the current settings fields become too small
- Decide whether About should stay as a frontend standalone page or become a CMS-managed page later
- Normalize post excerpts and other text fields for frontend display across all listing/detail views
- Consider extracting detail-page shells for writing and case studies if they keep converging
- Establish a small reusable frontend component vocabulary
- Improve editor theme and block plugin structure on the CMS side
- Run checks with impeccable.style skills for crit
- Decide later whether the WordPress editor stylesheet should also be regenerated during CMS bootstrap/deploy, beyond the root `check` and `build` commands
- Decide whether any shared component recipes should become public classes, explicit mixins, or both as real usage emerges
- Add footnote support, potentially requiring a plugin
- Add prefetching for post/case-study detail data from cards so clicked content appears immediately
- Finish a focused CMS editor usability pass:
  - verify h2-h6 alignment against paragraph text
  - verify list marker/content alignment in the editor
  - verify wide and full media sizes in the editor
  - verify full-width columns stay full width on desktop and collapse only on small screens
  - verify embeds respect wide/full alignment and sensible viewport height caps
  - verify details, separators, and media layout blocks are visible and usable
- Do a frontend article calm pass against real QA content:
  - tune vertical rhythm
  - reduce decorative noise where it distracts from reading
  - confirm captions, links, separators, and pullquotes feel intentional
  - test mobile reading flow for floats, galleries, and wide/full blocks
- Harden Mega Gallery:
  - improve keyboard and screen-reader behavior
  - decide how captions should display in the grid and lightbox
  - improve editor preview behavior
  - support Sketchfab 3D model embeds if that still belongs in the block
  - support seamless looping video where editorially useful
  - document the block's intended editorial use
- Clean up visitor-facing placeholder copy:
  - remove "Date-driven notes, essays, and updates" from the Writing index
  - remove "Evergreen work, research, and project documentation" from Case Studies surfaces if it still feels wrong
  - keep "Case Studies" as a utility link label where clarity matters
- Update live WordPress ACF footer links manually if the saved Case Studies footer URL still points to `/case-studies`
- Continue hardening the route transition system:
  - refine detail-to-detail transitions now that case-study bottom navigation exists
  - decide how scroll restoration should work for back/forward navigation
  - keep route motion tokens centralized in the motion palette as more timings appear
- Add production-focused deployment docs for Vultr
- Add production readiness docs:
  - server setup
  - production env files
  - deployment steps
  - backups and uploads strategy
  - plugin/license handling
  - rollback expectations
- Add CI for lint, typecheck, and production build

## Later

- Flesh out the "writing" index page to be fuller fleshed out.
- Restyle the nav bar menu links to look different.
- make it so that the nav bar doesn't show "Writing" when you are on the writing page
- Side projects page is really just going to be a page with a couple of sections, not a collection of links or custom post types in the way that Case Studies or Posts are.
- Add canonical link support stuff for blog posts so that that blogs that have already been published on Medium don't suffer SEO issues.
- redesign the paragraph links to be cleaner, so that they are just a color with no underline and then have some animation on hover.
- Change styling for Latest Writing header to be left aligned.
- make both the Latest Writing and Selected Works section headers bigger.
- add parallax mouse effects to card previews? that's a thing we had in Jackalope theme. I still kind of like it but perhaps too extreme or maybe hard to implement in vue idk
- continue testing left and right aligned pictures with real WordPress content and refine text wrapping where needed.
- Fix the navigation links to have a white underline at first (that does morph to black as it does the little up block animation)
- Remove "File Under" on the Writing index page. Also remove the "data driven notes , essays, and updates" stuff.
- add richer syntax themes and project-specific language grammars as real code samples appear.
- break the blockiness of the post where it meets the Hero image. It should perhaps like overlap slightly or use the clip path. Perhaps both.
- Add "next case study" at the bottom of the Selected Work case studies so that once someone is done reading it they can scroll to the next one. Make a good transition for that.
- Make transitions from posts/case studies to home so that things are smoother. It might not work with posts that well, but at least case studies could return back to their location as a shared element on the home page I think.
- make sure everything passes WCAG automated tests
- Make sure everything performs well on Lighthouse type tests
- Make sure SEO is good. For whatever that matters I guess.
- Add a Side Projects section to the front page. But it won't be like a preview, it will just be a big section labeled that. And maybe some previews, but it's really just going to be a page/article that I update with pictures and links to projects. It won't be a collection of a custom post type.
- We probably need to do a content strategy discussion too because
- add analytics? maybe Matomo or something?
- get rid of the "Evergreen work, research, and project documentation" stuff in the Case Studies "Filed Under" section on the homepage.
- Plan a WooCommerce-backed shop replacement for the current Shopify site
- Preserve the future shop subdomain pattern, likely `shop.aslanfrench.work`
- Decide how the shop frontend should share the current Nuxt/WordPress architecture without over-coupling commerce to editorial content
- Explore WooCommerce data access patterns for the Nuxt frontend, including REST, GraphQL, cart/session behavior, checkout, and payment constraints
- Continue the custom multimedia gallery block as the replacement for the default gallery where richer mixed media is needed. Remaining goals: Sketchfab 3D model embeds, seamless looping video, stronger captions, stronger editor UX, and mixed-media lightbox behavior.
- Potentially add password protection for case studies
- Add IndieWeb and ActivityPub protocol features
- Add canonical link fix for Medium posts and document the exact problem later
- Introduce custom Gutenberg blocks only where core blocks are insufficient
- Expand page transitions beyond the current card-to-detail path so home/detail/back and detail-to-detail navigation feel equally intentional
- Build the more ambitious homepage motion system:
  - small local nav affordances can hide/reveal where useful
  - interior-page nav hides until upward scroll and then floats back in
  - shared-element style transitions centered around preview and hero media

## Guardrails

- Keep local and production installs reproducible with pinned versions where possible
- Keep real credentials out of Git
- Prefer explicit architecture over clever shortcuts
- Preserve designer-friendly readability in the codebase
- Prefer stable editorial terminology when it already matches the real content behavior
- Add custom Gutenberg blocks only where core blocks are not enough
- Do not pursue perfect CMS/frontend visual parity at the expense of editor usability
