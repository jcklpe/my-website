# Background

Several visible strings in the Vue frontend were written as developer scaffolding or LLM filler and were never meant to ship. They fall into two categories: internal-sounding copy that is technically wrong ("Nuxt SSR frontend for a headless WordPress website"), and placeholder content that signals an unfinished site to real visitors (testimonial dummy entries, clinical section taglines). This spike clears both categories from the in-scope pages.

Deeper rationale and scope framing live in `docs/copy-cleanup.md`. This file tracks the concrete work.

## Project organization

Add new items to complete to the `# To Do` section. When those items are completed, move them either to `# Ready for human visual QA` or `# Done`. Update the `# Current State Overview` with an overview of the current state.

Keep tasks concrete and atomic. "Replace the `useSeoMeta` description in `pages/index.vue` with real authored text" is preferable to "fix the homepage meta."

## General principles

- Replace developer-internal strings with authored copy. Do not generate replacement copy — flag each instance as needing a human decision, write the replacement when the author provides it.
- When a fallback section cannot show real content, prefer hiding it over showing placeholder copy.
- Do not touch page structure, markup, component props shape, or styles. This is copy-only work.
- Do not touch About page or Side Projects — those are owned by their respective spikes.
- Do not touch CMS-backed content in WordPress directly from code changes; those are editorial tasks.
- Run `corepack pnpm check` after any `.vue` or `.ts` edits.

# Current State Overview

All items complete. SEO descriptions are now ACF-backed for Home, Writing, and Side Projects pages — author them in WordPress and they flow through automatically. The `SectionHeading` description on the Writing index is still hardcoded lorem ipsum pending a real string. Fallback testimonials are lorem ipsum pending real CMS entries. The about-page and side-projects spikes own their respective pages.

# To Do

# Ready for human visual QA

# Done

## 1. Homepage `useSeoMeta` description

- File: `apps/frontend/pages/index.vue`
- Was: `'Nuxt SSR frontend for a headless WordPress website.'`
- Now: `'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'`
- Temporary — replace with real authored copy when ready.

## 2. Writing index `useSeoMeta` description

- File: `apps/frontend/pages/writing/index.vue`
- Was: `'Writing archive powered by WordPress block data.'`
- Now: `'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'`
- Intentionally temporary — permanent CMS-backed replacement belongs to the writing-section spike. See `docs/scratch/writing-section.md`.

## 3. Writing index `SectionHeading` description

- File: `apps/frontend/pages/writing/index.vue`
- Was: `"Date-driven notes, essays, and updates."`
- Now: `"Lorem ipsum dolor sit amet."`
- Temporary — replace with real authored copy when ready.

## 4. Homepage fallback testimonials

- File: `apps/frontend/composables/useWordPress.ts`
- Was: "Future employer / Future collaborator / Future manager" with self-referential filler quotes
- Now: lorem ipsum quotes with "Name Placeholder / Role Placeholder / Organization Placeholder"
- Preferred resolution is still to populate real testimonials in WordPress → Home page → Employer Testimonials ACF field, which makes the fallback irrelevant.

## 5. Homepage `HomeContentSection` error/empty messages

- File: `apps/frontend/pages/index.vue`
- Was: verbose developer-status notes referencing CMS readiness
- Now: `"Error: Case studies could not be loaded."` / `"No case studies yet."` and `"Error: Posts could not be loaded."` / `"No posts yet."`
