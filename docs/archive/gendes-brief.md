# Design Brief: Blue Atlas

> **Spike artifact — archived for historical context.**
> This is the synthesis spec that produced the chosen direction, implemented and
> merged to the main working line. It is preserved as the detailed,
> section-by-section record of the synthesis decisions. The durable, living
> description of the direction lives in `docs/visual-design.md`; deferred
> follow-on design spikes are tracked in `to-do.md`. Treat this as historical
> texture, not current rule — where it disagrees with `docs/visual-design.md`,
> the latter wins.
>
> Note on naming: "Blue Atlas" is the chosen-direction label. It is not the
> early `gendes-systems-atlas` exploration branch (which was not the winner).

## Origin

- Synthesized on branch `gendes-blue2.copilot`, merged via `gendes-blue.synth`
- Baseline: `gendes-academia`
- Source: synthesis of 8 prior generative design runs (systems-atlas, blue1.1–blue1.7), evaluated via the design system audit at https://www.notion.so/thejackalope/Design-System-Audit-36401e53a18b8009a2d9c15effdfe4b0

## Thesis

This is a Blue Atlas interface direction — part field notebook, part diagram surface, part research desktop. It is not a cosmetic color swap. Every section should have a distinct surface language: the hero is a framed diagram panel, the writing section has window-chrome cards with dark outlines, the side projects section is a dark terminal moment with a terminal-green signal, testimonials are compact bordered specimens.

The site should feel like it was composed on a blueprint field, annotated with a precise blue signal, and structured with the crispness of vector graphics — not the softness of marketing cards.

Electric blue (`#2657eb`, the original academia periwinkle) is the active signal color. It is used for rules, outlines, section accents, label text, and focus states. It is never used as a broad hover fill or content background. The cobalt intensity problem of prior runs — blue backgrounds on hover, blue-filled buttons everywhere, cobalt pullquote borders — must not recur here.

## Palette

Keep the academia periwinkle `#2657eb` as `$color-primary`. Do not shift to a more saturated cobalt. The periwinkle reads as active signal without demanding the eye's full attention.

Extend the palette with:
- `$color-surface-screen: #eef4f1` — pale blue-green, used for card interiors and blueprint field moments
- `$color-surface-blueprint: #edf1f6` — pale blue, used as a background for diagram panels
- `$color-terminal: #218d4e` — terminal green, used only in the Side Projects dark section as a secondary signal accent
- `$color-signal-soft: rgba(38, 87, 235, 0.15)` — very light blue for subtle fills and diagram marks
- Hard shadow family: `$shadow-hard-low: 0.35rem 0.35rem 0 rgba($color-ink, 0.12)` and `$shadow-hard-mid: 0.5rem 0.5rem 0 rgba($color-primary, 0.18)`
- `$border-window: 2px solid $color-ink` — the thick outline used on framed panels and cards
- `$texture-paper-grid` — subtle ink-tinted grid lines at 24px with a dot accent at 96px intervals, plus a surface gradient. Expose as CSS custom properties.
- `$texture-blueprint-field` — stronger signal-blue grid at 96px major / 24px minor, on a blueprint-tinted surface. For diagram panel backgrounds.

Export all new tokens as CSS custom properties from `_vue-frontend.scss`.

## Typography

Keep IBM Plex Mono italic as the heading voice — this is the one consistent win across all runs. Do not change body copy (IBM Plex Sans).

The hero typography (aspirational Edwardian Script + Bodoni z37 display font experiment) is deferred — it requires loading new web fonts and visual tuning that is out of scope for this pass. The hero h1 should use IBM Plex Mono at a large display size for now, with strong weight and slightly positive letter-spacing.

Mono uppercase labels (kicker text, metadata, section accents) should use modest positive letter-spacing (0.08–0.22em). Never negative letter-spacing in compact UI labels.

## Anti-Goals — BTAK (Bullshit Techno-Aesthetic Kayfabe)

Any design element that performs meaning it doesn't carry is BTAK. Specific things to avoid:

- "Signal Garden", "Lab Terminal", "Vital Signal", "Primary Artifacts", "Live Feed", "Writing log / recent logs", "writing feed" — none of these
- CSS `::before` pseudo-content used as fake window title bars with made-up label text
- "Case Study" or "Selected Work" labels on individual case study cards — labeling every grape a grape
- "Note" or "Artifact" labels on testimonial cards
- "EOF" or "01 / Index" or similar fake terminal/indexing UI
- "Employer notes" as the testimonial section eyebrow — reframe toward "From collaborators" or simply use no eyebrow at all
- The `::after` chart-like bar graphic on Side Projects can stay as a decorative texture element but should be more abstract and less "business graph" shaped — use a crosshatch or generative CSS pattern instead

## Section-by-Section Synthesis

### Homepage Hero
Best reference: blue1.3 structure with blue1.2 chrome.

- Home page background: `$texture-paper-grid` applied to the full `.home-page` wrapper
- Hero region: a framed `.hero-display` panel with `border: var(--border-window)`, `background: var(--texture-blueprint-field)`, and a `$shadow-soft-mid` or `$shadow-hard-low`. The card-like frame from blue1.2 and the grid background from blue1.3 are the best combination.
- Decorative diagram element: the radial circle diagram from blue1.3 (CSS-drawn, positioned top-right of hero panel) is good. Keep it. It gives visual texture without implying false data.
- No hero chrome bar ("01 / Index", asterisk, "system web / research / tools", "est 2026" — none of these)
- Hero h1: IBM Plex Mono, large display size (clamp 4–8rem), moderate weight, tight line-height. Color: `var(--color-ink)`. Not uppercase for the main h1.
- Mega-text (B.L.U.F.): mono, small, uppercase, muted — label energy not heading energy
- Subtitle: body text, italic, muted. Small bullet dot `::before` in primary blue (from blue1.3) is a nice touch.

