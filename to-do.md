# My Website Progress

## Current state

- Monorepo scaffold exists for `apps/frontend`, `apps/cms`, `packages/styles`, and `docker`
- Nuxt 3 SSR frontend is set up with `pnpm`, ESLint, Prettier, SCSS, and page transitions
- WordPress runs in Docker with MariaDB and Caddy
- WordPress bootstrap installs core, activates `WPGraphQL`, and activates pinned `wp-graphql-content-blocks`
- WordPress core is now pinned to `6.9.4`
- Gutenberg block data is available in GraphQL through `editorBlocks(flat: true)`
- Frontend SSR is wired to fetch WordPress data locally
- Homepage mega text, title, subtitle, vital-info tagline, and quick links now come from ACF fields on the assigned WordPress front page
- The WordPress front page keeps its page title but hides the large Gutenberg body editor so structured fields are the main editing surface
- Homepage has been split into smaller atomic components with local component styles
- Shared style palettes now live as Sass source values; context-roles export the CSS custom properties they need
- The type palette owns IBM Plex font loading so the Vue frontend and WordPress editor use the same font resource source
- Vue component styles now consume normal palette values through CSS custom properties, while Sass `additionalData` is kept narrow for mixins/helpers
- A WordPress editor context-role exists with an editor-specific subset of exported design variables
- The WordPress editor context-role compiles to the editor theme's generated-but-versioned `editor.css` through `corepack pnpm styles:wp-editor`
- Homepage now has the first-pass BLUF hero, sticky homepage nav placement, vital-info section, case-study section, latest-writing section, and global footer
- Global footer content is backed by an ACF settings/options page
- Interior nav is electric-blue, fixed, and set up to hide/reveal based on scroll direction
- Posts and case studies now query featured image data and render media on cards and detail pages
- Card media and detail hero media include matching shared-media keys for future shared-element transitions
- Nuxt page transitions are enabled again with explicit route transition boundary wrappers on multi-section pages
- Dynamic writing and case-study detail routes now have visible loading, error, and not-found states
- Gutenberg image rendering has basic frontend constraints so WordPress media cannot swallow the full viewport
- The editor-facing theme is now `My Website Editor Theme` by `Aslan French`
- The project blocks plugin is now `My Website Blocks` by `Aslan French`
- Unused default themes and Akismet are not part of the project-owned `wp-content`
- ACF Pro can be installed from the private plugin zip path without being committed to Git
- WordPress uploads are ignored by Git and treated as media assets, not source code
- Frontend favicon is generated from the project source image and WordPress admin Site Icon is now bootstrapped programmatically
- Local CMS route works at `http://cms.my-website.localhost`
- Local frontend routes are intended to be reached at both `http://127.0.0.1:3001` and `http://my-website.localhost`
- Design-system terminology is documented in `design-system.md`

## Finished

- Read and align on `initial-prompt.md`
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
- Add featured image GraphQL/frontend support for posts and case studies
- Split writing and case-study listing cards into separate component families
- Restore page transitions safely by giving multi-section pages one transition boundary root
- Add route scroll handling and detail-page guard states for more reliable SPA navigation
- Document the project design-system terminology and reorganize the SCSS package around palettes, shared components, and context-roles
- Add and wire a WordPress editor context-role for shared editor styling
- Centralize font loading through the shared type palette and remove the separate Nuxt Google Fonts module / editor font shim
- Keep the compiled WordPress editor `editor.css` committed because WordPress loads CSS assets directly, not the Sass source
- Stop tracking temporary reference assets and ignore future `temp-ref-assets/` / `temp-reference-assets/` folders

## In progress

- Refine the front page information architecture and first-pass visual system before going deeper on polished motion
- Continue refining the shared styles package as new real component needs appear

## Next

- Continue migrating useful surface styling from previous theme projects without importing old layout or React patterns
- Build the front page in structured passes:
  - Refine the hero section typography, rhythm, and eventual electric-blue texture treatment
  - Refine sticky front-page nav behavior and make sure it remains seamless with the hero background
  - Refine vital info / quick links layout and link styling
  - Style Case Study cards distinctly from Post cards
  - Refine Latest Writing cards separately from Case Study cards
  - Refine footer content model and visual treatment
- Decide the homepage field model for the new front-page sections:
  - section headings / optional intros where needed
  - optional controls for which content appears in each homepage section
  - richer footer links/content if the current settings fields become too small
- Add About section to the front page if it remains distinct from the vital info section after we block out the structure
- Add Side Project page
- Normalize post excerpts and other text fields for frontend display across all listing/detail views
- Consider extracting detail-page shells for writing and case studies if they keep converging
- Establish a small reusable frontend component vocabulary
- Improve editor theme and block plugin structure on the CMS side
- Decide whether the WordPress editor stylesheet should eventually be compiled automatically during CMS bootstrap/build rather than manually through `styles:wp-editor`
- Decide whether any shared component recipes should become public classes, explicit mixins, or both as real usage emerges
- Add footnote support, potentially requiring a plugin
- Add prefetching for post/case-study detail data from cards so clicked content appears immediately
- Choose and add a project license

## Later

- Plan a WooCommerce-backed shop replacement for the current Shopify site
- Preserve the future shop subdomain pattern, likely `shop.aslanfrench.work`
- Decide how the shop frontend should share the current Nuxt/WordPress architecture without over-coupling commerce to editorial content
- Explore WooCommerce data access patterns for the Nuxt frontend, including REST, GraphQL, cart/session behavior, checkout, and payment constraints
- Add seamless multimedia gallery from an old WordPress theme as a custom Gutenberg block
- Potentially add password protection for case studies
- Add IndieWeb and ActivityPub protocol features
- Add canonical link fix for Medium posts and document the exact problem later
- Introduce custom Gutenberg blocks only where core blocks are insufficient
- Add production-focused deployment docs for Vultr
- Add CI for lint, typecheck, and production build
- Improve page transitions so they hinge around the hero image and preview image on cards using the existing shared-media keys
- Build the more ambitious homepage motion system:
  - front-page nav sticks when it reaches the top
  - interior-page nav hides until upward scroll and then floats back in
  - shared-element style transitions centered around preview and hero media

## Guardrails

- Keep local and production installs reproducible with pinned versions where possible
- Keep real credentials out of Git
- Prefer explicit architecture over clever shortcuts
- Preserve designer-friendly readability in the codebase
- Prefer stable editorial terminology when it already matches the real content behavior
