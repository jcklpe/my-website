# Writing Section

## Intent

Two distinct improvements to the Writing section:

1. **Writing index page** — replace the placeholder lorem ipsum description with real copy, and wire the page up consistently with the rest of the CMS-backed page pattern.
2. **Canonical link for Medium cross-posts** — posts cross-posted to Medium need a `<link rel="canonical">` pointing to the original Medium URL, to prevent SEO duplicate-content issues.

These are independent pieces. Either can ship alone.

## Constraints

- Load-more pagination in `writing/index.vue` via `useWritingArchive()` must not be disturbed.
- Static generation must continue to work for all writing routes.
- Do not redesign the writing index page layout or restructure navigation. This spike is about CMS wiring and SEO infrastructure.
- The WCAG/SEO spike covers canonical URLs for the static CDN deploy (where the CDN URL is canonical site-wide). Medium cross-post canonical links are the responsibility of this spike — both spikes need to ship before the canonical URL story is complete.

## Writing Index Page

### Current state

`apps/frontend/pages/writing/index.vue` currently:
- Fetches SEO description via `queryPageSeoDescription('/writing')` (lightweight query, works)
- Has a hardcoded `<h2 class="title">Writing</h2>` section heading
- Has a hardcoded `<p class="description">Lorem ipsum dolor sit amet.</p>` tagline — placeholder copy, never replaced

### Settled decisions

**SEO query**: Leave `queryPageSeoDescription('/writing')` in place. The writing index does not need block content from a WordPress Page, so the full `queryWordPressPageByUri` call is heavier than necessary. Switch only if consistency is a genuine maintenance concern.

**Description tagline**: Replace the lorem ipsum with real copy, hardcoded in Vue. A personal site description tagline does not need to be CMS-editable — it is designer/developer territory. The gendes agents can edit it directly in the SFC template. A CMS-backed `description` ACF field on the Page is optional and can be deferred until there is genuine editorial-control demand.

**WordPress Page**: A WordPress Page at the `/writing` slug should exist (WPGraphQL needs it to resolve `queryPageSeoDescription('/writing')`). If it does not exist yet, create it. Fill the `seo_description` ACF sidebar field with real copy.

**Description copy**: `Articles about all kinds of odds and ends.`

## Canonical Link for Medium Cross-Posts

### Problem

Some posts were published first on Medium, then cross-posted here (or vice versa). Without a canonical link, search engines may treat the two copies as duplicate content. The canonical should point to whichever URL is intended as the primary version.

### Approach

Per-post ACF text field `canonical_url` on the `post` field group. Left blank for most posts; filled only when cross-posting to/from an external platform. The frontend reads it and emits `<link rel="canonical" href="...">` via `useHead`.

### Implementation

**CMS — `apps/cms/wp-content/plugins/project-bootstrap/project-bootstrap.php`**:
- Add a new `canonical_url` text field to the existing post field group
- Field key: `field_my_website_post_canonical_url`
- Field name: `canonical_url`
- Field type: `text`
- Instructions: "Leave blank unless this post is cross-posted from an external URL (e.g. Medium). Enter the original URL to set it as canonical."
- Register `canonicalUrl` on the `Post` WPGraphQL type via `register_graphql_field`
- Resolver: `get_field('canonical_url', $post_id) ?: null`

**Frontend — `apps/frontend/types/wordpress.ts`**:
- Add `canonicalUrl?: string | null` to `WordPressPost` interface

**Frontend — `apps/frontend/composables/useWordPress.ts`**:
- Add `canonicalUrl` to `queryWordPressPostBySlug` GraphQL query body
- Pass through in `normalizePost` (`null` if absent)

**Frontend — `apps/frontend/pages/writing/[slug].vue`**:
- Call `useHead` with the canonical link when `post.value?.canonicalUrl` is non-empty:
  ```ts
  useHead({
    link: post.value?.canonicalUrl
      ? [{ rel: 'canonical', href: post.value.canonicalUrl }]
      : [],
  })
  ```
- `useSeoMeta` is already called in this file. `useHead` is a separate call, not a replacement.

### Canonical URL meaning

- Post originated on Medium, cross-posted here: `canonical_url` = the Medium URL (Google treats Medium as primary)
- Post originated here, cross-posted to Medium: `canonical_url` = this site's URL (e.g. `https://aslanfrench.work/writing/post-slug`)
- Post lives only here: leave blank — no explicit canonical emitted, which is correct for non-duplicated content

## Parallel work awareness

The WCAG/SEO pass-1 spike (`docs/wcag-seo1.md` and `docs/wcag-seo1.todo.md`) covers basic metadata, Open Graph/social previews, and static-output sanity. Production-domain canonical URLs, robots, and sitemap verification are expected to remain production-deploy work. Medium canonical links are handled here. No conflict expected.
