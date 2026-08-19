# Deploy Performance
Continues from: docs/archive/static-deploy.md
Continues in: docs/active-spikes/production-deploy.md

Archived spike doc. The performance work shipped, was confirmed on a real preview deploy, and closed after adding a documented force-upload escape hatch. Production-domain launch and destructive remote pruning continue in `docs/active-spikes/production-deploy.md`.

## What This Is
The static-deploy spike proved the publish path works: generate from WordPress, verify locally, upload the generated site plus referenced media to Bunny storage, rewrite media URLs, purge the pull zone, verify. It was built for **correctness**, and it achieved that.

This spike is about the other axis: publishing is slow enough to be a friction point in the authoring loop. A preview deploy uploads ~890 files one at a time and takes on the order of fifteen minutes, during which a single transient network failure aborts the whole run and forces a restart from the beginning.

The goal is a publish step fast and resilient enough that the user stops thinking about it.

## Why It Is Slow
Not bandwidth — **latency**. Both upload loops are strictly serial:

```js
for (const [index, item] of mediaPlan.items.entries()) {
  await uploadLocalFileToBunny(...)
}
```

Roughly 408 media files plus 485 static files means ~893 sequential HTTPS PUTs to `storage.bunnycdn.com`. Each costs a full round trip — request, body, Bunny's write acknowledgement — and only one small file is ever in flight, so the connection sits idle most of the time. At a typical 0.5–1.5s per file that is 7–20 minutes of almost pure waiting.

Two properties make it worse than the raw arithmetic:

- **Every deploy re-uploads everything.** Media in particular is nearly always byte-identical between publishes, and it is the larger half of the work. Most of the time is spent re-sending bytes Bunny already has.
- **A single failure loses all progress.** `uploadLocalFileToBunny` throws on any non-OK response and nothing catches it, so one blip ends the run. Because media uploads happen first, a failure late in the static phase means redoing all 408 media files before getting back to where it stopped.

## Goals
- Cut wall-clock publish time enough that deploying is no longer a decision.
- Survive transient network failures without losing the whole run.
- Avoid re-uploading content the CDN already has.

## Non-Goals
- **Correctness changes.** The static-deploy spike settled what gets uploaded, how media URLs are rewritten, and how the deploy is verified. This spike changes *how fast and how reliably* that happens, not *what* it does. The verification and cache-purge steps stay exactly as they are.
- **Production launch concerns** — domain, DNS, production cache policy, rollback. Those continue in `docs/active-spikes/production-deploy.md`.
- **Deleting obsolete remote files.** Pruning files that no longer exist locally is a real gap, but it is destructive and belongs with production deploy where the blast radius is understood. Skipping unchanged uploads is safe; deleting is not.

## Constraints And Boundaries
- **Bunny storage is the source of truth for what is already uploaded.** Prefer asking Bunny what it has over keeping a local manifest, because a local manifest silently lies whenever a deploy is interrupted, a zone is cleared by hand, or two machines publish.
- **Concurrency has to stay polite.** This is a shared storage API; a pool in the region of 8–16 is a large speedup without hammering it. Unbounded `Promise.all` over 893 files is not acceptable.
- **Failure has to stay loud.** Retries are for transient faults. A genuinely failing upload must still abort the deploy with a clear error rather than being silently skipped — a partially-uploaded site that reports success is worse than a slow one.
- **Skipping must be conservative.** If there is any doubt whether the remote copy matches, upload. A false skip publishes stale content, which is a correctness bug of exactly the kind the predecessor spike existed to prevent.

## Relationship To Other Work
The observation that routine publishes re-upload unchanged files was first written down in the production-deploy scratch draft as a production concern. It was promoted here because it turned out to be an authoring-loop problem, felt before launch. The active production-deploy spike keeps the destructive half — pruning obsolete remote files — and the launch-operations work.

## Settled Outcome
Bounded concurrency, transient-failure retry, and conservative checksum skipping for media reduced the real preview-deploy time enough that the user described it as “way faster.” Static HTML/JS checksum skipping was deliberately declined: generated output changes frequently, media URL rewriting mutates it after the initial remote listing, and the remaining speed gain does not justify a stale-publish failure mode. A one-run `--force` flag and `STATIC_DEPLOY_FORCE=1` escape hatch bypass media checksum skipping when remote storage is suspected to be corrupt without weakening dry-run protection, retries, cache purge, or public verification.
