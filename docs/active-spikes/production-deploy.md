# Production Deploy
Continues from: docs/archive/static-deploy.md
Continues from: docs/archive/deploy-performance.md

This spike takes the static publishing path that already works in preview and turns it into the production delivery system for `aslanfrench.work`. It is a launch-and-operations spike, not a new hosting architecture spike: WordPress remains local authoring infrastructure, Nuxt remains the local SSR/Vite development surface, and publication remains an explicit static generation, inspection, preview, and CDN deploy operation.

## Why This Spike Exists
The static-deploy spike proved that the site can be generated from WordPress, inspected locally, uploaded with its referenced media to Bunny, purged, and verified through a CDN preview. The deploy-performance follow-up made that loop fast enough for routine use by adding bounded concurrency, retry, remote checksum comparison for media, and an explicit force-upload escape hatch.

Production adds a different class of responsibility:

- the real domain and HTTPS must point at the intended build
- generated metadata must describe the real public origin
- discovery, redirects, headers, and cache behavior must be deliberate
- a publish must be recoverable when the output or CDN configuration is wrong
- removed routes and obsolete remote files need a safe lifecycle
- the final cutover must be rehearsed and observable rather than improvised in DNS

The canonical operator workflow remains `skills/static-publish-runbook/SKILL.md`. This spike may extend that runbook, but should not duplicate it.

## Current State Audit — 2026-08-26
### What already works
- Public and QA WordPress environments can generate explicit static route sets.
- Static output finalization copies Nuxt/public assets and rejects missing local asset references.
- `inspect:static` checks output shape, media, and local runtime URL leakage before deployment.
- The Bunny deploy has dry-run protection, bounded concurrent uploads, bounded retry, media checksum skipping against Bunny's actual remote inventory, an explicit `--force` mode, cache purge, and public root/index verification.
- Preview HTML is required to revalidate in the browser; deploy success already requires both purge and public verification.
- A real preview deploy confirmed that the optimized path is substantially faster.

### What the production-shaped artifact now proves
- Static generation reads `STATIC_PUBLIC_SITE_URL` as its single public-origin input and exposes the deploy environment separately from ordinary Nuxt development configuration.
- `useSiteSeoMeta` emits one self-canonical and one absolute `og:url` per public route while preserving intentional external writing canonicals as replacements.
- Static finalization emits environment-aware `robots.txt` and a canonical-host sitemap, excludes `/dev/*`, and includes the `/now` mirror route.
- `inspect:static` rejects missing local assets, duplicate/missing canonicals and `og:url`, forbidden origins, incorrect discovery policy, and sitemap-origin/dev-route errors.
- A fresh production public-CMS build on 2026-08-26 passed inspection across 28 HTML pages and 28 sitemap URLs, preserved 18 intentional external canonicals, found all 406 referenced media files, and contained no non-media local CMS/API references.
- Static finalization generates `llms.txt` from the same public route inventory and rendered page titles as the sitemap, and inspection rejects missing, off-origin, or development links in it.
- Production deploy configuration rejects local/example origins and contradictory canonical, pull-zone, or media origins.

### What is live
- `https://www.aslanfrench.work` serves the generated static release from Bunny over valid HTTPS.
- `https://aslanfrench.work/*` returns a path- and query-preserving HTTP 301 to the canonical `www` hostname through a host-scoped Bunny edge rule.
- The live release allows crawling, publishes canonical-host `sitemap.xml` and generated `llms.txt`, emits `www` canonical and `og:url` metadata, and rewrites featured-media/Open Graph images to same-origin `/media/*` URLs.
- The 2026-08-26 production publish backed up both CMS environments, moved the two QA-only writing fixtures into QA, generated and locally previewed 501 static files, inspected 28 HTML routes and 406 referenced media files, uploaded the release, purged Bunny, and passed automated public verification for representative routes, discovery files, the default social card, cache classes, security headers, media, a true 404, and the apex redirect.
- Current release `20260826T045741Z-97a9a825fac1` is retained with its complete post-rewrite artifact, compact public `release.json`, and ignored per-file SHA-256 manifest. The immediately preceding verified release is also retained; the artifact-only rollback command was rehearsed against production without reading WordPress and restored its selected artifact successfully.

