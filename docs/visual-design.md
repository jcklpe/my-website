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
| Ink / text | `$color-ink` `#0c112b` | Near-black navy |
| Secondary text / meta | `$color-muted` `#4e5774` | |
| Signal accent | `$color-primary` `#2657eb` | Electric blue — signal, not fill |
| Soft signal wash | `$color-signal-soft` `rgba(38,87,235,0.15)` | Faint blue used in blueprint-field and hero diagram decoration |
| Terminal accent | `$color-terminal` `#218d4e` | Green; **only** in the Side Projects dark section |

There is no dedicated dark-surface token. The Side Projects "dark terminal" section is composed at the callsite from `$texture-terminal-scanline` plus `color-mix()` of `$color-ink` and `$color-terminal` (see `HomeSideProjectsLink.vue`), not from a `$color-surface-dark` variable.

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

The **homepage hero display typography** is the "B.L.U.F." wordmark — Edwardian Script ITC for "Bottom / Line", Bodoni Z37 for "Up Front", IBM Plex Mono Italic for the corner badge. The composition is hardcoded markup (not CMS-driven) and lives in `apps/frontend/pages/index.vue`. It scales as a locked unit via container-query units against a tunable design canvas on `.hero-display` (`--hero-canvas-w`, `--hero-canvas-h`, `--hero-max-vh`); spike retired and archived at `docs/archive/hero-typography.md` / `.todo.md`.

---

## Surface Notes

### Article body

The most important surface, and the most easily broken. Quiet heading hierarchy, generous vertical rhythm, comfortable reading width, no "tape label" decorations on prose. Editorial blocks (blockquote, pullquote, code, details, accordion) read as variations of one quiet system — the academia baseline largely wins here. Quote/pullquote use blue rules (signal intensity, not cobalt) and read as content, not UI components — no card borders or drop shadows on them. Tables and editorial figures take the dark outline + hard shadow treatment.

**Code blocks** are the one deliberate *break* from the quiet article register — they have their own CRT terminal aesthetic (dark ground, scanlines, radial glow, token text-shadow glow) that signals a shift in register from prose to technical content. Three syntax themes are available via a floating switcher: **Midnight** (cobalt, the default), **Phosphor** (amber phosphor), and **Signal** (terminal green). Token colors follow a semantic hue scalar system where hue encodes meaning (orange-red = variables, teal/cyan/cobalt = functions, indigo = abstract types, hot pink = references, etc.). See `docs/archive/enzo-syntax-highlighting.md` for the full system.

**Structural constraint:** the card-to-detail featured-media transition depends on `clip-path` and `data-featured-*` attributes on cards and `FeaturedMediaFrame`. These are transition hooks, not visual choices — do not remove them during reskins.

### Cards

Writing cards are window-chrome objects: thick `border-window` outline, hard offset shadow, a lift on hover (small translate + stronger shadow), no broad blue fill. Case-study cards remain visually distinct but belong to the same system. Section headings are full-width, never framed as cards — full-width headings create better page rhythm.

### Case studies (homepage Selected Work + detail page)

Settled in the case-hero spike (archived at `docs/archive/case-hero.md` / `.todo.md`).

- **The halftone is the case-study image register, and it is image-area only.** Featured images prefer browser-baked halftone media derivatives rendered from the rectangular source image with the same CSS recipe used by `packages/styles/shared-components/_halftone-image.scss`; the older live pure-CSS stack remains a fallback/migration path. Never apply halftone to text, and never let legibility depend on it — titles always sit on solid ground. The *treatment* (halftone + cream + corner), not literal blue, is the through-line: homepage cards run a blue **duotone**; detail heroes resolve toward the image's native colours.
- **Halftone is image-dependent.** It flatters photographic source (risograph/screenprint read, forgives dated/low-res material) and exposes clean synthetic gradients (moiré, nothing for the dots to resolve into). Favour photographic hero images.
- **The colour journey:** duotone at browsing distance (cards) → full colour on arrival (detail hero). The card↔detail transition carries this — see the archived [featured-media-transition](archive/featured-media-transition.md) spike for the full motion history.
- **Selected Work composition (homepage):** text-dominant rows where the text plate is the steady vertical rhythm and each study's hero image is the horizontal *interruption* (the editorial split). Per-row layouts: banner / narrow-photo-left / narrow-photo-right / wide-photo-left / wide-photo-right (wide = photo wider than the text plate). The score is **phrased, not alternated** (no strict L/R ping-pong) and degrades gracefully from ~3 to ~8 studies. Reads as horizontal strata — deliberately distinct from the bento grammar reserved for Latest Writing.
- **Detail hero (layered):** photo plate anchored to one side with a single giant bottom-corner radius (a curve *in*, not a carved notch); the title and opening body sit in a plain cream column **layered over** the plate's lower region (page-over-plate). Halftone resolution committed at **11px** to match the flying transition clone so the hand-off is seamless. The body's opening blocks must be default-width (no wide/full alignments) so they can rise into the layered band.
- **Bottom previous/next nav:** treat the loop nav as another case-study card surface, not a generic related-link panel. It uses the same photo-treatment presets, baked halftone derivatives when available, duotone-at-rest / colour-on-hover behavior, compact editorial titleplates, excerpts, and masked slip beats for previous/next labels and excerpts.
- **Authorability (ACF):** per-case-study controls in the "Selected Work Display" group — row layout, text-plate alignment, photo treatment — each defaulting to `auto` (the page score/cycle). All halftone/duotone modes (crisp / bleed / tritone, tone pairs) are kept as author options here, plus a Konami-code dev panel on the detail page; none are "unused."
- **BTAK applies as everywhere:** materials carry the meaning — no "Case Study" labels, date strips, or ordinal chrome performing meaning it doesn't carry.

### Homepage

Hero, Vital Info, Selected Work, Testimonials, Side Projects, Latest Writing, Footer. The home wrapper carries the paper-grid texture; the hero is a framed diagram panel on a blueprint field. Each section has its own surface language but reads as one cohesive system.

### Navigation

Home nav: sticky, signal-blue bottom border, mono uppercase links, blue (not cobalt) fill-on-hover. Interior nav: a floating pill with a signal-blue border and a nudge-up hover. Home link is "Home" or the site name — no monogram.

### Footer

`$color-surface-warm` ground with a signal-blue top border (the single most impactful touch carried from blue1.1). Mono uppercase links, hover to signal blue. Clean structure — no "EOF" or fake channel labels.

---

## Open / Deferred Work

These are tracked as their own spikes rather than blocking the direction:

- **Case study hero + composition** — **shipped; spike closed 2026-06-17** (archived at `docs/archive/case-hero.md` / `.todo.md`). The settled result is folded into "Surface Notes → Case studies" above.
- **Featured-media transition (card↔detail morph)** — **shipped; spike closed 2026-06-23** (archived at `docs/archive/featured-media-transition.md` / `.todo.md`). The settled motion contract is folded into `docs/design-system.md` and `AGENTS.md`.
- **Writing surfaces (bento layout + detail hero)** — `docs/bento-writing.md`; the homepage Latest Writing bento layout, writing archive surface, and writing detail page hero are scoped together so writing surfaces stay coherent. Shares the featured-media transition.
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
