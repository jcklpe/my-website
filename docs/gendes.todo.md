# Generative Design — To Do

## Background

The non-brand academic baseline is done. The site is calm, typographically-led, and deployable. The generative design spike is the next phase: create design branches from `gendes-academia`, give each one a mood board and brief, explore distinct visual directions, and evaluate what sticks.

Read `docs/gendes.md` for the full methodology. Read `docs/visual-design.md` for the baseline this work forks from. Create the design branch first, then fill `docs/gendes-brief.md` and `docs/gendes-moodboard/<branch-name>/` before handing that branch to an implementation agent.

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

- Branch active: `gendes-pop-color.codex`
- Mood board active: `docs/gendes-moodboard/pop-colors/`
- Brief active: `docs/gendes-brief.md`
- Implement the Pop Poster Toybox direction — palette, typography, surface treatments, card treatment, homepage sections, larger composition changes, and supporting SFC markup where useful
- Run `corepack pnpm check` — lint, typecheck, editor CSS rebuild; failures are blocking
- Review locally in SSR with `corepack pnpm start:frontend` at `http://my-website.localhost` across the review matrix below

### Pop Color First-Pass Implementation Plan

- Replace the academic neutral palette with a high-contrast pop-print palette: poster cream, deep navy ink, yellow, aqua, coral, pink, cobalt, lime, and orange.
- Export the new palette through the frontend context-role and use it as CSS custom properties in components.
- Adjust type voice: heavier sans headings for poster weight, mono reserved for labels, metadata, and event-poster details.
- Rework broad surface texture toward subtle printed grid/halftone behavior without harming text readability.
- Restyle homepage hero and major sections as poster-like color fields with ticket/label details.
- Restyle case-study cards as large poster slabs and writing cards as smaller printed flyers while preserving all featured-media transition hooks.
- Restyle `SiteNav` as a compact sticker/ticket and `SiteFooter` as a high-contrast poster field.
- Tune writing/case-study detail heroes, slip panels, and article surfaces so the hero is loud but the body remains comfortable.
- Add pop-color accents to key editorial block recipes where useful: quote, pullquote, code, file, details, accordion, buttons, separators, image/gallery frames.
- Keep reduced-motion, focus, contrast, and link affordances visible throughout.

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
