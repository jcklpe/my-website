# Homepage Refinement — To Do

## Background

The homepage is functional and visually coherent enough for the current baseline, but it still carries first-pass structure, placeholder copy, and component-boundary decisions that should be revisited before the generative design spike.

This spike should prepare the homepage to become a strong design-branch foundation. The goal is not to make the homepage visually final. The goal is to make its content model, markup shape, and section composition easier to understand, author, QA, and creatively reshape.

The conceptual framing lives in `docs/homepage.md`.

## Project Organization

Add concrete tasks to `# To Do`. When tasks are implemented, move them either to `# Ready for Human QA` or `# Done`.

Keep the conceptual doc focused on model, philosophy, and boundaries. Keep this to-do doc focused on atomic tasks, files, commands, verification, human QA, and decisions made along the way.

When this spike retires, fold durable lessons into `README.md`, `AGENTS.md`, `docs/design-system.md`, `docs/code-style.md`, `docs/visual-design.md`, or `to-do.md` as appropriate, then move both homepage spike docs to `docs/archive/`.

## General Principles

- Treat the homepage as one art-directed composition, not a generic section system.
- Preserve enough chunking that a section can be understood locally.
- Avoid tiny components that hide cross-section rhythm or create fake reusability.
- Do not couple unrelated pages through generic heading/section components just to avoid repeated markup.
- Prefer route-local markup and styles when the visual idea is homepage-specific.
- Keep shared components only where they protect real complexity or clarify a section.
- Add or change ACF fields only when they map to real editorial needs.
- Use obvious placeholder copy where a section needs to remain visible for design review.
- Keep the homepage compatible with SSR, static generation, and existing prefetch/transition behavior.
- Coordinate with the Side Projects spike, but do not edit Side Projects route files from this spike unless explicitly agreed.

## Current State Overview

- `apps/frontend/pages/index.vue` fetches:
  - homepage ACF content with `getHomeContent()`
  - selected case studies with `getHomeCaseStudies()`
  - recent posts with `getHomePosts()`
- Current route sequence:
  - inline hero region in `apps/frontend/pages/index.vue`
  - `HomeVitalInfo`
  - `HomeSelectedWorkSection`
  - `HomeEmployerTestimonials`
  - `HomeSideProjectsLink`
  - `HomeLatestWritingSection`
- Homepage content is a mix of ACF fields, hardcoded section labels, post/case-study query results, and fallback strings.
- `HomeTopRegion` and `HomeHero` have been flattened into the route because they were one-off composition fragments.
- Selected Work and Latest Writing now use separate homepage-specific components instead of the coupled `HomeContentSection`.
- `HomeEmployerTestimonials` is CMS-backed and stays visible with obvious placeholder content if no real testimonials exist.
- `HomeSideProjectsLink` is a homepage invitation to a route that is currently owned by the Side Projects spike.
- Section anchors `#selected-work` and `#latest-writing` are already part of the navigation model and should be preserved unless deliberately replaced.
- Copy cleanup is complete as a global spike; remaining homepage copy concerns belong here.

## To Do

_(No active implementation tasks.)_

## Ready for Human QA

## Done

- Review `http://my-website.localhost/` or `http://qa.my-website.localhost/`.
- Confirm the hero looks the same or acceptably close after being inlined into `index.vue`.
- Confirm Selected Work still renders case-study cards and preserves the `#selected-work` anchor behavior.
- Confirm Latest Writing still renders post cards, shows the Writing archive link, and keeps hover/focus prefetch behavior.
- Confirm the testimonial section remains visible when CMS testimonials are empty and that fallback testimonials read as obvious placeholders.
- Confirm quick-link fallback labels read as placeholders if CMS quick links are empty.
- Check the homepage on mobile for spacing regressions.
- Human QA passed. The existing Selected Work alignment is acceptable as a baseline; future composition changes belong to a design branch rather than this prep spike.

- Promoted Homepage Refinement from scratch note to active spike docs.
- Captured the main component-boundary principle for this spike: keep the homepage loose and readable for generative design, not over-componentized or artificially DRY.
- Moved `docs/scratch/homepage.md` to `docs/homepage.md`.
- Created `docs/homepage.todo.md`.
- Updated `docs/scratch/gendes.todo.md` so Homepage Refinement points at active docs and copy cleanup is marked complete.
- Updated `to-do.md` so Homepage Refinement is the active project-wide spike.
- Audited the homepage route and components.

  - agreed to flatten `HomeTopRegion`
  - agreed to flatten `HomeHero`
  - agreed to split `HomeContentSection`
  - agreed to keep copy mostly hardcoded/CMS-current until style and tone settle after gendes
  - agreed that testimonials should remain visible with obvious placeholder content
  - agreed that quick-link fallbacks should read as placeholders rather than fake real links
- Flattened `HomeTopRegion` and `HomeHero` into `apps/frontend/pages/index.vue`.
- Deleted `apps/frontend/components/home/HomeTopRegion.vue`.
- Deleted `apps/frontend/components/home/HomeHero.vue`.
- Split `HomeContentSection.vue` into two homepage-specific components:

  - `apps/frontend/components/home/HomeSelectedWorkSection.vue`
  - `apps/frontend/components/home/HomeLatestWritingSection.vue`
- Deleted `apps/frontend/components/home/HomeContentSection.vue`.
- Kept homepage copy mostly hardcoded/CMS-current for now instead of expanding ACF fields before gendes.
- Changed quick-link fallback labels to obvious placeholders (`Important Link 1`, etc.).
- Moved testimonial fallback display into `HomeEmployerTestimonials`.
- Updated fallback testimonials to read as placeholder content.
- Ran `corepack pnpm check`.

  - regenerated the WordPress editor stylesheet
  - passed frontend lint
  - passed Nuxt typecheck
