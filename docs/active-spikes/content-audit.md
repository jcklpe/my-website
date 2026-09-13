# Content Audit
Promoted 2026-09-12: decide what portfolio content should remain public, then repair the retained material's structure, formatting, accessibility, and search metadata. This spike is partly user-owned editorial work and partly agent-supported inventory, implementation, and QA.

Continues from: docs/active-spikes/wcag-seo2.md

## Why This Exists
The accessibility audit found meaningful images with empty alternatives, but writing descriptions before deciding which case studies survive would spend effort on content that may be dropped. The current site also contains formatting damage from Medium and Notion migrations. These are editorial lifecycle questions rather than renderer defects, so they need a visible home that future agents can discover without bloating the WCAG spike.

Google Drive `LifeOS/writing/current-drafts/case-studies/` contains source folders for USCIS, VA Research, Deep Dimension, Lodestone, LifeOS, Travis County, and Job Corps. Its `drafts/` folder currently contains working files for Travis County, Job Corps, VA Research, and LifeOS. These drafts and source folders are research context; WordPress remains the public CMS, and no Drive draft becomes canonical merely because an LLM helped produce it.

## Scope And Sequence
Start with an inventory that maps every public Page, writing post, and case study to its CMS record, public route, source provenance, and any corresponding Drive material. Give each case study an explicit retain, rework, remove/unpublish, or undecided disposition before substantial copy repair or alt-text drafting.

For retained content, audit migrated structure and presentation: headings, paragraphs and line breaks, lists, quotes, links, captions, image ordering, embeds, tables, footnotes, and accidental duplication or loss. Then address factual copy, image alternatives, captions/transcripts, SEO descriptions, and deliberate external canonicals. Preserve authored voice and verifiable claims; do not mass-rewrite portfolio narratives or infer project outcomes from screenshots.

The user owns retention choices, factual claims, substantive narrative revisions, and descriptions whose meaning depends on personal/project knowledge. Agents may build inventories, compare sources, identify import damage, propose bounded edits, implement approved CMS/source changes, verify frontend rendering, and maintain the work record. Do not edit WordPress or Drive content without the authority required for that specific write.

## Completion Boundary
Complete when every currently public content route has an explicit disposition; retained content has no untracked migration damage; retained informative media has appropriate alternatives or a documented owner/action; headings, links, captions/transcripts, and SEO fields meet the authoring contract; and removed candidates are no longer represented as finished public work. Record remaining deliberate exceptions and user-owned revisions rather than calling unfinished editorial work complete.

This spike does not own frontend component accessibility defects, deployment status, broad visual redesign, performance optimization, or speculative new content. Route renderer and metadata plumbing remain in WCAG/SEO; this spike supplies and verifies the editorial values that those systems carry.
