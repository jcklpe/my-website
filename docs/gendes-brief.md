# Generative Design Brief — Old Desert Jackalope Port

This brief is a literal port, not a mood-board direction. The source is the author's old Frontity (React + Emotion) WordPress theme at `temp-ref-assets/desert-jackalope/`. The goal is a faithful translation of that theme's visual language into the Vue/Nuxt frontend — same palette, same single typeface, same signature interactions — adapted only where the new architecture (the featured-media transition system, the `.content-flow` grid, the block registry) requires it.

Ignore `docs/gendes-moodboard/desert-jackalope/` entirely. Despite the shared name, that folder is a warm-desert mood board for a different, abandoned take. The theme code's actual palette is cool (cobalt blue + electric purple) and that is what we are porting.

## Branch

- Branch name: `gendes-old-desert-jackalope.cc`
- Baseline branch: `gendes-academia`
- Source theme: `temp-ref-assets/desert-jackalope/` (Frontity theme, `src/`)
- Working title: Old Desert Jackalope

## Thesis

Bring back the author's old portfolio theme as it actually existed in code: a confident, monospaced, high-chroma site built around white "paper," saturated cobalt-blue structural chrome, and an electric-purple accent. It should read as a designer-developer's personal site from the Frontity era — direct, a little brash, typographically single-minded (everything is Space Mono), with two memorable structural gestures: a zigzagging case-study archive where images and titles slide apart under the cursor, and article pages where a sheet of white paper slides up over a full-bleed hero photo.

The academia baseline already inherited this theme's `#2657eb` blue and `#0c112b` ink, then softened them into warm off-white paper with mono used only for italic headings. This branch reverses that softening and restores the original's full conviction.

## References

- Reference: `temp-ref-assets/desert-jackalope/src/components/index.js`
  - What to borrow: global `:root` tokens, Space Mono import, blue selection color, the `--snappy` / `--heavy-snap` easings, cross-fade page transition.
  - What to avoid: nothing structural; this is the source of truth.
- Reference: `src/components/Archive/CaseStudyArchive.js`
  - What to borrow: the alternating left/right zigzag, image-slides-outward / title-slides-inward hover (±7vw image, ∓50px title) on slow circ-ease, the dark title block at large size.
  - What to avoid: the Frontity nth-of-type `30vw` margins verbatim — translate the intent, keep it sane on ultrawide and mobile.
- Reference: `src/components/Post/post-fake-paper-top.js`
  - What to borrow: the "fake paper top" — full-bleed featured media, then the white article sheet pulled up over it via negative margins, title overlapping the photo.
  - What to avoid: hard-coded `-250px`/`-300px` pixel margins; reproduce the effect responsively.
- Reference: `src/components/styles/link-styles.js`
  - What to borrow: the gradient (blue→purple) underline strip that expands to fill the text on hover while text flips to white; persistent blue bottom border.
- Reference: `src/components/styles/code-block-styles.js`, `button-styles.js`, `block-quote-styles.js`, `aside-styles.js`
  - What to borrow: dark code block with a faux title-bar gradient stripe; gradient resume button; gray-fill blockquote with dark left bar; heavy black left-border italic notice asides.

## Palette

Lifted directly from `src/theme.js` and `src/components/index.js`.

- Ground/background: pure white `#ffffff` paper. Replace the academia warm off-whites.
- Ink/text: near-black navy `#0c112b` (existing `$color-ink`), with the 90/80/30 alphas already in the palette.
- Accent behavior: cobalt blue `#2657eb` (primary, heavy `#1f38c5`) is the dominant structural color — header bar, hero fill, link underline base, selection. Electric purple `#7200ff` is the secondary accent — the second stop in link/button gradients only. Used sparingly, never as a fill.
- Image treatment: full-bleed, `object-fit: cover`; slight saturate/contrast lift on hover (already present). Featured media can run up to full viewport height on detail heroes.
- Contrast constraints: `#2657eb` on white is ~4.6:1 — fine for large text and headings, borderline for small body links, so body links keep the persistent underline + the fill-to-white hover for a non-color affordance. White text on the blue header/hero is ~5:1, fine.

## Typography

