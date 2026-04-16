---
applyTo: "apps/cms/**,docker/**"
---

# CMS Instructions

Start with `AGENTS.md`; this file only adds CMS-specific reminders.

- Docker Compose is the canonical CMS environment.
- WordPress is the admin/CMS/API layer. Do not make WordPress responsible for the public frontend presentation.
- Project-owned WordPress behavior belongs in `project-bootstrap` or the editor theme/plugins, not in ad-hoc admin edits.
- Keep bootstrap behavior reproducible and pinned where possible.
- ACF Pro may be installed from `docker/private-plugins/advanced-custom-fields-pro.zip`, but private plugin files and license data stay out of Git.
- Use ACF sparingly for structured metadata and global settings. Use Gutenberg for article body content.
- The `case_study` post type supports editor content, excerpts, thumbnails, revisions, REST, and GraphQL.
- `editor.css` is generated from `packages/styles/context-role/_wp-editor.scss` but committed because WordPress loads CSS assets directly.
- Do not edit generated `editor.css` by hand; regenerate it through `corepack pnpm styles:wp-editor` or `corepack pnpm check`.
- Keep uploads out of Git.
