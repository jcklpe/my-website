# Redesign

This document is the working reference for the site's current visual redesign phase. It tracks design direction, decisions, and constraints for the active work — from the neutral baseline toward eventual generative design spikes.

## Phase Overview

There are two phases:

**Phase 1: Non-brand academic baseline** (this branch, `gendes-academia`)
Strip the site to a quiet, credible, typographically-led neutral state. No expressive color, no branded accent palette. The goal is a clean canvas from which generative design spikes can depart clearly.

**Phase 2: Generative design spikes** (separate branches, documented in `gendes.md`)
Fork branches. Feed each one a mood board and design brief. Let each branch explore a distinct visual direction. Evaluate what works and what to keep.

The neutral baseline is not the destination. It is the shared point of departure.

---

## Design Direction: Non-Brand Academia

Borrowed from the A Color Bright "Aesthetics of AI" visual identity taxonomy. Their definition:

> "Stripping visual identity down to essentials, avoiding shine or gimmicks, signaling that the work itself demonstrates innovation. Lean typography, muted colors, and functional layouts emphasize seriousness and credibility. This is the humblebrag of branding: We don't need a shiny brand; our work speaks for itself. The overall effect is quietly confident, rigorous, and authoritative."

Reference examples from their analysis: Thinking Machines Lab, Runway Research, Sakana, OpenAI Research pages.

The posture this signals: quiet confidence, technical literacy, the work speaks. Not "I have a brand." Not "I made a creative choice." The site should feel like the output of someone who could have done anything visually and chose restraint deliberately.

### What this is

- Warm off-white or neutral paper background
- Near-black ink text
- Generous white space and article rhythm
- IBM Mono italic as the single expressive typographic move (headings only), and IBM Sans for the paragraph text.
- Clean functional layouts — no decoration for decoration's sake
- One muted accent at most, used sparingly (or none during the baseline pass)
- Technical rigor signals: measured grids, clear hierarchy, calm prose blocks

### What this is not

- Sterile beige SaaS blog (generic, forgettable)
- "We stripped everything so now it looks broken"
- Overly expressive heading sizes in article/body contexts — research papers do not have 5rem headings in the body

---

## Fonts

Typographic choices are fixed for now. Everything else in the visual system is in play.

- **Headings**: IBM Plex Mono Italic — this is the single designed accent, the one expressive move the baseline keeps
- **Body / paragraph text**: IBM Plex Sans
- No serif. `$font-serif` is already aliased to `$font-mono` in the type palette and that alias stays.

### Heading scale recalibration

The current heading scale (`clamp(3.2rem, 7vw, 5.75rem)` for h1, `clamp(2.2rem, 5vw, 3.65rem)` for h2, etc.) is calibrated for expressive poster-like page heroes, not for academic article body use. During the baseline pass, article body headings should be pulled back toward a measured document rhythm.

Article h1 is rarely used in body content so it can stay large if needed for page-level titles. But h2, h3, and h4 inside article `.content-flow` bodies should be significantly smaller, quieter, and closer to GitHub markdown heading rhythm — clear, hierarchical, underlined where useful, not gigantic.

Global heading defaults in `_type-palette.scss` may need to remain large if they serve page-level titles. That means article-scoped heading overrides should live in the article shell/block system rather than changing the global defaults.

---

## Palette Baseline

The current palette has:

- `$color-ink: #0c112b` — deep navy, close to black. Fine.
- `$color-surface: #f7f5ef` — warm off-white. This is exactly right for non-brand academic.
- `$color-paper-warm: #f3efe5` — slightly warmer off-white. Good for differentiated surfaces.
- `$color-muted: #4e5774` — muted blue-gray. Usable as a secondary text/meta tone.
- `$color-primary: #2657eb` — electric blue. The only accent color currently being allowed, used extremely sparingly.

The palette baseline should be flexible in such a way that in the future, further generative pass forks will be able to evolve the visual design in more sophistcated directions.

For the baseline pass, the effective working palette is:

| Role                       | Value                                 | Note                                          |
| -------------------------- | ------------------------------------- | --------------------------------------------- |
| Background / page surface  | `$color-surface` `#f7f5ef`        | Keep                                          |
| Elevated surface / card bg | white-ish                             | Keep                                          |
| Text / ink                 | `$color-ink` `#0c112b`            | Keep                                          |
| Secondary text / meta      | `$color-muted` `#4e5774`          | Keep                                          |
| Links / interactive        | blue with a simple underline on hover | Decide during implementation                  |
| Accent (article)           | None or barely-there                  | Baseline has no expressive accent             |
| Accent (page chrome)       | electric blue used sparingly          | may evolve further in other generative forks. |

The current `--color-link-bg` gradient (`electric blue → purple`) should be replaced with something quiet: plain underline, muted ink color, or a very subtle tonal shift. Decide concretely during implementation.

---

## Surface-by-Surface Notes

### Article body (highest priority)

The article body is the most important surface to normalize. It is where "non-brand academic" is most legible and most easily broken by noise.

Target state:

- Quiet heading hierarchy with enough size differentiation to scan, but no huge expressive type
- Generous vertical rhythm — white space between blocks, not collapsed
- Prose runs in a comfortable reading width (not full-bleed)
- No "tape label" decorations on ordinary prose blocks
- Blockquotes, pullquotes, code, details, and accordion should feel like variations of the same quiet system, not independent loud things
- Captions small and dim, not invisible
- Images placed cleanly within or breaking out of the article grid without extra decoration

