# Agent Instructions

This is the shared repo contract for AI coding tools working on this project. Read this first, then use `README.md`, `design-system.md`, and `to-do.md` for deeper context before large changes.

Read `code-style.md` before broad refactors or style-shaping work. It captures the project's readability preferences and should guide judgment where automated tooling is silent.

## Project Overview

This repo is a headless WordPress plus Nuxt SSR website.

- Nuxt is the public frontend.
- WordPress is the CMS, admin, and content API.
- Docker Compose is the canonical local infrastructure for WordPress, MariaDB, and Caddy.
- Nuxt runs on the host during development for fast Vite HMR.
- Production is expected to use the same Docker Compose model on a standard VPS, likely Vultr Ubuntu, with production-specific env and compose overrides.
- Design is intentionally art-directed and manual. Engineering should stay boring, reproducible, and readable.

The code should remain approachable to a designer who can read Vue and WordPress theme/plugin code. Prefer explicit markup and clear data flow over clever abstractions.

## Architecture and Stack

- `apps/frontend`: Nuxt 3, Vue 3, SSR, Vite, TypeScript, SCSS.
- `apps/cms`: WordPress runtime source, project plugins, editor theme, and bootstrap scripts.
- `packages/styles`: Sass palettes, context-roles, and shared-component recipes.
- `docker`: Docker Compose and Caddy configuration.

Important local URLs:

- Frontend via Nuxt: `http://127.0.0.1:3001`
- Frontend via Caddy: `http://my-website.localhost`
- CMS via Caddy: `http://cms.my-website.localhost`
- GraphQL endpoint: `http://cms.my-website.localhost/graphql`
- Direct CMS container URL for local SSR/dev requests: `http://127.0.0.1:8080`

## Canonical Workflow

- Node is pinned by `.nvmrc` to Node `22`.
- pnpm is pinned by the root `packageManager` field to `pnpm@10.18.3`.
- Use `corepack pnpm` from the repo root.
- Use Docker Compose for the CMS stack.
- Do not make DDEV the canonical runtime. It may be considered later as a local convenience layer only.
- Do not assume global tooling beyond what the repo documents.
- Do not commit or push unless explicitly asked.
- The user handles GitHub pushes by default.

Common commands:

- `corepack pnpm install`
- `corepack pnpm dev`
- `corepack pnpm docker:up`
- `corepack pnpm docker:down`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm check`
- `corepack pnpm build`
- `corepack pnpm styles:wp-editor`
- `corepack pnpm cms:seed-block-test-content`

Run `corepack pnpm check` after code changes when feasible. It regenerates the WordPress editor stylesheet, then runs lint and typecheck.

## Tooling and Code Style

- ESLint is configured through Nuxt's `@nuxt/eslint` setup in `apps/frontend/eslint.config.mjs`.
- Prettier is configured at the repo root in `prettier.config.mjs`.
- ESLint and Prettier are separate tools here. Do not assume linting also formats.
- `corepack pnpm check` runs editor CSS generation, frontend lint, and frontend typecheck. It does not run Prettier format checking.
- Use `corepack pnpm format` for intentional formatting and `corepack pnpm format:check` when format verification is needed.
- Do not reformat unrelated files as drive-by cleanup.
- Markdown files are intentionally ignored by Prettier. Treat docs and project notes as hand-authored prose so spacing and outline rhythm can follow the author's preference.
- Follow `code-style.md` for authoring preferences: prioritize human legibility, local reasoning, explicit control flow, named intermediate values, and boring solutions that satisfy the requirement.
- Avoid early abstraction. Extract helpers or shared components only after repeated real use or when the current file is becoming harder to understand.
- Prefer guard clauses and named helpers over dense nested conditionals, long chained transformations, or clever boolean compression.
- Vue work should favor Composition API, explicit props, readable computed values, and SFC templates that reveal the page/component structure.
- SCSS should favor local component styles and simple semantic class composition. Avoid noisy naming or brittle selector chains when scoped component structure already provides clarity.
- Authored Vue component classes should generally use scoped semantic role/state names such as `hero`, `title`, `meta`, `content`, `is-hidden`, or `is-transition-hidden`, not BEM-style fused internals.
- Do not rename WordPress/Gutenberg-provided classes such as `wp-block-cover__media`; those external conventions are intentionally preserved.

## Content Model and CMS Rules

- Regular WordPress posts are writing/blog posts.
- `case_study` is the evergreen case-study content type.
- Pages remain available for one-off content such as Home and future standalone pages.
- The Home page uses ACF fields for structured homepage content. Its Gutenberg body editor is intentionally hidden.
- Footer content is managed through an ACF-backed Site Settings options page.
- ACF Pro is allowed for structured metadata, but use it sparingly. Prefer Gutenberg body content for article-like content.
- WordPress is not a page builder for the public frontend. It is a CMS/editor/API.
- Stable editorial terms matter. Do not rename content types or sections casually.

Custom block rules:

- Project-owned custom Gutenberg blocks should live in a plugin, not the editor theme.
- Add custom blocks only where core Gutenberg blocks are insufficient.
- Prefer explicit `block.json` metadata and a small intentional block set.
- If a custom block build pipeline is added, keep it simple and Vite-oriented; do not switch the project to a broad webpack/wp-scripts architecture without a deliberate decision.

Gutenberg rendering rule:

- Do not render an entire post body as one giant raw HTML blob.
- Query structured block data through WPGraphQL/WPGraphQL Content Blocks.
- Map each supported Gutenberg block to a Vue component in `apps/frontend/components/content/blocks`.
- Unknown blocks should fail at the block level through `UnsupportedBlock.vue`, not break the page.
- Sanitized per-block fallback HTML is acceptable where needed, but avoid turning that into the primary rendering model.
- Code blocks use Shiki through `apps/frontend/utils/syntax-highlighting.ts`. Add custom language/theme support there deliberately, preferably using TextMate grammar/theme inputs rather than one-off regex tokenizers.

Frontend component folders are organized by visitor-facing role:

- `apps/frontend/components/content`: authored content rendering, including `BlockRenderer.vue`, `UnsupportedBlock.vue`, `FeaturedMediaFrame.vue`, and Gutenberg block components under `content/blocks`.
- `apps/frontend/components/navigation`: site wayfinding and browsing surfaces, including the nav, footer, cards, and content lists.
- `apps/frontend/components/transitions`: route/page transition presentation components.
- `apps/frontend/components/home`: homepage-specific assembled sections.

## Styling and Design-System Rules

Read `design-system.md` before changing shared styles.

Use this project vocabulary:

- palette
- context-role
- shared-components

Avoid introducing conflicting terms where the repo already has language.

Style strategy:

- Keep component-specific styles local to Vue SFCs unless sharing is genuinely useful.
- Prefer scoped semantic role/state classes in authored Vue components. Existing BEM-shaped class names should usually indicate external WordPress/Gutenberg markup, not a new house style to copy.
- Prefer CSS custom properties as the component-facing API for palette values.
- Sass variables remain useful for source palette values, mixins, functions, and compile-time helper recipes.
- `packages/styles/context-role/_vue-frontend.scss` emits frontend global CSS.
- `packages/styles/context-role/_vue-frontend-component.scss` is injected into Vue SFC styles by Nuxt Sass `additionalData`; it must stay non-emitting.
- `packages/styles/context-role/_wp-editor.scss` emits the WordPress editor stylesheet source.
- `packages/styles/_wordpress-blocks-baseline.scss` owns baseline rhythm, alignment, and default handling for rendered Gutenberg block markup.
- `packages/styles/shared-components/_code-block.scss` owns the reusable retroterm code-block visual recipe.
- Keep WordPress image alignment/breakout rules in the block baseline unless a non-WordPress component also needs the same recipe.
- Do not force full editor/frontend visual parity. Share only what improves editing clarity.
- Do not edit generated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` directly.
- If changing editor-relevant styles, run `corepack pnpm styles:wp-editor` or `corepack pnpm check`.
- `editor.css` is generated but versioned because WordPress loads CSS assets directly.

