# Design System Notes
This document captures the working vocabulary for this project. It is not meant to be a universal design-system manifesto. It is the shared language we are using for this website so design decisions stay legible across Nuxt, WordPress, and future contexts like commerce.

The current practical rule is: palettes are mostly Sass source fields, context-roles decide what becomes CSS custom properties, and component styles normally consume those exported values with `var(...)`. The type palette is allowed to emit its external font resource request because font loading is part of the type system.

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

Palette files generally do not emit CSS by themselves. Context-role styles decide which palette values become CSS custom properties for that context. The exception is `_type-palette.scss`, which owns the external font import alongside the font-family and type-scale values. This keeps the Vue frontend, WordPress editor, and future shop context free to expose different subsets of the same source palettes while keeping type resources centralized.

Current palette files live in `packages/styles`:

- `_color-palette.scss`
- `_type-palette.scss`
- `_space-palette.scss`
- `_motion-palette.scss`
- `_effect-palette.scss`

The motion palette currently owns route-transition timing values such as `--motion-route-transition-duration` and `--motion-route-content-delay`. CSS consumes those values directly for animation/transition timing. JavaScript reads the exported CSS custom property when it needs to coordinate behavior with CSS, such as clearing the featured-media transition overlay after the visual transition completes.

Code block chrome lives in `packages/styles/shared-components/_code-block.scss` because it is a reusable component recipe that can be consumed by both frontend-rendered blocks and the WordPress editor baseline. Syntax tokenization is handled by Shiki in `apps/frontend/utils/syntax-highlighting.ts`; if syntax themes become richer or need multiple modes, extract theme values into a dedicated palette only after that real need appears.

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
- `packages/styles/shared-components/_code-block.scss`
- `packages/styles/shared-components/_link.scss`

These files should expose mixins or reusable component specs. They should not assume they are always being rendered on the frontend. Do not forward shared component recipes into every Vue SFC by default; import them explicitly when a component genuinely needs a recipe.

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

Vue SFCs should generally consume palette values with CSS custom properties, for example `var(--space-5)`, `var(--color-ink)`, or `var(--motion-snappy)`. Sass variables remain available for cases that genuinely need Sass behavior, and shared component mixins remain available for reusable declaration recipes.

`packages/styles/_type-palette.scss` defines the font resource import, font-family source values, type scale, and default semantic element styling for `h1` through `h6`, paragraphs, lists, and definition content. It is imported by global context-role styles, not by the Vue component Sass API, so those global selectors and the font import are emitted once per compiled context-role CSS output.

`packages/styles/context-role/_vue-frontend.scss` is the Nuxt frontend CSS output. It imports palettes, exports the frontend CSS custom property set, imports type rules, base rules, WordPress block baseline rules, and shared component specs, then emits the actual global CSS for the frontend.

`apps/frontend/assets/scss/main.scss` should stay boring. Its job is to load the frontend context-role.

Vue SFCs can use shared component mixins and compile-time helpers through the Nuxt Sass `additionalData` configuration, which imports `packages/styles/context-role/_vue-frontend-component.scss` into component style blocks. This is primarily for mixins/functions, not for routine value consumption.

The WordPress editor context-role is `packages/styles/context-role/_wp-editor.scss`. It is compiled manually into the editor theme with `corepack pnpm styles:wp-editor`; later we can decide whether that should become part of a broader build/bootstrap step. The compiled output is `apps/cms/wp-content/themes/my-website-editor-theme/editor.css`, and it remains versioned as a generated theme asset.

## Editorial Content Rendering
Gutenberg body content is adapted through focused Vue block components in `apps/frontend/components/content/blocks`, with baseline editorial block styling in `packages/styles/_wordpress-blocks-baseline.scss`.

The WordPress blocks baseline is deliberately a baseline: it sets rhythm, readable widths, float/alignment behavior, and default handling for common `wp-block-*` markup. Highly art-directed reusable treatments should live under `packages/styles/shared-components` and be included from the baseline or a component when needed.

WordPress image alignment rules currently stay in the baseline, not in `shared-components`, because `alignleft`, `alignright`, `alignwide`, and `alignfull` are Gutenberg layout conventions tied to WordPress markup shape. If non-WordPress image components later need the same breakout/float behavior, extract the reusable portion into a shared component recipe then.

The goal is not to recreate WordPress frontend theme rendering one-to-one. The goal is to preserve WordPress/Gutenberg semantics while letting the Nuxt frontend own the public visual system.

Some blocks still render their WordPress-provided inner markup through their own block component. That is acceptable for blocks where WordPress markup carries useful semantics, such as media, embeds, files, tables, and buttons. It should not become a single giant post-level HTML dump.

Code blocks are special-cased through `apps/frontend/components/content/blocks/CodeBlock.vue` and `apps/frontend/utils/syntax-highlighting.ts`. The syntax highlighter uses Shiki so project-specific languages and VS Code/TextMate-style themes can be added later without changing the Gutenberg block-rendering contract.

Representative block QA content can be regenerated with `corepack pnpm cms:seed-block-test-content`. The fixture creates one post and one case study with common Gutenberg blocks, including heading hierarchy, nested lists, verse, quotes, pullquotes, image alignment combinations, gallery, cover, media/text, columns, groups, embeds, tables, code, details, accordion, file, audio, video, spacer, separator, and button variants.

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
- Keep Sass palette files non-emitting unless the emitted CSS is truly part of that palette's responsibility, as with the type palette's font import.
- Keep Sass for source values, compile-time helpers, and reusable declaration recipes.
- Use shared component specs only when a component style genuinely needs to cross context-roles.
- Keep page and component styles close to the Vue component unless there is a clear reason to share them.
- Prefer readable naming over abstract design-system jargon.
- Keep the WordPress editor useful for editing first; only share frontend styling where it supports editing clarity.
