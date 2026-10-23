# Content Audit
Promoted 2026-09-12: decide what portfolio content should remain public, then repair the retained material's structure, formatting, accessibility, and search metadata. This spike is partly user-owned editorial work and partly agent-supported inventory, implementation, and QA.

Continues from: docs/archive/wcag-seo2.md

## Why This Exists
The accessibility audit found meaningful images with empty alternatives, but writing descriptions before deciding which case studies survive would spend effort on content that may be dropped. The current site also contains formatting damage from Medium and Notion migrations. These are editorial lifecycle questions rather than renderer defects, so they need a visible home that future agents can discover without bloating the WCAG spike.

Google Drive `LifeOS/writing/current-drafts/case-studies/` contains source folders for USCIS, VA Research, Deep Dimension, Lodestone, LifeOS, Travis County, and Job Corps. Its `drafts/` folder currently contains working files for Travis County, Job Corps, VA Research, and LifeOS. These drafts and source folders are research context; WordPress remains the public CMS, and no Drive draft becomes canonical merely because an LLM helped produce it.

## Scope And Sequence
Start with an inventory that maps every public Page, writing post, and case study to its CMS record, public route, source provenance, and any corresponding Drive material. Give each case study an explicit retain, rework, remove/unpublish, or undecided disposition before substantial copy repair or alt-text drafting.

For retained content, audit migrated structure and presentation: headings, paragraphs and line breaks, lists, quotes, links, captions, image ordering, embeds, tables, footnotes, and accidental duplication or loss. Then address factual copy, image alternatives, captions/transcripts, SEO descriptions, and deliberate external canonicals. Preserve authored voice and verifiable claims; do not mass-rewrite portfolio narratives or infer project outcomes from screenshots.

The user owns retention choices, factual claims, substantive narrative revisions, and descriptions whose meaning depends on personal/project knowledge. Agents may build inventories, compare sources, identify import damage, propose bounded edits, implement approved CMS/source changes, verify frontend rendering, and maintain the work record. Do not edit WordPress or Drive content without the authority required for that specific write.

The user authorized a bounded metadata pass on 2026-10-17 before the wider retention review: summarize the existing case-study narratives into the Selected Work “Practice / Discipline” and “Engagement Context” fields. This does not settle retention or authorize narrative rewrites.

## Case-study redrafts and Medium imports — 2026-10-22
The user authorizes four additional case studies based on the Job Corps, Travis County, ResearchOps HackPack, and LifeOS redrafts, plus the two latest Medium articles. Preserve all original CMS entries and source files. Create review drafts with native Gutenberg structure, reuse matching case-study media, import article illustrations, and transcribe code screenshots into language-labeled code blocks. Preserve Medium canonical URLs, dates, captions, and footnotes. Correct demonstrably stale LifeOS permission claims without importing private operational details. The four case studies were initially published for local review, then rejected by the user and moved to WordPress Trash. The two Medium imports are now published locally. Any selective reuse of the rejected case-study material remains undecided. This bounded import does not settle portfolio disposition or approve unrelated About/Side Projects copy.

## Completion Boundary
Complete when every currently public content route has an explicit disposition; retained content has no untracked migration damage; retained informative media has appropriate alternatives or a documented owner/action; headings, links, captions/transcripts, and SEO fields meet the authoring contract; and removed candidates are no longer represented as finished public work. Record remaining deliberate exceptions and user-owned revisions rather than calling unfinished editorial work complete.

This spike does not own frontend component accessibility defects, deployment status, broad visual redesign, performance optimization, or speculative new content. Route renderer and metadata plumbing remain in WCAG/SEO; this spike supplies and verifies the editorial values that those systems carry.

## Home, About and Side Projects copy review — 2026-10-18
Detailed editorial discussion and unapproved wording live in the [local copy-review reference; `references/content-audit/about-side-projects-copy-review-2026-10-18.md`](../../AGENTS.md#external-reference-locations). That reference is deliberately gitignored and is not included in the public repository. Agree final wording in chat before changing CMS copy; broader Side Projects content decisions remain open.

## Native article compositions — 2026-10-22
Translate the two presentation-slide screenshots in Building Enzo into the existing Gutenberg vocabulary. Use semantic headings, paragraphs, lists, and responsive columns: a two-column interpreter/tools overview and a three-stage project timeline. Preserve the article’s prose, code, footnotes, dates, and canonical link, with only the adjacent overview question promoted to a heading. Replace its slide-based featured image with an illustration already used in the article. Keep the source slide attachments available; no new block type, page-specific CSS, or raster recreation is needed. Visual acceptance remains open.

## Dark editorial panel trial — 2026-10-23
The first native slide translation preserved content but lost too much visual hierarchy. The user authorized a dark interjection adapted to the website rather than a literal slide port. Trial two uses an Editorial panel style on core Group blocks and a Timeline style on nested core Columns: ink ground, cream text, blue edging, italic mono headings, and connected stages that turn vertical on phones. These are styles for existing Gutenberg blocks, not new block types. Group rendering now preserves authored classes so the editor selection reaches the frontend. Ordinary article prose remains unchanged. Visual acceptance and editor authoring feel remain open.
