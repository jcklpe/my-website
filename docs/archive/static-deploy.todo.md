# Background

Archived spike to-do. This file preserves implementation history and context; do not treat it as the active checklist. The active operator checklist is `docs/static-publish-runbook.md`, and production-domain planning is parked in `docs/scratch/production-deploy.md`.

The prefetching spike made client navigation feel much faster, but its final QA showed that the remaining performance questions are mostly production-delivery questions: dev-mode Vite noise, image/media payloads, WordPress cache-hit overhead, compression, cache headers, and whether the public frontend should depend on live SSR/GraphQL at all.

This spike explores moving the public site toward static generation and CDN/static hosting while keeping WordPress as the authoring tool and preserving the current local development loop.

The conceptual framing is archived alongside this file at `docs/archive/static-deploy.md`.

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
- local Caddy exposes public frontend at `http://my-website.localhost`
- local Caddy exposes QA frontend at `http://qa.my-website.localhost`
- local Caddy exposes public CMS at `http://cms.my-website.localhost`
- local Caddy exposes QA CMS at `http://qa.cms.my-website.localhost`
- local Caddy exposes generated static preview at `http://static.my-website.localhost` when `corepack pnpm start:static:preview` is running
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
- `corepack pnpm start:static:preview`
- `corepack pnpm generate:static:public`
- `corepack pnpm generate:static:qa`
- `corepack pnpm start:cms:public`
- `corepack pnpm start:cms:qa`
- `corepack pnpm backup:cms:public`
- `corepack pnpm list:backups:cms:public`
- `corepack pnpm restore:cms:public`
- `corepack pnpm restore:cms:qa`

The repo now has root static route-discovery, generation, preview, deploy-plan, and Bunny upload scripts. There is not yet a production Lighthouse script or a mature image-optimization pipeline.

The repo now has a first-pass local split between a public CMS and a QA fixture CMS. The same WordPress source code, plugins, and theme are reused, but the QA CMS has its own database/core/uploads volumes and direct port `8081`. QA seed scripts now target the QA CMS by default.

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
- featured media and block media point at WordPress media URLs during normal local dev; static deploy rewrites generated public output to CDN media URLs

Current performance context:

- prefetching and short-lived WPGraphQL response caching are implemented and archived
- repeated public GraphQL requests can return `X-My-Website-GraphQL-Cache: HIT`
- dev-mode Lighthouse is noisy and not a production baseline
- static deploy work should start with production/static measurement before making large architecture changes
- retired static-deploy spike docs live at `docs/archive/static-deploy.md` and `docs/archive/static-deploy.todo.md`
- the durable manual publish checklist lives at `docs/static-publish-runbook.md`
- `apps/frontend/scripts/static-routes.mjs` discovers fixed public routes plus published WordPress post/case-study routes
- `apps/frontend/nuxt.config.ts` uses discovered routes for prerendering only when `NUXT_STATIC_GENERATE=1`
- static generation uses repo-root `.nuxt-static/frontend` so it does not overwrite the normal dev server `.nuxt` cache or churn the dev app watcher
- `corepack pnpm --dir apps/frontend static:generate` successfully generated static output from the local WordPress source
- `corepack pnpm start:static:preview` uses a small repo-owned Node server for `apps/frontend/.output/public`, avoiding `npx serve` and any registry access during preview
- direct static preview URL: `http://127.0.0.1:3002`
- Caddy static preview URL: `http://static.my-website.localhost`
- direct URL smoke tests against the static preview returned `200 OK` for Home, Writing, a writing detail page, and a case-study detail page
- Bunny deploy uploads generated static output plus referenced media to the preview pull zone
- generated HTML and Nuxt payload files are rewritten during Bunny deploy so public output does not point media at `cms.my-website.localhost`
- static preview browser QA passed locally and Lighthouse reported a static-preview performance score of 97
- Bunny.net is the first provider to prototype for static output and public media delivery
- Cloudflare Pages remains a practical static-deploy fallback; Codeberg Pages remains values-aligned but probably needs a separate media host
- `corepack pnpm inspect:static` now summarizes the generated output, flags lingering local runtime URLs, and produces a dry-run media sync/rewrite plan without uploading anything
- the media dry-run maps generated `/wp-content/uploads/...` references to local upload files and future CDN URLs automatically; it is not a manual per-image mapping workflow
- the current generated output references about 20 unique WordPress upload URLs before deploy rewriting; all resolve to local files, for about 18.97 MiB of referenced media
- static generation now keeps the WordPress GraphQL endpoint server-only, leaves the public GraphQL runtime value empty, and marks generated output with `staticGenerated: true`
- the writing archive now fetches all posts at static-build time and avoids public client-side GraphQL pagination in generated output
- `corepack pnpm inspect:static` warns when the output it is inspecting looks like a normal SSR build instead of static publish output
- the static GraphQL cleanup has been verified through `corepack pnpm static:generate` and `corepack pnpm inspect:static`
- the Bunny deploy command now purges the pull-zone cache after successful upload when `BUNNY_PURGE_API_KEY` and `BUNNY_PULL_ZONE_ID` are configured
- the remaining static-deploy focus is final manual runbook QA; production-domain launch, image compression, off-device backups, and provider-neutral deploy abstraction are deferred

# To Do

## Deferred: Production domain and launch

- Custom domain setup for `aslanfrench.work`
- DNS, HTTPS, redirects, canonical URLs, robots, sitemap, Open Graph defaults, and production cache/header policy
- Production Bunny zones or other provider-specific production targets
- Final launch checklist and rollback expectations

Tracking home: `docs/scratch/production-deploy.md`.

## Deferred: Image compression and transformed formats

- WordPress-native responsive image metadata is now wired in
- Bespoke compression, WebP/AVIF conversion, image CDN transforms, or a WordPress media optimization plugin are deferred until real content and production baselines justify them

## Deferred: Off-device backups

- Local public CMS backups now exist and restore into QA has been smoke-tested
- Off-laptop backup storage is still needed before the local CMS becomes the only copy of real authored content
- Candidate future targets include an encrypted cloud folder, external drive rotation, or future homelab sync

## Deferred: Provider-neutral deploy abstraction

- Bunny is the working prototype provider
- Cloudflare Pages, Codeberg Pages plus separate media hosting, or Vultr/Caddy remain possible later
- Do not abstract provider behavior until there is a second real provider implementation to compare against

# Historical Implementation Plan

This section preserves the earlier slice plan for future agents and for the eventual archive. It is not the current active checklist.

Many items below are now done, partially superseded, or deliberately deferred. Keep the rough edges here because they explain why the spike moved the way it did. For current work, use `# To Do`, `# Ready for human QA`, and the durable runbook in `docs/static-publish-runbook.md`.

## Original Slice 2: Establish production and static baselines

Intent: separate real production/static concerns from local Vite dev-server noise before over-optimizing.

Tasks:

- Add or document the command for a production SSR baseline:
  - `corepack pnpm build`
  - `corepack pnpm preview`
- Run Lighthouse against the production preview in a clean browser profile or incognito window with extensions disabled.
- Add or document the command for static generation:
  - expected Nuxt route: `nuxi generate` / `nuxt generate`
  - repo-facing command should stay behind `corepack pnpm`
- Run Lighthouse against generated/static preview output.
- Record the baseline difference between:
  - dev server
  - production SSR preview
  - generated static output
- Do not optimize around `@vite/client`, Nuxt devtools, Vite checker, or extension noise.

Acceptance:

- There is a known command for production SSR measurement.
- There is a known command for generated static measurement.
- Static-deploy docs record which Lighthouse issues are real versus dev-mode artifacts.

Current status:

- Static preview was created and Lighthouse reached 97 locally.
- Bunny preview has been measured for headers and basic cache behavior.
- A formal production-domain Lighthouse baseline is deferred to production-launch work.

## Original Slice 3: Separate public CMS from QA CMS

Intent: keep generated fixtures, Kitchen Sink content, and throwaway media from becoming the accidental source of public authored content.

Earlier wording used "content CMS" and "dev CMS." The current vocabulary is:

- public CMS: real publishable content
- QA CMS: fixtures, seeded test posts, generated media, and risky experiments

Tasks:

- Decide the local environment split:
  - public CMS for real content
  - QA CMS for generated fixture/test content
- Evaluate whether to use:
  - separate Docker Compose project names
  - separate database volumes
  - separate uploads directories
  - separate local hostnames
- Add helper commands for:
  - starting public CMS
  - starting QA CMS
  - seeding QA content
  - backing up public CMS
  - restoring public CMS
  - restoring a public backup into QA for smoke testing
- Make static generation source explicit:
  - generate static from public CMS
  - generate static from QA CMS only when intentionally testing fixture output
- Update docs and local URL tables.

Acceptance:

- Public and QA CMS roles are named in docs and commands.
- QA fixture seeding targets QA by default.
- Static generation makes the source CMS obvious.
- It is hard to accidentally publish QA fixture content as the public site.

Current status:

- Implemented as `cms.my-website.localhost` and `qa.cms.my-website.localhost`.
- Frontend hostnames are `my-website.localhost` and `qa.my-website.localhost`.
- Action-first commands now use `public` and `qa`.

## Original Slice 4: Local backup and restore baseline

Intent: static public delivery lowers public runtime risk, but it makes the local WordPress database and uploads more obviously the source of truth.

Tasks:

- Add a backup command that exports:
  - public CMS database
  - uploads
  - enough metadata to identify the backup
- Add a list command for local backups.
- Add restore commands:
  - restore public CMS from a backup
  - restore a public backup into QA first for smoke testing
