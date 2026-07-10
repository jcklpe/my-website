# CI And Developer Convenience Commands Spike
## Status
Closed / archived (2026-07-10).

Operational history: [ci.todo.md](ci.todo.md).

## Goal
Make project checks, startup, and publish workflows easier to run without making the local WordPress-centered development model more fragile.

The useful slice is not full CI. It is the developer convenience command work that had been parked in `docs/scratch/ci.md`: a single local startup command and a static generation + local preview command shape. GitHub Actions can stay visible as a future idea elsewhere, but this spike intentionally turns down CI work beyond the two ergonomic scripts so it can close cleanly once those scripts and docs are done.

## Final Outcome
The spike added two local convenience commands:

- `corepack pnpm start:all` starts the public + QA CMS stack, prints the relevant local URLs, then starts Nuxt in the foreground on `127.0.0.1:3001`.
- `corepack pnpm generate:preview` generates static output from the public CMS, then starts the local static preview server on `127.0.0.1:3002`.

Both commands use small Node orchestration scripts instead of adding `concurrently` or `wait-on`. The shape stayed sequential and explicit: Docker starts detached, Nuxt/static preview remain foreground long-running processes, and child output is inherited so failures are visible.

No GitHub Actions workflow was added. No one-shot generate-and-CDN-deploy command was added. CDN deploy remains the separate deliberate `corepack pnpm deploy:static:bunny` step after local inspection and `corepack pnpm inspect:static`.

## Current Context
This repo is not a typical stateless frontend app. Nuxt is the public frontend, but WordPress remains the local CMS, content source, and media source. Static generation and deploy are explicit publish operations that consume the public CMS and then push generated output/media to a CDN preview target.

That means local ergonomics matter more immediately than remote automation. A GitHub Actions workflow that only runs lint/typecheck may be possible, but a production build or static generate needs a serious answer to CMS data: mock GraphQL responses, skip data fetching, or spin up a representative WordPress instance. None of that should be solved accidentally inside a small convenience-command pass.

## Scope
### Developer Convenience Commands
The first implementation focus is local command ergonomics:

- a single startup command, `start:all`, that starts the public + QA CMS stack and the Nuxt frontend
- a local preview command, `generate:preview`, that generates static output from the public CMS and then starts the local static preview server
- clear names and output so the command tells the operator which CMS source and local URL it is using
- scripts that preserve the current public/QA split and do not make DDEV or any other runtime canonical by accident
- no one-shot generate-and-CDN-deploy command; CDN deploy should remain a separate deliberate step after local inspection

### Declined CI Scope
CI is explicitly out of scope for this spike after the two ergonomic scripts land.

Open CI questions from the scratch note:

- Should CI run a full production SSR build, a static generate, or just lint + typecheck?
- How should the CMS dependency be handled in CI: mock GraphQL responses, skip data fetching, or spin up a test WordPress instance via Docker?
- Should branch protection block merges on lint/typecheck failure?

These questions should remain visible as context, but they are declined for this spike. Do not add `.github/workflows/ci.yml` or branch-protection guidance while closing this work.

## Constraints
- Node is pinned by `.nvmrc` to Node `22`.
- pnpm is pinned by the root `packageManager` field to `pnpm@10.18.3`.
- Use `corepack pnpm` from the repo root.
- `corepack pnpm check` covers editor CSS regeneration, lint, and typecheck.
- Production build and static generation depend on WordPress data unless deliberately mocked or redirected.
- Static publish must use the public CMS for publishable output unless the user explicitly asks for QA generation.
- `corepack pnpm inspect:static` must run before any real CDN deploy.
- Deploy credentials stay in env files or shell env, never in committed package scripts.

## Command Philosophy
Commands should be boring, explicit, and hard to misuse.

The startup command should optimize for beginning an authoring/development session: bring up the CMS stack that includes both public and QA containers, then run Nuxt on `127.0.0.1:3001`. It should not hide errors from Docker or the frontend dev server.

The preview command should optimize for local inspection before CDN deploy. It should make the content source public-only by default, generate static output, and then start the local static preview server. It should not deploy to Bunny, and it should remind the operator to run `corepack pnpm inspect:static` before any manual CDN deploy.

## Files To Inspect
- `package.json`
- `apps/frontend/package.json`
- `apps/frontend/scripts/static-preview.mjs`
- `skills/static-publish-runbook/SKILL.md`
- `.nvmrc`
- `pnpm-lock.yaml`

## Out Of Scope For The First Slice
- Adding `.github/workflows/ci.yml`
- Solving CMS mocking for remote CI
- Branch protection policy
- One-shot generate-and-CDN-deploy command
- Production-domain launch work
- Changing the static deploy provider model
