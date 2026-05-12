# Background

The prefetching spike made client navigation feel much faster, but its final QA showed that the remaining performance questions are mostly production-delivery questions: dev-mode Vite noise, image/media payloads, WordPress cache-hit overhead, compression, cache headers, and whether the public frontend should depend on live SSR/GraphQL at all.

This spike explores moving the public site toward static generation and CDN/static hosting while keeping WordPress as the authoring tool and preserving the current local development loop.

The conceptual framing is in `docs/static-deploy.md`.

## Project organization

Add new concrete tasks to `# To Do`. When tasks are implemented, move them either to `# Ready for human QA` or `# Done`.

Keep the conceptual doc focused on direction and tradeoffs. Keep this to-do doc focused on atomic steps, files, commands, verification, and unresolved implementation decisions.

When this spike retires, fold durable lessons into `README.md`, `AGENTS.md`, `docs/design-system.md`, deployment docs, or `to-do.md` as appropriate, then archive the spike docs.

## General principles

- Keep local development unchanged: Nuxt dev mode, Vite HMR, Docker WordPress, and the current local preview loop should keep working.
- Treat static generation as a publish path, not as the everyday editing loop.
- Start with an explicit manual publish command rather than automatic deploy-on-save.
- Do not require dashboard-only zip uploads.
- Keep the existing SSR/Docker production path as a fallback until static deploy is proven.
- Generate all public dynamic routes deliberately from WordPress slugs; do not rely only on crawler discovery.
- Fail the publish build loudly if required WordPress content cannot be fetched.
- Keep WordPress as the CMS/source of truth even if the public frontend becomes static.
- Keep real publishable WordPress content separate from generated QA/test content.
- Decide media hosting before treating local-only WordPress as production-ready.
- Keep deployment credentials out of Git and out of command strings.
- Prefer provider-neutral build output and isolate provider-specific upload behavior.
- Treat Bunny.net as a first-class provider candidate, not Cloudflare as the assumed default.
- Prefer simple, boring deployment mechanics over a fragile pipeline with too many moving parts.
- Measure production-like output before optimizing around local Vite/Lighthouse artifacts.
- Do not touch the style refactor unless static generation exposes a real styling/build issue.

# Current State Overview

The repo currently has a Nuxt SSR frontend and a Docker Compose WordPress/Caddy/MariaDB CMS stack.

Existing public frontend delivery:

- local development runs Nuxt on the host at `127.0.0.1:3001`
- local Caddy exposes `http://my-website.localhost`
- local Caddy exposes generated static preview at `http://static.my-website.localhost` when `corepack pnpm static:preview` is running
- production compose exists with a `frontend` container and Caddy reverse proxy
- `apps/frontend/Dockerfile` builds the Nuxt app and runs `pnpm preview` inside the frontend container
- `docker/compose.prod.yaml` serves the frontend container through Caddy

Existing scripts:

- `corepack pnpm dev`
- `corepack pnpm docker:up`
- `corepack pnpm docker:down`
- `corepack pnpm check`
- `corepack pnpm build`
- `corepack pnpm preview`
- `corepack pnpm static:routes`
- `corepack pnpm static:generate`
- `corepack pnpm static:preview`

The repo now has root static route-discovery, generation, preview, and deploy-plan scripts. There is not yet a real static upload script, media-sync script, or production Lighthouse script.

There is not yet a documented split between a real-content CMS and a dev/QA fixture CMS. The current local CMS can be seeded with generated QA content, which is useful for development but risky as the long-term source of publishable content.

The repo now has a deploy-secret pattern:

- `.env.deploy.example` is committed as the public configuration contract
- `.env.deploy` and other real `.env.*` files are ignored
- package scripts may reference deploy variable names but must not inline token values
- provider tokens should be scoped to the narrowest project, storage zone, or deploy target available
- leaked deploy credentials should be revoked and rotated before the next production deploy

Current Nuxt routes:

- `/`
- `/about`
- `/side-projects`
- `/writing`
- `/writing/[slug]`
- `/case-studies/[slug]`

Current dynamic content dependencies:

