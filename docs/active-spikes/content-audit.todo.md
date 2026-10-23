# Content Audit — Tasks
## Background
Inventory and repair the content that will remain in the public portfolio. Conceptual scope: `docs/active-spikes/content-audit.md`. This work continues the editorial findings separated from `docs/archive/wcag-seo2.todo.md`.
## General Principles
- Decide whether a case study remains before spending time polishing its copy, formatting, or image alternatives.
- Treat WordPress as the public CMS and Drive drafts as research context until the user approves a source or change.
- Preserve factual accuracy and authored voice. Never invent project outcomes, image meaning, quotations, dates, roles, or accessibility descriptions.
- Keep user-owned editorial decisions visible without representing them as agent-blocking technical failures.
- Keep deployment and production status outside this spike.
## Current State Overview
Promoted 2026-09-12 after WCAG/SEO discovery found empty image alternatives in public case-study and Side Projects content. The user also identified known formatting errors from Medium and Notion imports and reported that at least some case studies may be removed. A read-only Drive inventory found case-study source folders for USCIS, VA Research, Deep Dimension, Lodestone, LifeOS, Travis County, and Job Corps, plus working draft files for Travis County, Job Corps, VA Research, and LifeOS. The broader CMS-to-source inventory remains open; the 2026-10-22 import maps the four selected redrafts and adds separate CMS drafts without replacing the originals. On 2026-09-13 the user explicitly approved a bounded exception to retention-first sequencing for the known USCIS and Side Projects alternatives; that batch is complete and recorded below.

Someday content additions are captured separately in [website content ideas](../scratch/website-content-ideas.md).

