# Mood Board — gendes-henry.cc ("Digital Garden")

The reference for this branch is a live website, not an image board: `henry.codes` (Henry Desroches). Below are the design tokens and structural moves extracted from the site's real CSS and markup, so the direction is reproducible without relying on a remembered screenshot.

## Source tokens (from henry.codes `:root`)

- `--color-text: #2a2722` (warm espresso near-black)
- `--color-background: #fafafa` (warm near-white)
- `--color-text-mid: #666` (meta)
- `--color-border-mid: #bdbdbd`, `--color-border-light: #eee`
- `--color-echo: #3e3b36` (ghost text)
- Dark mode is structural: sections carry a `themed dark` class that flips bg → `#2a2722`, text → `#fafafa`.
- The only color appears inside callouts/code (Nord palette: `#ebcb8b`, `#81a1c1`, `#b48ead`). Decorative, not brand.

## Type (from henry.codes `fonts.css`)

- **Manuka** (Black) — heavy display sans, hero/statement at `clamp(10rem … 24.375rem)`. → free analogue **Archivo Black**.
- **Louize Display** (+ italic) — editorial serif, literary voice + headings. → free analogue **Fraunces**.
- **Neue Montreal** — clean grotesque body. → free analogue **Hanken Grotesk**.
- **SF Mono** — code. → we keep **IBM Plex Mono** (already wired into Shiki).
- 51 `text-transform: uppercase` declarations; tiny `0.75rem` tracked labels everywhere; tight `-0.01em` tracking on display; occasional `4rem`/`6rem` blown-out letter-spacing as a graphic device.

## Layout / structure (from markup)

Homepage section sequence on henry.codes:

1. `home-hero` — giant `home-hero__title` (Manuka, screen-dominating).
2. `home-nav`.
3. `home-letter themed dark` — a dark "letter to the reader" band.
4. `home-about`.
5. `home-work themed dark` — dark band; Selected Work as full-width `case-study-row` items with huge titles and pseudo-content annotations (`(You Are Here)`, `(Coming Soon)`, `(Read the case study on …)`, external `↗`).
6. `home-articles` — light band; `article-block` cards (rounded `0.75rem` borders, hover border shift, animated underlines).
7. `footer themed dark` — dark footer: breadcrumb, link groups (Garden / Meta), social.

Grid: 12-col with `subgrid`; content offset asymmetrically (`--standard-column: 4 / span 6`). Cards rounded `0.75rem`. Motion: `transform .2s cubic-bezier(0.645,0.045,0.355,1)`, animated `background-size` underlines, one `drift-forever 20s linear infinite` loop. Strong reduced-motion support.

## How we adapt it

See `docs/gendes-brief.md` for the full brief. Key adaptations: warm-espresso monochrome palette, three-family type system with free analogues, alternating light/dark bands via locally-scoped token overrides, Selected Work reframed as editorial rows (preserving the featured-media transition hooks), retired electric-blue accent, adaptive focus token for dark bands. Personal copy is fabricated for Aslan's voice — not reproduced from Henry's site.

Binary reference media (screenshots) stays local and Git-ignored; this notes file is the durable record.
</content>