- posts come from WordPress GraphQL
- case studies come from WordPress GraphQL
- homepage content comes from WordPress ACF fields
- footer settings come from WordPress ACF options
- featured media and block media currently point at WordPress media URLs

Current performance context:

- prefetching and short-lived WPGraphQL response caching are implemented and archived
- repeated public GraphQL requests can return `X-My-Website-GraphQL-Cache: HIT`
- dev-mode Lighthouse is noisy and not a production baseline
- static deploy work should start with production/static measurement before making large architecture changes
- active static-deploy spike docs live at `docs/static-deploy.md` and `docs/static-deploy.todo.md`
- `apps/frontend/scripts/static-routes.mjs` discovers fixed public routes plus published WordPress post/case-study routes
- `apps/frontend/nuxt.config.ts` uses discovered routes for prerendering only when `NUXT_STATIC_GENERATE=1`
- static generation uses repo-root `.nuxt-static/frontend` so it does not overwrite the normal dev server `.nuxt` cache or churn the dev app watcher
- `corepack pnpm --dir apps/frontend static:generate` successfully generated static output from the local WordPress source
- `corepack pnpm static:preview` uses a small repo-owned Node server for `apps/frontend/.output/public`, avoiding `npx serve` and any registry access during preview
- direct static preview URL: `http://127.0.0.1:3002`
- Caddy static preview URL: `http://static.my-website.localhost`
- direct URL smoke tests against the static preview returned `200 OK` for Home, Writing, a writing detail page, and a case-study detail page
- generated HTML/payloads still point media at `cms.my-website.localhost`, which is expected until the first-pass public media strategy is chosen
- static preview browser QA passed locally and Lighthouse reported a static-preview performance score of 97
- Bunny.net is the first provider to prototype for static output and public media delivery
- Cloudflare Pages remains a practical static-deploy fallback; Codeberg Pages remains values-aligned but probably needs a separate media host
- `corepack pnpm static:deploy:plan` now summarizes the generated output and flags lingering local CMS/media URLs without uploading anything
- the next implementation focus is public media URL/sync strategy, followed by the real-content CMS versus dev/QA CMS split

# To Do

## Slice 2: Establish production and static baselines

- Add or document the command for a production SSR baseline:
  - `corepack pnpm build`
  - `corepack pnpm preview`
- Run Lighthouse against production preview in a clean browser profile or incognito profile with extensions disabled
- Record baseline metrics:
  - FCP
  - LCP
  - TBT
  - CLS
  - Speed Index
  - total transfer
  - largest image/media payloads
  - render-blocking warnings that remain outside dev mode
- Use `corepack pnpm static:generate` and `corepack pnpm static:preview` for the static-generation baseline
- Compare dev-mode, production-preview, static-preview, and deployed-static results

Acceptance:

- The spike has a real baseline that is not polluted by Vite dev mode
- Dev-only warnings are separated from real production issues
- The next optimization slice is chosen from measured production/static output

## Slice 3: Separate real-content CMS from dev/QA CMS

This should happen before any real public production deploy. It does not need to block provider evaluation or deploy-script scaffolding, but it should happen before a deploy command becomes the trusted publish path for real content.

- Decide a local environment split for WordPress content sources:
  - real-content CMS for publishable content
  - dev/QA CMS for generated fixture content and experiments
- Evaluate using separate Docker Compose project names with separate volumes
- Evaluate using separate env files for content CMS and dev CMS
- Decide whether helper scripts are needed, such as:
  - `cms:dev:up`
  - `cms:content:up`
  - `cms:content:backup`
  - `cms:content:restore`
- Ensure QA seed scripts clearly target the dev/QA CMS by default, not the real-content CMS
- Ensure static generation makes the source CMS explicit
- Document how to tell which CMS instance is currently running

Acceptance:

- There is a clear way to run a fixture-heavy CMS without polluting real publishable content
- There is a clear way to run/generate from a real-content CMS
- Static publish commands cannot accidentally hide which CMS they are reading from

## Slice 4: Add local CMS backup and restore workflow

- Add or document a local database export command
- Add or document an uploads archive/sync command
- Decide where timestamped local backups should live
- Ensure backups are outside Docker volumes
- Decide how backups should get off the laptop:
  - encrypted cloud folder
  - external drive
  - future homelab sync
  - other boring off-device target
