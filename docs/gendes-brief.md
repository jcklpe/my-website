# Generative Design Brief — Seamless Arch Trail

## Branch

- Branch name: `gendes-seamless.codex`
- Baseline branch: `gendes-academia`
- Mood-board folder: not primary for this run; `docs/gendes-moodboard/gendes-seamless.codex/` remains available for optional local reference captures
- Working title: Seamless Arch Trail

## Thesis

This branch should treat the website as a set of resting states for shared media objects rather than a stack of separate pages. The visitor should feel a featured image move from card to hero to related-work surface as the same object being re-staged: rectangular, then tall, then arched, then echoed by trailing copies. The site can become more theatrical, more physical, and more cinematic than the academic baseline.

The reference is an intro animation, but the thing to borrow is not merely the intro. Borrow the underlying grammar: staged grids, huge split typography, dark ground, minimal chrome, and media that keeps changing layout state without losing its identity. The result should feel like a personal site that has learned from experimental motion design, not like a literal artist-page clone.

## References

- Reference: https://tympanus.net/Development/IntroTrailEffect/
- What to borrow: the dark stage, warm display type, full-viewport composition, huge stacked title text, image trail echoes, and the sense that one image is being moved between deliberate layout containers.
- What to avoid: copying the fictional artist identity, locking the whole site into a single non-scrollable demo, or making the project unreadable outside the homepage.

- Reference: https://tympanus.net/codrops/2022/05/03/image-trail-animation-for-an-intro/
- What to borrow: the article's described sequence — loader/progress, then image trail, then another layout change on enter — as a model for multi-state motion.
- What to avoid: adding a fake progress loader that delays normal browsing for no reason.

- Reference: https://github.com/codrops/IntroTrailEffect
- What to borrow: the implementation concept of moving a DOM/media object between layout homes and animating the delta; this project already has an equivalent custom featured-media coordinator.
- What to avoid: swapping the Nuxt transition architecture wholesale to GSAP unless the existing coordinator proves insufficient.

## Palette

- Ground/background: deep green-black, close to `#151917`, with subtle radial or shadow movement allowed if it stays quiet.
- Ink/text: warm ivory and chalk white for primary type; avoid pure white fields except as interactive fills.
- Accent behavior: warm clay/peach display color and muted sage link/navigation color. Accent should feel cinematic and editorial, not neon.
- Image treatment: images should stay saturated and inspectable, but sit inside dark stage lighting. Arched masks, soft vignettes, and echo trails are encouraged.
- Contrast constraints: body text, links, focus rings, and metadata must stay WCAG AA against dark surfaces.

## Typography

- Primary body face: a clean sans-serif with generous tracking discipline and compact UI readability.
- Heading voice: high-contrast display serif or display-style face for major page/section titles; oversized, split, and staged.
- Scale and rhythm: large type should behave like architecture on home/detail/list surfaces; article body headings should remain readable and calmer.
- Letter-spacing/weight behavior: do not rely on negative tracking. Use weight, line-height, casing, and layout to create drama.
- What not to do: do not keep the academic IBM Plex Mono Italic as the main expressive move for this branch.

## Surface and Material

- Surface logic: pages are dark stages. Cards are image stages, title slips, and motion targets rather than white document cards.
- Borders/rules: thin sage/ivory rules can define the frame. Avoid generic card boxes.
- Texture/noise: subtle shadow/vignette or hairline grid is acceptable if it supports depth.
- Shadows/depth: media can cast deep soft shadows; text panels should feel like transparent stage labels, not frosted SaaS cards.
- Media framing: featured media should shift between rectangular cards and tall arched hero/detail states. The arch is a core motif.

## Layout and Composition

- Homepage: use the first viewport as a staged intro composition with large title text, a featured image object, and sparse chrome. Let the next section peek below.
- Cards: case-study cards should become large image stages with overlaid title slips. Writing cards should become compact staged objects, still participating in shared-media transitions.
- Article rhythm: detail pages can start with a dramatic media/title stage, then settle into a darker editorial reading surface with enough measure and rhythm for long content.
- Footer/nav: chrome should be sparse, fixed or local, and stage-like. Keep contextual nav behavior but restyle it.
- Mobile behavior: preserve the same theatrical vocabulary with simpler stacking, large but bounded type, and no overlapping text.
- Composition experiments to attempt: split titles above/below media, arch masks on detail targets, image-trail clones during transitions, section labels as stage coordinates, and related-work cards that look like alternate resting states for the same object.

## Motion and Interaction

- Page/route motion: extend the current featured-media transition so image motion feels slower, physical, and trailed. The route should feel like one visual object changing homes.
- Hover/touch behavior: hover can preview motion through image zoom, slight mask tightening, title slip movement, or warm/sage color inversion. Touch should still be straightforward.
- Scroll behavior: avoid trapping scroll. Let content flow normally after the staged first viewport.
- Reduced-motion expectation: disable trail echoes and large transforms under `prefers-reduced-motion`; preserve simple opacity/position changes only where needed.

## Accessibility and Usability

- Color contrast: test dark-ground body text, metadata, and links against WCAG AA expectations.
- Focus states: keep global focus fallback and add clear local focus states on dark components.
- Keyboard behavior: cards remain real links, load-more remains a button, and nav/footer links stay semantic.
- Link affordances: no generic hardcoded link labels; visible text should remain descriptive.
- Readability: article bodies cannot become poster-only compositions. Long posts must still read comfortably.

## Anti-Goals

- Avoid a beige or academic neutral palette.
- Avoid decorative motion that is disconnected from navigation or shared media.
- Avoid full-page app-lock behavior that breaks normal scrolling/static preview.
- Avoid replacing the CMS/content model or Gutenberg block rendering to chase an animation effect.

## Implementation Notes for the Agent

The agent may edit palette files, shared-component recipes, scoped SFC styles, and supporting SFC markup where the visual direction needs it. Preserve the content model, GraphQL query shape, block registry, transition data hooks, static deploy scripts, Docker infrastructure, and CMS schema.

Expected checks:

- `corepack pnpm check`
- Static preview-oriented review with `corepack pnpm generate:static:public` or `corepack pnpm generate:static:qa`, then `corepack pnpm start:static:preview`
- `corepack pnpm inspect:static` before any deploy-oriented review

## Handoff Summary

When the branch is ready for human review, summarize:

- Main visual decisions:
- Files changed:
- Known compromises:
- Screens or routes that need special QA:
- Whether static generation was smoke-tested:
