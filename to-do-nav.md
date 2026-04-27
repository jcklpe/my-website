# Navigation Simplification

# Background

The site is moving away from a conventional WordPress-style persistent navbar. The frontend is a Nuxt/Vue SSR app, so navigation can be contextual, section-based, and local to the route instead of a permanent global chrome element.

The goal is not to make navigation disappear thoughtlessly. The goal is to reduce persistent top-of-page UI, make the homepage and footer carry more global wayfinding, and add local affordances only where they help the visitor understand where they are or where to go next.

The first implementation slice should focus on homepage section anchors and making Selected Work the canonical case-study browsing surface. The more radical nav simplification can emerge from smaller tactical changes once the route structure is stable.

The working direction is that the site may not need a primary navbar much at all. Visitors can move from the homepage into case studies, writing, side projects, and about content through contextual page sections. Detail pages can provide a small local site-nav affordance, usually just Home and possibly one local index link, while broader site movement can live in the footer.

## Project organization

Add new items to complete to the `# To Do` section. When those items are completed move them either to `# Ready for human QA` or `# Done`. Update the `# Current State Overview` with an overview of the current state.

Keep tasks granular and atomic. Prefer concrete work items like "Add `id=\"selected-work\"` to the homepage Selected Work section" over broad items like "improve navigation."

## General principles

- Prefer contextual wayfinding over a permanent global navbar.
- Do not show links to the page or section the visitor is already on.
- The footer is the durable global site map.
- The homepage is the canonical browsing surface for Selected Work.
- Case-study detail pages should link home, not "back to selected work."
- Keep action labels descriptive. "Case Studies" can remain a useful link label even when the destination section title is "Selected Work."
- Keep this bespoke and simple. Do not build a generic route-aware nav framework unless the site actually grows into needing one.
- Avoid large visual redesigns until the route structure and navigation behavior are stable.
- Make changes in atomic steps so the direction can evolve tactically.
- Preserve accessibility: links must be real links, keyboard reachable, and understandable without relying only on scroll behavior.
- Do not make the site feel like a conventional WordPress theme just because WordPress is the CMS.

# Current State Overview

- `SiteNav.vue` currently owns a hardcoded primary nav: Writing, Case Studies, Side Projects.
- `layouts/default.vue` renders `SiteNav` on every non-home route.
- The homepage renders `SiteNav variant="home"` after the hero.
- The current Case Studies nav item points to `/case-studies`.
- `/case-studies/index.vue` currently exists as a standalone archive route.
- Case-study detail pages live at `/case-studies/[slug]`.
- Writing archive/detail pages live at `/writing` and `/writing/[slug]`.
- Side Projects currently exists as a minimal `/side-projects` holding page.
- An About page does not exist yet.
- Footer fallback links currently include Writing, Case Studies, and Side Projects.
- The first navigation refactor should focus on homepage section anchors and removing the public case-study archive route.

# Key Decisions

- The standalone `/case-studies` archive page should be removed.
- Case-study detail URLs can remain `/case-studies/[slug]` for now.
- The public browsing surface for case studies should be the homepage Selected Work section.
- "Selected Work" is a section/title/branding phrase.
- "Case Studies" can remain the clearer utility label for links.
- A case-study detail page only needs a small Home affordance.
- The case-study detail Home affordance should link to `/#selected-work`.
- Do not add a "Back to Selected Work" label on case-study pages.
- Next/previous case-study navigation should be planned as bottom-of-page navigation.
- The first implementation pass should prioritize anchor-link functionality on the homepage over a full visual nav redesign.
- Writing detail pages should only need a small Home link and a Writing archive/index link.
- Side Projects can be reached from a homepage section/link and does not need to be globally available from every detail page.
- About can be linked contextually from the homepage and footer; case-study and writing pages do not need direct top-level About links.

# To Do

## Phase 1: Homepage Section Anchors

- Add a stable `id="selected-work"` to the homepage Selected Work section.
- Add a stable `id="latest-writing"` to the homepage Latest Writing section.
- Verify direct navigation to `/#selected-work` lands at the Selected Work section after SSR/client hydration.
- Verify direct navigation to `/#latest-writing` lands at the Latest Writing section after SSR/client hydration.
- Add `scroll-margin` or equivalent spacing so anchored sections do not feel visually cramped.
- Confirm anchor links work from another route, not only from the homepage.
- Confirm anchor links work after browser refresh.
- Confirm anchor links work with keyboard navigation.

## Phase 2: Make Selected Work The Case-Study Browsing Surface

- Change the primary Case Studies nav target from `/case-studies` to `/#selected-work`.
- Keep "Case Studies" as the utility/action label for links unless a specific UI location works better with "Selected Work."
- Keep "Selected Work" as the homepage section title.
- Remove `apps/frontend/pages/case-studies/index.vue` so the standalone case-study archive route no longer exists.
- Update README references that describe a public case-study archive route.
- Update `to-do.md` references that still describe `/case-studies` as an active archive.
- Update frontend fallback footer links so the Case Studies footer link points to `/#selected-work`.
- Add a note to `to-do.md` that live ACF footer links may also need to be updated manually in WordPress if they still point to `/case-studies`.
- Keep case-study detail routes at `/case-studies/[slug]` for now.
- Verify homepage case-study cards still link to individual case-study detail pages.
- Verify removed `/case-studies` route does not remain linked from the app shell, footer fallback, or homepage UI.

## Phase 3: Homepage Contextual Links

- Add or confirm a homepage link path from the Selected Work section title/area to the Selected Work content itself if useful.
- Add or confirm a homepage link path from the Latest Writing section to the Writing archive.
- Decide whether the Latest Writing section title itself should link to `/writing`.
- Add a homepage Side Projects section or clear section link to `/side-projects`.
- Add a homepage About link or About section entry point once the About page exists.
- Keep these links embedded in the homepage composition rather than styling them as a conventional navbar.
- Verify homepage contextual links are understandable without a persistent top nav.
- Verify homepage contextual links work on mobile without creating cramped navigation rows.

## Phase 4: Detail Page Contextual Navigation

- Make the case-study `Home` affordance link to `/#selected-work`.
- Make sure the transition animation works the same backwards as forwards.
- Add a small local `Home` affordance to writing detail pages.
- Add a small local `Writing` or `All Writing` affordance to writing detail pages that links to `/writing`.
- Keep the writing detail affordances small and left-aligned so they feel like local page tools, not a full navbar.
- Ensure contextual links do not interfere with featured-media route transitions.
- Ensure contextual links are visible without creating a conventional top navbar feel.
- Verify contextual links are keyboard reachable.
- Verify contextual links do not overlap hero titles/media on mobile.

## Phase 5: About Page

- Add a real `/about` page.
- Link to `/about` from the homepage in a contextual way.
- Link to `/about` from the footer.
- Do not add About as a mandatory top link on post or case-study detail pages.
- Let the About page contain contextual links to Writing, Case Studies, Side Projects, or contact paths where they make sense in the copy.
- Decide later whether About needs any local top affordance beyond Home.

## Phase 6: Bottom Navigation For Case Studies

- Add a planned bottom navigation area to case-study detail pages.
- Query or derive previous/next case studies.
- Show "Previous" and "Next" case-study links when available.
- Decide how the final case study behaves: link to the first case study, link home, or show only the previous link.
- Keep bottom navigation visually separate from the article body and footer.
- Ensure bottom navigation does not replace the footer as global wayfinding.
- Test direct page loads and client-side transitions.

## Phase 7: Reduce The SiteNav To A Small Local Affordance

- Replace the current full-width fixed interior `SiteNav` treatment with a smaller local site-nav affordance.
- Keep the site-nav component if it remains useful, but change its job from "global primary navbar" to "small route-local return/control surface."
- Keep case-study detail page site-nav to Home only, with bottom case-study navigation handling case-study-to-case-study movement.
- Keep writing detail page site-nav to Home and Writing archive.
- Let Writing archive use a small Home-only site-nav if needed.
- Let Side Projects use a small Home-only site-nav if needed.
- Let About use a small Home-only site-nav if needed.
- Do not add direct top links from case-study pages to Writing, Side Projects, or About.
- Do not add direct top links from writing posts to Case Studies, Side Projects, or About.
- Rely on the footer for global site movement from deep pages.
- Style the top site-nav affordance as a small left-aligned object rather than a full-width bar.
- If hide-on-scroll behavior remains, apply it only to the small local affordance, not to a large global navbar.
- Verify no page becomes a dead end.
- Verify the footer contains enough global navigation to compensate for reduced top nav.

# Ready for human QA

# Done

# QA Checklist

- Test direct URLs: `/`, `/#selected-work`, `/#latest-writing`, `/writing`, `/writing/[slug]`, `/case-studies/[slug]`, `/side-projects`.
- Confirm no visible top link points to the current page.
- Confirm no public UI links to `/case-studies` after the archive route is removed.
- Confirm case-study cards still navigate to detail pages.
- Confirm case-study detail `Home` link lands at `/#selected-work`.
- Confirm writing detail pages expose Home and Writing archive links.
- Confirm Side Projects and About are reachable from the homepage and footer.
- Confirm footer fallback links still provide global wayfinding.
- Test desktop and mobile widths.
- Test keyboard tab order through nav, contextual links, and footer.
- Test with reduced motion enabled so scroll/nav changes do not rely on animation.

# Assumptions

- "Remove `/case-studies`" means remove the standalone archive page, not the `case_study` content type or existing detail URL pattern.
- The first implementation should update homepage section anchors before larger nav simplification.
- The footer remains the global navigation safety net.
- The visual style of the new navigation should stay restrained until the structure is stable.
- Hardcoded bespoke links are acceptable for now. This site does not need a reusable nav framework until there is a real maintenance reason.