- Document private plugin/license handling
- Test one restore into a fresh local CMS volume before calling the workflow reliable

Acceptance:

- Real authored WordPress content has a documented backup path
- The backup path includes DB plus uploads/media
- The restore path is tested at least once
- The project has an answer to "what happens if this laptop dies?"

## Slice 5: Confirm static compatibility of current routes

- Test hard refresh on generated `/`
- Test hard refresh on generated `/writing`
- Test hard refresh on one generated writing detail route
- Test hard refresh on one generated case-study detail route
- Test client navigation:
  - Home to case study
  - Home to writing detail
  - detail back to Home
  - writing detail to Writing archive
  - footer links
- Confirm featured-media transitions still work where source and target cards exist
- Confirm fallback route transitions still work where no shared target exists
- Confirm lazy body/block loading does not accidentally defer content that should be present in generated HTML/payload

Acceptance:

- Generated static pages work on direct URL entry
- Generated static pages work through client navigation
- Existing transition behavior is preserved
- Generated output does not make public visitors depend on live WordPress GraphQL for already-generated detail pages

## Slice 6: Prototype first-pass public media strategy

First-pass direction: prototype Bunny.net for public media delivery while keeping local WordPress media URLs for normal dev.

- Decide whether Bunny media should use:
  - a dedicated media storage zone/pull zone
  - the same storage zone as static output under a `/media/` prefix
- Add a media-reference audit that can list CMS-hosted uploads referenced by generated output
- Decide whether first-pass media sync copies:
  - all WordPress uploads
  - only referenced media
  - referenced media plus selected generated image sizes
- Decide where media URL rewriting should happen:
  - at WordPress/GraphQL data shape time
  - at Nuxt render/build time
  - as a post-generation payload/HTML rewrite step
- Ensure Mega Gallery, normal gallery, featured images, audio, video, and file blocks are represented in the media audit
- Keep media sync as dry-run first; no public upload until the file list and URL mapping are clear
- Document cache expectations for media separately from HTML/payload files

Acceptance:

- The project has a concrete first-pass media sync and URL rewrite strategy
- Generated public pages do not point at inaccessible local WordPress media URLs
- The chosen strategy can handle featured images, block images, galleries, Mega Gallery items, audio, video, and file blocks well enough for current content
- The dry-run media plan shows what would be copied and what generated references would change

## Slice 7: Build Bunny static deploy prototype

- Keep `corepack pnpm static:deploy:plan` as the safe preflight command
- Add a Bunny upload script only after the dry-run plan is clear
- Require `.env.deploy` or shell env values for Bunny credentials
- Upload generated static files from `apps/frontend/.output/public`
- Preserve relative paths exactly
- Do not print `BUNNY_STORAGE_ACCESS_KEY` or `BUNNY_PURGE_API_KEY`
- Decide whether preview and production use:
  - separate Bunny storage zones
  - separate prefixes in the same zone
  - separate pull zones
- Add optional pull-zone purge guidance or command after upload

Acceptance:

- Bunny static deploy can be driven from the command line
- The upload script has a dry-run mode
- No credentials are committed or logged
- The provider-specific behavior is isolated to deploy scripts/docs, not Vue components

## Slice 8: Image optimization and responsive media

- Audit current GraphQL media fields for width/height/src metadata
- Decide how to serve responsive image variants from static/CDN media
- Avoid serving original full-size WordPress uploads in cards, thumbnails, and article images when a smaller derivative is sufficient
- Prefer WebP/AVIF derivatives where the chosen media host supports them
- Preserve explicit `width` and `height` on images
- Keep detail hero media eager/high-priority
- Keep below-the-fold article media lazy/async
- Verify Mega Gallery and PhotoSwipe still receive full-size media when the lightbox actually needs it

Acceptance:

- Large PNG/JPEG originals are not the default card/article payload
- Images have stable dimensions
- Lighthouse image-delivery savings drop meaningfully on the deployed/static baseline

## Slice 9: Static host deployment command

- Choose the first static host target
- If using Cloudflare Pages direct upload, add a command-line deploy path using the generated output folder
- If using Bunny.net, add a command-line upload path to Bunny Storage and CDN/Pull Zone invalidation or cache-update guidance as needed
- Add separate preview and production deploy expectations if the host supports them
- Keep deploy credentials out of Git
- Document required local environment variables or token setup
- Confirm whether the chosen host can be driven entirely from a command without dashboard zip uploads

Possible command shape:

- generate locally
- preview locally
- deploy generated folder to preview/staging
- promote or deploy to production explicitly

Acceptance:

- A deploy can be initiated from the repo with one documented command
- The deploy uses generated static output, not source-only assumptions
- No credentials are committed
- The user can preview before production replacement

## Slice 10: Compression and cache headers

- Confirm what the static host does automatically for Brotli/gzip
- Configure cache headers for generated hashed assets
- Configure cache headers for fonts
- Configure cache headers for generated or synced media
- Decide cache headers for HTML documents and payload files so content updates propagate predictably
- Verify response headers on deployed output, not just local preview

Acceptance:

- HTML/CSS/JS/JSON/SVG text assets are compressed in production
- hashed assets have long-lived immutable cache headers
- media has an explicit cache policy
- HTML/payload cache behavior supports manual publish updates without stale public pages lingering unexpectedly

## Slice 11: Fonts, SEO, accessibility, and production metadata

- Add `<html lang="en">` in Nuxt head config
- Fix generic "Read More" links with descriptive visible or screen-reader text
- Verify production canonical URLs
- Verify per-route title and meta descriptions
- Add or verify sitemap generation for static output
- Add or verify robots.txt for static output
- Decide whether structured data is needed for posts/case studies
- Move Google Fonts loading out of render-blocking SCSS only if it remains a real production issue after baseline

Acceptance:

- Lighthouse accessibility no longer flags missing `lang`
- generic link text warnings are resolved
- static deployment has production URL metadata
- static deployment has sitemap/robots basics

## Slice 12: Security and operational runbook

- Document local CMS backup procedure:
  - database
  - uploads
  - private plugins/licenses
- Document restore procedure
- Decide whether WordPress stays local-only, public on a VPS, or public behind access controls
- If WordPress is public, document basic hardening:
  - strong credentials
  - plugin/theme update cadence
  - backups
  - login protection
  - HTTPS
- If static host supports security headers, configure:
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - frame protection / CSP `frame-ancestors`
  - permissions policy
  - HSTS when using HTTPS production domain
- Treat CSP as a later careful pass, starting in report-only mode if supported

Acceptance:

- Public static frontend has basic security headers
- CMS backup/restore is documented before relying on local WordPress as the sole content source
- The project has a clear answer to "what happens if the local machine dies?"

## Slice 13: Decide whether static deploy becomes canonical

- Compare current SSR/Vultr path to static CDN path after implementation
- Decide whether Vultr remains:
  - production frontend host
  - CMS-only host
  - fallback only
  - unnecessary for first production launch
- Update `README.md` and `AGENTS.md` if the canonical production model changes
- Update root `to-do.md` with the new production roadmap
- Archive or revise older Vultr-only deployment assumptions

Acceptance:

- The repo has one clear recommended production path
- Older SSR/Vultr notes are not left as misleading canonical guidance if static deploy wins
- Local development instructions remain clear

# Ready for human QA

No static-deploy items are currently waiting on human QA.

# Done

## Initial static-deploy spike docs

- Filled out `docs/static-deploy.md` with the conceptual model, SSR/static distinction, local-development boundaries, route inventory, media-hosting concern, manual publish direction, Vultr relationship, and desired end state
- Filled out `docs/static-deploy.todo.md` with concrete slices for baselining, static generation, route discovery, static compatibility, media strategy, image optimization, deploy commands, cache headers, metadata, security, backups, and canonical-hosting decisions
- Updated `to-do.md` so static deployment is represented as the next production-performance planning thread while keeping the existing SSR/Vultr path as a fallback

## Local static generation foundation

- Added `apps/frontend/scripts/static-routes.mjs` to discover fixed routes plus published post and case-study slugs from WordPress GraphQL
- Added `corepack pnpm static:routes` for inspecting the route list used by static generation
- Added `corepack pnpm static:generate` for editor-CSS generation plus Nuxt static generation
- Added `corepack pnpm static:preview` for local generated-output preview on port 3002
- Wired `apps/frontend/nuxt.config.ts` to prerender discovered routes only when `NUXT_STATIC_GENERATE=1`, so normal dev/build/SSR paths do not depend on route discovery
- Verified `corepack pnpm static:routes` against the local CMS; it discovered 56 public routes
- Verified `corepack pnpm --dir apps/frontend static:generate`; Nitro prerendered 114 HTML/payload routes and generated `.output/public`

## Static preview smoke test

- Replaced Nuxt's static preview delegation to `npx serve` with `apps/frontend/scripts/static-preview.mjs`, a tiny Node server that serves `.output/public` without registry access
- Verified `corepack pnpm static:preview` starts the generated static preview at `http://127.0.0.1:3002`
- Added a local Caddy route so the same generated preview is reachable at `http://static.my-website.localhost`
- Reloaded the local Caddy proxy and verified `http://static.my-website.localhost/` returns `200 OK`
- Verified direct `200 OK` responses for:
  - `/`
  - `/writing/`
  - `/writing/test-post/`
  - `/case-studies/block-qa-kitchen-sink-case-study/`
- Confirmed the generated output currently embeds WordPress media URLs, which keeps public media hosting as an explicit upcoming decision rather than an accidental hidden dependency
- Ran focused syntax and lint checks for the new static scripts and Nuxt config

## Static preview browser QA

- Human QA passed for the generated static preview
- Chrome Lighthouse on the static preview reported a performance score of 97
- Static preview felt meaningfully faster than the SSR/dev path
- Known caveat remains: generated pages still reference WordPress media URLs, so media will only load while the local CMS URL is reachable

## Security, provider neutrality, and local CMS planning update

- Added deploy-secret safety requirements before any provider-specific deploy script work
- Added Bunny.net as a first-class static host/media candidate rather than treating Cloudflare as the assumed default
- Added Codeberg Pages as a values-aligned static-hosting candidate to evaluate, with the caveat that it likely does not solve media CDN needs by itself
- Added a local CMS environment split so generated QA fixture content and real publishable content do not share the same long-term source database by accident
- Added a local backup/restore slice for database, uploads, private plugin/license handling, and off-device backup before local WordPress becomes the production content source of truth
- Clarified that the first useful milestone is local static generation and static preview, not necessarily pushing current unfinished content to the public production domain

## Deploy-secret safety foundation

- Added `.env.deploy.example` as the committed static-deploy configuration contract
- Kept real `.env.deploy` values ignored through the existing `.env.*` rule
- Explicitly unignored `.env.deploy.example` so the example file remains tracked
- Added `.deploy/` and `*.deploy.local` ignore rules for future provider CLI or local deploy scratch files
- Documented that deploy scripts must read credentials from environment variables or ignored local env files
- Documented that `package.json` scripts may reference variable names but must never inline token values
- Documented deploy log safety, least-privilege token expectations, and credential rotation/revocation guidance

## Provider and media direction

- Checked current provider docs for Bunny Storage uploads, Bunny pull-zone purge, Cloudflare Pages Direct Upload, and Codeberg Pages
- Chose Bunny.net as the first provider to prototype for static output and public media delivery
- Kept Cloudflare Pages as a practical fallback for static frontend delivery
- Kept Codeberg Pages as a values-aligned static hosting candidate, with the caveat that it likely needs a separate media host/CDN for this project
- Clarified that local WordPress media URLs are acceptable for local development but not a finished public static deploy strategy
- Documented that provider-specific behavior should stay in deploy scripts/docs rather than Vue components

## Static deploy plan dry run

- Added `apps/frontend/scripts/static-deploy-plan.mjs`
- Added `corepack pnpm static:deploy:plan`
- The dry-run plan reads `.env.deploy` if present, with shell env values taking precedence
- The plan summarizes generated static output file count, total size, largest extension groups, and provider target shape
- The plan masks credential presence instead of printing secret values
- The plan detects generated text files that still reference local CMS/media URLs
- No files are uploaded by the dry-run plan command
