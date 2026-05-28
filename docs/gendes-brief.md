# Generative Design Brief — Semplice

## Branch

- Branch name: `gendes-semplice.copilot`
- Baseline branch: `gendes-academia`
- Mood-board folder: `docs/gendes-moodboard/gendes-semplice.copilot/`
- Working title: Dark Studio

## Thesis

The academic baseline is a library. This branch is a studio. The site inverts its ground: near-black becomes the dominant surface, and the work arrives as light — color fields pulled from each project's identity emerging from the darkness. It should feel like entering a well-designed creative practice's physical space: dark walls, deliberate lighting, work hung without apology.

The typographic move abandons the quiet italic mono heading voice in favor of something louder — a bold condensed grotesque that fills space the way a gallery title card commands a wall. Body reading surfaces stay light so long-form text remains comfortable. The tension between the dark shell and the light interior is the site's structural argument.

## References

- **vanschneider.com** — dark-first studio site, per-project color fields, bold display grotesque, stately pacing, personal sign-off in the footer. Borrow the inversion logic and the chromatic field-per-project strategy. Do not copy HOVS branding, baroque ornaments, or horizontal media sliders.
- **Semplice portfolios** (the platform TVS co-founded) — confident white-on-dark card compositions, generous use of negative space, work as the visual subject.

## Palette

The palette inverts the academic baseline. Near-black is the primary ground; white is reserved for reading surfaces (article bodies, writing cards).

- **Ground/background**: `#111110` — warm near-black (not blue-cast, slightly warm)
- **Elevated surface**: `#1c1c1b` — card/section dark lift
- **Reading surface**: `#f8f6f0` — warm off-white (preserved from academia baseline, used for article body and writing cards)
- **Ink-on-dark**: `#e8e4dc` — warm near-white for primary text on dark backgrounds
- **Muted-on-dark**: `#7a7570` — warm medium gray for secondary text, meta, labels on dark
- **Border-on-dark**: `rgba(232, 228, 220, 0.10)` — subtle hairline on dark surfaces
- **Ink-on-light**: `#0c112b` — preserved from academia (near-black navy for text on reading surfaces)
- **Muted-on-light**: `#4e5774` — preserved from academia
- **Accent**: `#e8e0cc` — warm parchment/cream accent for highlighted text, not blue
- **Case study color fields** (faked brand colors, one per card slot, rotated): `#c44b1e`, `#1a3fbf`, `#d4a017`, `#2a6b4a`, `#7c3060`

## Typography

The heading voice shifts from quiet italic mono to loud condensed grotesque. Body text stays neutral and legible.

- **Display/hero headings**: Bebas Neue — free Google Font, ultra-condensed all-caps grotesque. Used for the hero mega-text and section titles. Not italic. Size-maximizing — should fill available width.
- **Sub-headings / card titles / UI labels**: Barlow Condensed ExtraBold — free Google Font, condensed grotesque with more weight options than Bebas. Used for section h2 labels, card titles, nav.
- **Body / paragraph text**: IBM Plex Sans — keep. Clean grotesque, already loaded, pairs well.
- **Article body text**: Fraunces — free Google Font, a contemporary optical-size-aware serif. Used only for article `.content-flow` body text on reading surfaces (writing and case study detail pages). FK Roman-adjacent in spirit.
- **Scale**: Display scale gets bigger — hero heading should be 12–18vw territory. Section labels stay measured. Article body stays at comfortable prose size.
- **Letter-spacing**: Bebas Neue headings: track slightly loose (~0.04em). Barlow Condensed labels: tight to zero. Body: normal.
- **What not to do**: Do not use Bebas Neue for body text. Do not italic Bebas. Do not mix mono italic into this direction.

## Surface and Material

- **Surface logic**: No card borders. No box-shadows. Dark sections are flat full-bleed color fields. Case study cards use a full-bleed color field background drawn from the case study's faked brand color. Writing cards use the warm reading surface (`#f8f6f0`) with no shadow/border lift.
- **Hairlines**: A single-pixel warm-white/10% rule is used as a section separator on dark surfaces. No decorative rules on light reading surfaces.
- **Texture/noise**: None — lean on the dark-and-light value contrast rather than grain or texture.
- **Shadows/depth**: Removed. The academic baseline's `shadow-soft-mid`/`shadow-soft-high` card lift pattern does not carry over. Depth comes from color field contrast, not box-shadow.
- **Media framing**: Featured media on case study cards bleeds to the card edges. No rounded corners. On reading surfaces, media keeps its existing rectangular framing.

