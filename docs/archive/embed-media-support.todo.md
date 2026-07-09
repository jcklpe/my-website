# Embed And External Media Support Spike - To Do

## Background
This spike focuses on embed-media polish and provider support follow-through after the content-blocks work, with emphasis on branded embed framing, shared caption behavior, and provider-aware handling (including Sketchfab feasibility).

## Project Organization
- Conceptual doc: `docs/archive/embed-media-support.md`
- This operational doc: `docs/archive/embed-media-support.todo.md`
- Related references: `docs/design-system.md`, `docs/visual-design.md`, `docs/archive/content-blocks.md`, `docs/archive/content-blocks.todo.md`

## General Principles
- Keep provider behavior intact; style around provider constraints instead of fighting them.
- Keep embed containment robust on phone and tablet widths.
- Reuse shared caption styling path where possible; avoid one-off caption systems.
- Prefer smallest provider-aware implementation that keeps code readable.

## Current State Overview
- Conceptual scope has been archived as closed work.
- Implementation pass is complete.
- Open discovery includes current provider coverage, rendered HTML shape, and Sketchfab viability.
- Initial feasibility investigation completed on 2026-07-08:
	- Existing frontend already applies Blue Atlas border/shadow/caption framing to embed and video blocks.
	- Provider internal player controls/chrome are inside cross-origin iframes and are not CSS-styleable from this codebase.
	- Provider tuning is possible via iframe URL parameters and provider APIs, not via direct CSS restyling of controls.
- Scope has been narrowed after investigation:
	- Closed as no-go: trying to restyle internal YouTube/Vimeo player controls to match Blue Atlas chrome.
	- Remaining implementation scope: Sketchfab support validation and smallest required provider-aware support.

## To Do
- [x] Implementation scope closeout
- [x] Mark no-go implementation decisions as complete in Done (internal provider-control restyling is out of scope/technically blocked by iframe boundaries).
- [x] Validate Sketchfab URL rendering path in current embed flow on a QA fixture route.
- [x] Validate CMS authoring behavior: plain Sketchfab model URLs should now be accepted in core Embed blocks after provider registration.
- [x] Verify Sketchfab containment at phone width (no overflow/scrollbar) and desktop usability.
- [x] Verify the reported full-width caption clipping case on QA content after the video caption mixin fix.
- [x] Verify wide/full embed height cap feels aligned with other media surfaces.
- [x] Verify left/right aligned embeds now float correctly across desktop and phone constraints.
- [x] Run `corepack pnpm check` and record result in Done.
- [x] Move only remaining visual checks into Ready for Human QA.

## Questions for User
- [x] Decision: embed frame should match image/media border treatment unless a concrete regression appears.
- [x] Decision: when tradeoffs appear, preserve provider interaction fidelity over strict visual parity.

## Investigation Findings (2026-07-08)
- Current implementation already uses Blue Atlas framing for embeds/videos:
	- `apps/frontend/components/content/blocks/EmbedBlock.vue`
	- `apps/frontend/components/content/blocks/VideoBlock.vue`
	- `packages/styles/shared-components/_embed-block.scss`
- Current provider logic in `EmbedBlock.vue` is explicit for YouTube and Vimeo URL extraction with a generic iframe fallback path.
- This means we can style:
	- Outer frame, mat, shadow, spacing, aspect-ratio shell, caption presentation, alignment behavior, and responsive containment.
- This means we cannot style directly:
	- Native YouTube/Vimeo/Sketchfab internal controls, typography, iconography, and transport chrome, because those are rendered inside cross-origin iframes.
- Provider-level tuning that is still possible:
	- YouTube: iframe params and IFrame API behavior controls (playback options, caption defaults, controls on/off, inline playback options).
	- Vimeo: extensive player parameters including control visibility and accent/color settings, subject to account/embed settings.
	- Sketchfab: Viewer API + required iframe permissions/sandbox allowances for interaction/fullscreen/XR; still not direct CSS control of internal chrome.
- Practical Blue Atlas direction from this finding:
	- Keep existing shared frame language.
	- Optionally add conservative provider parameter tuning where it improves cohesion without hiding key controls or breaking interaction.
	- Explicitly avoid trying to "skin" provider internals unless we replace embeds with custom players (out of scope).

## Ready for Human QA
No open QA items. Human QA signoff received on 2026-07-08 for the implemented embed/video behavior in this spike phase.

