# Homepage Refinement

## Purpose

The homepage is the site's primary composition surface. It is the place where the project introduces itself, directs people toward Selected Work and Writing, signals the existence of Side Projects, and sets the visual tone for the rest of the site.

The current homepage works, but it is still a first-pass assembly. This spike should make it a stronger foundation for the upcoming generative design work by clarifying the homepage content model, reducing placeholder/crufty copy, and making the markup easier for a future design branch agent to read and reshape.

This is not a visual reskin spike. It is a preparation spike: make the homepage more truthful, more legible, and less brittle before asking agents to explore more expressive design directions.

## Desired Outcome

By the end of this spike:

- The homepage should still be easy to scan as one complete page composition.
- Section boundaries should be visible in the code without becoming an over-abstracted section framework.
- Homepage-specific components should exist only where they improve local readability or isolate genuinely repeatable behavior.
- One-off visual/compositional ideas should be allowed to live close to the page rather than being forced into reusable components.
- CMS-backed homepage fields should match real editorial needs, not speculative configuration.
- Placeholder copy should read clearly as placeholder copy when it needs to preserve a visual surface for design review.
- The homepage should give generative design branches enough structure to be creative without requiring them to debug content plumbing first.

## Design Philosophy

The homepage should be treated as an art-directed composition, not as a generic page-builder output.

That means we should not optimize the markup for maximum DRYness. Shared components are useful when they make the page easier to understand, but harmful when they hide the relationship between adjacent sections or couple unrelated pages together. A heading treatment reused by Home, Writing, and Side Projects is not automatically a component. Sometimes repeated, local markup is the clearer choice.

The key tradeoff is chunking versus flattening:

- Chunking is useful when a section has enough internal logic or styling that reading it separately helps.
- Flattening is useful when the homepage's rhythm, sequencing, or cross-section relationships matter more than component isolation.
- The right answer can vary by section. We do not need one rule for the whole homepage.

The goal is a page that a designer-agent can read from top to bottom and understand: "this is the hero, this is the identity/vital-info band, this is the Selected Work surface, this is the testimonial surface, this is the Side Projects invitation, this is Latest Writing." If the component boundaries make that harder, they should be reconsidered.

## Component Boundary Guidance

Keep a homepage component when it has one or more of these qualities:

- It owns real section-specific data transformation or interaction.
- It is a substantial section whose template and styles are easier to reason about in one focused file.
- It protects a complex child surface, such as post/case-study list rendering, from cluttering the page SFC.
- It has a clear homepage-only purpose and is not pretending to be reusable across unrelated pages.

Consider flattening or localizing a component when:

- It only wraps a slot with a little styling.
- It exists mostly to share a generic heading pattern across pages.
- It hides important page sequencing or rhythm from `apps/frontend/pages/index.vue`.
- It couples unrelated pages just because they happen to have a heading, intro, or link.
- A generative design agent would need to jump across many tiny files to understand a single visual gesture.

Do not flatten everything by reflex. The homepage can still have sections. The target is readable composition, not a thousand-line monolith.

## Current Homepage Model

The route currently lives at `apps/frontend/pages/index.vue`.

It fetches:

- homepage ACF content through `getHomeContent()`
- recent posts through `getHomePosts()`
- selected case studies through `getHomeCaseStudies()`

The visible homepage sequence is:

- inline hero region in `apps/frontend/pages/index.vue`
- `HomeVitalInfo`
- `HomeSelectedWorkSection`
- `HomeEmployerTestimonials`
- `HomeSideProjectsLink`
- `HomeLatestWritingSection`

The current model is functional, but there are open questions:

- Section labels and headings are still partly hardcoded.
- Testimonials are CMS-backed, and the section remains visible with obvious placeholder content when no real testimonials exist.
- The Side Projects invitation may shift as the Side Projects spike settles.
- The homepage has several section-specific visual gestures that may be easier to evolve if the page composition is less abstracted.

## CMS And Content Model

The WordPress front page already uses ACF fields for structured homepage content. That is appropriate where the homepage needs structured fields rather than freeform Gutenberg content.

Use ACF when the field is genuinely structured:

- hero mega text
- hero title
- hero subtitle
- about/vital info tagline
- quick links
- employer testimonials
- SEO description

Be more cautious about adding ACF for every visible phrase. If a heading is fixed site vocabulary, hardcoded route copy can be clearer. If a heading is likely to change editorially, an ACF field can make sense. For the pre-gendes baseline, clear hardcoded placeholders can be better than CMS-expanding every bit of copy before the style and tone have settled.

Avoid building a homepage page-builder. This site is authored in WordPress, but the homepage remains a designed frontend route with a deliberately small structured field surface.

## Relationship To Other Spikes

### Generative Design

This spike prepares the homepage for generative design by stabilizing the content and markup shape. The generative design branches can still radically change composition, palette, typography, spacing, and supporting SFC markup. This spike should not pre-decide those visual directions.

### Side Projects

The Side Projects page is owned by a separate spike. This homepage spike should only decide how the homepage points toward Side Projects, not the full Side Projects page model.

### Copy Cleanup

The copy cleanup spike is complete. Remaining homepage copy placeholders should be treated as homepage-specific editorial/content-model questions rather than a separate global copy sweep.

### WCAG And SEO

Accessibility and SEO should be considered while refining the homepage, but a broader WCAG/SEO spike can still follow. Do not knowingly introduce inaccessible patterns and leave them for later.

## Non-Goals

- Do not redesign the site visually for the final generative direction.
- Do not turn the homepage into a generic page-builder system.
- Do not couple homepage markup to Side Projects, Writing, or About just for superficial DRYness.
- Do not rebuild the card/list architecture unless the homepage has a concrete problem with it.
- Do not add CMS fields speculatively.
- Do not change the public navigation model unless a homepage-specific issue demands it.
- Do not disturb the static deploy pipeline unless homepage changes reveal a real static-generation bug.
