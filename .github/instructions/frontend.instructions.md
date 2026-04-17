---
applyTo: 'apps/frontend/**,packages/styles/**'
---

# Frontend Instructions

Start with `AGENTS.md`; this file only adds frontend-specific reminders.

- Nuxt is the public SSR frontend. WordPress is a content API, not the public renderer.
- Keep page templates and Vue components readable. Avoid premature abstractions that hide markup structure.
- Frontend component folders are organized by visitor-facing role: `content`, `navigation`, `transitions`, and page-specific `home`.
- Gutenberg body content should flow through `components/content/BlockRenderer.vue` and focused block components in `components/content/blocks`.
- Cards, content lists, the site nav, and the footer live under `components/navigation` because they orient visitors and move them through the site.
- Route/page transition presentation components live under `components/transitions`.
- Unknown blocks should fail gracefully at the individual block level.
- Use scoped semantic role/state classes for authored Vue component markup. Do not copy BEM-style names except where they are external WordPress/Gutenberg conventions.
- Prefer local SFC styles unless a value or recipe genuinely belongs in `packages/styles`.
- Component-facing design values should normally use CSS custom properties exported by a context-role.
- Do not add emitting CSS to `packages/styles/context-role/_vue-frontend-component.scss`; it is injected into every SFC style block.
- Custom card-to-detail motion lives in `useFeaturedMediaTransition.ts` and related featured-media components. Keep timing in `_motion-palette.scss`.
- Preserve reduced-motion behavior and avoid transition fixes that create scroll flashes, duplicate media ghosts, or final-position jumps.
