# Generative Design — To Do

## Background

The non-brand academic baseline is done. The site is calm, typographically-led, and deployable. Generative design spikes are the next phase: create branches from `gendes-academia`, give each one a mood board and brief, explore distinct visual directions, and evaluate what sticks.

Read `docs/scratch/gendes.md` for the full methodology. Read `docs/visual-design.md` for the baseline this work forks from.

---

## General Principles

- Each spike is a branch off `gendes-academia`. Branches are cheap. Commitment to a direction is how you learn whether it works.
- A spike runs locally in SSR — not a screenshot, not a Figma mockup — to be evaluated properly. One shared Docker CMS stack serves all branches; switch branches in the same repo, Vite picks up the changes.
- Stabilize content model work (homepage fields, About page, Side Projects) before running the first spike so the spike designs against real page structures, not placeholders.
- Preserve the transition system hooks, content-flow grid, and block rendering architecture in every spike. The constraints are not negotiable.
- Accessibility does not get deferred to post-spike cleanup. If a direction introduces contrast failures or broken focus states, fix them before calling that branch a candidate.
- Non-winning branches can be kept for reference or deleted once the direction is clearly understood.

---

## Current State Overview

- Non-brand academic baseline: complete on `gendes-academia` branch
- Visual layer: palette, typography, article body, cards, footer, nav, and homepage sections are all at a quiet, stable first pass
- Transition system: card-to-detail and detail-to-card featured-media transitions working; fallback fade/slide working; timing tokens in `_motion-palette.scss`
- Static deploy: working end-to-end on Bunny CDN; Lighthouse 97
- Homepage content model: functional first pass; refinement spike pending before gendes runs
- About page: frontend standalone; CMS-managed rewrite pending before gendes runs
- Block coverage: all common block families covered at a first-pass visual quality

---

## To Do

### Preparation (do before the first spike)

- Complete homepage content model refinement (`docs/scratch/homepage.md`) so the spike designs against real section structure
- Complete About page CMS migration (`docs/scratch/about-page.md`) so About is a real page with real content during the spike
- Complete copy cleanup (`docs/scratch/copy-cleanup.md`) — LLM placeholder text in a design spike review makes it hard to evaluate the actual design
- Confirm Side Projects page has at least a real empty-state before running a spike

### Spike Workflow Setup (once, not per spike)

- Confirm the branch naming convention: `gendes-<direction>` branched from `gendes-academia`
- Document how winning changes get applied back: cherry-pick or manually carry the palette, type, and style file changes onto the main working branch — not a full branch merge

### First Spike

- Write the design brief — one or two paragraphs, specific enough to guide real decisions: what mood, what references, what this direction is not
- Assemble or generate a mood board — colors, textures, type pairings, layout references
- Create the branch: `git checkout -b gendes-<direction>` from `gendes-academia`
- Give the agent the brief; let it implement the visual layer — palette, typography, surface treatments, card treatment, homepage sections
- Run `corepack pnpm check` — lint, typecheck, editor CSS rebuild
- Review locally in SSR (`http://my-website.localhost`) across surfaces: homepage, case study detail, writing detail, writing archive, about

---

## Ready for Human Visual QA

_(Move items here when they are implemented and running locally in SSR, but not yet reviewed and decided on.)_

---

## Done

- Non-brand academic baseline — palette, typography, article body, cards, footer, nav, homepage sections
- Static CDN deploy with Lighthouse 97
- Card-to-detail, detail-to-card, and detail-to-detail featured-media transitions
- Transition timing tokens in `_motion-palette.scss`, JS reads CSS custom properties
- `docs/visual-design.md` documents the baseline visual direction
