# GitHub Copilot Instructions

Use `AGENTS.md` as the primary repo guidance. It is the canonical instruction file for this project.

Copilot-specific notes:

- Prefer small, readable changes that preserve the Nuxt + headless WordPress architecture.
- Do not introduce a giant raw-HTML post renderer; Gutenberg blocks should map to Vue components.
- Respect the frontend component taxonomy: authored content in `components/content`, browsing/wayfinding in `components/navigation`, motion presentation in `components/transitions`, and homepage assemblies in `components/home`.
- Keep generated `apps/cms/wp-content/themes/my-website-editor-theme/editor.css` in sync by using the documented commands rather than editing it by hand.
- Keep secrets, private plugin zips, uploads, and temporary reference assets out of Git.
- When suggesting broad refactors, preserve designer-friendly Vue SFC readability.
