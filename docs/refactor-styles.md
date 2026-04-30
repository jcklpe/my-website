# Style Refactor Notes

## The Philosophical Position

Style declarations should be **component-centric**. Each component, block, or element owns its own dedicated rule block — a self-contained set of declarations that describes that thing completely. When you read the rule for `.wp-block-paragraph`, it should tell you the full story of `.wp-block-paragraph`. Not part of the story, with the rest scattered across shared groups.

### The Problem with Grouped Selectors

Grouping selectors like this:

```scss
.wp-block-paragraph,
.wp-block-details,
.wp-block-accordion {
  max-width: var(--article-column);
  margin-inline: auto;
}
```

...is a form of premature coupling. It says: "these three things always share these values." But they don't always. They happen to share them *right now*. The moment you need to change `max-width` on `.wp-block-accordion` but not the others, you're forced to split the rule — which means the simple change becomes a structural refactor. The file penalizes the normal case (individual changes) to optimize for the edge case (always-identical values).

The harder-to-see cost is cognitive. To understand `.wp-block-accordion`, you have to find every group it appears in, across the whole file. There's no single place that tells you what `.wp-block-accordion` does. You're reading *relationships*, not *components*.

### The Right Way to Share Values

Shared values belong in:

- **CSS custom properties** — when the value is a design token that multiple things reference independently. `var(--article-column)` is correct here: paragraph and accordion both *reference* the same token, but they do so independently. The token doesn't create coupling between them.
- **Sass variables** — same concept, for compile-time values or palette sources.
- **Mixins** — when the shared thing is a behavior pattern (a set of properties that always travel together for a semantic reason, like `media-text-shell` or `separator-dots`). Mixins document that the shared pattern has a *name and meaning*.

What is **not** a good sharing mechanism: grouping selectors. Selector groups document coincidence, not design intent.

### The Title/Subtitle Analogy

If `.title` and `.subtitle` both have `padding-left: 1.5rem` today, that doesn't mean they *belong together*. Titles and subtitles are conceptually distinct. If a future change needs to update title padding independently, grouped selectors create unnecessary friction. The correct encoding: `--content-indent: 1.5rem` as a token, referenced independently in each component's block. Now you've made the shared constraint explicit *and* kept each component independent.

---

## Scope of the Refactor

The following files need component-centric restructuring. The rule in all of them is: each WP block type or named component gets its own rule block. No groups except pure universal resets.

### `packages/styles/context-role/_wp-editor.scss`

Current state: Many multi-selector groups. Example:

```scss
.editor-styles-wrapper .wp-block-paragraph,
.editor-styles-wrapper .wp-block-details,
.editor-styles-wrapper .wp-block-accordion {
  max-width: var(--article-column);
  margin-inline: auto;
}
```

Target state: each block type owns its own rule block:

```scss
.editor-styles-wrapper .wp-block-paragraph {
  max-width: var(--article-column);
  margin-inline: auto;
}

.editor-styles-wrapper .wp-block-details {
  max-width: var(--article-column);
  margin-inline: auto;
}

.editor-styles-wrapper .wp-block-accordion {
  max-width: var(--article-column);
  margin-inline: auto;
}
```

Yes, this is more lines. The payoff: each block is independently readable, independently editable, and clearly located.

### `packages/styles/context-role/_vue-frontend.scss`

Same pattern. Quote blocks, image blocks, pullquotes, gallery blocks — all currently share grouped rules for shared values. Separate them. Reference shared palette tokens directly in each block's rule.

### `packages/styles/_type-palette.scss`

The type rules for `.wp-block-heading:is(h2), .wp-block-html > h2, .content-flow > h2` should be separated per context. The `_type-palette.scss` file serves multiple contexts (editor, frontend). These grouped rules create ambiguity about what each context actually needs. During refactor, consider whether each rule truly belongs here or should move to the context-role files that own their rendering context.

### `packages/styles/_structural-relations.scss`

This file has both grid/layout rules (`.content-flow` grid) and loose global `.wp-block-*` rules without context scoping. The `.wp-block-*` rules that appear here without `.editor-styles-wrapper` or `.content-flow` scoping reach into both the editor and frontend contexts unpredictably. During refactor, each rule should be explicitly scoped to its intended context.

---

## What to Preserve

- **Mixins** — the shared-component mixins (`media-text-shell`, `separator-dots`, etc.) are correct. They encode a named, semantically meaningful pattern. Keep them.
- **CSS custom properties as tokens** — all the `var(--article-column)`, `var(--space-*)`, `var(--color-*)` references. These are good. Each component references the token independently.
- **Universal/normalization rules** — `*, *::before, *::after { box-sizing: border-box }`, bare `img { max-width: 100% }` etc. Grouping elements for true normalization resets is fine.
- **Modifier rules** — `.wp-block-quote.alignwide { ... }` is a modifier on a specific component, not a cross-component group. Fine.

---

## Guiding Question for the Refactor

When looking at any grouped selector: *is this group a design constraint with a name, or is it just two things that happen to share a value today?*

If it has a name → extract to a mixin or token, then reference independently.
If it's a coincidence → separate into individual component blocks, repeat the value.

Repetition in this style is not a bug. It's the cost of independence. That cost pays off the moment any single component needs to diverge.
