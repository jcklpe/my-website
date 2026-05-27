# Generative Design Brief — `gendes-Jackalope.copilot`

## Branch

- Branch name: `gendes-Jackalope.copilot`
- Baseline branch: `gendes-academia`
- Reference source: `temp-ref-assets/Jackalope/` — the original WordPress portfolio theme built by the same author, circa 2018–2019
- Working title: Jackalope

## Thesis

This is a direct port of the original Jackalope WordPress theme to the Vue frontend — a deliberate act of translation, not reimagination. The old theme was bold, graphic, and unapologetically a portfolio: black ground, one electric blue accent, a brush display font, and a set of signature CSS techniques that gave the work presence on screen. It was designed when the author was learning by doing, and the confidence of that directness still holds up.

The port is as literal as the new architecture allows. Where the old theme used PHP template parts and jQuery, the Vue components take their place. Where WordPress's block structure didn't exist yet, the Gutenberg rendering pipeline handles it now. The visual DNA is preserved: the same color logic, the same typographic character, the same interaction signatures.

The goal is not nostalgia. It is to ask whether the original design instinct was right all along.

## References

The primary reference is `temp-ref-assets/Jackalope/assets/build/style.css` and the SCSS sources under `temp-ref-assets/Jackalope/assets/src/scss/`. All visual decisions should trace back to what the original theme did, with adaptation only where the new architecture requires it.

Key patterns to port faithfully:

- **Box-shadow text technique**: heading spans sit on black backgrounds, extended horizontally via `box-shadow` with the blue as a 3px bottom edge and a trailing shadow stack. The hover state collapses the shadow inward. This is the single most distinctive visual motif.
- **Case study sections**: each is a full-viewport panel (`min-height: 85vh`) with a fullscreen background image, inset dark vignette, and the box-shadow title card. Sections use `clip-path` diagonal cuts and negative bottom margins to stack seamlessly.
- **Blog archive layout**: alternating left/right split — image on 40% side, white text panel on 60% side, with a notched CSS chevron between them. Also diagonally clipped and stacked.
- **Bracket link style**: `p a` elements wrap with `[ content ]` pseudo-elements, blue fill slides up from below on hover (`translateY(95%) → translateY(0)`).
- **Nav rollover**: uppercase sans, hover causes the label to translate upward and reveal a bold duplicate via `data-hover` + `::before`.
- **Section headings**: very large (5–6vmax), brush font, displayed on a full-width black background using the same box-shadow extension technique.

## Palette

The palette is a direct carry from the original theme variables. This is not an interpretation — use these exact values.

- **Ground/background**: `#141414` — near-black. Not pure black; the `#141414` warmth is part of the character.
- **Secondary dark** (section backgrounds, overlay panels): `#0a0a0a` — slightly deeper, used in title card backgrounds.
- **Charcoal dark** (shadow color in box-shadow stacks): `#1e231e` — the original `inset` shadow color, a dark greenish-black that gives depth.
- **Text on dark**: Pure white `#ffffff` for display headings and nav. Off-white body text on dark sections can match.
- **Text on light** (article body): `#292929` — used on white backgrounds in the original entry-content.
- **Background for article content sections**: White `#ffffff` — article body remains light-ground, dark-ink. The blog post text panels were white in the original.
- **Primary accent**: Electric blue `#2657eb` — the only accent color. Used for: link hover fill, the 3px bottom shadow in box-shadow headings, button backgrounds, selection color, focus states.
- **Code foreground**: `#c85e7c` — pink code color from the original.
- **Code background**: `#322931` — dark charcoal from the original.
- **Selection**: `#2657eb` — blue selection, same as accent.
- **No secondary accent**: The original theme used only one accent. Do not add secondary colors. If a surface needs color, use blue or black.

## Typography

The font strategy mirrors the original exactly. Fonts are self-hosted from the files in `temp-ref-assets/Jackalope/assets/fonts/` and served from `apps/frontend/public/fonts/`. The `apps/frontend/public/fonts/` directory is gitignored — do not commit font files.

- **Display/heading font**: `dead_stock` — a brush/grunge display font. Used for: major section headings (`h1` and large `h2` in case study panels, "About Me" style section markers), the homepage hero. Self-hosted as `dead_stock-webfont.woff2` / `.woff`.
- **Body/UI sans family**:
  - `AllerBold` — for nav labels, bold UI elements, section subheadings.
  - `Aller` — for general body text and UI.
  - `AllerLite` — for paragraph prose.
  - All self-hosted from the Aller woff/woff2 files.
- **Monospace**: IBM Plex Mono (keep from baseline) for code. The original used a custom `Input` font for code; IBM Plex Mono is the existing infrastructure and close enough in character.
- **Heading weights and sizing**:
  - Section headings in `dead_stock`: 5–6vmax, no font-weight override needed (brush fonts don't have weight variants).
  - Case study title `h1` in `dead_stock`: 7vmax.
  - Nav links: `Aller`, uppercase, 1.45em, `letter-spacing: 1px`.
  - Body paragraph text: `AllerLite`, 1em (18px base from original).
  - Article `h2/h3/h4`: `Aller`/`AllerBold`, weights as per the original entry-content styles.
- **What not to do**: Do not use `dead_stock` for body text or small labels. It is a display-only face. Do not import any Google Fonts — this direction is self-hosted only.

## Surface and Material

The primary material language is black panels with white ink, occasionally broken by full-bleed photography.

- **Ground logic**: Page background is `#141414`. Most sections are dark. Article body content (`.content-flow`) uses a white or very light background for readability — mirroring the original's `article { background-color: #fff }`.
- **Box-shadow text**: The signature technique for all heading labels over photo backgrounds. The span element has a black background, with `box-shadow` extensions left and right to fill the full block width, and a trailing shadow stack for depth. The 3px `#2657eb` bottom edge is the blue accent applied as a structural element, not decoration.
  - Default state: `box-shadow: .3em 0 0 #000, -5em 0 0 #000, 0 3px 0 #2657eb, 0 14px 10px rgba(0,0,0,.15), 0 24px 2px rgba(0,0,0,.1), 0 34px 30px rgba(0,0,0,.1)`
  - Hover state collapses the drop shadows, box expands laterally.
- **Inset vignette**: Case study and hero sections use `box-shadow: rgba(0,0,0,0.85) 1px 7vw 100px inset` for the dark edge vignette over images.
- **Diagonal clip-paths**: Sections use `clip-path: polygon(0 0, 100% 5vw, 100% 100%, 0 100%)` or its mirror. Sections have `margin-bottom: -5vw` to stack without gaps. This creates the angled-strata homepage rhythm.
- **Article content sections**: Use `clip-path: polygon(0 0, 100% 5vw, 100% 100%, 0 100%)` with `margin-top: -5vw` to come in over the previous section.
- **No decorative borders or frames on images**. Images are full-bleed within their containers. The dark vignette inset is the only framing device.
- **Button style**: Blue background `#2657eb`, no border-radius, uppercase text, with `box-shadow` extensions. Hover: background darkens or the shadow widens.

## Layout and Composition

### Homepage

The homepage is restructured significantly from the current architecture. The "Selected Work" section becomes a full-viewport-per-card stacked panel layout, mirroring the original's `section.case-study-section` per case study.

- Each case study gets its own full-viewport section (`min-height: 85vh`) stacked diagonally.
- The featured image fills the section as a background (`object-fit: cover`), with the dark inset vignette.
- The title card sits at top-left (approximately `top: -75px`, left-aligned padding) using the box-shadow text technique.
- A subheading line sits below the title, also using the box-shadow technique at a smaller scale.
- On hover: the background image translates (slides subtly right), the box-shadow on the title collapses and expands laterally.
- The entire section is the link target.
- Transition system hooks (`data-featured-*` on `FeaturedMediaFrame`, `clip-path` on image containers) must be preserved — integrate them into the new panel layout rather than removing them.

### Hero (Homepage top region)

Replace the current homepage hero with a text-only glitch hero.

- Full-viewport section, black background.
- Large display text reading **"Design X Code"** in `dead_stock` at maximum impact scale (~10–12vmax or `clamp`-scaled).
- Glitch effect: CSS-only multi-layer glitch using `clip-path` + `translateX` animation on pseudo-elements. The glitch should be subtle — present and felt, not a constant strobe. Think: a brief glitch loop on load, then idle with an occasional flicker.
- Text color: white with the blue `#2657eb` visible in the glitch offsets.
- No background image, no video embed.
- The "Design X Code" phrasing is the hook — style the "X" differently (blue, or slightly larger) if it reads well.

### Writing archive

The writing archive card list becomes the alternating split layout from the original `figure.blog-post-section`:

- Each post card is a large figure (~80vh tall) with an image side and a white text panel side, alternating left/right.
- Image area: 40% width, full-height background image with a dark overlay at 70% opacity.
- Text panel: 60% width, white background, flex-centered vertically.
- Title uses the box-shadow technique on black: white text, black bg span, blue bottom edge shadow.
- Excerpt below the title in the same box-shadow treatment but smaller.
- The notched CSS chevron between image and text is formed with a `::before` border triangle on the text panel: `border-left: 25px solid white` / `border-top: 50px solid transparent; border-bottom: 50px solid transparent`.
- On hover: the chevron expands (`border-left: 61px solid white; border-top: 150px ...`), the image translates, the title shifts.
- Even sections: `clip-path: polygon(0 0, 100% 5vw, 100% 100%, 0 100%)`. Odd sections: `clip-path: polygon(0 5vw, 100% 0, 100% 100%, 0 100%)`. Both with `margin-bottom: -5vw`.
- On mobile: image fills the section at reduced opacity, text panel goes full width transparent over it, chevron hidden.

### Article / detail pages

- Keep the `.content-flow` grid intact for block rendering.
- Article sections clip in over the hero using the diagonal pattern.
- Headings inside article body use `Aller`/`AllerBold` at the original entry-content sizes; the box-shadow technique is reserved for display headings and label-over-photo contexts.
- Code blocks: retain existing `_code-block.scss` recipe, swap code foreground/background to the Jackalope values (`#c85e7c` / `#322931`).

### Navigation

- Nav links: `Aller`, uppercase, white, with the rollover animation — the current nav text slides up on hover, a bold (`AllerBold`) duplicate appears from below.
- This is achieved with `data-hover` on the `<span>` and a `::before` pseudo-element positioned at `top: 100%`.
- Keep existing `SiteNav` component structure; update styles and add the data attribute.
- No background on nav at rest. Nav text is white — the dark page ground provides sufficient contrast.

### Footer

- Dark background continuing from the page ground.
- Footer links use the slide-up blue fill hover pattern: `::before` pseudo-element at `translateY(95%)` rest, `translateY(0)` on hover.
- Footer link text white on black, hover: white text on blue.

### Side Projects and About pages

- Side projects page: retain the current `BlockRenderer` approach. Add the diagonal clip-path entry for the content section.
- About page: the display heading uses `dead_stock` at large scale with the box-shadow technique. Body content remains through the block renderer.

## Motion and Interaction

- **Animation curve**: `cubic-bezier(0.84, 0.01, 0.19, 0.93)` — this is the original `$AniCurve`. Use it as the default easing for all hover transitions and link fills. It has a fast start / gentle settle character.
- **Transition durations**: 0.2s–0.5s for hover states (mirroring the original). Link fill: 0.25s. Box-shadow collapse on title hover: 0.3s in, 0.5s out. Image translate: 0.5–0.8s.
- **Featured-media transition**: preserved exactly. The `clip-path` and `data-featured-*` hooks are untouched.
- **Link fill**: the blue `translateY` reveal is the universal link hover pattern. Apply it to nav, footer links, and inline prose links.
- **Reduced-motion**: the glitch hero animation must be gated on `@media (prefers-reduced-motion: no-preference)` — use a static fallback. All other hover motion should follow existing `prefers-reduced-motion` conventions.

## Font Hosting Notes

Fonts live at `temp-ref-assets/Jackalope/assets/fonts/`. Copy the following to `apps/frontend/public/fonts/`:

- `BrushFonts/dead_stock-webfont.woff2` and `dead_stock-webfont.woff`
- `Aller/AllerBold.woff2`, `AllerBold.woff`
- `Aller/Aller.woff2`, `Aller.woff`
- `Aller/AllerLite.woff2`, `AllerLite.woff`

Add `apps/frontend/public/fonts/` to `.gitignore`. Do not commit font files.

Declare all `@font-face` rules in `packages/styles/_type-fonts.scss`. Remove the Cormorant Garamond Google Fonts import. Keep IBM Plex Sans and IBM Plex Mono loading since they serve the article body and code respectively — or remove them if Aller fully replaces the sans role. Prefer replacing IBM Plex Sans with Aller/AllerLite for body and UI; keep IBM Plex Mono for code only.

## Accessibility and Usability

- **Color contrast**: White `#ffffff` on `#141414` is approximately 16:1 — well over AAA. Blue `#2657eb` on `#141414` is approximately 5.1:1 — clears AA for large text and UI. For small body text the blue must not be used as text color. Verify before use.
- **Dark text on white**: Article body text `#292929` on white is approximately 13.5:1 — AAA.
- **Focus states**: Update the `:focus-visible` outline to blue `#2657eb`. The original theme did not handle focus well; this port should improve on it.
- **Keyboard behavior**: The full-viewport case study panels must be reachable and activatable by keyboard. The entire panel is a link — ensure the tab stop and focus ring are visible.
- **Glitch animation**: Must respect `prefers-reduced-motion`. A completely static fallback for the hero is acceptable.
- **Link bracket pseudo-elements**: the `[ ]` brackets are presentational. Do not let them create extra verbosity in screen readers — they should be `aria-hidden` if added via HTML rather than CSS `content`.

## Anti-Goals

- Do not add secondary accent colors. The original had one accent. Stay disciplined.
- Do not use `dead_stock` below display scale. It is illegible at small sizes.
- Do not add rounded corners, soft shadows, or frosted glass effects. The aesthetic is flat, hard-edged, and graphic.
- Do not add gradient backgrounds. The ground is a flat dark value.
- Do not keep Cormorant Garamond or any other serif face from the nature branch.
- Do not add decorative borders or card frames. The diagonal clip-paths and box-shadows are the framing devices.
- Do not keep green-tinted colors from the nature/academia baseline (`#0d1a14`, `#142a1c`, moss values).
- Do not make the glitch effect a constant animation. It should be brief on load, then settle.

## Implementation Notes for the Agent

The agent may edit palette files, shared-component recipes, scoped SFC styles, and supporting SFC markup. The homepage `index.vue` will need significant markup changes to implement the viewport-panel case study layout and glitch hero. The writing archive page will need new markup for the split-layout cards. Preserve the content model, GraphQL query shape, block registry, transition data hooks, static deploy scripts, Docker infrastructure, and CMS schema.

Font copy command (run once before starting):
```
cp temp-ref-assets/Jackalope/assets/fonts/BrushFonts/dead_stock-webfont.woff2 apps/frontend/public/fonts/
cp temp-ref-assets/Jackalope/assets/fonts/BrushFonts/dead_stock-webfont.woff apps/frontend/public/fonts/
cp temp-ref-assets/Jackalope/assets/fonts/Aller/AllerBold.woff2 apps/frontend/public/fonts/
cp temp-ref-assets/Jackalope/assets/fonts/Aller/AllerBold.woff apps/frontend/public/fonts/
cp temp-ref-assets/Jackalope/assets/fonts/Aller/Aller.woff2 apps/frontend/public/fonts/
cp temp-ref-assets/Jackalope/assets/fonts/Aller/Aller.woff apps/frontend/public/fonts/
cp temp-ref-assets/Jackalope/assets/fonts/Aller/AllerLite.woff2 apps/frontend/public/fonts/
cp temp-ref-assets/Jackalope/assets/fonts/Aller/AllerLite.woff apps/frontend/public/fonts/
```

Then add to `.gitignore`:
```
apps/frontend/public/fonts/
```

Expected checks after implementation:

- `corepack pnpm check`
- `corepack pnpm generate:static:public && corepack pnpm start:static:preview` for visual QA

## Handoff Summary

When the branch is ready for human review, summarize:

- Main visual decisions:
- Files changed:
- Known compromises:
- Screens or routes that need special QA:
- Whether static generation was smoke-tested:
