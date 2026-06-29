# Custom Audio Player Spike

## Purpose

Replace the browser-default WordPress audio block controls on the Nuxt frontend
with a small custom player that is visually native to Blue Atlas, accessible,
and easier to contain on narrow screens.

This spike exists because native `<audio controls>` gives the project the worst
of both worlds: the outer box participates in our layout, but the meaningful UI
inside the control is owned by the browser. Chrome, Safari, and Firefox expose
different internal controls, colors, minimum widths, and touch behavior. The
site can frame the native control as a rectangle, but it cannot reliably make
the actual play button, scrubber, time display, and internal background feel
like the rest of the article system.

The audio block has also become a mobile QA pressure point. Defensive CSS can
clip overflow around the current native control, but that is a containment
patch, not a final design. A custom player lets the site own the layout all the
way down: button size, progress rail behavior, wrapping, minimum widths,
caption placement, and alignment behavior.

Reference material:

- User-supplied CSS-Tricks article: <https://css-tricks.com/lets-create-a-custom-audio-player/>
- MDN `<audio>` reference and usage notes: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio#usage_notes>

## Relationship To Other Work

This work was split out of the content-blocks polish spike. That spike removed
the experimental audio figure border/background and deliberately left native
controls alone after browser QA showed that styling the outer figure did not
change the control surface that mattered.

This spike also intersects with mobile QA. The mobile QA spike added defensive
overflow clipping around wide/full audio blocks, but the durable fix should live
here so mobile QA does not keep layering one-off guards over browser-owned UI.

This is not part of the Mega Gallery or lightbox work. Audio should remain a
compact inline media block, not a browseable media surface.

## Goals

- Render WordPress audio blocks with a custom frontend control surface.
- Preserve the real `HTMLAudioElement` as the playback engine.
- Keep SSR/no-JavaScript fallback usable.
- Preserve WordPress-authored audio sources, preload intent, alignment classes,
  and captions.
- Use the shared figure-caption treatment for audio captions.
- Eliminate mobile horizontal overflow caused by native audio controls.
- Make normal, wide, full, left, right, and centered audio block alignments
  behave consistently with the content-flow system.
- Keep the implementation small enough that it remains readable to a designer
  who can read Vue.

## Non-Goals

- Do not build a podcast player.
- Do not add playlists, chapters, transcripts, waveform rendering, playback
  speed, or skip-forward controls unless a real content need appears later.
- Do not autoplay audio.
- Do not replace the audio engine with a third-party player library.
- Do not rely on browser-specific audio-control pseudo-elements as the main
  styling strategy.
- Do not hide all native semantics without providing an accessible replacement
  and a fallback path.
- Do not make audio blocks visually heavier than images, galleries, tables, or
  code blocks. Audio should feel useful and designed, not like a dashboard card.

## Design Direction

The custom player should read as a compact field instrument embedded in an
article.

The surface should blend with the page ground rather than become a floating
module. The primary accent can be signal blue, but it should be a restrained
control accent, not a giant branded banner. Time readouts should feel like quiet
metadata. The progress rail can be crisp and mechanical, with enough target
area for touch without becoming glossy.

Recommended visual model:

- Figure shell: transparent or very faint paper surface, no hard outer card by
  default.
- Player row: compact horizontal control strip that can wrap gracefully on
  phones.
- Play/pause button: real button, strong enough to find quickly, likely square
  or circular with a signal-blue treatment.
- Progress rail: native range input styled into a thin rail with a visible fill
  and a touch-friendly thumb.
- Time display: mono, small, muted, formatted as `0:12 / 1:43`.
- Caption: below the player, using the shared editorial caption recipe.
- Error state: plain text and a direct audio link when possible.

This should avoid the earlier failed direction of putting a border and card
frame around the native `<audio>` element. The player itself is the designed
object; the figure wrapper should not pretend to style controls it does not own.

## Accessibility Contract

The custom control surface must be keyboard and screen-reader operable.

- Play/pause must be a native `<button>`.
- The play button label must reflect the current action, such as `Play audio`
  or `Pause audio`.
- Seeking should use an `<input type="range">` unless there is a compelling
  reason to implement a custom ARIA slider.
- The range must have an accessible label.
- Native range keyboard behavior should handle arrow-key seeking.
- Visible text should expose current time and duration.
- Loading, unavailable-duration, and error states should not create dead
  controls.
- Focus styles should preserve the global `:focus-visible` fallback and may add
  local signal-blue affordances.
- Reduced-motion should be honored if any icon or progress animation is added.
- A no-JavaScript path must keep audio playable or at least provide the direct
  audio file link.

## Enhancement And Fallback Model

Use progressive enhancement.

The safest default is:

1. SSR and the initial client render show the native `<audio controls>` fallback
   extracted from WordPress.
2. On mount, if the component can find a usable audio source and initialize
   player state, it swaps to the custom controls and keeps a real audio element
   as the hidden playback engine.
3. If initialization fails, keep the native controls visible.
4. Include a `<noscript>` fallback when the rendered structure makes that useful.

This avoids a no-JavaScript page full of inert custom buttons. It also avoids
hydration mismatch, because the initial client render can match SSR and only
enhance after mount.

