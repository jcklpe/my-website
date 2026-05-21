# Generative Design Brief — pop-colors

## Branch

- Branch name: `gendes-pop-color.copilot`
- Baseline branch: `gendes-academia`
- Mood-board folder: `docs/gendes-moodboard/pop-colors/`
- Working title: Neon Kabuki / Electric Ukiyo-e

## Thesis

The site should feel like a cabinet of wonders built by someone who carries multiple aesthetic lineages at once — Japanese ukiyo-e tradition pushed through neon voltage, Swiss International Style poster discipline, dense festival-poster energy. The page itself is a colored object, not a white document. The ground is deep royal blue, the text is warm cream, and the accent system is hot pink + electric green + warm yellow — print-register flat color without gradients or soft-glow digital effects.

This direction reveals something specific: the work comes from someone who sees East Asian graphic culture and mid-century Swiss typography as the same conversation — form-first, color-confident, technically exacting. The site is not neutral container for portfolio items. It is itself a designed thing, with the energy of a festival program.

## References

- `9cb64230c248abeb180b8fa5a3de65d9.jpg` — Kabuki theatre poster (国立劇場), ukiyo-e imagery rendered in neon: electric pink, fluorescent cyan, UV blue. **Primary reference.** Borrow: royal blue border/ground, neon accent palette, dense composition, cream text on dark. Avoid: literal illustrative elements.
- `3233e96e77574861f2c4d562a89d9d40.jpg` — "Wild in der Küche" Swiss museum poster, 1995. Hard horizontal split, cobalt blue field, red figure silhouette, bold condensed type. **Primary reference.** Borrow: flat color, typographic structure, section-by-section color thinking. Avoid: literal animal motifs.
- `4d2e9e9167ef4974481381276f58b5c1.jpg` — COART 2013 festival poster (Lijiang). Giant display type filled with illustrations, yellow information bar at bottom. Borrow: type-as-surface, information density in a structured band.
- `157de6b55928b2ba13eb417343853789.jpg` — Playmobil primary-color energy. Borrow: direct color pairings, toy-object flatness.
- Festival poster + Swiss poster synthesis: **festive energy, graphic structure**.

## Palette

- Ground/background: Deep royal blue `#1638cc` — the page is a colored object. No off-white, no warm neutral.
- Ink/text: Warm cream `#f5edcf` — aged-paper warmth under neon light. Not pure white.
- Accent 1 (primary): Hot pink/magenta `#ff2766` — Kabuki sky, cherry blossom. Used for links, interactive states, key emphasis.
- Accent 2: Electric green `#00e87a` — Kabuki wave foam, Swiss illustration green. Used sparingly for secondary highlights and hover states.
- Accent 3: Warm yellow `#ffd000` — festival warmth, COART info bar. Used for tertiary callouts.
- Muted text: Cream at ~55% opacity — for captions, meta, kickers.
- Surface alt (card color): Slightly lighter blue `#1e48e8` and accent-tinted variants for card stage-colors.
- Contrast constraints: All text/background pairings must clear WCAG AA. Cream on royal blue clears easily. Pink accent must not be used as body text on blue without size and weight compensation.

## Typography

- Primary body face: IBM Plex Sans (keep — legible, workhorse)
- Heading voice: **Barlow Condensed** ExtraBold (800 weight) — condensed poster-type energy, replaces IBM Plex Mono Italic for display headings. Upright (not italic), condensed, assertive. The type earns space by being bold not precious.
- Scale and rhythm: Display headings push large and condensed. Body scale unchanged. Tighter letter-spacing on headings (`-0.02em`). Section labels/kickers: small-caps or spaced uppercase in IBM Plex Sans.
- Letter-spacing/weight behavior: Headings tightly set. Kickers and labels: `0.2em` tracking (like the academic baseline but now in Sans not Mono).
- What not to do: No italic display type. No soft weight headings. No mixing the condensed and regular width in the same heading context.

## Surface and Material

- Surface logic: Flat color, print register. No gradients, no blur, no soft-light drop shadows. Everything is opaque and decisive.
- Borders/rules: Thick horizontal rules in accent color (pink or green) as section dividers. 2–4px bright stripes rather than hairlines. The "registration mark" feeling from print culture.
- Texture/noise: Remove the paper-grid texture — it belongs to the academic baseline. The blue ground is clean and flat.
- Shadows/depth: Minimal. If needed, a sharp offset shadow (not Gaussian blur) using a deeper blue or pure black. Prefer flat stacking to shadows.
- Media framing: Image frames can have a thick colored border (accent color). The frame is itself a designed element.
- Card stage-colors: Each case study card gets a distinct background from the accent palette (pink, green, yellow cycling), making the Selected Work grid feel like a festival program where each entry is a different stage.

## Layout and Composition

- Homepage: Hero is large, typographically aggressive. The mega-text kicker and h1 should fill the frame like a poster headline. Ground color = page ground (no separate hero background).
- Cards: Selected Work cards have colored grounds (stage-colors per card). Writing cards are simpler — light text on blue, possibly with a bright left border for each post card.
- Article rhythm: Content-flow grid intact, but code blocks, pullquotes, and rules pick up the accent color vocabulary.
- Footer/nav: Footer is a dark-on-dark section — a slightly deeper blue or near-black section at the bottom, creating a "foot of the poster" feeling. Nav is minimal as per the existing design, but the home link and kicker labels pick up the accent color.
- Mobile behavior: Headings stay condensed and large on mobile. Card stage-colors still apply. Single-column stacking.
- Composition experiments: Section headers as full-width color bands (a stripe of pink or green behind the section label). Cards with colored grounds + thick bottom border in a contrasting accent.

## Motion and Interaction

- Page/route motion: Keep existing timing and easing. The transition system hooks are not to be touched.
- Hover/touch behavior: Cards hover with a sharp vertical translate (no shadow lift) — flat objects that slide, not float. Links underline in the accent color.
- Scroll behavior: No parallax. Clean scroll.
- Reduced-motion expectation: All animation reduces to instant or opacity-only. Existing reduced-motion handling carries forward.

## Accessibility and Usability

- Color contrast: Cream `#f5edcf` on royal blue `#1638cc` — contrast ratio ~8:1. Hot pink `#ff2766` on blue — ~3.5:1 (sufficient for large text / UI elements, not body text). Verify all pairings against WCAG AA before calling the branch a candidate.
- Focus states: Keep the global `:focus-visible` outline. Override color to hot pink for the pop-color branch so it remains visible against the blue ground.
- Keyboard behavior: All existing keyboard patterns hold.
- Link affordances:
- Readability:

## Anti-Goals

Name the cliches, motifs, effects, and directions this branch should avoid.

- Avoid:
- Avoid:
- Avoid:

## Implementation Notes for the Agent

The agent may edit palette files, shared-component recipes, scoped SFC styles, and supporting SFC markup where the visual direction needs it. Preserve the content model, GraphQL query shape, block registry, transition data hooks, static deploy scripts, Docker infrastructure, and CMS schema.

Expected checks:

- `corepack pnpm check`
- SSR review via `corepack pnpm start:frontend` at `http://my-website.localhost`
- Static generation smoke test before a winning branch is merged

## Handoff Summary

When the branch is ready for human review, summarize:

- Main visual decisions:
- Files changed:
- Known compromises:
- Screens or routes that need special QA:
- Whether static generation was smoke-tested:
