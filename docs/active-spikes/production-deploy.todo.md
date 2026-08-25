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
- Keep preview and production intent explicit. The initial launch reuses the proven Bunny zone by decision, so production-origin guards and ignored environment configuration—not a historical zone name—define the target.
- Use Bunny's current remote inventory for skip/prune comparisons; local release metadata is for audit and rollback, not remote truth.
- Require a dry-run and explicit authorization for destructive remote deletion.
- Preserve cross-post canonical overrides while making ordinary routes self-canonical.
- Never place real credentials, provider IDs that should remain private, or access tokens in Git.
- The user handles dashboard, registrar, and DNS actions that require their authenticated accounts; agents prepare exact values, commands, and verification.

## Current State Overview
Audit date: 2026-08-25.

- The static/CDN preview workflow works and has a durable operator runbook.
- Bunny uploads are concurrent and retried; unchanged media can be skipped against a fresh remote listing; `--force` is documented.
- Real uploads already require purge configuration and verify public root/index HTML after purge.
- Static checksum skipping for generated site files was deliberately rejected in the deploy-performance spike.
- `www.aslanfrench.work` now serves the production static release from Bunny over valid HTTPS; the apex returns a path- and query-preserving 301 to `www`.
- Live canonicals, `og:url`, featured-media `og:image`, robots, sitemap, and generated `llms.txt` use the canonical `www` origin.
- Case-study loop navigation now loads during prerender and the remaining speculative detail prefetch paths are inert in generated-static mode. A fresh generated artifact still needs to prove that every case-study route contains its loop navigation without runtime GraphQL.
- Production origin configuration, self-canonicals, `og:url`, robots, sitemap, `llms.txt`, target guards, real upload/purge, post-rewrite media verification, multi-route public verification, custom hostnames, SSL, and apex redirect are implemented and verified. Cache-class tuning, security headers, release records, rollback, pruning, and human launch QA remain open.

## Next Implementation Slice — 2026-08-20
Start with repository work that does not require production credentials or DNS changes. The first boundary is a fresh, self-contained production-shaped artifact whose public-origin metadata can be inspected locally:

1. Complete B's case-study loop-navigation prerendering and audit other client-only CMS fetches.
2. ~~Complete C's single public-origin configuration, self-canonical/`og:url`, robots, sitemap, and inspection rules.~~ Completed 2026-08-21.
3. ~~Generate from the public CMS and run `inspect:static` against a production-shaped artifact.~~ Completed 2026-08-21; representative interaction QA remains in Ready for Human QA.
4. ~~Inventory the existing Bunny/DreamHost surface and choose the launch target under A/D.~~ Completed 2026-08-25 by deliberately reusing the proven Bunny zone, configuring both custom hostnames, and moving DreamHost's apex/`www` records without touching mail DNS.

This ordering keeps the first pass reversible and locally testable. It also prevents production CDN configuration from masking an output defect that would exist on any host.

## To Do
### A. Resolve production decisions and access
- [x] Confirm the canonical hostname and redirect direction. **Completed 2026-08-21:** `https://www.aslanfrench.work` is canonical and the apex will permanently redirect to the matching `www` path. DreamHost remains authoritative for DNS and mail; the launch must not change nameservers or mail records.
- [ ] Inventory the current registrar/DNS provider, authoritative nameservers, apex and `www` records, TTLs, old Vercel project/hostname ownership, and who has access. Save operational values outside public docs when they expose account details.
- [x] Record the current DNS values and dead Vercel behavior in a dated rollback note before changing anything. **Completed 2026-08-25:** the pre-cutover state (dead Vercel apex/`www`, former apex A record, and former `www` Vercel CNAME) is preserved in this spike history and the conversation screenshots; no mail records were changed.
- [x] Decide whether to create a separate production Bunny target or reuse the proven zone. **Completed 2026-08-25:** the user chose the existing zone; the successful production publish reused its remote media inventory, while explicit production-origin validation now protects the target despite its historical preview name.
- [x] Decide whether initial launch uses a short pre-cutover TTL reduction and when it can safely return to a normal value. **Dropped 2026-08-25:** DNS cutover was completed directly through DreamHost before a separate TTL rehearsal was useful.

### B. Make generated output self-contained
- [x] Change case-study loop navigation so its collection is fetched during prerendering and serialized into each generated case-study route. **Implemented 2026-08-20:** the former near-footer `IntersectionObserver`, `server: false`, and deferred execution path are removed; case-study collection data now comes from awaited server-capable `useAsyncData` and enters the generated payload.
- [ ] Verify every generated case-study route renders previous and next cards in its HTML/payload and that both transition directions work in local static preview. **Artifact verification completed 2026-08-20:** all five generated case-study routes contain one rendered loop-navigation section in HTML and the `case-study-navigation` data key in their payload. Remaining: human/browser exercise of both transition directions against the static preview.
- [x] Audit all remaining `server: false`, client-only, or post-mount CMS fetches on public routes for the same static self-containment failure mode. **Completed 2026-08-20:** no other explicit client-only public CMS query remains. Home-surface and writing-archive prefetch were already static-aware; post/case-study shell, block, and viewport prefetch now share the same generated-static guard while retaining media warming.
- [x] Generate from the public CMS and run `corepack pnpm inspect:static`; treat the resulting directory as the first production-candidate artifact only if it contains no local CMS/API references or missing media. **Completed 2026-08-20:** fresh generation produced 501 files, found all 408 referenced media files, and reported no non-media local CMS/API references. The first run exposed an SSR-only orphan-footnote `requestAnimationFrame` rejection despite a zero exit; `OrphanSidenoteRenderer.vue` now refuses to schedule DOM collection outside the client, and the clean rerun completed without that rejection.

### C. Establish one public-origin and SEO model
- [x] Replace the split/unused `STATIC_PUBLIC_SITE_URL` versus `NUXT_PUBLIC_SITE_URL` story with one documented production-generation input, or explicitly map one to the other in generation tooling. **Completed 2026-08-21:** static generation reads `STATIC_PUBLIC_SITE_URL` from the shell or ignored `.env.deploy`; ordinary Nuxt development continues to use `NUXT_PUBLIC_SITE_URL`.
- [x] Make `useSiteSeoMeta` emit an absolute `og:url` and ordinary self-referential canonical based on the current route and configured public origin. **Completed 2026-08-21:** all 30 inspected public HTML pages emitted exactly one of each at `https://aslanfrench.work`.
- [x] Preserve the WordPress post `canonical_url` override for genuine cross-posts; it must replace, not duplicate, the ordinary self-canonical. **Completed 2026-08-21:** the production-shaped artifact retained 18 intentional external canonicals while keeping `og:url` on the public site route.
- [x] Verify absolute featured-media/Open Graph image URLs after static media rewriting. **Completed 2026-08-25:** the live representative case study emits a same-origin `https://www.aslanfrench.work/media/...` `og:image`, and the asset returns 200.
- [x] Generate production `robots.txt` with the intended crawler policy and no accidental QA/dev indexing behavior. **Completed 2026-08-21:** only a public-CMS build explicitly marked production allows crawling; other generated environments disallow all and also emit page-level `noindex`.
- [x] Generate a canonical-host sitemap containing fixed public routes, writing posts, and case studies while excluding `/dev/*`, QA-only content, error routes, and non-public payload files. **Completed 2026-08-21:** the inspected sitemap contains 30 canonical-host URLs, including `/now`, and no development routes.
- [x] Add `/llms.txt` as a maintained discovery surface. **Completed 2026-08-25:** static finalization builds it from the public route inventory and rendered page titles, while `inspect:static` rejects missing, off-origin, empty, or development-route output.
- [x] Enrich `/llms.txt` with a prose description of Aslan's practice and annotations for every linked public page. **Completed 2026-08-25:** the introductory context now draws from the published About material; annotations remain synchronized by reading each rendered route's SEO description, with maintained summaries for the homepage and writing archive; explicitly named QA documents are demoted to the standard `Optional` section.
- [x] Replace launch-era placeholder metadata with approved identity and editorial copy. **Completed 2026-08-25:** the global title suffix is `Aslan French`; Home and Writing have intentional titles/descriptions; four short case-study excerpts were sharpened in the public CMS; the pre-write CMS backup is `.backups/cms/content/2026-08-25T155659Z`.
- [x] Make missing metadata and content fallbacks explicitly describe their purpose. **Completed 2026-08-25:** blank strings now activate fallbacks, the rejected legacy tagline is absent from project source, production-facing code no longer uses lorem ipsum as fallback copy, and fresh About/testimonial/seed placeholders name the content they require.
- [x] Add basic homepage structured identity data. **Completed 2026-08-25:** generated homepage HTML contains a `Person` and `WebSite` JSON-LD graph for Aslan French at the canonical production origin.
- [x] Add automated inspection for canonical/`og:url`, robots, sitemap origin correctness, duplicate canonicals, and forbidden local origins. **Completed 2026-08-21:** `inspect:static` now fails on each of these conditions and passed the fresh artifact.

