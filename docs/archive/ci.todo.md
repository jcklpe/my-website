# CI And Developer Convenience Commands To-Do
## Background
Promoted from `docs/scratch/ci.md` on 2026-07-10.

The scratch note originally framed this as CI: lint, typecheck, and production build checks on every push or pull request. While reading the project state, the more useful immediate slice became the developer convenience commands that were appended to the same scratch doc. Actual GitHub Actions work is declined for this spike so the spike can close once `start:all`, `generate:preview`, and their docs are complete.

## Project Organization
- Archived conceptual doc: `docs/archive/ci.md`
- Archived operational doc: `docs/archive/ci.todo.md`
- Former active conceptual doc: `docs/active-spikes/ci.md`
- Former active operational doc: `docs/active-spikes/ci.todo.md`
- Former scratch source: `docs/scratch/ci.md` deleted during promotion

## General Principles
- Prefer local scripts that compose existing project commands before adding new tooling.
- Keep public CMS and QA CMS semantics explicit.
- Preserve `corepack pnpm` as the documented command shape.
- Do not inline deploy credentials or provider secrets into scripts.
- Do not add CI work in this spike; the local CMS problem should stay unsolved here rather than get an accidental partial answer.
- Keep command names clear enough that a tired future human can tell whether they are starting dev, generating static output, or deploying.

## Current State Overview
- `corepack pnpm check` already regenerates editor CSS, then runs lint and typecheck.
- `corepack pnpm start:cms:public` starts the public CMS stack.
- `corepack pnpm start:cms:qa` starts public + QA CMS containers through `docker:up:all`.
- `corepack pnpm start:frontend` runs Nuxt on `127.0.0.1:3001`.
- `corepack pnpm generate:static:public` explicitly generates static output from the public CMS.
- `corepack pnpm inspect:static` runs the static deploy plan/inspection.
- `corepack pnpm deploy:static:bunny` uploads only when deploy credentials are configured and `STATIC_DEPLOY_DRY_RUN=0`; otherwise it remains dry-run by default.
- `corepack pnpm start:static:preview` serves existing generated output on `127.0.0.1:3002`.
- No `concurrently`, `wait-on`, `npm-run-all`, or equivalent orchestrator is currently listed in the root or frontend package manifest.

## To Do
- None right now.

## Declined CI Scope
These items were intentionally dropped from this spike so it could close around the two local ergonomic scripts:

- Dropped for this spike: decide whether GitHub Actions is worth adding for this repo while the CMS remains local.
- Dropped for this spike: decide whether the first CI workflow should run only `corepack pnpm check`.
- Dropped for this spike: decide how CI should satisfy WordPress GraphQL/content requirements for `corepack pnpm build` or static generation.
- Dropped for this spike: decide whether branch protection should block merges on lint/typecheck failure.

## Ready For Human QA
- None.

## Done
- [x] Promote the scratch CI note into an active spike pair. Created `docs/active-spikes/ci.md` and `docs/active-spikes/ci.todo.md`, preserved the CI questions as deferred planning context, scoped the first implementation slice to local developer convenience commands, removed the scratch source, and updated `TODO.md` as the active-work index.
- [x] Clarify the spike scope before implementation. Accepted `start:all` as the startup command name, replaced the earlier `publish:preview` idea with `generate:preview`, and explicitly turned down GitHub Actions / CI work plus one-shot generate-and-CDN-deploy work for this spike.
- [x] Decide the startup command implementation shape: add a small Node orchestration script, add a narrow dependency such as `concurrently`, or compose existing package scripts in the least surprising way. Implemented as small Node orchestration scripts without new dependencies; Docker already starts detached, so `concurrently` would not improve this shape, and a bespoke wrapper gives the useful sequencing without needing a package install.
- [x] Add a single startup script, `start:all`, that starts the public + QA CMS stack and the Nuxt frontend. Added `scripts/start-all.mjs` and the root `start:all` package script.
- [x] Make the startup command explicit in its terminal output about the URLs it starts: frontend `http://127.0.0.1:3001`, public CMS, QA CMS, and Caddy public/QA frontend URLs when available. The wrapper prints the direct frontend URL plus public/QA frontend and CMS Caddy URLs before starting Nuxt.
- [x] Ensure the startup command does not hide Docker or Nuxt failures. The wrapper inherits child process stdio and exits on CMS startup failure; Nuxt remains the foreground process.
- [x] Add a local static preview script, `generate:preview`, that runs `corepack pnpm generate:static:public`, then `corepack pnpm start:static:preview`. Added `scripts/generate-preview.mjs` and the root `generate:preview` package script.
- [x] Ensure `generate:preview` prints the public CMS source expectation, local static preview URLs, and the reminder to run `corepack pnpm inspect:static` before any manual CDN deploy. The wrapper prints those notes between generation and preview-server startup.
- [x] Ensure this spike does not add a one-shot generate-and-CDN-deploy command. No deploy/package script was added; `deploy:static:bunny` remains the explicit manual CDN step.
- [x] Update README command documentation after scripts land. Added `start:all` and `generate:preview` to the Useful Commands section, and added both commands to the AGENTS common command list.
- [x] Run `corepack pnpm check` after implementation if feasible. Passed on 2026-07-10 with the existing two `vue/no-v-html` warnings in `apps/frontend/pages/about.vue` and `apps/frontend/pages/now.vue`, and no errors.
- [x] Run `corepack pnpm start:all` after stopping local servers. Confirm it starts the public + QA CMS stack, prints the expected local URLs, starts Nuxt in the foreground at `http://127.0.0.1:3001`, and exits cleanly with Ctrl-C. Human QA confirmed on 2026-07-10 that `start:all` works as expected.
- [x] With the public CMS running, run `corepack pnpm generate:preview`. Confirm it generates static output from the public CMS, starts the local static preview server at `http://127.0.0.1:3002`, leaves CDN deploy as a separate manual step, and exits cleanly with Ctrl-C. Human QA confirmed on 2026-07-10 that `generate:preview` works as expected.
