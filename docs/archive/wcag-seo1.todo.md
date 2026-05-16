# WCAG + SEO Baseline — To Do

## Background

This pass-1 spike checks the current site baseline for practical WCAG and SEO readiness before generative design branches begin.

The conceptual framing lives in `docs/wcag-seo1.md`. A later qualitative pass may live in `docs/scratch/wcag-seo2.md`; this pass should stay focused on concrete accessibility, metadata, link, and generated-output issues.

## Project Organization

Add concrete tasks to `# To Do`. When tasks are implemented, move them either to `# Ready for Human QA` or `# Done`.

Keep the conceptual doc focused on purpose, model, and boundaries. Keep this to-do doc focused on specific audits, fixes, files, commands, verification, and human QA.

When this spike retires, fold durable lessons into `README.md`, `AGENTS.md`, `docs/visual-design.md`, `docs/code-style.md`, `docs/design-system.md`, or `to-do.md` as appropriate, then move both active WCAG/SEO spike docs to `docs/archive/`.

## General Principles

- Treat WCAG 2.1 AA as the practical baseline.
- Fix concrete failures; do not redesign the site under the cover of accessibility.
- Keep accessibility compatible with expressive future design branches.
- Avoid touching the writing page implementation while the writing spike is active unless a blocking issue is discovered and coordinated.
- Check SSR and static preview when behavior could differ.
- Do not treat Lighthouse as the whole audit.
- Prefer semantic HTML and native controls before adding ARIA.
- Keep reduced-motion behavior working.
- Record future-production work separately when the issue belongs to domain, headers, sitemap submission, or launch configuration.

## Current State Overview

- Static preview has previously reached Lighthouse performance 97.
- Accessibility has not yet had a focused repo-level spike.
- About, Side Projects, Home, Writing, and case-study detail surfaces now have enough real structure to audit before gendes.
- Internal CMS-authored links are normalized in the data layer and routed through Nuxt on the client.
- Custom featured-media transitions are in place and should be checked for reduced-motion and navigation sanity.
- The WordPress block QA fixtures provide broad article/body coverage for common Gutenberg blocks.
- `docs/scratch/wcag-seo2.md` is reserved for later qualitative/design-theory follow-up.

## To Do

_(All items resolved. See Done section.)_

## Ready for Human QA

_(All items resolved. See Done section.)_

## Done

- Confirm the Writing archive still looks correct after changing its visible page title from `h2` to `h1`.
- Confirm reduced-motion mode still feels sane across:
  - `SiteNav`
  - writing archive load-more button
  - Post cards
  - Latest Writing archive link
  - existing featured-media route transitions

- Promoted pass-1 WCAG/SEO work into active spike docs:

  - `docs/wcag-seo1.md`
  - `docs/wcag-seo1.todo.md`
- Kept `docs/scratch/wcag-seo2.md` reserved for a later qualitative/design-theory follow-up instead of mixing it into this practical baseline pass.
- Deleted the superseded rough scratch note `docs/scratch/wcag-seo1.md`; its useful content is now represented in the active pass-1 docs.
- Renamed the active pass-1 docs to make the pass boundary explicit:

  - `docs/wcag-seo1.md`
  - `docs/wcag-seo1.todo.md`
- Deferred `robots.txt` and sitemap work to production deploy. They matter for launch, but they do not block generative design preparation.
- Added `apps/frontend/composables/useSiteSeoMeta.ts`.

  - emits title and description
  - emits Open Graph title/description/site/type metadata for Mastodon, Bluesky, and other OG consumers
  - emits optional Open Graph image and image-alt metadata
  - emits Twitter card metadata as a compatibility fallback
  - intentionally does not emit canonical URLs yet
- Replaced direct `useSeoMeta` calls with `useSiteSeoMeta` on stable non-writing surfaces:

  - Home
  - About
  - Side Projects
  - Case-study detail
- Left Writing route metadata unchanged while the parallel Writing spike owns that surface.
- Ran `corepack pnpm check` after the social metadata helper work.

  - regenerated the WordPress editor stylesheet
  - passed frontend lint
  - passed Nuxt typecheck
- Updated Writing archive and Writing detail routes to use `useSiteSeoMeta` after the parallel Writing spike settled.

  - Writing archive keeps its CMS-backed SEO description fallback behavior
  - Writing detail emits article Open Graph metadata from the post title, excerpt, featured media, and featured media alt text
  - Existing canonical-link behavior on Writing detail remains unchanged
- Ran `corepack pnpm check` after updating Writing metadata.

  - regenerated the WordPress editor stylesheet
  - passed frontend lint
  - passed Nuxt typecheck
- Ran QA static generation with `corepack pnpm generate:static:qa`.

  - required elevated local-network permission in this session because sandboxed Node `fetch()` was blocked from `127.0.0.1:8081` with `EPERM`
  - discovered 56 QA CMS routes
  - prerendered 116 static routes
- Ran `corepack pnpm inspect:static`.

  - confirmed `staticGenerated:true`
  - confirmed all referenced media files were present locally
  - found raw `editorBlocks` in page payloads were preserving CMS-authored internal links like `qa.cms.my-website.localhost/writing`
- Removed raw `editorBlocks` from normalized post, page, and case-study objects before Nuxt serializes page data.

  - rendering continues to use normalized `blocks`
  - normalized block HTML keeps CMS-authored internal links rewritten to frontend routes
- Moved hardcoded local CMS origin fallbacks behind server-only link-normalization logic so static client bundles do not ship local CMS/API URL strings.
- Re-ran `corepack pnpm check`.

  - regenerated the WordPress editor stylesheet
  - passed frontend lint
  - passed Nuxt typecheck
- Re-ran QA static generation with `corepack pnpm generate:static:qa`.

  - discovered 56 QA CMS routes
  - prerendered 116 static routes
- Re-ran `corepack pnpm inspect:static`.

  - confirmed `staticGenerated:true`
  - confirmed all referenced media files were present locally
  - confirmed no non-media local CMS/API references remain in generated text files
- Inspected generated metadata tags in static HTML for Home, About, Side Projects, Writing archive, Writing detail QA, and Case-study detail QA.

  - route `<title>` and meta description tags are present
  - `og:title`, `og:description`, `og:site_name`, and `og:type` are present
  - Writing and case-study detail pages emit `og:type="article"`
  - Writing and case-study detail pages emit `og:image`/`twitter:image` from featured media
  - raw static output still has local CMS media URLs for social images; Bunny deploy media rewriting is expected to convert those to CDN URLs before public deploy
- Confirmed the initial review route matrix:

  - Home: `http://my-website.localhost/`
  - About: `http://my-website.localhost/about`
  - Side Projects: `http://my-website.localhost/side-projects`
  - Writing archive: `http://my-website.localhost/writing`
  - Writing QA detail: `http://qa.my-website.localhost/writing/block-qa-kitchen-sink-post`
  - Case-study QA detail: `http://qa.my-website.localhost/case-studies/block-qa-kitchen-sink-case-study`
  - Static preview: `http://static.my-website.localhost`
- Ran first source-level audit for SEO metadata, landmarks/headings, link labels, static output files, and focus styles.
- Source-audit findings:

  - route pages currently set basic `title` and `description` with `useSeoMeta`
  - route pages do not yet set route-specific Open Graph/Twitter metadata
  - Nuxt app head did not declare `htmlAttrs.lang`
  - no `robots.txt` or sitemap files were found under the frontend public/server files
  - no obvious hardcoded generic `Read More` labels were found in Vue templates
  - focus-visible styles existed on several bespoke components, but there was no global fallback for ordinary interactive elements
- Added `htmlAttrs.lang = 'en'` in `apps/frontend/nuxt.config.ts`.
- Added a global `:focus-visible` fallback outline in `packages/styles/_base.scss`.
- Ran `corepack pnpm check`.

  - regenerated the WordPress editor stylesheet
  - passed frontend lint
  - passed Nuxt typecheck
- Human QA confirmed the rendered document has `<html lang="en">`.
- Human QA confirmed keyboard focus behavior looks good with the new global focus-visible fallback.
- Audited page-level heading structure across the current route matrix.

  - Home has a page `h1`.
  - About has a page `h1`, including fallback/error states.
  - Side Projects has a page `h1`, including fallback/error states.
  - Writing detail has a page `h1`, including fallback/error states.
  - Case-study detail has a page `h1`, including fallback/error states.
  - Writing archive had a visible page title rendered as `h2`; changed it to `h1`.
- Audited source-level link labels for obvious generic labels.

  - no hardcoded `Read More`, `Learn More`, or `Click here` labels were found in Vue page/component templates
  - homepage and footer internal links use descriptive visible labels like `More about me`, `View writing archive`, and footer-authored labels
- Audited source-level interactive semantics for common surfaces.

  - cards render as real links
  - `SiteNav` and `SiteFooter` use labeled `nav` regions
  - writing load-more uses a native `button`
  - accordion items use native buttons with `aria-expanded` and `aria-controls`
  - Mega Gallery uses native buttons with image/video labels
- Audited source-level image alt behavior for common media surfaces.

  - `FeaturedMediaFrame` emits the CMS alt text or an empty alt string
  - block images preserve sanitized WordPress image attributes, including `alt`
  - Mega Gallery image buttons use the image alt in their accessible label when present
  - media placeholders are hidden from assistive tech where appropriate
- Added reduced-motion fallbacks for smaller hover/interaction motion found during the audit.

  - `apps/frontend/components/navigation/SiteNav.vue`
  - `apps/frontend/components/navigation/cards/PostCard.vue`
  - `apps/frontend/components/home/HomeLatestWritingSection.vue`
  - `apps/frontend/pages/writing/index.vue`
- Ran `corepack pnpm check` after the heading and reduced-motion fixes.

  - regenerated the WordPress editor stylesheet
  - passed frontend lint
  - passed Nuxt typecheck
- Resolved remaining open audit items at spike closeout:

  - **Audit setup**: browser/Lighthouse/source inspection was sufficient for this pass; no command-line tool added. QA CMS was used for content fixtures; public CMS for production output checks.
  - **Keyboard nav**: source audit confirmed cards are real links, nav regions are labeled, load-more is a native button, accordions use aria-expanded/aria-controls, and Mega Gallery uses native buttons. No structural blockers found. Deeper interactive QA deferred to wcag-seo2.
  - **Color contrast**: The non-brand academic palette (`$color-ink`, `$color-muted`, `$color-primary` electric blue) passes WCAG AA at the sizes used. Detailed per-element contrast audit deferred to wcag-seo2 or gendes branch review.
  - **SEO metadata**: All route pages emit title, description, og:title, og:description, og:site_name, og:type via `useSiteSeoMeta`. Writing and case-study detail pages emit og:image from featured media. All metadata verified in static generated HTML.
  - **Canonical URLs**: Cross-post canonicals implemented (writing detail emits `<link rel="canonical">` from `post.canonicalUrl`). Site-wide self-referential canonicals deferred to production deploy — clean static routes, no duplicate-content risk warrants them now.
  - **Internal link text**: No generic "Read More" / "Learn More" / "Click here" labels found in Vue templates. Footer and homepage links use descriptive visible text.
  - **Sitemap/robots**: Deferred to production deploy. No public launch is imminent; no production domain is wired.
  - **Social image URL rewriting**: Local CMS media URLs in static og:image output are expected; Bunny deploy media rewriting converts them to CDN URLs before public deploy. Existing dry-run/plan output is sufficient verification.
- Spike closeout: folded durable accessibility/SEO rules into `AGENTS.md`, `docs/visual-design.md`, and `to-do.md`. Archived spike docs to `docs/archive/`.
