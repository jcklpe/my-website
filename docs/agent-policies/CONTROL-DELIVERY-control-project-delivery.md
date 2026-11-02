---
id: CONTROL-DELIVERY
type: operational
scope: "Agent local commits, GitHub pushes and website publishing."
status: proposed
authority: ""
revised: "2026-11-02"
depends_on: ["ADOPT-POLICIES"]
related_to: []
---
# Control project delivery
Commit only through `project-workflows/commit-work/SKILL.md`, either when the user explicitly asks for a commit or when a repo-local spike workflow explicitly calls for a completion-boundary commit.

The user handles GitHub pushes by default; never push unless explicitly asked.

Follow [Static Publishing](../../README.md#static-publishing) for publish prerequisites, command selection, recovery decisions, and human QA.
