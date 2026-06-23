# Jank Fix 1 — Archive

**Status: Complete. Archived.**

This doc synthesizes two earlier scratch docs (`content-fixes.md` and `general-fixes.md`) into a single record of what was fixed, what was punted to spikes, and the durable lessons learned. Created retroactively after the work was done.

---

## What this spike covered

A general-purpose bug-and-polish pass across the site covering: editorial content styling, homepage UI polish, and one full-stack feature (testimonials background texture). Work was done while Codex handled the baked-halftone pipeline (which touches the featured-media transition surface), so this pass deliberately avoided the transition system.

---

## Bug fixes completed

### Footer "About" link broken

**Root cause**: The footer link to `/about` used a WordPress-origin URL (e.g. `http://cms.my-website.localhost/about`) rather than the public Nuxt path. The frontend internal-link detection checked `window.location.origin`, which is the Nuxt origin, not the CMS origin. Mismatch meant the link was treated as external and navigated via full page load instead of Nuxt router.

**Fix**: The frontend normalizes CMS-origin internal URLs at GraphQL fetch time (in `useWordPress.ts`). The relevant function strips the CMS origin and replaces it with a root-relative path before links reach the component layer.

**Lesson → AGENTS.md**: Noted under CMS content model — "CMS-authored internal links should be normal WordPress/editor links. The frontend normalizes internal CMS-origin URLs at fetch time."

### BLUF hero flash on departure from Side Projects page

A brief flash of the BLUF hero appeared when navigating away from Side Projects back to home. This was caused by the page scroll position resetting before the route transition completed. The router's `scrollBehavior` was triggering an instant scroll-to-top before the outgoing transition had a chance to run. Fixed by suppressing premature scroll during active transitions (handled in the transition coordinator in `useFeaturedMediaTransition.ts`).

---

## Content / article CSS fixes

### Inline code styling

**Before**: Inline `<code>` inside article body was rendered in mono font but with no visual treatment — no background, no border. Blended into prose text.

**After**: `inline-code-styles` mixin in `packages/styles/shared-components/_code-block.scss`:
- `background: var(--color-surface-soft)`
- `border: 1px solid var(--color-ink-30)`
- `padding: 0.15em 0.4em`
- `border-radius: 3px`
- `color: var(--color-ink)`

Added both a plain `inline-code-styles` mixin (used in `_wp-editor.scss`) and an `inline-code-deep` variant that wraps the same rules in `:deep()` for Vue scoped styles targeting `v-html`-injected content.

### Code block word-wrap with hanging indent

**Before**: Long lines in code blocks triggered a horizontal scrollbar instead of wrapping.

**After**: `.line` spans in the code block output get `display: block; min-height: 1lh; padding-left: 1.5em; text-indent: -1.5em`. This creates a VS Code-style hanging indent: the first line of a wrapped code line starts at the gutter, and continuation lines indent to show they're part of the same logical line.

### Image caption link styling

**Before**: Links inside image captions (`figcaption`) were unstyled because the plain selector `figcaption a { }` inside a Vue scoped style does not pierce `v-html`-injected content.

**After**: Added `:deep(a) { @include link.rich-link; ... }` alongside the plain selector in the `image-parts` mixin in `packages/styles/shared-components/_image-block.scss`. The plain selector covers the WP editor context; `:deep()` covers the Vue frontend's `v-html` content.

### List item spacing

**Before**: `$type-list-item-rhythm: 0.45em` in `_type-palette.scss` added visible gap between every list item, making lists feel loose.

**After**: Changed to `0`. Inter-item breathing room now comes from natural line-height rhythm alone.

---

## Homepage UI fixes

### Selected Work section title

Made significantly larger and bolder to match the editorial scale of similar personal portfolio sites.

**Final values** (after two rounds of iteration — started too large):
- `font-size: clamp(3rem, 8.5vw, 9rem)`
- `font-weight: 700`
- `line-height: 0.95`
- `letter-spacing: -0.04em`
- `max-width: min(16ch, 80vw)`
- Phone breakpoint: `clamp(3rem, 16vw, 6rem)`

The cobalt rule above the section label (`::before` element) was scaled proportionally: `width: clamp(4rem, 7vw, 7rem)`.

### Testimonial card styling

Testimonial cards now match the design system's page card styling:
- Border: `var(--border-window)` (thick 2px black, was `var(--border-default)`)
- Shadow: `var(--shadow-hard-low)` (hard-edged, was `var(--shadow-soft-low)`)

### Case study card outer border

All three card layout variants (photo-left, photo-right, banner) now have a consistent `border: var(--border-window)` on the outer `.case-study-card` element. Internal `border-top` rules that were creating doubled-border perception between photo and text areas were removed:
- `.is-layout-photo-left` and `.is-layout-photo-right`: removed internal `border-top`
- `.is-layout-banner .link-box`: removed internal `border-top` (background contrast between photo and cream text plate is sufficient separation)

Stacked cards in the list: `li + li { margin-top: -2px }` in `CaseStudyList.vue` collapses the doubled 4px border between adjacent cards to a single 2px line.

**Resolved in the featured-media transition spike**: The card outer border (`border: var(--border-window)`) used to pre-empt the reverse featured-media morph by appearing before the clone seated. The final transition system gates visible card frames/dividers until hand-off. See `docs/archive/featured-media-transition.todo.md`.

### Writing archive button

The "View writing archive" link was left-aligned inside the writing section. Moved to center:
- `display: block; width: fit-content; margin-inline: auto; margin-top: var(--space-6)`

