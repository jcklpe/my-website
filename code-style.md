Code style and authoring preferences

After inspecting the actual repo, reflect the real tooling and style conventions in the instruction files. At minimum account for Nuxt, Vue, Vite, pnpm, ESLint, Prettier, TypeScript if present, and the repo's SCSS/design-system structure.

Beyond tool config, this project has strong readability preferences. Capture them clearly in AGENTS.md.

General code style preferences:

- Optimize for human legibility over compactness.
- Prefer explicit, readable code over clever or overly compressed code.
- Prefer composition over inheritance.
- Prefer small composable helpers, composables, and plain functions over deep abstract base classes or heavy class hierarchies.
- Prefer local reasoning. A reader should usually be able to understand a file without chasing too many abstractions.
- Prefer simple, boring solutions when they satisfy the requirement.
- Do not introduce abstraction early just because something might become reusable later.

Control flow and expressions:
- Prefer guard clauses and early returns over deeply nested conditionals.
- Avoid ternaries except for very trivial cases where they are clearly more readable than if/else.
- Prefer named intermediate variables over dense inline expressions.
- When logic becomes dense, break it into small named helpers rather than stacking complexity into one expression.
- Prefer explicit conditionals to "clever" boolean compression.

Data transformation style:
- Prefer pipeline-shaped code over long method chains where possible.
- In JavaScript/TypeScript, that usually means small named transformation helpers and staged intermediate values, not giant chained expressions.
- Avoid long chains that are hard to scan, especially when they mix mapping, filtering, optional access, formatting, and fallback behavior all at once.
- If a transformation has multiple conceptual steps, make the steps visible in the code.

Vue / component style:
- Prefer Vue Composition API patterns, composables, and small focused components.
- Keep component APIs explicit.
- Prefer props, clear helper functions, and readable computed values over magic indirection.
- Keep files human-legible. Avoid component cruft and abstraction layers that make the structure harder to follow.
- Preserve the Gutenberg-to-Vue block rendering architecture and block-level graceful fallback behavior.

SCSS / class naming preferences:
- Prefer simple semantic class names and class composition over long BEM-style fused names when there is no strong reason for BEM.
- Multiple small semantic classes on the same element are often preferred (`case-study-page.hero`) to names like `case-study-page__hero` when local component scoping already provides clarity.
- Prefer composable context + role selectors like `.case-study-page.hero`, where the element carries both the local context class and the role class.
- Do not reach for descendant selectors just to create scope. If a real child relationship matters, prefer restrained SCSS nesting so the relationship is visible in the stylesheet structure.
- Shared role classes such as `.hero`, `.title`, `.content`, or `.meta` can be useful when they describe a real reusable role, but avoid bare global rules for generic names unless the context is intentionally global.
- Avoid utility soup. If an element needs many small classes before its purpose is legible, prefer a clearer component, clearer local class, or simpler structure.
- Do not overuse deeply nested selectors or brittle DOM-coupled selector chains.
- Keep page and component styles close to the component unless there is a clear reason to share them.
- Follow the repo's design-system rules around palettes, context-roles, shared-components, CSS custom properties, and narrow Sass helper injection.

Editing discipline:
- Follow the repo's existing ESLint and Prettier configuration rather than inventing a new house style.
- Do not reformat unrelated files gratuitously.
- Markdown docs are intentionally not Prettier-managed. Preserve the author's chosen heading/list spacing and prose rhythm unless a specific doc cleanup is requested.
- Prefer small, targeted edits over broad churn.
- When changing style-system files, preserve the existing context-role and generated editor.css workflow.
- If touching code style conventions, first inspect the current repo pattern and then either follow it or explicitly document a proposed improvement rather than silently mixing styles.

If the current codebase already contains patterns that conflict with these preferences, do not rewrite the whole repo casually. Instead:

1. note the current pattern,
2. follow local consistency where needed,
3. and call out any worthwhile future cleanup or migration path.
