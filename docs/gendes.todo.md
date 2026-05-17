# Generative Design — To Do

## Background

The non-brand academic baseline is done. The site is calm, typographically-led, and deployable. The generative design spike is the next phase: create design branches from `gendes-academia`, give each one a mood board and brief, explore distinct visual directions, and evaluate what sticks.

Read `docs/gendes.md` for the full methodology. Read `docs/visual-design.md` for the baseline this work forks from. The active first design direction is `gendes-blue1`, driven by `docs/gendes-brief.md` and the local mood-board folder at `docs/gendes-moodboard/gendes-blue1/`.

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
- First design branch inputs: `docs/gendes-brief.md` is filled for `gendes-blue1`; the mood board has been analyzed image-by-image
- `gendes-blue1` foundation: blue systems palette tokens, signal/status colors, hard panel shadows, border primitives, and paper/blueprint/terminal texture tokens have been added and exported to frontend/editor CSS contexts
- `gendes-blue1` homepage composition pass: hero, vital info, Selected Work, testimonials, Side Projects, and Latest Writing have first-pass Signal Garden surfaces applied and human-QAed
- `gendes-blue1` card/nav/footer pass: case-study cards, post cards, contextual nav, footer, and case-study loop nav have first-pass system-window styling applied and human-QAed
- `gendes-blue1` article/block surface pass: shared-component recipes for figures, galleries, quotes, code, tables, embeds, media-text, details, accordion, files, separators, and columns now carry the blue systems surface language and have been human-QAed
- `gendes-blue1` motion/interaction pass: global focus rings, rich links, buttons, load-more controls, details/accordion toggles, file links, footer links, nav links, and reduced-motion handling have first-pass blue activation behavior and have been human-QAed
- `gendes-blue1` accessibility/usability pass: contrast spot checks, keyboard focus containment, full-card link focus states, and reduced-motion guards have been tightened; ready for human visual QA

---

## To Do

### Hard Preparation Before Implementation

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

### `gendes-blue1` Input Lock

- Confirm the active branch is `gendes-blue1` and that it forks from the `gendes-academia` baseline
- Keep `docs/gendes-brief.md` as the implementation brief for this branch
- Keep `docs/gendes-moodboard/gendes-blue1/` as the branch-specific mood-board folder
- Do not replace the brief with generic prompt language once implementation begins; use it as the creative contract

### `gendes-blue1` Implementation Tracks

These tracks are the concrete work needed to translate the `Signal Garden / Blue Systems Atlas` brief into the site. They can be done in slices, but the branch should not be called a candidate until the visual language reaches homepage, cards, article/detail pages, and core block recipes.

#### 1. Apply and Tune the Blue Systems Token World

- Use the new blue systems tokens throughout the homepage, cards, article surfaces, nav, and footer
- Tune the palette further if actual component usage shows a contrast, balance, or tone problem
- Preserve accessible contrast for body text, links, controls, captions, and focus states
- Avoid making the branch a one-note blue skin; the blue should behave like annotation, selection, and signal
- Use exported CSS custom properties instead of scattering one-off colors in SFC styles

#### 2. Apply Surface, Texture, and Panel Primitives

- Use the new paper-grid, blueprint-field, terminal-scanline, hard-shadow, signal-border, and window-border primitives where they support the brief
- Turn repeated surfaces into low-radius panels, title-bar frames, status strips, corner handles, figure labels, and hard outlined windows
- Add additional texture/noise only where it does not harm readability
- Avoid fake controls that look clickable unless they are actually interactive
- Keep `.content-flow` structural behavior intact while restyling the surfaces inside it

#### 3. Tune Typography for Signal and Reading

- Keep the main body face readable and calm
- Explore a stronger display voice for homepage and section headings: pixel/mono display, heavy grotesque, condensed poster type, or restrained contrast/italic accents
- Add compact label typography for metadata, title bars, section markers, coordinates, dates, and status text
- Keep article body rhythm legible and editorial
- Avoid making body copy tiny, all-caps, faux-terminal, or overly decorative

#### 4. Recompose the Homepage as a Systems Atlas

- Tune the first-pass homepage composition after human visual QA
- Ensure the hero reads as a large signal-board or research-desktop composition rather than a standard landing hero
- Ensure Selected Work has the strongest artifact treatment and still preserves featured-media transitions
- Ensure Latest Writing has a distinct archive/feed/list identity without losing card readability
- Ensure Side Projects has a secondary but intentional lab-terminal role
- Preserve clear content hierarchy and links; decorative diagram elements should support, not hide, the browsing surface

