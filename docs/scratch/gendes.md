# Generative Design

## What This Is

This is a design exploration methodology, not a single visual refresh. The site exists as a portfolio and personal presence — the design layer is itself part of the work being shown. The generative design spikes treat the visual direction as an open, iterable question rather than a settled decision.

The approach:

1. The non-brand academic baseline (`gendes-academia` branch) is the clean, neutral departure point. All spikes branch from it.
2. Each spike is a branch. It gets a mood board, a design brief, and an agent-driven implementation pass.
3. Multiple spike branches can exist in the same repo simultaneously, reviewed one at a time by switching branches.
4. The goal is to produce genuinely distinct visual directions and evaluate what feels coherent and true. The winner gets hand-tweaked and merged into the main working line. Non-winning branches are kept for reference or discarded.

This is documented further in `docs/visual-design.md`.

---

## The Baseline

The `gendes-academia` branch established the non-brand academic baseline:

- Warm off-white surface, near-black ink text, electric blue used sparingly
- IBM Plex Mono Italic as the single expressive typographic move (headings only); IBM Plex Sans for body
- Clean functional layouts; no decorative elements
- Palette fully stripped of the original purple `$color-accent`
- Article body at document rhythm — not expressive large headings inside prose

This is the starting point all spikes depart from clearly. The baseline itself is not the destination.

---

## How a Spike Works

1. **Brief and mood board** — pick a mood/direction and write a short brief. Generate or assemble a mood board. The brief should be specific enough to guide real decisions: what surfaces look like, what the motion personality is, what typographic voice is being explored.

2. **Branch** — create a branch from the `gendes-academia` tip: `git checkout -b gendes-<direction>`. Give the agent the brief.

3. **Implement** — the agent changes the visual layer. The content model, block system, and CMS wiring stay intact. The frontend rendering components stay intact. What changes is the palette, typography, motion, surface treatments, and layout personality.

4. **Review** — the spike runs locally in SSR via the normal dev stack (`corepack pnpm dev` + one shared Docker CMS). Switch between branches in the same repo to compare directions; Vite picks up changes on switch.

5. **Decision** — does this direction feel right? Does it say something true about the work? Is it consistent? Does it open up interesting design questions or foreclose them? Pick a winner. Hand-tweak it. Non-winning branches can be kept for reference or deleted.

---

## Engineering Constraints That Must Hold Across All Spikes

These are functional dependencies. A spike that breaks them is not a design spike — it is a regression.

**Transition system hooks**: The featured-media card-to-detail transitions depend on `clip-path` and `data-featured-*` attributes on card and `FeaturedMediaFrame` elements. These are not visual choices — they are the mechanism the transition reads. Do not remove or rename them during reskins. Transition timing tokens live in `_motion-palette.scss`.

**Content-flow grid**: The `.content-flow` CSS named grid is the structural shell for all article body content. Block width/alignment declarations (normal, wide, full, float-breakout) are positional facts. A spike can restyle block surfaces but should not break the grid placement system.

**Block rendering architecture**: Gutenberg blocks map to Vue components. Reskinning the visual layer means updating styles; it does not mean restructuring `BlockRenderer.vue` or the block component tree.

**SSR/static compatibility**: Spikes are developed and reviewed in SSR. The winner will eventually be statically generated for deploy. Techniques that break static generation or cause hydration mismatches are not viable, even though the iteration loop itself is SSR only.

**CMS and content model**: Palette, typography, and motion are all fair game. Content types, ACF field sets, and GraphQL structure are not part of a design spike.

---

## Engineering Freedoms

Everything in the visual layer is in play:

- **Palette** — `packages/styles/_color-palette.scss` is the source; exported as CSS custom properties. A spike can replace the whole palette if it wants.
- **Typography** — typeface choices, scale, weight, line-height. The font loading mechanism (`_type-fonts.scss`) stays; the values it loads can change.
- **Motion and transitions** — `_motion-palette.scss` exports timing tokens. A spike can introduce scroll-driven animation, richer page transitions, or reduce motion to near-zero.
- **Surface treatments** — gradients, textures, borders, shadows, blur. Currently mostly absent; fair game in a spike.
- **Layout personality** — the `.content-flow` grid defines tracks; a spike can adjust widths, margins, and rhythm. Card layout can change significantly. Section compositions on the homepage can be rethought.
- **Interactive behaviors** — hover states, card lift, cursor customization, scroll snapping. Parallax mouse effects on cards (noted in future-ideas) are worth re-evaluating inside a gendes spike context.

---

## Evaluation Criteria

A spike is worth pursuing further if:

- It feels **coherent** — the palette, type, motion, and layout are saying the same thing
- It feels **true** — it reflects something real about the work and the person showing it, not just a borrowed aesthetic
- It is **stable** — it works across surfaces without feeling like it was only designed at one breakpoint or one content length
- It opens up **design questions** — it makes you want to keep exploring, not just ship it and forget it

A spike is worth discarding if it requires compromising the content model or transition system, if it only works on the homepage and falls apart on article pages, or if it reads as pastiche rather than as a genuine direction.

---

## Relationship to Pending Work

Some pending spikes have surface-level overlap with gendes:

- **Homepage refinement** (`docs/scratch/homepage.md`) — covers content model decisions and wiring. Gendes may revisit the homepage layout and visual treatment significantly, but the homepage refinement work should still be done first to stabilize the content model the spike designs against.
- **WCAG + SEO** (`docs/scratch/wcag-seo.md`) — do not defer WCAG work into gendes. If a spike introduces a direction with accessibility issues, fix them as part of the spike, not separately.

---

## Process Notes

- A non-winning branch can be kept for reference or deleted — it has served its purpose once the direction is evaluated.
- AI tools (image generation, design critique, mood board assembly) are legitimate inputs to the brief and review stages.
- When the gendes work moves from planning to active, promote this file and `gendes.todo.md` from `docs/scratch/` to `docs/`.
