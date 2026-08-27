# Local Development Hardening To-Do
## Background
The credential audit found no committed production secrets, but the development Compose overlays published WordPress/Caddy ports on all host interfaces. The established ignored local environment is preserved, while any optional administrator-password rotation remains a separate user-controlled operation.

Conceptual doc: `docs/active-spikes/local-dev-hardening.md`.

## General Principles
- Limit the network boundary instead of pretending public example values are secret.
- Never overwrite or rotate an established local environment automatically.
- Keep the production fallback Compose behavior separate from local development.
- Preserve phone QA through the existing Nuxt/Cloudflare tunnel.

## Current State Overview
- `docker/.env` and deployment credentials are ignored correctly.
- MariaDB has no published host port.
- Development WordPress ports `8080` and `8081`, plus local Caddy port `80`, bind only `127.0.0.1`.
- Root Docker start commands create a private randomized `docker/.env` when absent and preserve an existing environment.

## To Do
No active implementation work remains.

## Ready for Human QA
None yet.

## Done
- [x] Recreate the active development containers and verify the hardened network boundary. **Completed 2026-08-27:** the running public CMS, QA CMS, and Caddy containers publish only on `127.0.0.1` at ports `8080`, `8081`, and `80`; neither MariaDB container publishes a host port.
- [x] Bind development CMS and Caddy ports explicitly to `127.0.0.1`. **Completed 2026-08-26:** the development-only overlays bind public WordPress at `127.0.0.1:8080`, QA WordPress at `127.0.0.1:8081`, and Caddy at `127.0.0.1:80`; the production fallback Compose file remains unchanged.
- [x] Add an idempotent local-environment generator that creates an owner-readable `docker/.env` with random passwords only when the file is absent. **Completed 2026-08-26:** `scripts/ensure-docker-env.mjs` generates six unique password values, creates the ignored file with mode `0600`, refuses races through exclusive creation, and leaves an existing environment untouched.
- [x] Run environment generation automatically before the documented Docker start commands and document the explicit setup command. **Completed 2026-08-26:** `docker:up` and `docker:up:all` run `setup:docker-env`; the README explains automatic/explicit setup, loopback binding, and the phone-tunnel boundary; public examples contain visible generation markers instead of working defaults.
- [x] Verify Compose configuration for public-only and public-plus-QA stacks, exercise generator create/non-overwrite behavior in a temporary directory, and run the project check. **Completed 2026-08-26:** both Compose configurations pass `config --quiet`; a temporary run produced six unique secrets of expected length with mode `0600`, a second run preserved the file hash, the real existing `docker/.env` hash stayed unchanged, Prettier passed, and `corepack pnpm check` passed with only the two existing `v-html` warnings.
