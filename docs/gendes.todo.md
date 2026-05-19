# Generative Design — To Do

## Background

The non-brand academic baseline is done. The site is calm, typographically-led, and deployable. The generative design spike has run its first round (eight branches: `gendes-systems-atlas`, `gendes-blue1`, `gendes-blue1.1`–`gendes-blue1.7`) and the human has produced a per-section audit and synthesis notes (Notion: *Design System Audit*).

We are now in the **synthesis phase**. The current working branch is `gendes-blue2.claudecode`, branched from `gendes-blue2` (a neutral start off `gendes-blue1`). The brief at `docs/gendes-brief.md` defines the synthesis direction. Synthesis pulls per-section winners across the eight runs using `git show <branch>:<path>` to read source from other branches without checking them out.

Read `docs/gendes.md` for the full methodology. Read `docs/visual-design.md` for the baseline this work forks from. Read `docs/gendes-brief.md` for the active synthesis brief.

---

## General Principles

- Each design branch is a branch off `gendes-academia`. Branches are cheap. Commitment to a direction is how you learn whether it works.
- A design branch runs locally in SSR — not a screenshot, not a Figma mockup — to be evaluated properly. One shared Docker CMS stack can serve all branches; switch branches in the same repo by default.
- A `git worktree` workflow is optional if separate folders become useful for comparing branches. It is not required for the first pass.
- Stabilize enough content model work before running the first design branch so it designs against real page structures, not placeholders.
- Preserve the transition system hooks, content-flow grid, and block rendering architecture in every design branch. The constraints are not negotiable.
- Accessibility does not get deferred to post-branch cleanup. If a direction introduces contrast failures or broken focus states, fix them before calling that branch a candidate.
- Non-winning branches can be kept for reference or deleted once the direction is clearly understood.

---

## Current State Overview

- Non-brand academic baseline: complete on `gendes-academia` branch
- Visual layer: palette, typography, article body, cards, footer, nav, and homepage sections are all at a quiet, stable first pass
- Transition system: card-to-detail and detail-to-card featured-media transitions working; fallback fade/slide working; timing tokens in `_motion-palette.scss`
- Static deploy: working end-to-end on Bunny CDN; Lighthouse 97
- Homepage refinement: complete; hero/top region is route-local, Selected Work and Latest Writing are separate homepage-specific components, and placeholder behavior is explicit
- About page: CMS-managed via a normal WordPress Page with a plain admin title, ACF Display Heading for the public `h1`, Gutenberg body content, and normalized authored internal links
- Side Projects page: CMS-managed via a normal WordPress Page rendered through `BlockRenderer`
- WCAG + SEO baseline: active pass-1 spike in `docs/wcag-seo1.md` and `docs/wcag-seo1.todo.md`
- Block coverage: all common block families covered at a first-pass visual quality

---

## To Do

### Hard Preparation

- Confirm the baseline branch runs locally in SSR without major rendering errors
- Confirm the static generation path still works after the current baseline, even if design branches are reviewed mainly in SSR
- Confirm mood-board media is kept local/ignored and organized by design branch under `docs/gendes-moodboard/<branch-name>/`
- Complete the practical WCAG + SEO baseline pass enough that design branches inherit clear accessibility and metadata expectations

### Design Branch Workflow Setup

- Confirm the branch naming convention: `gendes-<direction>` branched from `gendes-academia`
- Use ordinary branch switching in this repo as the default comparison workflow
- Optionally document a `git worktree` workflow later if comparing multiple branches in separate folders becomes more comfortable
- Keep each design branch scoped to visual direction work so the winning branch can be merged back deliberately
- Merge the winning design branch back into the main working line after review and hand-tweaking, rather than manually copying the result file-by-file

### First Design Branch

Done. The first round produced eight branches: `gendes-systems-atlas`, `gendes-blue1`, and `gendes-blue1.1`–`gendes-blue1.7`. See `git branch -a | grep gendes` for the full list. Per-section audit notes live in Notion (*Design System Audit*).

### Synthesis Pass (current)

- Branch: `gendes-blue2.claudecode`, off `gendes-blue2` (which is off `gendes-blue1`)
- Brief: `docs/gendes-brief.md` — the *Blueprint Brutalism — synthesis* direction
- Agent uses `git show <branch>:<path>` to pull patterns from per-section winning runs without checking out
- Bento grid layout from `gendes-blue1.1` is **deferred** to a follow-up spike (the algorithm is finicky and breaks card-to-detail back-animation). The styling from blue1.2 is in this pass; the bento layout itself is not.
- Run `corepack pnpm check` — lint, typecheck, editor CSS rebuild; failures are blocking
- Review locally in SSR with `corepack pnpm dev` at `http://my-website.localhost` across the review matrix below

### Expected Edit Scope

- Palette and token files under `packages/styles/`
- Shared-component recipes under `packages/styles/shared-components/`
- Scoped styles and supporting markup in Vue SFCs under `apps/frontend/components/`
- Route/page styles where a direction needs a page-level composition change
- Homepage/archive/card/detail composition changes when the branch needs more than a theme-variable pass
- Avoid CMS schema, GraphQL query shape, block registry changes, deploy scripts, Docker infrastructure, static publishing behavior, and seeded content unless a real rendering bug blocks the design branch

### Review Matrix

- Home desktop and mobile: hero, Selected Work, Latest Writing, Side Projects, About/CTA surfaces, footer
- Writing archive desktop and mobile: cards, load-more behavior, empty and long-list feel
- Writing detail: article rhythm, headings, text blocks, media, code, quote/pullquote, lists, table, embeds, audio/video, file/download, details/accordion — use the block QA fixture post at `/writing/block-qa-kitchen-sink-post`
- Case-study detail: featured media transition, hero, content-flow rhythm, bottom previous/next navigation — the block QA case study at `/case-studies/block-qa-kitchen-sink-case-study` covers the full block range
- About page: whether the direction can handle an identity-heavy CMS-authored page with a prominent display heading
- Side Projects page or empty-state: whether secondary work has a coherent surface
- Keyboard/focus states, reduced motion, color contrast, link affordances, and hover/touch parity
- Static generation smoke test before a winner is merged

---

## Ready for Human Visual QA

_(Move design branches here when they are implemented and running locally in SSR, but not yet reviewed and decided on.)_

---

## Done

- Non-brand academic baseline — palette, typography, article body, cards, footer, nav, homepage sections
- Static CDN deploy with Lighthouse 97
- Homepage refinement complete; archived spike docs live at `docs/archive/homepage.md` and `docs/archive/homepage.todo.md`
- About page CMS migration complete; archived spike docs live at `docs/archive/about-page.md` and `docs/archive/about-page.todo.md`
- Side Projects page complete; archived spike docs live at `docs/archive/side-projects-page.md` and `docs/archive/side-projects-page.todo.md`
- Copy cleanup complete; archived spike docs live at `docs/archive/copy-cleanup.md` and `docs/archive/copy-cleanup.todo.md`
- Card-to-detail, detail-to-card, and detail-to-detail featured-media transitions
- Transition timing tokens in `_motion-palette.scss`, JS reads CSS custom properties
- `docs/visual-design.md` documents the baseline visual direction
