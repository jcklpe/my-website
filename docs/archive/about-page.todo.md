# About Page — To Do

## Background

The current `/about` route is a hardcoded Nuxt page. It has useful first-pass layout and link structure, but its content is not editable in WordPress.

This spike migrates `/about` to a CMS-managed WordPress Page while preserving the existing public route, the local development loop, and static generation compatibility. The conceptual framing lives alongside this file in `about-page.md`.

## Project Organization

Add concrete tasks to `# To Do`. When tasks are implemented, move them either to `# Ready for Human QA` or `# Done`.

Keep the conceptual doc focused on model and philosophy. Keep this to-do doc focused on atomic steps, files, commands, verification, and unresolved implementation decisions.

When this spike retires, fold durable lessons into `README.md`, `AGENTS.md`, `docs/design-system.md`, `docs/code-style.md`, or `to-do.md` as appropriate, then move both About spike docs to `docs/archive/`.

## General Principles

- Keep About as a normal WordPress Page.
- Keep the Gutenberg editor visible for About.
- Prefer Gutenberg body content for narrative page sections.
- Add ACF only for genuinely structured data that would be awkward or brittle as body blocks.
- Preserve the public `/about` route.
- Preserve Home/footer links to `/about`.
- Reuse the existing block rendering architecture instead of rendering raw page HTML wholesale.
- Keep route-level composition in the About page SFC when it is specific to the About page.
- Keep the implementation static-generation friendly.
- Coordinate with the copy cleanup spike, but do not block this spike on final polished copy.
- Do not broaden this into Side Projects, homepage, or a generic page-builder abstraction.

## Current State Overview

- `apps/frontend/pages/about.vue` now fetches a WordPress Page at `/about`.
- The current About page now has:
  - WordPress title as the CMS/admin label
  - ACF Display Heading as the public `h1`
  - CMS-driven Gutenberg body blocks
  - route-owned SEO fallback description
  - a composed two-column route layout
  - no hardcoded link trio
- WordPress already supports Pages and WPGraphQL.
- `apps/cms/scripts/bootstrap-wordpress.sh` now creates a starter About page if none exists.
- The Home page uses ACF fields registered in `apps/cms/wp-content/plugins/project-bootstrap/project-bootstrap.php`.
- `useWordPress.ts` now has a generic `queryWordPressPageByUri(uri)` helper.
  - It uses `page(id: $uri, idType: URI)` instead of `nodeByUri` so it still works when local WordPress uses plain permalink URLs such as `/?page_id=229`.
- Rendered Gutenberg block HTML is normalized at the data layer so internal CMS-origin links can become portable frontend-relative links.
- Authored same-origin links rendered through `v-html` are intercepted on the client and routed through Nuxt so they get the same fallback transition behavior as authored Vue links.
- `apps/frontend/types/wordpress.ts` now defines a generic WordPress page response type.
- Static generation already includes `/about` as a fixed route.
- The copy cleanup spike is being handled separately and should not edit this migration’s structure unless coordinated.
- First-pass content model is now settled: WordPress page title as CMS/admin label, ACF Display Heading for the public `h1`, Gutenberg body content, no hardcoded link trio, no featured media, no structured timeline fields.

## To Do

### WordPress / CMS Setup

_(First-pass setup is implemented. Keep future tasks here if the CMS model grows.)_

### Frontend Data Layer

_(First-pass data helper is implemented. Keep future tasks here if the page model grows.)_

### Frontend Route

_(First-pass route migration is implemented. Keep future tasks here if visual QA reveals issues.)_

### Static Generation And Deploy Compatibility

_(First-pass static preview QA is complete. Keep future tasks here if the page model grows.)_

### Ready for Human QA

## Done

### QA

- Reviewed the About title/display-heading split in WordPress and the frontend

  - confirmed the WordPress Pages list shows `About`
  - confirmed the frontend hero shows the Display Heading value
  - confirmed the Gutenberg body continues below the hero
  - confirmed the displayed `h1` comes from Display Heading while the browser/search title remains the simpler page title
- Reviewed the migrated `/about` route in the browser

  - confirmed the CMS title and body render as expected
  - confirmed the old hardcoded link trio is gone
  - confirmed authored internal About links point at frontend paths, not `cms.my-website.localhost`
  - confirmed authored internal links use the fallback fade when moving between About, Home, Writing, and Side Projects
  - confirmed browser Back from an authored internal link returns to About without a dynamic import error
  - confirmed authored Gutenberg links/blocks look natural in the About body column
  - confirmed missing/error states are acceptable if WordPress is unavailable
  - confirmed mobile layout still reads well
- Confirmed generated static preview for the CMS-managed About page

  - generated new static output
  - served it with the static preview script
  - confirmed the page looks good in static preview
  - confirmed authored internal links work in static preview
