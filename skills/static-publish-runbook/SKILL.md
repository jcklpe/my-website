---
name: static-publish-runbook
description: "Run the repo's static generation and Bunny preview or production deploy workflow safely using this canonical static publish checklist, including backup, inspect-before-deploy, dry-run handling, and post-deploy QA expectations."
---

# Static Publish Runbook

## Repo-Local Authority

This is the repo-local `static-publish-runbook` skill. Treat it as authoritative for how agents execute static publish operations in this repository.

## Purpose

This skill is the canonical static publish runbook for the repo. It replaced the older ad-hoc Markdown runbook concept during the migration to standardized repo-local skills.

Use this file directly when executing or documenting static generation, local static preview, static deploy inspection, Bunny preview deploys, and post-deploy QA. If durable static-publish process details change, update this skill and any current references in `README.md`, `AGENTS.md`, or `TODO.md`.

## When To Use

Use this skill when the user asks to:

- generate static output
- preview generated static output
- inspect static deploy plans
- deploy to Bunny preview
- run static publish QA
- troubleshoot static deploy workflow issues

## Required Guardrails

- Use the public CMS for publishable output unless the user explicitly requests QA CMS generation.
- Run `corepack pnpm inspect:static` before any real deploy.
- Treat deploys as dry runs unless deploy env explicitly sets `STATIC_DEPLOY_DRY_RUN=0`.
- Never place credentials in committed files or package scripts.
- Never hardcode CDN/media URLs in frontend source; rely on deploy tooling.
- Real Bunny uploads require `BUNNY_PURGE_API_KEY`, `BUNNY_PULL_ZONE_ID`, and `BUNNY_PULL_ZONE_URL`; do not treat an upload without cache purge and public verification as successful.
- Before a production candidate, run `corepack pnpm backup:cms:public` and record the resulting ignored backup directory in the active production-deploy spike.
- Production requires `STATIC_DEPLOY_ENV=production`, `STATIC_PUBLIC_SITE_URL=https://www.aslanfrench.work`, and matching `BUNNY_PULL_ZONE_URL` / optional `STATIC_MEDIA_BASE_URL` origins. The deploy rejects local, example, and contradictory production origins.
- A production deploy is successful only after public verification. Only then does tooling copy the exact post-rewrite output into the ignored `.releases/static/<release-id>/public` store and write its hash manifest.
- Keep the five newest unpinned verified releases by default. Add an empty `PINNED` file inside a release directory to exempt it from automatic retention; `STATIC_RELEASE_KEEP` changes the unpinned count. Failed deploys never enter retention, and CMS backups have their own separate policy.

## Cache And Header Contract

- Preview HTML, including extensionless routes, must require browser revalidation (`Cache-Control: no-cache`, `no-store`, or `max-age=0`). A CDN purge cannot revoke HTML already stored in a visitor's browser.
- The Bunny edge may retain HTML between publishes, but every real deploy must purge the pull zone after all uploads finish.
- After purging, the deploy command verifies both `/` and `/index.html` against the uploaded local `index.html` and rejects browser-cache headers that permit stale HTML.
- Production `_nuxt` assets cache in the browser and edge for one year; fonts cache for 30 days; bundled `/images` and WordPress `/media` cache in browsers for seven days and at the edge for 30 days. Do not restore a global long browser-cache lifetime that also applies to HTML.
- Production responses must carry `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Frame-Options: SAMEORIGIN`. The idempotent `corepack pnpm configure:static:bunny` command previews the managed rule delta; add `-- --apply` to update only rules prefixed `[my-website]` while preserving the apex redirect and other unmanaged rules.
- HSTS remains a separate irreversible-policy gate. Do not enable it as incidental CDN cleanup.

## Command Sequence

Default public publish path:

1. `corepack pnpm start:cms:public`
2. `corepack pnpm start:frontend`
3. `corepack pnpm generate:static:public`
4. `corepack pnpm start:static:preview`
5. `corepack pnpm inspect:static`
6. `corepack pnpm deploy:static:bunny`

The deploy skips media whose remote checksum already matches. If the Bunny storage copy is suspected to be missing or corrupt, run `corepack pnpm deploy:static:bunny -- --force` to re-upload all referenced media for that deploy. Force mode bypasses only the unchanged-media check; it does not bypass dry-run protection, credential checks, bounded concurrency, retries, cache purge, or public verification. `STATIC_DEPLOY_FORCE=1` provides the same escape hatch for scripted use, but prefer the one-run CLI flag during normal manual publishing.

For a real Bunny upload, successful output must end with both `Bunny CDN cache purged.` and `Bunny public output verified.` Treat either a purge or verification failure as a failed deploy.

Production deploy verification hash-checks root/index, About, Writing, and representative writing/case-study detail HTML; checks robots, sitemap, and `llms.txt`; verifies that default Open Graph and Twitter metadata point to the byte-matching production social image; verifies representative `_nuxt`, font, image, and media cache classes plus baseline security headers; requires a true unknown-route 404; and requires the apex to return a path/query-preserving HTTP 301 to `www`. This is terminal verification, not a substitute for visual and interaction QA.

## Verified Releases And Content Rollback

List stored releases with:

`corepack pnpm releases:static`

Validate and preview an artifact-only rollback without reading WordPress:

`corepack pnpm rollback:static:bunny -- <release-id>`

Redeploy that exact artifact, purge Bunny, and run the full public verifier:

`corepack pnpm rollback:static:bunny -- <release-id> --execute`

The rollback command verifies every stored file against `release.json` before publishing and suppresses creation of a duplicate release record. This is content rollback. Infrastructure rollback is different: use the recorded DNS/CDN values only when Bunny, hostname, certificate, or DNS infrastructure—not page content—is the failure.

If upload fails, stop: the deploy is incomplete and no release is recorded. If upload succeeds but purge fails, retry the same artifact; visitors may still see the prior cached release, so do not prune or make DNS changes. If public verification fails after purge, stop, inspect whether propagation is merely delayed, and either retry the same artifact or execute the last known-good release rollback. A failed verifier never authorizes pruning.

## Obsolete Generated-File Pruning

Generate an exact, read-only plan against a verified release:

`corepack pnpm prune:static:bunny -- --release=<release-id>`

The command compares fresh Bunny inventory with the complete verified release, prints count/bytes and a plan hash, and writes every candidate to ignored `.deploy/static-prune-plan.json`. It always protects `/media/` and dot-prefixed provider/system paths. Review that file before deletion.

After review, execute the freshly recomputed plan with:

`corepack pnpm prune:static:bunny -- --release=<release-id> --confirm-plan=<plan-hash> --execute`

Execution refuses unverified releases, empty/non-site inventories, a non-production hostname, or a plan hash that no longer matches fresh remote inventory. It verifies the public root against the selected release before deletion, removes only absent generated-site files, purges Bunny, reverifies the public root, and confirms a representative deleted route returns 404 afterward. Media deletion remains out of scope.

QA-only generation path (non-production content):

1. `corepack pnpm start:cms:qa`
2. `corepack pnpm generate:static:qa`
3. `corepack pnpm start:static:preview`
4. `corepack pnpm inspect:static`

## Post-Deploy QA Minimum

After preview deploys, verify at least:

- home
- writing archive
- one writing detail page
- one case-study detail page
- media rendering (images, video, audio, file blocks, galleries)
- route transitions and return paths
- representative mobile checks

After production deploys, complete the live visual QA list maintained in `docs/active-spikes/production-deploy.todo.md`. Warmed accessibility/performance auditing belongs to the separate WCAG/SEO pass rather than this publish checklist.

## Reporting Back

When you complete or attempt static publish work, report:

- commands run
- source CMS used (public or QA)
- whether deploy was dry run or real upload
- inspect warnings or blockers
- explicit human QA checks still needed
