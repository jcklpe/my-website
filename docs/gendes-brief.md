# Generative Design Brief - Henry Codes Reference

## Branch

- Branch name: `gendes-henry.codex`
- Baseline branch: `gendes-academia`
- Reference website: https://henry.codes/
- Mood-board folder: not used for this run
- Working title: True Terrors of the Personal Web

## Thesis

This branch should turn the site from a quiet academic portfolio into a strange, theatrical, hand-built web object. The reference is Henry.codes: maximalist personal-web broadsheet, dark digital-garden energy, black/off-white contrast, oversized type, serif drama, tiny metadata, marquees, dithered imagery, hard rules, and row-based project theater.

The goal is not a tasteful token swap. Make the site feel authored, haunted, and personal. It should still be readable and portfolio-useful, but the first impression should be: this person can design and build an idiosyncratic web world, not just arrange case-study cards.

## References

- Reference: https://henry.codes/
- What to borrow: theatrical homepage poster composition, ultra-condensed display type, literary serif contrast, black/off-white palette, 2px bordered media frames, scrolling metadata strips, dark letter/editorial panels, repeated/echoed section titles, staggered selected-work rows, tiny uppercase labels, dithered ornamental imagery, and motion that resolves blur/noise into clarity.
- What to avoid: copying exact copy, exact gargoyle imagery, exact page structure, exact brand phrases, exact fonts, or private/personal details from the reference.

## Palette

- Ground/background: near-white paper, not warm academic cream. Use faint photocopy or scan texture rather than smooth beige.
- Ink/text: nearly black brown/ink, with softer gray-brown for metadata.
- Accent behavior: mostly monochrome. Accent should appear as small signal strips, focus rings, link states, or generated-media details; avoid the baseline electric-blue accent taking over.
- Image treatment: high contrast, dithered, framed, often black-and-white. Featured media can remain full color where CMS content needs it, but frames and overlays should make it feel part of the same print/web artifact.
- Contrast constraints: body text, metadata, action links, and focus states must remain WCAG-practical. Dark sections use white/off-white text with visible rules and focus outlines.

## Typography

- Primary body face: clean grotesk/sans for utility, metadata, nav, and readable body copy.
- Heading voice: pair an ultra-condensed poster face for page/section banners with a display serif for editorial titles and article cards.
- Scale and rhythm: extreme at section/page level, measured in article bodies. The homepage can use huge type and overlapping title fragments; Gutenberg body headings should stay readable.
- Letter-spacing/weight behavior: tiny metadata can be uppercase. Do not use negative letter spacing. Condensed display type supplies the density.
- What not to do: do not keep IBM Plex Mono Italic as the main expressive gesture for this branch. Do not make every element giant; use tiny labels against massive banners.

## Surface and Material

- Surface logic: framed web objects, print panels, cards as index slips, dark editorial bands, and bordered media boxes.
- Borders/rules: 2px ink rules are a major motif. Use hard rectangular borders with small-radius corners only where the reference does.
- Texture/noise: faint scan/paper texture globally; dither/halftone treatment for ornamental media.
- Shadows/depth: minimal soft shadow. Prefer line, contrast, overlap, and blur.
- Media framing: thick ink border, slight radius, hard clipping, high-contrast image handling. Preserve featured-media transition hooks.

## Layout and Composition

- Homepage: rebuild as a poster-plus-garden surface. The hero should include a huge segmented title, an ornamental framed image, a warning/meta strip, intro copy, and grouped navigation-like quick links. Follow with a dark letter/testimonial panel, an about/vital-info broadsheet band, a dark Selected Work waterfall/list, article cards, side-project CTA, and footer.
- Cards: case studies should become oversized title rows or framed list entries, not calm image posters. Writing cards should feel like bordered article index cards with tiny metadata and serif titles.
- Article rhythm: detail pages should use a theatrical header with framed media and metadata, then return to readable editorial flow. Add section counters/strong rules where appropriate.
- Footer/nav: make navigation small, uppercase, and artifact-like. Footer can become a dark site-map panel with grouped links and colophon-like copy.
- Mobile behavior: keep the poster energy by rotating/stacking giant title fragments and letting media crop assertively, but avoid horizontal overflow.
- Composition experiments to attempt: echo text behind selected-work rows, marquee-style metadata strips, numbered rows, dark "letter from the editor" panels, and an optional grid overlay texture.

## Motion and Interaction

- Page/route motion: preserve the existing featured-media route transition system. Retheme the moving slip/media states so they feel like framed print objects.
- Hover/touch behavior: hover can resolve blur, shift rows laterally, grow underlines, or reveal muted descriptions. Keep touch states readable without hover.
- Scroll behavior: CSS marquees and scroll-linked-feeling section banners are welcome, but avoid heavy JS unless needed.
- Reduced-motion expectation: all new marquee/hover/scroll motion must freeze or simplify under `prefers-reduced-motion`.

## Accessibility and Usability

- Color contrast: black/off-white should make contrast strong by default; check muted labels on paper and dark panels.
- Focus states: maintain visible outlines. Add branch-specific focus treatment only as a supplement.
- Keyboard behavior: cards remain real links; load-more remains a native button.
- Link affordances: use underlines, rules, arrows, or bordered action labels. No generic labels.
- Readability: article bodies remain comfortable even when page headers and homepage sections are theatrical.

## Anti-Goals

- Avoid a generic "dark gothic" theme that loses the web/portfolio specificity.
- Avoid copying Henry.codes literal title language, gargoyle image, personal details, exact fonts, or code.
- Avoid making the site only work on the homepage; writing/detail pages and CMS block fixtures must still hold up.
- Avoid decorative complexity that breaks static generation or hydration.

## Implementation Notes for the Agent

The agent may edit palette files, shared-component recipes, scoped SFC styles, supporting SFC markup, and route-level composition where the visual direction needs it. Preserve the content model, GraphQL query shape, block registry, transition data hooks, static deploy scripts, Docker infrastructure, and CMS schema.

This branch uses a website reference instead of a moodboard. Generated project-bound imagery is allowed when it helps adapt the reference safely; do not depend on private or copied reference assets.

Expected checks:

- `corepack pnpm check`
- Static preview review via `corepack pnpm generate:static:public` or `corepack pnpm generate:static:qa`, then `corepack pnpm start:static:preview`
- Static generation smoke test before a winning branch is merged

## Handoff Summary

When the branch is ready for human review, summarize:

- Main visual decisions:
- Files changed:
- Known compromises:
- Screens or routes that need special QA:
- Whether static generation was smoke-tested:
