# Copy Cleanup

This spike addresses placeholder and developer-internal copy that has been inadvertently shipped or left hardcoded in the frontend. The goal is to replace every visible filler string with real authored text, and to either hide or remove strings that should never reach a user.

## What This Is

Placeholder copy is a trust signal problem. When a visitor reads "Nuxt SSR frontend for a headless WordPress website" as a page description, or encounters testimonial slots filled with "Future employer / Role or team / Organization," the site reads as unfinished even when the design and layout are polished.

This spike is not a full content audit. It is a targeted sweep of the Vue frontend for strings that are clearly wrong: developer-internal notes masquerading as UI copy, LLM-generated filler text, and fallback content that should never have been user-visible.

## What This Is Not

- A redesign of the copy strategy, tone, or information architecture.
- A rewrite of actual authored content (About page, case study intros, WordPress-managed body copy).
- An SEO strategy exercise. Better meta descriptions are a side effect, not the goal.

## Scope

**In scope:**

- Hardcoded `useSeoMeta` descriptions that contain developer notes rather than real descriptions (`'Writing archive powered by WordPress block data.'`, `'Nuxt SSR frontend for a headless WordPress website.'`).
- UI-visible section taglines (`SectionHeading` description props) that are placeholder-quality rather than authored.
- Fallback testimonial entries in `useWordPress.ts` that are user-visible when the CMS returns no testimonials.
- Homepage `HomeContentSection` error/empty-state messages that are user-visible and developer-voiced.

**Out of scope:**

- About page copy — superseded by the about-page spike.
- Side Projects holding message — superseded by the side-projects spike.
- CMS-managed content (footer, homepage ACF fields, WordPress post bodies). WordPress is the source of truth for those; fixing them is a CMS editing task, not a frontend code change.
- `FeaturedMediaFrame` label fallback and similar internal loading-state affordances that are aria-hidden or not visible in normal rendering.

## Philosophy

Real copy should be authored, not generated. The bar is not perfection — it is "would this sentence embarrass the site if a real person read it." Developer shorthand fails that bar. Honest silence (hidden section, no description) is better than false filler.

For strings that require actual decisions about what to say, the to-do marks them as needing human-authored text rather than proposing LLM-written replacements.

## Relationship to Other Spikes

The About page spike and Side Projects spike overlap in subject matter but own their respective pages entirely. This spike touches only Writing, Homepage, and the testimonials composable.

When those spikes complete, verify no new placeholder copy has been introduced before closing this one out.