### What remains open
- Broader desktop/phone visual QA remains user-owned and proceeds independently of this engineering pass.
- HSTS remains an optional, separately approved hardening step rather than a launch requirement. It does not replace HTTPS: HTTPS encrypts and authenticates each connection, while an HSTS response tells a browser that has already reached the site securely to upgrade future HTTP attempts and refuse certificate-error bypasses for the declared duration. That closes a real downgrade window, but this site has no login, session, payment, or private account surface, so the incremental benefit is modest and does not justify enabling a long-lived policy casually. Warmed accessibility/performance auditing is routed to `docs/scratch/wcag-seo2.md` rather than duplicated here.

The approved 2026-08-26 pruning plan removed 2,218 obsolete generated-site objects totaling 26.27 MiB, purged Bunny, reverified the current root, and confirmed a representative retired route returned 404. `/media/` and provider/system paths were excluded. Both former public QA writing URLs now return 404 while their content remains available in the QA CMS.

The existing `.output/public` directory is useful for local inspection but is not assumed to be a fresh production candidate. Launch verification must begin from a newly generated public-CMS build.

## Settled Architecture
### Delivery target
Bunny Storage plus a Bunny Pull Zone is the production target unless a concrete blocker appears during setup. It is the only static host path already implemented and proven by this repo. Do not spend this spike building provider-neutral abstractions or parallel Cloudflare/Pages implementations.

The initial production launch deliberately reuses the already proven Bunny storage zone and pull zone rather than creating a parallel target. This reduced setup work and preserved the remote media inventory that powers checksum skipping; explicit production-origin validation now prevents placeholder or cross-origin production publishes. The historical zone name is not deployment authority: the ignored environment configuration and verified custom hostname define the target. Revisit a separate production zone only if operational isolation becomes more valuable than the existing inventory and simpler single-zone workflow. The existing Vultr/Caddy SSR path remains the emergency architectural fallback, not the routine production path.

### Canonical host
The canonical origin is `https://www.aslanfrench.work`, with `https://aslanfrench.work/*` permanently redirecting to the matching `www` path. This was settled 2026-08-21 because Bunny accepts a normal `www` CNAME while DreamHost can keep authoritative DNS and all existing mail records. Add both hostnames to the same Bunny pull zone, point DreamHost's `www` CNAME and apex ALIAS to the Bunny hostname, activate Bunny SSL for both, and enforce the apex-to-`www` redirect with a host-scoped Bunny edge rule. Do not move nameservers or alter MX, SPF, DKIM, DMARC, or mail-related CNAME records for the web launch.

### Publishing authority
The generated directory is the release artifact. Bunny's remote inventory is authoritative for deciding whether a remote media object already exists; a local manifest must not become upload-skip authority because it can drift after interrupted deploys, manual changes, or publishes from another machine.

A release manifest is still useful as immutable metadata for a completed build and for rollback. Keep those roles distinct:

- remote inventory answers “what is deployed now?”
- the generated artifact plus release metadata answers “what did this successful release contain?”
- neither permits destructive deletion without a reviewed plan

### Rollback model
The practical rollback model is artifact-based: retain each successful generated output and its release metadata locally, validate every stored file, redeploy that complete artifact, purge the pull zone, and run public verification again. DNS rollback is reserved for CDN/hostname failure, not ordinary bad content.

The first production artifact-only redeploy rehearsal passed on 2026-08-26. The local policy keeps the five newest unpinned verified releases; a `PINNED` marker exempts a release from retention. Failed deploys never enter the store, and CMS backups remain separate. If retaining artifacts locally proves too fragile, replace it with versioned release storage and an explicit activation mechanism; do not fall back to keeping manifests that cannot reconstruct the files.

### Remote pruning
Pruning is the destructive half of incremental publishing and stays in this spike. It must compare a fresh Bunny remote listing to the complete local release, present the exact deletion set in dry-run form, protect provider/system paths and shared media, and require an explicit destructive flag. Upload and public verification should succeed before deletion is considered.

