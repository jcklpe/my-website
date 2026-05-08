# Static Deploy Notes

## The Goal

The public website should be able to run as static files on a CDN.

WordPress should remain the authoring tool. Nuxt should remain the frontend codebase. Local development should keep the fast loop we have now: Docker runs WordPress, Nuxt runs on the host, Sass/Vue changes hot-reload in the browser, and content can be previewed locally before anything public changes.

The change is about the **public delivery model**. Instead of every public request depending on a live Nuxt SSR server and live WordPress GraphQL responses, the publish step should render the public site ahead of time, upload the generated files, and let a static host/CDN serve them.

The desired first version is explicit and manual, and it does not have to publish to the real public domain yet:

1. edit content in WordPress locally
2. preview locally
3. run one publish command from the repo
4. generate the static site from the current WordPress content
5. preview the generated static output locally
6. when ready, deploy the generated output to a static host/CDN

This avoids the brittle-feeling version of manual deploys: no logging into a dashboard and uploading a zip by hand. But it also avoids the complexity of automatically deploying every WordPress save before we know exactly what the production workflow should feel like.

The first useful milestone is therefore **local static publish confidence**, not a public launch. The site can learn to generate, preview, and package itself before the real domain points anywhere.

## Why This Belongs After Prefetching

The prefetching spike made the current SSR/dev experience feel much better, but its final QA exposed a different class of performance issue:

- local dev mode has Vite module/style request noise
- WordPress GraphQL cache hits still boot WordPress/PHP before returning cached data
- image/media payloads dominate much of the real network weight
- Lighthouse dev-mode numbers mix real issues with dev-server artifacts

Prefetching can hide some latency during client navigation. It cannot remove the public runtime dependency on WordPress and Nuxt SSR. Static generation can.

If most public pages are authored content and browsing surfaces, they are good candidates for prerendering. The site is not primarily an authenticated app or live dashboard. It is a portfolio, writing archive, and content system. That makes static delivery conceptually appropriate.

## SSR, Static Generation, And Local Development

SSR and static generation are related, but they are not the same delivery model.

With SSR, Nuxt renders HTML on request. A public server process must be running, and dynamic routes can ask WordPress for data when the request arrives.

With static generation, Nuxt renders HTML and payload files at publish time. The public host serves those files directly. There is no public Nuxt server process required for already-generated routes, and public visitors do not need WordPress GraphQL for those routes.

This should not disrupt local development. We can keep:

- `corepack pnpm docker:up` for WordPress, MariaDB, and local Caddy
- `corepack pnpm dev` for Nuxt dev mode and Vite HMR
- the current browser feedback loop for SCSS/Vue changes
- the current local URLs

Static generation becomes a publish/QA path, not the default development path.

## Recommended Shape

The recommended path is:

1. keep the current SSR/Docker production path as a fallback until the static path is proven
2. add a static-generation path for the public frontend
3. explicitly discover all public dynamic routes from WordPress before generation
4. separate real-content authoring from test-content authoring so QA fixtures do not pollute the publish source
5. decide and implement a media-hosting strategy so generated pages do not depend on local WordPress uploads
6. deploy the generated frontend output to a CDN/static host
7. run production-like Lighthouse against the generated output, not the Vite dev server

This should start as a local manual publish flow, then optionally grow into automatic deploy triggers later.

This should happen before the generative design spike reaches full branch fan-out. The static deploy spike does not need to reach public production first, but it should prove that the functional delivery model is solid: generate from WordPress, preview static output, and avoid hidden SSR assumptions. Then the generative design branches can focus on visual systems rather than discovering deployment constraints halfway through.

## Route Inventory

Current static routes are straightforward:

- `/`
- `/about`
- `/side-projects`
- `/writing`

Current dynamic route families need route discovery:

- `/writing/[slug]`
- `/case-studies/[slug]`

The static build must query WordPress for all public post slugs and all public case-study slugs, then tell Nuxt to prerender those routes. It should not rely only on crawler discovery from linked pages. The homepage may not link every writing post once pagination and archives grow, and the site should still publish every intended route.

The site intentionally does not have a public `/case-studies` archive route. Case studies browse from Home's Selected Work section.

## Content Source Model

WordPress remains the source of authored content:

- posts
- case studies
- homepage ACF fields
- footer settings
- featured media metadata
- Gutenberg block content

The static build consumes WordPress content at publish time. After deploy, public visitors should be able to read the generated pages without a live public WordPress request.

That means the build should fail loudly if required WordPress content cannot be fetched. Silent partial deploys are worse than a failed deploy.

## Local CMS Environments

The project needs a cleaner split between two different local WordPress roles:

- a **content CMS** for real posts, case studies, homepage fields, footer settings, and publishable media
- a **dev/QA CMS** for generated fixtures, Kitchen Sink block tests, throwaway media, and risky content experiments

The current local CMS is excellent for development and fixture-heavy QA. It is not ideal as the long-term only copy of real production content if it is also where test posts and generated media are constantly being seeded.

The static deploy spike should investigate a simple way to run separate WordPress instances or separate Docker Compose projects from the same repo. The ideal workflow would make it easy to choose:

- "run the dev CMS with fixture content"
- "run the content CMS with real publishable content"
- "generate static output from the content CMS"
- "optionally generate static output from the dev CMS for local QA"

This does not need to become a complex environment framework. The goal is practical separation so the public build cannot accidentally ship generated QA junk.

Potential approaches:

- separate Compose project names with separate database/uploads volumes
- separate `.env` files for dev-fixture CMS and real-content CMS
- a documented `COMPOSE_PROJECT_NAME` workflow
- future helper scripts that make the choice explicit

The important rule is that the static publish command should make the content source obvious.

## Media Model

Media is the most important unresolved design decision.

If the public frontend becomes static and the CMS can be local-only, public media should not depend on a local WordPress uploads URL. We need a public media host.

Reasonable options:

- keep WordPress public for uploads at first, while the static frontend moves to a CDN
- sync WordPress uploads to object storage or a CDN-backed bucket during publish
- use a media service that can serve transformed WebP/AVIF/responsive derivatives
- use a build-time image pipeline that downloads referenced media and emits optimized files into the static output

The final direction should prefer simple maintenance. A static frontend is only a win if media hosting does not become more fragile than the SSR setup it replaces.

The likely long-term shape is:

- WordPress remains the authoring database
- uploaded media is copied or mirrored to a public asset store
- generated Nuxt pages reference public CDN media URLs
- large originals are not blindly served into cards, thumbnails, galleries, or article bodies
- featured hero images stay eager/high-priority where they are the immediate route target
- below-the-fold article images stay lazy/async

The first implementation can be conservative, but it must not pretend that local WordPress uploads are a production media strategy.

## Provider Neutrality

The static deploy work should stay provider-neutral for as long as practical.

Cloudflare Pages is a useful reference point because it has a direct-upload workflow from a local folder, but the project should not hardcode itself around Cloudflare unless that becomes the clear best tradeoff. The broader goal is static output plus command-driven deployment.

Bunny.net is a serious candidate because Bunny Storage plus a Pull Zone is designed for static frontend hosting with CDN delivery, and Bunny Edge Storage has an HTTP API for uploads. It may also fit the project's preference for avoiding unnecessary consolidation around the biggest tech platforms.

Codeberg Pages is interesting because Codeberg is an open-source-friendly platform and Pages can publish static sites. It is less obviously a complete media CDN/image-delivery answer. It may be a good values-aligned static host for simple sites, but this project likely needs stronger media handling than Codeberg Pages alone provides.

The provider evaluation should compare at least:

- Bunny.net Storage + CDN/Pull Zone
- Cloudflare Pages / Cloudflare assets
- Codeberg Pages, likely paired with a separate media host if considered seriously
- the current Vultr/Caddy path as the control/fallback

The implementation should keep provider-specific details behind scripts or docs. The Nuxt app should not gain Cloudflare-specific, Bunny-specific, or Codeberg-specific assumptions unless there is a real need.

## Deploy Model

The first deploy model should be explicit local publish:

- generate static output locally from the current CMS content
- preview the generated output locally
- deploy the generated folder with a command-line tool

Cloudflare Pages is one plausible target because it can serve static assets globally and supports command-line direct upload workflows. Bunny.net is another plausible target because static frontend output can be uploaded to Bunny Storage and served through a Pull Zone. Other static hosts can fit the same conceptual model if they keep the workflow simple.

Git-triggered deploys are not required for the first pass. In fact, a manual local publish command has a real advantage for this project: the author can inspect the generated site before replacing production.

Automatic deploys from WordPress publish/save can be considered later. That would likely be a webhook from WordPress to a build/deploy runner. It is not needed for the first useful static deployment.

## Secrets And Deploy Safety

Static deploy should not make the repo more dangerous.

The deploy system will eventually need credentials: storage passwords, CDN API tokens, deploy tokens, account IDs, project names, or API keys depending on provider. The repo must treat those as private runtime configuration, not source.

Rules:

- never commit real CDN/API tokens, storage passwords, service-account files, real `.env` files, or deploy credentials
- commit examples only, such as `.env.deploy.example`, with fake values
- keep real deploy credentials in ignored local files or shell environment variables
- make deploy scripts read secret values from environment variables, not from hardcoded command strings
- do not print secrets in deploy logs
- prefer least-privilege tokens scoped to one project, storage zone, or deployment target
- document how to rotate and revoke deploy credentials
- if CI is added later, store secrets in the CI provider's secret store, not in the repo
- do not put token values in `package.json` scripts
- avoid checked-in config files generated by provider CLIs if they contain account credentials

Provider details matter here. For example, Bunny Edge Storage's API uses an `AccessKey` header with a storage-zone password. That kind of value should be treated exactly like a password. Cloudflare Wrangler can use API tokens or login state; production automation should prefer explicitly scoped tokens over personal global credentials.

The static deploy spike should include a security pass before any real public deploy command is considered done.

## Backups And Restore

If WordPress becomes local-only or mostly local, backups become more important, not less.

The production website may be static, but the editable source of truth still lives in WordPress:

- database content
- uploads/media
- ACF field values
- plugin settings
- private plugin assets/licenses

The spike should define a boring local backup process before treating local WordPress as the production authoring source.

Good enough first version:

- export the WordPress database to a timestamped file
- archive uploads separately
- store backups outside the Docker volume
- copy backups off the laptop to at least one off-device location
- keep credentials out of the backup archive when possible
- document restore steps and actually test one restore

This does not require a homelab, VPN, or elaborate remote database setup. A simple encrypted off-device backup target is better than a theoretically perfect setup that never gets used.

The static deploy spike should not choose a backup vendor, but it should leave the project with an explicit answer to: "If this laptop dies, how do I recover my authored content?"

## Relationship To Vultr

The existing Vultr/Docker Compose plan is still useful as a fallback and as a mental model for the current SSR architecture.

If the static path works well, the public frontend may not need Vultr at all. The open question is WordPress:

- WordPress can remain local-only if content is edited from the main development machine and deploys are pushed manually
- WordPress can run on a VPS if remote editing, multi-device editing, webhooks, or automated deploys become important
- WordPress can be publicly accessible without exposing authoring access to anonymous users, but it still needs normal WordPress hardening, backups, updates, and login protection

The simplest low-cost, low-attack-surface version is local WordPress plus static CDN frontend, but that comes with a tradeoff: publishing depends on the local machine and local CMS data backups.

## Caching And Prefetching In A Static World

Static generation changes the purpose of the prefetching work, but it does not make it worthless.

What becomes less important:

- public runtime GraphQL latency for already-generated routes
- WordPress response-cache hits during visitor navigation

What remains useful:

- route payload and component prefetching during client navigation
- featured-media warmup for card-to-detail transitions
- listing-surface warmups for perceived return/archive speed
- lazy/eager media defaults

The WordPress GraphQL cache remains useful for local preview, static generation speed, SSR fallback, and any future remote CMS environment. It should not be treated as the primary public performance layer if the site moves to static hosting.

## Production Baseline

Before optimizing around Lighthouse numbers, measure the right thing.

Dev-server Lighthouse reports include Vite, Nuxt devtools, unminified modules, and local HMR behavior. Those reports are useful for spotting obvious payload suspects, but they are not a reliable production score.

The static deploy spike should establish at least three baselines:

- current Nuxt production preview (`build` + `preview`)
- generated static preview
- deployed static URL

The deployed static URL is the only baseline that reflects CDN caching, compression, and public asset headers.

## Non-Goals

This spike should not:

- remove the local WordPress authoring workflow
- break Vite HMR or the local design loop
- require dashboard-only manual zip uploads
- force automatic deploy-on-save before the manual publish path works
- rewrite the Gutenberg block renderer unless static generation exposes a real blocker
- replace every media pipeline decision in one pass
- delete the current SSR/Docker production path before static deploy is proven

## Desired End State

After this spike:

- the repo has a documented static publish path
- Nuxt can generate the public routes from WordPress content
- all post and case-study slugs are discovered deliberately
- generated pages can be previewed locally before public deploy
- public deploy can be initiated with a command, not a dashboard upload
- public pages are served from static files on a CDN/static host
- public page views do not depend on live WordPress GraphQL for already-generated content
- media has a clear public hosting strategy
- production Lighthouse is measured against generated/deployed output
- the local development workflow remains fast and unchanged
- the old SSR/Vultr path remains available until the static path is trustworthy enough to become canonical

## External References To Verify During Implementation

- Nuxt deployment and prerendering docs: https://nuxt.com/docs/getting-started/deployment
- Nuxt `generate` command docs: https://nuxt.com/docs/api/commands/generate
- Cloudflare Pages Direct Upload docs: https://developers.cloudflare.com/pages/get-started/direct-upload/
- Bunny.net static frontend hosting docs: https://docs.bunny.net/storage/static-site-hosting
- Bunny.net Edge Storage API docs: https://docs.bunny.net/reference/storage-api
- Codeberg Pages docs: https://docs.codeberg.org/codeberg-pages/
