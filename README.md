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

## Project Docs Workflow
- Root workflow index: `TODO.md`
- Active spike docs: `docs/active-spikes/`
- Scratch intake and drafts: `docs/scratch/` (live inbox: `docs/scratch/misc.md`)
- Archived spike history: `docs/archive/`
- Saved possibilities and parked decisions: individual notes in `docs/scratch/`, using `capture-for-later`
- Current policies: `docs/policies/`

Use [AGENTS.md](AGENTS.md) and the adopted [Project Workflows](project-workflows/README.md) collection for project workflow. Read [workflow.toml](project-workflows/workflow.toml) and the relevant root skill inside that submodule. Website publishing guidance lives in [Static Publishing](#static-publishing).

The workflow child uses `project/my-website`; the website remains on its own branch. Clone with submodules, or initialize the pinned collection with `git submodule update --init project-workflows` when its required commit is published. The [adoption record](docs/active-spikes/project-workflows-adoption.md) records current local readiness and publication limits. Do not advance the child or change its branch merely to make an unavailable pin disappear.

## Useful Commands
For a new checkout or empty CMS volumes, complete [first-time CMS provisioning](docs/cms-security.md#first-time-provisioning) before the normal start commands.

- `corepack pnpm install`
- `corepack pnpm start:frontend` starts Nuxt on `127.0.0.1:3001`
- `corepack pnpm start:frontend:phone` starts Nuxt through a temporary Cloudflare Quick Tunnel and prints a trusted HTTPS URL and QR code for phone QA; start the CMS separately first
- `corepack pnpm start:all` starts the public + QA CMS stack, then starts Nuxt on `127.0.0.1:3001`
- `corepack pnpm start:phone` waits for the public CMS, then starts a temporary Cloudflare Quick Tunnel with a trusted HTTPS URL and QR code
- `corepack pnpm setup:docker-env` creates ignored `docker/.env` credentials for a new clone and never overwrites an existing environment; Docker start commands run it automatically
- `corepack pnpm docker:up` starts the public CMS stack
- `corepack pnpm docker:up:all` starts the public CMS plus the QA CMS
- `corepack pnpm docker:down`
- `corepack pnpm docker:down:all`
- `corepack pnpm docker:logs`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm sync:resume` refreshes the downloadable résumé PDF from its dedicated Drive folder using the existing LifeOS CLI; see Résumé Download below
- `corepack pnpm check` regenerates WordPress editor CSS, then runs lint and typecheck
- `corepack pnpm check:transitions` drives headless system Chrome through Home → case study, Home → Latest Writing post and Writing Archive → post round trips against a running static preview (default `http://127.0.0.1:3002`), and reports anything that stays still then vanishes, pops out without moving, strands a clone or stays concealed after Back. Options: `-- --origin=<url> --width=1512 --height=945 --journey=case-study,latest-writing,archive --json`. Set `CHROME_BIN` if Chrome is not in `/Applications`.
- `corepack pnpm build` regenerates WordPress editor CSS, then builds the Nuxt frontend
- `corepack pnpm static:routes` prints the fixed and WordPress-discovered routes used for static generation
- `corepack pnpm static:generate` regenerates WordPress editor CSS, then generates static Nuxt output from the public CMS by default
- `corepack pnpm check:live-halftone --journey` probes the live GPU treatment, image/text hover updates, and Home-to-detail handoff against a running static preview (default `http://127.0.0.1:3002`). Add `--routes` for a case-study loop and Back journey, `--reduced-motion` for direct navigation with live surfaces, `--no-webgl`, `--disabled`, or `--context-loss` to check plain-image fallback, or pass a Nuxt origin such as `http://127.0.0.1:3001`. New WordPress uploads generate ordinary responsive sizes; legacy baked metadata remains filtered while case-study halftone pixels are drawn in the browser.
- `corepack pnpm check:transitions -- --journey=home-about,home-writing --json` targets the physical Home/About and Home/Writing candidates. Add `--width=390 --height=844` for a phone layout or `--reduced-motion` to check navigation/restoration without enforcing the spatial-exit contract. These candidates still need human feel/ground-handoff review; see the route-choreography task doc.
- `corepack pnpm check:gpu-trails` checks rendered GPU trail pixels and cleanup for Home/case-study, case-study loop, Latest Writing, and Writing Archive round trips on the static preview. Add `--narrow`, `--reduced-motion`, `--no-webgl`, or `--context-loss` for targeted variants. Trails use a dedicated WebGL canvas: live halftone for case studies and ordinary photos for writing. Pixel readback checks correctness, not physical smoothness.
- `corepack pnpm generate:static:public` explicitly generates static Nuxt output from the public CMS
- `corepack pnpm update:push` backs up the public CMS, generates fresh public static output, inspects it, then runs the Bunny deploy. It stops on the first failure and uses the existing `.env.deploy` / shell settings, including dry-run protection (`STATIC_DEPLOY_DRY_RUN=0` enables real uploads). Start the public CMS first. This publishes the site; it does not push Git commits.
- `corepack pnpm generate:static:qa` explicitly generates static Nuxt output from the QA CMS
- `corepack pnpm generate:preview` generates static output from the public CMS, then serves it locally on `127.0.0.1:3002`
- `corepack pnpm start:static:preview` serves the generated output locally on `127.0.0.1:3002`; with Caddy running it is also available at `http://static.my-website.localhost`
- `corepack pnpm inspect:static` summarizes the generated static output, provider target, and media URL mapping without uploading files. `STATIC_DEPLOY_ENV=preview STATIC_DEPLOY_DRY_RUN=1 corepack pnpm --dir apps/frontend static:deploy:bunny --verify-media-rewrite` checks the actual local-to-public media URL replacement logic in memory without changing output or uploading files.
- `corepack pnpm deploy:bunny` uploads generated static files and referenced media to Bunny Storage only when deploy credentials are configured and `STATIC_DEPLOY_DRY_RUN=0`; real uploads require purge credentials and finish with cache purge and public verification. Add `-- --force` to bypass unchanged-media skipping for a single deploy when the remote media copy is suspect; force mode does not bypass dry-run protection, retries, cache purge, or public verification.
- `corepack pnpm releases:static` lists ignored, hash-verified production release artifacts retained under `.releases/static/`
- `corepack pnpm rollback:static:bunny -- <release-id>` validates and previews an artifact-only rollback; add `--execute` to redeploy, purge, and publicly verify without regenerating from WordPress
- `corepack pnpm prune:static:bunny -- --release=<release-id>` writes an exact ignored dry-run plan for obsolete generated files; execution additionally requires the printed `--confirm-plan=<hash>` plus `--execute`. Shared `/media/` and provider/system paths are never candidates.
- `corepack pnpm configure:static:bunny` previews the repo-managed Bunny cache/header rules; add `-- --apply` to reconcile only those managed rules
- `corepack pnpm styles:wp-editor` compiles the WordPress editor context-role SCSS into the CMS editor theme's generated `editor.css`
- `corepack pnpm start:cms:public` starts the public CMS stack
- `corepack pnpm start:cms:qa` starts the public CMS plus the QA CMS
- `corepack pnpm backup:cms:public` exports the public CMS database and uploads into `.backups/cms/content/<timestamp>/`, then keeps the latest 5 local backups by default
- `corepack pnpm backup:cms:qa` exports the QA CMS database and uploads into `.backups/cms/qa/<timestamp>/`
- `corepack pnpm list:backups:cms:public` lists local public CMS backups, their sizes, and whether checksum metadata is present
- `corepack pnpm restore:cms:public -- .backups/cms/content/<timestamp> --yes` restores a public CMS backup; this is destructive and moves current uploads into `.backups/restore-safety/`
- `corepack pnpm restore:cms:qa -- .backups/cms/content/<timestamp> --yes` restores a public CMS backup into the disposable QA CMS for restore testing
- `corepack pnpm seed:cms:qa` creates or updates representative Gutenberg QA content in the QA CMS
- `corepack pnpm seed:cms:qa:more` creates or updates 30 fixture writing posts with featured images, excerpts, and realistic block content in the QA CMS

The older `deploy:static:bunny` command remains an alias for `deploy:bunny`.

Older `cms:content:*`, `cms:dev:*`, `static:generate:content`, and `static:generate:dev` aliases still exist for compatibility, but current docs use `public` for real publishable content and `qa` for fixture/test content.

## Static Publishing
Static publishing is an explicit publish/QA path; everyday development still uses Nuxt and local WordPress. Use the public CMS for publishable content and QA for fixtures or experiments. Start the chosen CMS and restore the [licensed display fonts](#licensed-display-fonts) before generation. A frontend dev server is not required for a static build.

Choose the intended source and target before running commands. The ignored `.env.deploy` and shell settings select preview/production and dry-run/real upload; a saved `STATIC_DEPLOY_DRY_RUN=0` makes a deploy real. Keep credentials out of committed files and package scripts; see [Secrets And Credentials](#secrets-and-credentials).

- **Local preview:** `corepack pnpm generate:preview` generates public-CMS output and serves it locally. For QA content, use `corepack pnpm generate:static:qa`, then `corepack pnpm start:static:preview`.
- **Full publish:** with the public CMS running, `corepack pnpm update:push` runs backup → public generation → inspection → Bunny deploy. It stops on failure and honors the existing deploy settings; it does not push Git commits.
- **Review before upload:** run `corepack pnpm backup:cms:public`, `corepack pnpm generate:static:public`, then `corepack pnpm inspect:static`; use `corepack pnpm start:static:preview` to review the generated candidate. Run `corepack pnpm deploy:bunny` only when that candidate and its target are ready. That command alone does not back up the CMS or perform the full inspection. Resolve inspection blockers before uploading, and retain the backup path with the publish result.

`STATIC_PUBLIC_SITE_URL` is the single public-origin input for static generation. It supplies self-referential canonicals, `og:url`, `robots.txt`, `sitemap.xml`, and generated `llms.txt`; shell values override the ignored `.env.deploy` file. A public-CMS build is indexable only when `STATIC_DEPLOY_ENV=production`, while preview and QA builds emit `noindex` metadata and a crawler-blocking `robots.txt`. Production uses `STATIC_DEPLOY_ENV=production`, `STATIC_PUBLIC_SITE_URL=https://www.aslanfrench.work`, and matching Bunny/media origins; the deploy rejects contradictory or placeholder production origins. The apex hostname redirects permanently to the matching `www` path.

Let the tooling upload media and rewrite URLs; do not hardcode CDN URLs in frontend source. Prefer WordPress-generated responsive image metadata. Generated output must not expose local GraphQL/API URLs. The [inspector](apps/frontend/scripts/static-deploy-plan.mjs) and [deployer](apps/frontend/scripts/static-deploy-bunny.mjs) own the executable checks; their HTTP/hash checks do not establish visual correctness.

After upload, purge, and public verification succeed, tooling retains the exact rewritten production artifact and its SHA-256 manifest under ignored `.releases/static/`. It keeps five unpinned releases by default (`STATIC_RELEASE_KEEP` changes that count); a `PINNED` file exempts a release. Failed deploys are not retained. CMS backups are a separate recovery layer.

If upload fails, stop: deployment is incomplete. If purge fails after upload, retry the same artifact; do not prune or change DNS. If public verification fails, inspect the failure and decide whether to retry the same artifact or use a known-good release. `releases:static` lists releases; `rollback:static:bunny -- <release-id>` validates and previews one, and `--execute` redeploys that exact artifact without regenerating from WordPress. Content rollback and DNS/CDN infrastructure recovery are separate decisions.

Pruning is separate from publishing. Review the exact ignored `.deploy/static-prune-plan.json` before using `prune:static:bunny` with the chosen verified release, fresh `--confirm-plan=<hash>`, and `--execute`. A failed deployment or verifier does not authorize deletion. Media and provider/system paths remain protected. CDN configuration changes use the separate `configure:static:bunny` preview/apply path; do not change HTML revalidation, unmanaged rules, DNS, or the deliberately declined HSTS policy as incidental publish cleanup.

After a real preview or production upload, check Home, Writing, representative writing/case-study details, media, route transitions/return paths, and mobile behavior. Record any visual/interaction QA still outstanding rather than treating automated verification as its substitute. Report the source CMS, target, dry-run versus real upload, backup/release identifiers, and any failures. The production-deploy spike is historical; routine publishing does not reopen it or require its old checklist.

## Phone Interaction QA
For phone interaction QA without a static build or CDN deploy, run `corepack pnpm start:phone` and scan the QR code printed by Nuxt. Nuxt's accountless Cloudflare Quick Tunnel supplies a temporary trusted HTTPS origin; no Cloudflare account or project secret is required. Phone-preview mode proxies public WordPress queries and images through the Nuxt origin so CMS content works without exposing local CMS hostnames to the phone. The command waits for the public CMS before starting Nuxt so the first phone request cannot capture a boot-time placeholder/error state. On Android, the orientation listener starts automatically and the homepage status should progress from **Tilt QA: waiting** to **Tilt QA: active** when the browser delivers events. Open `/dev/rd` for the numeric device-orientation readout and full reaction-diffusion controls. The random tunnel URL is publicly reachable while the process runs, has no uptime guarantee, and changes between sessions; do not use it with sensitive unpublished content, and press Ctrl+C to close it when QA is over.

## Résumé Download
The homepage résumé quick link points to `/downloads/aslan-french-resume.pdf`, a checked-in copy served by Nuxt and included in static output. Its Download action uses the same arrow animation as article file blocks, including the reduced-motion fallback. WordPress still owns the homepage quick-link label and URL.

Run `corepack pnpm sync:resume` after updating the PDF in the [public-resumes Drive folder](https://drive.google.com/drive/folders/1MeTsvtjn1ofjA2nf1y8LmCCASG3SgvTs). The command requires the existing `lifeos` CLI on PATH with its authenticated `personal` Google Drive account (`RESUME_DRIVE_ACCOUNT` can select another configured alias). It reads only that folder and downloads the single PDF named `aslan-french-resume.pdf`; replacing the file in Drive is supported without retaining its old file ID. Missing or duplicate matching files, an incomplete folder listing, authentication errors, and invalid PDF bytes stop the refresh without replacing the existing PDF. The command records the source file, Drive modification time, byte count, and SHA-256 in `scripts/resume-source.json`.

Review the PDF and source manifest changes, then use the normal commit and static publish workflow. Refresh is explicit: normal builds and `update:push` use the checked-in PDF and do not require Drive access or silently pick up a newly uploaded résumé.

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
- The `/now` route is a standalone frontend page that mirrors About-page Now content from the About page's ACF `now_content` field (GraphQL `nowContent`) rather than a dedicated WordPress page
- The Home page uses ACF fields for structured homepage content. Its Gutenberg body editor is intentionally hidden
- Standalone pages can use a plain WordPress title for CMS/admin clarity, an ACF Display Heading for the public `h1`, and Gutenberg body blocks for narrative content
- Homepage vital-info tagline, quick links, employer testimonials, testimonials background texture, and the hero portrait image come from ACF fields on the assigned WordPress front page. The hero portrait falls back to a built-in mock when unset; a roughly 4:5 crop matches the tuned composition. `homepageHeroPortraitSrcSet` exposes WordPress's proportional responsive candidates, while `pages/index.vue` owns the layout-specific size hint; keep that hint aligned with portrait geometry when changing the composition.
- Footer content is managed through an ACF-backed Site Settings options page
- Featured images are first-class card/detail media and participate in the custom featured-media transition system
- The `/side-projects` page is a CMS-backed WordPress Page rendered through `BlockRenderer`, not a custom post type

## Frontend Status
- Nuxt SSR fetches WordPress data through `apps/frontend/composables/useWordPress.ts`
- The homepage keeps one-off hero/top-region markup in `pages/index.vue`; substantial homepage sections live under `components/home` when that makes the page easier to read or reshape
- The Writing index renders post cards with cursor-based Load More pagination, while homepage Selected Work is the public browsing surface for case-study cards
- The About page is a CMS-managed standalone route: WordPress title for the CMS label, ACF Display Heading for the public `h1`, and Gutenberg blocks for body content
- The `/now` page is a focused mirror surface for the same About-page `nowContent` source and intentionally hides interior `SiteNav` chrome
- Interior pages use a small local `SiteNav` affordance rather than a persistent global navbar; the footer provides global wayfinding from deep pages
- The homepage includes an ACF-backed Employer Testimonials section between Selected Work and the Side Projects link section
- Writing and case-study detail routes render featured media, loading/error/not-found states, and structured Gutenberg blocks
- Case-study detail pages include looping previous/next bottom navigation derived from the case-study list
- Card-to-detail and detail-to-list/home route transitions for case-study and writing cards use the custom featured-media transition coordinator in `useFeaturedMediaTransition.ts`
- Route motion timing comes from the Sass motion palette, is exported as CSS custom properties, and is read by JavaScript where cleanup timing must match CSS
- Code blocks use Shiki through `apps/frontend/utils/syntax-highlighting.ts`
- Code blocks and inline code share the Midnight, Phosphor, and Signal themes through `useCodeTheme`; Midnight is the default
- Inline code uses Enzo by default and accepts fragments. In WordPress, place the cursor in a snippet and use **More → Inline code language** for another language or plain text. See [the design system](docs/design-system.md) for the saved-markup contract.

## Gutenberg Rendering
Frontend block rendering starts at `BlockRenderer.vue` and recurses through `BlockChildren.vue`. Unknown blocks fail locally through `UnsupportedBlock.vue`.

Internal links authored in WordPress are normalized by the frontend data layer when they point at known CMS origins. Same-origin links rendered through Gutenberg HTML are also routed through Nuxt on the client so page transitions and static-preview navigation behave like ordinary app links.

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
CMS source is read-only during normal operation; plugin/core updates use one-off CLI maintenance. See [Local CMS Security And Maintenance](docs/cms-security.md) for patching, first-time provisioning, credential handling and verification.

- WordPress core is pinned in Docker to `7.1.3` with PHP `8.3.36`
- `wp-graphql` is pinned to `2.25.0`
- `wp-graphql-content-blocks` is pinned to `v4.8.9`
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
- Production Compose files exist as an SSR/VPS fallback. The live public site is generated from local WordPress content and command-deployed to Bunny at `https://www.aslanfrench.work`; local static preview and inspection remain required publish gates.

## Secrets And Credentials
- Commit `docker/.env.example`, not `docker/.env`. The example contains visible setup markers rather than working passwords.
- Keep real local credentials in an untracked `docker/.env`. `corepack pnpm setup:docker-env` generates random local passwords with owner-only file permissions when the file is absent and leaves established environments unchanged.
- Development Compose overlays bind WordPress and Caddy to `127.0.0.1`; phone QA should expose Nuxt through the temporary Cloudflare tunnel rather than publishing WordPress directly to the LAN.
- Commit `.env.deploy.example`, not `.env.deploy`
- Keep static deploy credentials such as Bunny storage and purge keys in untracked `.env.deploy` or shell env
- Keep WordPress uploads out of Git via `.gitignore`
- Local CMS image uploads are capped through `apps/cms/config/uploads.ini`; rebuild the CMS image after changing PHP upload limits
- Keep premium/private plugin zips out of Git via `docker/private-plugins/`
- Keep optional reference projects in the gitignored root `reference-materials/` folder; discover them through the local paths-only configuration described in [AGENTS](AGENTS.md#local-reference-locations)
- Keep production credentials in an untracked env file on the server
- Change bootstrap defaults like the local WordPress admin password after first login
- Git deployments do not reset the WordPress admin password as long as the database volume is preserved

## Optional ACF Pro Install
- Place `advanced-custom-fields-pro.zip` in `docker/private-plugins/` if you want ACF Pro installed locally or on a server
- One-off maintenance bootstrap installs and activates that ZIP if it exists; normal runtime source mounts are read-only (see the CMS maintenance guide)
- The ZIP is intentionally ignored by Git
- License entry or activation remains a manual/private step in WordPress admin

## Licensed Display Fonts
- The homepage hero uses two licensed display faces: Edwardian Script ITC and Bodoni Z37
- They are registered via `@font-face` in `packages/styles/_type-palette.scss` / `_type-fonts.scss` and served locally from `apps/frontend/public/fonts/`
- `apps/frontend/public/fonts/` is gitignored, so the font files are not committed; the source copies live in the untracked `docker/private-plugins/`
- On a fresh clone the files must be restored locally, or the hero silently falls back to a generic serif/cursive (a locally-installed system font of the same name can mask this during dev):

```sh
mkdir -p apps/frontend/public/fonts
cp docker/private-plugins/Edwardian-Script-ITC.woff2 docker/private-plugins/Bodoni-Z37.woff2 apps/frontend/public/fonts/
```

- Because they are local-only assets, static generation and deploy depend on the files being present in `apps/frontend/public/fonts/` at build time. See [Static Publishing](#static-publishing).

## Pinned CMS Plugin Versions
- `wp-graphql`: `2.11.0`
- `wp-graphql-content-blocks`: `v4.8.4`

These are pinned intentionally so local installs and production deployments do not drift.

## Optional Context And Reference Materials
Read [Local Reference Locations](AGENTS.md#local-reference-locations) for local paths-only configuration and missing-context behavior. Optional context remains external; reference sources live in the gitignored root `reference-materials/` folder. Project work and its spike records stay in the tracked documentation.
