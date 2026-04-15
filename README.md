# My Website

Monorepo for a Nuxt SSR frontend and a headless WordPress CMS.

This repo is intentionally set up so design and styling can stay highly manual and art-directed, while the engineering foundation stays reproducible and boring in the good way.

## Planned architecture

- `apps/frontend`: Nuxt 3 SSR application
- `apps/cms`: WordPress runtime, project plugins, and editor theme
- `packages/styles`: Sass palettes, context-role source files, and selected shared component recipes
- `docker`: Docker Compose and Caddy configuration

## Development model

- Nuxt runs on the host during development for better HMR and easier debugging
- WordPress, MariaDB, and Caddy run in Docker
- All source code lives in this repository and is mounted into containers where needed
- WordPress uploads are intentionally excluded from Git and should be handled through media/file migration rather than source deploys
- Homepage hero and vital-info content are sourced from ACF fields on the assigned WordPress front page, with simple frontend fallbacks when values are missing
- Gutenberg content is fetched structurally through GraphQL and rendered through Vue block components rather than dumping raw HTML
- Featured images are queried through WPGraphQL for posts and case studies and are rendered on cards and detail pages
- Card-to-detail route transitions are handled by a custom featured-media transition coordinator rather than Nuxt/browser View Transitions
- The transition coordinator measures card and detail media/title/metadata elements, renders an overlay during navigation, locks the nav chrome stable, suppresses premature scroll-to-top behavior, then hands off to the destination page
- Route motion timing is defined in the Sass motion palette, exported as CSS custom properties, and read by JavaScript where cleanup timing must match CSS
- Design-system terminology and SCSS organization are documented in [`design-system.md`](/Users/aslan/work/my-website/design-system.md); Sass palettes define source values, the type palette owns font loading, context-roles export CSS custom properties, and Vue components consume those values with `var(...)`

## Useful commands

- `corepack pnpm install`
- `corepack pnpm dev` starts Nuxt on `127.0.0.1:3001` so `http://my-website.localhost` works through Caddy
- `corepack pnpm docker:up`
- `corepack pnpm docker:down`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm check` regenerates WordPress editor CSS, then runs lint and typecheck
- `corepack pnpm build` regenerates WordPress editor CSS, then builds the Nuxt frontend
- `corepack pnpm styles:wp-editor` compiles the WordPress editor context-role SCSS into the CMS editor theme's generated `editor.css`

## Local URLs

- Frontend dev app: `http://127.0.0.1:3001`
- Frontend pretty local URL via Caddy: `http://my-website.localhost`
- WordPress CMS via Caddy: `http://cms.my-website.localhost`
- WordPress GraphQL endpoint: `http://cms.my-website.localhost/graphql`
- Direct WordPress container access for local SSR/dev tooling: `http://127.0.0.1:8080`

## Current content model notes

- Standard time-based writing currently lives in regular WordPress posts
- Evergreen collection content currently lives in a dedicated `Case Study` post type
- Regular WordPress pages are still available for one-off destinations such as `Home`, `About`, or other standalone content
- If a second evergreen content family appears later, we can add it deliberately instead of over-generalizing the model too early
- The homepage `Mega Text`, title, subtitle, tagline, and quick links are intentionally separated from the WordPress page title and are edited through structured ACF fields
- Footer content is managed through a project-level ACF options/settings page because it appears across multiple frontend routes
- Featured images are first-class card/detail media and participate in the custom featured-media transition system

## CMS baseline

- WordPress core is pinned in Docker to `6.9.4`
- `wp-graphql` is pinned to `2.11.0`
- `wp-graphql-content-blocks` is pinned to `v4.8.4`
- `advanced-custom-fields-pro` is supported as an optional private plugin install for structured homepage fields
- The editor-facing theme is `My Website Editor Theme` by `Aslan French`
- The editor theme loads `style.css` plus generated `editor.css`; commit `editor.css` so WordPress has a ready-to-load editor stylesheet after clone/deploy
- `editor.css` is generated from [`packages/styles/context-role/_wp-editor.scss`](/Users/aslan/work/my-website/packages/styles/context-role/_wp-editor.scss); do not edit the generated CSS directly
- The generated `editor.css` includes the type-palette IBM Plex font import, so run `corepack pnpm styles:wp-editor` after changing [`packages/styles/context-role/_wp-editor.scss`](/Users/aslan/work/my-website/packages/styles/context-role/_wp-editor.scss), [`packages/styles/_type-palette.scss`](/Users/aslan/work/my-website/packages/styles/_type-palette.scss), or shared style palettes
- The project blocks plugin is `My Website Blocks` by `Aslan French`
- Unused default themes and Akismet are intentionally not part of the project-owned `wp-content`
- Optional private plugins can be mounted from `docker/private-plugins/` without being committed to Git

## Secrets and credentials

- Commit [`docker/.env.example`](/Users/aslan/work/my-website/docker/.env.example), not [`docker/.env`](/Users/aslan/work/my-website/docker/.env)
- Keep real local credentials in an untracked [`docker/.env`](/Users/aslan/work/my-website/docker/.env)
- Keep WordPress uploads out of Git via [`.gitignore`](/Users/aslan/work/my-website/.gitignore)
- Keep premium/private plugin zips out of Git via [`docker/private-plugins/`](/Users/aslan/work/my-website/docker/private-plugins)
- Keep temporary reference projects out of Git via `temp-ref-assets/` or `temp-reference-assets/`
- Keep production credentials in an untracked env file on the server
- Change bootstrap defaults like the local WordPress admin password after first login
- Git deployments do not reset the WordPress admin password as long as the database volume is preserved

## Optional ACF Pro install

- If you want ACF Pro available locally or on a server, place `advanced-custom-fields-pro.zip` in [`docker/private-plugins/`](/Users/aslan/work/my-website/docker/private-plugins)
- The CMS bootstrap will install and activate that ZIP automatically if it exists
- The ZIP is intentionally ignored by Git
- License entry or activation remains a manual/private step in WordPress admin
- The homepage currently expects ACF-backed `Mega Text`, `Title`, `Subtitle`, `About Tagline`, and quick link fields on the assigned front page
- Footer content is managed through ACF-backed site settings fields
- The WordPress front page editor is intentionally simplified so the title and ACF fields are the main editing surface

## Pinned CMS plugin versions

- `wp-graphql`: `2.11.0`
- `wp-graphql-content-blocks`: `v4.8.4`

These are pinned intentionally so local installs and production deployments do not drift.