### D. Define the production Bunny surface
- [x] Configure the chosen production Bunny storage/pull-zone surface with ignored deployment credentials. **Completed 2026-08-25:** production uses the existing proven zone by explicit user decision; credentials remain only in ignored `.env.deploy`.
- [x] Make production targeting difficult to confuse with preview: require an explicit `STATIC_DEPLOY_ENV=production`, the production pull-zone URL, and dry-run opt-out; reject contradictory or example values. **Completed 2026-08-25:** production deploys reject local/example public origins and require canonical, pull-zone, and optional media origins to agree.
- [x] Configure apex and `www` custom hostnames in Bunny. **Completed 2026-08-25:** both names are attached with valid SSL.
- [x] Add both apex and `www` as Bunny custom hostnames, point DreamHost's `www` CNAME and apex ALIAS to the Bunny pull-zone hostname, activate SSL for both names, and configure a path-preserving permanent apex-to-`www` Bunny edge redirect. **Completed 2026-08-25:** a live query-bearing interior path returns HTTP 301 with the exact matching `www` `Location`.
- [ ] Define cache policy by path class: revalidating HTML/extensionless routes, immutable hashed `_nuxt` assets, explicit fonts/static assets, and explicit WordPress media.
- [x] Enable and verify Brotli or gzip for HTML, CSS, JavaScript, JSON, SVG, robots, and sitemap responses where supported. **Completed 2026-08-25:** live HTML, CSS, JavaScript, JSON, sitemap, and `llms.txt` negotiate gzip; the tiny robots response is served uncompressed, and the current release contains no SVG file to sample.
- [ ] Configure and verify `X-Content-Type-Options`, `Referrer-Policy`, and frame protection. Evaluate CSP against authored embeds before enforcing it.
- [ ] Delay HSTS until apex/`www` HTTPS and redirect behavior have survived cutover; record the later enablement and chosen max-age as a separate gate.
- [x] Add a real custom 404 response/behavior test for an unknown route rather than relying on provider defaults. **Completed 2026-08-25:** deploy verification requests a reserved missing path and requires HTTP 404.

### E. Strengthen deploy verification and release records
- [x] Extend public verification beyond root and `/index.html` to a representative fixed page, writing detail, case-study detail, referenced media asset, unknown route, robots, sitemap, canonical `www` response, and apex redirect. **Completed 2026-08-25:** the deploy now also verifies the writing archive, `llms.txt`, and a path/query-preserving production redirect.
- [x] Verify HTML hashes or equivalent content identity after purge while allowing intentional host-level transformations such as compression. **Completed 2026-08-25:** root, index, About, Writing, and representative writing/case-study detail responses must hash-match their local files after fetch decoding.
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
- [x] Back up the public CMS content and record the backup used for the candidate build. **Completed 2026-08-25:** candidate backup `.backups/cms/content/2026-08-25T070907Z` contains the database, uploads archive, and checksum manifest; normal retention pruned the oldest local backup.
- [x] Generate fresh output from the public CMS, preview it locally, run `inspect:static`, and deploy it to Bunny. **Completed 2026-08-25:** 501 generated files passed local route/404 smoke tests and full inspection, then real upload, cache purge, and expanded public verification.
- [ ] Complete desktop and phone QA across Home, About, Side Projects, Writing archive/detail, multiple case studies, navigation loops, media/lightbox, custom audio/video, TOC/footnotes, redirects, 404, and featured-media transitions.
- [ ] Run accessibility and performance checks against warmed CDN output; investigate material regressions without treating a single score as the launch decision.
- [ ] Verify the production candidate contains no QA fixtures, dev routes in discovery files, local origins, broken CMS media, or preview host metadata.
- [ ] Verify response cache, compression, security, canonical, robots, sitemap, and redirect behavior with repeatable command-line checks. **Partial 2026-08-25:** HTML revalidation, gzip, canonical/discovery output, 404, and redirect behavior pass; cache policy for other path classes and baseline security headers remain open.
- [ ] Rehearse rollback and then restore the approved candidate before authorizing cutover.

