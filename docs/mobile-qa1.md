# Mobile QA Pass 1

Promoted from `docs/scratch/mobile-qa1.md` on 2026-06-23.

This spike is a first focused pass over mobile layout, content-flow rhythm, and
small-screen overflow after the featured-media transition spike closed and the
writing archive redesign landed.

The goal is not to invent a new mobile design language. The goal is to make the
current Blue Atlas surfaces behave cleanly on phone-sized screens: no accidental
horizontal scroll, no cramped editorial blocks, no nav offset that feels
desktop-only, and no content-flow spacing that makes paragraphs, lists, quotes,
or floated elements feel like they came from different systems.

Operational checklist: [mobile-qa1.todo.md](mobile-qa1.todo.md).

## Scope

This pass owns:

- Mobile content-flow rhythm for headings, lists, blockquotes, pullquotes,
  floated image wrappers, and related Gutenberg-rendered content.
- Mobile nav positioning on interior pages.
- Mobile writing archive row alignment and year-group rhythm.
- Small horizontal overflow bugs on the homepage and Side Projects page.
- Visual QA routes where these issues actually appear.

This pass does not own:

- A new card-to-detail transition system. The featured-media transition spike is
  closed; only fix transition regressions if a mobile layout change causes one.
- The bento/writing archive redesign direction. That spike owns its own larger
  composition choices; this pass only checks the resulting mobile fit.
- Broad desktop visual redesign. Touch desktop only where a shared recipe needs
  a guardrail so the mobile fix does not create a desktop regression.
- New content features like Sketchfab support, production deploy commands, or
  copyright text. Those belong in misc/product or deployment work, not this
  mobile QA pass.

## Principles

- **Mobile should feel authored, not merely compressed.** Small screens can use
  simpler composition, but spacing and alignment should still feel intentional.
- **Content blocks should flow together.** Lists, quotes, headings, and floats
  should feel like part of the same article rhythm rather than isolated widgets.
- **Use existing recipes first.** Prefer fixing shared-component recipes and
  mobile breakpoints over route-local one-offs unless the issue is truly
  surface-specific.
- **Horizontal overflow is a blocker.** If the user can scroll right into blank
  page ground, treat that as a bug even when it is only a few pixels.
- **Verify in real surfaces.** Route-level screenshots matter more than isolated
  component assumptions.

## Initial Observations

These are the raw issues that seeded the spike, cleaned up into current project
language:

- Side Projects previously showed mobile horizontal scroll; it may already be
  fixed, but should be verified.
- Mobile `h2`–`h6` headings can sit too flush to the viewport edge; they should
  align with paragraph text.
- Lists have too much vertical separation from nearby paragraph text.
- Interior mobile navigation should be flush left instead of inheriting the
  desktop offset.
- Blockquotes should use less side margin on mobile; full-margin quote boxes get
  too narrow.
- Blockquotes likely want the warmer/cream article ground rather than a bright
  white block.
- Left-floated pullquotes should center on mobile instead of landing slightly
  off-left.
- `.float-break-flow` should not create excessive mobile spacing.
- Writing archive rows should be flush to the mobile content edges.
- Writing archive `.year-group` bottom spacing can be reduced on mobile.
- The homepage has a small right-side overflow, likely from outlines or card
  geometry in Selected Work.

