# Generative Design Brief Template

Use this file as the handoff brief for the next generative design branch. Replace the prompts with the actual direction before starting the branch.

## Branch

- Branch name:
- Baseline branch: `gendes-academia`
- Mood-board folder: `docs/gendes-moodboard/<branch-name>/`
- Working title:

## Thesis

One or two paragraphs on the direction. What should this version of the site feel like? What does it reveal about the work, the person, or the practice?

## References

List the references the agent should actually use. These can be visual artists, publications, interfaces, albums, books, objects, architecture, materials, games, films, product details, or specific images in `docs/gendes-moodboard/<branch-name>/`.

- Reference:
- What to borrow:
- What to avoid:

## Palette

Describe the color world and value structure.

- Ground/background:
- Ink/text:
- Accent behavior:
- Image treatment:
- Contrast constraints:

## Typography

Describe the typographic voice.

- Primary body face:
- Heading voice:
- Scale and rhythm:
- Letter-spacing/weight behavior:
- What not to do:

## Surface and Material

Describe cards, panels, borders, shadows, textures, media frames, and article surfaces.

- Surface logic:
- Borders/rules:
- Texture/noise:
- Shadows/depth:
- Media framing:

## Layout and Composition

Describe how the homepage, cards, article pages, and archives should compose. Push beyond token swaps when the direction needs a stronger structural idea.

- Homepage:
- Cards:
- Article rhythm:
- Footer/nav:
- Mobile behavior:
- Composition experiments to attempt:

## Motion and Interaction

Describe motion personality without breaking the featured-media transition hooks.

- Page/route motion:
- Hover/touch behavior:
- Scroll behavior:
- Reduced-motion expectation:

## Accessibility and Usability

Non-negotiables for the branch.

- Color contrast:
- Focus states:
- Keyboard behavior:
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
