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
- `corepack pnpm docker:up`
- `corepack pnpm docker:down`
- `corepack pnpm docker:logs`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm check` regenerates WordPress editor CSS, then runs lint and typecheck
- `corepack pnpm build` regenerates WordPress editor CSS, then builds the Nuxt frontend
- `corepack pnpm styles:wp-editor` compiles the WordPress editor context-role SCSS into the CMS editor theme's generated `editor.css`
- `corepack pnpm cms:seed-block-test-content` creates or updates representative Gutenberg QA content in one post and one case study

## Local URLs

- Frontend dev app: `http://127.0.0.1:3001`
- Frontend pretty local URL via Caddy: `http://my-website.localhost`
- WordPress CMS via Caddy: `http://cms.my-website.localhost`
- WordPress GraphQL endpoint: `http://cms.my-website.localhost/graphql`
- Direct WordPress container access for local SSR/dev tooling: `http://127.0.0.1:8080`
- Block QA post: `http://my-website.localhost/writing/block-qa-kitchen-sink-post`
- Block QA case study: `http://my-website.localhost/case-studies/block-qa-kitchen-sink-case-study`

## Content Model

- Regular WordPress posts are writing/blog posts
- `case_study` is the evergreen case-study content type
- Pages remain available for one-off destinations such as Home and future standalone pages
- The Home page uses ACF fields for structured homepage content. Its Gutenberg body editor is intentionally hidden
- Homepage mega text, title, subtitle, vital-info tagline, and quick links come from ACF fields on the assigned WordPress front page
- Footer content is managed through an ACF-backed Site Settings options page
- Featured images are first-class card/detail media and participate in the custom featured-media transition system
- A minimal `/side-projects` page exists as a holding page, not as a custom post type

## Frontend Status

- Nuxt SSR fetches WordPress data through `apps/frontend/composables/useWordPress.ts`
- Homepage content is split into smaller components under `components/home`
- Writing and case-study indexes render distinct card families
- Writing and case-study detail routes render featured media, loading/error/not-found states, and structured Gutenberg blocks
- Card-to-detail route transitions use the custom featured-media transition coordinator in `useFeaturedMediaTransition.ts`
- Route motion timing comes from the Sass motion palette, is exported as CSS custom properties, and is read by JavaScript where cleanup timing must match CSS
- Code blocks use Shiki through `apps/frontend/utils/syntax-highlighting.ts`
- The active code theme is the custom Hopscotch-inspired theme in `apps/frontend/utils/hopscotch-theme.ts`

## Gutenberg Rendering

Frontend block rendering starts at `BlockRenderer.vue` and recurses through `BlockChildren.vue`. Unknown blocks fail locally through `UnsupportedBlock.vue`.

The registry currently covers common editorial families: paragraph, heading, image, quote, list, group, columns, column, gallery, cover, spacer, separator, code, preformatted, table, pullquote, embed, raw HTML fallback, verse, buttons, button, media/text, audio, video, file, details, accordion, and the project-owned Mega Gallery block.

The custom `my-website/mega-gallery` block lives in the `My Website Blocks` plugin. In WordPress it is an InnerBlocks-based editor block for mixed image/video gallery content. On the frontend it renders through `MegaGalleryBlock.vue`, uses Masonry for layout, and uses PhotoSwipe for lightbox behavior. It currently supports images and videos; richer media such as Sketchfab embeds are still future work.

The repeatable block QA fixture lives at `apps/cms/wp-content/plugins/project-bootstrap/dev-tools/seed-block-test-content.php`. It is broad enough for daily regression work but is not an exhaustive test of every registered block component. It currently emphasizes realistic article content across headings, nested lists, text alignment, quotes, pullquotes, image alignment and breakout variants, galleries, Mega Gallery, media/text, columns, groups, code, tables, YouTube/Vimeo/generic embeds, audio, video, file, details, accordion, separator variants, spacer, and buttons.

## Styling And Design System

Design-system terminology and SCSS organization are documented in `design-system.md`.

- Sass palettes define source values
- Context-role files emit CSS for specific runtimes
- Shared-component SCSS files hold reusable editorial block recipes
- Vue SFC styles consume CSS custom properties through the non-emitting frontend component context-role
- `_type-palette.scss` owns font imports and editorial type defaults
- `_structural-relations.scss` owns the `.content-flow` article grid, normal/wide/full placement, block rhythm, and float-breakout shell behavior
- `_wordpress-blocks-baseline.scss` is now a small normalization layer for WordPress block behavior, not the main article layout system
- Shared recipes for code, image, quote, pullquote, details, and accordion blocks live under `packages/styles/shared-components/`
- `_vue-frontend.scss` adapts shared recipes and structural rules to frontend-rendered Gutenberg block components
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
- Production Compose files exist, but production deployment docs, CI, backups, and real server runbooks still need to be written

## Secrets And Credentials

- Commit `docker/.env.example`, not `docker/.env`
- Keep real local credentials in an untracked `docker/.env`
- Keep WordPress uploads out of Git via `.gitignore`
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