- Keep backups out of Git.
- Add retention so local backup folders do not grow forever.
- Document an off-device backup need without blocking the first local workflow.

Acceptance:

- Public CMS backup can be created from one command.
- Backup output is ignored by Git.
- Restore into QA has been smoke-tested.
- Restore into public is guarded because it is destructive.

Current status:

- Implemented with `.backups/`, manifest checksums, retention, and QA restore smoke test.
- Off-device backup is deferred.

## Original Slice 5: Static route discovery and prerender compatibility

Intent: make static generation deliberate rather than dependent on whichever links a crawler happens to find.

Tasks:

- Query WordPress for all published writing post slugs.
- Query WordPress for all published case-study slugs.
- Include fixed routes:
  - `/`
  - `/about`
  - `/side-projects`
  - `/writing`
- Feed fixed and discovered dynamic routes into Nuxt prerendering only for static generation.
- Keep normal dev/build/SSR paths from failing just because WordPress route discovery is unavailable.
- Fail static generation loudly when static route discovery cannot reach WordPress.

Acceptance:

- `corepack pnpm static:routes` prints the fixed and WordPress-discovered route list.
- `corepack pnpm generate:static:public` prerenders all public fixed and dynamic routes.
- `corepack pnpm generate:static:qa` can prerender QA fixture routes.

Current status:

- Implemented through `apps/frontend/scripts/static-routes.mjs` and Nuxt static-generation config.

## Original Slice 6: Static runtime cleanup

Intent: generated public pages should not quietly depend on a running local CMS after deployment.

Tasks:

- Inspect generated HTML and payload files for:
  - `cms.my-website.localhost`
  - `qa.cms.my-website.localhost`
  - `127.0.0.1:8080`
  - `127.0.0.1:8081`
  - `/graphql`
- Keep WordPress GraphQL endpoint server-only during static generation.
- Avoid serializing local GraphQL URLs into generated client payloads.
- Make writing archive pagination static-friendly.
- Add an inspect command that reports local runtime references.

Acceptance:

- Generated output contains no local GraphQL/API runtime references.
- Static pages do not need WordPress GraphQL for normal public reading.
- `inspect:static` catches regressions.

Current status:

- Implemented. `inspect:static` separates media references from non-media local runtime references.

## Original Slice 7: Public media strategy and automated media mapping

Intent: static pages cannot point phones and public visitors at `cms.my-website.localhost/wp-content/uploads/...`.

Tasks:

- Decide first-pass public media host.
- Keep provider-specific details out of Vue components.
- Make deploy tooling discover generated WordPress upload references automatically.
- Map each generated media URL to:
  - local upload file
  - storage destination path
  - public CDN URL
  - generated files that reference it
- Fail before upload when a referenced local file is missing.
- Rewrite generated HTML and Nuxt payload references during deploy.
- Handle both normal URLs and Nuxt escaped payload URLs such as `http:\u002F\u002F...`.

Acceptance:

- No manual image spreadsheet is required.
- Deploy dry-run reports the media plan before upload.
- Real deploy uploads referenced media and rewrites generated output.
- Phone/CDN preview can load images without local network access.

Current status:

- Implemented for Bunny preview deploy. Other agents debugged final media/CDN cache behavior and Bunny preview is now working in incognito and on phone.

## Original Slice 8: WordPress-native responsive image pass

Intent: prefer WordPress's existing image sizes and metadata before inventing a custom image pipeline.

Tasks:

- Query WPGraphQL featured-image metadata:
  - `srcSet`
  - `sizes`
  - dimensions
  - generated image size records
- Render `srcset`, `sizes`, `width`, and `height` in frontend image components.
- Use context-appropriate `sizes` values for:
  - detail hero media
  - post cards
  - case-study cards
  - loop navigation cards
- Warm featured-media prefetch using `srcset` where useful.
- Preserve WordPress-rendered child image `srcset`/`sizes` in gallery-like blocks where the HTML already contains them.

Acceptance:

- Featured images no longer point only at full original upload URLs.
- Generated static output includes responsive image metadata.
- Media sync/deploy includes the WordPress-generated derivative files referenced by the generated pages.

Current status:

- Implemented. Further WebP/AVIF/compression work is deferred.

## Original Slice 9: Bunny preview deploy prototype

Intent: prove that command-driven CDN preview deploy can work before touching the real production domain.

Tasks:

- Add `.env.deploy.example`.
- Keep `.env.deploy` ignored.
- Add dry-run deploy behavior by default.
- Require `STATIC_DEPLOY_DRY_RUN=0` for real upload.
- Upload generated static files to Bunny Storage.
- Upload referenced media files under the configured media prefix.
- Derive media base from Bunny pull-zone URL when explicit media base is blank or a placeholder.
- Add content-type headers for common static assets.
- Mask credential values in output.
- Reject normal SSR build output in real upload mode.
- Purge the pull zone after upload when purge credentials are configured.

