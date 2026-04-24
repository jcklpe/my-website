# Mega Gallery Block
A custom Gutenberg block (`my-website/mega-gallery`) for masonry-layout mixed-media galleries. Uses `core/image` and `core/video` as InnerBlocks children, rendered on the frontend via `MegaGalleryBlock.vue` with Masonry.js for left-to-right grid layout and PhotoSwipe for image lightbox. Videos autoplay looping and muted in the grid (no lightbox — the grid IS the viewing experience for motion clips).

Use the block QA routes as regression pages once the block is seeded:
- `http://my-website.localhost/writing/block-qa-kitchen-sink-post`
- `http://my-website.localhost/case-studies/block-qa-kitchen-sink-case-study`

## Project organization
Add new items to complete to the `# To Do` section. When those items are completed move them either to `# Ready for human QA` or `# Done`. Update the `# Current State Overview` with an overview of the current state.

## General principles
- The block uses InnerBlocks restricted to `core/image` and `core/video` — no custom attribute editor needed, WordPress media library handles all uploads natively.
- The frontend Vue component (`MegaGalleryBlock.vue`) reads child blocks from the flat `editorBlocks` GraphQL query by filtering `allBlocks` where `parentClientId === block.clientId`. This matches the existing pattern used by `GalleryBlock.vue`.
- Masonry.js handles left-to-right item placement. It is dynamically imported inside `onMounted` to avoid SSR issues. A `ResizeObserver` triggers `layout()` on container resize.
- PhotoSwipe handles image lightbox. It is dynamically imported on first click so it doesn't load until needed.
- Videos are not in the lightbox. They autoplay, loop, and are muted in the grid. This is intentional — motion graphics are shown as they are, not expanded.
- The block plugin (`my-website-blocks`) now has a real registered block. The `editor.js` is plain browser JS using WordPress globals (`wp.blocks`, `wp.element`, `wp.blockEditor`). No build step or webpack pipeline is needed.
- Do not add a build pipeline to `my-website-blocks` unless custom block complexity genuinely demands it. Keep it Vite-optional.
- Responsive columns: 3 at desktop, 2 at tablet (≤768px), 1 at mobile (≤480px). The CSS sizer element controls Masonry column width; media queries adjust it.
- PhotoSwipe CSS is loaded globally via `nuxt.config.ts` css array.

# Current State Overview
First implementation is complete. The block is registered, the Vue component renders masonry + lightbox, and the frontend is wired up. The block has not yet been added to the QA seed fixture, so it has not been tested against real authored content.

# To Do
- Add `my-website/mega-gallery` fixture to the WP-CLI block QA seed script (`apps/cms/wp-content/plugins/project-bootstrap/dev-tools/seed-block-test-content.php`) with a mix of images and at least one video
- QA the editor experience: confirm InnerBlocks allows only image/video, confirm the block appender button works, confirm alignment (wide/full) options appear in the editor toolbar
- QA the frontend masonry layout with a realistic mix of portrait, landscape, and square images
- QA the PhotoSwipe lightbox: keyboard navigation, touch swipe, caption display, close behavior
- QA responsive column breakpoints on real device sizes
- QA video autoplay behavior across browsers (Chrome, Firefox, Safari) — Safari is sometimes strict about autoplay policies even for muted video
- Decide whether videos should have any click interaction (e.g. a dialog expand) or whether the grid-only experience is sufficient
- Consider whether `alignwide` / `alignfull` block support on the outer wrapper needs any shell placement rules in `_wordpress-blocks-baseline.scss`

# Ready for human QA

# Done
- Installed `masonry-layout`, `photoswipe`, and `@types/masonry-layout` as frontend dependencies
- Created `apps/cms/wp-content/plugins/my-website-blocks/blocks/mega-gallery/block.json` with InnerBlocks support and wide/full align support
- Created `apps/cms/wp-content/plugins/my-website-blocks/blocks/mega-gallery/editor.js` — plain JS editor UI using WordPress globals, no build step
- Registered the block via `register_block_type(__DIR__ . '/blocks/mega-gallery')` in `my-website-blocks.php`
- Created `apps/frontend/components/content/blocks/MegaGalleryBlock.vue` — parses child image/video blocks from `renderedHtml`, initializes Masonry.js client-side, opens PhotoSwipe on image click
- Registered `my-website/mega-gallery` in the `BlockChildren.vue` block registry
- Added `photoswipe/style.css` to the global CSS array in `nuxt.config.ts`
