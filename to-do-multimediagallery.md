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
- PhotoSwipe handles both image and video lightbox. It is dynamically imported on first click so it doesn't load until needed. Videos autoplay on open and pause when closing or swiping away.
- The block plugin (`my-website-blocks`) now has a real registered block. The `editor.js` is plain browser JS using WordPress globals (`wp.blocks`, `wp.element`, `wp.blockEditor`). No build step or webpack pipeline is needed.
- Do not add a build pipeline to `my-website-blocks` unless custom block complexity genuinely demands it. Keep it Vite-optional.
- The `columns` attribute (default 3, max 6) controls the number of masonry columns. It drives both the editor preview grid and the frontend CSS custom property `--gallery-columns`. Responsive breakpoints cap columns at 2 on tablet (≤768px) and 1 on mobile (≤480px).
- Block attributes (`columns`, `align`) are surfaced to the frontend via a PHP render callback that embeds `data-columns` and `align*` class directly in `renderedHtml`. The frontend reads these from the rendered HTML — no `attributesJSON` in GraphQL required.
- PhotoSwipe CSS is loaded globally via `nuxt.config.ts` css array.

# Current State Overview
Block is functional end-to-end. Images and videos render in a masonry grid. Images open in a PhotoSwipe lightbox with swipe navigation and captions. Videos open in the PhotoSwipe lightbox with autoplay on open and pause on close/slide-away. The editor has a mini masonry preview grid so items aren't full-width. A columns control (1–6) is available in the editor Inspector panel and respected on the frontend. `alignwide` / `alignfull` are wired through to the frontend grid placement. An "Add media" button in the editor opens the WordPress media library with multi-select enabled, inserting all selected images/videos as inner blocks in one step. A fixture for the block is included in the QA seed script.

# To Do

# Ready for human QA
- QA the editor experience: confirm InnerBlocks allows only image/video, confirm the "Add media" button opens multi-select media library, confirm columns control, confirm alignment options in toolbar
- QA the frontend masonry layout with a realistic mix of portrait, landscape, and square images
- QA the PhotoSwipe lightbox: keyboard navigation, touch swipe, caption display, close behavior
- QA video autoplay in lightbox on Safari — Safari is sometimes strict about autoplay policies even for muted video
- QA responsive column breakpoints on real device sizes
- QA `alignwide` and `alignfull` on the frontend with the article shell grid

# Done
- Installed `masonry-layout`, `photoswipe`, and `@types/masonry-layout` as frontend dependencies
- Created `apps/cms/wp-content/plugins/my-website-blocks/blocks/mega-gallery/block.json` with InnerBlocks support, wide/full align support, and a `columns` attribute (default 3, max 6)
- Created `apps/cms/wp-content/plugins/my-website-blocks/blocks/mega-gallery/editor.js` — plain JS editor UI using WordPress globals, no build step; includes mini masonry grid preview, columns InspectorControls panel, and "Add media" button using `MediaUpload` with `multiple: true` for bulk insert
- Registered the block via `register_block_type` with a PHP render callback in `my-website-blocks.php` — callback embeds `data-columns` and `align*` class in the wrapper div so the frontend can read them from `renderedHtml` without needing `attributesJSON` in GraphQL
- Created `apps/frontend/components/content/blocks/MegaGalleryBlock.vue` — parses child image/video blocks from `renderedHtml`, reads `data-columns` and alignment class from the block's own `renderedHtml`, initializes Masonry.js client-side, opens PhotoSwipe on click for both images and videos
- Registered `my-website/mega-gallery` in the `BlockChildren.vue` block registry
- Added `photoswipe/style.css` to the global CSS array in `nuxt.config.ts`
- Fixed video autoplay in lightbox: initial slide deferred until `openingAnimationEnd` (PhotoSwipe defers `appendHeavy` until opener animation completes)
- Added `.mega-gallery-block` to `_structural-relations.scss` content-flow grid rules with `alignwide`/`alignfull` support
- Wired `columns` and `align` through to the frontend Vue component via PHP render callback + `renderedHtml` parsing
- Added `my-website/mega-gallery` fixture to the QA seed script with four images and one CC0 video, plus a wide 4-column variant