### Home nav "Home" link

The "Home" link in the local interior nav pill had a `border-bottom` that made it look like a boxed link. Removed `border-bottom: 0` on `.is-local .home-link`. Separately, the local nav pill itself had a `border: 1px solid var(--color-primary)` and a `var(--shadow-soft-low)` shadow that made it feel like a floating card. Removed both — the pill now disappears into the cream ground.

---

## Full-stack feature: testimonials background texture

Added a switchable background texture to the Testimonials section. Content editors can now select from 7 texture options in the WP admin.

**Stack touched**:
1. **`apps/cms/wp-content/plugins/project-bootstrap/project-bootstrap.php`**: ACF radio field `testimonials_background_texture` in `group_my_website_homepage_testimonials` with choices: `none`, `dots`, `paper_grid`, `paper_grid_ink`, `paper_grid_signal_dots`, `blueprint`, `scanline`. Default: `dots`. Registered `homepageTestimonialsTexture` GraphQL field on `Page` type.
2. **`apps/frontend/types/wordpress.ts`**: Added `TestimonialsTexture` union type and fields on `HomePageContent` and `WordPressHomePageResponse`.
3. **`apps/frontend/composables/useWordPress.ts`**: Added `homepageTestimonialsTexture` to the GraphQL query; validates against `VALID_TEXTURES` array before returning.
4. **`apps/frontend/components/home/HomeEmployerTestimonials.vue`**: `TEXTURE_STYLES` record maps each texture key to `{background, backgroundSize}` CSS values. Computed `innerStyle` applies the current texture as inline style on `.inner`.
5. **`apps/frontend/pages/index.vue`**: Passes `:testimonials-texture` prop from page content.

**Current default**: `dots` (signal dot radial-gradient). Signal dots looks best at the current configuration; other options are available via the WP admin.

**Future**: The texture token system (`--texture-paper-grid`, etc.) may play a role in article/blog post section breaks — alternating background bands with different textures. See `docs/scratch/brand-voice.md`.

---

## Article column width

Adjusted from the project default (~60ch) to 70ch (a ~6% increase from the preceding session's value). All related spatial palette values adjusted proportionally:

```scss
$article-column: 70ch;         // was 76ch (intermediate) → 60ch (original)
$article-column-tight: 64ch;   // was 69ch
$article-column-heading: 42rem; // was 46rem
$article-column-heading-cms: 48rem; // was 52rem
```

---

## Punted to spikes

| Item | Spike doc |
|------|-----------|
| Enzo syntax highlighting | `docs/scratch/enzo-syntax-highlighting.md` |
| Image lightbox | `docs/scratch/lightbox.md` |
| Article table of contents | `docs/scratch/table-of-contents.md` |
| Brand voice / BLUF hero / visual direction | `docs/scratch/brand-voice.md` |
| Subtle background animations | `docs/scratch/animations.md` |
| Conway's Game of Life on Side Projects card | `docs/scratch/conways-game-of-life.md` |
| Image resizing (WordPress → frontend) | `docs/scratch/image-resizing.md` |
| About page content + structure | `docs/scratch/about-page.md` |
| Footnotes | existing spike (pre-dates this session) |

---

## Durable lessons

These have been folded into the relevant permanent docs:

### 1. `:deep()` for `v-html`-injected content in Vue scoped styles

Content rendered via `v-html` does not receive Vue's scoped attribute (`[data-v-xxxx]`). Plain selectors inside `<style scoped>` only match elements with that attribute, so they silently skip all `v-html` content. Use `:deep(selector)` to target descendants regardless of the scoped attribute.

`:deep()` is Vue-specific syntax that the Sass compiler passes through to Vue's transform step. It compiles to a descendant combinator targeting any child regardless of scoped attribute. In the WP editor's plain CSS context, `:deep()` is invalid and is silently ignored — which is fine, since the editor doesn't use `v-html`.

**Pattern for shared-component mixins**: Create a plain mixin variant (for WP editor) and a `-deep` variant that wraps the same declarations in `:deep(selector)` (for Vue scoped styles). Example: `inline-code-styles` (plain) and `inline-code-deep` (with `:deep(code)`). → See `docs/design-system.md`.

### 2. SCSS `@use` ordering

Sass's module system requires all `@use` statements to appear before any other rules (including `@mixin` and `@include`). Adding a `@use` after an existing mixin declaration causes a compile error: `@use rules must be written before any other rules`. When adding a new `@use` to an existing file, check what's already declared before the natural insertion point and move the `@use` to the very top. → See `docs/design-system.md`.

### 3. ACF + WPGraphQL full-stack pattern

Full pattern for adding a new CMS-configurable field that surfaces in a Vue component:
1. Register the ACF field group / field in PHP (`project-bootstrap.php`).
2. Register a `register_graphql_fields` call in the same plugin to expose it on the relevant GraphQL type.
3. Add the field to the TypeScript response interfaces in `apps/frontend/types/wordpress.ts`.
4. Add it to the relevant GraphQL query in `apps/frontend/composables/useWordPress.ts`. Validate/normalize the raw value against a known-good set (e.g. `VALID_TEXTURES.includes(raw) ? raw : 'default'`) before returning.
5. Add the prop to the target Vue component and wire it in the parent page component.

### 4. CSS border collapse for stacked cards

Cards with `border: var(--border-window)` (2px) in a list with no gap produce a doubled 4px border between adjacent cards. Fix: `li + li { margin-top: -2px }` on the list element collapses adjacent borders to a single 2px line.