Acceptance:

- Dry-run shows target shape and sample uploads.
- Real preview upload succeeds.
- Bunny preview serves HTML, JS/CSS, payloads, and media.
- Cache purge is automatic when configured.

Current status:

- Implemented and QAed against `https://my-website-preview.b-cdn.net`.

## Original Slice 10: Compression, cache headers, and deployed-preview measurement

Intent: measure the deployed static output, not the dev server.

Tasks:

- Check deployed response headers for:
  - HTML
  - hashed JS
  - CSS
  - media
- Confirm compression for text assets.
- Confirm CDN cache hits on warmed requests.
- Record whether HTML, payloads, assets, and media share a cache policy.
- Decide whether preview behavior is acceptable even if production needs a more deliberate HTML/payload policy.

Acceptance:

- Bunny preview serves compressed text assets.
- Warmed requests can return CDN cache hits.
- Production-domain cache policy concerns are parked in production-launch planning rather than forgotten.

Current status:

- Implemented for preview. Production HTML/payload cache policy is deferred.

## Original Slice 11: Font, metadata, accessibility, and SEO follow-up

Intent: keep Lighthouse findings grounded in real deployed output.

Tasks:

- Verify `<html lang="en">`.
- Fix generic link text when it appears in deployed output.
- Verify static output has page titles and descriptions.
- Verify Open Graph and canonical decisions before production launch.
- Review Google Fonts loading only if it remains a real production critical-path issue.
- Avoid optimizing dev-only Vite artifacts.

Acceptance:

- Real deployed-output warnings are captured.
- Production metadata/security work moves to production-deploy planning if it is not needed for preview.

Current status:

- Mostly deferred to production-launch/production-deploy work.

## Original Slice 12: Operational runbook and safety check

Intent: make the deploy path boring, repeatable, and hard to misuse.

Tasks:

- Document the manual publish loop.
- Keep the operator checklist outside volatile chat context.
- Make the commands action-first and memorable.
- Document the difference between public CMS, QA CMS, static local preview, and CDN preview.
- Explain which commands upload and which commands only inspect.
- Document the `.env.deploy` secret pattern.
- Add final QA checklist for local static preview and CDN preview.

Acceptance:

- A future agent or the user can publish to preview without needing this conversation.
- The durable runbook survives after the spike docs are archived.

Current status:

- Implemented as `docs/static-publish-runbook.md`.

## Original Slice 13: Decide whether static deploy becomes canonical

Intent: do not delete the SSR/VPS path just because the static path looks promising.

Tasks:

- Compare:
  - local dev experience
  - generated static preview
  - Bunny preview
  - current SSR/VPS fallback model
- Decide whether static CDN delivery should become the public default.
- Keep public production-domain launch in a separate production-deploy spike.
- Preserve SSR/Docker Compose production path as a fallback until the static path is proven with real content.

Acceptance:

- Static deploy direction is documented.
- Deferred launch work has a home.
- No irreversible production hosting decision is hidden inside this spike.

Current status:

- Static generation plus Bunny preview is the current public-delivery direction.
- Real domain launch is parked in `docs/scratch/production-deploy.md`.

# Ready for human QA

## Final manual publish runbook QA

Use `docs/static-publish-runbook.md` as the checklist:

- start the public CMS
- start the frontend
- generate static output from the public CMS
- preview the generated static output locally
- run `corepack pnpm inspect:static`
- deploy to the Bunny preview target if desired
- hard-refresh Home, Writing, one writing detail page, and one case-study detail page on the Bunny preview
- check the same preview on a phone

Expected result: the documented runbook should be usable without needing hidden context from this conversation.

## Optional production-like measurement QA

- Run Lighthouse against the Bunny preview after one warm load
- Record the score and obvious remaining warnings only if they point to real deployed output, not Vite/dev-server artifacts
- Treat custom-domain, SEO metadata, security headers, and image compression as follow-up production-deploy work unless they block the preview site from functioning

# Done

## Initial static-deploy spike docs

- Filled out `docs/static-deploy.md` with the conceptual model, SSR/static distinction, local-development boundaries, route inventory, media-hosting concern, manual publish direction, Vultr relationship, and desired end state
- Filled out `docs/static-deploy.todo.md` with concrete slices for baselining, static generation, route discovery, static compatibility, media strategy, image optimization, deploy commands, cache headers, metadata, security, backups, and canonical-hosting decisions
- Updated `to-do.md` so static deployment is represented as the next production-performance planning thread while keeping the existing SSR/Vultr path as a fallback

## Local static generation foundation

