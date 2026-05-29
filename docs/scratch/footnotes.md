# Footnotes

## Intent

Add footnote support to writing posts and case studies so authors can use inline numbered references that link to a note list at the end of the article.

## CMS Side

The core WordPress Footnotes block shipped in WP 6.3. We are on 6.9.4, so no plugin is needed — the block is already available in the editor. Authors can insert footnotes inline using the Footnotes toolbar button; WordPress manages the numbered anchors and the footnote list block at the end of the post.

- Verify the Footnotes block appears and works correctly in the WordPress editor on this install
- Add the Footnotes block to the QA seed fixture so it is covered by block QA

## Frontend Side

- Determine how `wp-graphql-content-blocks` exposes the Footnotes block — it may expose as `core/footnotes` with rendered HTML, or it may not be covered and fall through to the HTML fallback renderer
- If `wp-graphql-content-blocks` exposes it structurally: add a `FootnotesBlock.vue` to the block registry
- If it falls through as raw HTML: the HTML fallback renderer may be sufficient, but verify the anchor cross-links (`href="#fn-1"`) work correctly in the SPA context (hash navigation within the page)
- Ensure the footnote number markers in inline text (the superscript anchors) render and link correctly — these appear inside paragraph/heading blocks, not as a separate block, so they come through as HTML within the paragraph renderer

## Notes

- No plugin required — this is a core WordPress 6.3+ feature
- The primary implementation work is on the frontend renderer side
- Hash anchor navigation within a Nuxt SPA page should work natively; no special handling expected unless Nuxt's scroll behavior interferes
