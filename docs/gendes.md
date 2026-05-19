# Generative Design

## What This Is

This is a design exploration methodology, not a single visual refresh. The site exists as a portfolio and personal presence — the design layer is itself part of the work being shown. The generative design spike treats the visual direction as an open, iterable question rather than a settled decision.

The approach:

1. The non-brand academic baseline (`gendes-academia` branch) is the clean, neutral departure point. All design branches start from it.
2. Each design branch gets a mood board, a design brief, and an agent-driven implementation pass.
3. Multiple design branches can exist in the repo, reviewed one at a time by switching branches. `git worktree` is optional if separate working folders become useful, but the default workflow is ordinary branch switching.
4. The goal is to produce genuinely distinct visual directions and evaluate what feels coherent and true. The winning design branch gets hand-tweaked and merged back into the main working line. Non-winning branches are kept for reference.

This is documented further in `docs/visual-design.md`.

---

## The Baseline

The `gendes-academia` branch established the non-brand academic baseline:

- Warm off-white surface, near-black ink text, electric blue used sparingly
- IBM Plex Mono Italic as the single expressive typographic move (headings only); IBM Plex Sans for body
- Clean functional layouts; no decorative elements

This is the starting point all design branches depart from clearly. The baseline itself is not the destination.

---

## Inputs

The generative design agent should be given these active project inputs before it starts:

- `docs/gendes.md` — the method and guardrails
- `docs/gendes.todo.md` — the operational checklist and review path
- `docs/gendes-moodboard/<branch-name>/` — the local visual references, image assets, notes, and other mood-board material for the next design branch
- `docs/scratch/gendes-brief.md` — an optional synthesis brief when one has been authored; a brief is most useful after multiple runs have produced audit data. It is not required for exploratory runs.

Branch-specific briefs live at `docs/scratch/gendes-brief.md`. The file is branch-local: different design branches may have different briefs. A brief without a prior moodboard audit tends to produce over-constrained output. An audit-driven brief (after comparing multiple runs) produces more useful synthesis targets.

---

## How a Design Branch Works