The hidden playback engine should not be `display: none` if that creates browser
or accessibility problems. Prefer a visually-hidden-but-present approach, or a
plain audio element without `controls` once custom controls are active. The
implementation should choose the simplest path that keeps playback reliable.

## Data Model

`AudioBlock.vue` currently receives structured block data plus rendered
WordPress HTML. The audio block renderer should preserve enough of that HTML to
round-trip real CMS output.

Important data to preserve:

- `src` on the `<audio>` element.
- Nested `<source>` elements and their `src` / `type` attributes.
- `preload`, including defaults added by `addMediaPreloadDefaultsToHtml`.
- `loop` if WordPress emits it.
- `muted` if WordPress emits it.
- Fallback text or direct links inside the native audio markup where present.
- `figcaption` content via the existing caption extraction path.
- Alignment classes from the WordPress figure wrapper and structured block
  attributes.

Sanitize aggressively by omission. The custom player does not need arbitrary
attributes from the rendered HTML, and it should not preserve event-handler
attributes.

## Component Shape

The likely implementation should keep the public block component readable:

- Continue using `AudioBlock.vue` as the WordPress block adapter.
- Extract a focused `CustomAudioPlayer.vue` only if the state/event code makes
  `AudioBlock.vue` noisy.
- Keep parsing helpers local until there is real reuse.
- Keep captions in the block adapter so they continue to use the shared
  figure-caption styling.

State and behavior should be boring:

- `audioEl`
- `isEnhanced`
- `isPlaying`
- `currentTime`
- `duration`
- `canSeek`
- `isLoading`
- `hasError`
- `errorMessage`

Events to listen for:

- `loadedmetadata`
- `durationchange`
- `timeupdate`
- `play`
- `pause`
- `ended`
- `waiting`
- `canplay`
- `error`

Clean up event listeners on unmount. Multiple audio players on one page should
work independently. This spike does not need a global "pause other players when
one starts" behavior unless browser QA shows simultaneous audio is a problem.

## Layout And Alignment

The player must use the same content-flow alignment vocabulary as other blocks.

- Normal audio blocks live in the article content column.
- `alignwide` and `alignfull` should respect the block's requested width without
  creating phone overflow.
- `alignleft` and `alignright` may float on desktop if the current block recipe
  supports it, but should collapse out of float behavior on phone.
- `aligncenter` should remain centered.
- All shells and controls need `box-sizing: border-box` and `min-width: 0`.
- The progress rail must be allowed to shrink or wrap on narrow screens.
- Touch targets should stay usable at phone widths.

If there is tension between preserving a very wide player and preventing
overflow, containment wins. Audio is functional UI before it is a compositional
image surface.

## Open Design Questions

These do not block starting implementation, but they should be decided during
the spike instead of guessed permanently:

- Should `alignwide` audio visually use the full wide measure, or should the
  control rail cap its internal max-width inside the wide figure?
- Should the control include a download link when the source URL is direct, or
  should downloads remain the job of File blocks?
- Should there be a small audio-type label, or would that add unnecessary UI
  noise?
- Should play/pause use text, icon, or icon-plus-hidden-label?
- Should a currently playing player pause when another player starts?

Recommended starting answers:

- Let the figure respect wide/full alignment, but keep the inner control compact
  and responsive.
- Defer download links unless the native fallback exposes a clear download path
  and user QA asks for it.
- Avoid a visible audio label unless the content has no caption and the block
  feels too anonymous.
- Use an icon or symbol with a proper accessible label.
- Do not add global pause coordination in the first pass.

## QA Surfaces

Use the QA kitchen sink content first, then representative real writing posts.

Check at minimum:

- Normal audio block.
- Wide audio block.
- Full-width audio block if available.
- Audio with caption.
- Audio without caption.
- Multiple audio blocks on the same page.
- Audio near other wide/full media blocks so page-level horizontal overflow is
  not misattributed.
- Static generation/hydration path if the implementation changes SSR markup.

Phone QA should explicitly inspect whether the page can horizontally scroll into
blank ground. Desktop QA should inspect alignment, caption rhythm, and keyboard
operation.

## Completion Standard

This spike is complete when the frontend audio block has a custom progressive
player, native fallback remains usable, mobile overflow is resolved without
blanket clipping hacks, captions remain unified, and the user has visually
accepted the player on representative desktop and mobile content.

## Final Outcome

The spike closed on 2026-06-29.

The frontend now progressively enhances WordPress audio blocks from a native
SSR/initial-render fallback into a small custom player after mount. The player
keeps a real `HTMLAudioElement` as the playback engine, uses a native
play/pause `button`, and keeps a native `input[type='range']` for keyboard and
screen-reader seeking while drawing the visible rail and thumb itself.

The accepted visual direction is intentionally quiet: no white card, no blue
sidebar, no heavy frame. The control blends into the cream article ground, uses
a small signal-blue CSS play/pause glyph, shows quiet mono time metadata, and
keeps captions on the same shared figure-caption styling path as other media.

The most durable layout lesson was that audio overflow was not only an internal
player problem. The root WordPress `<figure>` needed its browser-default margins
reset, and wide/full audio should collapse back to the content column on phone
rather than trying to preserve a wide composition for functional UI.

Future audio work should start from this model rather than returning to native
browser controls or adding clipping around the block as the primary overflow
strategy.
