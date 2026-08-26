# My Website Progress
This document tracks where the project actually is now. It is deliberately practical: finished work is only work that exists in the repo, and CMS/editor polish is treated as an ongoing authoring-quality concern rather than as solved parity.

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
- The `/side-projects` page is a CMS-backed WordPress Page rendered through `BlockRenderer` with the `content-flow` article shell layout
- A first-pass `/about` page exists and is linked from the homepage vital-info section and footer fallback links
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
- Shiki-backed code highlighting is wired with Midnight, Phosphor, and Signal CRT-style themes plus a custom Enzo grammar
- Code blocks use a desktop-only local theme-dot selector; the selector is hidden on mobile so code remains quiet and readable

### CMS And Content Model
- Regular posts are the writing/blog content type
- `case_study` is registered as the evergreen case-study content type
- Pages remain available for Home and future one-off content
- About is a CMS-managed WordPress Page with a plain CMS title, ACF Display Heading for the public `h1`, Gutenberg body content, and portable frontend internal links
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
- IBM Plex Mono Italic is the current heading accent face for article and UI headings; IBM Plex Serif has been removed from the article system
- The homepage hero uses two additional licensed display fonts: Edwardian Script ITC (`--font-edwardian`) and Bodoni Z37 (`--font-bodoni`), registered via `@font-face` in `_type-fonts.scss` and exported as CSS custom properties. Font files live in `apps/frontend/public/fonts/` (gitignored; source copies in `docker/private-plugins/`). See `docs/scratch/hero-typography.md` for the open responsiveness spike.
- The current visual direction is "Blue Atlas": warm cream ground, near-black ink, electric blue (`#2657eb`) as a structural signal, blueprint/grid textures, hard offset shadows, thick panel outlines, a terminal-green accent in the Side Projects section. `docs/visual-design.md` is the source of truth for visual specifics. (This superseded the earlier "non-brand academic" baseline via the generative design spike.)
- `$color-accent` (purple) is fully removed from the palette and all consumers
- `$color-poster-black` has been removed; all prior uses were replaced with `$color-ink`
- Article body heading scale is applied directly in the shared heading-block recipe; `_type-palette.scss` keeps reusable type source values rather than one-off heading-level exports
- Footer is warm off-white (`$color-surface-warm`) with a signal-blue top border and mono uppercase links; interior nav uses a periwinkle-bordered pill treatment
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
- Add the initial Side Projects scaffold before the later CMS-backed Side Projects page spike replaced it
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
- Add Shiki-backed code highlighting, including the now-archived Hopscotch-inspired prototype and the active Midnight/Phosphor/Signal CRT-style themes
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
- Static deploy spike — static generation to Bunny CDN is working end-to-end, media upload/rewrite is automated, cache purge is integrated, the public/QA CMS split exists, local backup/restore exists, and the durable manual publish checklist lives in `skills/static-publish-runbook/SKILL.md`; retired spike docs live in `docs/archive/`
- About page CMS migration spike — `/about` is now a CMS-managed WordPress Page with a plain admin title, ACF Display Heading for the public `h1`, Gutenberg body content, normalized authored internal links, static generation compatibility, and archived spike docs in `docs/archive/`
- Side projects page spike — `/side-projects` is now a CMS-backed WordPress Page fetched via `queryWordPressPageByUri`, rendered through `BlockRenderer` with the `content-flow` article shell layout; no CPT, no archive
- Homepage refinement spike — homepage hero/top-region markup is route-local, Selected Work and Latest Writing are separate homepage-specific sections, testimonial and quick-link fallback behavior is intentionally obvious, and archived spike docs live at `docs/archive/homepage.md` and `docs/archive/homepage.todo.md`
- "Next case study" at the bottom of case study pages — implemented as looping previous/next navigation
- Smoother card-to-detail and detail-to-card transitions — implemented as the featured-media transition system
- Nav bar not showing "Writing" when on the writing archive — implemented per the contextual SiteNav model (writing archive shows Home only)
- Writing section spike — replaced lorem ipsum on `/writing` with real copy; added `canonical_url` ACF field on posts, `canonicalUrl` on the `Post` GraphQL type, and `useHead` canonical link in `writing/[slug].vue` for Medium cross-posts; fixed pre-existing `ogType` type narrowing error in `useSiteSeoMeta.ts`
- WCAG + SEO pass 1 baseline spike — landmark/heading audit, focus-visible global fallback, `htmlAttrs.lang`, `useSiteSeoMeta` composable for all routes (OG/Twitter metadata, article og:type, featured media og:image), reduced-motion fallbacks, `editorBlocks` stripped from static payloads to prevent local CMS URL leakage; durable accessibility/SEO contract folded into `AGENTS.md` and `docs/visual-design.md`
- Generative design spike — explored multiple visual directions across branches (`gendes-systems-atlas`, `gendes-blue1`, `gendes-blue1.1`–`gendes-blue1.7`, then synthesis branches `gendes-blue2.*`), audited them section-by-section, and synthesized a winner. The chosen direction — "Blue Atlas" — was merged to main via `gendes-blue.synth`. Durable direction folded into `docs/visual-design.md`; archived spike docs (methodology, to-do, and synthesis brief) live at `docs/archive/gendes.md`, `docs/archive/gendes.todo.md`, and `docs/archive/gendes-brief.md`
- WordPress editor stylesheet auto-regen on CMS bootstrap — `docker:up` and `docker:up:all` now prefix with `corepack pnpm styles:wp-editor`, so `editor.css` is regenerated on every `start:cms:public` / `start:cms:qa` (or any direct `docker:up*`) without requiring a manual `check` first. Matches the prefix pattern already used by `build`, `check`, and the `generate:static:*` / `static:generate*` scripts.
- Homepage hero typography spike — the "Bottom / Line / Up Front" B.L.U.F. wordmark ported from `gendes-blue2.claudecode` and made responsive via container-query units against a tunable design canvas (`--hero-canvas-w` / `-h` / `--hero-max-vh` on `.hero-display`). Hardcoded markup; the orphaned hero ACF fields (`mega_text` / `hero_title` / `hero_subtitle`) and their GraphQL exposure were removed, including stored postmeta in both running CMS instances. Phone gets a more landscape aspect with "Up Front" enlarged as the lower anchor. Archived spike docs live at `docs/archive/hero-typography.md` and `docs/archive/hero-typography.todo.md`
- Case-study hero spike — **closed 2026-06-17**. Settled the homepage Selected Work composition (text-dominant rows with photo interruptions, a phrased silhouette score) and the layered case-study detail hero (photo plate + cream column layered over it, giant corner sweep, halftone committed at 11px to match the transition clone), plus per-case-study ACF authorability (row layout, text alignment, photo treatment). Durable lessons folded into `docs/visual-design.md` ("Surface Notes → Case studies"); spike docs archived at `docs/archive/case-hero.md` / `docs/archive/case-hero.todo.md`. The cross-navigation morph it spawned was spun out into the featured-media-transition spike.
- Featured-media transition spike — **closed 2026-06-23**. Custom card↔detail featured-image + title morph across page navigation. Settled: clone geometry, preflight slip system (archive row date/excerpt exit before clone launches), writing detail slip-in animations, scroll-proof body exit, and gating the clone on its image being painted. Durable motion contract folded into `AGENTS.md` → "Route Transition and Motion Rules" and `docs/design-system.md`; spike docs archived at `docs/archive/featured-media-transition.md` / `.todo.md`.
- Writing surfaces spike — **closed 2026-06-24**. Settled the homepage Latest Writing CSS bento layout (`HomeBentoPostList.vue`), writing archive year-grouped slip-row list (`WritingArchiveList.vue` + `PostArchiveRow.vue`), and writing detail hero (plain photo plate + layered cream header box, no image treatment — deliberate divergence from case-study halftone register). Durable lessons folded into `docs/visual-design.md` ("Surface Notes → Writing surfaces"); spike docs archived at `docs/archive/bento-writing.md` / `.todo.md`.
- Surgical-synth polish — **closed 2026-06-25**. Post card rounded corners (`border-radius: 8px`), Latest Writing section banner restructure (card → two blue rule lines, circle breakout), navigation link pattern unified (`rich-link` mixin + `→` arrow nudge). Durable lessons folded into `docs/visual-design.md` ("Surface Notes → Cards"); archived at `docs/archive/surgical-synth.md` / `.todo.md`.
- Content blocks polish spike — **closed 2026-06-28**. Completed the broad Gutenberg block polish pass across headings, quotes, tables, embeds/video, file/download, details/accordion, inline code, media/text, gallery, Mega Gallery media frames, floated images, and editor captions. Settled the core Gallery model: respect CMS column/crop/alignment controls, preserve left-to-right authored row grouping, cap mobile composition at three columns, and reserve Masonry/PhotoSwipe browsing behavior for Mega Gallery. Custom browser-independent audio player work was split into its own follow-up spike and later closed at `docs/archive/audio-player.md` / `.todo.md`. Durable lessons folded into `AGENTS.md` and `docs/design-system.md`; archived at `docs/archive/content-blocks.md` / `.todo.md`.
- Custom audio player spike — **closed 2026-06-29**. Replaced browser-default WordPress audio controls with a progressive frontend custom player: native SSR fallback, real `HTMLAudioElement`, native `button` and `input[type='range']`, custom-drawn rail/thumb, shared caption styling, small blue play/pause glyph, and mobile-safe layout. Settled that wide/full audio collapses to the content column on phone, and that root audio `<figure>` margins must be reset to avoid hidden horizontal overflow. Durable lessons folded into `AGENTS.md` and `docs/design-system.md`; archived at `docs/archive/audio-player.md` / `.todo.md`.
- Syntax highlighting improvements spike — **closed 2026-06-29**. Retuned the Shiki-backed Midnight/Phosphor/Signal code themes, especially Midnight's hue-scalar semantics and Signal's Enzo flow keywords; replaced the fixed floating selector with a quiet desktop-only local dot rail; hid selector chrome on mobile; and added restrained CRT depth without distortion or readability loss. Durable lessons folded into `AGENTS.md`, `docs/design-system.md`, and `docs/visual-design.md`; archived at `docs/archive/syntax-highlighting.md` / `.todo.md`.
- Image lightbox spike — **closed 2026-06-29**. Standardized the existing PhotoSwipe-based lightbox system, branded PhotoSwipe chrome for Blue Atlas, and extended lightbox behavior to normal Image blocks, floated images, core Gallery sequences, footnote images, Mega Gallery images/videos, and default/wide Media/Text images. Settled: PhotoSwipe remains the single lightbox substrate; core Gallery sequences are per-gallery; standalone images are single-slide; intentional external/custom image links are preserved; media-file image links are intercepted; previous/next controls use slit-slip `←` / `→`; the redundant zoom button is hidden. Durable lessons folded into `AGENTS.md`, `docs/design-system.md`, and `docs/visual-design.md`; archived at `docs/archive/lightbox.md` / `.todo.md`.
- Image resizing spike — **closed 2026-06-30**. Preserved Gutenberg drag-resized image width intent through the Nuxt image block renderer, including WordPress's `img style="width:...px;height:auto"` `is-resized` output; added default/center resized image sizing, resized-float shell math, explicit extra-large desktop float breakout, constrained phone float behavior, CMS editor approximation, and footnote/sidenote safeguards around floated images. Durable lessons folded into `AGENTS.md` and `docs/design-system.md`; archived at `docs/archive/image-resizing.md` / `.todo.md`.
- WordPress editor polish spike — **closed 2026-06-30**. Small CMS authoring pass for editor inline-code visibility and footnote link styling. Reused shared inline-code and rich-link recipes through editor-specific selectors and variables, keeping the editor useful without chasing exact frontend parity. Durable lesson folded into `docs/design-system.md`; archived at `docs/archive/editor-polish.md` / `.todo.md`.
- Table of Contents spike — **closed 2026-07-06**. Added article outline apparatus for long writing posts and case studies: rendered through `BlockRenderer`'s apparatus slot, scans `h2` through `h6`, tracks active section, scrolls with hash updates, starts open on desktop then auto-collapses, supports manual reopen, suppresses short posts, and uses an in-flow collapsed mobile/tablet Contents block. Settled the low-priority left-rail model where authored content paints above the TOC and cream underlap mattes/backgrounds quiet overlaps. Durable lessons folded into `AGENTS.md`, `docs/design-system.md`, and `docs/visual-design.md`; archived at `docs/archive/table-of-contents.md` / `.todo.md`.
- Footnotes spike — **closed 2026-07-08**. Implemented native WP core footnotes with progressive enhancement: desktop right-margin sidenotes with collision-aware positioning and truncation handling, in-note fallback for overflow/compositional contexts, mobile bottom-sheet interaction, and canonical endnotes list as baseline/print path. Durable implementation notes and follow-through live in `docs/archive/footnotes.md` / `.todo.md`.
- Now page spike — **closed 2026-07-08**. Settled the single-source Now model: About page `now_content` as canonical content, mirrored on `/now`; route-level nav suppression for `/now`; shared portrait sourcing from About body content; and About-page Now composition alignment adjustments. Human QA signed off spike-close readiness. Archived at `docs/archive/now-page.md` / `docs/archive/now-page.todo.md`.
- Mobile polish spike — **closed 2026-07-08**. Fixed case-study card right-edge clipping and inter-card seam consistency without relying on section-level overflow clipping; tuned layered mobile bodyplate breathing room after hero handoff. Human QA signed off the result. Archived at `docs/archive/mobile-polish.md` / `docs/archive/mobile-polish.todo.md`.
- Embed-media-support spike — **closed 2026-07-08**. Completed provider-aware embed support follow-through: Sketchfab provider registration + rendering path, shared caption alignment improvements, float-breakout integration for embed/video blocks, and stabilized native `core/video` cap behavior using shared cap token + runtime metadata ratio. Closed with `corepack pnpm check` passing and human QA signoff. Archived at `docs/archive/embed-media-support.md` / `docs/archive/embed-media-support.todo.md`.
- CI and developer convenience commands spike — **closed 2026-07-10**. Added `corepack pnpm start:all` for restarting the public + QA CMS stack plus Nuxt in one foreground terminal, and `corepack pnpm generate:preview` for generating static output from the public CMS and starting the local static preview server. Explicitly declined GitHub Actions / CI work and one-shot generate-and-CDN-deploy work for this spike. Closed with `corepack pnpm check` passing and human QA signoff for both commands. Archived at `docs/archive/ci.md` / `docs/archive/ci.todo.md`.
- Brand voice & visual consistency spike — **closed 2026-07-29**. Settled the responsive BLUF hero across all three breakpoints (wide-desktop horizontal wordmark with the portrait border splitting the `UP FRONT` T, tablet taller lockup, phone "framed portrait" magazine cover), made the hero portrait CMS-swappable via an ACF image field, tuned surface warmth, polished the (intentionally bespoke) section labels, and shipped browser-chrome polish (selection colour, scrollbars, theme-color). Reviewed elevation grammar (coherent, no change) and block-quote / local-nav treatments (both fine as-is). Routed the ambient-motion / reaction-diffusion / featured-media transition-jank material out to `docs/scratch/animations.md` for a future Animation spike. Durable lessons folded into `README.md`, `AGENTS.md`, and `docs/visual-design.md`; archived at `docs/archive/brand-voice.md` / `docs/archive/brand-voice.todo.md`.
- Deploy performance spike — **closed 2026-08-19**. Replaced serial Bunny uploads with bounded concurrency, added retry with exponential backoff for transient failures, and conservatively skips media whose checksum already matches remote storage. A real preview deploy confirmed the process is “way faster.” Static-output checksum skipping was deliberately declined because its smaller gain did not justify stale-publish risk; a documented `-- --force` escape hatch can re-upload all referenced media when the remote copy is suspect. Continues from static-deploy; archived at `docs/archive/deploy-performance.md` / `docs/archive/deploy-performance.todo.md`.
- Content, TOC, and underlap fixes spike — **closed 2026-08-19**. Made cream underlap clearing explicit article apparatus; preserved File/Accordion and other component surfaces above it; removed matte leakage from Side Projects and the editor; aligned TOC collision geometry with painted block surfaces; stabilized settled-entry visibility; moved the rail left; delayed symmetric desktop auto-collapse to `200vh`; and fixed mobile heading navigation by settling the in-flow list before smooth scrolling. Durable rules live in `AGENTS.md` and `docs/design-system.md`; archived at `docs/archive/content-toc-underlap.md` / `docs/archive/content-toc-underlap.todo.md`.
- Production deploy spike — **closed 2026-08-26**. Moved the public static site from a dead Vercel target to Bunny at canonical `www.aslanfrench.work`, preserving DreamHost DNS and mail; made static output self-contained; shipped correct canonical/social/discovery metadata; added verified release retention, artifact-only rollback, cache/security verification, and hash-locked obsolete-file pruning; and moved QA-only posts out of public content. Static generated-file checksum skipping and pre-cutover TTL reduction were deliberately declined, HSTS was declined for the read-only portfolio threat model, and broader live visual review remains ordinary user-owned maintenance. Durable operations live in `skills/static-publish-runbook/SKILL.md`, `README.md`, and `AGENTS.md`; archived at `docs/archive/production-deploy.md` / `docs/archive/production-deploy.todo.md`.

