# Generative Design Brief: Semplice Archive Object

## Branch

- Branch name: `gendes-semplice.codex`
- Baseline branch: `gendes-academia`
- Reference notes: `docs/gendes-moodboard/gendes-semplice.codex/notes.md`
- Working title: Semplice Archive Object

## Thesis

This branch takes `https://vanschneider.com/` as a website reference rather than a mood board. The goal is not to copy the House of van Schneider identity. The useful lesson is that a personal portfolio can feel like a designed artifact: part archive, part studio object, part editorial index, and part product surface.

The site should move away from the quiet academic baseline toward an independent design archive with more theatrical staging. It should feel dark, dense, precise, and personal. The homepage becomes a curated index/exhibition wall. Case studies and writing cards behave like objects on a black stage. Article pages keep the readability floor, but they should enter through a stronger media/title apparatus and land into a clean reading surface.

## References

- Reference: `https://vanschneider.com/`
- What to borrow: framed site-as-object composition, dark stage, sharp red accent, taxonomic navigation language, dense media bands, large confident typography, editorial archive energy, and the feeling that the website itself is part of the practice.
- What to avoid: literal HOVS logos, angels, crests, decorative myths, exact red/black/white costume, proprietary font imitation, Semplice page-builder markup density, and motion that depends on brittle scroll scripts.

## Palette

- Ground/background: near-black stage (`#050505` to charcoal), with warm bone reading surfaces for long-form content.
- Ink/text: bone/off-white on dark; near-black on light article surfaces.
- Accent behavior: a hard signal red used sparingly for rules, focus, links, labels, and calls to action. Red should feel like indexing tape or a proof mark, not a blanket brand wash.
- Image treatment: media should carry the page. Use dark frames, hard crops, subtle contrast/saturation tuning, and object-like edges.
- Contrast constraints: all small text must remain comfortably above WCAG AA contrast. Red text should sit mostly on dark or be reinforced with underline/rule treatment when used on light surfaces.

## Typography

- Primary body face: keep the current open-source IBM Plex Sans for continuity and reliability.
- Heading voice: keep IBM Plex Mono as the branch's utilitarian archive voice, but shift from academic italic delicacy toward heavier uppercase/index uses and bolder display moments.
- Scale and rhythm: larger homepage/display type, tighter section labels, denser archive metadata, and generous but deliberate article rhythm.
- Letter-spacing/weight behavior: use uppercase labels with positive tracking; avoid negative tracking in compact UI. Big display headings can be tight, but not brittle.
- What not to do: do not chase the exact Van Schneider font stack or fake proprietary display faces.

## Surface and Material

- Surface logic: the public shell should feel like a framed object on a black stage. Cards and panels can be hard-edged slips, plates, and index labels rather than soft academic paper.
- Borders/rules: use hard one-pixel rules and occasional thicker red/black accents. Borders should organize taxonomy and edges.
- Texture/noise: subtle scan/grid texture is allowed globally, but keep it restrained enough that CMS media and article text stay dominant.
- Shadows/depth: prefer broad black stage shadows and contained object shadows over soft beige card elevation.
- Media framing: large media bands, full-bleed section media, hard clipping, and title slips that preserve the transition system.

## Layout and Composition

- Homepage: start with a dark framed hero that behaves like an index cover, not a friendly intro card. Add compact taxonomy rails and a stage-like frame. Selected Work should read as a stack of large media artifacts. Writing should feel like an archive shelf.
- Cards: case studies should stay media-led and transition-compatible; writing cards should become denser, darker-edged archive objects with strong metadata.
- Article rhythm: detail pages can open with dark media/title staging, then transition into warm bone article bodies for readability.
- Footer/nav: navigation should be contextual, compact, and index-like. Footer should feel like the global site map/archive drawer.
- Mobile behavior: retain the same ideas but simplify into stacked framed bands. No tiny decorative text that becomes unreadable.
- Composition experiments to attempt: stage-frame shell, taxonomy rows, red index rails, dark-to-light detail transitions, and denser media-first section rhythm.

## Motion and Interaction

- Page/route motion: preserve the featured-media transition hooks. The existing media-to-detail system should feel sharper through framing and contrast rather than new infrastructure.
- Hover/touch behavior: use restrained image zoom/contrast changes, red rule movement, and object lift only where it improves affordance.
- Scroll behavior: no dependency on complex scroll choreography for core comprehension. Static generation and ordinary SSR/client navigation must remain boring.
- Reduced-motion expectation: all new hover/motion additions need reduced-motion fallbacks.

## Accessibility and Usability

- Color contrast: especially check red on dark, muted text on dark, and muted text on warm article surfaces.
- Focus states: keep the global focus outline visible. In this branch, focus can become a red proof-mark outline/rule.
- Keyboard behavior: do not replace real links/buttons with decorative wrappers.
- Link affordances: links need visible underline/rule treatment, not color alone.
- Readability: article pages must remain calmer than the homepage and archive surfaces.

## Anti-Goals

- Avoid making the site a Van Schneider fan skin.
- Avoid page-builder visual chaos or one-off inline style logic.
- Avoid a generic black portfolio with red buttons.
- Avoid hiding the user's real content behind decorative myth-making.
- Avoid motion that only works in a live dev session and fails static preview.

## Implementation Notes for the Agent

The agent may edit palette files, shared-component recipes, scoped SFC styles, and supporting SFC markup where the visual direction needs it. Preserve the content model, GraphQL query shape, block registry, transition data hooks, static deploy scripts, Docker infrastructure, and CMS schema.

Expected checks:

- `corepack pnpm check`
- Static preview visual QA via the user's static generation plus preview workflow
- Static generation smoke test before a winning branch is merged

## Handoff Summary

When the branch is ready for human review, summarize:

- Main visual decisions:
- Files changed:
- Known compromises:
- Screens or routes that need special QA:
- Whether static generation was smoke-tested:
