# Deploy Performance To-Do
## Background
Promoted 2026-08-04 after a preview deploy was observed taking ~15 minutes and being interrupted partway, forcing a full restart. Conceptual doc: `docs/archive/deploy-performance.md` — read it first for why the pipeline was slow and, importantly, the boundaries around not weakening the correctness guarantees the static-deploy spike established.

Continues from: `docs/archive/static-deploy.md` (built the pipeline). The "uploads everything on every publish" observation was promoted out of the production-deploy scratch draft; `docs/active-spikes/production-deploy.md` now keeps the destructive pruning half and the launch work.

## Project Organization
- Conceptual doc: `docs/archive/deploy-performance.md`
- Operational doc: `docs/archive/deploy-performance.todo.md`
- Predecessor: `docs/archive/static-deploy.md` / `docs/archive/static-deploy.todo.md`
- Active successor: `docs/active-spikes/production-deploy.md` (production launch; owns remote pruning)

## General Principles
- Correctness beats speed. A false skip publishes stale content; when in doubt, upload.
- Retries cover transient faults only — a real failure must still abort loudly.
- Stay polite to the storage API: a bounded pool, never unbounded parallelism.
- Do not change what is uploaded, how media URLs are rewritten, or how the deploy is verified.

## Current State Overview
**Closed 2026-08-19: D1–D3 shipped and were confirmed on a real deploy, D4 was deliberately dropped after that measurement, and D5 added the documented force-upload escape hatch.**

- Deploy entry point: `apps/frontend/scripts/static-deploy-bunny.mjs` (~1136 lines), run via `pnpm run deploy:static:bunny`.
- Phases: load env → list files → inspect static marker → check local asset references → build media plan → **upload media (serial)** → rewrite media URLs → **upload static (serial)** → purge pull zone → verify.
- `uploadLocalFileToBunny(file, deployTarget, config)` is the single upload primitive: reads the file, PUTs it, throws on non-OK. No retry, no concurrency, no change detection.
- Measured on the preview zone: 408 media + 485 static files, 21.5 MiB total, ~15 minutes.

## Key file pointers
- `apps/frontend/scripts/static-deploy-bunny.mjs` — the whole deploy script.
  - `uploadLocalFileToBunny` — the upload primitive to wrap.
  - the media loop and the static loop — the two serial `for … await` loops.
  - `purgeBunnyPullZoneCache`, `verifyBunnyDeployment` — leave alone.

## To Do
- (empty — spike closed)

## Ready For Human QA
- (empty — confirmed on a real deploy 2026-08-05: "yes things are way faster to deploy". See Done.)

<!-- Original QA request, kept for the record:
- **D1 + D2 + D3 implemented 2026-08-04, needs a real deploy to confirm.** Everything verifiable from the terminal has been: `node --check` passes, a `STATIC_DEPLOY_DRY_RUN=1` run completes the plan phases unchanged, and the pool/retry semantics were exercised in a standalone harness (50 items all processed exactly once, max 8 in flight, empty input safe, an error still rejects, a transient failure retries to success, a non-retryable failure aborts after one attempt). What the terminal cannot show is behaviour against the live storage API. On the next `pnpm run deploy:static:bunny`, check: (1) wall-clock time — expect roughly 15 minutes to fall under ~2; (2) the run reports `Skipped N unchanged media file(s)` with N close to 408 on a repeat deploy, and near 0 on the first run after this change; (3) progress lines still count up sensibly; (4) the site is actually correct afterwards — spot-check a page with images, since a false skip would show as stale or missing media; (5) if the storage listing fails it should print `Could not list storage zone (…); uploading everything.` and still succeed.
-->

## Done
- D4. OPEN: whether to extend skip-unchanged to the static HTML/JS output too. Generated HTML changes far more often than media and the media rewrite step mutates files in place, so the win is smaller and the staleness risk higher. Decide after D3 is measured. — DROPPED 2026-08-19. The real deployment already made the authoring loop “way faster,” while static files change frequently and are mutated by media URL rewriting after the initial remote listing. The smaller remaining speed opportunity does not justify adding a more fragile checksum phase or creating a stale-static-output failure mode.
- D5. OPEN: surface a `--force` / env escape hatch to bypass skipping, for when a zone is suspected to be corrupt. — DONE 2026-08-19. `corepack pnpm deploy:static:bunny -- --force` bypasses the remote inventory and re-uploads every referenced media file for one deployment; `STATIC_DEPLOY_FORCE=1` supplies the same behavior for scripted use. The deploy header reports whether force mode is active. Force mode changes only unchanged-media skipping: dry-run protection, credential checks, bounded concurrency, retry, cache purge, and public verification remain mandatory. Documented in `README.md` and the canonical static-publish runbook. A forced dry run through the root command confirmed the argument reaches the frontend script and reports `Force media upload: yes` without uploading anything.
- **QA passed 2026-08-05.** A real preview deploy confirmed the speedup — reported as "way faster". The three items below are therefore approved, not merely implemented.

- [x] **D1. Concurrency pool.** Replace both serial loops with a bounded worker pool (start at 8). Keep the existing progress logging meaningful when uploads complete out of order. Biggest win, smallest blast radius — do this first. — DONE 2026-08-04. `runPooled(items, limit, worker)` pulls from a shared index with `UPLOAD_CONCURRENCY = 8` runners; both the media and static loops now go through it. Progress is reported by **count completed** rather than by index, because with a pool the items finish out of order and an index-based counter jumps around. Rejects on the first error, matching the previous abort-the-deploy behaviour.
- [x] **D2. Retry with backoff.** Wrap the upload primitive so transient failures (network errors, 5xx, 429) retry a few times with exponential backoff, while non-transient failures (4xx other than 429) still abort immediately. Must not convert a real failure into a silent skip. — DONE 2026-08-04. `uploadWithRetry` wraps the primitive with 4 attempts and 500ms exponential backoff. `uploadLocalFileToBunny` now tags its thrown error with `retryable`, set from `isRetryableUploadFailure` (429 and 5xx retry; other 4xx are real — auth, bad path — and abort at once rather than burning retries on a certain failure). Exhausting retries still throws, so a genuine failure aborts the deploy rather than being skipped.
- [x] **D3. Skip unchanged media.** List what the storage zone already holds (Bunny's storage API returns per-object metadata including a checksum) and skip uploading a local file whose remote copy already matches. Conservative: any uncertainty means upload. Media first, since it is the larger and most-static half. — DONE 2026-08-04. `listBunnyStorageFiles` walks the zone recursively and returns path -> `{ checksum, length }`; `isAlreadyUploaded` compares length then SHA256 of the local bytes against Bunny's stored checksum. Deliberately conservative at every branch: no listing, no entry, no checksum, or any mismatch all mean upload. **If the listing itself fails the whole index is dropped and everything uploads** — skipping on incomplete knowledge would publish stale content, which is exactly the failure the predecessor spike existed to prevent. Chose to query Bunny rather than keep a local manifest because a manifest lies whenever a deploy is interrupted, a zone is cleared by hand, or two machines publish.
- Applied to media only, not the static output — recorded as D4 rather than done. `rewriteGeneratedMediaUrls` mutates generated files in place *after* the listing is taken, so a checksum captured earlier could be stale, and generated output changes on nearly every build anyway.
