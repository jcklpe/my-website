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

### The Right Way to Use Nesting

SCSS nesting is good when it expresses real hierarchy. The point of this refactor is not to make every selector flat. The point is to stop coupling unrelated components through selector groups.

Flat selector chains like this are mechanically correct, but they make the source harder to scan:

```scss
.editor-styles-wrapper .wp-block-paragraph a:hover,
.editor-styles-wrapper .wp-block-paragraph a:focus-visible,
.editor-styles-wrapper .wp-block-list a:hover,
.editor-styles-wrapper .wp-block-list a:focus-visible {
  @include link.rich-link-hover;
}
```

The hierarchy is real: editor context → block type → link → interaction state. In SCSS, that hierarchy should usually be written as hierarchy:

```scss
.editor-styles-wrapper {
  .wp-block-paragraph {
    a {
      &:hover,
      &:focus-visible {
        @include link.rich-link-hover;
      }
    }
  }

  .wp-block-list {
    a {
      &:hover,
      &:focus-visible {
        @include link.rich-link-hover;
      }
    }
  }
}
```

This is better than the flat form because each block type still owns its own rule tree. It is also better than nesting the block types together:

```scss
.editor-styles-wrapper {
  .wp-block-paragraph,
  .wp-block-list {
    a {
      &:hover,
      &:focus-visible {
        @include link.rich-link-hover;
      }
    }
  }
}
```

That version is shorter, but it reintroduces cross-component grouping. It says paragraph links and list links are one rule because they happen to share a hover recipe today. The preferred version repeats the hover recipe independently so paragraph links and list links can diverge without restructuring the source.

The same principle applies inside a component. This is good nesting:

```scss
.editor-styles-wrapper {
  .wp-block-details {
    > summary {
      cursor: pointer;
    }

    &[open] > summary {
      margin-bottom: var(--space-3);
    }
  }
}
```

The nested selectors are children or states of `.wp-block-details`, so reading the block gives you the complete story of that component.

Use nesting to reveal ownership and hierarchy. Do not use nesting to hide unrelated component groups inside a prettier-looking tree.

---

## Scope of the Refactor

The following files need component-centric restructuring. The rule in all of them is: each WP block type or named component gets its own rule block or shallow nested rule tree. Avoid coincidental cross-component groups; pure universal resets, scoped normalization, and intentional modifier patterns are fine.

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

After grouped selectors are split, this file should also be shaped toward shallow nesting where it improves readability. `.editor-styles-wrapper` is a real context-role wrapper, and block-owned child selectors such as links, captions, summaries, accordion panels, and code internals can usually live inside the block's nested tree.

### `packages/styles/context-role/_vue-frontend.scss`

Same pattern. Quote blocks, image blocks, pullquotes, gallery blocks — all currently share grouped rules for shared values. Separate them. Reference shared palette tokens directly in each block's rule.

### `packages/styles/_type-palette.scss`

The type palette owns font-family names, type tokens, and type-related source values. It must stay non-emitting so shared-component recipes can safely consume it from Vue scoped styles. Font resource loading lives in `_type-fonts.scss`, which emitting context-roles import directly. The type palette should not assemble paragraph, list, or heading selectors. Those are components: `_paragraph-block.scss`, `_list-block.scss`, and `_heading-block.scss` own the complete block recipes that apply type values alongside rhythm, width alignment, float-breakout behavior, links, and local states.

Do not promote every per-level heading declaration into a palette token by default. If `h2` is the only consumer of its exact `font-size`, `line-height`, or `letter-spacing`, keep that value inline in the `heading-h2-block` recipe. Extract a type value only when it is selected from elsewhere or shared for a clear design reason.

Semantic HTML is still a valid style surface. Do not add classes like `.heading-block` just to avoid styling an `h2` when the element itself already carries the meaning. The difference is that the selector should normally live in the owning SFC or editor adapter through a shared recipe:

```scss
// HeadingBlock.vue
h2 {
  @include heading-h2-block;
}

// _wp-editor.scss
.wp-block-heading:is(h2) {
  @include heading-block.heading-h2-block;
}
```

The same idea applies to frontend context hooks. When a contextual content-flow rule targets native editorial content, prefer attaching the hook through the native element's recipe instead of inventing or reinforcing a class. For example, a `p` can own its `.float-breakout-wrapping-content > p` behavior through the paragraph recipe, while richer constructs such as `.accordion-block`, `.button-group`, or `.media-text-block` can keep class hooks because there is no single native element that fully describes them.

When multiple elements share a value, name the value rather than coupling the selectors. For example, prefer:

```scss
$type-heading-small-line-height: 1.08;

h4 {
  line-height: $type-heading-small-line-height;
}

h5 {
  line-height: $type-heading-small-line-height;
}
```

over:

```scss
h4,
h5 {
  line-height: 1.08;
}
```

The first shape keeps the typography value shared while keeping each semantic element independently readable. If the value only belongs to one element, keep it inline in that element's recipe.

