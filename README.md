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
- Frontend components are grouped by visitor-facing role: `components/content` renders authored content, `components/navigation` handles wayfinding and browsing surfaces, `components/transitions` handles motion presentation, and `components/home` contains homepage-specific assemblies
- Authored Vue component classes use scoped semantic role/state names rather than BEM-style internals; WordPress/Gutenberg classes are preserved as external conventions
- Homepage hero and vital-info content are sourced from ACF fields on the assigned WordPress front page, with simple frontend fallbacks when values are missing
- Gutenberg content is fetched structurally through GraphQL and rendered through Vue block components in `components/content/blocks` rather than dumping raw HTML
- Common Gutenberg blocks have frontend content rules for text rhythm, media alignment, captions, quotes, tables, embeds, details, files, and code
- Article body content renders through a named CSS grid shell (`.content-flow`) so normal, wide, and full block placements all use shared grid tracks instead of each block self-centering; float-breakout grouping (`.float-breakout-flow`) handles left/right aligned images and quotes
- Editorial block visual recipes for quote, pullquote, details, and accordion live in individual shared-component SCSS files under `packages/styles/shared-components/` and are imported by the relevant Vue block components and the WordPress editor context-role
- Code blocks use Shiki through `apps/frontend/utils/syntax-highlighting.ts` so custom languages/themes can be added without changing the Gutenberg rendering contract
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
- `corepack pnpm cms:seed-block-test-content` creates or updates representative Gutenberg QA content in one post and one case study

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
- Code block syntax support is intentionally local and customizable. Add project/custom language or theme support to [`apps/frontend/utils/syntax-highlighting.ts`](/Users/aslan/work/my-website/apps/frontend/utils/syntax-highlighting.ts); the active syntax theme is the custom Hopscotch-inspired theme in [`apps/frontend/utils/hopscotch-theme.ts`](/Users/aslan/work/my-website/apps/frontend/utils/hopscotch-theme.ts). Keep reusable code-block visual treatment in [`packages/styles/shared-components/_code-block.scss`](/Users/aslan/work/my-website/packages/styles/shared-components/_code-block.scss)
- Block QA seed content lives at [`apps/cms/wp-content/plugins/project-bootstrap/dev-tools/seed-block-test-content.php`](/Users/aslan/work/my-website/apps/cms/wp-content/plugins/project-bootstrap/dev-tools/seed-block-test-content.php) and can be regenerated with `corepack pnpm cms:seed-block-test-content`
- The QA seed is intentionally broad but not combinatorially exhaustive. It currently covers heading hierarchy, nested lists, text alignment, quotes, pullquotes, image alignment/breakout variants, gallery, media/text, columns, groups, code, tables, YouTube/Vimeo/generic embeds, audio, video, file, details, accordion, separator variants, spacer, and button variants. Verse, preformatted text, raw HTML, and cover blocks have been intentionally removed from the fixture as they are not part of the normal editorial workflow.
- Local block QA routes are `http://my-website.localhost/writing/block-qa-kitchen-sink-post` and `http://my-website.localhost/case-studies/block-qa-kitchen-sink-case-study`
- Gutenberg image alignment and breakout behavior currently belongs to [`packages/styles/_wordpress-blocks-baseline.scss`](/Users/aslan/work/my-website/packages/styles/_wordpress-blocks-baseline.scss) because those rules adapt WordPress layout conventions, not a generic image component recipe

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
