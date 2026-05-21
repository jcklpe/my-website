# Generative Design — To Do

## Background

The non-brand academic baseline is done. The site is calm, typographically-led, and deployable. The generative design spike is the next phase: create design branches from `gendes-academia`, give each one a mood board, explore distinct visual directions, and evaluate what sticks.

Read `docs/gendes.md` for the full methodology. Read `docs/visual-design.md` for the baseline this work forks from. Create the design branch first, then fill `docs/gendes-moodboard/<direction>/` before handing that branch to an implementation agent. A separate written brief is optional when the mood board and discussion already define the direction.

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
- Active branch: `gendes-desert-jackalope.codex`
- Active mood board: `docs/gendes-moodboard/desert-jackalope/`
- Active direction: desert occult naturalist — bone paper, copper/gold linework, mineral terrain color, specimen drawings, jackalope myth, sparse field-guide/editorial composition

---

## To Do

### Hard Preparation

- Confirm the baseline branch runs locally in SSR without major rendering errors
- Confirm the static generation path still works after the current baseline, even if design branches are reviewed mainly in SSR
- Confirm mood-board media is kept local/ignored and organized by design branch under `docs/gendes-moodboard/<direction>/`
- Complete the practical WCAG + SEO baseline pass enough that design branches inherit clear accessibility and metadata expectations

### Design Branch Workflow Setup

- Confirm the branch naming convention: `gendes-<direction>` branched from `gendes-academia`
- Use ordinary branch switching in this repo as the default comparison workflow
- Optionally document a `git worktree` workflow later if comparing multiple branches in separate folders becomes more comfortable
- Keep each design branch scoped to visual direction work so the winning branch can be merged back deliberately
- Merge the winning design branch back into the main working line after review and hand-tweaking, rather than manually copying the result file-by-file

### Desert Jackalope Design Branch

- Confirm work is happening in `/Users/aslan/work/my-website-3` on `gendes-desert-jackalope.codex`
- Use `docs/gendes-moodboard/desert-jackalope/` as the primary creative input; no separate brief is required for this run
- Update `docs/gendes.md` with the branch interpretation so future agents do not drift toward saloon-western or beige-blog readings
- Implement palette, typography, surface treatments, card treatment, homepage sections, detail pages, navigation, footer, and key authored-block surfaces
- Preserve content-flow, block rendering, CMS schema, GraphQL, static deploy tooling, and featured-media transition hooks
- Run `corepack pnpm check` when feasible — lint, typecheck, editor CSS rebuild; failures are blocking unless environmental
- Review locally in SSR with `corepack pnpm start:frontend` at `http://my-website.localhost` across the review matrix below

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
