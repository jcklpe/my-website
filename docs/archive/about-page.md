# About Page Spike

## Status: closed / archived (2026-06-30)

The core of this spike — the self-presentation strategy and the about-me prose —
was worked through by the user directly with a chatbot outside this codebase
context. The resulting copy (headline "I make things carefully, and ask why.",
the bio prose, contact lines, and a floated portrait) is now authored in the
public CMS and live on `/about`.

This spike is therefore closed and archived. The messaging/positioning work is
done for now; it may warrant revisiting later (tone, timeline, further editing),
but there is no open implementation work owned here. Layout/structure fixes that
came up while the content landed (Now section, floated-portrait mat override,
heading alignment) were handled under the Now Page spike and general About-page
styling, not here.

The remainder of this doc is the pre-work planning kept for historical context.

## Goal

The about page (`/about`) needs a real content strategy and a prose rewrite. The
current page is placeholder/thin. The hard part of this spike is **not**
structure or design — it is figuring out how to present myself, and then writing
the prose that does it. Structure follows once the content and register are
settled.

This is primarily a writing/positioning problem, secondarily a layout problem.

---

## Register and positioning

The about page is where a potential collaborator, employer, or client lands
after seeing the work. It should introduce me as a **senior practitioner and a
serious, highly-educated thinker** — a researcher, potentially a PhD candidate —
not as a junior listing the frameworks they know.

Things this implies:

- **No skills list.** I'm senior. Skills belong on a résumé, not on the about
  page. Listing frameworks reads as junior and undercuts the register.
- The voice should read like a real professional with depth: someone with a
  point of view, an intellectual through-line, and a way of thinking — not a
  feature list of capabilities.
- The challenge is doing this without being self-indulgent or pompous. Confident
  and substantive, not a bio wall.

---

## The actual work

### 1. Self-presentation strategy (the core problem)

Before any prose: decide how I want to be perceived and what the through-line is.

- What is the intellectual/professional identity I'm leading with? (Researcher,
  designer-engineer, someone whose work sits at a specific intersection.)
- What's the one impression a reader should leave with?
- How much of the "researcher / potential PhD candidate" framing is forward-
  looking aspiration vs. current reality, and how do I present that honestly
  without underselling?

### 2. About-me prose (the deliverable)

The headline + bio copy itself. This is the main thing to get right. Tight,
substantive, in a voice that matches the writing on the rest of the site
(conversational but serious). Draft outside of code first.

### 3. Timeline (maybe)

A timeline of roles/work/education could add useful context and reinforce the
"serious, with a real trajectory" framing. Caveat: the actual timeline is
currently weak/uneven, so this needs honest thought about whether a timeline
helps or exposes a gap. Open question, not a commitment.

### 4. Contact / get in touch

A clear way to reach me (email, relevant professional links). Low-complexity;
not the hard part. Footer may already cover some of this — decide whether the
about page needs its own dedicated contact moment.

---

## Explicitly out of scope

- **Photography / personal image grids.** Not part of this page.
- **Skills / capabilities list.** Senior; skills live on the résumé.
- **Full work-history résumé.** If history appears at all it's the lightweight
  timeline above, or it lives off-page (résumé/LinkedIn).

---

## Structure / design (decide after content)

Structure is a downstream decision. Once the copy exists, evaluate whether the
existing standalone-page template (single-column Gutenberg body) can express it,
or whether the content wants a more deliberate layout.

- The current standalone-page template renders Gutenberg body content through
  `BlockRenderer`. For tight prose + an optional timeline, this may be enough.
- An ACF `display_heading` field (as other standalone pages use) would let the
  public `<h1>` be more expressive than the CMS admin title.
- Only reach for a custom template / ACF-structured layout if the prose and
  timeline genuinely can't be expressed in well-authored blocks. Default to the
  lower-effort path.

Design questions to revisit once content is drafted:

- Does the about page want the same `--article-column` (70ch) measure, or
  something different given it reads more conversational than a case study?
- Does the typography register match the writing voice?
- How does it relate visually to case study detail pages — coherent but clearly
  a different content type?

(Brand-voice notes for this page live in `brand-voice.md` under "About page";
remove the placeholder there once this spike becomes active design work.)

---

## Files to look at (when implementation starts)

- `apps/frontend/pages/about.vue` (or wherever the about route lives)
- `apps/cms/wp-content/plugins/project-bootstrap/project-bootstrap.php` — ACF
  field registrations, only if adding about-page-specific fields
- `apps/frontend/composables/useWordPress.ts` —
  `queryWordPressPageByUri('/about/')`
- `docs/design-system.md` — typography, layout, color guidance

---

## Next steps

1. Work out the **positioning/strategy** first (likely a conversation with a
   chatbot agent — it's a thinking problem, not a code problem).
2. Draft the **about-me prose** (copy only, outside the code).
3. Decide whether a **timeline** earns its place.
4. Only then evaluate structure and implement.
