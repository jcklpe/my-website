# Background

The prefetching spike made client navigation feel much faster, but its final QA showed that the remaining performance questions are mostly production-delivery questions: dev-mode Vite noise, image/media payloads, WordPress cache-hit overhead, compression, cache headers, and whether the public frontend should depend on live SSR/GraphQL at all.

This spike explores moving the public site toward static generation and CDN/static hosting while keeping WordPress as the authoring tool and preserving the current local development loop.

The conceptual framing is in `docs/scratch/static-deploy.md`.

## Project organization

Add new concrete tasks to `# To Do`. When tasks are implemented, move them either to `# Ready for human QA` or `# Done`.

Keep the conceptual doc focused on direction and tradeoffs. Keep this to-do doc focused on atomic steps, files, commands, verification, and unresolved implementation decisions.

When this spike becomes active, move both static-deploy docs from `docs/scratch/` into `docs/`. When the spike retires, fold durable lessons into `README.md`, `AGENTS.md`, `docs/design-system.md`, deployment docs, or `to-do.md` as appropriate, then archive the spike docs.

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

There is not yet a root static-generation script, static preview script, static deploy script, route-discovery script, media-sync script, or production Lighthouse script.

There is not yet a documented split between a real-content CMS and a dev/QA fixture CMS. The current local CMS can be seeded with generated QA content, which is useful for development but risky as the long-term source of publishable content.

There is not yet a deploy-secret pattern such as `.env.deploy.example`, ignored real deploy env files, provider-specific token scoping, or deploy credential rotation notes.

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
- initial static-deploy spike docs are now drafted in `docs/scratch/`
- the next implementation slice is to establish production-preview and static-generation baselines
- the provider decision is intentionally open; Bunny.net is a serious candidate, Cloudflare is a useful reference target, and Codeberg Pages is interesting but probably does not solve media CDN needs by itself

# To Do

## Slice 1: Activate the static-deploy spike

- Decide when to move the static-deploy docs from `docs/scratch/` into active `docs/`
- Rename `docs/scratch/static-deploy.todo.md` to `docs/static-deploy-to-do.md` if this becomes an active spike, so it matches the newer `*-to-do.md` naming rhythm
- Update any references if the docs move out of `docs/scratch/`

## Slice 2: Establish deploy-secret safety rules

- Audit existing `.gitignore` coverage for:
  - `.env`
  - `.env.*`
  - deploy-token files
  - provider CLI credential files
- Decide whether to add a committed `.env.deploy.example`
- Decide the local ignored file name for real deploy secrets, if any
- Document that deploy scripts must read secrets from environment variables
- Document that `package.json` scripts may reference variable names but must never contain secret values
- Document provider token scope expectations:
  - Bunny storage-zone password/API access should be scoped to the relevant storage zone where possible
  - Cloudflare deploy token should be scoped to the Pages project/account where possible
  - any future CI token should live in CI secrets, not repo files
- Add deploy log guidance: never echo token values or full credential-bearing URLs
- Add a rotation/revocation checklist for whichever provider is chosen

Acceptance:

- The repo has a written deploy-secret convention before any real deploy script is added
- No real provider credentials are committed
- Any future deploy script has a known private configuration path

## Slice 3: Establish production and static baselines

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
- Add a static-generation baseline command once Nuxt generation is wired
- Compare dev-mode, production-preview, static-preview, and deployed-static results

Acceptance:

- The spike has a real baseline that is not polluted by Vite dev mode
- Dev-only warnings are separated from real production issues
- The next optimization slice is chosen from measured production/static output

## Slice 4: Add static generation scripts

- Add a root script for static generation, likely wrapping Nuxt's generate command
- Add a root script for static preview of the generated output
- Confirm the generated output directory and document it
- Keep existing `dev`, `build`, `preview`, and Docker scripts unchanged
- Verify that static generation still runs editor CSS generation if editor CSS changes are part of normal build expectations

Possible script names:

- `static:generate`
- `static:preview`
- `static:deploy`

Acceptance:

- `corepack pnpm static:generate` produces a static frontend output folder
- `corepack pnpm static:preview` serves the generated output locally
- `corepack pnpm dev` remains unchanged and still provides HMR

## Slice 5: Separate real-content CMS from dev/QA CMS

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

