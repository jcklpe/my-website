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
| `pin-issue`, `log-future-idea` | `capture-for-later` | Retire competing definitions, preserve the actual note lists, and reconcile the existing client metadata under the new entrypoint. |
| `setup-project-docs` | `setup-project-workflows` | Existing ignore asset is byte-identical to the shared template and remains available there; do not overwrite this site's actual ignores. |
| `update-local-skills` | `update-project-workflows` | Preserve comparison/local-divergence intent, reconcile client metadata, and use ancestry-aware collection updates from this baseline onward. |

Other skills remain in `skills/`, including publishing. The pilot initially retained a general skill-copying guide, then the approved follow-up removed that redundant entrypoint after checking callers and its complete folder. Its minimal optional-skill safeguards now live in AGENTS; no replacement installer skill is needed. The only change to an existing scratch note is its maintained triage-skill path; idea/pin contents, other notes, and archive history are preserved.

## Local configuration and limits
The child uses the shared upstream URL with project-specific metadata and client metadata for capture and updates. The shared capture metadata already covers the old resource; only the updater metadata needs a project addition. The existing document destinations need no change. Website validation/build/deployment rules remain in AGENTS and the publishing runbook; no application code, CMS data, credentials, or deployment settings change here.

This is a local-only pilot. Publication is held pending security/privacy review of the proposed outgoing changes. The shared baseline and project adaptation have not been published by this work. The parent pin can record a local child commit but cannot make it retrievable from the recorded remote. Publish the reviewed shared revision and project branch before publishing a website commit that requires them; then verify a fresh recursive clone. No website deploy or remote publication is part of this spike's current authorization.
