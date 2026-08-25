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

## Current State Audit — 2026-08-25
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
- A fresh production-shaped public-CMS build on 2026-08-21 passed inspection across 30 HTML pages and 30 sitemap URLs, preserved 18 intentional external canonicals, found all 408 referenced media files, and contained no non-media local CMS/API references.
- Static finalization generates `llms.txt` from the same public route inventory and rendered page titles as the sitemap, and inspection rejects missing, off-origin, or development links in it.
- Production deploy configuration rejects local/example origins and contradictory canonical, pull-zone, or media origins.

### What is live
- `https://www.aslanfrench.work` serves the generated static release from Bunny over valid HTTPS.
- `https://aslanfrench.work/*` returns a path- and query-preserving HTTP 301 to the canonical `www` hostname through a host-scoped Bunny edge rule.
- The live release allows crawling, publishes canonical-host `sitemap.xml` and generated `llms.txt`, emits `www` canonical and `og:url` metadata, and rewrites featured-media/Open Graph images to same-origin `/media/*` URLs.
- The 2026-08-25 production publish backed up the public CMS, generated and locally previewed 501 static files, inspected 30 HTML routes and 408 referenced media files, uploaded the release, purged Bunny, and passed automated public verification for representative routes, discovery files, media, a true 404, and the apex redirect.

### What is not production-operations-ready
- Case-study loop navigation is present in generated HTML/payloads, but both transition directions still need human exercise against a static preview.
- The public CMS currently exposes two clearly QA-oriented writing routes (`image-resizing-test-doc` and `footnote-qa-all-combinations`). They are consequently present in the sitemap and `llms.txt`; the user needs to decide whether to draft them before the release can claim no public QA fixtures.
- Hashed asset/media cache policy and baseline security headers remain unconfigured; HTML revalidation and gzip across representative compressible response classes are verified.
- Release records, rollback rehearsal, and safe obsolete-file pruning remain open.

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

The default social card is a deterministic browser composition rather than generated typography. `/dev/social-page` renders the real site font files, palette tokens, and layout at 1200×630; generated imagery may supply text-free texture only. Capture the approved composition with `corepack pnpm capture:social-card` while the frontend is running, then wire the resulting asset into metadata only after human visual approval.

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

- `www.aslanfrench.work` serves the intended Bunny-hosted static release over valid HTTPS and the apex redirects consistently
- every intended route is self-contained, including case-study previous/next navigation
- public canonical, Open Graph, robots, and sitemap output is correct and contains no local CMS/API origins
- cache, compression, redirect, and baseline security headers are verified from public responses
- the production deploy reports upload, purge, and multi-route public verification as distinct successful phases
- a previous release can be restored through a documented, rehearsed procedure
- obsolete generated routes have a safe reviewed pruning path
- the durable runbook and project docs describe the real production workflow
