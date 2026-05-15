# My Website

Monorepo for a Nuxt SSR frontend and a headless WordPress CMS.

This repo is intentionally set up so design and styling can stay highly manual and art-directed, while the engineering foundation stays reproducible and boring in the good way.

## Architecture

- `apps/frontend`: Nuxt 3, Vue 3, SSR, TypeScript, Vite, SCSS, and frontend block rendering
- `apps/cms`: WordPress runtime source, editor theme, project plugins, and bootstrap tools
- `packages/styles`: Sass palettes, shared-component recipes, structural content rules, and context-role entrypoints
- `docker`: Docker Compose, Caddy config, CMS bootstrap runtime, and production/development compose overlays

Nuxt is the public site. WordPress is the CMS, admin, and content API. Docker Compose is the canonical local infrastructure for WordPress, MariaDB, and Caddy. Nuxt runs on the host during development for faster Vite HMR.

## Development Model

- Node is pinned by `.nvmrc` to `22`
- pnpm is pinned by the root `packageManager` field to `pnpm@10.18.3`
- Use `corepack pnpm` from the repo root
- WordPress, MariaDB, and Caddy run in Docker
- Nuxt runs on the host at `127.0.0.1:3001`
- Source files are mounted into the CMS container where WordPress needs them
- WordPress uploads are intentionally excluded from Git and should be handled through media/file migration rather than source deploys
- Frontend code is organized by visitor-facing role: `components/content`, `components/navigation`, `components/transitions`, and `components/home`
- Authored Vue component classes use scoped semantic role/state names; WordPress/Gutenberg classes are preserved only where they describe external markup conventions
- Gutenberg content is fetched structurally through GraphQL and rendered by Vue block components instead of dumping an entire post body as raw HTML

## Useful Commands

- `corepack pnpm install`
- `corepack pnpm dev` starts Nuxt on `127.0.0.1:3001`
- `corepack pnpm docker:up` starts the public CMS stack
- `corepack pnpm docker:up:all` starts the public CMS plus the QA CMS
- `corepack pnpm docker:down`
- `corepack pnpm docker:down:all`
- `corepack pnpm docker:logs`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm check` regenerates WordPress editor CSS, then runs lint and typecheck
- `corepack pnpm build` regenerates WordPress editor CSS, then builds the Nuxt frontend
- `corepack pnpm static:routes` prints the fixed and WordPress-discovered routes used for static generation
- `corepack pnpm static:generate` regenerates WordPress editor CSS, then generates static Nuxt output from the public CMS by default
- `corepack pnpm generate:static:public` explicitly generates static Nuxt output from the public CMS
- `corepack pnpm generate:static:qa` explicitly generates static Nuxt output from the QA CMS
- `corepack pnpm start:static:preview` serves the generated output locally on `127.0.0.1:3002`; with Caddy running it is also available at `http://static.my-website.localhost`
- `corepack pnpm inspect:static` summarizes the generated static output, provider target, and media URL mapping without uploading files
- `corepack pnpm deploy:static:bunny` uploads generated static files and referenced media to Bunny Storage only when deploy credentials are configured and `STATIC_DEPLOY_DRY_RUN=0`; it purges the pull-zone cache when purge credentials are configured
- `corepack pnpm styles:wp-editor` compiles the WordPress editor context-role SCSS into the CMS editor theme's generated `editor.css`
- `corepack pnpm start:cms:public` starts the public CMS stack
- `corepack pnpm start:cms:qa` starts the public CMS plus the QA CMS
- `corepack pnpm backup:cms:public` exports the public CMS database and uploads into `.backups/cms/content/<timestamp>/`, then keeps the latest 5 local backups by default
- `corepack pnpm list:backups:cms:public` lists local public CMS backups, their sizes, and whether checksum metadata is present
- `corepack pnpm restore:cms:public -- .backups/cms/content/<timestamp> --yes` restores a public CMS backup; this is destructive and moves current uploads into `.backups/restore-safety/`
- `corepack pnpm restore:cms:qa -- .backups/cms/content/<timestamp> --yes` restores a public CMS backup into the disposable QA CMS for restore testing
- `corepack pnpm seed:cms:qa` creates or updates representative Gutenberg QA content in the QA CMS
- `corepack pnpm seed:cms:qa:more` creates or updates 30 fixture writing posts with featured images, excerpts, and realistic block content in the QA CMS

Older `cms:content:*`, `cms:dev:*`, `static:generate:content`, and `static:generate:dev` aliases still exist for compatibility, but current docs use `public` for real publishable content and `qa` for fixture/test content.

See `docs/static-publish-runbook.md` for the full manual static publish and CDN preview checklist.

Static publishing is an explicit publish path, not the everyday development loop. Normal SCSS/Vue/content work still uses the Nuxt dev server and local WordPress. Static generation discovers public WordPress slugs, generates HTML/payload output, rewrites public media URLs during deploy, and should be inspected with `corepack pnpm inspect:static` before any CDN upload.

## Local URLs

- Frontend dev app: `http://127.0.0.1:3001`
- Public frontend pretty local URL via Caddy: `http://my-website.localhost`
- QA frontend pretty local URL via Caddy: `http://qa.my-website.localhost`
- Static generated preview via Caddy: `http://static.my-website.localhost`
- Static generated preview direct URL: `http://127.0.0.1:3002`
- Public WordPress CMS via Caddy: `http://cms.my-website.localhost`
- QA WordPress CMS via Caddy: `http://qa.cms.my-website.localhost`
- Public WordPress GraphQL endpoint: `http://cms.my-website.localhost/graphql`
- QA WordPress GraphQL endpoint: `http://qa.cms.my-website.localhost/graphql`
- Direct public WordPress container access for local SSR/dev tooling: `http://127.0.0.1:8080`
- Direct QA WordPress container access for local SSR/dev tooling: `http://127.0.0.1:8081`
- QA block QA post: `http://qa.my-website.localhost/writing/block-qa-kitchen-sink-post`
- QA block QA case study: `http://qa.my-website.localhost/case-studies/block-qa-kitchen-sink-case-study`

## Content Model

- Regular WordPress posts are writing/blog posts
- `case_study` is the evergreen case-study content type
- Pages remain available for one-off destinations such as Home and About
- The Home page uses ACF fields for structured homepage content. Its Gutenberg body editor is intentionally hidden
- Homepage mega text, title, subtitle, vital-info tagline, quick links, and employer testimonials come from ACF fields on the assigned WordPress front page
- Footer content is managed through an ACF-backed Site Settings options page
- Featured images are first-class card/detail media and participate in the custom featured-media transition system
- A minimal `/side-projects` page exists as a holding page, not as a custom post type

## Frontend Status

- Nuxt SSR fetches WordPress data through `apps/frontend/composables/useWordPress.ts`
- Homepage content is split into smaller components under `components/home`
- The Writing index renders post cards with cursor-based Load More pagination, while homepage Selected Work is the public browsing surface for case-study cards
- The About page exists as a simple standalone route and is linked contextually from the homepage vital-info section and footer fallback links
- Interior pages use a small local `SiteNav` affordance rather than a persistent global navbar; the footer provides global wayfinding from deep pages
- The homepage includes an ACF-backed Employer Testimonials section between Selected Work and the Side Projects link section
- Writing and case-study detail routes render featured media, loading/error/not-found states, and structured Gutenberg blocks
- Case-study detail pages include looping previous/next bottom navigation derived from the case-study list
- Card-to-detail and detail-to-list/home route transitions for case-study and writing cards use the custom featured-media transition coordinator in `useFeaturedMediaTransition.ts`
- Route motion timing comes from the Sass motion palette, is exported as CSS custom properties, and is read by JavaScript where cleanup timing must match CSS
- Code blocks use Shiki through `apps/frontend/utils/syntax-highlighting.ts`
- The active code theme is the custom Hopscotch-inspired theme in `apps/frontend/utils/hopscotch-theme.ts`

## Gutenberg Rendering

Frontend block rendering starts at `BlockRenderer.vue` and recurses through `BlockChildren.vue`. Unknown blocks fail locally through `UnsupportedBlock.vue`.

The registry currently covers common editorial families: paragraph, heading, image, quote, list, group, columns, column, gallery, spacer, separator, code, preformatted, table, pullquote, embed, raw HTML fallback, buttons, button, media/text, audio, video, file, details, accordion, and the project-owned Mega Gallery block.

Cover and verse blocks are intentionally not first-class frontend renderers right now. If they appear in content, they should fail locally through the unsupported/fallback block path rather than being treated as part of the supported QA surface.

The custom `my-website/mega-gallery` block lives in the `My Website Blocks` plugin. In WordPress it is an InnerBlocks-based editor block for mixed image/video gallery content. On the frontend it renders through `MegaGalleryBlock.vue`, uses Masonry for layout, and uses PhotoSwipe for lightbox behavior. It currently supports images and videos; richer media such as Sketchfab embeds are still future work.

The repeatable block QA fixture lives at `apps/cms/wp-content/plugins/project-bootstrap/dev-tools/seed-block-test-content.php`. It is broad enough for daily regression work but is not an exhaustive test of every registered block component. It currently emphasizes realistic article content across headings, nested lists, text alignment, quotes, pullquotes, image alignment and breakout variants, galleries, Mega Gallery, media/text, columns, groups, code, tables, YouTube/Vimeo/generic embeds, audio, video, file, details, accordion, separator variants, spacer, and buttons.

The writing archive load-more fixture lives at `apps/cms/wp-content/plugins/project-bootstrap/dev-tools/seed-writing-load-more-test-content.php`. It creates or updates stable `load-more-writing-test-*` posts rather than making duplicates, and gives each fixture post a featured image, excerpt, and mixed Gutenberg block body.

## Styling And Design System

Design-system terminology and SCSS organization are documented in `docs/design-system.md`.

- Sass palettes define source values
- Context-role files emit CSS for specific runtimes
- Shared-component SCSS files hold reusable editorial block recipes, including frontend content-flow width/alignment declarations for classed block components
- Vue SFC styles consume CSS custom properties through the non-emitting frontend component context-role
- `_type-fonts.scss` owns the emitting font resource request; `_type-palette.scss` owns non-emitting type source values; paragraph, list, and heading styling lives in shared-component recipes
- `_vue-frontend.scss` owns frontend global CSS: token exports, page base, the `.content-flow` article grid/container, native fallback element hooks, and wrapper-level float-breakout behavior
- Shared recipes for reusable block treatments live under `packages/styles/shared-components/`
- Vue SFCs consume shared recipe mixins through `_vue-frontend-component.scss`; `_wp-editor.scss` adapts shared recipes to the Gutenberg editor DOM separately where useful
- `_wp-editor.scss` emits pragmatic Gutenberg editor styling. It aims for a usable editing interface and visual similarity where helpful, not exact frontend parity

Do not edit `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` directly. It is generated from the editor context-role and committed because WordPress loads CSS assets directly.

## CMS Baseline

- WordPress core is pinned in Docker to `6.9.4`
- `wp-graphql` is pinned to `2.11.0`
- `wp-graphql-content-blocks` is pinned to `v4.8.4`
- `advanced-custom-fields-pro` is supported as an optional private plugin install for structured homepage/footer fields
- The editor-facing theme is `My Website Editor Theme` by `Aslan French`
- The project blocks plugin is `My Website Blocks` by `Aslan French`
- The project bootstrap plugin registers the `case_study` post type, ACF local fields, GraphQL fields for homepage/footer settings, CMS defaults, and QA seed tooling
- Unused default themes and Akismet are intentionally not part of the project-owned `wp-content`
- Optional private plugins can be mounted from `docker/private-plugins/` without being committed to Git

## Current Caveats

- The public frontend is the source of truth for final visitor-facing rendering
- The WordPress editor stylesheet is intentionally a practical approximation; headings, lists, alignment, media, columns, and wide/full editor surfaces are still being calibrated for usability
- The Mega Gallery block works for the current image/video masonry use case, but it still needs accessibility, caption, editor-preview, and richer-media hardening before it should be considered finished
- Production Compose files exist as an SSR/VPS fallback. The current public-delivery direction is static generation from local WordPress content, local static preview, and command-driven CDN preview/deploy through the static deploy scripts. Custom domain launch and final production hosting remain future work.

## Secrets And Credentials

- Commit `docker/.env.example`, not `docker/.env`
- Keep real local credentials in an untracked `docker/.env`
- Commit `.env.deploy.example`, not `.env.deploy`
- Keep static deploy credentials such as Bunny storage and purge keys in untracked `.env.deploy` or shell env
- Keep WordPress uploads out of Git via `.gitignore`
- Local CMS image uploads are capped through `apps/cms/config/uploads.ini`; rebuild the CMS image after changing PHP upload limits
- Keep premium/private plugin zips out of Git via `docker/private-plugins/`
- Keep temporary reference projects out of Git via `temp-ref-assets/` or `temp-reference-assets/`
- Keep production credentials in an untracked env file on the server
- Change bootstrap defaults like the local WordPress admin password after first login
- Git deployments do not reset the WordPress admin password as long as the database volume is preserved

## Optional ACF Pro Install

- Place `advanced-custom-fields-pro.zip` in `docker/private-plugins/` if you want ACF Pro installed locally or on a server
- The CMS bootstrap will install and activate that ZIP automatically if it exists
- The ZIP is intentionally ignored by Git
- License entry or activation remains a manual/private step in WordPress admin

## Pinned CMS Plugin Versions

- `wp-graphql`: `2.11.0`
- `wp-graphql-content-blocks`: `v4.8.4`

These are pinned intentionally so local installs and production deployments do not drift.