## In Progress
- Animation & motion spike — umbrella for making the Blue Atlas feel more alive. **Shipped: the homepage reaction-diffusion skin, Android tilt behavior, Conway on the Side Projects card, and slit-slip arrows.** Current production-context QA covers selected pointer-proximity headings, case-study catalog/parallax/halftone treatment, testimonial signal/texture alternatives, bento-card depth, Selected Work accent materials, writing transitions, and article margin organisms. Rejected viewport-entry/exit and alternate heading models have been removed. Continues from brand-voice. Active docs: `docs/active-spikes/animation.md` / `docs/active-spikes/animation.todo.md`.

## Next
- Update live WordPress ACF footer links manually if the saved Case Studies footer URL still points to `/case-studies`

## Later
Work in this section is tracked as spike drafts under `docs/scratch/`. Promote a spike to a full `docs/active-spikes/` conceptual + to-do doc pair when it is ready for active development.

Deferred design-refinement spikes (follow-on from the generative design direction; surgical, not generative):

- Writing surfaces (bento layout + detail hero) — shipped; see "Completed" and `docs/archive/bento-writing.md`.
- Case-study composition and card title treatment — shipped via the (now-closed) case-hero spike; durable result in `docs/visual-design.md` → "Surface Notes → Case studies".
- Signal-blue value — whether to stay at `#2657eb` or move to a more saturated cobalt. Tabled.

Other drafts:

- WCAG + SEO qualitative pass 2 — `docs/scratch/wcag-seo2.md`
- Analytics — `docs/scratch/analytics.md`
- IndieWeb protocols — `docs/scratch/indieweb.md`
- ActivityPub — `docs/scratch/activitypub.md`
- Shop (WooCommerce, far future) — `docs/scratch/shop.md`
- idea stubs — `docs/scratch/future-ideas.md`

## Guardrails
- Keep local and production installs reproducible with pinned versions where possible
- Keep real credentials out of Git
- Prefer explicit architecture over clever shortcuts
- Preserve designer-friendly readability in the codebase
- Prefer stable editorial terminology when it already matches the real content behavior
- Add custom Gutenberg blocks only where core blocks are not enough
- Do not pursue perfect CMS/frontend visual parity at the expense of editor usability
