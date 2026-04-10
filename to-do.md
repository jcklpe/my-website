# My Website Progress

## Current state

- Monorepo scaffold exists for `apps/frontend`, `apps/cms`, `packages/styles`, and `docker`
- Nuxt 3 SSR frontend is set up with `pnpm`, ESLint, Prettier, SCSS, and page transitions
- WordPress runs in Docker with MariaDB and Caddy
- WordPress bootstrap installs core, activates `WPGraphQL`, and activates pinned `wp-graphql-content-blocks`
- WordPress core is now pinned to `6.9.4`
- Gutenberg block data is available in GraphQL through `editorBlocks(flat: true)`
- Frontend SSR is wired to fetch WordPress data locally
- Homepage title and subtitle now come from ACF fields on the assigned WordPress front page
- The WordPress front page keeps its page title but hides the large Gutenberg body editor so structured fields are the main editing surface
- Homepage has been split into smaller atomic components with local component styles
- Shared typography tokens and semantic type palette now live in the shared SCSS package
- The editor-facing theme is now `My Website Editor Theme` by `Aslan French`
- The project blocks plugin is now `My Website Blocks` by `Aslan French`
- Unused default themes and Akismet are not part of the project-owned `wp-content`
- ACF Pro can be installed from the private plugin zip path without being committed to Git
- WordPress uploads are ignored by Git and treated as media assets, not source code
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
- Add optional private-plugin installation flow for ACF Pro
- Move homepage hero editing to structured ACF fields on the front page

## In progress

- Refine the front-page authoring experience so structured fields feel good to edit
- Keep validating that ACF is worth the dependency as homepage structured content grows

## Next

- Keep `Case Study` as the current evergreen content type and validate that it covers the first real content batch comfortably
- Add styling from previous WordPress theme projects
- Add About section to the front page
- Add Case Studies section to the front page
- Add footer
- Add Side Project page
- Normalize post excerpts and other text fields for frontend display across all listing/detail views
- Add clearer route-level components for writing archive and post detail
- Establish a small reusable frontend component vocabulary
- Improve editor theme and block plugin structure on the CMS side
- Add footnote support, potentially requiring a plugin

## Later

- Add evergreen content frontend routes once the content model is finalized
- Add seamless multimedia gallery from an old WordPress theme as a custom Gutenberg block
- Potentially add password protection for case studies
- Add IndieWeb and ActivityPub protocol features
- Add canonical link fix for Medium posts and document the exact problem later
- Introduce custom Gutenberg blocks only where core blocks are insufficient
- Add production-focused deployment docs for Vultr
- Add CI for lint, typecheck, and production build
- Improve page transitions so they hinge around the hero image and preview image on cards

## Guardrails

- Keep local and production installs reproducible with pinned versions where possible
- Keep real credentials out of Git
- Prefer explicit architecture over clever shortcuts
- Preserve designer-friendly readability in the codebase
- Prefer stable editorial terminology when it already matches the real content behavior
