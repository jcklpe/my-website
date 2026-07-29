# Production Deploy Notes
This is a scratch planning stub for the eventual public launch work. It is intentionally separate from the archived static-deploy spike docs.

The static-deploy spike proved the local/static/CDN preview path: generate from WordPress, preview static output locally, upload static files and referenced media to Bunny, and purge the preview pull-zone cache. Production deploy is the next layer: real domain, real metadata, real cache/header policy, and launch operations.

The preview cache-correctness repair also exposed the next operational layer. The current deploy uploads the complete generated site and all referenced media on every publish, even when most files are unchanged. That is acceptable for preview correctness, but production deploy should add a content-diff or manifest-based sync so routine publishes upload only changed files and deliberately remove obsolete files.

## Goal
Make `aslanfrench.work` serve the public static site from a production CDN/static host without making the local authoring workflow more fragile.

The expected shape is:

- WordPress remains the authoring tool
- local development keeps Nuxt SSR/Vite HMR
- static generation remains an explicit publish step
- the production site is static/CDN-served
- the production domain is updated only after local preview and CDN preview have passed

## Out Of Scope For The Static-Deploy Spike
These items are deferred here rather than continuing to expand the static-deploy spike:

- DNS and custom-domain setup
- production Bunny pull zone or alternate provider target
- production SSL/HTTPS configuration
- canonical URLs and redirects
- sitemap and robots policy
- Open Graph/social metadata verification
- production security headers
- final cache-control policy for HTML, Nuxt assets, fonts, and media
- rollback procedure after a bad deploy
- launch checklist

## Provider Notes
Bunny is the working prototype provider. Keep the production plan provider-aware but not provider-entangled:

- Bunny Storage/Pull Zone is the first production candidate
- Cloudflare Pages remains a practical fallback
- Codeberg Pages remains values-aligned but likely needs separate media hosting
- Vultr/Caddy remains the SSR fallback/control path if static hosting becomes more trouble than it is worth

Do not build a provider-neutral abstraction until a second real provider implementation exists. Scripts and docs can isolate provider-specific behavior well enough for now.

## Security And Secrets
Production deploy must not put credentials in Git.

Rules:

- real deploy credentials stay in ignored local env files, shell env, or future CI secrets
- `.env.deploy.example` remains example-only
- production API tokens should be least-privilege where the provider supports it
- leaked tokens should be revoked and rotated before another deploy
- production domain launch should include a secrets audit before DNS changes

## DNS And Domain Questions
To resolve later:

- whether `aslanfrench.work` points directly at Bunny or through another DNS provider
- whether `www.aslanfrench.work` redirects to apex or the other way around
- whether preview/staging gets a named subdomain before production launch
- how long DNS TTLs should be during first cutover
- what rollback means if DNS or CDN configuration is wrong

## Header And Cache Policy
The preview CDN header check was part of the static-deploy spike. Production policy belongs here.

Future production checks should verify:

- HTML documents do not stay stale too long after a manual publish
- hashed `_nuxt` assets can use long-lived immutable caching
- media has an explicit cache policy
- text assets are compressed with Brotli or gzip
- `X-Content-Type-Options` is present
- `Referrer-Policy` is present
- frame protection is present through CSP `frame-ancestors` or equivalent
- HSTS is enabled only after HTTPS/domain setup is stable
- CSP starts carefully, likely report-only first

Keep browser and edge caching as separate policies. HTML and extensionless routes should revalidate with the browser after every publish, while versioned Nuxt assets may remain immutable. A successful deploy must purge the relevant CDN cache and then verify public HTML against the just-generated local output; a successful upload alone is not proof that visitors are receiving the new build.

## Publish Mechanics And Versioning
Production deploy should address the limitations of the current complete-upload preview workflow:

- create a local deploy manifest containing paths, sizes, and content hashes
- compare the new manifest with the last successfully published manifest
- upload only new or changed files
- remove files that existed in the previous manifest but are absent from the new build, with a dry-run/list step before deletion
- avoid re-uploading unchanged WordPress media on every deploy
- give each successful publish a build identifier that can be checked in public HTML or a small deployment metadata file
- retain the previous successful manifest and enough provider state to support a bounded rollback
- make upload, purge, and public verification separate reported phases so a partial failure is diagnosable
- keep retries bounded and distinguish temporary CDN propagation from a genuine content mismatch

Do not optimize by weakening verification. Incremental sync should reduce transfer work while the final public hash/header checks remain authoritative.

## Launch Checklist Draft
- generate static output from the public CMS
- preview locally
- run `corepack pnpm inspect:static`
- deploy to CDN preview
- confirm the deploy reports upload/sync, purge, and public verification as separate successful phases
- verify the public build identifier or HTML hash matches the generated output
- hard-refresh key routes on desktop
- hard-refresh key routes on phone
- run Lighthouse against warmed CDN preview
- verify images/media load from the public media path
- verify no local CMS/API URLs are present in generated public output
- verify production DNS target and SSL state
- switch DNS or production target deliberately
- verify production routes after cutover
- keep the previous working deploy available long enough to roll back