## Done
- Promoted conceptual spike doc from `docs/scratch/embed-media-support.md` to `docs/active-spikes/embed-media-support.md`.
- Created active operational tracker `docs/active-spikes/embed-media-support.todo.md`.
- Completed feasibility investigation for YouTube/Vimeo/Sketchfab embed styling boundaries.
- Closed as no-go: direct CSS restyling of provider internal controls/chrome inside cross-origin iframes.
- Settled direction: keep existing Blue Atlas embed frame/caption shell and prioritize interaction fidelity over strict visual parity for provider internals.
- Routed new follow-up note (2026-07-08): full-width caption clipping + requirement that core/video captions must use the same shared caption mixin path as other media captions.
- Implemented shared caption mixin path for core/video captions in `apps/frontend/components/content/blocks/VideoBlock.vue` via `:deep(figcaption) { @include figure-caption; }`.
- Implemented first-pass Sketchfab provider support in `apps/frontend/components/content/blocks/EmbedBlock.vue`:
	- Added robust embed URL extraction fallbacks (wrapper div, paragraph text, first anchor href).
	- Added Sketchfab URL detection and embed-source generation for common model URL shapes.
	- Added Sketchfab iframe rendering path with interaction/fullscreen/XR permission attributes.
- Implemented second-pass Sketchfab and embed layout fixes:
	- `apps/cms/wp-content/plugins/project-bootstrap/project-bootstrap.php`
		- Registered Sketchfab oEmbed provider patterns so plain model URLs can be accepted in the WordPress core Embed block.
	- `apps/frontend/components/content/blocks/EmbedBlock.vue`
		- Prioritized the controlled Sketchfab iframe path even when fallback iframe markup exists.
		- Added iframe `src` extraction fallback so Sketchfab detection still works for iframe-only rendered embed markup.
	- `packages/styles/shared-components/_embed-block.scss`
		- Added left/right float alignment behavior for embed blocks.
		- Added a centralized wide/full media height cap through `embed-media` (`max-height: var(--article-media-height-full)`).
		- Added full/wide caption centering behavior and safer caption wrapping.
	- `apps/frontend/components/content/BlockChildren.vue` and `apps/frontend/components/content/FloatBreakoutGroup.vue`
		- Added `core/embed` and `core/video` to float-breakout lead handling so left/right embeds/videos float in the same content-flow model as other floated media.
	- Follow-up regression fix:
		- Moved the height cap off the shared `embed-media` mixin and scoped it to Sketchfab provider embeds only (`.provider-sketchfab`) so wide/full video and Vimeo embeds no longer pillarbox with side bars.
	- Follow-up adjustment after QA feedback:
		- Restored a centralized height-cap mixin in `packages/styles/shared-components/_embed-block.scss` (`@mixin media-height-cap`) and reattached it to `embed-media`.
		- Updated `apps/frontend/components/content/blocks/VideoBlock.vue` to keep source-native video aspect ratio (`aspect-ratio: auto`) while still using the shared media cap token, reducing side bars on non-16:9 video sources.
		- Added a low-risk editor-side Sketchfab oEmbed tweak in `apps/cms/wp-content/plugins/project-bootstrap/project-bootstrap.php` to inject `scrolling="no"` on Sketchfab iframes where absent.
- Verification:
	- `corepack pnpm typecheck` passed.
	- `corepack pnpm lint` passed with baseline warnings only (`vue/no-v-html` in `about.vue` and `now.vue`).
	- `php -l` could not be run in this environment because `php` is not installed in the host shell.
- Native `core/video` stabilization follow-through:
	- Reworked `apps/frontend/components/content/blocks/VideoBlock.vue` wide/full/default geometry to use a single cap formula driven by `--video-max-height` and runtime measured video aspect ratio (`videoWidth/videoHeight`) with safe attribute fallback.
	- Kept the cap token aligned to the shared media cap (`--article-media-height-full`, currently 75vh) and removed element-level max-height forcing that produced internal side gutters in native video players.
	- Final user QA pass confirmed native wide/full video now reaches intended capped height without reintroducing sidebars.
- Follow-up frontend error fix (post-QA polish):
	- Fixed a style-compile regression in `apps/frontend/components/content/blocks/VideoBlock.vue` where `@include mixins.breakpoint(phone)` caused Nuxt/Vite to fail (`IPC connection closed` surface error); corrected to the project-standard injected mixin call `@include breakpoint(phone)`.
	- Re-ran `corepack pnpm typecheck` and `corepack pnpm lint`; both passed with only baseline warnings in `about.vue` and `now.vue`.
- Final closeout verification:
	- Ran `corepack pnpm check` successfully (editor CSS regeneration, frontend lint, frontend typecheck).
	- Lint remains at baseline warnings only (`vue/no-v-html` in `about.vue` and `now.vue`).
	- Human QA signoff confirms the native-video cap/sizing issue is resolved and no longer bouncing between side-gutter and undersized states.