### I. Cut over the real domain
- [ ] Reconfirm the candidate release, release identifier, current DNS snapshot, rollback values, Bunny custom-host readiness, and valid apex/`www` certificates immediately before cutover.
- [x] Update the apex and `www` DNS records deliberately; do not change unrelated mail or verification records. **Completed 2026-08-25:** DreamHost now uses an apex ALIAS and `www` CNAME to Bunny; professional-email MX and authentication records were preserved.
- [x] Verify authoritative DNS propagation, TLS validity, apex redirect, key routes, media, and discovery files from the public network. **Completed 2026-08-25:** both certificates are valid, `www` content responds through Bunny, representative routes/media/discovery pass, and apex preserves path/query in its 301.
- [x] Check public responses for stale Vercel headers/content. **Completed 2026-08-25:** public responses are served by Bunny and no stale Vercel response remains. Removing any obsolete Vercel dashboard attachment is optional cleanup because DNS no longer targets it.
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
- B. Exercise both case-study loop-navigation transition directions in local static preview and confirm no browser GraphQL request. The generated HTML/payload and static inspection portions have passed.
- H. Complete desktop and phone visual/interaction QA on the live `www` release, especially route transitions, case-study loops, media/lightbox, TOC/footnotes, and the construction/motion controls.
- H. Decide whether the two public-CMS test posts (`image-resizing-test-doc` and `footnote-qa-all-combinations`) should remain published. If not, draft them in the public CMS and publish again so discovery output no longer includes them.
- C. Review `/dev/social-page` and `apps/frontend/public/images/social-card-default.png` at full size. Confirm the exact Bodoni Z37 and IBM Plex Mono typography, title/sentence casing, hierarchy, palette, and generated signal texture before the captured asset is wired into default Open Graph metadata.

## Done
- [x] C. Review the generated 1200×630 default social-card candidate. It remains outside the repository and is not connected to page metadata; approval is required before it becomes the bundled fallback Open Graph image. **Superseded 2026-08-25:** the generated typography was only a Bodoni-like approximation. The useful generated material was retained as a text-free signal texture, while the candidate moved to a deterministic `/dev/social-page` composition using the real site fonts and palette.
- [x] Promote the old production-deploy scratch notes into an active conceptual/to-do pair and retire the scratch source. **Completed 2026-08-19:** reconciled the draft against the completed static-deploy and deploy-performance spikes, the current Bunny runbook, current source code, and a live-domain audit.
- [x] Reframe Bunny from one provider candidate among several to the settled production target unless setup reveals a concrete blocker. **Completed 2026-08-19:** the repo already has a proven Bunny generation/upload/purge/verification path; a second provider implementation would add risk without answering a launch need.
- [x] Remove the obsolete local-manifest upload-skip plan. **Completed 2026-08-19:** Bunny remote inventory remains authoritative for unchanged-media comparison. Release manifests are retained only as audit/rollback metadata, while generated static checksum skipping remains deliberately declined.
- [x] Establish the current live-domain baseline. **Completed 2026-08-19:** apex and discovery paths return a dead Vercel deployment 404; `www` reaches the same target and presents an expired certificate. These are explicit cutover inputs rather than hypothetical DNS questions.
- [x] Produce and inspect the first locally verifiable production-shaped metadata artifact. **Completed 2026-08-21:** generation at `https://aslanfrench.work` produced 500 files; inspection checked 30 HTML pages and 30 sitemap URLs, retained 18 intentional external canonicals, found all 408 referenced media files, and reported no canonical/discovery failures or non-media local CMS/API references.
