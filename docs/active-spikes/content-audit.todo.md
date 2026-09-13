# Content Audit — Tasks
## Background
Inventory and repair the content that will remain in the public portfolio. Conceptual scope: `docs/active-spikes/content-audit.md`. This work continues the editorial findings separated from `docs/active-spikes/wcag-seo2.todo.md`.
## General Principles
- Decide whether a case study remains before spending time polishing its copy, formatting, or image alternatives.
- Treat WordPress as the public CMS and Drive drafts as research context until the user approves a source or change.
- Preserve factual accuracy and authored voice. Never invent project outcomes, image meaning, quotations, dates, roles, or accessibility descriptions.
- Keep user-owned editorial decisions visible without representing them as agent-blocking technical failures.
- Keep deployment and production status outside this spike.
## Current State Overview
Promoted 2026-09-12 after WCAG/SEO discovery found empty image alternatives in public case-study and Side Projects content. The user also identified known formatting errors from Medium and Notion imports and reported that at least some case studies may be removed. A read-only Drive inventory found case-study source folders for USCIS, VA Research, Deep Dimension, Lodestone, LifeOS, Travis County, and Job Corps, plus working draft files for Travis County, Job Corps, VA Research, and LifeOS. Public CMS content has not yet been mapped against those materials.
## To Do
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
- C7. Complete retained content SEO fields. [Shared]
  - C7a. Review page/post/case-study titles and descriptions for accuracy, uniqueness, useful length, and consistency with the visible content.
  - C7b. Verify deliberate external canonicals and social-preview image/content choices without inventing richer schema or ranking claims.
- C8. Perform final editorial and rendered-content QA. [Shared]
  - C8a. Re-read retained content for voice, factual accuracy, repetition, abrupt migration seams, and dead links.
  - C8b. Verify representative desktop and phone rendering, keyboard reading order, image alternatives, captions/media, headings, links, and metadata.
  - C8c. Record any remaining intentional omissions, third-party limitations, or user-owned revisions and route reusable authoring rules into durable documentation.
## Ready For Human QA
None currently awaiting review.
## Done
- Spike promoted from WCAG/SEO pass 2 on 2026-09-12 so retention decisions precede bulk alt-text and import-cleanup work.
- Refreshed and inspected the personal Drive index read-only. Confirmed the bounded case-study draft/source structure without copying Drive content into the repository or modifying external files.