## To Do
- C11. Settle Home’s Side Projects heading and About copy in chat before CMS implementation. [Shared; wording unapproved; discussion reopened 2026-10-19.] Discussion and draft wording are in the [ignored local reference; `references/content-audit/about-side-projects-copy-review-2026-10-18.md`](../../AGENTS.md#external-reference-locations). No CMS edits until final wording is agreed.
- C12. Revisit Side Projects content scope after the heading. [Shared exploration, 2026-10-18.] Choices remain unresolved; context is in the same ignored local reference. No route or content-model restructuring selected.
- C1. Build the content inventory and provenance map. [Agent]
  - C1a. List every public Page, writing post, and case study with its CMS identifier, route, publication state, canonical ownership, and last meaningful review date when available.
  - C1b. Map case studies to the relevant Drive draft/source folder without copying the Drive corpus into the repository. Mark missing, competing, or ambiguous sources.
  - C1c. Record visible migration symptoms and editorial accessibility gaps by route, without drafting repairs yet.
- C2. Decide the portfolio disposition for every case study. [User, agent-supported]
  - C2a. Present a compact retain, rework, remove/unpublish, or undecided slate with enough evidence for the user to decide.
  - C2b. Record sequencing and dependencies for retained/reworked studies. Keep undecided studies visible and avoid polishing them prematurely.
  - C2c. Carry removal/unpublishing choices into an explicit CMS change batch for separate review before execution.
- C3. Repair site Pages and Side Projects content. [Shared]
  - C3a. Review Home, About, Now, and Side Projects for imported formatting damage, stale copy, broken/ambiguous links, heading structure, image purpose, and SEO descriptions.
  - C3b. Prepare bounded proposed edits; have the user settle factual or voice-sensitive changes; implement authorized CMS edits and verify their frontend rendering.
  - Initial CMS inspection found an apparently duplicated Neural Network section/content on Side Projects. Preserve it until C3 review confirms the intended copy; do not fold that editorial change into the approved alt-text batch.
- C4. Repair retained writing posts. [Shared]
  - C4a. Identify Medium migration artifacts in headings, paragraphs, lists, quotes, images, captions, links, embeds, code, tables, and footnotes.
  - C4b. Confirm external-canonical ownership for genuine cross-posts and remove stale overrides only through an approved CMS batch.
  - C4c. Verify retained posts in the frontend after repair, including TOC, sidenotes/footnotes, media, and narrow reflow.
- C5. Rework retained case studies. [User, agent-supported]
  - C5a. Compare the public CMS version with the selected Drive material and source evidence. Identify factual conflicts, unsupported claims, missing context, and obsolete sections.
  - C5b. Track substantive narrative revisions as user-owned work; support research, comparison, structural proposals, and bounded copy edits when requested.
  - C5c. Implement approved final content in WordPress and verify block rendering without flattening the structured Gutenberg model.
- C6. Complete editorial accessibility for retained content. [Shared]
  - C6a. Classify each image as informative, functional, text-bearing, complex, or decorative before writing an alternative. Prioritize retained case studies and Side Projects.
  - C6b. Have the user provide or approve factual descriptions where project knowledge is required; use empty alt only for images that are actually decorative in context.
  - C6c. Resolve descriptive link text, captions, transcripts, table headings, iframe titles, and any content-level heading problems found during the inventory.
  - C6c finding: public writing routes use repeated provider-generic iframe titles rather than content-specific names. Current samples include 11 frames on “A Brief Review of Quill VR,” two duplicate YouTube titles on “How Artists Can Use Neural Networks to Make Art,” and five repeated YouTube/Sketchfab titles on “What I've Learned Sculpting in Virtual Reality.” Resolve these from content knowledge; opaque provider IDs are not meaningful substitutes. The QA fixture also contains five native videos without detected caption tracks. Treat those as fixture/editorial limitations and do not invent captions.
- C7. Complete retained content SEO fields. [Shared]
  - C7a. Review page/post/case-study titles and descriptions for accuracy, uniqueness, useful length, and consistency with the visible content.
  - C7b. Verify deliberate external canonicals and social-preview image/content choices without inventing richer schema or ranking claims.
- C8. Perform final editorial and rendered-content QA. [Shared]
  - C8a. Re-read retained content for voice, factual accuracy, repetition, abrupt migration seams, and dead links.
  - C8b. Verify representative desktop and phone rendering, keyboard reading order, image alternatives, captions/media, headings, links, and metadata.
  - C8c. Record any remaining intentional omissions, third-party limitations, or user-owned revisions and route reusable authoring rules into durable documentation.
## Ready For Human QA
- C13. Add four case-study redrafts and the two latest Medium articles to the local public CMS, preserving all originals. [Agent; authorized 2026-10-22.] Create review drafts for Job Corps, Travis County, ResearchOps HackPack, and LifeOS; import Building Enzo and The Deciding Part with editable code, media, captions, footnotes, and external canonicals. Verify source fidelity, block/API structure, media, and original-record preservation. Back up without pruning before writes. **Implemented 2026-10-22:** six new review drafts created (case studies 1026–1029; posts 1030–1031). Job Corps and Travis County reuse ten existing images and two prototype videos; ResearchOps adds its source workflow diagram, including a full-resolution lightbox link. LifeOS remains text-only, with three narrow corrections to obsolete permission/timing statements. Eleven imported media attachments carry alternatives. The articles retain published prose order, captions, four native footnotes, original dates, and Medium canonicals; nine distinct code screenshots become ten native code-block occurrences, plus the existing JavaScript example. Six Enzo blocks and five other-language blocks are editable and highlight with the frontend grammar. Tracking pixels and Medium’s syndicated footer are excluded. Exact saved-content/field readback, structured GraphQL rendering, source-fidelity checks, 24 successful media responses, and preservation hashes for all 27 pre-existing pages/posts/case studies pass. Backup: ignored `.backups/cms/content/2026-10-23T041651Z/`, without pruning. Private evidence and editorial notes: `references/content-audit/import-2026-10-22/` via the external reference pointer. Human review remains for wording, layout, and publication; no browser visual check or production deploy is claimed.

| New draft | CMS ID | Type |
| --- | --- | --- |
| Website Redesign for Job Corps | 1026 | Case study |
| Design Operations at Travis County | 1027 | Case study |
| ResearchOps HackPack | 1028 | Case study |
| LifeOS | 1029 | Case study |
| Building Enzo | 1030 | Writing post |
| The Deciding Part: what can’t be automated | 1031 | Writing post |

- C10. Replace the construction notice with the user's exact copy and offer a direct résumé download. [Implemented 2026-10-17; visual review pending.] The notice now says **Under construction:** followed by `always improving...always making stuff...`, preserving casing and the line break. The homepage résumé link is changed in the local public CMS from the Drive folder to `/downloads/aslan-french-resume.pdf`; its action says Download and uses the article File block's shared 360ms arrow animation with a reduced-motion fallback. The existing Drive folder contains one matching PDF (28,939 bytes, modified 2026-08-13); `corepack pnpm sync:resume` refreshes the checked-in copy through the existing authenticated LifeOS Drive CLI and records source/hash metadata. Replacing the Drive file with another PDF of the same name is supported. Refresh is explicit and is not coupled to a build or deploy. Backup before the CMS link change: ignored `.backups/cms/content/2026-10-18T040655Z/`; no backups pruned. Review banner tone/layout and the homepage Download action on desktop and phone. Validation: code checks pass with the two existing About/Now `v-html` warnings. Chrome confirms exact case/copy, a bold heading, desktop/phone fit without horizontal overflow, a same-origin PDF response with the recorded hash, a real native download that leaves Home in place, animated hover, reduced-motion suppression, and no page errors. Refresh fixture checks cover replacement file IDs, idempotence, and preservation on all stated failures. Static inspection now catches missing `/downloads/` assets, and Bunny assigns PDFs `application/pdf`; fixture checks pass without any upload. The touched deploy-plan file already fails Prettier at HEAD; no unrelated formatting cleanup was made. The direct field update required flushing the existing GraphQL response cache before the homepage read the new URL. This is local work, not a production deploy.
- C9. Fill “Practice / Discipline” and “Engagement Context” for all current case studies using judgment grounded in their existing copy. [Agent implementation complete; copy tone awaits user review, 2026-10-17.] All five case studies in the local public CMS are published, and all ten fields were empty. Read each narrative, backed up the CMS without pruning, wrote the ACF fields, and verified exact readback plus frontend card payloads. WordPress remains canonical; this is local publishable content, not a production deploy. No narrative or disposition changes were made. Travis County's label describes prototyping rather than implying the unfunded application shipped. Job Corps' practice reflects its explicit brand/positioning and information architecture scope rather than implying unrestricted user research.

| Case study / CMS ID | Practice / Discipline | Engagement Context |
| --- | --- | --- |
| USCIS / 262 | Design systems · Design operations | Cross-product alignment for federal appointment services |
| Travis County / 278 | Design operations · Prototyping | Shared application prototyping across county teams |
| Job Corps / 321 | Brand strategy · Information architecture | Federal job-training website redesign and Drupal migration |
| Deep Dimension VR / 364 | Brand identity · Visual systems | Foundational identity for a VR startup |
| Lodestone Social / 394 | Design systems · Motion design | Reusable client demos for sports and event marketing |

Backup: ignored `.backups/cms/content/2026-10-18T012556Z/` (UTC timestamp; performed October 17 in the user's timezone). Check the tone and fit of these labels on the Home cards.
## Done
- Approved USCIS and Side Projects alt-text batch — 2026-09-13. Backed up the public CMS, then wrote the approved alternatives to both Media Library attachment metadata and existing Gutenberg image instances so future rendering does not depend on a frontend patch. Updated 25 unique attachments and 25 inline occurrences across USCIS and Side Projects; the repeated Side Projects portrait accounts for two rendered instances. Generated public-CMS preview HTML exposes 19 informative USCIS alternatives plus two intentionally decorative loop-navigation images, and alternatives on all seven Side Projects image instances. Chromium confirmed unique accessible names on all 18 USCIS image-viewer controls. This completes this bounded image set, not C6 for the rest of the portfolio.
- Spike promoted from WCAG/SEO pass 2 on 2026-09-12 so retention decisions precede bulk alt-text and import-cleanup work.
- Refreshed and inspected the personal Drive index read-only. Confirmed the bounded case-study draft/source structure without copying Drive content into the repository or modifying external files.
