# Embed And External Media Support Spike

## Status: closed / archived (2026-07-08)

This spike is complete. Human QA has signed off the implemented behavior, verification commands are recorded, and the spike docs are ready for archive.

Operational checklist: [embed-media-support.todo.md](embed-media-support.todo.md).

## Goal
Make externally embedded media feel intentional in the Blue Atlas content system instead of like raw provider iframes dropped into the article.

This spike covered video embed polish and provider support that does not belong to Mega Gallery, custom audio, or generic mobile QA.

## Current Context
The content-blocks spike brought default embeds, YouTube, and Vimeo into the content-flow width system and gave common video surfaces more consistent media framing. That solved the basic layout problem, but provider iframes still mostly read as provider chrome. The next pass should decide how much of that chrome can be art-directed without fighting the embed provider's own constraints.

This spike should stay provider-aware. YouTube, Vimeo, and Sketchfab have different embed capabilities, privacy modes, placeholder behavior, accessibility expectations, and allowlist attributes. Do not force all providers through one over-abstracted component before their real markup and constraints are inspected.

## Progress Snapshot (2026-07-08)
- Sketchfab support is implemented end-to-end through CMS provider registration and frontend provider-aware rendering.
- Provider-control restyling is closed as a no-go because YouTube/Vimeo/Sketchfab chrome lives inside cross-origin iframes.
- Native `core/video` sizing is stabilized with a shared height-cap token plus runtime video metadata ratio so wide/full blocks can reach intended capped height without pillarbox side gutters.
- Caption styling for video blocks is on the shared figure-caption path.
- A follow-up frontend compile regression from a namespaced breakpoint call in `VideoBlock.vue` was fixed by using the injected `@include breakpoint(phone)` pattern used across frontend SFCs.

## Scope

### Branded Video Embeds
The site should add a more branded look to video embeds if possible.

Questions to answer:

- Can YouTube and Vimeo embeds get a consistent outer frame, border, and shadow
  treatment without introducing mobile overflow?
- Should video embeds use the same image/media border treatment, or a slightly
  different "screen" register?
- Should provider iframes sit flush in the frame, or should there be a small mat
  around them?
- Can captions for video/embed blocks use the same shared figure-caption path as
  image, gallery, table, and audio captions?
- Do provider fallback states need custom styling when embeds fail or are blocked?

Important taste note: avoid a heavy fake device frame. The treatment should feel like a Blue Atlas article media surface, not like a mock browser window around every iframe.

Caption follow-up from misc0: video captions should be styled exactly like captions for any other media/content block. They should draw from the same single root caption recipe used by image, gallery, table, audio, and other figure-like blocks. Do not special-case video captions into their own visual system unless provider markup makes a small adapter unavoidable.

### Sketchfab Support
The site should eventually support Sketchfab 3D model embeds in articles and case studies.

Sketchfab provides iframe-based embeds. Support should likely start as a provider-specific embed path rather than a custom block, unless WordPress core embed handling cannot preserve the required iframe attributes.

Questions to answer:

- Does WordPress oEmbed support Sketchfab well enough in this CMS stack, or does
  it need a custom embed allowlist/provider treatment?
- What iframe attributes are required for interactive 3D models, fullscreen, and
  user input?
- Should Sketchfab embeds use the same default embed frame as video, or a more
  interactive "model viewport" treatment?
- Should captions and fallback links be normalized the same way as other embeds?
- Does static generation preserve any Sketchfab URLs or scripts safely?

## General Principles
- Keep article layout ownership in the Nuxt block components and shared recipes.
- Preserve provider-required iframe attributes; do not strip functionality while
  sanitizing visual output.
- Prefer progressive enhancement and robust fallbacks over provider-specific hacks.
- Keep mobile containment explicit. Embed frames are common overflow sources.
- Keep external media support separate from Mega Gallery's PhotoSwipe/Masonry
  browsing model.

## Files To Inspect
- `apps/frontend/components/content/blocks/EmbedBlock.vue`
- `apps/frontend/components/content/blocks/VideoBlock.vue`
- `apps/frontend/components/content/BlockRenderer.vue`
- `packages/styles/shared-components/_embed-block.scss`
- `packages/styles/shared-components/_video-block.scss`
- `apps/frontend/utils/wordpress-html.ts`
- WordPress rendered block HTML for YouTube, Vimeo, generic iframe embeds, and
  Sketchfab embeds

## Rough Work Items
1. Capture real rendered HTML for YouTube, Vimeo, generic video, and Sketchfab
   embeds from the CMS or QA fixtures.
2. Verify which embed providers are currently recognized by the block registry.
3. Decide the shared visual frame for video-like embeds.
4. Add or refine shared caption styling for embed captions if captions are not
   already on the shared figure-caption path.
5. Add Sketchfab support through the smallest provider-aware path that preserves
   iframe functionality.
6. Test normal, wide, full, and phone layouts for each provider.
7. Run `corepack pnpm check` after implementation.

## Ready For Human QA
When implemented, human QA should inspect:

- YouTube embed visual frame and caption behavior.
- Vimeo embed visual frame and caption behavior.
- Sketchfab interactive behavior, if fixture content is available.
- Phone viewport containment with no horizontal scroll.
- Whether the treatment feels branded without over-framing provider media.