- Added `apps/frontend/scripts/static-routes.mjs` to discover fixed routes plus published post and case-study slugs from WordPress GraphQL
- Added `corepack pnpm static:routes` for inspecting the route list used by static generation
- Added `corepack pnpm static:generate` for editor-CSS generation plus Nuxt static generation
- Added `corepack pnpm start:static:preview` for local generated-output preview on port 3002
- Wired `apps/frontend/nuxt.config.ts` to prerender discovered routes only when `NUXT_STATIC_GENERATE=1`, so normal dev/build/SSR paths do not depend on route discovery
- Verified `corepack pnpm static:routes` against the local CMS; it discovered 56 public routes
- Verified `corepack pnpm --dir apps/frontend static:generate`; Nitro prerendered 114 HTML/payload routes and generated `.output/public`

## Static preview smoke test

- Replaced Nuxt's static preview delegation to `npx serve` with `apps/frontend/scripts/static-preview.mjs`, a tiny Node server that serves `.output/public` without registry access
- Verified `corepack pnpm start:static:preview` starts the generated static preview at `http://127.0.0.1:3002`
- Added a local Caddy route so the same generated preview is reachable at `http://static.my-website.localhost`
- Reloaded the local Caddy proxy and verified `http://static.my-website.localhost/` returns `200 OK`
- Verified direct `200 OK` responses for:
  - `/`
  - `/writing/`
  - `/writing/test-post/`
  - `/case-studies/block-qa-kitchen-sink-case-study/`
- Confirmed the first generated output embedded WordPress media URLs, which made public media hosting an explicit upcoming decision rather than an accidental hidden dependency
- Ran focused syntax and lint checks for the new static scripts and Nuxt config

## Static preview browser QA

- Human QA passed for the generated static preview
- Chrome Lighthouse on the static preview reported a performance score of 97
- Static preview felt meaningfully faster than the SSR/dev path
- Original caveat: generated pages referenced WordPress media URLs, so media only loaded while the local CMS URL was reachable. Bunny media upload/rewrite now addresses this for the CDN preview path.

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
- Added `corepack pnpm inspect:static`
- The dry-run plan reads `.env.deploy` if present, with shell env values taking precedence
- The plan summarizes generated static output file count, total size, largest extension groups, and provider target shape
- The plan masks credential presence instead of printing secret values
- The plan detects generated text files that still reference local CMS/media URLs
- No files are uploaded by the dry-run plan command

## Media reference audit dry run

- Extended `corepack pnpm inspect:static` so media planning is automated rather than manually mapped image by image
- Added deploy configuration knobs for:
  - `STATIC_MEDIA_LOCAL_ROOT`
  - `STATIC_MEDIA_BASE_URL`
  - `STATIC_MEDIA_STORAGE_PREFIX`
- The dry-run plan now separates WordPress upload references from non-media local runtime references such as GraphQL URLs
- The media plan maps each generated CMS upload URL to:
  - the corresponding local upload file
  - the future storage path
  - the future public CDN URL
  - the generated files that reference it
- The dry-run plan reports missing local media files before any upload command exists
- No files are uploaded by this step; it only proves the mapping and audit mechanics
- Verified the initial generated output reported 17 unique upload URLs, 17 local files found, 0 local files missing, and about 16.69 MiB of referenced media
- Updated URL detection to include Nuxt payload JSON escaped as `http:\u002F\u002F...`; this raised the current pre-rewrite media audit to 20 unique upload URLs, all found locally, for about 18.97 MiB of referenced media
- Verified the plan can show concrete public URL mappings when `STATIC_MEDIA_BASE_URL` is provided

## Static runtime GraphQL cleanup source pass

- Moved the WordPress GraphQL endpoint into private runtime config during static generation
- Left `public.wordpressGraphqlUrl` empty when `NUXT_STATIC_GENERATE=1` so generated pages do not serialize the local CMS API endpoint by default
- Added `public.staticGenerated` so client code can distinguish generated static output from normal SSR/dev output
- Updated WordPress fetching to use the private endpoint on the server and public endpoint only on the client
- Updated the writing archive to fetch all posts at build time for static output, then avoid client-side GraphQL pagination after deployment
- Updated `corepack pnpm inspect:static` to warn when it is inspecting normal SSR build output rather than static generated output
- Verified lint, typecheck, and normal production build for the source changes
- Verified `corepack pnpm static:generate` and `corepack pnpm inspect:static` against the local Docker CMS

## Bunny deploy command scaffold

- Added `apps/frontend/scripts/static-deploy-bunny.mjs`
- Added `corepack pnpm deploy:static:bunny`
- Kept Bunny deploys in dry-run mode by default through `STATIC_DEPLOY_DRY_RUN=1`
- Made real upload mode require `STATIC_DEPLOY_DRY_RUN=0`, `BUNNY_STORAGE_ZONE`, and `BUNNY_STORAGE_ACCESS_KEY`
- Added static-output marker checks so real upload mode rejects normal SSR build output
- Preserved generated relative paths when calculating Bunny Storage upload targets
- Added basic content-type headers for common generated static asset types
- Kept Bunny credentials masked in command output
- Documented the minimum Bunny values needed for the prototype