The primary style files for this work:

- `packages/styles/_type-palette.scss` — heading scale for article contexts
- `packages/styles/_wordpress-blocks-baseline.scss` — block normalization and grid shell
- `packages/styles/shared-components/` — individual block recipes
- `packages/styles/context-role/_vue-frontend.scss` — global CSS custom properties

### Cards (writing and case-study)

Cards should feel like clean document index entries. Not poster-like. Not high-contrast graphic objects. The distinction between writing cards and case-study cards can remain, but both should calm down for the baseline.

Key framing questions with answers:

- How much visual weight should a featured image carry in the card context?
  - a moderate amount. It is good to keep images around, but their visual impact should not overwhelm.
- What does a card without a strong expressive accent color look like?
  - it looks simple and easy to read.
- Does the transition system (clip-path, featured-media) still feel right at this quieter visual register?
  - It is fine to keep the clip-path functionality for now. The clip path gives flexibility in terms of presentation but can also be basically invisible too.

Note: The card-to-detail featured-media transition system is a structural constraint that must be preserved regardless of visual reskin. `clip-path` and `data-featured-*` attributes are transition hooks. Do not remove them.

### Homepage

The homepage has multiple sections: hero, Selected Work (case studies), Employer Testimonials, Side Projects link, Latest Writing, Footer. Each section should feel like a cohesive part of the same quiet system.

For the baseline:

- The hero can be the one place where slightly more typographic scale is acceptable, but it should still be measured
- The footer currently runs electric blue — that is part of the branded palette and should be neutralized for this baseline

### Navigation

The current nav is already a small local affordance on interior pages, not a global persistent bar. That structure stays. The question for the baseline is just what color treatment it uses: and the answer is, it becaomes white with black text, maintaining it's small size, with maybe a touch more padding so that it doesn't have too much noise ruining readability.

### Footer

The footer is currently designed as a tall electric-blue surface. That needs to change for the baseline. Neutral options:

- Ink/dark surface (still differentiated from page body)
- Warm off-white with heavier type (fully light) (This is the one I am picking. Use this approach)
- A quiet mid-tone (gray or warm gray) that separates it from the page without being branded

The structure (ACF-backed links, etc.) stays.

---

## What to Preserve From the Prior System

These are structural or systemic decisions that survive the visual reset:

- IBM Plex Mono Italic as the heading accent face
- IBM Plex Sans as body text
- The CSS named grid article shell (`.content-flow`) — structural, not visual
- Float-breakout grouping (`.float-breakout-flow`) — structural
- The block component taxonomy and registry — functional, not visual
- The featured-media transition system — `clip-path`, `data-featured-*` props, `FeaturedMediaFrame` — do not touch
- The contextual wayfinding model — no persistent global navbar, footer as global sitemap, small local SiteNav on interior pages
- The SCSS architecture: palettes → context-roles → shared-components — organization stays
- ACF-backed homepage sections and footer settings — content model stays

---

## What to Strip

- Purple accent (`$color-accent: #7200ff`) — gone
- The electric-blue footer treatment
- Any ambient "tape label" decorations on article/prose blocks
- Expressive large heading sizes in article body contexts — pull back to document scale

---

## Key Insights from Prior Design Conversation

From an earlier internal design discussion (now folded into this doc):

The right frame is not "this design is too extreme." It is: expressive visual language was applied before the editorial/layout system was stable. The loudness masked functional QA problems. The solution is to enter a "low-noise calibration mode" — not bland, but quieter and more systematic, so the rendering is visible and trustworthy.

Two competing impulses existed in the prior version:

- The homepage/card system: graphic, poster-like, clipped, label-heavy, high contrast
- The article body: wanted to be readable, editorial, academic, robust

Those two registers need clearer separation. The article body should be quiet by default. The homepage can be more expressive if needed, but both need to be coherent within their register.

The "tape label" problem: black-label decorations had too much semantic weight. When quotes, accordions, file blocks, headings, and cards all speak that language, nothing gets hierarchy. The label treatment should be an accent system, not a baseline system. Good candidates for that energy (if it returns in a spike): homepage hero, selected-work cards, major CTAs. Bad candidates: normal h2 headings, tables, file downloads, regular post body.

The right description of the target is: **research notebook meets technical portfolio, with restrained retro-computing accents possible in controlled places**. Not "punk zine screaming over WordPress blocks." Not "sterile beige SaaS blog."

On the A Color Bright taxonomy: the article also warns that blindly adopting trend categories creates sameness. The goal is not "make it look like an AI research brand." It is to borrow the useful posture — quiet confidence, technical literacy, humane tone — and apply it to a design portfolio. The site is about design and engineering work. The visual system should feel like it came from someone who can do both.

---

## Implementation Priority Order

1. Palette — replace or neutralize purple CSS custom properties globally
2. Footer — neutralize the electric-blue surface
3. Article body headings — scale back h2/h3/h4 in article context
4. Article body block recipes — strip loud decorations from prose block defaults
5. Cards — calm down visual weight, preserve transition hooks
6. Navigation — neutralize color treatment
7. Homepage — evaluate section by section; hero may be the last thing to settle
