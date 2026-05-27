# Generative Design Brief — Desert Jackalope Port

## Branch

- Branch name: `gendes.old-desert-jackalope.copilot`
- Baseline branch: `gendes-academia`
- Reference source: `temp-ref-assets/desert-jackalope/` — original Frontity/React theme
- Working title: Old Desert Jackalope

## Thesis

This branch is a faithful translation of the original desert-jackalope theme — a personal portfolio site written in React/Frontity — into the current Nuxt/Vue frontend. The original design is a terminal/hacker aesthetic with strong editorial proportions: Space Mono for everything, a cobalt-blue-and-purple color world, white article cards that physically slide up over featured images, and slow physics-based easing on every interaction.

The goal is a literal port where possible. The content model, block registry, GraphQL wiring, and static deploy machinery stay intact. What changes is the entire visual layer. This branch should feel like you are reading someone's code notebook that is also trying to be a portfolio — legible, intentional, and a little obsessive.

## References

- Source: `temp-ref-assets/desert-jackalope/src/` — read the JS theme files directly.
- What to borrow: Space Mono for everything; cobalt/purple color world; blue header+hero as one continuous band; white article card overlapping featured image (fake paper top); vw-proportional content columns; gradient link highlight that floods on hover; retroterm CRT code blocks; ASCII bracket footer links; slow spring-back easing on hover; case-study card parallax hover.
- What to avoid: Adding a case study archive route. Wholesale replacing the content-flow grid system — adapt grid column widths instead. Breaking transition system hooks.

## Palette

- Ground/background: Pure white (`#ffffff`) for article surfaces and page body. The chromatic identity is entirely in the blue header/hero band.
- Ink/text: `rgba(12, 17, 43, 1)` — deep navy, not pure black. At 80% opacity for body text.
- Primary accent: `#2657eb` — cobalt blue. Used for header background, hero background, link underlines, focus states.
- Secondary accent: `#7200ff` — vivid electric purple. Used as gradient second stop in link highlight and button hover.
- Surfaces: White. Drop the warm off-white paper tone and the paper-grid texture entirely.
- Text selection: Blue background, white text (branded selection).
- Contrast constraints: Body text is dark navy on white — passes WCAG AA comfortably. White text on blue header must pass AA. Purple accent never used as standalone text color.

## Typography

- Primary face: **Space Mono** — loaded from Google Fonts (400, 400i, 700, 700i). Used for ALL text: body, headings, nav, footer, captions, everything. This is the defining personality of the design.
- Heading voice: Bold, no italic by default (unlike the academic baseline which uses italic mono headings). Large and direct.
- Scale and rhythm: Hero h1 at `4rem` (mobile `2.8rem`). Article titles at `2rem`. Body at roughly 1rem (inherit). Line-height `1.6` for body.
- Letter-spacing: Minimal — no wide tracking. Headings can use slight negative tracking.
- What not to do: Do not mix in a sans-serif face for body. Do not use IBM Plex anything. Do not make italic the default heading style.

## Surface and Material

- Surface logic: White article cards on a white page background. The blue header/hero band is the only surface with strong color.
- Borders/rules: Minimal. Blockquote has a `4px` solid dark-left-border. Aside/notice has a `6px` solid black left border. No card borders.
- Texture/noise: None. Remove the paper-grid background texture from the body.
- Shadows/depth: The article card "sliding up" over the featured image creates depth through layering and negative margins, not box-shadows.
- Media framing: Full-bleed featured images at `max-height: 100vh`. The article card overlaps the image bottom with a white background — the "fake paper top" effect. This layering is the primary depth metaphor.

## Layout and Composition

- Homepage: Big blue hero region with the site title centered, `min-height: 90vh`. The header/nav on the homepage should merge visually into the blue hero as one continuous band. Below the hero, sections use generous vertical spacing.
- Cards (case study): The existing card layout can keep its structure but should use white/transparent slip panels rather than glass. The title should be large and direct.
- Article rhythm: Content uses the existing `.content-flow` grid, but with adjusted column widths to feel proportional (not overly wide). vw-based proportions are the target feel.
- Article detail pages: The `.content` section after the hero gets `margin-top: -5rem` so it visually slides up over the image bottom — the fake paper top. Solid white background.
- Footer/nav: Footer uses ASCII bracket notation for links: `[ link-name ]`. Generous vertical margin (`8rem` top and bottom). Nav/header on interior pages is the blue primary color.
- Mobile behavior: Smaller type scale on hero. Margins collapse to mobile-friendly values. Layout stays single-column.
- Composition experiments: The link gradient highlight (blue→purple diagonal flooding up on hover) is the most prominent interactive signature — implement it broadly on all body text links.

## Motion and Interaction

- Page/route motion: Keep the existing route transition system unchanged.
- Hover/touch behavior: Two named easing curves: `--motion-snappy` (`cubic-bezier(0.075, 0.82, 0.165, 1)`) for content interactions; `--motion-heavy-snap` (`cubic-bezier(0.6, -0.28, 0.735, 0.045)`) for nav/header affordances. Link hover uses `--motion-snappy` with a `250ms` delay. Nav link hover uses `--motion-heavy-snap`.
- Link gradient: At rest, a 1px blue bottom border. On hover, the gradient floods to 88% text height. Transition: `all 0.25s 250ms var(--motion-snappy)`.
- Buttons: Flat blue at rest, blue→purple gradient on hover. Slow `1s` transition.
- Scroll behavior: No scroll-driven animation needed for this branch.
- Reduced-motion expectation: All hover flooding transitions should collapse to instantaneous or opacity-only under `prefers-reduced-motion`.

## Accessibility and Usability

- Color contrast: Dark navy on white body text passes AA. White on blue nav/header passes AA. Verify purple is never used as text on white without sufficient contrast.
- Focus states: `:focus-visible` outline remains. Update outline color to `var(--color-primary)` (already the default).
- Keyboard behavior: No regression from baseline. All interactive elements remain keyboard-accessible.
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
