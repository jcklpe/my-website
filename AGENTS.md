# Agent Instructions
This is the shared repo contract for AI coding tools working on this project. Read this first, then use `README.md`, `docs/design-system.md`, and `TODO.md` for deeper context before large changes.

Read `docs/code-style.md` before broad refactors or style-shaping work. It captures the project's readability preferences and should guide judgment where automated tooling is silent.

## Documentation Structure
Project docs are organized as follows:

- **Root**: `README.md`, `AGENTS.md`, `TODO.md` — the three most important docs; kept at the root by convention. Read these first.
- **`docs/`**: Durable reference docs and process-adjacent docs that should remain stable while spikes come and go.
- **`docs/active-spikes/`**: Active spike conceptual/todo doc pairs.
- **`docs/scratch/`**: In-progress or on-deck docs not yet ready for prime-time use. Treat as drafts. `docs/scratch/misc.md` is the live inbox for loose notes, and `docs/scratch/future-ideas.md` is for conceptual someday material.
- **`docs/archive/`**: Retired docs from finished work spikes. May be out of date. Do not treat as current guidance. Kept for historical context.
- **`docs/decisions/`**: Durable decision records for long-lived tradeoffs.

## Local Skills Authority
When this repo has `skills/`, repo-local skills are project authority. Prefer `skills/<skill-name>/SKILL.md` over similarly named global skills. Global skills are fallback seed material, not project rules.

This repo's workflow is skills-first:

- `skills/run-project-spike/SKILL.md`
- `skills/commit-work/SKILL.md`
- `skills/triage-project-misc/SKILL.md`
- `skills/pin-issue/SKILL.md`
- `skills/log-future-idea/SKILL.md`
- `skills/update-local-skills/SKILL.md`
- `skills/setup-project-docs/SKILL.md`
- `skills/setup-local-skills/SKILL.md`
- `skills/static-publish-runbook/SKILL.md`

### Spike Work Pattern
The project uses a two-doc pattern for focused work spikes:

1. **Conceptual doc** (e.g. `docs/active-spikes/redesign.md`) — background, design rationale, constraints, and guiding principles for the work. Lives in `docs/active-spikes/` while active, moves to `docs/archive/` when retired.
2. **To-do doc** (e.g. `docs/active-spikes/redesign.todo.md`) — the concrete, atomic, operational breakdown of the work. Follows the format: Background → General principles → Current State Overview → To Do → Ready for human visual QA → Done.

When starting a new spike: create a conceptual doc first, then generate the to-do doc from it. When retiring a spike: fold the durable lessons into `AGENTS.md`, `README.md`, `docs/design-system.md`, or `TODO.md` as appropriate, then move both docs to `docs/archive/`.

Use `skills/run-project-spike/SKILL.md` for the fuller workflow. When a spike reaches a completion boundary that should be committed, use `skills/commit-work/SKILL.md` rather than ad hoc git commands. In particular, `Done` sections in spike todo docs are allowed to preserve implementation history, and `Ready for Human QA` is the holding area for browser/editor/copy checks that need the user’s eyes before moving to `Done`.

Loose observations start in `docs/scratch/misc.md`, not in active spike docs. Periodically route them into existing scratch docs, new thematic scratch docs, or numbered miscellaneous spike buckets. Preserve the user's nuance and replace the latest routing-session note instead of keeping an infinite history. See `skills/triage-project-misc/SKILL.md`.

### Pinned Issues And Future Ideas
Use `docs/pinned-issues.md` for unresolved issues the user explicitly wants to "put a pin in" or otherwise revisit later. A pinned issue is not forgotten work and not necessarily a task. It should briefly capture the issue, current context, and when to revisit it.

Use `docs/scratch/future-ideas.md` for conceptual someday material that is more coherent and farther-horizon than raw misc intake, but not ready for active spike work.

Keep raw observed friction, QA nits, bugs, and issue intake in `docs/scratch/misc.md` until triage routes them elsewhere.

## Project Overview
This repo is a headless WordPress plus Nuxt SSR website.

- Nuxt is the public frontend.
- WordPress is the CMS, admin, and content API.
- Docker Compose is the canonical local infrastructure for WordPress, MariaDB, and Caddy.
- Nuxt runs on the host during development for fast Vite HMR.
- The original SSR/Docker Compose production path remains a fallback. The current preferred public-delivery direction is static generation from local WordPress content, command-driven preview/deploy, and CDN/static hosting; custom production-domain launch remains a future spike.
- Design is intentionally art-directed and manual. Engineering should stay boring, reproducible, and readable.

The code should remain approachable to a designer who can read Vue and WordPress theme/plugin code. Prefer explicit markup and clear data flow over clever abstractions.

## Architecture and Stack
- `apps/frontend`: Nuxt 3, Vue 3, SSR, Vite, TypeScript, SCSS.
- `apps/cms`: WordPress runtime source, project plugins, editor theme, and bootstrap scripts.
- `packages/styles`: Sass palettes, context-roles, and shared-component recipes.
- `docker`: Docker Compose and Caddy configuration.

Important local URLs:

- Frontend via Nuxt: `http://127.0.0.1:3001`
- Public frontend via Caddy: `http://my-website.localhost`
- QA frontend via Caddy: `http://qa.my-website.localhost`
- Public CMS via Caddy: `http://cms.my-website.localhost`
- QA CMS via Caddy: `http://qa.cms.my-website.localhost`
- Public GraphQL endpoint: `http://cms.my-website.localhost/graphql`
- QA GraphQL endpoint: `http://qa.cms.my-website.localhost/graphql`
- Direct public CMS container URL for local SSR/dev requests: `http://127.0.0.1:8080`
- Direct QA CMS container URL for local SSR/dev requests: `http://127.0.0.1:8081`

## Canonical Workflow
- Node is pinned by `.nvmrc` to Node `22`.
- pnpm is pinned by the root `packageManager` field to `pnpm@10.18.3`.
- Use `corepack pnpm` from the repo root.
- Use Docker Compose for the CMS stack.
- Do not make DDEV the canonical runtime. It may be considered later as a local convenience layer only.
- Do not assume global tooling beyond what the repo documents.
- Commit only through `skills/commit-work/SKILL.md`, either when the user explicitly asks for a commit or when a repo-local spike workflow explicitly calls for a completion-boundary commit.
- The user handles GitHub pushes by default; never push unless explicitly asked.

Common commands:

- `corepack pnpm install`
- `corepack pnpm start:frontend`
- `corepack pnpm docker:up`
- `corepack pnpm docker:up:all`
- `corepack pnpm docker:down`
- `corepack pnpm docker:down:all`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm check`
- `corepack pnpm build`
- `corepack pnpm styles:wp-editor`
- `corepack pnpm start:all`
- `corepack pnpm seed:cms:qa`
- `corepack pnpm start:cms:qa`
- `corepack pnpm start:cms:public`
- `corepack pnpm backup:cms:public`
- `corepack pnpm list:backups:cms:public`
- `corepack pnpm restore:cms:public -- .backups/cms/content/<timestamp> --yes`
- `corepack pnpm restore:cms:qa -- .backups/cms/content/<timestamp> --yes`
- `corepack pnpm generate:static:public`
- `corepack pnpm generate:static:qa`
- `corepack pnpm generate:preview`
- `corepack pnpm start:static:preview`
- `corepack pnpm inspect:static`
- `corepack pnpm deploy:static:bunny`

Use `skills/static-publish-runbook/SKILL.md` for the manual static publish and CDN preview checklist. Keep it active even after the static-deploy spike docs are archived.

Static publishing rules:

- Treat static generation as an explicit publish/QA path, not the default local development loop.
- Use the public CMS for publishable content and the QA CMS for fixtures, seeded tests, generated media, and risky experiments.
- Static generation must make its source CMS explicit.
- Generated public output should not serialize local GraphQL/API URLs such as `127.0.0.1:8080` or `cms.my-website.localhost/graphql`.
- Run `corepack pnpm inspect:static` before CDN deploys to catch local runtime references, missing media files, and wrong output shape.
- Media upload and URL rewriting should stay automated in deploy tooling. Do not manually map images or hardcode Bunny/CDN URLs in Vue components.
- Prefer WordPress-generated responsive image metadata and sizes before inventing a custom image pipeline.
- Keep the real production-domain launch as separate production-deploy work; Bunny preview deploy is not the same as pointing `aslanfrench.work` at the output.

Run `corepack pnpm check` after code changes when feasible. It regenerates the WordPress editor stylesheet, then runs lint and typecheck.

## Tooling and Code Style
- ESLint is configured through Nuxt's `@nuxt/eslint` setup in `apps/frontend/eslint.config.mjs`.
- Prettier is configured at the repo root in `prettier.config.mjs`.
- ESLint and Prettier are separate tools here. Do not assume linting also formats.
- `corepack pnpm check` runs editor CSS generation, frontend lint, and frontend typecheck. It does not run Prettier format checking.
- Use `corepack pnpm format` for intentional formatting and `corepack pnpm format:check` when format verification is needed.
- Do not reformat unrelated files as drive-by cleanup.
- Markdown files are intentionally ignored by Prettier. Treat docs and project notes as hand-authored prose so spacing and outline rhythm can follow the author's preference.
- Follow `docs/code-style.md` for authoring preferences: prioritize human legibility, local reasoning, explicit control flow, named intermediate values, and boring solutions that satisfy the requirement.
- Avoid early abstraction. Extract helpers or shared components only after repeated real use or when the current file is becoming harder to understand.
- Prefer guard clauses and named helpers over dense nested conditionals, long chained transformations, or clever boolean compression.
- Vue work should favor Composition API, explicit props, readable computed values, and SFC templates that reveal the page/component structure.
- SCSS should favor local component styles and simple semantic class composition. Avoid noisy naming or brittle selector chains when scoped component structure already provides clarity.
- Authored Vue component classes should generally use scoped semantic role/state names such as `hero`, `title`, `meta`, `content`, `is-hidden`, or `is-transition-hidden`, not BEM-style fused internals.
- Do not rename WordPress/Gutenberg-provided classes such as `wp-block-cover__media`; those external conventions are intentionally preserved.

## Markdown and Prose Style
- Do not hard-wrap prose in Markdown, comments, docs, or examples. Let editors handle soft wrapping.
- Preserve paragraphs as single lines unless line breaks carry meaning, such as lists, tables, code blocks, quoted text, frontmatter, or an existing semantic-line-break style.
- Avoid reflow-only diffs. When editing prose, change the smallest relevant span instead of rewrapping neighboring paragraphs.
- When touching existing Markdown or prose, apply this preferred style to the paragraph, section, or example being edited so files converge over time.
- Do not mass-reformat untouched sections just to normalize style unless the user asks for a cleanup pass.
- Prefer compact heading spacing in hand-authored docs: do not add blank lines only to separate adjacent headings from each other.
- Follow existing file style when it is already coherent, and let explicit project tooling win when a formatter or linter requires a different layout.

## Content Model and CMS Rules
- Regular WordPress posts are writing/blog posts.
- `case_study` is the evergreen case-study content type.
- Pages remain available for one-off content such as Home and future standalone pages.
- The Home page uses ACF fields for structured homepage content: the vital-info tagline, quick links, employer testimonials, testimonials background texture, the Side Projects display heading (`homepage_side_projects_heading`, exposed as `homepageSideProjectsHeading`), and the hero portrait image (`hero_portrait`, exposed as `homepageHeroPortrait` / `homepageHeroPortraitAlt` on the `Page` GraphQL type). Its Gutenberg body editor is intentionally hidden. The BLUF hero portrait is CMS-swappable and falls back to a built-in mock (`/images/home-portrait-mock.webp`) when unset; the responsive composition is tuned to a ~4:5 portrait crop.
- Standalone pages such as About and Side Projects should generally use a plain WordPress title for CMS/admin clarity, an ACF display heading when the public `h1` needs to be more expressive, and Gutenberg body content for narrative page content. Use `queryWordPressPageByUri(uri)` in `useWordPress.ts` to fetch any standalone CMS-backed page — it returns the full normalized page object including blocks and `seoDescription`.
- The public `/now` route is a thin mirror of About-page Now content, not a separate WordPress page. Canonical source is the About page's `now_content` ACF field (exposed as `nowContent` on the `Page` GraphQL type). Keep this as a single-source setup unless clear product needs require a dedicated page model.
- The Side Projects page is a single manually-authored WordPress Page, not a CPT collection. There is no `/side-projects/:slug` route and no `side_project` post type.
- Footer content is managed through an ACF-backed Site Settings options page.
- ACF Pro is allowed for structured metadata, but use it sparingly. Prefer Gutenberg body content for article-like content.
- WordPress Pages each have an ACF `seo_description` textarea (field group `group_my_website_page_seo`, position: side) exposed as `seoDescription` on the `Page` GraphQL type. When fetching a page via `queryWordPressPageByUri`, read `page.value?.seoDescription` directly. Use `queryPageSeoDescription(uri)` only when you need the SEO description without fetching the full page object.
- WordPress Posts have an ACF `canonical_url` text field (field group `group_my_website_post_meta`, position: side) exposed as `canonicalUrl` on the `Post` GraphQL type. Leave blank for posts that live only on this site; fill only for genuine cross-posts (e.g. Medium). The frontend reads this field in `writing/[slug].vue` and emits `<link rel="canonical">` via `useHead` when non-null.
- WordPress is not a page builder for the public frontend. It is a CMS/editor/API.
- Stable editorial terms matter. Do not rename content types or sections casually.

Custom block rules:

- Project-owned custom Gutenberg blocks should live in a plugin, not the editor theme.
- Add custom blocks only where core Gutenberg blocks are insufficient.
- Prefer explicit `block.json` metadata and a small intentional block set.
- If a custom block build pipeline is added, keep it simple and Vite-oriented; do not switch the project to a broad webpack/wp-scripts architecture without a deliberate decision.
- The `my-website-blocks` plugin editor JS is plain browser JS using WordPress globals (`wp.blocks`, `wp.element`, `wp.blockEditor`). No build step is required. Keep it that way unless block complexity genuinely demands otherwise.
- When a PHP render callback is needed to surface block attributes to the frontend, embed them as `data-*` attributes directly in the rendered wrapper HTML. The frontend reads these from `renderedHtml` — do not add `attributesJSON` to the GraphQL query just to pass scalar attributes.
- Child blocks (InnerBlocks) are discovered on the frontend by filtering the flat `editorBlocks` (`allBlocks`) array where `parentClientId === block.clientId`. See `GalleryBlock.vue` and `MegaGalleryBlock.vue` for the pattern.
- Lazily-loaded client-side libraries (Masonry.js, PhotoSwipe, etc.) must be dynamically imported inside client-only interactions or `onMounted` to avoid SSR issues.
- PhotoSwipe CSS is loaded globally via the `css` array in `nuxt.config.ts`, not inside the component. Load PhotoSwipe CSS before the site stylesheet so the frontend context can override default chrome.
- PhotoSwipe is the shared image lightbox foundation. Use `useImageLightbox()` for single-image and image-sequence slides; do not add another lightbox library or a custom modal unless PhotoSwipe cannot support a required interaction. Normal Image blocks, floated images, core Gallery blocks, footnote images, Mega Gallery images/videos, and default/wide Media/Text images participate in this system. Preserve intentional external/custom image links; intercept only media-file image links for lightbox behavior.

Gutenberg rendering rule:

- Do not render an entire post body as one giant raw HTML blob.
- Query structured block data through WPGraphQL/WPGraphQL Content Blocks.
- Map each supported Gutenberg block to a Vue component in `apps/frontend/components/content/blocks`.
- Unknown blocks should fail at the block level through `UnsupportedBlock.vue`, not break the page.
- Sanitized per-block fallback HTML is acceptable where needed, but avoid turning that into the primary rendering model.
- CMS-authored internal links should be normal WordPress/editor links. The frontend normalizes internal CMS-origin URLs at fetch time, and same-origin links rendered through `v-html` are intercepted on the client so they navigate through Nuxt and keep route transitions.
- Core Gallery blocks are intentionally more authored than generic auto-fit grids: respect CMS column, crop, and alignment settings; preserve left-to-right row grouping; cap mobile gallery composition at three columns; and let very wide landscape images span the mobile row. Mega Gallery remains the heavier Masonry/PhotoSwipe browsing surface.
- Core Image blocks preserve Gutenberg resize intent where it fits the active layout mode. `ImageBlock.vue` reads safe width data from rendered HTML, including the common `img style="width:...px;height:auto"` pattern on `is-resized` blocks, then passes that through CSS variables rather than forwarding arbitrary inline styles. Default/centered resized images respect the author width with viewport clamps. Resized floated images use their own float model: small floats tend back toward in-column composition, medium floats keep a meaningful relationship to the text column, and extra-large desktop floats use an explicit outside-margin breakout after the medium band instead of crushing paragraph measure. Phone floats remain floats, but large desktop breakout collapses to the constrained phone float model.
- Embed providers such as YouTube, Vimeo, and Sketchfab render player controls inside cross-origin iframes. Treat provider internals as non-styleable: style the outer frame, sizing shell, caption, and surrounding layout, but do not attempt direct CSS skinning of provider chrome.
- Native `core/video` wide/full sizing should remain wrapper-driven using the shared media-height cap token and source video aspect ratio (runtime metadata with safe fallback). Avoid element-level max-height forcing that creates side gutters/pillarboxing.
- Float-breakout grouping wrappers may carry alignment classes such as `.alignright`, but they are grouping shells, not actual media obstacles. Sidenote/footnote layout should treat the aligned lead figure as the obstacle, not the whole `.float-breakout-flow` wrapper. Re-run sidenote layout after content images load because floated media can shift marker and obstacle geometry after the initial text/font pass. Desktop in-note fallback boxes must establish a float-aware formatting context so their background and border stay inside the wrapped text area rather than painting under adjacent floats.
- Article table-of-contents rendering is article apparatus, not global navigation. `ArticleToc.vue` is passed through `BlockRenderer`'s apparatus slot, scans rendered `h2` through `h6` headings through `useArticleToc`, and suppresses itself on short posts. On desktop, the TOC sits as a low-priority left rail on the article ground and authored content paints above it; on phone/tablet, it becomes an in-flow collapsed Contents block aligned to the content column. If authored blocks cross the TOC lane, prefer cream backgrounds or the shared underlap-matte treatment on those blocks over raising the TOC above content. Enable underlap mattes explicitly on article `BlockRenderer` instances that carry the TOC; non-TOC content flows and the WordPress editor must not inherit cream clearing. Blocks with their own surface, border, or shadow must paint that surface above the matte. Matte painting and TOC collision measurement must use the same visible surface rather than a wider transparent layout shell. A meaningful overlap during settled page entry should latch the rail hidden until the obstacle clears completely; later scrolling may use a more tolerant geometry threshold for temporary crossings. Keep any TOC auto-hide heuristic conservative, geometry-based, and easy to remove.
- Audio blocks use progressive frontend enhancement: SSR and initial render keep native `<audio controls>` as fallback, then `AudioBlock.vue` swaps to a custom player after mount when usable sources are available. Keep the real `HTMLAudioElement`, native `button`, and native `input[type='range']` semantics; draw custom rail/thumb visuals around the range rather than replacing it with a custom ARIA slider. The shared `_audio-block.scss` recipe must reset root `<figure>` margins, preserve shared captions, and prevent mobile overflow by sizing the block correctly. On phone, wide/full audio should collapse to the content column because audio controls are functional UI, not wide compositional media.
- Code blocks use Shiki through `apps/frontend/utils/syntax-highlighting.ts`. Active themes are Midnight, Phosphor, and Signal, each defined as a Shiki `ThemeRegistration` in `apps/frontend/utils/*-theme.ts`; the older Hopscotch-inspired theme is archived/unregistered. Code block theme choice is global page state through `useCodeTheme`, not persisted. The desktop-only selector is local code-block chrome; it is intentionally hidden on phone. Add custom language/theme support deliberately, preferably using TextMate grammar/theme inputs rather than one-off regex tokenizers.

Frontend component folders are organized by visitor-facing role:

- `apps/frontend/components/content`: authored content rendering, including `BlockRenderer.vue`, `UnsupportedBlock.vue`, `FeaturedMediaFrame.vue`, and Gutenberg block components under `content/blocks`.
- `apps/frontend/components/navigation`: site wayfinding and browsing surfaces, including the nav, footer, cards, and content lists.
- `apps/frontend/components/transitions`: route/page transition presentation components.
- `apps/frontend/components/home`: homepage-specific assembled sections.

Homepage composition rule:

- Treat the homepage as an art-directed composition, not a generic reusable section framework. Keep one-off hero/top-region markup route-local in `apps/frontend/pages/index.vue` when that makes the full page sequence easier to read. Use homepage-only components for substantial sections that protect real complexity or make a section easier to reshape, such as Selected Work or Latest Writing. Do not introduce shared heading/section wrappers just to DRY up unrelated pages.

## Styling and Design-System Rules
Read `docs/design-system.md` before changing shared styles. Read `docs/visual-design.md` before making visual styling decisions.

Use this project vocabulary:

- palette
- context-role
- shared-components

Avoid introducing conflicting terms where the repo already has language.

Style strategy:

- Keep component-specific styles local to Vue SFCs unless sharing is genuinely useful.
- Prefer scoped semantic role/state classes in authored Vue components. Existing BEM-shaped class names should usually indicate external WordPress/Gutenberg markup, not a new house style to copy.
- Prefer CSS custom properties as the component-facing API for palette values.
- Sass variables remain useful for source palette values, mixins, functions, and compile-time helper recipes.
- `packages/styles/context-role/_vue-frontend.scss` emits frontend global CSS.
- `packages/styles/context-role/_vue-frontend-component.scss` is injected into Vue SFC styles by Nuxt Sass `additionalData`; it must stay non-emitting.
- `packages/styles/context-role/_wp-editor.scss` emits the WordPress editor stylesheet source.
- `packages/styles/_type-fonts.scss` owns the external font resource request and is imported only by emitting context-role files. `packages/styles/_type-palette.scss` owns non-emitting font-family source values, type scale (`type-small/base/large`), and type-related source values including the `editorial-caption` mixin for caption typography. Paragraph, list, and heading selector styling belongs in shared-component recipes, not in the palette file.
- `packages/styles/context-role/_vue-frontend.scss` also owns frontend shell/global mechanics: token exports, page base, the `.content-flow` grid tracks/container, fallback bare-element handling, and wrapper-only structural rules such as float-breakout grouping. Route/page-shell transition styles belong in the layout or component that renders the affected shell element.
- `$breakout-wide-width` in `packages/styles/_spatial-palette.scss` is the canonical Sass variable for wide-breakout geometry. Use it in shared-component recipes and context-roles rather than hardcoding a breakout width inline.
- `float-breakout-lead($side)` is defined in `_vue-frontend.scss` and applies float-breakout wrapper behavior for a given side. Shared-component recipes call it rather than duplicating float geometry inline.
- Shared-component recipes under `packages/styles/shared-components/` own a block's complete styling — shell, frame, child roles, modifier states, typography application, and content-flow width/alignment declarations via inline `width-alignment()` calls. Vue SFCs include recipe mixins in scoped styles and get the complete block treatment together.
- `packages/styles/shared-components/_code-block.scss` owns the reusable retroterm code-block visual recipe.
- `packages/styles/shared-components/_quote-block.scss`, `_pullquote.scss`, `_details-block.scss`, and `_accordion-block.scss` own the reusable recipes for those editorial block types, including frontend content-flow placement where applicable.
- Keep editor-only Gutenberg alignment adapters in `_wp-editor.scss`; do not force Vue frontend components to keep WordPress-shaped or redundant classes for editor parity.
- Do not force full editor/frontend visual parity. Share only what improves editing clarity.
- Do not edit generated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` directly.
- If changing editor-relevant styles, run `corepack pnpm styles:wp-editor` or `corepack pnpm check`.
- `editor.css` is generated but versioned because WordPress loads CSS assets directly.
- The z-index scale lives in `_spatial-palette.scss` as `$z-lower/low/mid/high/higher/highest` (1/2/3/4/900/1000) and is exported as CSS custom properties by `_vue-frontend.scss`. Use these tokens rather than bare integers.
- `$slow-duration` in `_motion-palette.scss` is the token for heavyweight transitions such as image zoom. Hover/interaction durations (200ms) are left as bespoke values per callsite — do not couple them to a shared token just because they share a numeric value.
- The `@mixin breakpoint()` in `packages/styles/_mixins.scss` uses `phone` (max-width: 767px) as the single max-width small-screen name. Do not add overlapping mobile aliases; prefer consolidating toward the existing names.
- The homepage hero uses two licensed display fonts exported as CSS custom properties: `--font-edwardian` (Edwardian Script ITC) and `--font-bodoni` (Bodoni Z37). These are defined as explicit quoted strings in `_vue-frontend.scss` — do not SCSS-interpolate them, because `"Bodoni Z37"` contains a numeric token that breaks unquoted CSS `font-family` parsing. The Sass source variables are `$font-edwardian` and `$font-bodoni` in `_type-palette.scss`.

## Accessibility and SEO Contract
These rules are stable across generative design branches. Visual directions, palettes, and component styling can change freely; the items below must not quietly regress.

- **Document language**: `nuxt.config.ts` sets `htmlAttrs.lang = 'en'`. Keep it.
- **Page structure**: Every route has exactly one `h1`. Heading order must be logical. `SiteNav` and `SiteFooter` are wrapped in labeled `nav` elements.
- **SEO metadata**: All routes use `useSiteSeoMeta` (composable at `apps/frontend/composables/useSiteSeoMeta.ts`). It emits title, description, Open Graph (title/description/site/type), and Twitter card metadata. Writing and case-study detail pages also pass og:image from featured media. Do not replace `useSiteSeoMeta` calls with bare `useSeoMeta` or `useHead` calls.
- **Canonical URLs**: Cross-post canonicals on writing detail pages are handled by `useHead` reading `post.value?.canonicalUrl` (set via the WordPress `canonical_url` ACF field). Site-wide self-referential canonicals are deferred to production deploy.
- **Focus visibility**: A global `:focus-visible` fallback outline lives in `packages/styles/_base.scss`. Do not remove it. Custom focus styles on specific components may supplement it but not replace it.
- **Reduced-motion**: Custom route transitions and hover/interaction motion must respect `prefers-reduced-motion`. All newly added motion must include reduced-motion fallbacks.
- **Interactive semantics**: Cards are real links. Load-more is a native `button`. Accordions use `aria-expanded` and `aria-controls`. Mega Gallery uses native buttons with accessible labels. Do not replace these with non-semantic elements.
- **Image alt**: `FeaturedMediaFrame` emits CMS alt text or an empty alt string (never omits the attribute). Block images preserve WordPress alt attributes. Mega Gallery image buttons use image alt in their accessible label.
- **Internal link text**: No hardcoded generic labels (`Read More`, `Learn More`, `Click here`) in Vue templates. Use visible descriptive text or screen-reader-visible context.
- **Static output safety**: Raw `editorBlocks` are stripped from normalized post/page/case-study objects before Nuxt serializes page payloads, preventing local CMS URLs from leaking into static bundles. Do not re-add `editorBlocks` to normalized objects.
- `robots.txt`, sitemap generation, and production-domain canonical URL policy are deferred to production deploy.

## Route Transition and Motion Rules
The current card-to-detail transition system is custom. It is not Nuxt page transitions and not the browser View Transitions API.

Key files:

- `apps/frontend/composables/useFeaturedMediaTransition.ts`
- `apps/frontend/components/transitions/FeaturedMediaTransitionLayer.vue`
- `apps/frontend/components/content/FeaturedMediaFrame.vue`
- `apps/frontend/components/navigation/CaseStudyLoopNav.vue`
- `apps/frontend/components/navigation/cards/CaseStudyCard.vue`
- `apps/frontend/components/navigation/cards/PostCard.vue`
- `apps/frontend/components/navigation/cards/PostArchiveRow.vue`
- `apps/frontend/components/navigation/lists/WritingArchiveList.vue`
- `apps/frontend/utils/case-study-photo-treatment.ts`

Rules:

- Keep transition timing in `packages/styles/_motion-palette.scss`.
- Export timing/easing values as CSS custom properties through the frontend context-role.
- If JavaScript must coordinate with CSS timing, read the CSS custom property instead of duplicating a magic number.
- `--slow-duration` is the token for heavyweight transitions (image zoom, media transitions). Short hover durations (200ms) are left bespoke per callsite.
- Treat source and target surfaces as motion machinery. Case-study cards, writing cards/archive rows, detail heroes, and bottom case-study nav links provide measured geometry through `data-featured-*` hooks; restyle them with transition QA, not only static screenshots.
- Preserve browser-baked case-study halftone derivatives as the preferred moving-media path. The old live CSS/SVG/K-layer stack is historical/fallback material and should not be reintroduced as the default transition payload.
- Keep clone geometry, source/destination page visibility, and card-frame hand-off styling separate. Avoid hiding the real source media or revealing receiving frames early if doing so creates flashes, ghosting, or outlines crossing the flying media.
- Title wrapping cannot be smoothly animated. Align typography and surface width between each source/target pair before adding line-splitting or heavier measurement code.
- Preserve reduced-motion behavior.
- The interior nav is scroll-aware with page-type-specific rules (see `SiteNav.vue` and `docs/design-system.md` → Route Motion). Do not assume the nav locks visible during transitions — visibility rules vary by page type and are suppressed during active transitions via the scroll-handler guard.
- Avoid layering fixes that create duplicate semi-transparent media, scroll flashes, or post-transition jumps.
- When adding new transitions, favor explicit source/target elements and inspect the actual rendered geometry.
- The featured-media transition spike is closed and archived at `docs/archive/featured-media-transition.md` / `.todo.md`; use it for history, not as the active task list.

## Navigation Model
- Prefer contextual wayfinding over a persistent global navbar. `SiteNav` is a small local affordance on interior pages, not a primary navigation bar.
- The interior nav is scroll-aware: hidden on initial load for most pages, reveals on scroll-up. Exceptions: About (always visible); writing detail (hidden during transition arrival, auto-reveals when transition lands, then scroll-aware). Case study detail, writing archive, and side-projects all start hidden and reveal only on scroll-up.
- The footer is the durable global site map. Keep it sufficient for global site movement from deep interior pages.
- The homepage is the canonical browsing surface for case studies through the Selected Work section. There is no public `/case-studies` archive route.
- The `/now` route intentionally hides the interior `SiteNav` via `definePageMeta({ hideSiteNav: true })`, with `layouts/default.vue` honoring route meta opt-out. Preserve this route-level nav suppression pattern for standalone editorial pages that should read as focused single-surface content.
- "Selected Work" is the section/title/branding phrase. "Case Studies" is the utility label for links and route paths.
- Do not show links to the current page or section the visitor is already on.
- Case-study detail pages: `SiteNav` shows Home only, linking to `/#selected-work`. Looping previous/next navigation at the bottom handles case-study-to-case-study movement.
- Writing detail pages: `SiteNav` shows Home (linking `/#latest-writing`) and Writing (linking `/writing`).
- All other interior pages (writing archive, side projects, about): `SiteNav` shows Home only.
- Home and Writing affordances use the featured-media reverse transition when the matching source card exists.
- Do not add cross-section top links from case-study or writing pages to Side Projects, About, or other sections. Those live in the footer.
- Keep this contextual and bespoke. Do not build a generic route-aware nav framework unless the site genuinely grows into needing one.

## Repository Guardrails
- Keep credentials, real `.env` files, private plugin zips, and uploads out of Git.
- `docker/.env.example` is committed; `docker/.env` is not.
- `docker/private-plugins/` is ignored and may contain `advanced-custom-fields-pro.zip` and licensed font files.
- `apps/frontend/public/fonts/` is gitignored and contains locally-served licensed fonts (Edwardian Script ITC `Edwardian-Script-ITC.woff2`, Bodoni Z37 `Bodoni-Z37.woff2`). These are required by the homepage hero composition. To restore: copy the `.woff2` files from `docker/private-plugins/` to `apps/frontend/public/fonts/` (create the folder if absent).
- `apps/cms/wp-content/uploads/` is ignored. Treat uploads as media/data migration concerns, not source deploys.
- `temp-ref-assets/` and `temp-reference-assets/` are ignored reference material.
- Preserve pinned CMS/plugin versions unless intentionally updating them.
- Do not reintroduce Akismet or unused default themes unless there is a clear reason.
- Do not replace the Docker Compose model with another canonical runtime.
- Keep local and production deployment assumptions aligned around Docker Compose plus env-specific overrides.
- Do not import old reference-project React/Frontity architecture. Reference projects are visual/style research only.

## How To Make Changes Safely
- Check `git status` before editing so user work is not overwritten.
- Prefer small, readable components over generalized factories.
- Keep page SFCs legible: a designer should be able to understand the major structure from the template.
- Make abstractions only after repeated real use, not in anticipation.
- For frontend work, verify behavior in both SSR and client navigation paths when relevant.
- For CMS work, consider bootstrap reproducibility and production portability.
- For style work, decide whether the value belongs locally, in a palette, in a context-role, or in shared-components.
- For block work, update the block registry and add a focused Vue block component.
- For block rendering regressions, run `corepack pnpm seed:cms:qa` and check the generated writing/case-study QA routes through `http://qa.my-website.localhost`. The fixture targets the QA CMS by default and is broad enough to cover common text, media, layout, embed, interactive, and utility block families, but it is not intended to exhaust every Gutenberg permutation.

## Documentation and Handoff
- Update `README.md` when commands, architecture, URLs, install steps, or generated assets change.
- Update `docs/design-system.md` when style-system terminology or shared-style strategy changes.
- Update `TODO.md` when project status or roadmap changes, but preserve user notes.
- In handoff summaries, mention files changed, checks run, and any known mismatch between docs and code.
- If docs and code disagree, trust the current code after inspecting it, then update docs or call out the mismatch.