## Route Transition and Motion Rules

The current card-to-detail transition system is custom. It is not Nuxt page transitions and not the browser View Transitions API.

Key files:

- `apps/frontend/composables/useFeaturedMediaTransition.ts`
- `apps/frontend/components/transitions/FeaturedMediaTransitionLayer.vue`
- `apps/frontend/components/content/FeaturedMediaFrame.vue`
- `apps/frontend/components/navigation/cards/CaseStudyCard.vue`
- `apps/frontend/components/navigation/cards/PostCard.vue`

Rules:

- Keep route motion timing in `packages/styles/_motion-palette.scss`.
- Export motion values as CSS custom properties through the frontend context-role.
- If JavaScript must coordinate with CSS timing, read the CSS custom property instead of duplicating a magic number.
- Preserve reduced-motion behavior.
- Keep the nav chrome stable during featured-media transitions unless there is a deliberate redesign.
- Avoid layering fixes that create duplicate semi-transparent media, scroll flashes, or post-transition jumps.
- When adding new transitions, favor explicit source/target elements and inspect the actual rendered geometry.

## Repository Guardrails

- Keep credentials, real `.env` files, private plugin zips, and uploads out of Git.
- `docker/.env.example` is committed; `docker/.env` is not.
- `docker/private-plugins/` is ignored and may contain `advanced-custom-fields-pro.zip`.
- `apps/cms/wp-content/uploads/` is ignored. Treat uploads as media/data migration concerns, not source deploys.
- `temp-ref-assets/` and `temp-reference-assets/` are ignored reference material.
- Preserve pinned CMS/plugin versions unless intentionally updating them.
- Do not reintroduce Akismet or unused default themes unless there is a clear reason.
- Do not replace the Docker Compose model with another canonical runtime.
- Keep local and production deployment assumptions aligned around Docker Compose plus env-specific overrides.
- Do not import old reference-project React/Frontity architecture. Reference projects are visual/style research only.

## How To Make Changes Safely

- Check `git status` before editing so user work is not overwritten.
- Prefer small, readable components over generalized factories.
- Keep page SFCs legible: a designer should be able to understand the major structure from the template.
- Make abstractions only after repeated real use, not in anticipation.
- For frontend work, verify behavior in both SSR and client navigation paths when relevant.
- For CMS work, consider bootstrap reproducibility and production portability.
- For style work, decide whether the value belongs locally, in a palette, in a context-role, or in shared-components.
- For block work, update the block registry and add a focused Vue block component.
- For block rendering regressions, run `corepack pnpm cms:seed-block-test-content` and check the generated writing/case-study QA routes. The fixture is broad enough to cover common text, media, layout, embed, interactive, and utility block families, but it is not intended to exhaust every Gutenberg permutation.

## Documentation and Handoff

- Update `README.md` when commands, architecture, URLs, install steps, or generated assets change.
- Update `design-system.md` when style-system terminology or shared-style strategy changes.
- Update `to-do.md` when project status or roadmap changes, but preserve user notes.
- In handoff summaries, mention files changed, checks run, and any known mismatch between docs and code.
- If docs and code disagree, trust the current code after inspecting it, then update docs or call out the mismatch.
