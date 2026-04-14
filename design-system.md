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

### Component Spec

A component spec is the collection of tokens that defines a component.

For example, a card spec may include background, border, shadow, heading type, excerpt type, media ratio, spacing, and hover motion. Some of those values may come from palettes. Some may be local to that component.

Vue single-file components should generally keep their component-specific styling local, but they may consume shared palette values or shared component specs when that improves consistency.

### Shared Component

A shared component style is a reusable component-level recipe that can be consumed in more than one context-role.

This is the term we prefer over "primitive." In frontend engineering, "primitive" often means a low-level reusable building block, like a base `Button`, `Text`, or `Stack`. That term is common in component-system work, but it can conflict with this project's design-token vocabulary, where "primitive" may refer to a raw token layer.

For this project, use `shared-components` for reusable cross-context component styling.

Current shared component styles live in:

- `packages/styles/shared-components/_button.scss`
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

`packages/styles/context-role/_vue-frontend.scss` is the Nuxt frontend CSS output. It imports palettes, exports the frontend CSS custom property set, imports type rules, base rules, WordPress content adapter rules, and shared component specs, then emits the actual global CSS for the frontend.

`apps/frontend/assets/scss/main.scss` should stay boring. Its job is to load the frontend context-role.

Vue SFCs can use shared component mixins and compile-time helpers through the Nuxt Sass `additionalData` configuration, which imports `packages/styles/context-role/_vue-frontend-component.scss` into component style blocks. This is primarily for mixins/functions, not for routine value consumption.

The WordPress editor context-role is `packages/styles/context-role/_wp-editor.scss`. It is compiled manually into the editor theme with `corepack pnpm styles:wp-editor`; later we can decide whether that should become part of a broader build/bootstrap step. The compiled output is `apps/cms/wp-content/themes/my-website-editor-theme/editor.css`, and it remains versioned as a generated theme asset.

## Guardrails

- Avoid turning every design value into a global variable by default.
- Use palette files for related fields of values.
- Prefer CSS custom properties as the normal component-facing API for palette values.
- Keep Sass palette files non-emitting unless the emitted CSS is truly part of that palette's responsibility, as with the type palette's font import.
- Keep Sass for source values, compile-time helpers, and reusable declaration recipes.
- Use shared component specs only when a component style genuinely needs to cross context-roles.
- Keep page and component styles close to the Vue component unless there is a clear reason to share them.
- Prefer readable naming over abstract design-system jargon.
- Keep the WordPress editor useful for editing first; only share frontend styling where it supports editing clarity.