### Styling ownership boundaries

Frontend component styling should live as close to the component as practical. For Vue-rendered frontend blocks, the default assembly point is the Vue SFC's scoped style block, especially when the rendered markup is already semantic HTML. A `ParagraphBlock.vue` that renders a `p` should usually apply the paragraph recipe to `p`, not require a redundant `.paragraph-block` class just to restate the same concept.

Use bespoke semantic classes only when native HTML does not fully describe the thing being styled. Classes such as `.media-text-block`, `.button-group`, `.accordion-block`, and `.mega-gallery-block` remain useful because those are richer constructs, not plain native elements. Classes such as `.paragraph-block` or `.list-block` should be treated with suspicion when the root element is already a `p`, `ul`, or `ol`.

The type palette remains the value source for typography, not the place where every typographic component is assembled. Shared recipes should consume type custom properties or type source values, then apply them as part of a complete component recipe. The SFC Sass API and the shared recipes it exposes must remain non-emitting; scoped style blocks should not accidentally duplicate global font imports or selector output.

Shared-component recipes belong in `packages/styles/shared-components/` only when there is a named reusable visual or behavioral pattern. Sharing should not become a mechanical DRY reflex. Two components using the same font, color, or line-height is not enough reason to invent a shared recipe; that is what tokens and type defaults are for. A recipe is justified when the grouped declarations describe a meaningful object such as a button shell, file grid, media-text layout, code terminal surface, or gallery frame.

Frontend-only interactive blocks can stay fully SFC-local when the shared recipe would not actually be shared. Mega Gallery is the working example: its Masonry/PhotoSwipe layout, internal roles, and content-flow width alignment live together in `MegaGalleryBlock.vue` because the WordPress editor has a separate block-editing preview and does not consume the frontend Sass recipe.

When shared typography is needed across Vue SFCs and the editor, the values should come from `_type-palette.scss`. A shared-component recipe may consume exported type custom properties when applying typography is intrinsic to that component's reusable recipe, but it should not become the source of new type values. Caption typography is an example of this pattern: `editorial-caption` in `_type-palette.scss` is the single source for figure and table caption font, size, color, and spacing; recipe files (`_image-block.scss`, `_gallery-block.scss`, `_table-block.scss`, `_embed-block.scss`) call `@include type.editorial-caption` and stay consistent without duplicating values.

`packages/styles/context-role/_vue-frontend.scss` should shrink toward frontend shell/global mechanics: token exports, page/global base rules, the `.content-flow` grid tracks/container, fallback bare-element hooks, float-breakout wrapper grouping, global alignment utilities, and other structural rules that cannot be owned safely by a single scoped component. Route/page-shell transition styles should live in the layout or component that renders the shell element they affect.

For Vue block components, content-flow width/alignment behavior belongs inside the block's shared-component recipe mixins and is applied by the SFC's scoped style. That keeps the SFC as the local assembly point while avoiding a central `_vue-frontend.scss` selector registry. Native semantic elements that do not have a block recipe can still keep narrow context hooks in `_vue-frontend.scss`, but paragraph, list, and heading blocks now have recipes.

`packages/styles/context-role/_wp-editor.scss` is the Gutenberg adapter layer. It maps editor DOM and WordPress-provided classes to the same type values and shared recipes where useful, plus editor-specific alignment and wrapper quirks. The editor context should not force frontend components to keep WordPress-shaped or redundant classes just for parity.

When a shared recipe contains frontend-only content-flow selectors, importing that recipe into `_wp-editor.scss` is still acceptable if it keeps the component's styling story together. Those selectors simply do not match in the editor. Split the recipe only when the editor DOM requires a genuinely different component-part hook.

One Vue-specific caveat: styles for markup inserted through `v-html` do not receive the component's scoped attribute. Root element styles such as `p { ... }` still work when the root `p` is authored in the template, but child content inside `v-html` needs either carefully scoped `:deep(...)` selectors or a global/context-role hook. Use `:deep(...)` deliberately for component-owned rich-text internals such as links; do not use broad `:global(...)` selectors to move content-flow or page-context behavior into an SFC. When a context-role rule must override an SFC root rule, keep that specificity decision inside a named mixin or the context-role source rather than leaking context selectors into the SFC.

### Frontend article structure

The `.content-flow` grid shell is a frontend context-role concern. `packages/styles/context-role/_vue-frontend.scss` should own the named grid tracks, container-level structure, fallback bare-element handling, and wrapper-only behavior such as float-breakout grouping. It should not become the registry for every block's normal/wide/full placement.

For block components, content-flow width/alignment behavior is part of the reusable block recipe. Put the `width-alignment()` and `float-breakout-wrapping-content()` calls inside the same recipe mixins that describe the component shell or relevant component part. Do not create a second layer of placement-only mixins just to separate placement from the rest of the recipe.

```scss
// packages/styles/shared-components/_quote-block.scss
@mixin quote-shell {
  @include mixins.width-alignment(default);

  @include mixins.width-alignment(wide) {
    grid-column: wide;
  }

  @include mixins.width-alignment(full) {
    grid-column: full;
  }

  @include mixins.float-breakout-wrapping-content {
    max-width: var(--article-column-tight);
    margin-bottom: var(--space-5);
  }

  // Quote shell declarations live here too.
  margin-bottom: var(--space-5);
}
```

```scss
// apps/frontend/components/content/blocks/QuoteBlock.vue
.quote-block {
  @include quote-block.quote-shell;
}
```

The `default` alignment is deliberately terse: it emits only `grid-column: content` for direct children of `.content-flow` and does not take a declaration block. Native editorial elements whose default article placement is intentionally wider, such as semantic `h2` through `h6`, can use `width-alignment(default-wide)` and keep their measure/rhythm declarations inside that local block. Wide and full alignments work more like breakpoint mixins: they open the relevant component selector and let the component decide what changes. This keeps the common content-flow condition named without hiding component-specific width, margin, or frame behavior in a generic helper.

That is preferable to maintaining one central selector registry like:

```scss
.content-flow
  > :is(
    .quote-block,
    .pullquote,
    .gallery-block,
    .table-block,
    .embed-block
  ) {
  grid-column: content;
  width: 100%;
  max-width: none;
  margin-inline: 0;
}
```

The central registry is shorter, but it makes block placement harder to understand from the block itself. A component recipe mixin keeps the shared placement condition explicit while preserving component ownership. Keep dense structural selectors only for relationships that are genuinely about the flow container rather than about a specific block's own layout.

Readable blocks should keep that boundary especially clear. `@include mixins.width-alignment(default);` should place the block on the content track; the paragraph/list/heading recipe should own readable width, padding, margins, links, and typography. Otherwise DevTools starts telling a confusing story where a context selector and the component selector fight over the same box values.

The same rule applies to layout and media blocks. The default alignment helper should place the block; if a component needs to fill or reset its grid track because its standalone shell uses a frame width, that reset belongs in the block's recipe mixin or scoped rule tree, not in a global context-role selector group.

Float-breakout behavior follows the same recipe-ownership pattern. The `.float-breakout-wrapping-content` wrapper can own wrapper-only facts such as first-child top-margin cleanup. Width, padding, and rhythm adjustments for block components that appear as wrapping content — `blockquote`, `details`, `.accordion-block`, `.button-group` — come from the relevant shared-component recipe mixin through `float-breakout-wrapping-content()`. Directional float-lead behavior — blocks that float as the lead child of a `.float-breakout-flow` group — belongs in a companion `*-float-lead` mixin called from inside the shell mixin. The `float-breakout-lead($side)` mixin generates `.float-breakout-flow.#{$side} > &` context rules; calling it from the shell mixin keeps the SFC unaware of float-lead geometry. Responsive collapse (float → unfloated at `tablet-down`) also lives inside the `*-float-lead` mixin. Truly bare semantic elements can keep narrowly documented context hooks until they have a recipe. This keeps the wrappers from becoming selector registries.

Article rhythm should use the same bias. Prefer block-owned margins and padding over a container-owned adjacency matrix. A rule like `.content-flow > .table-block + p` or `.content-flow > p + .pullquote` should exist only when there is a visible, durable editorial need that cannot be expressed by the blocks composing normally. The default model is intentionally stigmergic: each block owns its own spacing, and the flow container provides grid tracks plus narrow fallback handling for direct bare elements that do not yet have a recipe.

---

## What to Preserve

- **Mixins** — the shared-component mixins (`media-text-shell`, `separator-dots`, etc.) are correct. They encode a named, semantically meaningful pattern. Keep them.
- **CSS custom properties as tokens** — all the `var(--article-column)`, `var(--space-*)`, `var(--color-*)` references. These are good. Each component references the token independently.
- **Universal/normalization rules** — `*, *::before, *::after { box-sizing: border-box }`, bare `img { max-width: 100% }` etc. Grouping elements for true normalization resets is fine.
- **Modifier rules** — `.wp-block-quote.alignwide { ... }` is a modifier on a specific component, not a cross-component group. Fine.
- **Shallow hierarchy nesting** — `.editor-styles-wrapper { .wp-block-details { > summary { ... } } }` is good when the nesting expresses real ownership. Keep nesting shallow and readable.

---

## Guiding Question for the Refactor

When looking at any grouped selector: *is this group a design constraint with a name, or is it just two things that happen to share a value today?*

If it has a name → extract to a mixin or token, then reference independently.
If it's a coincidence → separate into individual component blocks, repeat the value.

Repetition in this style is not a bug. It's the cost of independence. That cost pays off the moment any single component needs to diverge.

When looking at any long flat selector chain: *is this really a hierarchy that SCSS can express more clearly?*

If it is real hierarchy → use shallow nesting, while keeping each component or block type independent.
If it is only a shared declaration across unrelated components → split it first, then nest each component's descendants separately.
