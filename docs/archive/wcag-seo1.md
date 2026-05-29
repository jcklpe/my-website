# WCAG + SEO Baseline

## What This Is

This is pass 1 of the WCAG + SEO work: a practical accessibility and search-readiness spike before generative design work begins.

The site is already visually coherent and fast in static preview. This pass is about making sure the current baseline has a solid semantic floor: readable contrast, visible focus, useful link text, sensible headings, basic metadata, static-preview compatibility, and no obvious blockers for keyboard or assistive-technology users.

This is not a design-theory critique spike. More qualitative legibility, composition, and aesthetic accessibility review can happen later in `docs/scratch/wcag-seo2.md`. This first pass should stay close to concrete WCAG/SEO checks and obvious fixes.

## Why Before Gendes

Generative design branches should explore expression, not rediscover the same baseline accessibility problems five different ways.

This spike should leave future design agents with a clear contract:

- Visual directions may change.
- Palette, typography, card treatment, homepage composition, and motion can move.
- Keyboard access, focus visibility, semantic page structure, basic contrast, useful links, and metadata cannot quietly regress.

The goal is not to freeze the visual design. The goal is to give the design branches a better floor to stand on.

## Scope

Pass 1 covers the current public-facing surfaces:

- Home
- About
- Side Projects
- Writing archive
- Writing detail QA post
- Case-study detail QA page
- Static generated preview smoke checks

The writing archive is being refined separately. This spike should avoid editing writing-page structure while that work is active unless a blocking accessibility or SEO issue is discovered and coordinated.

## Accessibility Model

The project should aim for WCAG 2.1 AA as the baseline. This spike is not a formal legal certification; it is an engineering/design hygiene pass.

Focus areas:

- **Landmarks and page structure**: `main`, header/nav/footer where appropriate, one clear page `h1`, sensible heading order.
- **Keyboard access**: links, cards, load-more controls, footer, local nav, galleries, accordions/details, and media controls should be reachable and usable without a mouse.
- **Focus visibility**: visible focus states should survive the non-brand academic baseline and future reskins.
- **Contrast**: ink, muted text, electric blue links/buttons, footer links, card metadata, captions, placeholders, and focus rings should remain readable.
- **Link purpose**: links should make sense out of context where practical. Generic "Read More" labels need visible or screen-reader context.
- **Images and media**: featured media, block images, galleries, and decorative images should have appropriate `alt` behavior.
- **Motion**: reduced-motion behavior should remain intact. Custom route transitions should not trap focus or strand users after navigation.
- **Interactive custom surfaces**: Mega Gallery, PhotoSwipe, card transitions, authored Gutenberg links, accordions, and details need manual sanity checks because automated tools will not understand all of their behavior.

## SEO Model

Pass 1 should cover basic technical SEO, not advanced content strategy.

Focus areas:

- route title and description behavior
- canonical URL strategy, especially for static/CDN output later
- Open Graph/social-preview defaults. Open Graph is the primary compatibility layer for newer platforms like Mastodon and Bluesky; Twitter card tags are a secondary compatibility layer.
- descriptive internal links
- `robots.txt` and sitemap assumptions for static output, with final production behavior deferred to production deploy where appropriate
- article/case-study metadata sanity
- no local CMS/runtime URLs leaking into generated public output

Structured data is useful but not a blocker for this pass unless it becomes low-risk and obvious. Article/CreativeWork schema can be considered in a later SEO polish pass.

## Tooling Approach

Use layered checks:

- Browser QA for keyboard, focus, mobile, and route transition behavior.
- Lighthouse accessibility and SEO as a quick automated screen.
- Static preview inspection to catch generated-output differences.
- Source inspection for metadata and link normalization behavior.

Avoid adding a large new test/tool dependency unless the audit finds enough repeated issues to justify it. A future pass can consider pa11y, axe automation, or design-theory/impeccable-style review if useful.

## Relationship To Other Work

**Gendes**

This spike is gendes prep. Durable accessibility/SEO rules discovered here should be folded into `AGENTS.md`, `README.md`, `docs/visual-design.md`, or another active reference before the spike is archived.

**Writing page**

The writing page is being handled in parallel. This spike can audit it and record findings, but should not churn writing page structure while another agent owns that spike.

**Production deploy**

Production-domain canonical URLs, final headers, CSP, sitemap submission, and launch metadata can be handled later in production deploy planning. This pass should still identify anything that would block a sane production launch.

**WCAG + SEO pass 2**

`docs/scratch/wcag-seo2.md` is reserved for a later qualitative pass: deeper design legibility, richer semantic polish, structured data, or external tooling once the first design branches or production-launch needs justify it.

## Non-Goals

- Do not redesign the site.
- Do not rework the writing page while the writing spike is active unless coordinated.
- Do not add a broad accessibility automation stack before the first audit proves it is worth maintaining.
- Do not treat Lighthouse as the only truth.
- Do not pursue production-domain DNS/header work inside this spike.
- Do not make gendes branches visually conservative. Make them responsible.
