# Background

The site is undergoing a full visual redesign toward a "non-brand academic" baseline. The prior cassette-futurism direction (amber, dark ink, ghost numbers, spine lines, dossier panels) has been archived. The goal of this phase is to strip the site to a quiet, credible, typographically-led neutral state that will serve as the shared point of departure for future generative design spikes.

Deeper direction and rationale live in `redesign.md`. This file tracks the concrete work.

## Project organization

Add new items to complete to the `# To Do` section. When those items are completed move them either to `# Ready for human QA` or `# Done`. Update the `# Current State Overview` with an overview of the current state.

Keep tasks concrete, atomic, and specific. So something like "remove `--color-accent` from `_vue-frontend.scss` and replace all usages with `var(--color-ink)`" is preferable to "simplify the color palette."

## General principles

- Strip, do not redesign. Every decision at this stage should remove noise, not add something new.
- Preserve structural and transition constraints: `clip-path`, `data-featured-*` attributes, `FeaturedMediaFrame` props, and the `.content-flow` grid must not change.
- Article body and page chrome are separate registers. Calming the article body should not accidentally flatten page-level titles or card treatments.
- Electric blue (`$color-primary`) is allowed sparingly; purple (`$color-accent`) is gone entirely.
- IBM Plex Mono Italic headings and IBM Plex Sans body are fixed — the only expressive typographic move kept.
- Do not introduce new abstractions or refactor things that are not visually broken.

# Current State Overview

Palette, footer, and navigation have been neutralized. `$color-accent` (purple) is fully removed. The body background no longer has the blue radial glow. The footer is warm off-white with ink text. The nav is a small surface-colored affordance with ink text and a subtle border. Home section components and the case-study card title drop-shadow have been de-blued. Article body block styles (quote, accordion, code, file) have been quietly neutralized. `corepack pnpm check` passes. Remaining work: article-body heading scale calibration, broader article block recipe review, card visual weight, and full homepage audit.

# To Do

## 4. Article body headings

- Add article-scoped heading overrides within the `.content-flow` context in `packages/styles/_wordpress-blocks-baseline.scss` (or a suitable shared-component file)
- Target h2, h3, h4 inside `.content-flow`: reduce font sizes toward document scale (aim for GitHub markdown-style rhythm — h2 around 1.5–1.75rem, h3 around 1.25rem, h4 around 1.1rem as a starting point)
- Keep italic mono face and weight — just reduce the scale
- Verify heading hierarchy is still clearly scannable after scale reduction
- Check against the block QA fixture at `http://my-website.localhost/writing/block-qa-kitchen-sink-post`

## 5. Article body block recipes

- Review each file in `packages/styles/shared-components/` for tape-label or high-contrast decorative treatments: `_quote-block.scss`, `_pullquote.scss`, `_details-block.scss`, `_accordion-block.scss`, `_code-block.scss`, `_file-block.scss`
- Strip or significantly quiet any `background: var(--color-ink)` slab treatments on ordinary prose blocks
- Make quote, pullquote, code, details, and accordion feel like variations within the same quiet system — simple borders, muted backgrounds, not competing loud objects
- Verify captions are small, dim, and readable (not invisible, not loud)
- Check image placement and breakout still looks clean without extra decoration
- Check against block QA fixture

## 6. Cards

- Calm down `PostCard.vue` visual weight — reduce any high-contrast graphic treatments; featured image should be present but not dominant
- Calm down `CaseStudyCard.vue` visual weight similarly
- Do NOT remove `clip-path`, `data-featured-*` attributes, or any transition hooks
- Verify card-to-detail transitions still work after restyling
- Verify cards on mobile

## 7. Homepage

- Audit each homepage section component for electric-blue or purple usage and replace with neutral values
- Hero: evaluate whether heading scale is still appropriate for a quieter register; it can keep some scale but should not feel like a billboard
- Selected Work section: verify cards look coherent after card restyling
- Latest Writing section: same
- Employer Testimonials section: check for any loud accent use
- Side Projects link section: check for any loud accent use
- Verify the homepage feels like a cohesive quiet whole after all other changes are done

# Ready for human QA

# Done

## Palette

- Removed `$color-accent: #7200ff` from `_color-palette.scss`
- Removed `--color-accent` CSS custom property from `_vue-frontend.scss` and `_wp-editor.scss`
- Simplified `--color-link-bg` from electric-blue → purple gradient to solid `var(--color-primary)` in both context roles
- Removed electric-blue radial gradient from the `body` background in `_vue-frontend.scss` (subtle ink grid texture remains)
- Neutralized `HomeSideProjectsLink.vue` background from accent → primary-heavy gradient to solid `var(--color-ink)`
- Neutralized `HomeContentSection.vue` decorative rule box-shadow from primary to ink
- Fixed `HomeEmployerTestimonials.vue` eyebrow/meta using undefined `--color-primary-light` → `var(--color-muted)`
- Neutralized `CaseStudyCard.vue` title-label drop-shadow from primary blue to ink (default and mobile hover states)
- Removed blue tint from `_quote-block.scss` quote shell background
- Removed primary tint from `_accordion-block.scss` shell border and toggle button background
- Removed blue chromatic-aberration overlay from `_code-block.scss` retroterm `::before`; kept scanline effect
- Changed `_code-block.scss` retroterm offset box-shadow from primary to ink
- Changed `_file-block.scss` left border from primary to `var(--color-ink-30)` (both `file-shell` and `file-grid-shell`)

## Footer

- Changed `SiteFooter.vue` background from electric blue to `var(--color-paper-warm)`
- Changed all footer text, heading, and link colors from white to ink variants
- Changed footer base border from white-tinted rgba to `var(--color-card-border)`
- Changed source-link and note color to `var(--color-muted)` with ink on hover

## Navigation

- Changed `.home` and `.interior` nav backgrounds from blue gradient to `var(--color-surface)` with a subtle border-bottom
- Changed `.interior.is-local` from transparent/no-padding to `var(--color-surface)` with border and `var(--space-3) var(--space-4)` padding
- Changed all `SiteNav` text colors from white to `var(--color-ink)`
- Changed `.is-local` link treatment from floating ink-background labels to plain ink text with underline border
- Kept `.is-local` hover as `var(--color-primary)` — subtle blue on hover preserved as allowed accent
- `corepack pnpm check` passes clean after all changes
