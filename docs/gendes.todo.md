# Generative Design — To Do

## Background

The non-brand academic baseline is done. The site is calm, typographically-led, and deployable. The generative design spike is the next phase: create design branches from `gendes-academia`, give each one a mood board and brief, explore distinct visual directions, and evaluate what sticks.

Read `docs/scratch/gendes.md` for the full methodology. Read `docs/visual-design.md` for the baseline this work forks from. Create the design branch first, then fill `docs/scratch/gendes-brief.md` and `docs/gendes-moodboard/<branch-name>/` before handing that branch to an implementation agent.

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
- WCAG + SEO baseline: complete; pass-1 spike archived at `docs/archive/wcag-seo1.md` and `docs/archive/wcag-seo1.todo.md`; durable rules in `AGENTS.md` Accessibility and SEO Contract section
- Block coverage: all common block families covered at a first-pass visual quality
- **First design branch**: `gendes-systems-atlas` created; brief at `docs/gendes-brief.md`; moodboard at `docs/gendes-moodboard/gendes-systems-atlas/`

---

## To Do

### Hard Preparation

- [x] Confirm the baseline branch runs locally in SSR without major rendering errors
- [x] Confirm the static generation path still works after the current baseline, even if design branches are reviewed mainly in SSR
- [x] Confirm mood-board media is kept local/ignored and organized by design branch under `docs/gendes-moodboard/<branch-name>/`
- [x] Complete the practical WCAG + SEO baseline pass enough that design branches inherit clear accessibility and metadata expectations

### Design Branch Workflow Setup

- [x] Confirm the branch naming convention: `gendes-<direction>` branched from `gendes-academia`
- Use ordinary branch switching in this repo as the default comparison workflow
- Optionally document a `git worktree` workflow later if comparing multiple branches in separate folders becomes more comfortable
- Keep each design branch scoped to visual direction work so the winning branch can be merged back deliberately
- Merge the winning design branch back into the main working line after review and hand-tweaking, rather than manually copying the result file-by-file

### gendes-systems-atlas: Preparation

- [x] Create branch: `git checkout -b gendes-systems-atlas` from `gendes-academia`
- [x] Write design brief in `docs/gendes-brief.md` — Civic Systems Atlas / Personal Research Terminal
- [x] Assemble moodboard in `docs/gendes-moodboard/gendes-systems-atlas/`
- Prime example: Signal Garden — bento/panel dashboard, cobalt accent on warm paper, all-caps mono labels, record card treatment, network diagram, 1px borders

### gendes-systems-atlas: Implementation Phases

Work through these phases in order. Each phase should be independently reviewable. Run `corepack pnpm check` at the end of each phase before moving forward.

**Phase 1 — Palette and token foundation**
- Replace `packages/styles/_color-palette.scss` with the paper/ink/blueprint system from the brief
- Token names: `--color-paper`, `--color-paper-soft`, `--color-ink`, `--color-ink-muted`, `--color-grid`, `--color-blueprint`, `--color-blueprint-dark`, `--color-blueprint-soft`, `--color-panel`, `--color-panel-muted`, `--color-line`, `--color-line-strong`; secondary accents (sage, acid, warning, dust-pink) added but used sparingly
- Update CSS custom property exports in `packages/styles/context-role/_vue-frontend.scss`
- Verify global surface/body background, text color, and link color shift correctly

**Phase 2 — Typography deployment**
- IBM Plex Mono Italic remains for headings
- Add IBM Plex Mono (non-italic, regular/medium) as the explicit label/metadata/UI-language face
- Apply to: nav labels, section header text, card metadata, captions, tags, section markers, and any tabular/index UI
- Body prose stays IBM Plex Sans — do not apply mono to long reading text
- Update caption mixin in `_type-palette.scss` if needed; update label typography in SFC scoped styles where the component currently lacks a distinct label treatment

**Phase 3 — Global structure and shell**
- SiteNav: blueprint-blue active/focus states, thin 1px bottom rule, compact mono label language
- SiteFooter: paper surface, ink text, index-table or two-column structure; feels like a site-map panel rather than a decorative footer
- Page/body base: warm paper ground (`--color-paper`), no glow or radial background effects
- Run `corepack pnpm check`

**Phase 4 — Card treatment (record card)**
- PostCard and CaseStudyCard: add a metadata strip (year, category/domain) below the image
- 1px border treatment; border shifts to `--color-blueprint` on hover/focus
- Keep existing featured-media transition hooks (`data-featured-*`, `clip-path`) intact — they are not visual choices
- Cards should feel like filed artifacts: title bar or category label, image as a framed figure, metadata below
- Run `corepack pnpm check`

**Phase 5 — Article and detail surfaces**
- Writing detail: figure captions with `FigureCaption` treatment; section marker labels at major headings
- Case study detail: minimal record header — one-sentence framing of what the work was and what changed, plus one or two impact metrics where real numbers exist. Not a resume header (no role/org/year/methods). Hardcode values for first-pass visual QA.
- Side metadata rail at desktop widths: if case study metadata is surfaced, a narrow aside column at desktop is worth attempting; preserve `.content-flow` grid semantics
- Run `corepack pnpm check`

**Phase 6 — Homepage composition**
- Hero panel: subtle grid/coordinate background, positioning statement at poster scale, blueprint accent on key label or line element; section feels like the entry to the atlas
- Section markers / section codes as visual anchors across homepage sections (e.g. `01 — SELECTED WORK`)
- Selected Work: record card grid with metadata strip; consider title-bar panel wrapper for the section
- Latest Writing: studio-feed style row list (date, title, arrow link) rather than or alongside card grid
- Layout philosophy: blend bento non-linearity with linear scroll flow — not a fixed dashboard, not just stacked sections. Experiment with interspersed bento/panel compositions that break up linearity without abandoning it. Where bento works, use it purposefully. Where it doesn't, linear is fine.
- Do not use aesthetic-only fake data (no progress bars, percentage gauges, or metrics that don’t represent real content). Structural ornament only: grids, labels, rules, metadata, panels.
- Map of practice: **deferred to future work** (see below)
- Run `corepack pnpm check`

**Phase 7 — Block and editorial polish**
- Quote/pullquote: blueprint rule accent, feels like a cited field note
- Callout panels: `SystemPanel`-style wrapper with a compact title strip
- Code blocks: paper/ink surface, mono stays; ensure Hopscotch theme still works coherently on paper ground
- Separator: thin 1px rule with optional measurement-tick marks
- Final block recipe review for visual coherence with the atlas system

### Future Work (post first-pass review)

- Homepage map of practice: a minimal static node/connection diagram (SVG or CSS) connecting Work / Writing / Systems / Code / Art — deferred because it’s the most structurally novel element and should not block earlier review
- Case study record header CMS wiring: if the record header visual lands well in first-pass review, wire up real ACF fields for the framing statement and impact metrics rather than hardcoded values

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
