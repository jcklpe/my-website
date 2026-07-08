# Now Page Spike

## Status: closed / archived (2026-07-08)

This spike is complete. Human QA has signed off the implemented behavior,
durable lessons have been folded into stable docs, and the spike docs are ready
for archive.

A small spike for a public "now" concept (à la the nownownow.com convention): a
short, edited, public-facing statement of what I'm currently focused on. More
durable than a status update, less operational/private than any internal notes.
This is a public, *edited* Now — not a dump of internal docs.

Operational checklist: [now-page.todo.md](now-page.todo.md).

## Goals

- One canonical Now content source, rendered in two public places without manual
  duplication.
- A real `/now` route, so the page can be registered with the nownownow
  directory.
- A Now section inside the About page, where the content actually lives in
  context.

## Non-goals

- Not a new content system. Reuse the existing standalone-page ACF + WPGraphQL +
  Vue pattern.
- Not a dashboard or status feed. It is a small public field report.
- Not a surface of internal/private notes. It is hand-edited public copy.
- No new dependencies.

## Settled model and decisions

- **Canonical content = a `now_content` ACF field on the About page**, not a
  separate WordPress page. A whole second WP Page is heavier than needed for a
  paragraph or two, and "Now is a section of About" is the honest mental model.
  - **Why:** lowest friction, fewest moving parts in WP, and it matches how the
    About page already carries ACF display/SEO fields.
- **About is the canonical home.** It renders the *full* Now content inline in a
  `<section id="now">`.
- **`/now` is a thin mirror.** It renders the same Now content plus a link to
  `/about` for elaboration. Conceptually `/now` transcludes the About page's Now
  section. It fetches the About page (`queryWordPressPageByUri('/about')`) so it
  can read both `nowContent` and the portrait from a single source. (Originally
  planned as a scoped field query; superseded once `/now` also needed the
  portrait, which lives in the About body blocks.)
- **`/now` shows the same portrait as About**, "ripped" from the About body: the
  first `core/image` block. Avoids a duplicate upload / second ACF field.
- **`/now` hides the interior site nav** (`definePageMeta({ hideSiteNav: true })`,
  honored by the default layout). It reads as a standalone editorial page; the
  previous full nav was an unintended fall-through (see todo doc).
- **The `/now` → `/about` link uses the standard homepage CTA treatment**:
  `rich-link` plus an arrow `::after` that nudges on hover, matching
  `HomeVitalInfo`'s "More about me" and the writing-archive CTA (the arrow
  slit-slip family documented in `docs/scratch/animations.md`).
- **About renders the full Now content**, so no "read more → /now" link is needed
  from About. The relationship points the other way: `/now` → `/about`.
- **No advertised `/about#now` link**, but a free `id="now"` anchor on the About
  section (hash anchors already work here, cf. `#selected-work`). `/now` is the
  canonical permalink for the directory.
- **WYSIWYG field type**, so the copy can carry links and light emphasis;
  rendered as prose via `v-html`. Unlike the plain-text display fields, the Now
  HTML is *not* `stripHtml`'d.
- **Now depends on the About page existing and having data.** Accepted.
- **Footer "Now" link is author-managed** via the existing Site Settings footer
  ACF fields, not built in this spike. It still does double duty: quiet
  placement (not primary nav) *and* making `/now` crawlable for static gen.

## Design intent

- Align with the current site system; do not over-design.
- `/now` reads sparse and editorial. The About-page version feels like part of
  the About composition, separated by a quiet hairline.
- Preserve readable measure, heading hierarchy, anchor behaviour, accessibility.

## Constraints

Preserve existing: content model, GraphQL query shape (a small additive field +
scoped query is fine), block registry, route transition hooks, static deploy
scripts, Docker infra. CMS schema change is limited to one additive ACF field.

Note the public/QA CMS split: Now content must be authored in whichever CMS the
target frontend host reads (public host → public CMS). Real content belongs in
the public CMS per the content rules; QA is for fixtures/tests.

## Relationship to other spikes

- **About page** (`about-page.md`, scratch): the Now section lives on the About
  page; final placement/composition coordinates with that work. Brand-voice
  register for About proper lives there.
- Supersedes the "Now Page" note in `docs/scratch/future-ideas.md` (removed when
  this spike opened).
