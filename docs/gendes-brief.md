# Generative Design Brief

This is the active handoff brief for the `gendes-old-desert-jackalope.codex` branch.

## Branch

- Branch name: `gendes-old-desert-jackalope.codex`
- Baseline branch: `gendes-academia`
- Mood-board folder: none for this branch
- Source reference: `temp-ref-assets/desert-jackalope/`
- Working title: Old Desert Jackalope

## Thesis

This branch translates the older Desert Jackalope Frontity theme into the current Nuxt/Vue frontend as literally as the new architecture reasonably allows. The goal is not nostalgia as a faint accent. It should recover the old site's stark electric-blue confidence, Space Mono voice, white paper article surfaces, dark media/code slabs, purple-gradient link energy, and alternating case-study motion.

The port should feel like an earlier, rougher, more graphic version of the same person: direct, technical, strange enough to be memorable, and comfortable letting layout move sideways. The current WordPress/Nuxt architecture remains the frame. The design layer is what changes.

## References

- Reference: `temp-ref-assets/desert-jackalope/src/components/index.js`
- What to borrow: Space Mono global typography, electric blue and purple palette, simple opacity route fade, bold selection color.
- What to avoid: importing Frontity architecture or page-level raw HTML rendering.

- Reference: `temp-ref-assets/desert-jackalope/src/components/Header/`
- What to borrow: full electric-blue header treatment, white text, heavy underline hover.
- What to avoid: restoring the old global menu model. Port the visual treatment onto the current contextual `SiteNav`.

- Reference: `temp-ref-assets/desert-jackalope/src/components/Archive/CaseStudyArchive.js`
- What to borrow: alternating left/right case-study composition, large titles, image/title hover translations.
- What to avoid: breaking card links or featured-media transition hooks.

- Reference: `temp-ref-assets/desert-jackalope/src/components/Post/` and `src/components/styles/`
- What to borrow: full-width featured image, white fake-paper article surface pulled upward, old Gutenberg spacing, dark code blocks, black media embeds, gradient text links.
- What to avoid: bringing back a single giant post-body HTML blob.

## Palette

- Ground/background: mostly white and electric blue rather than the warm academic paper field.
- Ink/text: `#0c112b`/near black for text on white, white on blue/dark surfaces.
- Accent behavior: primary electric blue `#2657eb`, heavy blue `#1f38c5`, and purple `#7200ff` for the old link/button gradient behavior.
- Image treatment: full-bleed or large-offset media, often framed by black/blue surfaces rather than soft cards.
- Contrast constraints: keep body text and link states WCAG AA. Purple may appear as an accent in gradients, not as low-contrast body text.

## Typography

- Primary body face: Space Mono everywhere.
- Heading voice: Space Mono bold, direct, sometimes very large; no italic academic baseline voice.
- Scale and rhythm: old theme used 4rem archive titles, 2rem article titles, and broad viewport-margin article rhythm. Translate this into responsive Vue surfaces without making mobile unreadable.
- Letter-spacing/weight behavior: keep strong weights and simple underlines; avoid delicate editorial styling.
- What not to do: do not preserve IBM Plex as the visible branch voice.

## Surface and Material

- Surface logic: blue hero/nav shells, white article paper, black media/code blocks, simple hard-edged surfaces.
- Borders/rules: 3px underlines and strong left rules are more in character than soft strokes.
- Texture/noise: code gets scanline/stripe texture; normal page surfaces stay flat.
- Shadows/depth: minimal. Use offset hard shadows only where they echo the fake-paper/code-block language.
- Media framing: large images should move and crop boldly; embeds can sit in black frames.

## Layout and Composition

- Homepage: open with a full electric-blue hero treatment rather than the quiet academic hero. Selected Work should become the old alternating case-study stream.
- Cards: case-study cards should alternate left/right and move on hover. Writing cards can use the old blog-card pattern: title slab, image, date/excerpt when present.
- Article rhythm: full-width featured media followed by a white paper body that overlaps upward. Paragraphs and headings should use viewport-margin rhythm similar to the old theme while still respecting `.content-flow`.
- Footer/nav: nav keeps the current contextual model but takes the old blue header treatment. Footer should become much more minimal and utility-like, with bracketed link energy rather than a tall neutral sitemap.
- Mobile behavior: preserve the old offset personality where possible, but collapse to readable single-column content and avoid horizontal overflow.
- Composition experiments to attempt: revive the fake-paper article top, alternating card offsets, gradient text-link fills, and black embed/code slabs.

## Motion and Interaction

- Page/route motion: current featured-media transition stays. General fallback motion can remain simple fade/slide.
- Hover/touch behavior: use the old snappy image/title translations for case-study cards, heavy underline fills for nav/links, and gradient link expansion.
- Scroll behavior: preserve current contextual nav hide/show behavior on interior pages.
- Reduced-motion expectation: every new transform transition needs a reduced-motion fallback.

## Accessibility and Usability

- Color contrast: white on electric blue and near-black on white should remain strong; do not use purple for small text.
- Focus states: keep the global focus fallback and make branch-specific hover states also work on focus-visible.
- Keyboard behavior: cards stay real links, load-more stays a native button, nav stays semantic.
- Link affordances: preserve visible underlines/background fills; no generic labels.
- Readability: Space Mono everywhere is part of the port, but article line length and mobile type must stay readable.

## Anti-Goals

Name the cliches, motifs, effects, and directions this branch should avoid.

- Avoid desert/western illustration, literal landscape texture, or decorative animal references. The old theme name is a label, not a motif.
- Avoid importing old Frontity architecture.
- Avoid sanding the branch back into the quiet non-brand academic baseline.

## Implementation Notes for the Agent

The agent may edit palette files, shared-component recipes, scoped SFC styles, and supporting SFC markup where the visual direction needs it. Preserve the content model, GraphQL query shape, block registry, transition data hooks, static deploy scripts, Docker infrastructure, and CMS schema.

Expected checks:

- `corepack pnpm check`
- Static preview review via `corepack pnpm generate:static:public` or `corepack pnpm generate:static:qa`, then `corepack pnpm start:static:preview`

## Handoff Summary

When the branch is ready for human review, summarize:

- Main visual decisions:
- Files changed:
- Known compromises:
- Screens or routes that need special QA:
- Whether static generation was smoke-tested:
