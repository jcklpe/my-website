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
