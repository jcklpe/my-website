# About Page

## Goal

Move `/about` from a hardcoded Nuxt page into a CMS-managed WordPress page without turning WordPress into a page builder.

The About page should become real authored content that can be edited in WordPress, previewed locally, statically generated, and used as a stable review surface for the upcoming generative design work.

## Why This Matters

The About page is an identity-heavy page. It is where the site explains the person, the practice, the work history, and the ways a visitor can move deeper into the portfolio.

That makes it important for generative design: a visual direction that only works on the homepage and article templates is not enough. It also needs to handle the page that says who this site belongs to.

The current page proves the route and layout idea, but the copy is hardcoded in Vue. That makes the page feel temporary and keeps copy cleanup tied to code changes.

## Conceptual Model

Use a normal WordPress Page as the source of truth.

The first-pass content model is Gutenberg-first, with one small structured
escape hatch for the public heading:

- The WordPress page title is the CMS/admin title. For About, this should be
  the plain label `About`.
- The `Display Heading` ACF field is the public-facing frontend `h1`. This
  lets the page carry a more expressive heading without making the WordPress
  Pages list awkward to scan.
- The Gutenberg body is the main narrative content.
- Core blocks should handle normal prose, headings, lists, buttons, quotes, media, and simple grouped sections.
- Existing frontend block rendering should render the page body through the same `BlockRenderer`/`BlockChildren` architecture used for posts and case studies.

Use ACF only where the content is genuinely structured and not well represented by normal Gutenberg blocks.

Likely ACF candidates, if needed:

- A short deck line if the display heading and first paragraph are not enough.
- A small set of curated links if they need consistent placement outside the body flow.
- A structured experience/timeline list if the page eventually needs consistent dates, organizations, roles, and descriptions.
- A contact/social link list if it should be reused or validated as structured data.

Do not add a broad ACF field set just because future About content might grow. Start with the smallest model that turns the page into authored CMS content and keeps the Vue route legible.

## Editorial Shape

The page should be able to carry:

- A clear self-introduction.
- A concise practice statement.
- Inline paths into Selected Work, Writing, and Side Projects when the prose calls for them.
- Optional history/experience detail.
- Optional contact/social links.

The first implementation does not need a full resume system. If employment history, skills, or contact links need more structure later, add that structure once the actual content makes the need obvious.

The old hardcoded link trio is not part of the enduring model. It was useful scaffolding, but About links should now be authored in the Gutenberg body as normal inline links or blocks.

## Layout Philosophy

The route can keep a more composed layout than a plain article. It does not have to look identical to a writing post.

However, the body content should still use the shared content-block system where possible. That keeps block styling, static generation, editor parity, and future design branches from having to solve a special About-only rendering path.

A good first pass is:

- Route-level shell/hero composition in `pages/about.vue`.
- CMS-managed display heading and Gutenberg body as data.
- Gutenberg body rendered in a normal content flow.
- Local scoped styles for About-specific composition.
- Shared component recipes for any reusable block styling.

## Frontend Contract

The frontend should:

- Query the WordPress page by URI or stable slug.
- Use the ACF display heading as the frontend `h1`, falling back to the page title if needed.
- Return a clear empty/error state if the page is missing.
- Preserve `/about` as the public route.
- Preserve existing links from Home and footer.
- Keep SEO metadata data-driven where practical.
- Keep static generation compatible.

The implementation should not introduce a client-only About page, hydration-dependent content loading, or a runtime dependency that breaks static output.

## CMS Contract

The WordPress editor should remain visible for the About page.

Unlike the Home page, About is not a purely structured settings surface. It is authored narrative content with optional structured support.

The CMS should be seeded or documented enough that local QA has a real About page to render. Generated Kitchen Sink test content belongs in the QA CMS, but the About page itself should model real public authored content.

## Relationship To Other Spikes

**Copy cleanup** can audit and improve language, but the About migration should first move the hardcoded page into a CMS-owned shape so the copy cleanup agent is not fighting code-owned prose.

**Homepage refinement** may adjust how Home links into About, but this spike should preserve the existing `/about` route and link target.

**Generative design** benefits from this spike because design branches can evaluate a real identity page rather than a hardcoded placeholder.

**Side Projects** may follow a similar Page + display heading + Gutenberg pattern. Do not overgeneralize from About until both pages reveal a shared need.

## Settled First-Pass Decisions

- Use WordPress page title as the admin/SEO-ish label.
- Use a small ACF `Display Heading` field for the frontend `h1`.
- Use Gutenberg body content for the narrative page body.
- Remove the hardcoded link trio from the enduring model. Links to other sections/pages should be authored in the Gutenberg body as normal links or blocks.
- Defer featured media.
- Defer structured experience/timeline fields until real content proves the need.