#### 5. Rework Cards, Navigation, and Footer

- Restyle Case Study and Post cards as windows, specimen plates, log entries, or file/index cards rather than generic cards
- Preserve featured-media transition hooks, `data-featured-*` attributes, and route motion expectations
- Make hover/focus states feel like blue activation, selection, status, or annotation
- Keep contextual nav simple and useful; do not introduce a heavy global nav framework
- Recast the footer as a readable site map, terminal index, or system panel without burying links

#### 6. Carry the Language Into Article and Block Surfaces

- Rework shared-component recipes so common blocks feel like part of the same blue systems atlas
- Prioritize image/caption, gallery, quote, pullquote, code, table, embed, media-text, details, accordion, file, separator, and columns recipes
- Use scientific plate rhythm for figures and captions: numbered media, caption strips, blue rules, or coordinate-like labels where appropriate
- Keep prose blocks calm and readable; not every paragraph needs a panel
- Preserve frontend/editor recipe ownership patterns established during the style refactor

#### 7. Motion and Interaction Pass

- Keep the featured-media transition mechanism intact
- Tune hover/touch behavior around blue outlines, title-bar activation, status dots, progress strips, or annotation lines
- Consider subtle scanline, panel-entry, data-fill, or map-line motion only where lightweight
- Preserve reduced-motion behavior and ensure content does not depend on animation

#### 8. Accessibility and Usability Pass

- Review contrast for electric blue, pale grounds, terminal panels, captions, and small labels
- Verify keyboard focus is visible on pale and dark surfaces
- Ensure fake UI details are decorative or clearly noninteractive
- Ensure links are still recognizable without relying only on color
- Confirm mobile layouts simplify dense diagrams into a readable sequence

#### 9. Verification and Review Prep

- Run `corepack pnpm check`; failures are blocking
- Review SSR locally with `corepack pnpm start:frontend` at `http://my-website.localhost`
- Review the full matrix below on desktop and mobile widths
- Run a static generation smoke test before a winning branch is merged
- Move the implemented branch to Ready for Human Visual QA when it is stable enough for design review

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

### `gendes-blue1` Human QA Checklist

Move this checklist here once implementation is complete and the branch is ready for human review.

- Accessibility and usability slice:
  - Keyboard: tab through Home, Writing archive, article QA fixture, case-study QA fixture, About, and Side Projects; full-card links, footer links, nav links, buttons, details, and accordions should retain visible focus rings
  - Contrast: small labels using signal blue, muted text, terminal green, warning red, captions, and footer/source links should remain readable against their backgrounds
  - Full-card links: Post cards, Case Study cards, CaseStudyLoopNav links, and the Side Projects band should show focus inside clipped/overflowing surfaces
  - Reduced motion: shared button hover transforms, card focus transforms, loop-nav media transforms, side-project CTA motion, and load-more motion should stop while color/border affordances remain
  - Mobile density: hero decorative diagrams, testimonial cards, footer link panels, galleries, tables, captions, media-text, details, and accordions should stack without crowding text
  - Fake UI chrome: decorative labels/status strips should read as labels, not controls

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
- `gendes-blue1` mood-board images examined and summarized into `docs/gendes-brief.md`
- `gendes-blue1` foundation slice complete: `packages/styles/_color-palette.scss`, `packages/styles/_effect-palette.scss`, `packages/styles/context-role/_vue-frontend.scss`, and `packages/styles/context-role/_wp-editor.scss` now expose the initial blue systems token/effect world; `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` regenerated
- `gendes-blue1` homepage composition slice complete and human-QAed: homepage hero/top composition now lives in `apps/frontend/pages/index.vue`, and homepage-only sections use the Signal Garden panel/terminal/archive treatments
- `gendes-blue1` card/nav/footer slice complete and human-QAed: case-study cards, post cards, contextual nav, footer, and case-study loop nav use the system-window/link-panel treatment while preserving transition hooks
- `gendes-blue1` article/block surface slice complete and human-QAed: shared-component recipes now carry the blue systems surface language through core authored blocks while preserving recipe ownership and editor CSS generation
- `gendes-blue1` motion/interaction slice complete and human-QAed: global focus rings, rich links, buttons, load-more controls, details/accordion toggles, file links, footer links, nav links, and reduced-motion handling use the blue activation language
