# My Website

Monorepo for a Nuxt SSR frontend and a headless WordPress CMS.

This repo is intentionally set up so design and styling can stay highly manual and art-directed, while the engineering foundation stays reproducible and boring in the good way.

## Planned architecture

- `apps/frontend`: Nuxt 3 SSR application
- `apps/cms`: WordPress runtime, project plugins, and editor theme
- `packages/styles`: shared SCSS tokens and content primitives
- `docker`: Docker Compose and Caddy configuration

## Development model

- Nuxt runs on the host during development for better HMR and easier debugging
- WordPress, MariaDB, and Caddy run in Docker
- All source code lives in this repository and is mounted into containers where needed
- WordPress uploads are intentionally excluded from Git and should be handled through media/file migration rather than source deploys
- Homepage hero content is currently sourced from WordPress settings plus the `/home/` page, with safe frontend defaults when values are missing
- Gutenberg content is fetched structurally through GraphQL and rendered through Vue block components rather than dumping raw HTML

## Useful commands

- `corepack pnpm install`
- `corepack pnpm dev` starts Nuxt on `127.0.0.1:3000` so `http://my-website.localhost` works through Caddy
- `corepack pnpm docker:up`
- `corepack pnpm docker:down`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm build`

## Local URLs

- Frontend dev app: `http://localhost:3000`
- Frontend pretty local URL via Caddy: `http://my-website.localhost`
- WordPress CMS via Caddy: `http://cms.my-website.localhost`
- WordPress GraphQL endpoint: `http://cms.my-website.localhost/graphql`
- Direct WordPress container access for local SSR/dev tooling: `http://127.0.0.1:8080`

## Current content model notes

- Standard time-based writing currently lives in regular WordPress posts
- Evergreen collection content currently lives in a dedicated `Case Study` post type
- Regular WordPress pages are still available for one-off destinations such as `Home`, `About`, or other standalone content
- If a second evergreen content family appears later, we can add it deliberately instead of over-generalizing the model too early

## CMS baseline

- WordPress core is pinned in Docker to `6.9.4`
- `wp-graphql` is pinned to `2.11.0`
- `wp-graphql-content-blocks` is pinned to `v4.8.4`
- The editor-facing theme is `My Website Editor Theme` by `Aslan French`
- The project blocks plugin is `My Website Blocks` by `Aslan French`
- Unused default themes and Akismet are intentionally not part of the project-owned `wp-content`

## Secrets and credentials

- Commit [`docker/.env.example`](/Users/aslan/work/my-website/docker/.env.example), not [`docker/.env`](/Users/aslan/work/my-website/docker/.env)
- Keep real local credentials in an untracked [`docker/.env`](/Users/aslan/work/my-website/docker/.env)
- Keep WordPress uploads out of Git via [`.gitignore`](/Users/aslan/work/my-website/.gitignore)
- Keep production credentials in an untracked env file on the server
- Change bootstrap defaults like the local WordPress admin password after first login
- Git deployments do not reset the WordPress admin password as long as the database volume is preserved

## Git status

- Local repository has been initialized and committed
- Uploads are no longer tracked in Git
- Next step is to push `main` to GitHub at `jcklpe/my-website`

## Pinned CMS plugin versions

- `wp-graphql`: `2.11.0`
- `wp-graphql-content-blocks`: `v4.8.4`

These are pinned intentionally so local installs and production deployments do not drift.