## Slice 6: Add local CMS backup and restore workflow

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

## Slice 7: Discover all public routes from WordPress

- Add route-discovery logic for post slugs
- Add route-discovery logic for case-study slugs
- Include fixed routes:
  - `/`
  - `/about`
  - `/side-projects`
  - `/writing`
- Include dynamic routes:
  - `/writing/{slug}`
  - `/case-studies/{slug}`
- Decide whether route discovery lives in:
  - `nuxt.config.ts`
  - a small build-time helper script
  - a generated routes manifest consumed by Nuxt
- Make the route-discovery failure mode loud enough to prevent partial deploys
- Document how draft/private/unpublished WordPress content is excluded

Acceptance:

- Static generation includes all published writing posts
- Static generation includes all published case studies
- A post or case study can be added in WordPress and included in the next static generation without hand-editing a route list
- Missing WordPress/CMS connectivity fails the generation step instead of silently shipping an incomplete site

## Slice 8: Confirm static compatibility of current routes

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

## Slice 9: Decide first-pass public media strategy

Open question: what public URL should generated pages use for WordPress uploads?

Evaluate these options:

1. Keep WordPress public for media during the first static frontend deployment
2. Sync WordPress uploads to public object storage/CDN during publish
3. Download referenced media during build and emit it into the static output
4. Use a media/image service that handles responsive derivatives and modern formats

For each option, document:

- implementation complexity
- effect on local-only WordPress possibility
- cache-header control
- image transformation support
- backup/migration implications
- how URLs are rewritten or generated

Acceptance:

- The project has a chosen first-pass media strategy
- Generated public pages do not point at inaccessible local WordPress media URLs
- The chosen strategy can handle featured images, block images, galleries, Mega Gallery items, audio, video, and file blocks well enough for current content

## Slice 10: Compare static hosting providers

- Compare Bunny.net Storage + Pull Zone
- Compare Cloudflare Pages / Cloudflare static assets
- Compare Codeberg Pages, likely with a separate media host if kept in consideration
- Compare the current Vultr/Caddy path as a control
- For each candidate, document:
  - command-line deploy support
  - preview/staging support
  - custom domain support
  - compression behavior
  - cache-header control
  - media hosting fit
  - image transformation fit
  - cost shape for small portfolio traffic
  - lock-in / consolidation concerns
  - credential model and secret-management implications

Acceptance:

- Provider choice is made deliberately, not by defaulting to the biggest platform
- Bunny.net is evaluated as a first-class candidate
- Codeberg Pages is evaluated honestly for static hosting but not assumed to solve media CDN needs
- The selected first-pass host can be driven from the command line

## Slice 11: Image optimization and responsive media

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

## Slice 12: Static host deployment command

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

## Slice 13: Compression and cache headers

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

## Slice 14: Fonts, SEO, accessibility, and production metadata

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

## Slice 15: Security and operational runbook

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

## Slice 16: Decide whether static deploy becomes canonical

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

# Done

## Initial static-deploy spike docs

- Filled out `docs/scratch/static-deploy.md` with the conceptual model, SSR/static distinction, local-development boundaries, route inventory, media-hosting concern, manual publish direction, Vultr relationship, and desired end state
- Filled out `docs/scratch/static-deploy.todo.md` with concrete slices for baselining, static generation, route discovery, static compatibility, media strategy, image optimization, deploy commands, cache headers, metadata, security, backups, and canonical-hosting decisions
- Updated `to-do.md` so static deployment is represented as the next production-performance planning thread while keeping the existing SSR/Vultr path as a fallback

## Security, provider neutrality, and local CMS planning update

- Added deploy-secret safety requirements before any provider-specific deploy script work
- Added Bunny.net as a first-class static host/media candidate rather than treating Cloudflare as the assumed default
- Added Codeberg Pages as a values-aligned static-hosting candidate to evaluate, with the caveat that it likely does not solve media CDN needs by itself
- Added a local CMS environment split so generated QA fixture content and real publishable content do not share the same long-term source database by accident
- Added a local backup/restore slice for database, uploads, private plugin/license handling, and off-device backup before local WordPress becomes the production content source of truth
- Clarified that the first useful milestone is local static generation and static preview, not necessarily pushing current unfinished content to the public production domain
