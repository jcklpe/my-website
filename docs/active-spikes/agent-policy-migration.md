---
attention: live
reviewed: 2026-11-02
---
# Agent policy migration — Website
Opened 2026-11-02. Stable slug: `agent-policy-migration`. [Tasks](agent-policy-migration.todo.md). This bounded receiving migration covers workflow-source delivery and project-owned agent-policy guidance. Website content, runtime behavior, deployment and external systems remain outside scope.

## Ownership and current state
Preparation snapshot: repository `https://github.com/jcklpe/my-website.git`; parent branch `main` at `45a796860df87b0c6531a420d1412e53fe7e77b1`. Selected child `project-workflows/` is `project/my-website` at `e80f923007153c404ea9bf57db38d7901798efb6`, clean at inspection, with the same recorded parent gitlink. Recheck this snapshot before acting; it is not a lock or a claim the checkout stays clean.

The legacy `docs/policies/` directory is empty. Before this receiving work, neither policy directory had tracked history in this repository. The prior policies-migration work is complete and waiting for closure. Existing engineering, content, publication and styling obligations retain their owners in AGENTS, README, docs/code-style.md and other durable docs; selected agent obligations have exact proposed copies below.

Current policy inventory:
- Six project-owned proposals in [the policy index](../agent-policies/policy.index.md): three kernel and three operational policies. None is adopted. No legacy files or IDs require retirement.

Related owners: [policies migration](policies-migration.md); [project workflows adoption](project-workflows-adoption.md). Those completed/adoption/design scopes retain their own remaining QA and closure decisions; this new receiving phase does not reopen or silently close them. Central coordination lives in Project Workflows, `docs/active-spikes/agent-policy-rollout.md` (prepared locally, not published). [Project instructions](../../AGENTS.md) remain authoritative.

## Project boundaries
Do not deploy, edit WordPress content, install dependencies, change design or extract every engineering guideline into a new policy. Preserve public/static publishing and recovery authorization, current runtime and styling conventions. The old completed migration is provenance, not an open implementation backlog to reopen or close automatically.

AGENTS allows local commits when explicitly requested or called for at a repo-local spike completion boundary; follow its current Commit Work and review holds. No deployment or push.

Keep secrets, private account/consent chronology, participant/course/meeting content and personal workspace paths out of public artifacts. Preserve actual private sources with their private owner before removal; public-safe sanitized originals alone are eligible for public retirement records. No service call, grant expansion, installation or browser fallback is authorized by this handoff.

## Target and decision boundary
Target the complete Project Workflows provider commit `79dddf9742c282d184c65d5c5ef87a142900897f`, not a moving main or the Agent Hands adaptation. This version provides create-agent-policy, edit-agent-policy, review-agent-policies, adopt-agent-policies and retire-agent-policy, with one shared format/checker/template implementation. The source and pilot commits are local-only at preparation; remote retrieval is not established.

The user authorized completing this receiving migration with the deterministic updater and policy-management skills, preserving site behavior and existing work, and asking for any missing adoption/commit approval. That launch does not adopt unseen obligations or turn arbitrary quoted text, a saved proposal or a package update into adoption. Present the exact candidate set and rely on an actual human decision covering the kernel and substantive changes before marking adopted. Already-given relevant approval need not be requested again. Retain operative bodies while amendments are proposals; missing approval is a specific pending gate, not a reason to invent completion.

## Migration shape
Use YAML `---` frontmatter and meaningful verb–noun mnemonic IDs. Kernel policies use `type: kernel` and `_` before their unchanged IDs in filenames; ordinary agent obligations use `type: operational` without that prefix. Types, filenames and IDs confer no rank. Review prerequisites/related references for meaning, missing or inactive prerequisites, cycles and dependent impact; never infer edges from numeric order or settle contradictions by file order. Route AGENTS to the project-owned policy.index.md. Align documents.agent_policies and any legacy locator deliberately: keep separate human/design governance destinations where they remain meaningful, rather than mechanically pointing both keys at one folder.

Preserve original sanitized content, useful rationale and reserved legacy identities before recoverable removal. A human-owned index section may link retired records outside the flat active graph; it is not a live alias/supersedes chain. Never restore earlier private Git content just to preserve history. Remove an old directory only after every file has a reviewed current/historical owner, incoming live links are repaired and no unrelated/new concurrent file remains. Keep procedures with their actual skills and actual enforcement links honest; no policy edit changes a guard, grant or service permission.

## Verification and completion
Completion requires a reviewed old/new obligation mapping (or an explicit justified no-legacy-policy finding), recorded adoption decision or explicit human disposition, coherent actual routing/configuration, current index, valid graph/selected prerequisite closures, preserved sources and repaired links. Check actual files after application, repeat index generation and updater preview for no-op, and report exact child working/index/committed pins separately from parent pins. Run the selected tool with an existing Python 3.11+ and existing safe PyYAML or Ruby/Psych; do not install packages/environments for optional validation. If unavailable, report manual checks and the unrun graph tool honestly; do not certify an unchecked graph. Relevant provider tests are available under review-agent-policies/tests and update-project-workflows/tests; run focused suites for any actual provider defect fix, without adding prose-mirroring tests or running application builds for a docs-only change.

Exercise the five skills on real applicable migration operations and record which operations were actually needed; do not invent policies or retirements merely to tick five boxes. Semantic/authority review is separate from structural success. Receiving migration can complete before ordinary-use/client acceptance; keep a concrete remaining QA owner rather than claiming service/client compliance or keeping an unlimited hidden migration task. Preserve original task wording when moving each item to Done, and use the local closure/commit procedure rather than assuming a saved handoff is already closed.

## Execution and review evidence — 2026-11-02
### Source delivery and retained state
The exact verified local provider object was imported without a persistent local-path remote or network publication. Deterministic preview accepted `79dddf9742c282d184c65d5c5ef87a142900897f`, reported ordinary `merge`, no focused procedure overlaps, no copied-asset changes and no baseline advancement. Applying the displayed merge message created child commit `d58c35daa317df8db4b976804c7963ad8f4adfa8` on `project/my-website`. Every original commit and pre-existing workflow TOML value is retained, including local coordination/tooling and `documents.policies = "docs/policies"`; the provider adds `documents.agent_policies = "docs/agent-policies"`. The website updater adaptation metadata is retained. Source and child delivery are local-only; remote retrievability is unverified.

The source/proposal checkpoint records child `d58c35daa317df8db4b976804c7963ad8f4adfa8` as the parent gitlink, following the child merge and verification of its clean index/tree. The pre-migration parent baseline is `45a796860df87b0c6531a420d1412e53fe7e77b1`, whose recorded child was `e80f923007153c404ea9bf57db38d7901798efb6`. Find this receiving checkpoint with `git log --grep='Spike: agent-policy-migration$'`; it preserves proposals and does not adopt them. The existing TODO handoff line and both previously untracked spike documents belong to this receiving work and are preserved through updates. No application, CMS, style, Docker, package, script or client-instruction files changed; no deployment or push occurred.

### Obligation and owner mapping
| Existing owner | Proposed owner | Meaning and continuity |
| --- | --- | --- |
| Selected provider candidate kernel | `ADOPT-POLICIES`, `PRESERVE-IDENTITY`, `RESOLVE-DEPENDENCIES` | New project-owned kernel proposals copied byte for byte from the exact provider source; initial adoption is pending. |
| AGENTS: How To Make Changes Safely, Tooling and Code Style, Documentation and Handoff | `PRESERVE-WORK` | Exact existing git-status, unrelated-formatting and TODO/user-note preservation obligations; no broadened editing permission. |
| AGENTS: Repository Guardrails and Local Reference Locations | `PROTECT-PRIVATE-ASSETS` | Exact credentials/assets exclusion and complete reference-location/privacy/provenance contract. Private inputs stay outside the public tree. |
| AGENTS: Canonical Workflow | `CONTROL-DELIVERY` | Exact commit-work route, explicit-request push boundary and existing Static Publishing route; only the relative Markdown link changes for its new directory. This task authorizes no push or deploy. |
| AGENTS, README, code style, design system, visual design and client adapters | Existing owners | Engineering, product, design, accessibility, runtime, editorial, validation and human-review guidance stays in place. Repeatable procedures remain with their selected skills. |
| Empty legacy policy directory and no tracked policy-file history | No retirement record | Zero legacy identities or sources require conversion, reservation or removal. The empty legacy/non-agent governance locator remains distinct. |

All selected original operational spans were compared against their proposals, allowing only removal of list markers and adjustment of the relative publishing link. Live AGENTS/README bodies are still unchanged while adoption is pending. A checked post-adoption routing patch replaces only those moved spans with policy links, identifies the project-owned index in AGENTS/README and lists the five delivered policy procedures. It retains inbound `#local-reference-locations` navigation and does not alter the site contract.

The three operational policies depend on `ADOPT-POLICIES` for their operative status and policy-maintenance authority. They have no invented dependencies on one another. Kernel edges retain their source meaning: identity maintenance requires adoption authority; dependency loading requires both adoption and identity rules. Related-reference cycles convey no prerequisite or precedence. Semantic review found no substantive change to the selected operational obligations or conflict with retained site guidance. The project-owned explicit-instruction push exception is retained, while this migration remains strictly no-push. Policy prose changes no actual guard, grant, hook or service permission.

### Executed verification and limits
Existing `/opt/homebrew` Python 3.13.2 and system Ruby/Psych 3.1.0 ran the selected shared checker through its safe-YAML fallback; PyYAML was absent and no dependency/environment was installed. The following commands were run from the website root with the existing Python 3.13 interpreter (substitute that interpreter for `python3` here):

```sh
python3 -B project-workflows/review-agent-policies/scripts/policies.py index --policies docs/agent-policies --write
python3 -B project-workflows/review-agent-policies/scripts/policies.py check --policies docs/agent-policies
python3 -B project-workflows/update-project-workflows/scripts/update.py update --project . --revision 79dddf9742c282d184c65d5c5ef87a142900897f --apply
```

