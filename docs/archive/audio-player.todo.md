# Custom Audio Player Spike — To Do

## Status: ✅ Closed

See [audio-player.md](audio-player.md) for the conceptual model, design
direction, constraints, and open questions.

---

## Background

WordPress audio blocks currently render through the browser's native
`<audio controls>` UI. That native control is difficult to style and has been
involved in repeated mobile overflow debugging. The content-blocks polish spike
intentionally stopped short of forcing a visual frame around the native player
because browser QA showed the meaningful control surface remained white and
browser-owned.

This spike should replace the native control surface with a small, accessible,
brand-voice-compliant custom player while keeping a real `HTMLAudioElement` as
the playback engine and preserving fallback behavior.

The work should be approached as both design and engineering. The player needs
to be visually right for Blue Atlas, but it also needs to be boringly robust:
SSR-safe, keyboard-operable, narrow-screen-contained, and understandable in the
codebase.

## Project Organization

- Conceptual doc: [audio-player.md](audio-player.md)
- To-do doc: this file
- Spike process reference: [how-to-spike.md](../how-to-spike.md)
- Origin scratch note: [../scratch/audio-player.md](../scratch/audio-player.md)
- Related archived spike: [content-blocks.md](content-blocks.md)
- Related mobile work: [mobile-qa1.todo.md](../mobile-qa1.todo.md)
- Likely frontend component: `apps/frontend/components/content/blocks/AudioBlock.vue`
- Likely shared recipe: `packages/styles/shared-components/_audio-block.scss`
- Generated editor CSS, if editor-relevant styles change:
  `apps/cms/wp-content/themes/my-website-editor-theme/editor.css`

## General Principles

- Progressive enhancement first: native audio must remain usable until custom
  controls initialize.
- Do not make no-JavaScript users stare at inert custom buttons.
- Preserve real WordPress-authored audio data rather than hardcoding an ideal
  fixture shape.
- Keep the player small and article-native, not app-like.
- Use native controls where they help accessibility, especially
  `<button>` and `<input type="range">`.
- Do not add a third-party media player library.
- Do not hide captions inside raw HTML; keep audio captions on the same shared
  caption styling path as other figures.
- Treat mobile containment as a core requirement, not an afterthought.
- Prefer readable local code over premature helper extraction.
- Avoid touching unrelated mobile-qa1 work unless a link or note needs to point
  at this spike.

## Current State Overview

- `AudioBlock.vue` renders audio from sanitized/extracted WordPress block HTML.
- Audio captions were already split out during content-blocks work so they can
  use the shared figure-caption treatment.
- The native audio element itself remains browser-rendered and visually hard to
  integrate.
- Mobile QA added defensive overflow clipping for wide/full audio blocks, but
  the root cause is not fully settled.
- The active design preference is a custom control surface that blends into the
  article ground, uses signal-blue accents sparingly, and avoids a heavy outer
  card frame.
- First-pass implementation is complete:
  - `AudioBlock.vue` progressively enhances from native controls to custom
    controls after mount.
  - Native controls remain the SSR/initial-render fallback.
  - The enhanced player preserves `src`, nested `<source>` entries, `preload`,
    `loop`, `muted`, alignment classes, and shared caption styling.
  - The enhanced player uses a real `<audio>` element, native `<button>`, and
    native `<input type="range">`.
  - Error state exposes a direct "Open audio file" link when a source URL is
    available.
- First-pass design refinement is complete:
  - Removed the white/faint surface box and blue sidebar so the player recedes
    into the cream article ground.
  - Replaced the large text button with a small pure-CSS play/pause glyph.
  - Kept the play/pause marker blue, with ink hover/focus color.
  - Fixed ended playback state so progress snaps to the media duration.
- Second design/layout refinement is complete:
  - Wide/full audio blocks get explicit phone containment so they do not create
    page-level horizontal scroll.
  - The progress range now sits inside a clipped shell so the native thumb can
    visually reach the rail edge without expanding the block.
  - The play/pause glyph now transitions between triangle and pause-bar states
    and respects `prefers-reduced-motion`.
