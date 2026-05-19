# Generative Design Brief — gendes-blue2

## Branch

- Branch name: `gendes-blue2.claudecode`
- Baseline branch: `gendes-blue2` (neutral starting point off `gendes-blue1`)
- Mood-board folder: `docs/gendes-moodboard/gendes-blue1.1/` (the original blueprint moodboard) plus the live screenshots compared in the Notion **Design System Audit** doc
- Working title: Blueprint Brutalism — synthesis

## Why this branch exists

Eight branches (`systems-atlas`, `blue1.1`–`blue1.7`) explored the blueprint/engineering direction in different ways. The human has now done a per-section audit of all eight runs and written synthesis notes picking the best parts of each. This branch is the **collage of all the best parts** — it is not another from-scratch take. It is the explicit attempt to combine the strongest section-level decisions across runs into a single coherent direction.

The audit and synthesis notes (Notion: *Design System Audit*) are the source of truth for which run wins each section, what specifically gets pulled, and what to discard.

## Thesis

The portfolio is a designed artifact from an engineer-designer who thinks in systems — structured, legible, precise. The blueprint vocabulary (graph-paper texture, panel borders, monospace labels) is intact. Two things change from blue1.1's first pass:

1. **The blue is softer.** Cobalt at full saturation (`#2657eb`) read as eye-blinding when used for hover fills and interactive states. The new primary is a periwinkle — same engineering blue family, lower chroma, still meets WCAG AA on cream. Cobalt as an idea, not a punch in the face.
2. **There is a secondary accent: green.** The Side Projects section in blue1.2 brought in a terminal green against a dark background, and the human responded to it. The site is no longer all-blue-and-cream — green is now a structural accent used sparingly in specific sections (Side Projects primarily, possibly one or two editorial moments).

The goal is still document-tight, blueprint-honest, monospace-led. The synthesis tightens this rather than reinventing it.

## Anti-pattern: BTAK

The human coined the term **BTAK** during review: *Blueprint Techno Aesthetic Kayfabe*. It names a specific failure mode where the design wears the costume of an engineering system without earning the structure underneath.

Examples of BTAK from previous runs:

- "Live Feed" / "Live System Overview" widgets that aren't live
- "Lab Terminal" labels on what is just a CMS link block
- "Quoted Signal" / "Pull Quote / Emphasis Plate" wrapper labels on editorial blocks
- "Note" headers on every testimonial card
- "Case Study" label on every case study card
- "EST 2026" or "01 / Index" decorations that point at nothing
- "EOF" at the bottom of the footer
- "AF" used as a nav home label when "Home" would do

**Rule of thumb:** if the label could be removed and the design still made sense, the label is BTAK and should be removed.