The checker reports `valid: true`, `policy_count: 6`, valid YAML/IDs/types/filenames/index/local links and an acyclic complete proposed graph. The actual adopted load order is empty, correctly reflecting six proposals. A read-only in-memory conditional projection, without writing adopted metadata or manufacturing human authority, gives `ADOPT-POLICIES → CONTROL-DELIVERY → PRESERVE-IDENTITY → PRESERVE-WORK → PROTECT-PRIVATE-ASSETS → RESOLVE-DEPENDENCIES`. Each operational root's conditional closure is `ADOPT-POLICIES` then itself; the loading kernel root closes over `ADOPT-POLICIES`, `PRESERVE-IDENTITY`, `RESOLVE-DEPENDENCIES`. These are candidate checks; actual adopted root checks remain mandatory after approval.

All current policy/index links and the prepared AGENTS/README routing links pass the selected link checker. A repeated index `--write` reports `changed: false`, `written: false`; a repeated deterministic updater apply reports `mode: unchanged`, `changed: false`, with the same child HEAD and no assets/baselines changed. Root `git diff --check` passes. Application builds were not run for this documentation/workflow-only migration; no provider implementation changed. No fresh-client behavior, ordinary-task compliance, external URLs or remote clone has been verified.

All five task skills were inspected from the delivered collection. Create prepared the new project-owned candidate identities; Edit assessed the existing AGENTS obligation relocation and operative-body hold; Review covered semantics, graph and links; Adopt identified the exact pending human decision; Retire found no applicable identities and made no synthetic retirement. Initial kernel adoption, activation of the authorized operational relocation, final routing and the final adoption checkpoint remain pending. The source/proposal checkpoint preserves the reviewed candidates without activating them. The later ordinary-task QA owner is this receiving spike: during the next authorized website task, verify index/prerequisite discovery and retention of publishing/privacy guards without a service write solely for QA.

### Frozen proposal hashes
SHA-256 of the six reviewed proposal files (status is `proposed`, authority is empty):

- `CONTROL-DELIVERY-control-project-delivery.md`: `1c61039a9b4c7373de667960a8d323fad9fe8d4246b1aeeb3935ba75bfb34ffa`
- `PRESERVE-WORK-preserve-concurrent-edits.md`: `ea05e3ab74707706413e0c5c72819df10bc13d11667b6d92a77fa4923cb7a3e9`
- `PROTECT-PRIVATE-ASSETS-protect-private-assets.md`: `f3a2d9035fb41da188b20a14349f7e2aac3aa9fbf5df2113ad05be16afdb0ece`
- `_ADOPT-POLICIES-require-explicit-adoption.md`: `b543bf2d50ef69efe7d788e6e01d05af6699746aded5804126b3ce7d4e8aadb0`
- `_PRESERVE-IDENTITY-retain-meaning-and-history.md`: `d6f5a481719bd89d2c725c62b7d0dbfdaa594c22d697b5ed6db2a2e918e8e414`
- `_RESOLVE-DEPENDENCIES-load-prerequisites-once.md`: `3a338b416b63e260ed48abae017e2eba31295ab93f3722eee380ddc80e451c86`

## Deterministic delivery route
Read the selected [update procedure](../../project-workflows/update-project-workflows/SKILL.md), actual AGENTS and workflow.toml first. The target object was not present in this child at preparation. Obtain it through an authorized source route before preview. If using the user-designated canonical local provider, verify its repository/commit, then a bounded local `git -C project-workflows fetch --no-tags "$policy_source_checkout" 79dddf9742c282d184c65d5c5ef87a142900897f` imports Git objects without publishing or moving the working branch. Resolve that task-specific variable from an actual supplied/discovered project source; do not guess a personal path or create a permanent local-path remote. If no authorized source is accessible, report the exact missing object/source instead of silently substituting older remote main or using a browser.

Use the reviewed helper at the selected provider revision if the older installed helper is insufficient. From this repository, the default preview after the object is available is:

```sh
python3 -B project-workflows/update-project-workflows/scripts/update.py update --project . --revision 79dddf9742c282d184c65d5c5ef87a142900897f
```

Read the returned accepted SHA, focused review paths and proposed merge before applying. Use that exact SHA with `--apply` only after the launch/adoption/commit scope permits the operation; a divergent merge also needs the exact reviewed `--message` and only specifically reviewed `--reviewed` paths. Preserve every existing project/coordination/tooling value and copied-asset baseline. No reset, stash, arbitrary baseline fabrication or overwrite resolves a dirty/conflicting child. The updater supplies source, not adoption. After delivery load the five selected new policy skills; perform actual policy preparation/review/adoption separately. Keep child commits before the exact parent pin; a containing repository’s pin needs its own authorized owner. Nothing here authorizes a push or proves a fresh clone can retrieve local commits.
