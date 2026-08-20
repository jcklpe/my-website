# Production Deploy To-Do
## Background
Promoted 2026-08-19 from `docs/scratch/production-deploy.md`, which is retired by this promotion. This spike continues the completed static delivery and deploy performance work into real-domain launch operations.

Conceptual doc: `docs/active-spikes/production-deploy.md` — read it first for the settled Bunny architecture, current live-domain failure state, metadata model, rollback model, pruning boundary, and launch gates.

## Project Organization
- Conceptual doc: `docs/active-spikes/production-deploy.md`
- Operational doc: `docs/active-spikes/production-deploy.todo.md`
- Operator authority: `skills/static-publish-runbook/SKILL.md`
- Continues from: `docs/archive/static-deploy.md`
- Continues from: `docs/archive/deploy-performance.md`
- Retired scratch source: `docs/scratch/production-deploy.md`

## General Principles
- Production launch extends the proven Bunny path; it does not rebuild hosting from scratch.
- Keep generation, inspection, deploy, purge, and public verification explicit and separately reportable.
- A production release is self-contained. Do not restore a public browser-accessible WordPress GraphQL dependency.
- Keep preview and production credentials and targets separate.
- Use Bunny's current remote inventory for skip/prune comparisons; local release metadata is for audit and rollback, not remote truth.
- Require a dry-run and explicit authorization for destructive remote deletion.
- Preserve cross-post canonical overrides while making ordinary routes self-canonical.
- Never place real credentials, provider IDs that should remain private, or access tokens in Git.
- The user handles dashboard, registrar, and DNS actions that require their authenticated accounts; agents prepare exact values, commands, and verification.

## Current State Overview
Audit date: 2026-08-19.

- The static/CDN preview workflow works and has a durable operator runbook.
- Bunny uploads are concurrent and retried; unchanged media can be skipped against a fresh remote listing; `--force` is documented.
- Real uploads already require purge configuration and verify public root/index HTML after purge.
- Static checksum skipping for generated site files was deliberately rejected in the deploy-performance spike.
- Apex currently returns Vercel `DEPLOYMENT_NOT_FOUND` with HTTP 404.
- `www` currently reaches the same dead Vercel deployment and presents an expired certificate.
- Live `robots.txt` and `sitemap.xml` return the same 404.
- Case-study loop navigation remains client-only and cannot load on static output because public runtime GraphQL is intentionally blank.
- Production origin configuration, self-canonicals, `og:url`, robots, sitemap, production Bunny target, headers, redirects, rollback, and pruning remain open.

## Next Implementation Slice — 2026-08-20
Start with repository work that does not require production credentials or DNS changes. The first boundary is a fresh, self-contained production-shaped artifact whose public-origin metadata can be inspected locally:

1. Complete B's case-study loop-navigation prerendering and audit other client-only CMS fetches.
2. Complete C's single public-origin configuration, self-canonical/`og:url`, robots, sitemap, and inspection rules.
3. Generate from the public CMS, run `inspect:static`, and verify representative HTML/payloads in local static preview.
4. Only after that artifact passes, inventory account access and create the separate production Bunny storage/pull zones under A/D. Do not combine initial provider configuration with DNS cutover.

This ordering keeps the first pass reversible and locally testable. It also prevents production CDN configuration from masking an output defect that would exist on any host.

## To Do
### A. Resolve production decisions and access
- [ ] Confirm the apex host (`https://aslanfrench.work`) as canonical and `www` as a path-preserving permanent redirect.
- [ ] Inventory the current registrar/DNS provider, authoritative nameservers, apex and `www` records, TTLs, old Vercel project/hostname ownership, and who has access. Save operational values outside public docs when they expose account details.
- [ ] Record the current DNS values and dead Vercel behavior in a dated rollback note before changing anything.
- [ ] Confirm a separate production Bunny storage zone and pull zone rather than reusing the preview target. Record the intended public Bunny hostname and custom-hostname mapping without committing credentials.
- [ ] Decide whether initial launch uses a short pre-cutover TTL reduction and when it can safely return to a normal value.

### B. Make generated output self-contained
- [ ] Change case-study loop navigation so its collection is fetched during prerendering and serialized into each generated case-study route. Preserve lazy client behavior for ordinary SSR development only if it remains useful, but do not make static output depend on runtime GraphQL.
- [ ] Verify every generated case-study route renders previous and next cards in its HTML/payload and that both transition directions work in local static preview.
- [ ] Audit all remaining `server: false`, client-only, or post-mount CMS fetches on public routes for the same static self-containment failure mode.
- [ ] Generate from the public CMS and run `corepack pnpm inspect:static`; treat the resulting directory as the first production-candidate artifact only if it contains no local CMS/API references or missing media.

### C. Establish one public-origin and SEO model
- [ ] Replace the split/unused `STATIC_PUBLIC_SITE_URL` versus `NUXT_PUBLIC_SITE_URL` story with one documented production-generation input, or explicitly map one to the other in generation tooling.
- [ ] Make `useSiteSeoMeta` emit an absolute `og:url` and ordinary self-referential canonical based on the current route and configured public origin.
- [ ] Preserve the WordPress post `canonical_url` override for genuine cross-posts; it must replace, not duplicate, the ordinary self-canonical.
- [ ] Verify absolute featured-media/Open Graph image URLs after static media rewriting.
- [ ] Generate production `robots.txt` with the intended crawler policy and no accidental QA/dev indexing behavior.
- [ ] Generate a canonical-host sitemap containing fixed public routes, writing posts, and case studies while excluding `/dev/*`, QA-only content, error routes, and non-public payload files.
- [ ] Decide whether `/llms.txt` is useful at implementation time. Add it only if it provides maintained discovery value; otherwise mark the task dropped as non-blocking.
- [ ] Add automated inspection for canonical/`og:url`, robots, sitemap origin correctness, duplicate canonicals, and forbidden local origins.

### D. Define the production Bunny surface
- [ ] Create or configure the production storage zone and pull zone with least-privilege deployment credentials. Keep real values in ignored `.env.deploy` or shell configuration.
- [ ] Make production targeting difficult to confuse with preview: require an explicit `STATIC_DEPLOY_ENV=production`, the production pull-zone URL, and dry-run opt-out; reject contradictory or example values.
- [ ] Configure apex and `www` custom hostnames in Bunny without changing authoritative DNS yet, to the extent Bunny permits prevalidation.
- [ ] Configure the canonical apex origin and a path-preserving permanent `www` redirect. Verify redirect status and `Location`, not only final page rendering.
- [ ] Define cache policy by path class: revalidating HTML/extensionless routes, immutable hashed `_nuxt` assets, explicit fonts/static assets, and explicit WordPress media.
- [ ] Enable and verify Brotli or gzip for HTML, CSS, JavaScript, JSON, SVG, robots, and sitemap responses where supported.
- [ ] Configure and verify `X-Content-Type-Options`, `Referrer-Policy`, and frame protection. Evaluate CSP against authored embeds before enforcing it.
- [ ] Delay HSTS until apex/`www` HTTPS and redirect behavior have survived cutover; record the later enablement and chosen max-age as a separate gate.
- [ ] Add a real custom 404 response/behavior test for an unknown route rather than relying on provider defaults.

### E. Strengthen deploy verification and release records
- [ ] Extend public verification beyond root and `/index.html` to a representative fixed page, writing detail, case-study detail, referenced media asset, unknown route, robots, sitemap, apex canonical response, and `www` redirect.
- [ ] Verify HTML hashes or equivalent content identity after purge while allowing intentional host-level transformations such as compression.
- [ ] Add a small release metadata artifact containing a non-secret build identifier, generation timestamp, canonical origin, and content/file hashes suitable for diagnosing what is live.
- [ ] Preserve each successful production candidate's complete generated artifact plus release metadata in an ignored local release store with an explicit retention policy.
- [ ] Keep upload, purge, propagation retry, and public verification failures distinct in output and exit nonzero on any failed phase.

### F. Implement and rehearse rollback
- [ ] Document the difference between content rollback (redeploy prior artifact) and infrastructure rollback (restore recorded DNS/CDN values).
- [ ] Add or document an exact command that force-redeploys a selected previous release artifact, purges, and verifies it without regenerating from the current CMS.
- [ ] Rehearse a forward deploy and rollback against the production-shaped Bunny hostname before DNS cutover. Confirm the previous HTML and media become publicly observable again.
- [ ] Define what happens if upload succeeds but purge or verification fails; the operator must know whether to retry, roll back, or stop before DNS work.

### G. Add safe obsolete-file pruning
- [ ] List current remote production inventory and compare it to the complete generated-site inventory after a successful upload.
- [ ] Classify deletion candidates so generated HTML, payloads, and hashed assets are distinct from shared CMS media and provider-owned paths.
- [ ] Print the exact path/count/byte deletion plan in dry-run mode and make dry-run the default.
- [ ] Require an explicit pruning flag and reject broad/root targets, missing inventories, failed uploads, or unverified releases.
- [ ] Prune obsolete generated-site files only after the new release is uploaded and publicly verified; purge and re-verify afterward.
- [ ] Keep media pruning disabled initially unless a separately reviewed retention rule proves an object is unreferenced and recoverable.
- [ ] Verify that removing a post or case study no longer leaves its obsolete HTML/payload publicly reachable while unrelated routes and media remain intact.

### H. Rehearse the production candidate
- [ ] Back up the public CMS content and record the backup used for the candidate build.
- [ ] Generate fresh output from the public CMS, preview it locally, run `inspect:static`, and deploy it to the production-shaped Bunny hostname with no live-domain DNS change.
- [ ] Complete desktop and phone QA across Home, About, Side Projects, Writing archive/detail, multiple case studies, navigation loops, media/lightbox, custom audio/video, TOC/footnotes, redirects, 404, and featured-media transitions.
- [ ] Run accessibility and performance checks against warmed CDN output; investigate material regressions without treating a single score as the launch decision.
- [ ] Verify the production candidate contains no QA fixtures, dev routes in discovery files, local origins, broken CMS media, or preview host metadata.
- [ ] Verify response cache, compression, security, canonical, robots, sitemap, and redirect behavior with repeatable command-line checks.
- [ ] Rehearse rollback and then restore the approved candidate before authorizing cutover.

### I. Cut over the real domain
- [ ] Reconfirm the candidate release, release identifier, current DNS snapshot, rollback values, Bunny custom-host readiness, and valid apex/`www` certificates immediately before cutover.
- [ ] Update the apex and `www` DNS records deliberately; do not change unrelated mail or verification records.
- [ ] Verify authoritative DNS propagation, TLS validity, apex content identity, `www` path-preserving redirect, key routes, media, and discovery files from an external resolver/network.
- [ ] Check public responses for stale Vercel headers/content and remove obsolete Vercel domain attachment only after Bunny is stable.
- [ ] Monitor CDN errors and key routes during the initial propagation window; retain the previous DNS record and prior release artifact through the rollback window.
- [ ] Restore normal DNS TTLs after stability is established.
- [ ] Enable HSTS only after the HTTPS/redirect contract is stable and the user approves the lock-in.

### J. Close out production operations
- [ ] Update `skills/static-publish-runbook/SKILL.md` with production targeting, release artifact, rollback, pruning, and post-cutover verification procedures.
- [ ] Update `.env.deploy.example`, `README.md`, `AGENTS.md`, and package command documentation to match the actual production workflow without exposing secrets.
- [ ] Record any durable CDN/origin/rollback tradeoffs in `docs/decisions/` if they need authority beyond the runbook.
- [ ] Remove stale Vercel-specific configuration or documentation only after confirming it has no fallback value.
- [ ] Complete human launch QA, move all approved work to Done, fold durable lessons into project docs, and archive this spike.

## Ready for Human QA
None yet. This spike has been promoted and audited; implementation has not started.

## Done
- [x] Promote the old production-deploy scratch notes into an active conceptual/to-do pair and retire the scratch source. **Completed 2026-08-19:** reconciled the draft against the completed static-deploy and deploy-performance spikes, the current Bunny runbook, current source code, and a live-domain audit.
- [x] Reframe Bunny from one provider candidate among several to the settled production target unless setup reveals a concrete blocker. **Completed 2026-08-19:** the repo already has a proven Bunny generation/upload/purge/verification path; a second provider implementation would add risk without answering a launch need.
- [x] Remove the obsolete local-manifest upload-skip plan. **Completed 2026-08-19:** Bunny remote inventory remains authoritative for unchanged-media comparison. Release manifests are retained only as audit/rollback metadata, while generated static checksum skipping remains deliberately declined.
- [x] Establish the current live-domain baseline. **Completed 2026-08-19:** apex and discovery paths return a dead Vercel deployment 404; `www` reaches the same target and presents an expired certificate. These are explicit cutover inputs rather than hypothetical DNS questions.
