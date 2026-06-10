# Static Publish Runbook

This is the durable operator checklist for publishing the generated static site.

The archived static-deploy spike docs explain the reasoning and implementation history. This file is the practical "what do I run?" reference that stays active after the spike is retired.

## Purpose

The public site can be generated from local WordPress content and deployed as static files.

The normal loop is intentionally explicit:

1. edit content locally in WordPress
2. preview through the normal Nuxt dev server
3. generate static output
4. preview the generated files locally
5. inspect the deploy plan
6. deploy to the CDN preview target when ready
7. QA the deployed preview

This keeps local development fast while making public delivery independent from a live Nuxt SSR server and live WordPress GraphQL requests.

## Local Roles

- Public CMS: `http://cms.my-website.localhost`
- QA CMS: `http://qa.cms.my-website.localhost`
- Public frontend: `http://my-website.localhost`
- QA frontend: `http://qa.my-website.localhost`
- Static local preview: `http://static.my-website.localhost`
- Static local preview direct URL: `http://127.0.0.1:3002`
- Bunny preview CDN: `https://my-website-preview.b-cdn.net`

Use the public CMS for real publishable content. Use the QA CMS for Kitchen Sink content, seeded test posts, generated media, and risky experiments.

## Safety Rules

- Commit `.env.deploy.example`, not `.env.deploy`.
- Keep real Bunny storage and purge credentials in `.env.deploy` or shell environment variables.
- Do not put secret values in `package.json` scripts.
- Run `corepack pnpm inspect:static` before deploying.
- Real Bunny uploads require `STATIC_DEPLOY_DRY_RUN=0`.
- `corepack pnpm deploy:static:bunny` rejects output that does not look like static generation output.
- Media upload and rewrite is automatic. Do not manually map every image.
- Do not point the real production domain at a preview deploy until the production-launch work says to.
- Do not publish QA CMS content to a public production target.

## Licensed Local Fonts

Some design branches load licensed display fonts (for example `Edwardian-Script-ITC.woff2` and `Bodoni-Z37.woff2`) through `@font-face` rules in `packages/styles/_type-fonts.scss`. Those rules reference the files at `/fonts/...`, which Nuxt serves from `apps/frontend/public/fonts/`.

The font files are intentionally kept out of Git. `apps/frontend/public/fonts/` is gitignored, and the source copies live in `docker/private-plugins/` (also ignored). This keeps licensed binaries out of the repo, the same way `docker/private-plugins/` holds the ACF Pro zip.

Consequence for fresh clones and static builds: the files must be present in `apps/frontend/public/fonts/` or the affected fonts silently fall back. To restore them locally:

```sh
mkdir -p apps/frontend/public/fonts
cp docker/private-plugins/Edwardian-Script-ITC.woff2 docker/private-plugins/Bodoni-Z37.woff2 apps/frontend/public/fonts/
```

If `@font-face` files are missing, Nuxt logs `[Vue Router warn] No match found for location with path "/fonts/..."` and the page renders with a fallback face. A locally installed system font of the same name (common on macOS for Edwardian Script) can mask the problem during dev — confirm in the generated static output, not just on your own machine.

## Start The CMS

For normal public-content work:

```sh
corepack pnpm start:cms:public
```

For fixture and regression work, or when you need both CMS roles running:

```sh
corepack pnpm start:cms:qa
```

`start:cms:qa` starts the public CMS plus the QA CMS.

## Start The Frontend

For the normal live development loop:

```sh
corepack pnpm start:frontend
```

Then visit:

- public content frontend: `http://my-website.localhost`
- QA content frontend: `http://qa.my-website.localhost`

Both hostnames point at the same Nuxt dev server. The request hostname decides whether Nuxt reads from the public CMS or QA CMS.

## Generate Static Output

Generate from the public CMS:

```sh
corepack pnpm generate:static:public
```

Generate from the QA CMS only when you intentionally want fixture output:

```sh
corepack pnpm generate:static:qa
```

Static generation writes the generated site to `apps/frontend/.output/public`.

### Why generate from public, not QA, for a real deploy

The QA CMS exists to seed fixture content (Kitchen Sink, load-more regression posts, generated media). Some of those seed scripts — notably `cms:qa:seed-writing-load-more-content` — insert post rows into the QA database that **reference media URLs without uploading the underlying files** to the QA WordPress uploads directory. This is fine for in-browser QA, where the missing-image squares are an acceptable cost of cheap fixture generation.

It is not fine for static deploy. The deploy planner walks the generated site, collects every referenced media URL, and resolves each one to a local file under the WordPress uploads directory. When the post points at media that was never uploaded, the planner reports `Missing N local media files` and `assertMediaPlan` (`apps/frontend/scripts/static-deploy-bunny.mjs`) refuses to proceed. The deploy is **correctly** refusing to upload a site whose images would 404.

Practical rule: **treat QA as expendable, public CMS as the source of truth for any deploy.** If a deploy fails with missing media that traces back to QA-only fixture rows, the fix is to regenerate from `generate:static:public`, not to chase down the missing files. The existing safety rule "do not publish QA CMS content to a public production target" covers the policy; this is the mechanical reason it would fail anyway.

## Preview Static Output Locally

Start the static preview server:

```sh
corepack pnpm start:static:preview
```

Then visit either:

- `http://static.my-website.localhost`
- `http://127.0.0.1:3002`

Use this preview to catch obvious generation errors before uploading anything.

## Inspect The Static Output

Run the dry planning tool:

```sh
corepack pnpm inspect:static
```

Check for:

- `staticGenerated:true`
- the expected provider target and environment
- no non-media local CMS/API references
- expected media mappings
- zero missing local upload files
- reasonable largest-file groups

This command does not upload files.

## Deploy To Bunny Preview

Confirm `.env.deploy` is present locally and contains the preview target values.

The deployment is a dry run unless `STATIC_DEPLOY_DRY_RUN=0` is set in `.env.deploy` or the shell.

```sh
corepack pnpm deploy:static:bunny
```

The Bunny deploy command:

- uploads referenced WordPress media under the configured media prefix
- rewrites generated HTML and Nuxt payload media URLs to CDN URLs
- uploads generated static files
- purges the pull-zone cache when purge credentials are configured

## QA The CDN Preview

Open the Bunny preview in a clean browser session:

```text
https://my-website-preview.b-cdn.net
```

Check at least:

- Home
- Writing archive
- one writing detail page
- one case-study detail page
- route transitions from cards to detail pages
- Home and Writing return paths
- images and responsive image `srcset` behavior
- video, audio, file, gallery, and Mega Gallery media where present
- footer links
- the same representative paths on a phone

If media fails on the phone but works locally, suspect lingering local CMS URLs, CDN cache state, or a media rewrite/upload issue.

## Optional Measurement

For a production-like measurement, run Lighthouse against the Bunny preview after one warm load.

Treat Vite dev-server warnings as irrelevant here. Useful warnings are the ones that apply to deployed static output: image weight, cache headers, compression, metadata, accessibility, and SEO.

## Backup Touchpoint

Before treating local WordPress as the source of real public content, keep a recent public CMS backup:

```sh
corepack pnpm backup:cms:public
corepack pnpm list:backups:cms:public
```

Restore-test into QA when needed:

```sh
corepack pnpm restore:cms:qa -- .backups/cms/content/<timestamp> --yes
```

Backups are local only for now. Off-device backup is still deferred production-readiness work.
