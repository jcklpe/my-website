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

## Current State Audit — 2026-08-19
### What already works
- Public and QA WordPress environments can generate explicit static route sets.
- Static output finalization copies Nuxt/public assets and rejects missing local asset references.
- `inspect:static` checks output shape, media, and local runtime URL leakage before deployment.
- The Bunny deploy has dry-run protection, bounded concurrent uploads, bounded retry, media checksum skipping against Bunny's actual remote inventory, an explicit `--force` mode, cache purge, and public root/index verification.
- Preview HTML is required to revalidate in the browser; deploy success already requires both purge and public verification.
- A real preview deploy confirmed that the optimized path is substantially faster.

### What is not production-ready
- `https://aslanfrench.work` currently reaches Vercel but returns `DEPLOYMENT_NOT_FOUND` with HTTP 404.
- `https://www.aslanfrench.work` reaches the same dead Vercel target and currently presents an expired TLS certificate.
- `/robots.txt` and `/sitemap.xml` are not available on the live origin.
- `runtimeConfig.public.siteUrl` reads `NUXT_PUBLIC_SITE_URL`, while the deploy example currently advertises a separate `STATIC_PUBLIC_SITE_URL` value that is not wired into generated metadata. The production origin needs one clear source of truth.
- `useSiteSeoMeta` emits title, description, Open Graph, and Twitter metadata, but not a public `og:url` or site-wide self-referential canonical. Writing posts can intentionally override canonical with their CMS `canonical_url` when genuinely cross-posted.
- The public asset tree has no generated `robots.txt` or sitemap.
- Case-study loop navigation was moved on 2026-08-20 from a near-footer client-only fetch to awaited prerender data, and speculative detail prefetch now stops in generated-static mode. A fresh production-shaped artifact still needs to verify that every case-study payload contains its previous/next collection without runtime WordPress access.
- Production Bunny zones, hostname mapping, cache/header behavior, rollback, remote pruning, and cutover ownership are not yet documented or rehearsed.

The existing `.output/public` directory is useful for local inspection but is not assumed to be a fresh production candidate. Launch verification must begin from a newly generated public-CMS build.

## Settled Architecture
### Delivery target
Bunny Storage plus a Bunny Pull Zone is the production target unless a concrete blocker appears during setup. It is the only static host path already implemented and proven by this repo. Do not spend this spike building provider-neutral abstractions or parallel Cloudflare/Pages implementations.

Use separate production and preview targets. Prefer a separate production storage zone and pull zone, rather than relying only on path prefixes in one preview zone. This reduces accidental overwrite and makes the first production publish a clean inventory. The existing Vultr/Caddy SSR path remains the emergency architectural fallback, not the routine production path.

### Canonical host
The proposed canonical origin is `https://aslanfrench.work`, with `https://www.aslanfrench.work/*` permanently redirecting to the matching apex path. Confirm this before configuration, then use it consistently for generated URLs, sitemap entries, Open Graph URLs, CDN hostname setup, and verification.

### Publishing authority
The generated directory is the release artifact. Bunny's remote inventory is authoritative for deciding whether a remote media object already exists; a local manifest must not become upload-skip authority because it can drift after interrupted deploys, manual changes, or publishes from another machine.

A release manifest is still useful as immutable metadata for a completed build and for rollback. Keep those roles distinct:

- remote inventory answers “what is deployed now?”
- the generated artifact plus release metadata answers “what did this successful release contain?”
- neither permits destructive deletion without a reviewed plan

### Rollback model
The first practical rollback model should be artifact-based: retain the previous successful generated output and its release metadata locally, redeploy that complete artifact with force mode, purge the pull zone, and run public verification again. DNS rollback is reserved for CDN/hostname failure, not ordinary bad content.

Do not claim rollback readiness until that path has been rehearsed against the production-shaped target. If retaining release artifacts locally proves too fragile, replace it with versioned release storage and an explicit activation mechanism; do not merely keep a manifest that cannot reconstruct the files.

### Remote pruning
Pruning is the destructive half of incremental publishing and stays in this spike. It must compare a fresh Bunny remote listing to the complete local release, present the exact deletion set in dry-run form, protect provider/system paths and shared media, and require an explicit destructive flag. Upload and public verification should succeed before deletion is considered.

A separate clean production zone means pruning does not block the first launch. It does matter for later removed routes: leaving obsolete HTML publicly reachable indefinitely is not an acceptable long-term policy. Media pruning should initially be more conservative than generated-site pruning because CMS media can outlive its current references.

## Public Metadata And Discovery
Production generation needs one public-origin configuration that drives absolute URL output. Use it to add:

- site-wide self-referential canonical URLs, except where a writing post deliberately supplies its cross-post canonical
- `og:url` values
- a production `robots.txt` policy
- a sitemap containing every intended public fixed route, post, and case study at the canonical host

An `/llms.txt` file remains optional. Re-evaluate the convention when implementing discovery files; it is not crawler access control and cannot block launch.

Development and QA surfaces must not accidentally advertise production canonicals or become indexable. Dev-only routes such as `/dev/motion` must stay out of the sitemap.

## Cache, Compression, And Security Contract
Treat browser caching and Bunny edge caching separately.

- HTML and extensionless routes must revalidate in the browser after a publish.
- Hashed `_nuxt` assets may be long-lived and immutable.
- Fonts and stable public assets should have explicit long-lived policies appropriate to whether their filenames are versioned.
- Media should have an explicit long-lived policy, with replacement semantics understood for WordPress URLs.
- Brotli or gzip should be verified on compressible text responses.
- Baseline production headers should include `X-Content-Type-Options` and `Referrer-Policy`, plus frame protection through CSP `frame-ancestors` or an equivalent header.
- HSTS should be enabled only after apex and `www` HTTPS and redirects are stable. CSP should begin conservatively, preferably report-only if the final policy is not yet proven against WordPress-authored embeds and third-party media.

Header verification belongs in deploy QA. A dashboard setting is not evidence until the public response shows it.

## Launch Shape
The launch should move through explicit gates:

1. Correct the self-contained static output and public metadata.
2. Create and configure a production-shaped Bunny target without changing live DNS.
3. Deploy a fresh public-CMS build, inspect it, and complete browser/device QA through the Bunny hostname.
4. Rehearse bad-release rollback and validate cache/header behavior.
5. Record current DNS, lower TTL if useful, connect the custom hostnames, provision HTTPS, and configure the `www` redirect.
6. Change DNS deliberately and verify the apex and `www` paths from outside the local environment.
7. Monitor the first release, retain the prior state, and only then enable irreversible or difficult-to-reverse policy such as HSTS.

The current dead Vercel target should still be recorded before replacement so rollback and cleanup are based on known values rather than memory.

## Non-Goals
- Moving WordPress to a public production server.
- Replacing the explicit publish workflow with automatic CI/CD.
- Building a provider abstraction or a second static host implementation without a Bunny blocker.
- Reopening the deploy-performance decision to checksum-skip generated HTML/assets. Those files remain cheap to upload, and URL rewriting makes stale-skip mistakes disproportionately risky.
- Treating Lighthouse as the only launch acceptance test.
- Solving analytics, IndieWeb, ActivityPub, or unrelated animation work in this spike.

## Success Criteria
The spike is complete when:

- `aslanfrench.work` serves the intended Bunny-hosted static release over valid HTTPS and `www` redirects consistently
- every intended route is self-contained, including case-study previous/next navigation
- public canonical, Open Graph, robots, and sitemap output is correct and contains no local CMS/API origins
- cache, compression, redirect, and baseline security headers are verified from public responses
- the production deploy reports upload, purge, and multi-route public verification as distinct successful phases
- a previous release can be restored through a documented, rehearsed procedure
- obsolete generated routes have a safe reviewed pruning path
- the durable runbook and project docs describe the real production workflow
