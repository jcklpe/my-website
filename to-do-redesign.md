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

Branch `gendes-academia` started from a cleaned-up state — cassette-futurism artifacts already archived. The color palette has `$color-primary: #2657eb` (electric blue, still present but being kept sparingly) and `$color-accent: #7200ff` (purple, to be removed). The footer is currently electric blue and tall. The nav is a small fixed interior affordance. Card components, article body, and homepage sections all need visual quieting. Heading scale in the type palette is tuned for expressive poster-level titles, not article-body document rhythm. No article-scoped heading overrides exist yet.

# To Do

## 1. Palette

- Remove `$color-accent: #7200ff` from `packages/styles/_color-palette.scss`
- Remove `--color-accent` CSS custom property from `packages/styles/context-role/_vue-frontend.scss`
- Remove `--color-link-bg` gradient (electric blue → purple) from `packages/styles/context-role/_vue-frontend.scss`
- Audit all uses of `var(--color-accent)` across the codebase and replace with appropriate neutral values (`var(--color-ink)`, `var(--color-muted)`, or `var(--color-primary)` if the context truly warrants it)
- Replace `--color-link-bg` gradient usage in `packages/styles/shared-components/_link.scss` with a simple underline or muted ink treatment
- Run `corepack pnpm check` to confirm no lint or type errors after palette changes

## 2. Footer

- Change `SiteFooter.vue` background from electric blue to warm off-white (`var(--color-surface)` or `var(--color-paper-warm)`)
- Update footer text color from light-on-blue to near-black ink (`var(--color-ink)` or `var(--color-ink-80)`)
- Update footer link colors to match the new quiet treatment (ink, simple underline on hover)
- Adjust footer heading and section label styles to work on a light surface
- Verify the footer GitHub link and ACF-backed footer links still render legibly
- Verify footer on mobile

## 3. Navigation

- Change `SiteNav.vue` background to white or `var(--color-surface)` with dark ink text
- Remove any electric-blue background treatment from the interior nav state
- Add slightly more vertical padding to the nav so it has breathing room without becoming large
- Verify hide-on-scroll behavior still works after style changes
- Verify nav on mobile

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
