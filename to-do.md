# My Website Progress

## Current state

- Monorepo scaffold exists for `apps/frontend`, `apps/cms`, `packages/styles`, and `docker`
- Nuxt 3 SSR frontend is set up with `pnpm`, ESLint, Prettier, SCSS, and page transitions
- WordPress runs in Docker with MariaDB and Caddy
- WordPress bootstrap installs core, activates `WPGraphQL`, and activates pinned `wp-graphql-content-blocks`
- WordPress core is now pinned to `6.9.4`
- Gutenberg block data is available in GraphQL through `editorBlocks(flat: true)`
- Frontend SSR is wired to fetch WordPress data locally
- Homepage hero content now comes from WordPress-backed data with frontend fallback defaults
- Homepage has been split into smaller atomic components with local component styles
- Shared typography tokens and semantic type palette now live in the shared SCSS package
- The editor-facing theme is now `My Website Editor Theme` by `Aslan French`
- The project blocks plugin is now `My Website Blocks` by `Aslan French`
- Unused default themes and Akismet are not part of the project-owned `wp-content`
- WordPress uploads are ignored by Git and treated as media assets, not source code
- The local Git repository is initialized and committed, ready to push to GitHub
- Local CMS route works at `http://cms.my-website.localhost`
- Local frontend routes are intended to be reached at both `http://localhost:3000` and `http://my-website.localhost`

## Finished

- Read and align on `initial-prompt.md`
- Set up root workspace tooling and repo structure
- Scaffold Nuxt frontend app
- Scaffold WordPress app, bootstrap plugin, and editor theme
- Create shared SCSS package for tokens and content primitives
- Pin WordPress GraphQL plugin versions for reproducibility
- Get Docker Desktop based local CMS stack working
- Verify structured Gutenberg block rendering from WordPress to Nuxt
- Move secrets workflow toward committed examples and untracked real env files
- Refactor the homepage into smaller Vue components
- Move semantic typography rules into shared global SCSS
- Pull homepage hero copy from WordPress with safe defaults
- Rename CMS theme and plugin labels away from portfolio language
- Stop tracking WordPress uploads in Git

## In progress

- Clarify how homepage hero content should eventually be authored:
- native settings plus page content only
- or a more explicit custom field model later if needed

## Next

- Keep `Case Study` as the current evergreen content type and validate that it covers the first real content batch comfortably
- Normalize post excerpts and other text fields for frontend display across all listing/detail views
- Add clearer route-level components for writing archive and post detail
- Establish a small reusable frontend component vocabulary
- Improve editor theme and block plugin structure on the CMS side
- Push the initialized local repository to GitHub

## Later

- Add evergreen content frontend routes once the content model is finalized
- Introduce custom Gutenberg blocks only where core blocks are insufficient
- Add production-focused deployment docs for Vultr
- Add CI for lint, typecheck, and production build
- Explore page transitions and shared-element transitions after content flow is stable

## Guardrails

- Keep local and production installs reproducible with pinned versions where possible
- Keep real credentials out of Git
- Prefer explicit architecture over clever shortcuts
- Preserve designer-friendly readability in the codebase
- Prefer stable editorial terminology when it already matches the real content behavior
