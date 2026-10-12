---
attention: historical
---
# Writing Excerpts — Tasks
## Background
User requested informative summaries for all writing posts. Copy and scope in `writing-excerpts.md`.
## General Principles
- Use the post's actual topic and argument; avoid generic teasers or unsupported claims.
- Edit only published post excerpts in the local public CMS. Do not deploy.
- Preserve a backup and exact before/after values; verify content hashes remain unchanged.
## Current State Overview
Closed 2026-10-01 at the user’s request. All implementation and copy review are complete; deployment is outside this spike.
All 18 published post excerpts updated in the local public CMS using a guarded excerpt-only script. Re-export verification confirms exact new values and unchanged body hashes, titles and slugs. Summaries are grounded in source introductions, headings and conclusions. Local public CMS backup: `.backups/cms/content/2026-09-20T214420Z/`. Exact originals/content hashes/update plan: ignored `report/performance-optimization/diagnosis/s35-writing-entry-20260920/`.
## To Do
None. Deployment remained separate from the completed excerpt work.
## Ready For Human QA
None.
## Done
- Review all 18 summaries in `writing-excerpts.md` or `http://127.0.0.1:3065/writing`. The frontend now decodes excerpt HTML entities after stripping tags; the final static browser check sees18 excerpts and no literal numeric entities. **User accepted 2026-09-20:** “excerpts are good.”
- Apply and verify all 18 local CMS updates. Evidence: `excerpt-updates.json`, `posts-before.json`, `posts-after.json`, `cms-update.log` and `cms-verification.json` in the ignored S35 directory above. The before/after plan retains exact excerpt restoration values; full database/uploads backup retained. Bodies, titles, slugs and case studies unchanged.
- Export and preserve original excerpts and content; draft summaries for all 18 published posts.
