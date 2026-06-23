# About Page Spike

## Goal

The about page (`/about`) needs a content rewrite and possibly a structural rethink. The current page uses the standard standalone-page template with a page title and Gutenberg body content. The content itself is placeholder / thin. This spike covers both the content strategy (what should be there) and any structural/design changes needed to support it.

---

## What the page needs to do

The about page is the primary place a potential collaborator, employer, or client looks after seeing the work. It should:

1. Tell them who you are and what you do in 2–3 sentences (the headline register, not a full bio wall).
2. Give them a reason to care — the specific intersection of skills, interests, and approach that makes you distinctive.
3. Make it easy to get in touch — a contact email/link, social links, whatever's relevant.
4. Optionally: show a more personal side (photography, side interests, etc.) without being self-indulgent.

---

## Content areas to consider

### 1. Headline + short bio

Currently the about page likely has a title and a brief paragraph. Options:
- Keep the single-column article format but tighten the copy drastically.
- Add an ACF `display_heading` field (like Side Projects / Contact pages have) so the public `<h1>` can be more expressive than the CMS admin title.

### 2. Skills / Capabilities list

Not a full résumé. More like 5–8 things, stated concisely. Could be a simple typeset list, or a grid of small callout items. Design question: does a skills list feel right, or is it too résumé-like for the register of this site?

### 3. Photography

You have photography work. If it's relevant to the personal/creative side of the portfolio, a grid of 4–8 photos on the about page could make the page feel more alive than pure text. Options:
- A simple image gallery using standard Gutenberg Image or Gallery blocks.
- A custom ACF image gallery field if you want fine-grained editorial control over which photos appear.

### 4. Contact / social

A contact email and links to relevant social profiles (GitHub, LinkedIn, etc.). Currently the footer probably has some of this. On the about page, consider a dedicated "Get in touch" section.
- Simple approach: a paragraph with mailto link + social links as styled anchors.
- More structured: a small contact card or list using an ACF field group.

### 5. Work history (optional)

Not a full résumé. Maybe a timeline or a very short list of key roles/engagements, if that adds useful context for the kind of work you take on. Could also live entirely off-page (PDF download, LinkedIn) rather than cluttering the about page.

---

## Structural / design options

### Option A: Single-column article (current shape, improved content)

The existing standalone-page template renders Gutenberg body content through the `BlockRenderer`. Improved copy + more intentional block layout (two-column columns blocks, an image grid) could make the page work without structural changes.

Effort: low. Content-first — the design reveals itself through intentional block authoring.

### Option B: Two-zone layout

A common pattern for personal portfolio about pages: a left column with a portrait / bio blurb, and a right column or lower area with more detailed content (skills, timeline, contact). This would need either:
- A CSS two-column layout applied to the about page body (via the standard Gutenberg Columns block).
- Or a new page template with an explicit two-zone layout, and ACF fields for the structured left-column content (photo, short bio).

### Option C: ACF-backed structured layout (most control, most work)

An ACF field group for the about page with fields for: display heading, bio paragraph, portrait photo, skills list, contact links. The Nuxt frontend renders these from structured data rather than Gutenberg blocks.

Pros: precise layout control, no Gutenberg wrangling. Cons: same effort as building a mini-CMS page builder. Reserve for if the Gutenberg-block approach proves too rigid.

---

## Design questions for later

Once content is drafted, revisit:

- Does the page need the same article-column width (`--article-column`, 70ch), or is a different measure more appropriate?
- Does the typography register match the writing? (The about page probably reads more conversational than a case study.)
- Should there be a hero image / portrait at the top? The current system has no portrait on the about page.
- How does the about page relate visually to the case study detail pages — different enough to feel like a different content type, but coherent?

---

## Files to look at

- `apps/frontend/pages/about.vue` (or wherever the about route lives) — current page template
- `apps/cms/wp-content/plugins/project-bootstrap/project-bootstrap.php` — ACF field group registrations, if adding about-page-specific fields
- `apps/frontend/composables/useWordPress.ts` — `queryWordPressPageByUri('/about/')` for data fetching
- `packages/styles/shared-components/` — any block recipes needed for new content
- `docs/design-system.md` — for typography, layout, and color guidance

---

## Next steps

1. Draft the content (copy only) first — outside the code, in a doc or scratch pad.
2. Evaluate whether standard Gutenberg blocks can express it, or if structure/template work is needed.
3. Implement and test at multiple breakpoints (phone-first — the about page is often read on mobile after finding the portfolio link on social).