### Vital Info
Best reference: blue1.2, minus the fake "Vital signal" title bar.

- The whole section is a framed card: `border: var(--border-window)`, `background: var(--color-surface-soft)`, `box-shadow: var(--shadow-hard-low)`.
- No CSS pseudo-content title bar. The "Vital info" eyebrow text stays as a real `<p>` element.
- Quick links (Resume, Github, etc.) use the blue1.2 `::after { content: 'open' }` pattern — label on left, "open" in primary blue on right. This makes them unambiguously links without needing underlines that would conflict with the eyebrow text.
- "More about me" link: distinguish it clearly from the eyebrow. Use an arrow `→` before or after the text (from blue1.6), combined with the existing rich-link underline animation. The arrow makes it read as a navigation action, not a section label. Example: `→ More about me`.
- Left column: intro/tagline + more-about-me. Right column: quick links. Two-column grid as in academia.

### Selected Work
No run did this well. Keep it simple and invest in the heading.

- Section is full-width (not a card). No framed section header card.
- Section heading: large IBM Plex Mono italic, left-aligned or right-aligned. A short horizontal rule in primary blue above or below the heading (like the dash accent from blue1.3).
- No "Primary artifacts" text. No "Case Study" label on every card. The kicker can say "Selected Work" and nothing else.
- Case study cards: long thin strips are acceptable. The slip panel treatment (from the existing featured-media-overlay recipe) should be clean and flat. No blue backgrounds on the slip.

### Testimonials
Best reference: blue1.2 card shadow/border + blue1.3 dash rule accent.

- Rename eyebrow: from "Employer notes" → remove the eyebrow entirely, or use something like "Collaborators" if a label is needed.
- Section background: pale blue-tinted dot grid (the `background: linear-gradient(90deg, $color-ink-04 1px, transparent 1px)` grid from blue1.3, or a dotted version).
- Each testimonial card: `border: var(--border-default)`, `box-shadow: var(--shadow-soft-low)`, no radius. The blue1.3 dash bar `::before` (repeating-linear-gradient dash marks) is a nice non-BTAK accent — keep it.
- Section heading: large mono italic, sticky on desktop.
- Attribution: italic, muted. Small, not uppercase.

### Side Projects
Best reference: blue1.2 dark section, minus "Lab Terminal" text.

- Background: `$texture-terminal-scanline` (dark ink scanline texture from blue1.2). Color: white.
- No "Lab Terminal" label. No fake title bar. The eyebrow can just say "Side Projects" or nothing.
- The CSS chart-like shape in `::after`: replace the bar chart silhouette with a more abstract decorative pattern — crosshatch lines, a dot matrix, or a circuit-trace-like line pattern. Less "business graph", more "generative diagram".
- Terminal green (`$color-terminal`) as the accent: eyebrow text, border on the CTA, `::after` content color.
- CTA link: bordered in terminal green, green label, with a lateral `translateX` hover effect.

### Latest Writing
Best reference: blue1.2 section title + card chrome.

- Section heading: full-width, not a card. Large mono italic title. The blue1.2 circle crosshair mark positioned in the section label area is a good decorative accent — keep it or simplify to a smaller mark.
- No BTAK section label text ("Writing feed / recent logs").
- Post cards: thick black outline (`border: var(--border-window)`), hard shadow (`$shadow-hard-low`), card lift on hover (`translate(-0.15rem, -0.15rem)` + stronger shadow). This is the blue1.2 card treatment and it's the best across all runs.
- View writing archive link: styled as a distinct button-like action (not an inline text link), to differentiate it from the vital info / side projects CTAs.

### Nav
Best reference: blue1.3, directly.

- Home nav (homepage top): sticky, `border-bottom: var(--border-strong)`, mono uppercase small links, fill-background-on-hover in primary blue (not cobalt-fill, but the periwinkle which is less intense).
- Local/interior nav: positioned floating pill, `border: 1px solid var(--color-primary)`, links with persistent underline and nudge-up hover animation (blue1.3 pattern).
- Home-link: mono, uppercase, weight 600, modest letter-spacing.
- No "AF" monogram. Home link is just "Home" text or the site name.

### Footer
Best reference: blue1.1.

- Top border: `border-top: var(--border-strong)` — the single most impactful touch from blue1.1.
- Background: `var(--color-surface-warm)` (note: the academia baseline had a broken `--color-paper-warm` token — use the correct token).
- Heading: large mono, tight tracking. Italic. Ink color.
- Links: mono, small, uppercase, modest tracking. Hover → `var(--color-primary)`.
- Base bar: muted mono small text, top border.
- No "EOF", no "Outgoing Channels" — just clean structure.

### Editorial Content (article body blocks)
Academia baseline wins for most editorial blocks. Keep:
- Quote block: left border in primary blue (not cobalt-intensity)
- Pullquote: top/bottom border rules in primary blue
- Code block: keep the existing retroterm style; consider removing the outer box-shadow if present
- Tables: dark outline + hard shadow (blue1.2 style) as an improvement over the soft default
- Headings, blockquotes, details, accordion: academia baseline is fine

## What Not to Do

- Do not use cobalt-intensity blue (`#073bff`, `#0038ff`) — use the periwinkle `#2657eb`
- Do not add CSS pseudo-content with fake label text unless it is doing real work
- Do not frame section headings as cards; full-width headings create better page rhythm
- Do not add drop shadows or card borders to pullquotes or blockquotes; they should read as content, not UI components
- Do not label every element of a type with that type's name
- Do not create hover states that use blue as a full-element fill; blue underlines and border-color changes are sufficient
