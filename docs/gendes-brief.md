# Generative Design Brief — gendes-seamless.copilot

## Branch

- Branch name: `gendes-seamless.copilot`
- Baseline branch: `gendes-academia`
- Reference: https://tympanus.net/Development/IntroTrailEffect/
- Working title: Seamless / Cinematic Dark

## Thesis

The site as a cinematic object. Where the academic baseline asks "what if a portfolio was a paper," this direction asks "what if it was a film opening." Dark, atmospheric, unhurried. The work enters the screen through a ritual: a loader, a name, a gate. After that gate, the featured image has already become a card — there is no cut, only a continuation.

The design steals from the IntroTrailEffect (Codrops / Manoela Ilic): a three-phase homepage intro using GSAP-powered trail echoes and position-based element transitions. The loader counts up. The name "Aslan / French" materializes with a ghost-echo stagger. The featured case study image flies from its intro position to its card slot when the user enters. The layout was always there underneath — the intro sequence was its arrival.

This direction is fully dark. No warm off-white. The surface is near-black organic. Text is warm cream. The identity mark is a high-contrast display serif (Cormorant Italic) at large scale. The rest of the type system keeps IBM Plex.

## References

- Primary reference: https://tympanus.net/Development/IntroTrailEffect/ (three-phase intro, image trail, GSAP Flip-style transition, dark cinematic palette, split name identity mark)
- What to borrow: the loading gate, the trail echo effect on both image and text, the name as the typographic centerpiece, the palette (dark near-black, warm sandy accent, sage secondary), the ambient moving light overlay on body
- What to avoid: mandatory click gate as hostile UX — the Enter button is present but the animation is not gated on a click for content access purposes; screen readers bypass it. Also avoid direct copying of the reference layout (different content model, different nav needs).

## Palette

- Ground/background: `#0e1210` — very dark, near-black with a warm organic tint (like a darkroom)
- Ink/text: `#edeae0` — warm cream; near-white but never cold
- Title/display accent: `#c9a882` — warm sandy terracotta; used for the intro name identity mark and display headings
- Secondary/muted: `#7a9b92` — sage green; for meta, captions, secondary links
- Primary: `#5580f5` — electric blue, brightened for dark bg; used for links and interactive highlights
- Ambient light effect: a slow-drifting radial gradient on body::after simulating a moving light source from the top-right corner (6–8% opacity warm amber)
- Contrast: WCAG AA for all body text (cream on near-black easily passes); primary blue may need a check at small sizes

## Typography

- Primary body face: IBM Plex Sans (unchanged from baseline)
- Heading voice: IBM Plex Mono Italic for article/document headings (unchanged)
- Display/identity: Cormorant Italic weight 300 — used exclusively for the intro name mark and homepage hero title; extremely high-contrast serif with thin hairlines
- Scale and rhythm: unchanged from baseline for body/article; intro name at `clamp(5.5rem, 10vw, 11rem)`; hero title at `clamp(3.5rem, 7vw, 7rem)`
- What not to do: do not use Cormorant for body text or article headings; it is purely a display identity face at large scale

## Surface and Material

- Surface logic: flat dark surfaces; no paper texture; depth comes from layering (the intro overlay floats over the page content, the card label panel sits on the media)
- Borders/rules: very subtle cream-tinted borders (`rgba(cream, 0.12)`) — barely visible, like scribe lines on dark paper
- Texture/noise: none — replaced by the ambient light animation
- Shadows/depth: deeper shadows (dark-on-dark, near-black); cards use elevation through the transition system not box shadows
- Media framing: full bleed on cards; the FeaturedMediaFrame remains unchanged mechanically

## Layout and Composition

- Homepage: the intro screen is a `position: fixed` overlay that occupies the entire viewport on first visit (per session). Phase 1 shows the progress counter and featured image. Phase 2 shows the name and Enter button. Phase 3 (after Enter click) the image flies to the first card slot and the overlay fades. The homepage content was always rendered underneath.
- Cards: dark background fallback; the existing card layout is preserved; mouse movement over cards spawns ghost-image trail echoes inside the card boundary
- Article rhythm: unchanged structurally; dark surfaces should make text even more readable
- Footer/nav: dark surface; slim cream border separations
- Mobile behavior: intro screen scales down; name font reduces; image still present but smaller; card trail effect disabled on touch devices
- Composition experiments attempted: the image-as-intro-protagonist concept (the intro image IS the first card's image — no cut between intro and page); the name as the only large typographic object in the first viewport; mouse trails on cards as gestural/tactile texture

## Motion and Interaction

- Page/route motion: existing featured-media transition system preserved and unchanged
- Intro sequence: GSAP-powered; fake progress counter (2.5s); image trail reveal (1.1s); name trail reveal (0.95s stagger); Enter click fires image FLIP to card slot (1.1s) + overlay fade (0.5s)
- Hover/touch behavior: case study cards show a ghost-image mouse trail (position: absolute ghosts inside card, CSS animation fade 0.6s, max 8 concurrent, pointer-events: none)
- Scroll behavior: no new scroll effects in this branch
- Reduced-motion: intro sequence respects `prefers-reduced-motion` — if set, skip directly to done state; ambient light animation paused; card trail disabled

## Accessibility and Usability

- Color contrast: verify cream on near-black body text; verify electric blue at small sizes
- Focus states: intro Enter button is keyboard-focusable; `aria-hidden="true"` on the intro overlay so screen readers access page content directly
- Keyboard behavior: pressing Enter on the intro button triggers the same animation as a click; page content is accessible immediately for screen readers (the intro overlay is aria-hidden)
- Link affordances:
- Readability:

## Anti-Goals

Name the cliches, motifs, effects, and directions this branch should avoid.

- Avoid:
- Avoid:
- Avoid:

## Implementation Notes for the Agent

The agent may edit palette files, shared-component recipes, scoped SFC styles, and supporting SFC markup where the visual direction needs it. Preserve the content model, GraphQL query shape, block registry, transition data hooks, static deploy scripts, Docker infrastructure, and CMS schema.

Expected checks:

- `corepack pnpm check`
- SSR review via `corepack pnpm start:frontend` at `http://my-website.localhost`
- Static generation smoke test before a winning branch is merged

## Handoff Summary

When the branch is ready for human review, summarize:

- Main visual decisions:
- Files changed:
- Known compromises:
- Screens or routes that need special QA:
- Whether static generation was smoke-tested:
