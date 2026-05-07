# Design System Notes
This document captures the working vocabulary for this project. It is not meant to be a universal design-system manifesto. It is the shared language we are using for this website so design decisions stay legible across Nuxt, WordPress, and future contexts like commerce.

The current practical rule is: palettes are Sass source fields, context-roles decide what becomes CSS custom properties, and component styles normally consume those exported values with `var(...)`. Font loading is handled by a small emitting type-fonts partial that only context-roles import.

## Core Terms
### Token
A token is any discrete, nameable design value.

In this project, "token" does not only mean "globally available variable." A token can be a Sass variable, a one-off component value, a value inside a component spec, or a value that appears only once but can still be discussed unambiguously.

Examples:
- A type size used by a homepage hero
- A specific electric blue
- A card media aspect ratio
- A button padding value
- A shadow used by cards
- A transition timing curve

Tokens can live at several layers:
- Primitive tokens are raw values, like a specific color or spacing value.
- Semantic tokens describe intent, like an action color or muted text color.
- Component tokens describe one property inside a component spec.

Not every conceptual token needs to become a global Sass variable. We should extract values into shared variables only when doing so makes the system clearer or prevents real duplication.

Palette values are authored as Sass source values, then exported as CSS custom properties by each context-role. Sass remains useful for source values, mixins, functions, and compile-time helper recipes, but component styles should usually read exported palette values through `var(...)`.

### Palette
A palette is a collection of related tokens.

A palette does not have to be semantic. It can be scalar, like a range of type sizes, spacing steps, or red values from light to dark. A palette can also be semantic, like text colors, action colors, or surface colors.

Palettes are useful because they establish a field of valid choices without requiring every value to become a universal rule.

Palette files do not emit CSS by themselves. Context-role styles decide which palette values become CSS custom properties for that context. The font resource request lives in `_type-fonts.scss`, an intentionally emitting support partial imported by emitting context-role files, not by the palette or Vue SFC Sass API. Paragraph, list, and heading selector styling belongs to shared-component recipes, not to the palette file itself.

Current palette files live in `packages/styles`:

- `_color-palette.scss`
- `_type-palette.scss`
- `_spatial-palette.scss`
- `_motion-palette.scss`
- `_effect-palette.scss`

The spatial palette owns spatial arrangement values broadly, not just gap sizes. It includes the `--space-*` spacing scale, article column measures, breakout widths, float widths and offsets, and media height caps. The Sass variable `$breakout-wide-width` is the canonical token for wide-breakout geometry; use it in shared-component recipes and context-roles rather than hardcoding a breakout width. This keeps geometry decisions in the palette layer rather than scattering them through WordPress block normalization or individual components.

The motion palette currently owns route-transition timing values such as `--motion-route-transition-duration` and `--motion-route-content-delay`. CSS consumes those values directly for animation/transition timing. JavaScript reads the exported CSS custom property when it needs to coordinate behavior with CSS, such as clearing the featured-media transition overlay after the visual transition completes.

### Component Spec
A component spec is the collection of tokens that defines a component.

For example, a card spec may include background, border, shadow, heading type, excerpt type, media ratio, spacing, and hover motion. Some of those values may come from palettes. Some may be local to that component.

Vue single-file components should generally keep their component-specific styling local, but they may consume shared palette values or shared component specs when that improves consistency.

Authored Vue component classes should favor scoped semantic role/state names over BEM-style fused internals. In practice, that means names like `hero`, `title`, `meta`, `content`, `link`, `image`, `is-hidden`, and `is-transition-hidden` are preferred inside scoped SFC styles when the component context already makes their meaning clear.

WordPress and Gutenberg classes are different. Class names such as `wp-block-cover__media` are external conventions and should not be renamed just to match this project's authored Vue style.

Frontend component folders are organized around visitor-facing roles rather than atomic-design taxonomy:

- `content` renders authored content, including the block renderer, unsupported-block fallback, featured media, section headings, and Gutenberg block components under `content/blocks`.
- `navigation` contains wayfinding and browsing surfaces, including the site nav, footer, cards, and content lists.
- `transitions` contains route/page transition presentation components.
- `home` contains homepage-specific assembled sections.

### Shared Component
A shared component style is a reusable component-level recipe that can be consumed in more than one context-role.

This is the term we prefer over "primitive." In frontend engineering, "primitive" often means a low-level reusable building block, like a base `Button`, `Text`, or `Stack`. That term is common in component-system work, but it can conflict with this project's design-token vocabulary, where "primitive" may refer to a raw token layer.

For this project, use `shared-components` for reusable cross-context component styling.

Current shared component styles live in:

- `packages/styles/shared-components/_button.scss`
- `packages/styles/shared-components/_paragraph-block.scss`
- `packages/styles/shared-components/_list-block.scss`
- `packages/styles/shared-components/_heading-block.scss`
- `packages/styles/shared-components/_button-group.scss`
- `packages/styles/shared-components/_code-block.scss`
- `packages/styles/shared-components/_image-block.scss`
- `packages/styles/shared-components/_separator-block.scss`
- `packages/styles/shared-components/_table-block.scss`
- `packages/styles/shared-components/_file-block.scss`
- `packages/styles/shared-components/_gallery-block.scss`
- `packages/styles/shared-components/_embed-block.scss`
- `packages/styles/shared-components/_columns-block.scss`
- `packages/styles/shared-components/_media-text-block.scss`
- `packages/styles/shared-components/_link.scss`
- `packages/styles/shared-components/_quote-block.scss`
- `packages/styles/shared-components/_pullquote.scss`
- `packages/styles/shared-components/_details-block.scss`
- `packages/styles/shared-components/_accordion-block.scss`
- `packages/styles/shared-components/_group-block.scss`

These files should expose mixins or reusable component specs. They should not assume they are always being rendered on the frontend. Paragraph, list, heading, image, quote, pullquote, details, accordion, button, and code recipes are intentionally concrete component recipes, not generic layout machines. Shared-component recipe files are the single source of truth for a block's complete styling — shell, frame, child roles, modifier states, and content-flow width/alignment declarations via inline `width-alignment()` calls. SFCs include recipe mixins and get the complete block treatment together. Context-roles adapt recipes to their own DOM targets where useful, but frontend block content-flow behavior is defined in the recipe and applied from the Vue component, not from a central context-role selector registry.

Frontend-only interactive blocks may keep their complete styling in the owning Vue SFC when there is no editor/shared consumer. `MegaGalleryBlock.vue` is the current example: its Masonry/PhotoSwipe behavior and shell alignment are local to that component rather than split into a shared recipe file.

Code block chrome lives in `packages/styles/shared-components/_code-block.scss` because it is a reusable component recipe that can be consumed by both frontend and WordPress editor context-roles. Syntax tokenization is handled by Shiki in `apps/frontend/utils/syntax-highlighting.ts`; the active syntax theme is the custom Hopscotch-inspired theme in `apps/frontend/utils/hopscotch-theme.ts`. If syntax themes become richer or need multiple modes, extract theme values into a dedicated palette only after that real need appears.

### Context Role
A context-role is a place where the design system is applied.

Examples:

- Nuxt frontend website
- WordPress block editor
- WordPress admin settings screens
- Future WooCommerce/shop frontend

The term "context-role" is preferred over "surface" for this project.

Different context-roles may consume the same palettes or shared component specs while still having different goals. For example, the WordPress editor does not need to visually match the frontend, but a button block may still share button styling rules so editing content feels coherent.

The current Vue frontend context-role entry is:

- `packages/styles/context-role/_vue-frontend.scss`

Nuxt imports that file through `apps/frontend/assets/scss/main.scss`.

The current Vue SFC authoring API is:

- `packages/styles/context-role/_vue-frontend-component.scss`

Nuxt injects that file into component style blocks through Sass `additionalData`, so it must remain Sass-only and non-emitting.

The current WordPress editor context-role source is:

- `packages/styles/context-role/_wp-editor.scss`

It exports a smaller editor-specific variable set. Compile it with `corepack pnpm styles:wp-editor`, which writes `apps/cms/wp-content/themes/my-website-editor-theme/editor.css`. The editor theme loads that generated CSS with `add_editor_style()`. Even though `editor.css` is generated, it should be committed so WordPress has a ready-to-load stylesheet without requiring Sass compilation at runtime.

## Current SCSS Strategy
`packages/styles/context-role/_vue-frontend-component.scss` is the Sass-only API for Vue SFC styles. Nuxt injects it into every component style block, so it must not emit global CSS selectors. It should expose mixins and functions, not context-role CSS variables.

Vue SFCs should generally consume palette values with CSS custom properties, for example `var(--space-5)`, `var(--article-wide)`, `var(--color-ink)`, or `var(--motion-snappy)`. Sass variables remain available for cases that genuinely need Sass behavior, and shared component mixins remain available for reusable declaration recipes.

`packages/styles/_type-fonts.scss` owns the external font resource request and should only be imported by emitting context-role files such as `_vue-frontend.scss` and `_wp-editor.scss`.

`packages/styles/_type-palette.scss` defines font-family source values, reusable type scale values, named type tokens, and the `editorial-caption` mixin for caption typography. It must stay non-emitting so shared-component recipes can safely consume it from Vue scoped styles. It should not assemble paragraph, list, or heading selectors. Those are block/component recipes: `_paragraph-block.scss`, `_list-block.scss`, and `_heading-block.scss` apply type values alongside width alignment, float-breakout behavior, rhythm, and local state/modifier rules. One-off heading-level declarations such as an h2-only font size or letter spacing can live inline in the heading recipe rather than becoming exported palette values. The goal is still co-location of a semantic element's complete styling in one place, but that place is the shared-component recipe rather than the palette.

`packages/styles/context-role/_vue-frontend.scss` is the Nuxt frontend CSS output. It imports palettes, exports the frontend CSS custom property set, imports type rules and base rules, then emits the global CSS that is not safely owned by a Vue component: page/base rules, the `.content-flow` grid shell, native fallback element hooks, and wrapper-only structural behavior. `float-breakout-lead($side)`, also defined in `_vue-frontend.scss`, is the mixin that applies float-breakout wrapper behavior for a given float side; shared-component recipes call it rather than duplicating the float geometry inline.

`apps/frontend/assets/scss/main.scss` should stay boring. Its job is to load the frontend context-role.

Vue SFCs can use shared component mixins and compile-time helpers through the Nuxt Sass `additionalData` configuration, which imports `packages/styles/context-role/_vue-frontend-component.scss` into component style blocks. This is primarily for mixins/functions, not for routine value consumption.

The WordPress editor context-role is `packages/styles/context-role/_wp-editor.scss`. It is compiled manually into the editor theme with `corepack pnpm styles:wp-editor`; later we can decide whether that should become part of a broader build/bootstrap step. The compiled output is `apps/cms/wp-content/themes/my-website-editor-theme/editor.css`, and it remains versioned as a generated theme asset.

## Editorial Content Rendering
Gutenberg body content is adapted through focused Vue block components in `apps/frontend/components/content/blocks`, with shared block recipes living under `packages/styles/shared-components`. Vue SFCs import shared recipe mixins through the non-emitting frontend component Sass API; the editor context-role adapts shared recipes to Gutenberg's editor DOM where useful.

The frontend context-role is the home for frontend shell/global mechanics that do not have a closer owner. `packages/styles/context-role/_vue-frontend.scss` owns the `.content-flow` grid tracks/container, global token exports, float-breakout wrapper grouping, and narrow fallback handling for direct bare elements that do not have a recipe or SFC home. Route/page-shell transitions belong in the layout or component that renders the affected shell element. Native editorial block styling for paragraphs, lists, and headings belongs in their shared-component recipes and is applied by the Vue SFCs to semantic roots. Ordinary article rhythm should come from the blocks and semantic elements composing normally, not from a broad adjacency matrix.

Concrete Gutenberg-adjacent block recipes like image, quote, pullquote, details, accordion, table, gallery, file, and code should live in `packages/styles/shared-components`. For classed frontend block components, those recipes should also own the content-flow width/alignment declarations that the Vue SFC applies locally as part of the same recipe mixins. The editor has its own Gutenberg-specific layout adapters in `_wp-editor.scss` because the CMS DOM, wrapper structure, and alignment controls differ from the frontend Vue block DOM.

The goal is not to recreate WordPress frontend theme rendering one-to-one. The goal is to preserve WordPress/Gutenberg semantics while letting the Nuxt frontend own the public visual system.

Some blocks still render their WordPress-provided inner markup through their own block component. That is acceptable for blocks where WordPress markup carries useful semantics, such as media, embeds, files, tables, and buttons. It should not become a single giant post-level HTML dump.

Code blocks are special-cased through `apps/frontend/components/content/blocks/CodeBlock.vue` and `apps/frontend/utils/syntax-highlighting.ts`. The syntax highlighter uses Shiki so project-specific languages and VS Code/TextMate-style themes can be added later without changing the Gutenberg block-rendering contract.

Representative block QA content can be regenerated with `corepack pnpm cms:seed-block-test-content`. The fixture creates one post and one case study with common Gutenberg blocks, including heading hierarchy, nested lists, quotes, pullquotes, image alignment combinations, gallery, media/text, columns, groups, embeds, tables, code, details, accordion, file, audio, video, spacer, separator, and button variants.

Cover and verse blocks are intentionally not part of the current first-class frontend block surface. Do not re-add their renderer components or shared recipes without a deliberate product/design decision.

The fixture is meant to catch likely rendering regressions, not to exhaust every possible Gutenberg layout permutation. Add to it when a real authored-content pattern appears or when a supported block gains new behavior worth testing.

## Route Motion
The current card-to-detail transition is a custom featured-media transition system, not Nuxt page transitions and not the browser View Transitions API.

The transition coordinator lives in `apps/frontend/composables/useFeaturedMediaTransition.ts`. It intercepts supported card clicks, measures the source card media/title/metadata, navigates, suppresses premature router scroll jumps, measures the destination detail media/title/metadata, and lets a temporary overlay animate between those measured states.

The overlay component is `apps/frontend/components/transitions/FeaturedMediaTransitionLayer.vue`. It renders the moving media, title label, and optional metadata label above page content but below the global nav chrome.

Motion timing should be authored in `_motion-palette.scss`, exported by the frontend context-role, and consumed as CSS custom properties. If JavaScript must coordinate with CSS timing, it should read the relevant CSS variable rather than keeping an unrelated magic number.

Current route-motion variables:

- `--motion-route-transition-duration`
- `--motion-route-content-delay`

The global nav participates as stable chrome rather than as a measured morphing element. During a featured-media transition, the nav locks visible and remains above the overlay. This keeps the navigation feeling shared without coupling it to the media/title geometry.

## Guardrails
- Avoid turning every design value into a global variable by default.
- Use palette files for related fields of values.
- Prefer CSS custom properties as the normal component-facing API for palette values.
- Prefer scoped semantic classes for authored Vue components; preserve external WordPress/Gutenberg classes exactly.
- Keep Sass palette files non-emitting. Put intentional global emissions such as external font requests in explicit context-role support partials.
- Keep Sass for source values, compile-time helpers, and reusable declaration recipes.
- Use shared component specs only when a component style genuinely needs to cross context-roles.
- Keep page and component styles close to the Vue component unless there is a clear reason to share them.
- Prefer readable naming over abstract design-system jargon.
- Keep the WordPress editor useful for editing first; only share frontend styling where it supports editing clarity.