1. **Branch** — create a design branch from the `gendes-academia` tip: `git checkout -b gendes-<direction>`.
2. **Mood board** — assemble the mood board under `docs/gendes-moodboard/<branch-name>/`. The agent reads the images directly as its primary directional input. A written brief is optional but most useful after a prior audit pass.
3. **Implement** — the agent changes the visual layer and, where useful, the Vue markup that supports that direction. The content model, block registry, GraphQL wiring, CMS schema, and static deploy machinery stay intact. What changes is the palette, typography, motion, surface treatments, layout personality, and component composition.
4. **Audit** — compare runs section-by-section. Document what works and what doesn't in each component. This is where synthesis material comes from. See the Design System Audit methodology: compare the same section across all runs, then write synthesis notes per section.
5. **Synthesize** — after multiple runs, author a `docs/scratch/gendes-brief.md` capturing specific synthesis decisions — which elements from which runs to combine, what anti-patterns to avoid (BTAK: design elements that perform meaning they don't carry), and what remains unresolved. Give the synthesis brief to an agent for a new branch.
6. **Review** — the design branch runs locally in SSR via the normal dev stack (`corepack pnpm start:frontend` + one shared Docker CMS). Switch between branches in the same repo to compare directions; Vite picks up changes on switch.
7. **Decision** — does this direction feel right? Does it say something true about the work? Is it consistent? Does it open up interesting design questions or foreclose them? The human will pick a winner. Hand-tweak it. Workshop it with an agent or two. Merge the winning branch back into the main working line. Non-winning branches will be mothballed.

---

## Engineering Constraints That Must Hold Across All Design Branches

These are functional dependencies. A design branch that breaks them is not a useful visual direction — it is a regression.

**Transition system hooks**: The featured-media card-to-detail transitions depend on `clip-path` and `data-featured-*` attributes on card and `FeaturedMediaFrame` elements. These are not visual choices — they are the mechanism the transition reads. Do not remove or rename them during reskins. Transition timing tokens live in `_motion-palette.scss`.

**Content-flow grid**: The `.content-flow` CSS named grid is the structural shell for all article body content. Block width/alignment declarations (normal, wide, full, float-breakout) are positional facts. A design branch can restyle and tune the grid, but should not break the placement system or the meaning of width/alignment variants.

**Block rendering architecture**: Gutenberg blocks map to Vue components. Design branches may edit individual SFC markup, scoped styles, and shared-component recipes when that supports the visual direction. They should not replace the block renderer, alter the block registry, or change the content fetching contract as part of a visual exploration.

**SSR/static compatibility**: Design branches are developed and reviewed in SSR. The winner will eventually be statically generated for deploy. Techniques that break static generation or cause hydration mismatches are not viable, even though the iteration loop itself is SSR only.

**CMS and content model**: Palette, typography, and motion are all fair game. Content types, ACF field sets, and GraphQL structure are not part of a design branch.

---

## Engineering Freedoms

Everything in the visual layer is in play:

- **Palette** — `packages/styles/_color-palette.scss` is the source; exported as CSS custom properties. A design branch can replace the whole palette if it wants.
- **Typography** — typeface choices, scale, weight, line-height. The font loading mechanism (`_type-fonts.scss`) stays; the values it loads can change.
- **Motion and transitions** — `_motion-palette.scss` exports timing tokens. A design branch can introduce scroll-driven animation, richer page transitions, or reduce motion to near-zero.
- **Surface treatments** — gradients, textures, borders, shadows, blur. Currently mostly absent; fair game in a design branch.
- **Layout personality** — the `.content-flow` grid defines tracks; a design branch can adjust widths, margins, and rhythm. Card layout can change significantly. Section compositions on the homepage can be rethought.
- **Component markup** — Vue SFC templates can change when the markup supports the visual concept, improves composition, or makes the design easier to reason about. Do not change markup just to be clever, and do not break data hooks or accessibility.
- **Interactive behaviors** — hover states, card lift, cursor customization, scroll snapping. Parallax mouse effects on cards (noted in future-ideas) are worth re-evaluating inside a gendes branch context.

The goal is not just to twist theme knobs. Palette and type changes are expected, but a strong design branch should also ask compositional questions: how sections are staged, how cards behave as objects, how reading surfaces feel, how media enters the page, and how the site creates a memorable rhythm across homepage, archive, and article/detail views. Agents should be encouraged to move beyond token substitution when the brief calls for it, while preserving the content and rendering contracts.

Expected edit centers:

- Palette and token files under `packages/styles/`
- Shared-component recipes under `packages/styles/shared-components/`
- Scoped styles and supporting markup in Vue SFCs under `apps/frontend/components/`
- Route/page styles where a direction needs a page-level composition change

Avoid editing CMS schema, GraphQL queries, deploy scripts, Docker infrastructure, content seed scripts, or static publishing behavior unless a real bug blocks the branch from rendering.

---

## Evaluation Criteria

A design branch is worth pursuing further if:

- It feels **coherent** — the palette, type, motion, and layout are saying the same thing
- It feels **true** — it reflects something real about the work and the person showing it, not just a borrowed aesthetic
- It is **stable** — it works across surfaces without feeling like it was only designed at one breakpoint or one content length
- It opens up **design questions** — it makes you want to keep exploring, not just ship it and forget it

A design branch is worth discarding if it requires compromising the content model or transition system, if it only works on the homepage and falls apart on article pages, or if it reads as pastiche rather than as a genuine direction.

---

## Relationship to Pending Work

Some pending spikes have surface-level overlap with gendes.

Hard blockers before the first design branch:

- The baseline should run locally without major known rendering errors.
- The pages used for design review should have enough real structure and content to judge the direction.
- The transition and block rendering systems should be stable enough that the design branch is not debugging infrastructure.

Preferred prep before the first design branch:

- **Homepage refinement** — complete. The homepage hero/top region has been flattened into the route, Selected Work and Latest Writing now have separate homepage-specific components, and obvious placeholder behavior is documented. Archived spike docs live at `docs/archive/homepage.md` and `docs/archive/homepage.todo.md`.
- **About page CMS migration** — complete. `/about` is now a CMS-managed WordPress Page; archived spike docs live at `docs/archive/about-page.md` and `docs/archive/about-page.todo.md`.
- **Copy cleanup** — complete. Archived spike docs live at `docs/archive/copy-cleanup.md` and `docs/archive/copy-cleanup.todo.md`.
- **Side Projects page** — complete. `/side-projects` is now a CMS-backed WordPress Page; archived spike docs live at `docs/archive/side-projects-page.md` and `docs/archive/side-projects-page.todo.md`.
- **WCAG + SEO baseline** (`docs/wcag-seo1.md` and `docs/wcag-seo1.todo.md`) — active pass-1 prep. Do not defer accessibility into post-branch cleanup. If a design branch introduces contrast failures, broken focus states, or generic link text, fix them before calling that branch a candidate. A later qualitative/design-theory follow-up can live in `docs/scratch/wcag-seo2.md`.
