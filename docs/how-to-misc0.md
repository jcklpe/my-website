# How To Use `misc0`

`docs/scratch/misc0.md` is the project's live inbox for loose thoughts.

Use it for observations that are real enough to keep but too raw to classify
yet: small bugs noticed during another spike, taste reactions, possible features,
visual discomforts, "this should maybe be better someday" notes, and half-formed
clusters that have not earned a named spike doc.

`misc0` is not a roadmap, not an archive, and not a dumping ground that should
grow forever. It is an intake surface.

## Relationship To Spikes

The normal spike process is documented in [`how-to-spike.md`](how-to-spike.md).
That doc explains how focused work gets promoted into conceptual and to-do docs,
tracked through implementation and QA, and eventually archived.

This doc describes the earlier step: how loose notes become candidate spike
material.

The flow is:

1. A thought lands in `docs/scratch/misc0.md`.
2. Periodically, an agent reviews `misc0` alongside existing scratch docs.
3. Each item is deleted, moved, clustered into a thematic scratch doc, or swept
   into a numbered miscellaneous spike bucket.
4. Once a bucket becomes active implementation work, use `how-to-spike.md` to
   promote it into the two-doc active spike pattern.

## File Roles

- `docs/scratch/misc0.md` — live inbox for unrouted loose notes.
- `docs/scratch/misc1.md`, `misc2.md`, etc. — numbered miscellaneous spike
  buckets for real work that does not yet form a clean thematic spike.
- Thematic scratch docs such as `syntax-highlighting.md`, `brand-voice.md`, or
  `embed-media-support.md` — preferred destination when notes cluster around a
  coherent theme.
- Active spike docs in `docs/` — only after a scratch topic becomes the current
  implementation focus.
- Archived spike docs in `docs/archive/` — historical context after a spike is
  closed.

## What Belongs In `misc0`

Good `misc0` entries are specific enough to preserve the observation:

- a visual detail that feels off
- a bug seen while testing a different surface
- a potential feature without enough shape yet
- a design/taste reaction in the user's own phrasing
- a link or reference that might matter later
- a cluster seed that may become a spike after more related items appear

Bad `misc0` entries are so compressed they lose the point:

- "Improve homepage"
- "Fix mobile"
- "Make embeds better"
- "Polish stuff"

If a note starts vague, keep the user's concrete phrasing around it. The rambling
often contains the actual design constraint.

## Review Process

When asked to review `misc0`:

1. Read `docs/scratch/misc0.md` in full.
2. Read existing `docs/scratch/misc*.md` numbered buckets.
3. Read likely thematic scratch docs.
4. Search current active and archived spike docs if an item looks familiar.
5. Route each `misc0` item.
6. Preserve nuance when moving items.
7. Delete routed or addressed items from `misc0`.
8. Replace the "Latest Routing Session" section in `misc0` with a short summary
   of the current review only.

Do not keep an infinite routing history in `misc0`. The latest routing session
summary is a handoff, not an archive. The next review should replace it.

## Routing Outcomes

### Already Addressed

If an item has already been completed or captured in a durable doc, delete it
from `misc0`.

If the routing might be confusing later, mention it briefly in the latest routing
session summary.

### Existing Thematic Scratch Doc

If an item clearly belongs to an existing scratch spike, move it there.

Preserve:

- the user's concrete examples
- any uncertainty or alternatives
- references and URLs
- why the thing felt wrong or worth noticing
- visual/taste language, even if informal

Clean the prose enough to make the destination doc readable, but do not flatten
the item into a generic ticket.

### New Thematic Scratch Doc

If several items cluster around a clear theme, create a new scratch doc with a
descriptive name.

The new doc should usually include:

- goal
- current context
- scope
- files or systems likely involved
- open questions
- rough work items
- human QA surfaces, if visual or editorial judgement will matter

Do not create a full active spike todo yet unless the user is actually starting
that work.

### Numbered Miscellaneous Bucket

If an item is real but does not belong to an existing doc and does not cluster
into a thematic spike, sweep it into a numbered `misc#.md` bucket.

Use this when the work is small, mixed, or opportunistic. A numbered misc bucket
can become its own active spike later, like any other scratch doc.

## Reviewing Existing `misc#` Buckets

Every `misc0` review should also examine existing numbered `misc#` docs in
`docs/scratch/`.

Ask:

- Do any old misc items now cluster with the new `misc0` items?
- Has a grab-bag item gained a clearer thematic home?
- Should an item move from `misc#.md` into a named scratch spike?
- Has an item already been completed or superseded?

Numbered misc docs are temporary holding areas, not permanent junk drawers. If a
better theme emerges, move the item out.

## Preservation Rule

Do not over-compress `misc0` items while parting them out.

The user's loose phrasing may contain design signal: emotional reaction,
uncertainty, analogy, hierarchy of importance, or a concrete example that a
short task title would erase. Keep that texture in the destination doc.

The goal is not to preserve every typo or duplicate sentence. The goal is to
preserve meaning, taste, references, and the reason the note existed.

## `misc0` Template

Use this shape:

```md
# Misc 0 Inbox

Live inbox for loose observations. See `../how-to-misc0.md`.

## Unrouted Items

- ...

## Latest Routing Session

Reviewed YYYY-MM-DD.

- Moved ...
- Deleted ...
- Created ...
```

The "Latest Routing Session" section should be replaced on each review. It is
only the latest handoff.