## Bunny media upload/rewrite scaffold

- Extended `corepack pnpm deploy:static:bunny` to discover generated WordPress upload references
- The Bunny deploy script now maps each generated media URL to the matching local WordPress upload file
- The deploy script derives the public media URL from `BUNNY_PULL_ZONE_URL` and `STATIC_MEDIA_STORAGE_PREFIX` when `STATIC_MEDIA_BASE_URL` is blank or still an example placeholder
- Real upload mode now rewrites generated HTML/payload media URLs before uploading static files
- Real upload mode uploads referenced media files to Bunny Storage under the configured media prefix
- Real upload mode fails before upload if referenced media files are missing or the public media base cannot be determined
- Dry-run mode reports media upload targets without mutating generated output or uploading files
- Updated media detection/rewrite to handle both normal generated URLs and Nuxt payload JSON escaped URLs
- Ran a real Bunny preview upload: 20 referenced media files uploaded, 106 generated files rewritten, and 513 static files uploaded
- Verified `corepack pnpm inspect:static` after upload reports `Unique CMS upload URLs: 0`
- Verified a representative CDN media URL returns `HTTP 200`

## Bunny cache purge integration

- Another agent added Bunny pull-zone purge to `corepack pnpm deploy:static:bunny`
- The deploy command purges after successful upload when both `BUNNY_PURGE_API_KEY` and `BUNNY_PULL_ZONE_ID` are configured
- If either value is missing, upload still succeeds and the command prints that purge was skipped
- `.env.deploy.example` documents that the purge key is different from the storage access key
- The purge integration keeps cache invalidation inside the normal deploy flow rather than making dashboard purge a required manual step

## Static deploy safety audit and runbook

- Confirmed `.env.deploy` is ignored by the repo's `.env.*` rule
- Confirmed `.env.deploy.example` is explicitly unignored and contains empty/example values only
- Confirmed the accidental `.env.deploy copy.example` filename is ignored because only `.env.deploy.example` is unignored
- Confirmed `.deploy/`, `*.deploy.local`, generated Nuxt/Nitro output, and WordPress uploads are ignored
- Confirmed root and frontend `package.json` deploy scripts do not inline deploy credentials
- Confirmed deploy-plan output masks credential presence instead of printing values
- Added the current secret-safety audit result to `docs/static-deploy.md`
- Added the first manual static publish runbook to `docs/static-deploy.md`, covering CMS startup, dev preview, static generation, local static preview, deploy plan, Bunny deploy, and CDN preview QA

## CMS split planning pass

- Added the target CMS split to `docs/static-deploy.md`
- Defined the QA CMS as the home for generated fixture content, Kitchen Sink block tests, throwaway media, and risky experiments
- Defined the public CMS as the home for real posts, case studies, homepage fields, footer settings, and publishable media
- Documented separate CMS roles, with separate database/uploads volumes as the first implementation path
- Captured possible future helper commands for QA/public CMS startup, seeding, backup/restore, and explicit static generation from either source
- Kept the split as a pre-production requirement rather than a blocker for CDN preview testing

## Local CMS split first implementation

- Added `docker/compose.cms-dev.yaml` with a separate `cms_dev` WordPress service, `db_dev` MariaDB service, and separate QA database/core/uploads volumes
- Added Caddy local hostnames:
  - `http://cms.my-website.localhost` for the public CMS
  - `http://qa.cms.my-website.localhost` for the QA CMS
  - `http://my-website.localhost` for the public frontend
  - `http://qa.my-website.localhost` for the QA frontend
  - `http://static.my-website.localhost` for generated static preview
- Added root scripts for `docker:up:all`, `docker:down:all`, `start:cms:public`, and `start:cms:qa`
- Pointed the QA seed aliases at the QA CMS by default
- Added explicit static generation commands:
  - `corepack pnpm generate:static:public`
  - `corepack pnpm generate:static:qa`
- Updated Nuxt runtime config so normal SSR/dev mode chooses the QA CMS when the request host is `qa.my-website.localhost`
- Updated static route discovery and static generation so `NUXT_STATIC_CMS_ENV=qa` uses the QA CMS GraphQL endpoint and public/default generation uses the public CMS GraphQL endpoint
- Updated README and static-deploy docs with the new command and hostname map

## Action-first command naming pass

- Standardized the documented commands around action-first names:
  - `corepack pnpm start:frontend`
  - `corepack pnpm start:cms:public`
  - `corepack pnpm start:cms:qa`
  - `corepack pnpm start:static:preview`
  - `corepack pnpm backup:cms:public`
  - `corepack pnpm list:backups:cms:public`
  - `corepack pnpm restore:cms:public`
  - `corepack pnpm restore:cms:qa`
  - `corepack pnpm seed:cms:qa`
  - `corepack pnpm seed:cms:qa:more`
  - `corepack pnpm generate:static:public`
  - `corepack pnpm generate:static:qa`
  - `corepack pnpm inspect:static`
  - `corepack pnpm deploy:static:bunny`
- Standardized user-facing fixture/test language on QA instead of Dev to avoid confusing the QA CMS with ordinary local development mode
- Added QA environment variable names while preserving the old dev-oriented names as compatibility fallbacks
- Kept the old `cms:content:*`, `cms:dev:*`, `static:generate:content`, and `static:generate:dev` aliases so older notes and muscle memory do not break immediately
- Left the underlying `cms_dev`/`db_dev` service names and `docker/compose.cms-dev.yaml` filename in place for now to avoid a risky Docker volume/service migration during a command-naming pass

## Public CMS backup/restore first implementation

- Added `.backups/` to `.gitignore` for local database/media backup output
- Added `scripts/cms-backup.mjs`
- Added `scripts/cms-backup-list.mjs`
- Added `scripts/cms-restore.mjs`
- Added `corepack pnpm backup:cms:public`
- Added `corepack pnpm list:backups:cms:public`
- Added `corepack pnpm restore:cms:public -- .backups/cms/content/<timestamp> --yes`
- Added `corepack pnpm restore:cms:qa -- .backups/cms/content/<timestamp> --yes` for disposable restore testing
- The backup script exports the public CMS database through the CMS container and archives `apps/cms/wp-content/uploads`
- The backup script writes timestamped output under `.backups/cms/content/<timestamp>/`
- Each backup directory contains `database.sql`, `uploads.tar.gz`, and `manifest.json`
- The restore script requires `--yes` or the matching `CMS_RESTORE_CONFIRM` value because it imports a database dump and replaces uploads
- Before replacing uploads, restore moves the previous uploads directory into `.backups/restore-safety/`
- Updated README, AGENTS, and `docs/static-deploy.md` with the backup command shape and restore warning

## Public CMS backup hardening

- Backup manifests now include `schemaVersion`, byte sizes, SHA-256 hashes, and retention metadata
- Restore validates manifest sizes and hashes before importing when checksum metadata is present
- Backup and restore database commands now split Docker-style `WORDPRESS_DB_HOST` values like `db:3306` into separate host/port arguments before calling `mysqldump` or `mysql`
- Backup writes into a temporary workspace first and only promotes it to `.backups/cms/content/<timestamp>/` after the database dump, uploads archive, and manifest all exist
- QA restore imports public CMS backups into the QA CMS, normalizes restored WordPress URLs to `qa.cms.my-website.localhost`, and replaces the QA uploads volume
- `corepack pnpm backup:cms:public` now keeps the latest 5 local public CMS backups by default
- Backup retention can be changed with `CMS_BACKUP_KEEP=<number>` or `--keep=<number>`
- Backup pruning can be skipped for one run with `--no-prune`
- `corepack pnpm list:backups:cms:public` lists local public CMS backups, sizes, retention status, and checksum presence; older manifestless failed attempts are marked `incomplete` and ignored by the retention count
- Updated README, AGENTS, `docs/static-deploy.md`, and this to-do doc with the retention/list behavior

## Public CMS restore smoke test

- Started the public CMS plus QA CMS with `corepack pnpm start:cms:qa`
- Restored `.backups/cms/content/2026-05-13T160415Z` into the disposable QA CMS with `corepack pnpm restore:cms:qa -- .backups/cms/content/2026-05-13T160415Z --yes`
- Restore validated the backup manifest before importing
- Restore imported the database into `cms_dev`
- Restore updated `home` and `siteurl` to `http://qa.cms.my-website.localhost`
- Restore replaced public-CMS URLs in restored QA content with QA-CMS URLs; the smoke test made 137 replacements
- Restore replaced the QA uploads volume from the backup archive
- Verified `http://qa.cms.my-website.localhost` returned `200 OK`
- Verified `http://qa.my-website.localhost` returned `200 OK`
- Verified QA CMS `home` and `siteurl` options point at `http://qa.cms.my-website.localhost`
- Verified the restored QA CMS has 52 published posts/case studies

Known caveat: the uploads restore printed Docker/macOS extended-attribute warnings from tar. The restore still exited successfully. If the warnings become distracting, the archive step can be adjusted to omit those attributes.

## WordPress-native responsive image pass

- Confirmed WPGraphQL exposes `srcSet`, `sizes`, and generated `mediaDetails.sizes` for featured images
- Extended the frontend `FeaturedImage` type to include WordPress responsive image metadata
- Updated the featured-image GraphQL fragment to request `srcSet`, `sizes`, and generated image size records
- Updated `FeaturedMediaFrame` to render `srcset`, `sizes`, `width`, and `height`
- Updated featured media call sites with context-appropriate `sizes` values:
  - detail-page heroes use `100vw`
  - post cards use a card-sized viewport expression
  - case-study cards use a larger card viewport expression
  - case-study loop nav media uses a two-column expression
- Updated featured-media warming so prefetch can use the WordPress `srcset` instead of warming only the original upload URL
- Updated Mega Gallery thumbnails to preserve child image `srcset`/`sizes` from WordPress-rendered image block HTML
- Verified `corepack pnpm generate:static:public` still generates static output with the responsive image fields present
- Verified `corepack pnpm inspect:static` now detects WordPress-generated image sizes in the media sync plan; the current plan found 66 CMS media URLs and 0 missing local files

## Bunny responsive media deploy validation

- Regenerated static output from the public CMS with `corepack pnpm generate:static:public`
- Confirmed Nuxt prerendered 114 routes
- Confirmed `corepack pnpm inspect:static` reported:
  - `staticGenerated:true`
  - 513 generated static files
  - 66 unique CMS media URLs
  - 66 local media files found
  - 0 local media files missing
  - no non-media local CMS/API references
- Ran the Bunny preview upload in real upload mode
- Uploaded 66 referenced media files, including WordPress-generated responsive image sizes
- Rewrote media URLs in 106 generated files
- Uploaded 513 generated static files
- Purged the Bunny pull-zone cache after upload
- Verified the Bunny preview returned `HTTP 200` for:
  - Home
  - the Kitchen Sink writing detail page
  - a representative generated WordPress image size
- Verified warmed second requests returned `cdn-cache: HIT`
- Verified fetched preview HTML contained responsive image `srcset` output and Bunny media URLs
- Verified fetched preview HTML contained 0 `cms.my-website.localhost` or `127.0.0.1:8080` references

## Local WordPress upload limit pass

- Added `apps/cms/config/uploads.ini`
- Set local PHP upload limits to:
  - `upload_max_filesize = 64M`
  - `post_max_size = 64M`
  - `memory_limit = 256M`
  - `max_file_uploads = 50`
- Copied the upload config into the WordPress Docker image as `/usr/local/etc/php/conf.d/project-uploads.ini`
- Updated README with the local upload-limit config location
- Rebuilt the public CMS image and verified the running PHP values report `64M`, `64M`, `256M`, and `50`

## Static-deploy closure documentation pass

- Reworked this to-do doc so the active work is now limited to final QA and clearly deferred follow-ups
- Kept `docs/static-deploy.md` as the current conceptual document for the static deploy spike
- Folded durable static-deploy facts into `README.md` and `AGENTS.md`, including:
  - public/QA CMS hostnames
  - action-first command names
  - static generation and Bunny deploy commands
  - static/CDN delivery as the current public-delivery direction, with SSR/VPS still available as a fallback
- Added `docs/scratch/production-deploy.md` as the parking place for custom-domain launch, DNS, production headers, production metadata, rollback, and final launch checklists

## Runbook promotion and historical context restoration

- Promoted the manual static publish checklist into durable `docs/static-publish-runbook.md`
- Replaced the runbook body in `docs/static-deploy.md` with a pointer to the durable runbook so the spike doc can be archived later without burying the operator checklist
- Restored the earlier static-deploy slice plan into `# Historical Implementation Plan` in this to-do doc, so future agents can see the full context without mistaking old slices for active work
- Updated the final QA task to use `docs/static-publish-runbook.md` as the checklist

## Bunny preview response-header check

- Checked the Bunny preview with `curl` using `Accept-Encoding: br,gzip`
- HTML route `https://my-website-preview.b-cdn.net/` returned:
  - `HTTP/2 200`
  - `content-type: text/html`
  - `content-encoding: gzip`
  - `cache-control: public, max-age=2592000`
  - warmed second request: `cdn-cache: HIT`
- Hashed JS asset `/_nuxt/CBf9GaoP.js` returned:
  - `HTTP/2 200`
  - `content-type: application/javascript`
  - `content-encoding: br`
  - `cache-control: public, max-age=2592000`
  - warmed second request: `cdn-cache: HIT`
- CSS asset `/_nuxt/index.BZKyoUqv.css` returned:
  - `HTTP/2 200`
  - `content-type: text/css`
  - `cache-control: public, max-age=2592000`
- Representative media URL `/media/2026/04/ahmetyuksek-mountain-range-9842371-1024x683.jpg` returned:
  - `HTTP/2 200`
  - `content-type: image/jpeg`
  - `cache-control: public, max-age=2592000`
  - warmed second request: `cdn-cache: HIT`

Conclusion: Bunny preview compression and CDN caching are functioning. The one production-policy concern is that HTML currently has the same 30-day cache TTL as assets/media. That is acceptable for preview with purge configured, but production-domain work should decide a more deliberate HTML/payload cache policy before launch.
