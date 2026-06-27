# Mobile QA Pass 1 — To Do

Operational checklist for [mobile-qa1.md](mobile-qa1.md).

## Background

The transition spike is closed and the writing archive surface has landed. The
next practical work is a small, disciplined mobile QA pass over layout fit,
content-flow rhythm, and a handful of obvious overflow problems.

This doc was generated from `docs/scratch/mobile-qa1.md`. The original scratch
note was intentionally terse; this todo turns it into implementable work.

## Project Organization

- Conceptual doc: [mobile-qa1.md](mobile-qa1.md).
- Related loose notes: `docs/scratch/misc1.md`.
- Adjacent active spike: `docs/bento-writing.md` / `.todo.md`.
- Relevant durable docs: `docs/design-system.md`, `docs/visual-design.md`, and
  `AGENTS.md`.

## General Principles

- Keep fixes small and visible.
- Prefer shared-component recipe fixes when the problem appears in authored
  Gutenberg content.
- Prefer route/component-local fixes only for surface-specific layout issues
  like the writing archive rows or SiteNav mobile placement.
- Do not re-open the featured-media transition spike unless a mobile fix creates
  a new transition regression.
- Use `phone` as the existing small-screen breakpoint name.
- Preserve desktop alignment unless the todo item explicitly calls for checking
  desktop too.

## Current State Overview

- Mobile transition motion is accepted enough to move on.
- Writing archive title-wrap shiver is no longer blocking this pass.
- Side Projects mobile overflow may already be fixed; verify before changing.
- The homepage still may have a small right overflow, probably from Selected Work
  outlines/card geometry.
- Several content-flow blocks need mobile rhythm tuning: headings, lists,
  blockquotes, pullquotes, and float-break wrappers.

## To Do

### 1. Content-flow Mobile Rhythm

- [ ] **Heading inset parity:** On mobile, make `h2`–`h6` align with paragraph
  text instead of sitting flush against the viewport. While touching the heading
  recipe, check that desktop headings remain flush with paragraph text.
- [ ] **List rhythm:** Reduce the extra vertical separation between bullet lists
  and adjacent paragraph text. The goal is for lists to feel like part of the
  paragraph flow, not a detached block.
- [ ] **Blockquote mobile width:** Reduce or remove mobile side margins on
  blockquotes so they do not become skinny columns.
- [ ] **Blockquote ground:** Tune blockquotes toward the cream article/page ground
  rather than a bright white card-like surface, unless visual QA shows the quote
  needs more separation.
- [ ] **Pullquote mobile centering:** Make left/right floated pullquotes center
  cleanly on mobile instead of keeping a partial float offset.
- [ ] **Float-break wrapper spacing:** Set mobile `.float-break-flow` spacing so
  it does not create excessive gaps around floated/breakout content.

### 2. Navigation Mobile Placement

- [ ] **Interior nav flush-left:** On mobile, make the floating interior nav align
  to the left content edge/viewport rhythm instead of using the desktop offset.
  Check case-study detail, writing detail, writing archive, Side Projects, and
  About if available.

### 3. Writing Archive Mobile Fit

- [ ] **Rows flush to mobile edges:** Make writing archive rows sit flush left and
  right within the intended mobile page rhythm.
- [ ] **Year-group rhythm:** Reduce `.year-group` bottom spacing on mobile by
  roughly half, then visually tune.

### 4. Horizontal Overflow

- [ ] **Homepage overflow:** Find and fix the small right-side overflow on the
  homepage. First suspects: Selected Work card outlines, shadows, wide plates, or
  full-width section geometry.
- [ ] **Side Projects verification:** Re-check Side Projects mobile horizontal
  overflow. If it is already fixed, move this item straight to Done with the
  verification route and viewport.

## Ready For Human QA

Move completed implementation items here when the user should visually confirm
them on a phone or in mobile browser emulation.

Suggested QA routes:

- `http://127.0.0.1:3001/`
- `http://127.0.0.1:3001/writing`
- `http://127.0.0.1:3001/side-projects`
- a representative writing detail page
- a representative case-study detail page

Suggested QA checks:

- No horizontal scroll into blank ground.
- Headings, paragraphs, lists, quotes, and pullquotes share a coherent mobile
  content rhythm.
- Interior nav feels intentionally placed on mobile.
- Writing archive rows feel edge-aligned without clipping text.

## Done

- [x] Promoted the scratch note into active spike docs:
  [mobile-qa1.md](mobile-qa1.md) and this todo file.