**Counter-rule:** flavor text that *contributes information* (e.g. "Site Map / Outgoing Channels" gives a frame for the footer that "Footer" wouldn't) is fine. The honesty test is whether the label tells the reader something they couldn't otherwise infer.

## Palette

- **Ground**: `#f7f5ef` (`$color-surface`). Unchanged.
- **Ink**: `#0c112b` (`$color-ink`). Unchanged.
- **Primary — periwinkle**: roughly `#4a66d9` (`$color-primary`). Same engineering blue family as cobalt, lower chroma, still 4.5:1 on cream. Used for structural panel headers (sparingly), blueprint grid texture, focus rings, link affordances, nav hover, accent rules.
- **Primary-heavy**: `#2f44a8` (`$color-primary-heavy`) for active/pressed states.
- **Primary-tint**: `rgba(74, 102, 217, 0.22)` for soft fills, grid texture, focus halos.
- **Secondary accent — terminal green**: `#218d4e` (`$color-accent-green`). Used in Side Projects and *maybe* one editorial moment. Not scattered everywhere.
- **Dark surface**: deep ink-based background for Side Projects (and possibly one more dark moment). Green reads better against dark than against cream.

**Contrast guarantees:**

- Periwinkle on cream: 4.5:1 minimum for body text — verify per-implementation
- Green on dark: 4.5:1 minimum — verify per-implementation

## Typography

The Bottom Line Up Front headline is the most ambitious typographic move and is **deliberately unresolved**. The brief is to *experiment*, not to ship a final answer. The three candidate typefaces:

- **Edwardian Script ITC** (or web fallback like Italianno / Allura / Dancing Script) for the script display word
- **Bodoni 72** (or Bodoni Moda / Playfair Display) for the serif display word
- **IBM Plex Mono Italic** for the small accent label word

Compositions to attempt:

- "B.L.U.F." giant in Edwardian behind everything (low-opacity watermark) + "BOTTOM LINE" in Bodoni + "UP FRONT" in IBM Plex Mono Italic
- "Bottom Line" in Edwardian + "UP FRONT" in Bodoni
- Inverse: "Bottom Line" in Bodoni + "UP FRONT" in Edwardian

This is genuinely something to play with. The headline is allowed to be visually loud.

Elsewhere typography rules stay strict:

- IBM Plex Mono for UI labels, navigation, section headers, metadata, captions, code
- IBM Plex Sans for prose body
- Italic IBM Plex Mono for general H2/H3 headings inside editorial content (audit confirmed default heading style was correct)
- ALL CAPS + `letter-spacing: 0.08em–0.12em` for panel labels and nav
- No script faces or italics outside the headline experiment
- No loose tracking on body or display

## Surface and Material

- **Borders/rules**: 1px solid lines in near-black or periwinkle. Section breaks use thin rules. The "blue dash" pattern from blue1.3 (a short repeating dashed-periwinkle swatch as a section signal) is in the kit.
- **Panel headers**: filled panel headers are *sparingly* used now — primarily Selected Work and Latest Writing section titles. Most section signals should be quieter: a thin periwinkle rule, a dash, a kicker label in mono — not a heavy filled strip everywhere.
- **Texture — `--texture-paper-grid`**: extracted from blue1.3. Layered linear-gradients + radial dot pattern in periwinkle at low opacity over the cream surface. Used on the homepage hero and a small number of other moments. Not the page-wide background.
- **Texture — green-on-dark scanline**: a quieter version of blue1.2's `--texture-terminal-scanline` for the Side Projects section. Subtle horizontal scanline lines in dark periwinkle or muted green over a near-black surface.
- **Shadows**: low-offset flat shadows. No soft blur. No depth simulation. Shadows are a printed-system artifact, not a material-design effect.
- **Rounded corners**: by default everything is sharp-cornered. **Exception**: the Latest Writing bento grid cards use rounded corners because they sit in a collection/gallery context — mosaic, browsable, informal — versus the document/panel context of everything else. The rule: *rounded corners are reserved for the gallery surface*. If anything else gets rounded corners, the rule erodes.

## Per-Section Decisions

These are pulled directly from the human's synthesis notes. The winning run is named in parentheses; the brief describes what to actually carry over.

### Nav (blue1.3)

- Sticky home nav, fixed interior nav with auto-hide on scroll-down
- Mono ALL CAPS labels
- **Hover affordance:** sliding background fill (background-size 0% → 100% on a periwinkle linear-gradient), text flips to surface on hover. This is the signature interaction.
- Interior `.is-local` pill nav at top-left (smaller, periwinkle border + low shadow) for detail pages
- No "AF" home label — use "Home"
- No back arrow on "Writing" item
- See `git show gendes-blue1.3:apps/frontend/components/navigation/SiteNav.vue`

### Footer (blue1.1)

- Tall footer (75vh) with cream/warm background
- Large IBM Plex Mono heading at left, mono uppercase link list at right
- Periwinkle top border (thin line)
- Link hover: ink → periwinkle color, no fill, no underline animation
- Source/copyright in a thin base row with a periwinkle top rule
- No "EOF"
- See `git show gendes-blue1.1:apps/frontend/components/navigation/SiteFooter.vue`

### Homepage Hero

- Structure and composition from blue1.3 (the blueprint diagram, bold-outline card framing, the texture-paper-grid behind the headline)
- Card framing and background depth from blue1.2 (windowed card with low shadow)
- Strip the BTAK: no "Signal Garden", no "Live Feed", no "EST 2026", no "01 / Index", no "Field: Portfolio"
- Headline is the **B.L.U.F. typography experiment** — see Typography section
- A small honest breadcrumb at the bottom of the hero is OK if it points at something real; remove if it doesn't

### Vital Info

- Structure from blue1.2 (left-aligned bio + right-aligned link list)
- **Remove the fake window title bar** (no "VITAL SIGNAL" / "SYSTEM.INFO" — BTAK twice)
- Right-side link list uses the "Resume. ____. Open / Github. ____. Open" composition from blue1.2 — distinctive enough that nobody mistakes the links for labels
- Vertical separator between the bio block and the link list, like blue1.6
- **"More About Me" link to the About page gets an arrow affordance** (like blue1.6) so it doesn't read as a section title. Specifically: it sits inline at the end of the bio prose, not as a standalone all-caps periwinkle block.
- See `git show gendes-blue1.2:apps/frontend/components/home/HomeVitalInfo.vue` and `gendes-blue1.6` for the separator/arrow

### Selected Work

- No run nailed this section. Synthesis is: *do something quiet and let the section heading do the work*.
- Layout: long thin horizontal strips for case studies (image-left, content-right) — simple, clean, no card-as-window vocabulary
- Section heading: full-width banner with periwinkle accent (a dash, a rule, or a panel-header strip) — full width, not a card itself
- **No "CASE STUDY" label on every card** — every grape doesn't need labeling
- Hover affordance from blue1.3: subtle grid background + brightness shift on hover
- Card border becomes periwinkle on hover, no shadow lift

### Testimonials

- Card border + low shadow from blue1.2 (`var(--border-window)` + `$shadow-soft-low`)
- Blue dash header swatch from blue1.3 (small repeating periwinkle dash at top of each card — see `git show gendes-blue1.3:apps/frontend/components/home/HomeEmployerTestimonials.vue`)
- **Remove the "NOTE" label on every card** — BTAK
- **Rename the section title:** "Employer notes" is wrong because it foregrounds being an employee. Use **"On the record"** as the working choice. CMS prop name stays `EmployerTestimonial` for compatibility; only visible label changes.
- Quote text in IBM Plex Sans, not italic (italic body was hard to read in the audit)
- Mono name + role/org credit underneath

### Side Projects

- Structure from blue1.2 (full-width section, dark surface, large title, generous link CTA)
- **Strip the BTAK:** no "Lab Terminal" label, no fake bar-chart / fake-data graphic
- **This is the green moment of the site.** Dark surface + terminal green accent — green eyebrow, green hover, green-tinted texture. The dark + green pairing breaks the all-blue rhythm.
- Subtle texture over the dark surface is allowed (scanline, grid) but must not read as "live data"
- CTA reads "Open Side Projects →" — honest call-to-action

### Latest Writing

- **Bento grid layout from blue1.1 is the goal**, but **deferred for this pass**. Implementation is finicky and breaks the card-to-detail back-animation. We will solve that in a follow-up.
- For this pass: keep a clean grid layout (current `posts-grid` or simpler 2-up / 3-up).
- Cards use blue1.2 vocabulary: dark outline border, low shadow, periwinkle hover border, periwinkle hover shadow (no scale transform)
- **Card corner radius:** rounded corners allowed here specifically (see Surface and Material)
- Section title from blue1.2 — full-width panel header with shape and a periwinkle treatment. Full-width, not a card itself.
- Card hover state from blue1.2 (border + shadow shift to periwinkle; no scale transform)
- **No "WRITING" or "WRITING LOG" label on every card** — BTAK
- More-link below the grid says "All writing →" in mono uppercase, no fill on hover

### Headings (editorial)

- Default baseline. Italic IBM Plex Mono. Audit confirmed default was correct.
- H1 follows the page-level display treatment.
- No serif headings.

### Block Quote / Pull Quote / Code Block

- **Default baseline wins** for all three. Audit confirmed.
- Code Block specifically: remove the box shadow.

### Tables

- Combine: thin border + low shadow from blue1.2 (`var(--border-window)` + low shadow), table interior styling from blue1.1/1.5 (the subtle periwinkle line in the header row)
- The blue header-row line is one of the human's favorite editorial touches.

### General editorial content

- Document-rhythm grid stays intact (`.content-flow`)
- Captions are *not* all-caps and *not* on a white box — mono small grey under the image, period. Blue1.2's caption treatment was the worst.
- The **`systems-atlas` topline summary component** (structured key/value block at the top of an editorial page giving project name, role, timeframe) is a candidate to bring in at the top of case study pages. Skip for this initial pass; revisit when actual case study content lands.
- Editorial figure border treatment from blue1.2: dark outline + low shadow on images / code / tables — adopt the outline + shadow, drop the captions-on-white treatment.

## Motion and Interaction

- Page/route motion: keep the existing featured-media card-to-detail transition system intact. Do not touch transition data hooks (`clip-path`, `data-featured-*`).
- Hover: cards shift border color to periwinkle and gain low shadow. No scale transforms. No image zoom. No translateY.
- Scroll: no parallax, no scroll-driven reveals.
- Reduced-motion: behaviors are already minimal; reduced-motion path is nearly the default.

## Accessibility

- Periwinkle on cream meets 4.5:1 for body text (verify per-implementation)
- Periwinkle on dark must meet contrast for Side Projects accent labels
- Green on dark must meet 4.5:1
- Focus rings: periwinkle outline (`outline: 2px solid var(--color-primary)`)
- Link affordances: text links in body copy are distinguishable by color *and* underline-on-rest (or arrow-on-rest for nav-style links). The "More About Me" inline-link problem (looks like a label, not a link) must be solved structurally.

## Anti-Goals

- **Avoid BTAK.** Single most important rule.
- Dark-mode global theme. The cream ground stays.
- Cobalt at full saturation as a hover-fill background.
- Rounded corners outside the Latest Writing bento gallery.
- Italic body or italic prose serif faces.
- Skeuomorphic OS window title bars on Vital Info or other sections.
- Repeated labels on collection items.
- Decorative live-data widgets, fake bar charts, fake counters.

## Implementation Order (for the agent)

1. **Palette and effects** — periwinkle primary, green accent, dark surface, paper-grid texture
2. **Nav** (blue1.3)
3. **Footer** (blue1.1 with periwinkle top border)
4. **Homepage Hero** (blue1.3 structure, BLUF typography experiment)
5. **Vital Info** (blue1.2 structure minus title bar, blue1.6 separator + arrow)
6. **Selected Work** (thin strips, better heading)
7. **Testimonials** (blue1.2 shadow + blue1.3 blue dash, "On the record")
8. **Side Projects** (blue1.2 minus BTAK, with green)
9. **Latest Writing styling** (defer bento layout — cards and section heading only)
10. **Editorial** (italic mono headings, default blockquotes, code without shadow, table combo)

The bento grid layout itself is **explicitly deferred** to a later pass. The card *styling* for Latest Writing is in this pass; the *layout algorithm* is not.

## Expected Checks

- `corepack pnpm check`
- SSR review via `corepack pnpm dev` at `http://my-website.localhost`
- Spot-check: homepage, a case study detail, a writing detail, the writing archive, the about page
- Static generation smoke test deferred until the branch is selected for merge