- Third mobile layout refinement is complete:
  - Removed the wide/full phone block-level overflow clipping as the main
    strategy.
  - Added intrinsic root sizing (`min-width: 0`, `max-width: 100%`) and
    phone-only internal player gutters so normal and wide players fit by layout.
  - Top-aligned the play button with the progress rail on phone, with the time
    readout below the rail.
- Fourth mobile/progress refinement is complete:
  - Corrected the phone selector so wide/full audio collapses to the content
    column on phone through `content-flow-child` instead of an ineffective
    nested selector.
  - Replaced native range painting with a custom drawn rail/thumb while keeping
    the real range input invisible and interactive.
  - The visible thumb is now clamped inside the rail bounds, so the end state is
    drawn deterministically instead of depending on browser range thumb geometry.
- Fifth overflow refinement is complete:
  - Reset the root audio `<figure>` margin with `margin: 0 0 var(--space-7)`.
  - This addresses the likely remaining overflow cause: browser default figure
    side margins adding extra width outside the content-flow grid column.
- Automated verification passed repeatedly, and user browser/keyboard/mobile QA
  accepted the block on 2026-06-29.

## Historical To Do / Edge Cases

No active implementation tasks remain. Unchecked items below are preserved as
historical edge cases or future follow-up candidates, not as blockers for this
closed spike.

### 1. Discovery

- [x] Inspect `AudioBlock.vue` and confirm exactly how audio HTML and captions
  are extracted today.
- [x] Inspect `_audio-block.scss` and confirm which width/alignment behavior
  already lives in the shared recipe.
- [x] Inspect any shared helpers used by media blocks, especially caption and
  preload/default helpers.
- [x] Inspect the seeded QA kitchen sink WordPress audio block output for:
  - [x] normal audio
  - [x] wide audio
  - [ ] full audio, if present
  - [x] captioned audio
  - [ ] audio with nested `<source>` children
  - [ ] audio with fallback content beyond a direct `src`
- [ ] Reproduce or re-check the mobile overflow case before changing behavior,
  so the final fix can be tied to a known root or at least a known symptom.
- [ ] Confirm whether WordPress emits any useful audio block attributes through
  structured block data beyond rendered HTML and alignment.

### 2. Decide The Enhancement Shape

- [x] Choose the exact fallback/enhancement path.
  Recommended starting model: render native `<audio controls>` for SSR and
  initial client render, then enhance to custom controls on mount if sources are
  usable.
- [x] Decide whether the playback `<audio>` should be visually hidden,
  non-controlled but present, or kept as a fallback element outside the custom
  UI.
- [x] Decide whether a `<noscript>` fallback is needed in addition to the native
  initial render.
- [x] Decide whether to extract a `CustomAudioPlayer.vue` child component or
  keep the first pass inside `AudioBlock.vue`.
- [x] Decide whether the first pass should pause other audio players when a new
  one starts. Recommended: defer unless QA proves this is needed.

### 3. Parse And Preserve WordPress Audio Data

- [x] Preserve the primary audio `src`.
- [x] Preserve nested `<source src type>` entries.
- [x] Preserve `preload`.
- [x] Preserve `loop` and `muted` if emitted.
- [x] Preserve direct audio links when possible by exposing the source URL in
  the enhanced error state.
- [ ] Preserve fallback text beyond direct audio links when present.
- [x] Preserve alignment classes from the rendered wrapper and/or structured
  attributes.
- [x] Keep arbitrary attributes and event-handler attributes out of the custom
  player path.
- [x] Make missing or malformed audio source data fail back to native controls
  rather than rendering a broken custom shell.

### 4. Build Player State And Controls

- [x] Track `isEnhanced`.
- [x] Track `isPlaying`.
- [x] Track `currentTime`.
- [x] Track `duration`.
- [x] Track whether seeking is currently available.
- [x] Track loading/waiting state.
- [x] Track error state and show useful fallback text/link.
- [x] Wire `loadedmetadata`, `durationchange`, `timeupdate`, `play`, `pause`,
  `ended`, `waiting`, `canplay`, and `error`.
