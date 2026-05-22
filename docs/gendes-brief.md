# Generative Design Brief - Organic Dream

Use this file as the handoff brief for the active generative design branch.

## Branch

- Branch name: `gendes-organic-dream.codex`
- Baseline branch: `gendes-academia`
- Mood-board folder: `docs/gendes-moodboard/organic-dream/`
- Working title: Organic Dream

## Thesis

This direction should make the site feel like an annotated dream ecology: a personal portfolio as a living field guide for design, technology, writing, and strange systems. The mood board points toward biological specimen plates, neural diagrams, celestial instruments, soft fantasy cartography, and translucent botanical forms. The site should feel careful and readable, but less austere than the non-brand academic baseline - more like a cabinet of luminous observations than a research-lab landing page.

The key tension is discipline plus enchantment. Borrow the exactness of diagrams, callouts, labeled plates, thin rules, and measured grids, then let those structures hold organic, asymmetric, slightly uncanny forms. This should not become a decorative skin of plants and stars. It should feel like the interface itself is a quiet instrument for inspecting living documents.

## References

- Reference: `docs/gendes-moodboard/organic-dream/f914bce1473930afc7c1787fb49d8a7b.jpg`
- What to borrow: Dense biological atlas composition, varied organism silhouettes, thin connective structures, specimen logic, strange anatomical detail.
- What to avoid: Overcrowding every UI surface; the site still needs calm reading areas.

- Reference: `docs/gendes-moodboard/organic-dream/f142b8f86c7163dcb40ab59a79d82346 (1).jpg`
- What to borrow: Dark scientific plate energy, high-contrast linework, branching neural/root structures, labeled diagram fragments.
- What to avoid: Making the whole site black; reserve dark plates for emphasis, code, selected panels, or media-led moments.

- Reference: `docs/gendes-moodboard/organic-dream/670d3273c309e784ce075c0d30ae04fb (1).jpg`
- What to borrow: Pale dream diagram, soft pastel gradients, celestial orbit lines, annotated vertical figure, airy negative space.
- What to avoid: Low-contrast text or washed-out interactive states.

- Reference: `docs/gendes-moodboard/organic-dream/9f6912312bbf62911a5dd9f2de3d90e2 (1).jpg`
- What to borrow: Luminous wireframe flower, black ground, precise overlay grid, technical annotation around an organic object.
- What to avoid: Generic cyberpunk neon or heavy glassmorphism.

- Reference: `docs/gendes-moodboard/organic-dream/81a626b54e3a74f4a9db513ab460694d.png`
- What to borrow: Hand-drawn edge energy, comet/smoke trails, irregular ink contours, tiny colored star-like marks.
- What to avoid: Doodle clutter or decorative marks that fight content hierarchy.

- Reference: `docs/gendes-moodboard/organic-dream/aba0fd0c943d41f3ccaed2399695a46f.jpg`
- What to borrow: Translucent petal geometries, pastel line meshes, biological symmetry, delicate layering.
- What to avoid: Purely ornamental floral pastiche.

## Palette

- Ground/background: Warm vellum, porcelain, or soft cream as the primary reading ground. It can have subtle paper grain, faint grid/rule texture, or barely-there diagram marks, but the body background should stay quiet enough for long reading.
- Ink/text: Deep blue-black or blackened plum for primary text. Maintain a strong text color for body copy and headings; do not let the pastel palette weaken readability.
- Accent behavior: Accents should feel like precise specimen markings: lapis/cobalt, coral, soft magenta, teal, acid green/chartreuse, and small antique-gold notes. Use them as points, rules, halos, labels, and interactive highlights rather than broad color fields.
- Image treatment: Featured media can be framed as slides, plates, or observed specimens. Some surfaces may use dark "night plate" treatment with luminous linework, but ordinary prose should keep a light ground.
- Contrast constraints: Body text, links, metadata, focus rings, buttons, and nav controls must pass WCAG AA at their rendered sizes. Pastels are acceptable for decoration, not for essential text on light backgrounds unless contrast is verified.

## Typography

- Primary body face: Keep body text comfortable, humane, and highly readable. IBM Plex Sans can remain if it serves the branch; a change is allowed only if it improves readability and static loading stays simple.
- Heading voice: Headings can become more lyrical and plate-like than the current academic mono italic. Explore an elegant display voice or a refined italic/serif-like contrast for major page headings, while retaining mono for labels, metadata, coordinates, and annotations.
- Scale and rhythm: Preserve article readability and logical heading hierarchy. Page and homepage headings may be expressive; article-body headings should still feel like a readable document, not a poster system.
- Letter-spacing/weight behavior: Use light, airy labels with modest uppercase tracking for specimen metadata and callouts. Avoid negative letter spacing except where the existing page-scale type already needs it and still reads well.
- What not to do: Do not make all text ornamental, all headings wispy, or all labels microscopic. The site is still a working portfolio and writing surface.

## Surface and Material

- Surface logic: Think specimen plate, microscope slide, vellum sheet, night diagram, and translucent membrane. UI surfaces can feel layered, but each layer should have a job: reading, navigation, media inspection, or annotation.
- Borders/rules: Favor hairline rules, diagram ticks, bracket-like corners, orbit lines, and thin callout connectors. Rules can be asymmetrical and slightly organic, but should not become noisy.
- Texture/noise: Use restrained paper grain, faint grids, subtle radial blooms, or soft edge halos. Texture should be mostly atmospheric and should not reduce text clarity.
- Shadows/depth: Prefer glow, blur, and layered translucency sparingly over ordinary card drop shadows. Dark panels can use luminous edges; light panels can use thin borders and low shadow.
- Media framing: Cards and featured media can look like observed specimens: framed plates, cropped organisms, irregular masks, or annotated slides. Preserve the featured-media transition hooks and `clip-path` dependencies.

## Layout and Composition

- Homepage: Reinterpret the homepage as a composed atlas page. The hero can act as a title plate with subtle diagram marks, orbiting rules, or organic callout details. Sections should feel like different specimen families rather than generic stacked blocks.
- Cards: Case-study cards can be large living specimens or illuminated plates. Writing cards can be smaller catalog entries, field notes, or labeled observations. Both should belong to the same ecology while staying distinct.
- Article rhythm: Keep prose calm. Bring the branch personality into headings, separators, quotes, pullquotes, code, tables, galleries, media blocks, and details/accordion surfaces rather than overwhelming every paragraph.
- Footer/nav: Nav should remain a small local affordance, but can feel like a label tab or specimen tag. Footer can be a closing atlas plate or index, not a generic site-map slab.
- Mobile behavior: The mood should survive with simpler geometry. Avoid delicate marks that collapse into clutter; prioritize readable stacking, large touch targets, and clear section separation.
- Composition experiments to attempt: Asymmetric section labels, hairline callout rails, subtle pseudo-element ornament around heroes/cards, occasional dark plate surfaces, organic border radii or clipped silhouettes where they do not break transition geometry.

## Motion and Interaction

- Page/route motion: Preserve the featured-media transition system. Tune surrounding motion toward slow reveal, slide-under, unfurl, focus, or inspection rather than bounce or hard snapping.
- Hover/touch behavior: Hover should feel like a specimen waking up: a line brightens, a halo appears, annotation marks sharpen, or media gently breathes. Touch states should have equivalent visible feedback without relying on hover.
- Scroll behavior: Light scroll-linked reveal may be useful if it is subtle and does not create hydration or static-output risk. Avoid scroll gimmicks that make reading feel unstable.
- Reduced-motion expectation: Reduced-motion mode should remove transform-heavy and parallax-like movement while preserving clear state changes through color, border, opacity, or static decoration.

## Accessibility and Usability

- Color contrast: Treat pastel accents as decoration unless contrast is verified. Do not put essential text in pale pink, mint, lavender, or gold on cream.
- Focus states: Focus should be visible and branch-appropriate - for example, a clear dark outline, luminous ring, or high-contrast bracket. The global fallback in `_base.scss` must remain.
- Keyboard behavior: Preserve native links/buttons, load-more button semantics, accordion `aria-expanded`/`aria-controls`, and card link behavior.
- Link affordances: Links need visible affordance without relying only on color. Underlines, rule growth, bracket marks, or highlighted label behavior are all viable.
- Readability: Long-form writing must remain comfortable on light backgrounds. Do not let decorative overlays, texture, or low-value contrast interfere with reading.

## Anti-Goals

- Avoid: Cottagecore, botanical wallpaper, or "plants everywhere."
- Avoid: Generic psychedelic gradients, AI fantasy splash art, or moodboard literalism.
- Avoid: Cyberpunk neon, glassmorphism, and dark-mode domination.
- Avoid: Decorative diagrams that do not support hierarchy or interaction.
- Avoid: Fragile low-contrast pastel UI.

## Implementation Notes for the Agent

The agent may edit palette files, type/font palette files, effect and motion palettes, shared-component recipes, scoped SFC styles, and supporting SFC markup where the visual direction needs it. Preserve the content model, GraphQL query shape, block registry, transition data hooks, static deploy scripts, Docker infrastructure, and CMS schema.

Use the current static-preview review preference for this run: generate static output from the chosen CMS source, then review through `corepack pnpm start:static:preview`. The user is intentionally not relying on the Docker/Caddy port situation for visual QA in this thread.

Expected checks:

- `corepack pnpm check`
- Static preview review with `corepack pnpm generate:static:public` or `corepack pnpm generate:static:qa`, then `corepack pnpm start:static:preview`
- `corepack pnpm inspect:static` before any CDN deploy or before treating the branch as a merge candidate

## Handoff Summary

When the branch is ready for human review, summarize:

- Main visual decisions:
- Files changed:
- Known compromises:
- Screens or routes that need special QA:
- Whether static generation was smoke-tested:
