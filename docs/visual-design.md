# Visual Design

This is the living reference for the site's visual direction. The generative design spike has run its course and produced a chosen direction — **Blue Atlas** — which is now the design on the main working line. Treat the decisions here as the current direction, not as permanent law; they will keep evolving through surgical refinement.

## How We Got Here

There were two phases, both now complete:

**Phase 1 — Non-brand academic baseline** (branch `gendes-academia`)
A quiet, credible, typographically-led neutral state: warm off-white, near-black ink, no expressive color, IBM Plex Mono Italic headings. This was the clean canvas the generative design branches departed from — a point of departure, never the destination.

**Phase 2 — Generative design exploration** (branches `gendes-systems-atlas`, `gendes-blue1`, `gendes-blue1.1`–`gendes-blue1.7`, then synthesis branches `gendes-blue2.*`)
Multiple branches, each fed a mood board and brief, each exploring a distinct direction. The runs were audited section-by-section (see the Design System Audit in Notion) and synthesized. The blue atlas direction emerged as the winner and was merged to main.

The methodology that produced this is documented in the archived spike docs `docs/archive/gendes.md` and `docs/archive/gendes.todo.md`; the detailed section-by-section synthesis spec is in `docs/archive/gendes-brief.md`.

---

## Design Direction: Blue Atlas

*"Blue Atlas" is the descriptive name for the aesthetic — an atlas/blueprint register rendered in blue. It is **not** the early `gendes-systems-atlas` exploration branch, which was one of the first runs and not the winner; the chosen direction was synthesized from the `gendes-blue1`/`gendes-blue2` lineage.*

The site reads as a designed artifact from an engineer-designer who thinks in systems — part field notebook, part diagram surface, part research desktop. It is structured, legible, and precise, with electric blue as a structural *signal* color rather than decorative chrome. The cream ground keeps it warm and credible rather than clinical; the blue keeps it active and confident.

### What this is

- Warm off-white (cream) ground, near-black navy ink — carried over from the academia baseline
- Electric blue (`#2657eb`) as the active **signal** color: rules, outlines, section accents, label text, focus states
- Every section has a distinct surface language: the hero is a framed diagram panel on a blueprint field, writing cards are window-chrome objects with thick dark outlines and hard offset shadows, the Side Projects section is a dark terminal moment with a terminal-green accent, testimonials are compact bordered specimens
- Blueprint/graph-paper grid textures, hard (flat, blur-free) offset shadows, thick `border-window` panel outlines — the crispness of vector graphics, not the softness of marketing cards
- IBM Plex Mono Italic headings; IBM Plex Sans body — the one consistent typographic win across every run

### What this is not

- **Cobalt-everywhere chrome.** Blue is a signal, never a broad hover fill or content background. No blue-filled buttons everywhere, no cobalt hover backgrounds, no cobalt pullquote borders. Blue underlines and border-color changes are sufficient.
- **Pastiche tech-company design.** The moodboard references (Signal Garden et al.) were inputs, not targets. The result deliberately does not look like the moodboard — that gap is the point.
- **BTAK** (see below). The dashboard/systems register comes from real structure and typography, never from decorative widgets that perform meaning they don't carry.

---

## The BTAK Anti-Pattern

**BTAK** = *Blueprint Techno-Aesthetic Kayfabe*: any design element that performs meaning it doesn't carry. This is the single most important durable lesson from the gendes spike and the constraint most easily violated.

The honesty test: **if a label could be removed and the design still made sense, it's BTAK and should go.** Decorative engineering labels are noise unless the labeled thing actually does engineering-thing work.

Concrete things to never reintroduce:

- Fake terminal/dashboard labels: "Signal Garden", "Lab Terminal", "Vital Signal", "Live Feed", "Primary Artifacts", "Writing feed / recent logs", "EOF", "01 / Index"
- CSS `::before`/`::after` pseudo-content used as fake window title bars with made-up label text
- Type-name labels on every instance of a type: "Case Study" on every case study card, "Note"/"Artifact" on every testimonial — labeling every grape a grape
- "Employer notes" as the testimonial eyebrow (foregrounds employee status) — use "Collaborators" or no eyebrow
- Fake-data graphics (business-chart silhouettes). Abstract decorative patterns (crosshatch, dot matrix, circuit-trace lines, the CSS radial diagram) are fine because they don't imply false data.

**Counter-rule:** flavor text that *contributes information* a reader couldn't otherwise infer is fine. The test is honesty, not austerity.

---

## Palette

Role-level summary; the authoritative token source is `packages/styles/_color-palette.scss` and `_effect-palette.scss`, exported as CSS custom properties from the context-roles.

| Role | Token | Note |
| --- | --- | --- |
| Page ground | `$color-surface` `#f7f5ef` | Warm off-white cream |
| Differentiated surfaces | `$color-surface-warm` / `-warmer` | Footer, panel grounds |
| Elevated / card surface | `$color-surface-soft` | Tint is under refinement — cream-based is preferred over pure white |
| Diagram-panel grounds | `$color-surface-screen` / `-blueprint` | Pale blue-green / pale blue for blueprint field moments |
| Dark accent surface | `$color-surface-dark` | Side Projects dark terminal section |
| Ink / text | `$color-ink` `#0c112b` | Near-black navy |
| Secondary text / meta | `$color-muted` `#4e5774` | |
| Signal accent | `$color-primary` `#2657eb` | Electric blue — signal, not fill |
| Terminal accent | `$color-terminal` / `$color-accent-green` `#218d4e`–`#2bc46a` | Green; **only** in the Side Projects dark section |

Whether to move the signal blue to a more saturated cobalt is an open, deliberately-tabled question; `#2657eb` is the current value.

New surface/effect vocabulary introduced by this direction:

- **Hard shadow family** (`$shadow-hard-low/mid/high`) — flat offset, no blur; the printed/registration aesthetic for panels, cards, tables, editorial figures
- **`$border-window`** — the thick dark outline on framed panels and cards
- **Textures** — `$texture-paper-grid` (subtle ink/blue grid for page and feature grounds), `$texture-blueprint-field` (stronger signal-blue grid for diagram panels), `$texture-terminal-scanline` (dark scanline for the Side Projects section). Exposed as CSS custom properties.

---

## Typography

- **Headings**: IBM Plex Mono Italic — the one consistent expressive move across all runs.
- **Body / paragraph**: IBM Plex Sans.
- **Labels / metadata / kickers**: IBM Plex Mono, ALL CAPS, modest positive letter-spacing (0.08–0.22em). Never negative tracking in compact UI labels.
- **Heading scale**: page-level heroes carry large display type; article-body h2/h3/h4 stay in a quieter document rhythm via the shared heading-block recipe. Do not collapse the two.

The **homepage hero display typography** (Edwardian Script ITC + Bodoni Z37 + mono, the "B.L.U.F." composition) is an in-progress signature piece tracked as its own spike in `docs/scratch/hero-typography.md`.

---

## Surface Notes

### Article body

The most important surface, and the most easily broken. Quiet heading hierarchy, generous vertical rhythm, comfortable reading width, no "tape label" decorations on prose. Editorial blocks (blockquote, pullquote, code, details, accordion) read as variations of one quiet system — the academia baseline largely wins here. Quote/pullquote use blue rules (signal intensity, not cobalt) and read as content, not UI components — no card borders or drop shadows on them. Tables and editorial figures take the dark outline + hard shadow treatment.

**Structural constraint:** the card-to-detail featured-media transition depends on `clip-path` and `data-featured-*` attributes on cards and `FeaturedMediaFrame`. These are transition hooks, not visual choices — do not remove them during reskins.

### Cards

Writing cards are window-chrome objects: thick `border-window` outline, hard offset shadow, a lift on hover (small translate + stronger shadow), no broad blue fill. Case-study cards remain visually distinct but belong to the same system. Section headings are full-width, never framed as cards — full-width headings create better page rhythm.

### Homepage

Hero, Vital Info, Selected Work, Testimonials, Side Projects, Latest Writing, Footer. The home wrapper carries the paper-grid texture; the hero is a framed diagram panel on a blueprint field. Each section has its own surface language but reads as one cohesive system.

### Navigation

Home nav: sticky, signal-blue bottom border, mono uppercase links, blue (not cobalt) fill-on-hover. Interior nav: a floating pill with a signal-blue border and a nudge-up hover. Home link is "Home" or the site name — no monogram.

### Footer

`$color-surface-warm` ground with a signal-blue top border (the single most impactful touch carried from blue1.1). Mono uppercase links, hover to signal blue. Clean structure — no "EOF" or fake channel labels.

---

## Open / Deferred Work

These are tracked as their own spikes rather than blocking the direction:

- **Homepage hero display typography** — `docs/scratch/hero-typography.md`
- **Case study hero / slip-background legibility** — `docs/scratch/case-hero.md`
- **Bento grid layout for Latest Writing** — `docs/scratch/bento-writing.md`; the card styling exists, the layout algorithm is the open work
- **Case-study composition and card title treatment** — not yet documented
- **Signal-blue value** — whether to stay at `#2657eb` or move toward a more saturated cobalt

---

## Accessibility Floor

These must not quietly regress as the direction is refined:

- One `h1` per page; logical heading order.
- Visible `:focus-visible` state on all interactive elements — supplement per-component styles but do not remove the global fallback in `_base.scss`. A signal-blue focus ring is consistent with the direction.
- Reduced-motion fallbacks on all motion and transition additions.
- Sufficient contrast under WCAG 2.1 AA for body text, metadata, action/link states, and focus rings — including signal blue on cream, ink/blue on the blueprint textures, and the terminal green on the dark Side Projects surface.
- Native interactive semantics: real links for cards, native button for load-more, aria-expanded/aria-controls for accordions.

See `AGENTS.md` → "Accessibility and SEO Contract" for the full list.