- [x] Clean up all event listeners on unmount. Event listeners are template
  listeners bound to the component-owned audio element and are cleaned up with
  Vue teardown.
- [x] Format time as compact readable text, such as `0:12`.
- [x] Support play/pause from a native button.
- [x] Support seeking through a native range input.
- [x] Clamp seeking values to valid media duration by disabling seek until a
  finite duration exists.
- [x] Ensure multiple audio players on one page work independently by keeping
  state component-local.

### 5. Accessibility Pass

- [x] Use a native `<button>` for play/pause.
- [x] Give play/pause an accessible label that changes with state.
- [x] Use a native `<input type="range">` for progress unless a custom slider is
  explicitly justified.
- [x] Give the range a clear accessible label.
- [x] Ensure visible time/duration text updates.
- [x] Ensure disabled/loading/error states are not keyboard traps.
- [x] Verify keyboard operation in browser:
  - [x] tab to play/pause
  - [x] Space/Enter toggles play/pause
  - [x] tab to range
  - [x] arrow keys seek via native range behavior
- [x] Preserve focus-visible styling.
- [x] Respect `prefers-reduced-motion` for any icon/progress animation. No
  animation was added in the first pass.

### 6. Visual Styling

- [x] Remove dependence on native audio-control visual styling for the enhanced
  state.
- [x] Keep the outer figure from reading as a heavy card.
- [x] Use article-ground or faint-surface treatment rather than the earlier
  bordered native-control wrapper.
- [x] Use signal blue as a restrained interactive accent.
- [x] Style time readouts as quiet mono metadata.
- [x] Style the progress rail and thumb with enough touch target area.
- [x] Keep captions on the shared figure-caption recipe.
- [x] Ensure normal audio blocks align with the article content column.
- [x] Ensure wide/full audio blocks respect content-flow alignment without
  horizontal overflow.
- [ ] Ensure left/right aligned audio blocks behave intentionally on desktop and
  collapse safely on phone.
- [x] Ensure all player internals use `box-sizing: border-box` and `min-width: 0`
  where shrinking matters.

### 7. Mobile Overflow QA

- [x] Test at a narrow phone viewport around 390px.
- [ ] Test a smaller phone viewport if practical.
- [x] Confirm normal audio blocks do not create page-level horizontal scroll.
- [x] Confirm wide audio blocks do not create page-level horizontal scroll.
- [ ] Confirm full audio blocks do not create page-level horizontal scroll.
- [x] Confirm audio with captions does not create page-level horizontal scroll.
- [x] Confirm progress rail and time text shrink or wrap instead of pushing the
  viewport.
- [x] Confirm nearby wide/full media blocks are not masking the audio result.

### 8. Verification

- [x] Run focused lint for touched Vue files after implementation.
- [x] Run `corepack pnpm styles:wp-editor` if editor-relevant shared styles
  change.
- [x] Run `corepack pnpm typecheck`.
- [x] Run `corepack pnpm check` when feasible.
- [x] Verify SSR route responds without server failure.
- [ ] Verify SSR/hydration does not warn or mismatch in browser.
- [ ] If static output is materially affected, run the appropriate static
  generation or inspection command before closing the spike.

### 9. Current Follow-Up Notes

- [ ] The local dev frontend responded at `http://127.0.0.1:3001/`.
- [ ] The expected kitchen-sink route
  `http://127.0.0.1:3001/writing/block-qa-kitchen-sink-post` was not present in
  the currently connected dev CMS during this pass, so visual QA still needs the
  user's browser/CMS state.
- [ ] If browser QA accepts the player, decide whether preserving arbitrary
  fallback text beyond a direct source link is worth doing before closing the
  spike.

## Ready For Human QA

Human QA is complete. The user accepted the browser visual behavior, mobile
overflow behavior, and keyboard controls on 2026-06-29.

Expected human QA checks after implementation:

- [x] Normal audio block: player feels intentionally integrated with article
  typography and spacing.
- [x] Wide audio block: player has functional breathing room and does not create
  horizontal overflow.
