---
attention: live
---
# Lightbox Transitions
Continues from: docs/archive/lightbox.md

## Scope
Animate photographs from their actual inline bounds into PhotoSwipe and back. Preserve cropped thumbnails, keyboard operation, focus restoration, reduced motion, intentional external links, and mixed-media galleries. Keep PhotoSwipe as the shared implementation.

Only offer enlargement when the full-resolution source contains more pixels than its inline presentation needs. Measure the rendered image, resolve actual source dimensions, and update eligibility when responsive layout changes. Unknown or failed sources must not acquire a misleading zoom affordance. Avoid preloading every full-resolution image at page entry.

## Implementation direction
Use PhotoSwipe's thumbnail and bounds hooks for the zoom, with native image buttons only when eligible. Resolve dimensions near the viewport and cache them for opening. Source geometry must account for image borders, contain/cover sizing, and gallery cropping. Article text and CMS content remain unchanged.
