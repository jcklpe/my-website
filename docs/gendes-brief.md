# Generative Design Brief: Pop Color

## Branch

- Branch name: `gendes-pop-color.codex`
- Baseline branch: `gendes-academia`
- Mood-board folder: `docs/gendes-moodboard/pop-colors/`
- Working title: Pop Poster Toybox

## Thesis

This direction should feel like the site has been rebuilt from festival posters, toy dioramas, print registration marks, civic-isometric illustrations, and saturated art-school ephemera. It is optimistic, graphic, and approachable, but still disciplined. The design should say that the work is thoughtful without pretending seriousness requires visual quiet.

The key is controlled maximalism. The mood board is not just "many bright colors"; it is a system of flat hard-edged fills, poster crops, small precise type, dense ornamental moments, and generous fields of color. The homepage and navigation surfaces can get loud. Long-form writing should remain readable, with the pop language carried by heroes, labels, rules, block accents, and media frames rather than by turning every paragraph into decoration.

## References

- Reference: `docs/gendes-moodboard/pop-colors/f4a747331332bee612d62aae00bbd660.png`
- What to borrow: Overlapping geometric poster blocks, high-chroma cyan/red/yellow/blue, sharp edges, printed-object energy.
- What to avoid: Letting every UI panel become a random collage.

- Reference: `docs/gendes-moodboard/pop-colors/54a47e25e614da96c647edc94feabb54.gif`
- What to borrow: The strong yellow field, deep navy rectangle, small white information type, playful object-like composition.
- What to avoid: Low-contrast white text on yellow at body sizes.

- Reference: `docs/gendes-moodboard/pop-colors/c7033a700fdd6ca7ff4bbfced5b0cb05.png`
- What to borrow: Flat repeat geometry, cyan/yellow/red rhythm, large graphic sweep that can imply movement.
- What to avoid: Optical overload behind prose.

- Reference: `docs/gendes-moodboard/pop-colors/c130fe32b99e852de16c955069e44c78.gif`
- What to borrow: Layered toy-world/civic-map logic, friendly isometric density, color-coded zones.
- What to avoid: Literal illustrated scene-building in the UI.

- Reference: the Japanese and Korean poster references throughout the folder.
- What to borrow: Poster margins, event-label microtype, vertical/side labels, chunky section titles, hard color separations.
- What to avoid: Pastiche, faux-Asian ornament, or unreadable decorative type.

## Palette

- Ground/background: Warm poster cream for reading surfaces, with saturated yellow, aqua, coral, pink, cobalt, lime, and orange as section and component fields.
- Ink/text: Deep navy/ink rather than pure black. Use navy on yellow/cream/cyan for body text and white only on sufficiently dark cobalt/navy fields.
- Accent behavior: Accents should behave like printed color plates: bold, flat, intentional, and repeated. Prefer a few strong fields per screen over sprinkling tiny rainbow touches everywhere.
- Image treatment: Featured media can be framed with hard borders, color shadows, and slight saturation/contrast lift. Avoid filters that damage the CMS images as portfolio evidence.
- Contrast constraints: Body text, metadata, links, buttons, and focus states must meet WCAG AA. Yellow/orange/pink fields need navy text; white text is reserved for navy/cobalt.

## Typography

- Primary body face: Keep IBM Plex Sans for readable prose and UI.
- Heading voice: Move away from the academic italic mono heading voice. Use a heavier sans heading voice for poster weight; use mono for labels, dates, small event-poster details, and technical metadata.
- Scale and rhythm: Let homepage/section headings get chunky and poster-like. Article body headings stay quieter so the writing remains usable.
- Letter-spacing/weight behavior: Prefer weight, case, border, and placement over tight tracking. Keep letter spacing at `0` unless a small uppercase label already needs a readable positive value.
- What not to do: Do not make long prose all-caps, overly condensed, or dependent on decorative type.

## Surface and Material

- Surface logic: Cards and panels should feel like printed objects: flat fills, thick rules, offset color shadows, and label slips.
- Borders/rules: Use hard navy rules and occasional colored offset borders. Rules can be heavier than the baseline.
- Texture/noise: Subtle halftone or grid texture is welcome in broad surfaces, but it must stay low enough not to fight text.
- Shadows/depth: Prefer crisp offset shadows over soft SaaS shadows. Colored shadows should feel printed, not glassy.
- Media framing: Media should be treated like poster/image plates, with hard edges and visible framing. Preserve transition `clip-path` and `data-featured-*` hooks.

## Layout and Composition

- Homepage: Recast the page as a run of poster-like bands: a loud hero, a compact info/ticket panel, bold Selected Work posters, a color-shifted testimonial zone, a Side Projects callout, and a Latest Writing grid.
- Cards: Case-study cards can be large poster slabs with title slips. Writing cards should feel like smaller printed flyers or index cards.
- Article rhythm: Detail heroes may be loud, but body content should settle into a warm readable surface with pop-color block accents.
- Footer/nav: Nav should feel like a small sticker/ticket. Footer can be a large poster field with oversized heading and high-contrast link list.
- Mobile behavior: Preserve strong color fields but avoid cramped collage. Stack objects cleanly; keep buttons and labels touch-friendly.
- Composition experiments to attempt: Offset card shadows, ticket-like section labels, alternating section background fields, hard divider bars, and occasional side-rail labels.

## Motion and Interaction

- Page/route motion: Preserve the featured-media route transition and existing data hooks. The transition can feel more poster-like through the surface colors around it.
- Hover/touch behavior: Use small printed-object shifts: offset shadows, slight translate, color-swap underlines, and media saturation lift.
- Scroll behavior: No heavy scroll-jacking. Section transitions can rely on color-field rhythm rather than complex animation.
- Reduced-motion expectation: Any new transform or animation must flatten under `prefers-reduced-motion`.

## Accessibility and Usability

- Color contrast: Navy-on-bright is the default for bright fields. White-on-bright is not allowed unless verified against a dark enough color.
- Focus states: Focus rings should be obvious and may use a high-contrast offset outline, but the global fallback remains.
- Keyboard behavior: Preserve existing native links/buttons and route-transition behavior.
- Link affordances: Links need visible underline, background, or border behavior. No generic labels.
- Readability: Article bodies, archive cards, and CMS-authored pages must remain scannable and comfortable.

## Anti-Goals

- Avoid generic rainbow theme swapping.
- Avoid Memphis cliche as the main idea.
- Avoid kawaii/toy literalism that competes with the actual portfolio work.
- Avoid faux-Asian typography or ornamental borrowing.
- Avoid gradient-orb/glassmorphism SaaS styling.
- Avoid sacrificing article readability for poster density.

## Implementation Notes for the Agent

First pass implementation should focus on the frontend visual layer:

- Replace the baseline palette with a pop-color field and export the new tokens from the frontend context-role.
- Update global surface texture toward subtle print/grid rather than academic paper.
- Change heading behavior away from italic mono toward heavier poster sans, while retaining mono for labels.
- Restyle homepage hero/sections into bold color bands.
- Restyle case-study cards, post cards, nav, footer, detail hero slip panels, and key editorial block recipes.
- Preserve content model, GraphQL query shape, block registry, transition data hooks, static deploy scripts, Docker infrastructure, and CMS schema.

Expected checks:

- `corepack pnpm check`
- SSR review via `corepack pnpm dev` or the local frontend URL at `http://127.0.0.1:3001`
- Static generation smoke test before a winning branch is merged

## Handoff Summary

When the branch is ready for human review, summarize:

- Main visual decisions:
- Files changed:
- Known compromises:
- Screens or routes that need special QA:
- Whether static generation was smoke-tested:
