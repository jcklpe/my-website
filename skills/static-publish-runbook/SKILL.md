---
name: static-publish-runbook
description: "Run the repo's static generation and Bunny preview deploy workflow safely using the durable docs/static-publish-runbook.md checklist, including inspect-before-deploy, dry-run handling, and post-deploy QA expectations."
---

# Static Publish Runbook

## Repo-Local Authority

This is the repo-local `static-publish-runbook` skill. Treat it as authoritative for how agents execute static publish operations in this repository.

## Purpose

Operationalize the static publish workflow in `docs/static-publish-runbook.md` so agents can execute it consistently without skipping safety checks.

## Source Of Truth

The durable checklist and operator detail lives in `docs/static-publish-runbook.md`.

This skill is an execution wrapper, not a replacement. When this skill and the runbook diverge, update this skill to match the runbook and project rules.

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

## Command Sequence

Default public publish path:

1. `corepack pnpm start:cms:public`
2. `corepack pnpm start:frontend`
3. `corepack pnpm generate:static:public`
4. `corepack pnpm start:static:preview`
5. `corepack pnpm inspect:static`
6. `corepack pnpm deploy:static:bunny`

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
