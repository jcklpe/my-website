# Side Projects Page — To Do

## Background

The `/side-projects` frontend route currently shows a minimal scaffold with an `EmptyState` holding message. The goal of this spike is to make it a real CMS-backed page: a WordPress Page with Gutenberg body content, rendered through the existing block system, using the `content-flow` article shell layout.

See `docs/side-projects-page.md` for the conceptual doc and settled decisions.

## Project Organization

- **Vue page**: `apps/frontend/pages/side-projects/index.vue`
- **WordPress CMS**: Create a Page at the `/side-projects` slug in the public CMS
- **GraphQL fetch**: `queryWordPressPageByUri('/side-projects')` in `useWordPress.ts` (already exists)
- **SEO description**: `queryPageSeoDescription('/side-projects')` (already exists, reads from ACF `seo_description` field)
- **Block rendering**: `BlockRenderer.vue` — no changes needed to the block registry

## General Principles

- Follow the same CMS-backed page pattern that writing detail and case-study detail pages use
- The section heading (kicker, title, description) is inlined markup in the Vue component — not a shared component
- The page body renders through `BlockRenderer` on top of `content-flow` layout — no bespoke block registry additions needed for this spike
- Author initial WordPress content in the public CMS (not QA); keep it genuinely useful, not placeholder-only
- The `seo_description` ACF field is already registered on all Pages; just fill it in WordPress

## Current State Overview

- `pages/side-projects/index.vue` fetches from WordPress via `queryWordPressPageByUri('/side-projects')`, renders blocks via `BlockRenderer`, handles loading/error/not-found states, uses the `content-flow` article shell layout, and pulls SEO description from the ACF field via `page.value?.seoDescription`
- WordPress Page at `/side-projects` slug exists in the public CMS (created by user)
- `queryWordPressPageByUri` handles Page-by-URI fetching, block normalization, and 404 handling
- The `content-flow` article shell is used — `BlockRenderer` wraps its output in `.content-flow` internally

## To Do

- [ ] Author initial body content in the WordPress `/side-projects` Page using Gutenberg blocks (prose, links, images, or whatever describes current side projects)
- [ ] Fill in the `seo_description` ACF sidebar field on the WordPress Side Projects Page
- [ ] Run `corepack pnpm check` and verify no lint/typecheck errors ✅

## Ready for Human QA

- Browse to `http://my-website.localhost/side-projects` and verify the page renders CMS block content correctly
- Verify loading/error state messages look right if WordPress is temporarily unavailable
- Check mobile layout at the section heading and block body

## Ready for Human QA

<!-- Items waiting on browser/visual/CMS checks before moving to Done -->

## Done
