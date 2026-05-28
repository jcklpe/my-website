# gendes-seamless.cc — reference notes

The reference for this branch is a **live website**, not an image mood board:

- Demo: https://tympanus.net/Development/IntroTrailEffect/
- Article: https://tympanus.net/codrops/2022/05/03/image-trail-animation-for-an-intro/

## What the reference is

A single full-viewport, non-scrolling "stage" that choreographs three timed phases: a fake loader (0→100%), an intro reveal where one portrait image and a name animate in with a trail effect, and an "Enter" click that runs a GSAP Flip transition to a content/about layout where the title repositions and tall arched images settle in.

We are NOT copying the loader gate or the single-screen shell — this is a real multi-page content site. We borrow the *language*: the morph, the trail, the palette, the arch frame, the atmosphere.

## Extracted aesthetic (from the demo's own CSS)

- Ground `#161a19`, text `#fff`, title/accent `#dbb59b` (sand), link `#7f9993` (sage), link hover white.
- Body `::after` overlay: a viewport-covering shadow image with a slow 7s infinite `scaleX` breathe — a moving light-leak. We recreate this with an animated radial gradient (no external asset).
- Display face: `kudryashev-d-excontrast-sans` (extreme thick/thin contrast sans). Body: `acumin-pro` weight 300. Both Typekit/commercial — we substitute Playfair Display (display) + Mulish (body) from Google Fonts.
- Portrait images (`--img-ratio: 1.5`) framed with `border-radius: 20vw 20vw 0 0` — tall arch, rounded top, square foot — bleeding off the bottom edge (`margin-bottom: -20vh`).
- Ghosted 3-layer monogram that offsets/fades apart; wipe-away underline links; circular Enter button that fills from the bottom.

## The technique

- **GSAP Flip**: record an element's state, reparent/restyle it in the DOM, then `Flip.from()` animates the delta — crucially including `border-radius`, which is how the rectangle→arch morph works.
- **Trail**: clone the moving element a few times and stagger the clones along the motion path (`stagger` ~.04 / -.08), opacity 0→1→0, so the move leaves an echo.

See `docs/gendes-brief.md` for the full adaptation plan.