- Primary body face: Space Mono (Google Fonts, 400/400i/700/700i). The whole site is monospaced — body, headings, nav, UI. This replaces IBM Plex Sans/Mono on this branch.
- Heading voice: Space Mono **700, upright** (not italic). Big and blocky. The academia italic-mono heading voice is dropped.
- Scale and rhythm: large archive/hero titles (up to ~4rem), generous vertical breathing room (the original's 200px footer margins, big block spacing).
- Letter-spacing/weight behavior: near-zero tracking; monospace already sets rhythm. Headings bold; body regular; asides/captions italic.
- What not to do: do not mix in a sans body face; do not reintroduce italic headings; do not letter-space monospace into "techy" caps except where the original did (kickers/labels).

## Surface and Material

- Surface logic: white paper sits on the page; structural chrome (header, hero, side-projects panel, code blocks) is solid blue or dark navy. No warm-paper grid texture.
- Borders/rules: thin dark rules; blockquote dark 4px left bar; pullquote dark top/bottom rules; notice/aside heavy 6px black left bar.
- Texture/noise: none. Flat fills. Drop the paper-grid background texture on this branch.
- Shadows/depth: minimal. Depth comes from the paper-over-photo overlap and the z-layered zigzag, not from soft drop shadows. The card-lift shadow on post cards can stay subtle.
- Media framing: full-bleed, square corners, no rounded radii anywhere (the original uses `border-radius: 0` / sharp edges throughout).

## Layout and Composition

- Homepage: a tall (~90vh) solid-blue hero with the site description set large and centered in white. Below it, the vital-info row, then the zigzag Selected Work, testimonials, the dark Side Projects panel, and Latest Writing.
- Cards: case studies become the zigzag — alternating left/right, big dark title block, image as a separate sliding plane. Post cards stay card-like but go monospace + sharp-cornered, blue accents.
- Article rhythm: narrow centered monospace reading column; full-bleed hero with the paper-top overlap; dark code blocks; gray blockquotes; centered pullquotes.
- Footer/nav: full-width blue header bar with white wordmark + white underline-on-hover nav. Footer keeps bracketed-feeling links over large vertical space.
- Mobile behavior: zigzag collapses toward a single column with reduced offsets; paper-top overlap reduces its pull; reading column widens.
- Composition experiments to attempt: faithful zigzag slide; faithful paper-over-photo; gradient-fill links sitewide.

## Motion and Interaction

- Page/route motion: simple cross-fade (the original used a react-spring opacity transition). Keep the existing featured-media card-to-detail transition working underneath — adapt it to the zigzag rather than removing it.
- Hover/touch behavior: zigzag image slides outward / title slides inward on a slow circ-ease (`--snappy` = `cubic-bezier(0.075, 0.82, 0.165, 1)`); links fill to white; nav underlines grow.
- Scroll behavior: nothing exotic; keep the existing hide-on-scroll interior nav.
- Reduced-motion expectation: all slide/fill/zoom transitions collapse to instant state changes under `prefers-reduced-motion`.

## Accessibility and Usability

- Color contrast: keep body links underlined; verify blue-on-white and white-on-blue meet AA for their sizes; fix any small-text blue that falls short.
- Focus states: preserve the existing `:focus-visible` outline; ensure zigzag links and nav remain keyboard-reachable and visible.
- Keyboard behavior: zigzag hover effects must have focus equivalents; no hover-only affordances.
- Link affordances: persistent underline/border on body links so color is not the only signal.
- Readability: clamp the original's extreme `vw` reading margins so the column does not get absurdly narrow on ultrawide or too tight on mobile.

## Anti-Goals

- Avoid: the warm-desert mood board — wrong direction entirely.
- Avoid: reintroducing IBM Plex, sans body text, or italic headings.
- Avoid: copying Frontity's hard-coded pixel/`vw` magic numbers verbatim where they break responsively; port the intent.
- Avoid: removing or renaming the `data-featured-*` transition hooks, the `.content-flow` grid, or the block registry to achieve a look.
- Avoid: the retro-terminal CRT code block from the academia baseline; the original code block is a plain dark slab with a title-bar stripe.

## Implementation Notes for the Agent

Edit palette/token files, shared-component recipes, scoped SFC styles, and supporting SFC markup where the direction needs it. Preserve the content model, GraphQL query shape, block registry, transition data hooks, static deploy scripts, Docker infrastructure, and CMS schema.

Expected checks:

- `corepack pnpm check`
- Visual QA via `corepack pnpm generate:static:preview` (the author's chosen QA path for this branch)
- Static generation smoke test before this branch is called a candidate

## Handoff Summary

- Main visual decisions:
  - White paper palette restored; cobalt `#2657eb` as structural color, `#7200ff` purple as gradient-only accent; blue selection.
  - Space Mono is the single site-wide face (`$font-sans` and `$font-mono` both resolve to it); headings upright + bold.
  - `--snappy` repointed to the original ease-out-circ; `--heavy-snap` (back-in) added for nav underlines; `--motion-drift` for the zigzag rest.
  - Solid-blue full-width header bar with white wordmark + white underline-on-hover nav (and a blue detail-page pill).
  - 88vh solid-blue homepage hero, description centered in white.
  - Signature gradient-fill body link (blue→purple, fills to white on hover, persistent blue border).
  - Case-study archive rebuilt as the alternating zigzag: big black title above the image, image shears toward the outer edge / title toward center on hover (fast-out, slow-back); featured-media transition hooks preserved and now fire from the new layout.
  - Detail pages: "fake paper top" — taller full-bleed hero with the white article sheet pulled up over the bottom of the photo.
  - Code blocks: CRT/retroterm surface replaced with the original dark slab + faux title-bar stripe (mixin names unchanged). Blockquote → gray fill + dark left bar. Solid button → gradient that shifts to purple on hover.
- Files changed: palette/type/motion/effect tokens and both context-role emitters under `packages/styles/`; `_link`, `_button`, `_code-block`, `_quote-block` recipes; `SiteNav`, `CaseStudyCard`, `CaseStudyList`, `CaseStudyLoopNav`, `FeaturedMediaTransitionLayer`; `index`, `case-studies/[slug]`, `writing/[slug]` pages. Editor CSS regenerated.
- Known compromises:
  - The detail title still rides in the translucent slip panel (the transition's landing target) rather than literally sitting on the risen paper sheet; the panel reads as near-white on white paper, and the paper-overlap gesture carries the effect.
  - The zigzag shear uses bounded percentages/`overflow: clip` instead of the original's literal `±7vw` / `30vw` margins so it stays sane on ultrawide and never creates horizontal scroll.
  - Asides/"notice" styling from the original is not ported — there is no corresponding block in the current content model.
- Screens or routes that need special QA: homepage zigzag at desktop/tablet/phone widths and the card→detail featured-media transition in both directions; detail-page paper-top overlap with the title clear of the rising sheet; gradient-fill links and blue-on-white small-link contrast; the blue header blending into the blue hero on `/`.
- Whether static generation was smoke-tested: not yet — `corepack pnpm check` passes (sass rebuild + lint + typecheck). Static generation to be verified by the author via `generate:static:preview`.
