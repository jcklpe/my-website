# How To Run A Spike

This project uses focused work spikes when a body of work needs more shared context than a normal ticket or one-off task can carry.

A spike is not just a checklist. It is a temporary collaboration space for the user and agents to build taste, vocabulary, decisions, and implementation history around a specific theme of work.

Loose observations often start earlier, in `docs/scratch/misc0.md`. Use
[`how-to-misc0.md`](how-to-misc0.md) for the intake process that periodically
clusters those notes into scratch spike docs or numbered miscellaneous buckets.
Use this document once a cluster is ready to become focused spike work.

## The Two Documents

Most active spikes use two docs:

- A **conceptual doc**, such as `docs/about-page.md`.
- A **to-do doc**, such as `docs/about-page.todo.md`.

The conceptual doc explains the work’s purpose, philosophy, boundaries, and settled model. It should help a new agent understand what kind of solution would be in character for the project.

The to-do doc tracks concrete implementation work. It should be operational: files, actions, QA notes, unresolved questions, and what has already happened.

## Conceptual Docs

Use the conceptual doc for:

- goals and non-goals
- project vocabulary
- content/design/engineering philosophy
- major decisions and why they were made
- relationship to other spikes
- constraints that should shape future work

Avoid turning the conceptual doc into a running changelog. When implementation details become durable project rules, fold them into longer-lived docs such as `README.md`, `AGENTS.md`, `docs/design-system.md`, `docs/code-style.md`, or another active reference doc.

## To-Do Docs

Use the to-do doc for:

- concrete atomic work items
- current state notes
- implementation progress
- commands and verification steps
- human QA requests
- known edge cases
- short historical notes that will help future agents reconstruct what happened

The to-do doc usually follows this rough structure:

- Background
- Project Organization
- General Principles
- Current State Overview
- To Do
- Ready for Human QA
- Done

Exact headings can flex when needed, but future agents should be able to find current work, QA work, and completed work quickly.

## Moving Work

Work starts in `To Do`.

When an agent finishes implementation but the user needs to visually or manually verify it, move the item to `Ready for Human QA`.

When the user confirms QA, move it to `Done`.

When implementation does not need human QA, move it directly to `Done` after verification.

`Done` is allowed to preserve useful history. It does not need to be a perfectly compressed final summary. These docs are archived at the end of the spike, and that archive can help future agents understand why the code ended up this way, even if the notes along the way used are messy are not totally current. We lean towards provided maximum chain of reasoning over time over creating nice neat compact compressed narratives. We do not sand off the rough corners of historical artefacts.

## Human QA

Use `Ready for Human QA` for things the agent cannot fully verify from the terminal:

- browser visual checks
- interaction feel
- CMS editor workflows
- copy tone
- mobile layout judgement
- static preview sanity checks when the user is already testing in-browser

Be specific. A good QA item names the surface, route, interaction, or visual state the user should inspect.

## Archiving A Spike

When a spike is finished:

1. Review the conceptual and to-do docs.
2. Fold durable lessons into long-lived docs.
3. Leave spike-local detail in the spike docs.
4. Move both spike docs to `docs/archive/`.

Archived spike docs are historical context. They may be out of date. Do not treat archived docs as current project rules unless a durable doc still says the same thing.

## Durable Lessons

Before archiving, ask:

- Did we add or rename commands? Update `README.md`.
- Did we change agent workflow? Update `AGENTS.md` or this doc.
- Did we change styling vocabulary? Update `docs/design-system.md`.
- Did we settle readability or implementation style? Update `docs/code-style.md`.
- Did we add a repeatable manual process? Add or update a dedicated runbook.
- Did we create future roadmap work? Update `to-do.md` or create a draft in `docs/scratch/`.
- You can ask more questions than just these too. For instance, stuff like `design-system.md` isn't just styling vocabulary, it's scope may change over time so always be questioning things at a broad conceptual level rather than getting overly narrow and just ticking the question mark checklist.

The archive keeps the texture. Durable docs keep the rule.