- Promoted the About page spike from scratch notes into active spike docs
- Audited `apps/frontend/pages/about.vue`

  - Content: hardcoded eyebrow, title, body paragraphs, and link labels
  - Route composition: two-column article shell, hero/title area, body column, responsive collapse
  - Styling: all About-specific layout and typography currently lives in scoped SFC styles
  - SEO: static title and description are currently route-owned fallbacks
  - Link trio: hardcoded agent cruft; remove from the model and author any desired links in Gutenberg body content
- Settled first-pass content model

  - WordPress Page title is the plain CMS/admin label
  - ACF Display Heading is the public `h1`
  - Gutenberg body carries the narrative content
  - no hardcoded link trio
  - no featured media in the first pass
  - no structured experience/timeline fields in the first pass
- Added generic WordPress page data support

  - `WordPressPage` and `WordPressPageByUriResponse` types in `apps/frontend/types/wordpress.ts`
  - `queryWordPressPageByUri(uri)` in `apps/frontend/composables/useWordPress.ts`
  - query fetches page `id`, `title`, and `editorBlocks(flat: true)`
  - query uses the WordPress Page URI lookup field, not the more brittle `nodeByUri` field
- Updated `apps/frontend/pages/about.vue`

  - fetches the `/about` WordPress page
  - renders ACF Display Heading as the public `h1`
  - uses the WordPress page title for the route/browser title
  - renders Gutenberg blocks below the hero
  - preserves the composed route shell
  - removes the hardcoded link trio
  - includes loading/error/not-found state copy
- Updated `apps/cms/scripts/bootstrap-wordpress.sh`

  - creates a starter About page with slug `about` if one does not exist
  - does not overwrite existing authored About content
- Confirmed the WordPress body editor remains available for non-front-page Pages

  - `project-bootstrap.php` only removes Page editor support for the configured front page
- Ran `corepack pnpm check`

  - regenerated the WordPress editor stylesheet
  - passed frontend lint
  - passed Nuxt typecheck
- Added internal CMS link normalization for rendered Gutenberg block HTML

  - rewrites internal CMS-origin `href` values to relative frontend paths
  - maps valid WordPress `?page_id=` links through the current WordPress page route list so QA/public Pages route to Nuxt paths without hardcoded IDs
  - falls back from URI lookup to slug lookup so QA Pages still render when WordPress permalink rules lag behind
  - leaves external links alone
  - leaves WordPress runtime/media paths such as `/wp-content/uploads/` alone for the media deploy pipeline
  - captures runtime config before the WordPress fetch so Nuxt composables are not called after async context is lost
  - leaves unmatched/stale `?page_id=` links on their original CMS URL instead of silently turning them into frontend `/?page_id=...`
- Updated CMS bootstrap to prefer pretty page/post permalinks

  - sets the rewrite structure to `/%postname%/`
  - flushes rewrite rules during bootstrap
- Updated the running local CMS permalink structure for current QA

  - confirmed GraphQL now reports the About page URI as `/about/`
- Updated the running QA CMS permalink structure for current QA

  - confirmed GraphQL now reports QA page URIs as `/about/`, `/writing/`, and `/side-projects/`
- Added client routing support for same-origin authored HTML links

  - `apps/frontend/plugins/content-link-navigation.client.ts` intercepts ordinary same-origin anchor clicks rendered through Gutenberg `v-html`
  - passes those clicks through the Nuxt router so the existing fallback page transition can run
  - preserves external links, modified clicks, new-tab targets, downloads, and hash-only links
- Added one-shot route chunk recovery

  - `apps/frontend/plugins/route-chunk-error-recovery.client.ts` reloads once when Nuxt/Vite fails to fetch a dynamically imported route module
  - prevents the back button from stranding the visitor on a stale dynamic-import error after local HMR or later production deploys
- Added ACF Display Heading support for standalone pages

  - registers a Page Display ACF group for non-front-page WordPress Pages
  - exposes `displayHeading` through the Page GraphQL type
  - adds `displayHeading` and `seoDescription` to the generic page query/type path
  - updates the About route to use Display Heading for the frontend `h1`
  - updates CMS bootstrap so newly seeded About pages are titled `About`
  - safely migrates the original seeded expressive About title into `display_heading` when bootstrap sees that exact starter title
  - applied the same safe migration to the running public and QA CMS containers
  - confirmed public and QA GraphQL return `title: "About"` and `displayHeading: "Design technology, research, and web-shaped craft."`
- Added durable spike workflow documentation

  - created `docs/how-to-spike.md`
  - updated `AGENTS.md` to point future agents at the spike workflow details
- Added durable CMS-authored link notes

  - updated `README.md`
  - updated `AGENTS.md`
- Ran `corepack pnpm check`

  - regenerated the WordPress editor stylesheet
  - passed frontend lint
  - passed Nuxt typecheck
