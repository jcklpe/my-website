# Writing Section

## Intent

Improvements to the Writing section: writing index page presentation, writing detail page experience, and cross-posting considerations for posts also published on Medium.

## Key constraints

- Writing index at `/writing` exists with cursor-based load more pagination — any changes must preserve that behavior
- Writing detail pages are working; static generation covers them
- The static deploy path must serve all writing pages correctly

## Open questions / items

- **Canonical link handling for Medium cross-posts** — posts cross-posted from Medium need a canonical `<link>` meta tag pointing to the original Medium URL to prevent SEO duplicate content issues. May require a custom ACF field per post ("canonical URL") plus a `useHead` call in the writing detail page. Needs research on exact WordPress/WPGraphQL implementation.
- **Writing index presentation** — is the current design sufficient beyond the copy cleanup items (see `docs/scratch/copy-cleanup.md`), or are there structural improvements needed? Be conservative here — don't redesign for its own sake.
- **Per-post metadata** — is there value in surfacing additional metadata on the writing index (tags, read time, series grouping)?

## Rough work items

- Research and implement canonical link meta for Medium cross-posts (ACF field + GraphQL exposure + `useHead` in detail page)
- Audit writing index for remaining placeholder copy (coordinate with copy-cleanup spike)
- Decide whether writing index needs structural changes beyond copy