Because production reuses the historical preview zone, the first dry run found accumulated hashed assets and QA routes from earlier builds. Pruning did not block launch, but obsolete HTML should not remain publicly reachable indefinitely. Media pruning remains disabled because CMS media can outlive its current references and needs a separately reviewed lifecycle.

## Public Metadata And Discovery
Production generation needs one public-origin configuration that drives absolute URL output. Use it to add:

- site-wide self-referential canonical URLs, except where a writing post deliberately supplies its cross-post canonical
- `og:url` values
- a production `robots.txt` policy
- a sitemap containing every intended public fixed route, post, and case study at the canonical host

The production `/llms.txt` is generated from the same public route inventory as the sitemap and includes maintained prose about Aslan's practice plus route-level annotations. It is a discovery aid, not crawler access control and not a launch dependency.

Development and QA surfaces must not accidentally advertise production canonicals or become indexable. Dev-only routes such as `/dev/motion` must stay out of the sitemap.

The default social card is a deterministic browser composition rather than generated typography. `/dev/social-page` renders the real site font files, palette tokens, and layout at 1200×630; generated imagery supplies text-free texture only. The approved capture is bundled at `/images/social-card-default.png`, and ordinary pages use it as the default Open Graph and Twitter image while detail pages may override it with featured media.

## Cache, Compression, And Security Contract
Treat browser caching and Bunny edge caching separately.

- HTML and extensionless routes must revalidate in the browser after a publish.
- Hashed `_nuxt` assets cache for one year in both browser and edge.
- Fonts cache for 30 days in both browser and edge.
- Bundled `/images` and WordPress `/media` cache for seven days in the browser and 30 days at the edge, retaining practical replacement semantics for stable URLs.
- Brotli or gzip should be verified on compressible text responses.
- Baseline production headers are `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Frame-Options: SAMEORIGIN`.
- HSTS is optional defense in depth after apex and `www` HTTPS and redirects are stable. If enabled, start with an intentionally short `max-age`, omit `includeSubDomains` and preload, verify public behavior, and lengthen it only by a separate decision. CSP should begin conservatively, preferably report-only if the final policy is not yet proven against WordPress-authored embeds and third-party media.

Header verification belongs in deploy QA. A dashboard setting is not evidence until the public response shows it.

## Launch Shape
The completed launch moved through explicit gates:

1. Correct the self-contained static output and public metadata.
2. Create and configure a production-shaped Bunny target without changing live DNS.
3. Deploy a fresh public-CMS build, inspect it, and begin browser/device QA through the Bunny hostname.
4. Rehearse bad-release rollback and validate cache/header behavior.
5. Record current DNS, consider a temporary TTL reduction, connect the custom hostnames, provision HTTPS, and configure the `www` redirect. The TTL reduction was declined, so no later restoration was needed.
6. Change DNS deliberately and verify the apex and `www` paths from outside the local environment.
7. Monitor the first release and retain the prior state. HSTS remains a separate optional hardening choice rather than an unfinished cutover task.

The former dead Vercel target was recorded before replacement so rollback and cleanup were based on known values rather than memory. No active Vercel configuration remains in the repository.

## Non-Goals
- Moving WordPress to a public production server.
- Replacing the explicit publish workflow with automatic CI/CD.
- Building a provider abstraction or a second static host implementation without a Bunny blocker.
- Reopening the deploy-performance decision to checksum-skip generated HTML/assets. Those files remain cheap to upload, and URL rewriting makes stale-skip mistakes disproportionately risky.
- Treating Lighthouse as the only launch acceptance test.
- Solving analytics, IndieWeb, ActivityPub, or unrelated animation work in this spike.

## Success Criteria
The spike is complete when:

- `www.aslanfrench.work` serves the intended Bunny-hosted static release over valid HTTPS and the apex redirects consistently
- every intended route is self-contained, including case-study previous/next navigation
- public canonical, Open Graph, robots, and sitemap output is correct and contains no local CMS/API origins
- cache, compression, redirect, and baseline security headers are verified from public responses
- the production deploy reports upload, purge, and multi-route public verification as distinct successful phases
- a previous release can be restored through a documented, rehearsed procedure
- obsolete generated routes have a safe reviewed pruning path
- the durable runbook and project docs describe the real production workflow