- [x] Phone viewport: no horizontal scrolling into blank page ground.
- [x] Phone viewport: controls remain large enough to tap.
- [x] Captioned audio block: caption styling matches other figure captions.
- [x] Multiple audio blocks: playback controls do not visually or behaviorally
  interfere with each other.
- [x] Keyboard controls: play/pause and seeking work through native controls.
- [ ] Error/fallback state, if testable: user can still reach the audio source.

## Done

- [x] 2026-06-29 — Promoted the custom audio player scratch note into an active
  two-doc spike.
- [x] 2026-06-29 — Captured the current design direction: compact field
  instrument, article-native surface, restrained signal-blue accent, shared
  caption treatment, and progressive enhancement over native fallback.
- [x] 2026-06-29 — Implemented first-pass progressive custom audio player in
  `AudioBlock.vue`.
- [x] 2026-06-29 — Reworked `_audio-block.scss` so enhanced audio uses a custom
  player surface with signal-blue play control, styled range rail, mono time
  readout, shared captions, and phone-safe wrapping.
- [x] 2026-06-29 — Verification passed:
  focused ESLint for `AudioBlock.vue`, `corepack pnpm styles:wp-editor`,
  `corepack pnpm typecheck`, and full `corepack pnpm check`.
- [x] 2026-06-29 — Refined custom player styling after human review: removed
  the white ground box and blue sidebar, replaced the large text button with a
  smaller CSS play/pause icon, and fixed ended-state progress so the indicator
  reaches the right edge when playback completes.
- [x] 2026-06-29 — Verification passed again after audio style refinement:
  focused ESLint for `AudioBlock.vue`, `corepack pnpm styles:wp-editor`,
  `corepack pnpm typecheck`, and full `corepack pnpm check`.
- [x] 2026-06-29 — Refined the mobile audio layout after QA showed wide audio
  still caused horizontal scroll. Added phone containment for wide/full audio,
  moved the range into a clipped shell so the playhead can reach the rail edge,
  and animated the CSS play/pause glyph between states with a reduced-motion
  fallback.
- [x] 2026-06-29 — Verification passed again after mobile overflow/playhead
  refinement: focused ESLint for `AudioBlock.vue`, `corepack pnpm
  styles:wp-editor`, `corepack pnpm typecheck`, and full `corepack pnpm check`.
- [x] 2026-06-29 — Refined mobile audio layout again after QA showed the play
  buttons were vertically misaligned and normal audio could still overflow.
  Removed block-level clipping as the main containment strategy, added intrinsic
  min/max sizing and phone gutters, and aligned the button with the rail instead
  of centering it against the full progress/time stack.
- [x] 2026-06-29 — Verification passed again after the intrinsic mobile layout
  fix: focused ESLint for `AudioBlock.vue`, `corepack pnpm styles:wp-editor`,
  `corepack pnpm typecheck`, and full `corepack pnpm check`.
- [x] 2026-06-29 — Reworked mobile/progress handling after QA showed horizontal
  overflow persisted and the playhead still did not visually reach the end.
  Wide/full audio now collapses to the content column on phone via the correct
  `content-flow-child` selector, and the visible rail/thumb are custom-drawn
  while the real range input remains accessible and interactive.
- [x] 2026-06-29 — Verification passed again after the custom rail/thumb fix:
  focused ESLint for `AudioBlock.vue`, `corepack pnpm styles:wp-editor`,
  `corepack pnpm typecheck`, and full `corepack pnpm check`.
- [x] 2026-06-29 — Reset audio figure margins after QA showed horizontal
  overflow still present even though the internal player fit its own box. The
  likely root was the user-agent `<figure>` side margin combining with
  `width: 100%`.
- [x] 2026-06-29 — Verification passed again after the figure margin reset:
  focused ESLint for `AudioBlock.vue`, `corepack pnpm styles:wp-editor`,
  `corepack pnpm typecheck`, and full `corepack pnpm check`.
- [x] 2026-06-29 — User marked the audio block fully QAed, including visual
  behavior, mobile overflow behavior, and keyboard controls.
- [x] 2026-06-29 — Closed and archived the spike. Durable lessons folded into
  `AGENTS.md`, `docs/design-system.md`, and `to-do.md`.