## Layout and Composition

- **Homepage hero**: Full-viewport-height dark section. The mega-text becomes a display headline in Bebas Neue at an extreme scale — aim for the text filling most of the viewport width. The title and subtitle stack below in Barlow Condensed and IBM Plex Sans respectively. Dark background so the first thing the visitor sees is text on black.
- **Case study cards**: Full-bleed color field backgrounds instead of image-over-ink. The featured image fills the card but the color field should be visible as a framing element — use the color as a card background that shows in areas without image. Text label box becomes lighter/more translucent. Cards have no borders.
- **Writing cards**: Warm reading-surface background (`#f8f6f0`). No border, no shadow. The date and title use the dark ink color. A subtle hairline rule separates the cards from the dark page background when the archive sits on a dark context.
- **Selected Work section**: Dark section — inherits the page dark ground. The section heading becomes a large Bebas Neue display title. Cards arranged in the existing grid.
- **Latest Writing section**: Can remain a lighter island (the writing surface color) to create a breathing contrast against the dark body.
- **Footer**: Dark, full bleed. Large personal sign-off text at center-top — a personal phrase rather than a utility heading. Footer nav links in Barlow Condensed. Copyright and source in small Plex Sans. No decorative ornaments.
- **Nav**: White/cream sticky bar over dark content. Logo left, minimal links right.
- **Mobile**: Font sizes scale down but maintain the dark-first logic. Cards stack single-column.

## Motion and Interaction

- **Page/route motion**: Preserve existing featured-media transition system. Keep transition hooks untouched.
- **Hover/touch behavior**: Case study card hover — subtle scale of the featured media image (already in existing cards), no lift. Writing card hover — opacity shift or background lightening, no lift.
- **Reduced-motion**: All transitions wrapped in the existing reduced-motion infrastructure.

## Accessibility and Usability

- **Color contrast**: Text on dark ground must meet WCAG AA. `#e8e4dc` on `#111110` is well above 4.5:1. Check all muted text placements.
- **Focus states**: Existing `:focus-visible` global fallback preserved. Custom focus on dark surfaces should use a warm-white outline.
- **Link affordances**: Case study cards are full-area links (existing). Writing card links should remain clearly linked. Footer links get a visible hover underline.
- **Readability**: Article body Fraunces serif should be sized generously — no smaller than 1.1rem.

## Anti-Goals

- Avoid baroque ornaments, cherubs, or anything HOVS-brand-specific
- Avoid horizontal image sliders (too much JS, complicates the transition system)
- Avoid per-project color that comes from nowhere — the faked brand colors should feel intentional even if they are not literally correct
- Avoid the "dark mode toggle" look — this is not a UI preference, it is the designed state
- Avoid mixing the academic mono-italic heading voice with the new condensed grotesque — pick one direction per surface
- Avoid over-engineering the color system — the color fields are simple background overrides per card slot, not a dynamic theme engine
- Avoid pure `#000000` black — use the warm near-black `#111110` for softness

## Implementation Notes for the Agent

Edit palette files, `_type-fonts.scss`, `_type-palette.scss`, shared-component recipes, scoped SFC styles, and supporting SFC markup. Case study card color fields can be faked with CSS `nth-child` color rotation using the palette's brand-color list. Preserve all transition data hooks (`data-featured-*`, `clip-path`), the content model, GraphQL query shape, and static deploy infrastructure.

Expected checks:

- `corepack pnpm check`
- Visual QA via `corepack pnpm generate:static:public` + `corepack pnpm start:static:preview`

## Handoff Summary

When the branch is ready for human review, summarize:

- Main visual decisions:
- Files changed:
- Known compromises:
- Screens or routes that need special QA:
- Whether static generation was smoke-tested:
