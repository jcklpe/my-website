---
attention: live
---
# Lightbox Transitions — Tasks
## Background
Refine the existing PhotoSwipe integration; see `lightbox-transitions.md`.
## General Principles
Preserve native semantics, reduced motion, real source dimensions, gallery ordering, and intentional links. No additional lightbox library.
## Current State Overview
The shared viewer zooms from measured thumbnail bounds, accounts for borders and contain/cover cropping, and hides the original during the flight. Full-source dimensions are cached and resolved near the viewport. Ineligible images retain ordinary presentation, with no button or zoom cursor. Core Gallery and Mega Gallery exclude them from viewer navigation. Media/Text and footnote HTML use native buttons added only after eligibility is established. Source images are restored on close or component disposal.
## To Do
## Ready For Human QA
- L1. Connect inline thumbnail geometry to shared PhotoSwipe opening and closing, including cropped gallery images and mixed-media galleries. Implemented; browser checks confirm 400ms opening and 300ms closing transforms, cropped bounds, gallery sequencing, and video playback/pause. Human review remains for the visual feel on desktop and a physical phone.
## Done
- L2. Remove actions and cursors when full-resolution images cannot enlarge, and respond to viewport changes. Verified with a controlled local fixture: a 120px source has no button at 300px presentation, gains one at 60px, and loses it when enlarged again. Undersized core/Mega gallery entries and footnote images have no action. External image links remain links. Side Projects' wide flower image has no enlargement at its desktop presentation.
- L3. Verify normal images, galleries, footnotes, Media/Text, keyboard close/focus, and reduced motion; run project checks. Browser checks cover the real Side Projects portrait plus a temporary native-component fixture (removed after verification). Confirmed opening/closing transforms, focus restoration, cropped gallery indexing after filtering, Mega Gallery video playback and pause, native footnote/Media/Text buttons, and a no-animation reduced-motion opening. Geometry tests cover resolution boundaries, letterboxing, cover cropping and focal position. `corepack pnpm check` passes with only the two existing About/Now v-html warnings; `node --experimental-strip-types --test scripts/lightbox-geometry.test.mjs` passes. Logged-in editor pattern QA is tracked separately under content-audit C15.
