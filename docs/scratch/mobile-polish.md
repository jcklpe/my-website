# Mobile Polish

Scratch bucket for concrete mobile layout and visual bugs that are broader than
one component spike but too specific to live only in brand-voice notes.

This is not the same as a full mobile QA spike. Use this doc to preserve issues
that should be clustered into a future mobile polish pass or moved into a more
specific spike when one emerges.

## Current Context

The site intentionally keeps some editorial density on mobile. Floated images
can remain floated, core galleries can stay two/three-up when appropriate, and
not every visual surface should collapse into a single full-width stack.

That said, mobile layouts must not rely on clipping to hide bugs. Borders,
shadows, body plates, and horizontal rhythm should fit the viewport cleanly.

## Items From Misc0

### Case Study Bodyplate Top Margin On Mobile

Case-study body content could use a bit more top breathing room on mobile.

User observation:

- "We could use a tad more margin top on the bodyplate on mobile, on case
  studies, maybe like 150px instead of whatever it is now."
- In Chrome tools, adding that to the `content-flow` div felt closer.

Things to preserve:

- This is about the case-study bodyplate after the hero/photoplate handoff, not
  generic article spacing everywhere.
- The desired feel is more ground/breathing room before the body starts on
  mobile.
- Needs responsive judgment rather than a blind constant; test against different
  case-study hero/media states.

Likely files:

- `apps/frontend/pages/case-studies/[slug].vue`
- `packages/styles/context-role/_vue-frontend.scss`
- shared article/content-flow variables in `packages/styles/_spatial-palette.scss`

### Case Study Card Border Clipped On Mobile

On mobile, the black borders on case-study cards may be getting cut off on the
right side by horizontal overflow clipping.

User observation:

- "On mobile, I think the black borders on the case study cards is getting cut
  off on the right side by an overflow-x clip, and that should not be the case."

Things to preserve:

- Do not solve this by hiding overflow more aggressively.
- The card border and shadow treatment should be fully visible inside the mobile
  viewport.
- Check whether the issue comes from the card itself, parent section padding,
  full-bleed margins, transform/transition wrappers, or a global overflow guard.

Likely files:

- `apps/frontend/components/navigation/cards/CaseStudyCard.vue`
- `apps/frontend/components/home/HomeSelectedWorkSection.vue`
- `packages/styles/context-role/_vue-frontend.scss`
- route transition components if the clipping only appears during/after motion

## Rough Work Items

1. Reproduce on a phone-width viewport and identify exact overflowing/clipped
   element(s).
2. Distinguish static layout bugs from transition-state bugs.
3. Adjust the owning component/section geometry instead of relying on page-level
   overflow clipping.
4. Browser-check at phone and tablet widths.
5. Run `corepack pnpm check` after code changes.

## Human QA

- Case-study body starts with comfortable mobile breathing room.
- Mobile case-study card borders/shadows are not clipped.
- No new horizontal scrollbar or hidden overflow side effect appears.
