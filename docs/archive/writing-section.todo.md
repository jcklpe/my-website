# Writing Section — To Do

## Background

See `docs/writing-section.md` for the full conceptual doc: intent, constraints, settled decisions, and implementation plan.

This spike has two independent tracks:

1. **Writing index copy** — replace lorem ipsum description with real copy
2. **Canonical link for Medium cross-posts** — new ACF field + GraphQL exposure + `useHead` in the detail page

The WCAG/SEO spike covers CDN-level canonical URLs separately. It explicitly defers Medium cross-post canonical links here.

## Project Organization

| File | Role |
|---|---|
| `apps/frontend/pages/writing/index.vue` | Writing archive page — load-more list of posts |
| `apps/frontend/pages/writing/[slug].vue` | Writing detail page — where canonical link is emitted |
| `apps/frontend/composables/useWordPress.ts` | All GraphQL queries and data normalization |
| `apps/frontend/types/wordpress.ts` | TypeScript interfaces for WordPress data |
| `apps/cms/wp-content/plugins/project-bootstrap/project-bootstrap.php` | ACF field registration and GraphQL type extensions |

## General Principles

- Do not touch the load-more pagination logic in `writing/index.vue` or `useWritingArchive.ts`.
- Writing index should not switch to `queryWordPressPageByUri` — the page doesn't need block content, so the lighter `queryPageSeoDescription` query is correct.
- The canonical link in `writing/[slug].vue` is a `useHead` call alongside the existing `useSeoMeta`. Do not replace `useSeoMeta`.
- Leave `canonicalUrl` blank for posts that live only on this site. Only fill it for genuine cross-posts.
- Run `corepack pnpm check` after any frontend code changes.

## Current State Overview

**`apps/frontend/pages/writing/index.vue`**
- SEO: `queryPageSeoDescription('/writing')` → reads `seoDescription` ACF field on the WordPress `/writing` Page
- Template has hardcoded `<p class="description">Lorem ipsum dolor sit amet.</p>` — placeholder, never replaced
- Load-more pagination via `useWritingArchive()` is working correctly

**`apps/frontend/pages/writing/[slug].vue`**
- SEO: `useSeoMeta({ title, description: post.value?.excerpt })` — working
- No canonical link implementation — `canonicalUrl` field does not exist anywhere

**`apps/frontend/types/wordpress.ts`**
- `WordPressPost` interface has: `id, slug, date, author, authorName, title, excerpt, featuredImage, featuredMedia, content, blocks, editorBlocks`
- No `canonicalUrl` field

**`apps/frontend/composables/useWordPress.ts`**
- `postBySlugQuery` (line 172): fetches `id, slug, date, author, title, excerpt, featuredImageFields, editorBlocks`
- `postShellBySlugQuery` (line 196): same minus `editorBlocks`
- `normalizePost` (line 400): normalizes date, strips HTML from title/excerpt/authorName, maps `featuredImage.node` to `featuredMedia`
- Neither query includes `canonicalUrl`

**`apps/cms/wp-content/plugins/project-bootstrap/project-bootstrap.php`**
- `seo_description` ACF field is registered on Pages (field group `group_my_website_page_seo`) and exposed as `seoDescription` on `Page` GraphQL type
- No `canonical_url` field exists on any post field group

## To Do

### Track 1: Writing index copy

- [x] Replace `<p class="description">Lorem ipsum dolor sit amet.</p>` in `apps/frontend/pages/writing/index.vue` with real copy — "Articles about all kinds of odds and ends."
- [x] Confirm a WordPress Page exists at the `/writing` slug (check WordPress admin); if not, create it
- [x] Fill the `seo_description` ACF sidebar field on the writing Page with appropriate meta description copy
- [x] Run `corepack pnpm check` to verify no regressions

### Track 2: Canonical link for Medium cross-posts

**CMS code** — `apps/cms/wp-content/plugins/project-bootstrap/project-bootstrap.php`:
- [x] Add `canonical_url` text field to the post ACF field group:
  - Key: `field_my_website_post_canonical_url`
  - Name: `canonical_url`
  - Label: `Canonical URL`
  - Type: `text`
  - Instructions: `Leave blank unless this post is cross-posted. Enter the original URL to mark it as canonical.`
- [x] Register `canonicalUrl` on the `Post` WPGraphQL type via `register_graphql_field`:
  - Type: `String`
  - Resolver: `get_field('canonical_url', $post_id) ?: null`

**Frontend types** — `apps/frontend/types/wordpress.ts`:
- [x] Add `canonicalUrl?: string | null` to the `WordPressPost` interface

**Frontend query** — `apps/frontend/composables/useWordPress.ts`:
- [x] Add `canonicalUrl` to `postBySlugQuery` GraphQL query body
- [x] Add `canonicalUrl` to `postShellBySlugQuery` GraphQL query body (for the shell pre-fetch used in transitions)
- [x] Add `canonicalUrl` passthrough in `normalizePost`: `canonicalUrl: post.canonicalUrl ?? null`

**Frontend page** — `apps/frontend/pages/writing/[slug].vue`:
- [x] Add `useHead` canonical link after the existing `useSeoMeta` call:
  ```ts
  useHead({
    link: computed(() =>
      post.value?.canonicalUrl
        ? [{ rel: 'canonical', href: post.value.canonicalUrl }]
        : [],
    ),
  })
  ```
- [x] Run `corepack pnpm check` to verify no regressions

**CMS data** (after code ships):
- [x] For any posts that are genuine Medium cross-posts: fill in the `canonical_url` field in WordPress admin

## Ready for Human QA

<!-- Items moved here when code is done but need browser/editor/copy review -->

## Done

### Track 1: Writing index copy

- Replaced lorem ipsum description on `/writing` with "Articles about all kinds of odds and ends." (hardcoded in Vue, not CMS-driven)
- `/writing` WordPress Page created with `seo_description` ACF field filled — verified via GraphQL that `seoDescription` is returned correctly from QA CMS
- `corepack pnpm check` passed clean

### Track 2: Canonical link for Medium cross-posts

- `canonical_url` ACF text field added to `group_my_website_post_meta` (sidebar, posts only) in `project-bootstrap.php`
- `canonicalUrl` registered on the `Post` WPGraphQL type with ACF resolver
- `canonicalUrl?: string | null` added to `WordPressPost` TypeScript interface
- `canonicalUrl` added to `postBySlugQuery` and `postShellBySlugQuery`; passthrough added in `normalizePost`
- `useHead` canonical link emitted in `writing/[slug].vue` using `computed()` — only emits when `post.value?.canonicalUrl` is non-null
- Verified via QA CMS GraphQL: "Navigation Test Post 14" (slug `nav-writing-test-14`) returns canonical URL correctly
- `corepack pnpm check` passed clean after all changes; pre-existing `ogType` type error in `useSiteSeoMeta.ts` also fixed (cast to literal union)
