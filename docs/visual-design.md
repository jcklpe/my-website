# Visual Design

This is a living reference for the site's visual direction. It will evolve as generative design spikes explore new directions. Treat the decisions here as the current baseline, not as permanent law.

## Phase Overview

There are two phases:

**Phase 1: Non-brand academic baseline** (branch `gendes-academia`)
Strip the site to a quiet, credible, typographically-led neutral state. No expressive color, no branded accent palette. A clean canvas from which generative design spikes can depart clearly.

**Phase 2: Generative design spikes** (separate branches, each with its own mood and brief)
Fork branches. Feed each one a mood board and design brief. Let each branch explore a distinct visual direction. Evaluate what works and what to keep.

The neutral baseline is the shared point of departure, not the destination.

---

## Design Direction: Non-Brand Academia

Borrowed from the A Color Bright "Aesthetics of AI" taxonomy:

> "Stripping visual identity down to essentials, avoiding shine or gimmicks, signaling that the work itself demonstrates innovation. Lean typography, muted colors, and functional layouts emphasize seriousness and credibility. This is the humblebrag of branding: We don't need a shiny brand; our work speaks for itself. The overall effect is quietly confident, rigorous, and authoritative."

Reference examples: Thinking Machines Lab, Runway Research, Sakana, OpenAI Research pages.

### What this is

- Warm off-white or neutral paper background
- Near-black ink text
- Generous white space and article rhythm
- IBM Plex Mono Italic as the single expressive typographic move (headings only)
- IBM Plex Sans for body/paragraph text
- Clean functional layouts — no decoration for decoration's sake
- One muted accent at most, used sparingly

### What this is not

- Sterile beige SaaS blog (generic, forgettable)
- "We stripped everything so now it looks broken"
- Overly expressive heading sizes in article/body contexts — research papers do not have 5rem headings in the body

---

## Palette

| Role                      | Token                    | Value                    | Note                                              |
| ------------------------- | ------------------------ | ------------------------ | ------------------------------------------------- |
| Background / page surface | `$color-surface`         | `#f7f5ef`                | Warm off-white; defines the page body             |
| Elevated surface / cards  | `$color-surface-soft`    | `rgba(255,255,255,0.85)` | White overlay for frosted/card surfaces           |
| Differentiated surface    | `$color-surface-warmer`  | `#f3efe5`                | Slightly warmer off-white, e.g. footer            |
| Text / ink                | `$color-ink`             | `#0c112b`                | Near-black navy                                   |
| Ink overlays              | `$color-ink-08/04/025`   | rgba variants            | Used for borders, dividers, and subtle fills      |
| Secondary text / meta     | `$color-muted`           | `#4e5774`                | Muted blue-gray                                   |
| Accent                    | `$color-primary`         | `#2657eb`                | Electric blue; used extremely sparingly           |

There is no purple accent. `$color-accent` has been fully removed from the palette and all consumers.

---

## Typography

Typographic choices are settled for this baseline. Everything else in the visual system remains in play.

- **Headings**: IBM Plex Mono Italic — the one designed expressive move. `$font-serif` is aliased to `$font-mono`; there is no actual serif in use.
- **Body / paragraph text**: IBM Plex Sans.

### Heading scale

Page-level headings and article-body headings intentionally use different recipes. Inside article bodies, h2/h3/h4 are pulled toward a quieter document rhythm close to GitHub markdown through the shared heading-block recipe, with type source values coming from `_type-palette.scss`. Do not collapse the two: page heroes need large type, article bodies do not.

---

## Surface Notes

### Article body

The article body is the most important surface. "Non-brand academic" is most legible — and most easily broken — here.

Target state:
- Quiet heading hierarchy: enough size differentiation to scan, no giant expressive type
- Generous vertical rhythm; white space between blocks, not collapsed
- Comfortable prose reading width, not full-bleed
- No "tape label" decorations on ordinary prose blocks
- Blockquotes, pullquotes, code, details, and accordion feel like variations of the same quiet system
- Captions small and dim, not invisible

Relevant style files: `_type-palette.scss`, shared-components block recipes, and `_vue-frontend.scss`.

### Cards

Cards should feel like clean document index entries — not posters, not high-contrast graphic objects. Writing cards and case-study cards can remain visually distinct, but both belong to the same quiet system.

**Structural constraint:** The card-to-detail featured-media transition depends on `clip-path` and `data-featured-*` attributes on cards and `FeaturedMediaFrame`. These are transition hooks, not visual choices. Do not remove them during reskins.

### Homepage

Multiple sections: hero, Selected Work, Employer Testimonials, Side Projects link, Latest Writing, Footer. Each section should feel like part of the same cohesive quiet system.

The hero can carry slightly more typographic scale than the rest, but it should still feel measured.

### Navigation

`SiteNav` is a small local affordance on interior pages — surface-colored with a subtle border and ink text. That structure stays. Keep it unobtrusive.

### Footer

Warm off-white (`$color-paper-warm`) with ink text. Not the original electric-blue footer. Fully light, differentiated from the page body by weight rather than by color.

---

## Generative Spike Roadmap

Future design spikes will fork from this baseline. Each spike gets its own branch, mood board, and brief. The baseline is the clean starting point each fork can depart from clearly.

When a spike branch is active, a corresponding conceptual doc and to-do doc should live in `docs/` following the spike work pattern documented in `AGENTS.md`.
