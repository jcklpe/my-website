---
attention: live
---
# Project Workflows adoption
Replace the seven copied workflow entrypoints with the complete Project Workflows collection on `project/my-website`, while keeping this website's document locations, site rules, publishing workflow, and existing notes. The website repository and the workflow child keep separate branches and commits.

## Reconciled baseline
The comparison started at website commit `cb62810`. There is no assumed shared Git ancestry between those copied folders and the workflow collection. This is a manually reconciled adoption, not a merge of their unrelated repository histories.

| Existing copy | Adopted owner | Reconciliation |
| --- | --- | --- |
| `run-project-spike` | `run-project-spike` | Retain the concept/task pair, closure approval, implementation history, and local document paths; use shared target resolution and bounded-workstream definition. |
| `commit-work` | `commit-work` | Old body differs only in source precedence; retain its scoping and review rules, with this project's commit authority in AGENTS. |
| `triage-project-misc` | `triage-project-misc` | Retain inbox routing and local conventions; replace outdated mini-proposal/list defaults with small subject capture. |
| `pin-issue`, `log-future-idea` | `capture-for-later` | Retire competing definitions and reconcile client metadata. The pilot preserved the lists; a separately approved follow-up moved their remaining subjects into individual notes. |
| `setup-project-docs` | `setup-project-workflows` | Existing ignore asset is byte-identical to the shared template and remains available there; do not overwrite this site's actual ignores. |
| `update-local-skills` | `update-project-workflows` | Preserve comparison/local-divergence intent, reconcile client metadata, and use ancestry-aware collection updates from this baseline onward. |

The pilot initially retained publishing in `skills/`. A later approved cleanup consolidated its useful operator guidance into README and removed the now-empty skills directory; executable publishing behavior is unchanged. The pilot initially retained a general skill-copying guide, then the approved follow-up removed that redundant entrypoint after checking callers and its complete folder. Its minimal optional-skill safeguards now live in AGENTS; no replacement installer skill is needed. The initial pilot changed only the maintained triage-skill path in an existing scratch note. A later authorized follow-up replaced the old registers with individual captured/parked notes, preserving remaining subjects and their context. Other notes and archive history remain unchanged.

## Local configuration and limits
The child uses the shared upstream URL with project-specific metadata and client metadata for capture and updates. The shared capture metadata already covers the old resource; only the updater metadata needs a project addition. The existing document destinations need no change. Website validation/build rules remain in AGENTS and publishing guidance lives in [README](../../README.md#static-publishing); no application code, CMS data, credentials, or deployment settings change here.

## Publication and retrieval verification — 2026-11-02
The website workflow adaptation is published on `project/my-website` at `5af9c030b0bd7511a6baefa25215cf98e21380ec`. The website's agent-policy closure checkpoint is published on `main` at `af33e69b3e8104d07ddf642cc2b6e7286a9a9d17` and records that exact child pin. The user explicitly authorized this publication during the agent-policy migration closeout. Outgoing ranges were reviewed before the workflow branch was pushed ahead of the website; original commits and unrelated project settings are retained. This publication changes no upstream `main`, other consumer branch or website deployment.

Exact remote-ref readback and a fresh recursive GitHub clone verify both revisions. The clone has the six adopted project-owned policies, the historical migration pair in `docs/archive/`, one `docs/agent-policies/` destination and no unused legacy policy locator. The selected policy checker passes in the clone. No dependency installation, application build or deployment was required; ordinary client discovery/compliance remains a separate observation under [the current work index](../../TODO.md#next).

This completes the website-specific publication and recursive-retrieval checks. The existing adoption spike remains live until its own closure is authorized; the closed agent-policy migration remains preserved in its [archive](../archive/agent-policy-migration.md).
