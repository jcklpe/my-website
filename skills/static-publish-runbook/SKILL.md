---
name: static-publish-runbook
description: "Run the repo's static generation and Bunny preview deploy workflow safely using this canonical static publish checklist, including inspect-before-deploy, dry-run handling, and post-deploy QA expectations."
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

## Preview Cache Contract

- Preview HTML, including extensionless routes, must require browser revalidation (`Cache-Control: no-cache`, `no-store`, or `max-age=0`). A CDN purge cannot revoke HTML already stored in a visitor's browser.
- The Bunny edge may retain HTML between publishes, but every real deploy must purge the pull zone after all uploads finish.
- After purging, the deploy command verifies both `/` and `/index.html` against the uploaded local `index.html` and rejects browser-cache headers that permit stale HTML.
- Long-lived immutable caching for hashed Nuxt assets and the final media/font policy remain part of production-deploy work. Do not restore a global long browser-cache lifetime that also applies to HTML.

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

## Reporting Back

When you complete or attempt static publish work, report:

- commands run
- source CMS used (public or QA)
- whether deploy was dry run or real upload
- inspect warnings or blockers
- explicit human QA checks still needed
