# Custom Audio Player Spike

## Goal

Replace the browser-default audio block controls with a small, brand-voice-compliant custom player for WordPress audio blocks rendered on the Nuxt frontend.

The current native `<audio controls>` surface is difficult to integrate visually. Chrome and other browsers expose only coarse styling of the control box; the internal buttons, scrubber, time readout, and control colours are browser UI. Per MDN, default controls can be sized/framed as one unit, but individual internal components are not reliably styleable; a consistent cross-browser design requires custom controls wired to `HTMLMediaElement`.

Reference links:

- User-supplied CSS-Tricks article: <https://css-tricks.com/lets-create-a-custom-audio-player/>
- MDN `<audio>` reference and usage notes: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio#usage_notes>

## Non-Goals

- Do not rebuild a podcast app.
- Do not add waveform rendering unless a real content need appears.
- Do not autoplay. Audio playback must remain user-initiated.
- Do not hide the native `<audio>` element in a way that removes accessible media semantics without replacing them carefully.
- Do not style native controls with browser-specific pseudo-elements as the main solution. That path is brittle and inconsistent.

## Proposed Shape

Create a frontend-only `AudioPlayerBlock.vue` or expand `AudioBlock.vue` into a controlled custom player:

- Keep a real `<audio>` element in the component, but remove the `controls` attribute for the custom UI path.
- Use `HTMLMediaElement` state and events for playback:
  - `play`
  - `pause`
  - `loadedmetadata`
  - `timeupdate`
  - `durationchange`
  - `ended`
  - `error`
- Provide native fallback if JavaScript fails or the custom UI cannot initialize.
- Preserve the existing caption extraction and shared figure-caption styling.

## Interface Sketch

The player should feel like a compact field instrument, not a glossy media widget:

- A cream/paper row that blends into the article ground, with no heavy outer card.
- A signal-blue left strip or small play control as the primary accent.
- Mono time readouts (`0:12 / 1:43`) as quiet instrumentation.
- A thin ink or signal-blue progress rail with a draggable thumb large enough for touch.
- Play/pause as a native `button` with an accessible label.
- Optional download link only if WordPress provides one or if a direct audio URL should be exposed.
- Caption below, using the same shared figure-caption recipe as image/table/embed captions.

Potential visual recipe:

- Shell: transparent or `--color-surface-faint`, no hard shadow by default.
- Play button: square or circular signal-blue outline/fill, large enough for tap.
- Progress: thin rail with hard-edged fill, no rounded glossy styling.
- Time: mono, muted, small.
- Focus: use the global focus-visible fallback plus local signal-blue affordance.

## Accessibility Requirements

- Play/pause is a real `<button>`.
- Progress is either:
  - an `<input type="range">` with an accessible label, or
  - a custom slider only if ARIA slider semantics and keyboard controls are fully implemented.
- Keyboard:
  - Space/Enter toggles play on the play button.
  - If range is focused, arrow keys seek per native range behavior.
- Announce current time/duration in visible text.
- Preserve fallback text/link for unsupported audio.
- Respect reduced-motion if any animated progress or icon treatment is added.

## Data / Markup Notes

`AudioBlock.vue` currently extracts the `<audio>` element and caption from `renderedHtml`.

Implementation should preserve:

- audio `src` and nested `<source>` tags
- `preload` defaults added by `addMediaPreloadDefaultsToHtml`
- caption HTML via `extractFigcaptionHtml`
- alignment classes from the WordPress figure wrapper

If using Vue-rendered audio rather than `v-html`, parse enough attributes to preserve `src`, `preload`, `loop`, and source children.

## Open Questions

- Should the custom player render for all audio blocks or only when JavaScript is available after hydration?
- Should the default fallback be visible inside `<noscript>`?
- Should seeking be allowed before metadata loads?
- Should wide audio blocks remain full width, or should custom controls cap at the article column even when the block is wide?
- Should download be part of audio controls, or should file-download blocks remain the download affordance?

## Implementation Steps

1. Inspect real WordPress audio block HTML variants from the QA fixture.
2. Decide whether to parse audio attributes into Vue state or keep a hidden/native audio element rendered from sanitized HTML.
3. Build a minimal custom player:
   - play/pause button
   - current time
   - duration
   - range seek bar
   - loading/error state
4. Style against Blue Atlas:
   - cream/faint surface
   - signal-blue accent
   - mono time metadata
   - shared caption recipe
5. Verify with keyboard, screen reader-friendly labels, mouse, and touch.
6. Verify static generation/hydration does not mismatch.
7. Update `docs/content-blocks.todo.md` or promote this scratch doc into an active two-doc spike when work begins.
