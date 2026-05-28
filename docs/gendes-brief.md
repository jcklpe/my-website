# Generative Design Brief

This is the active handoff brief for the current generative design branch.

## Branch

- Branch name: `gendes-henry.cc`
- Baseline branch: `gendes-academia`
- Mood-board folder: `docs/gendes-moodboard/henry.cc/`
- Working title: **Digital Garden**

## Thesis

A literary "digital garden" — warm, introspective, a little melancholic, but technically credible underneath. The reference is the live website `henry.codes` (Henry Desroches). Unlike previous branches, the reference is a website, not an image board, so the source of truth is the site's actual behavior: how it stages type, how it breathes, how it alternates light and dark.

The whole world is **warm monochrome**. There is essentially no brand accent color. All the drama comes from two moves working together: **typography at violent scale contrast** (tiny tracked uppercase labels next to gigantic display type) and **alternating light / dark "themed" section bands** that flip the entire ground from warm near-white to warm espresso as you scroll. The voice is a personal letter — "dear reader, and in fact, dear friend" — paired with playful editorial annotations like `(You Are Here)` and `(Read the case study elsewhere ↗)`.

This branch should feel like a hand-set personal essay that happens to be a portfolio: confident, warm, a bit wry, unmistakably authored by one person.

## References

- Reference: `henry.codes` (live site — analyzed from its real CSS tokens and markup)
- What to borrow:
  - Three-typeface system: a heavy display sans for giant moments, an editorial serif (with a real italic) for the literary voice and headings, a clean grotesque for body. Plus mono for code.
  - Warm-espresso monochrome palette (`#fafafa` ground, `#2a2722` ink); no brand accent.
  - Alternating light / dark section bands as the structural rhythm of the homepage and footer.
  - Selected Work as full-bleed editorial **rows** with gigantic titles and parenthetical annotations, not poster-cards.
  - Asymmetric, offset editorial grid feeling; tiny uppercase tracked labels; tight display tracking (`-0.01em`).
  - Animated underlines on links (`background-size` reveal), restrained `cubic-bezier(0.645, 0.045, 0.355, 1)` motion, one slow "drift" loop as a decorative grace note.
  - Playful pseudo-content annotations: `(You Are Here)`, `(Coming Soon)`, external `↗`.
- What to avoid:
  - Copying Henry's personal copy verbatim or his identity statements. Fabricated personal copy for Aslan is fine and encouraged for this experiment, but it must be Aslan's own voice, not a reproduction of Henry's.
  - Literal reproduction of his gargoyle/footer imagery. We can have a textural grace note, but it should be our own.
  - Importing the commercial faces (Manuka, Louize). Use the best free analogues.

## Palette

Warm monochrome. Color lives only inside code blocks.

- Ground/background: `#fafafa` (warm near-white).
- Ink/text: `#2a2722` (warm espresso near-black — NOT a cool navy).
- Muted/meta: warm gray (`~#6e655a`), with `#3e3b36` as an "echo" ghost tone.
- Accent behavior: **none.** Links are ink with an animated underline. There is no electric-blue primary. The previous `$color-primary` blue is retired from the visible surface.
- Dark band ("themed dark"): ground flips to `#2a2722`, ink flips to `#fafafa`, borders/muted recompute warm. Sections opt in via a `themed dark` class that locally overrides the surface/ink tokens.
- Image treatment: warm, slightly soft; dark-mode imagery may invert/blend as a textural grace note, but keep it subtle.
- Contrast constraints: espresso `#2a2722` on `#fafafa` and the inverse both clear WCAG AA for body and large text. Muted/meta must stay AA on its own ground; verify the warm gray on both light and dark bands.

## Typography

Three families plus mono. This is the heart of the branch.

- Heavy display (giant hero / statement moments): **Archivo Black** (free analogue for Manuka Black) — screen-dominating at clamp sizes up to ~`15rem`.
- Editorial serif (headings + literary voice, with italic): **Fraunces** (free analogue for Louize Display) — its idiosyncratic display character and strong italic carry the "dear reader" voice.
- Body grotesque: **Hanken Grotesk** (free analogue for Neue Montreal) — clean, neutral, Swiss-ish workhorse.
- Code: keep **IBM Plex Mono** (already wired into Shiki / code blocks).
- Scale and rhythm: extreme contrast. Tiny `0.75rem` UPPERCASE tracked labels and meta against `10rem`+ display. Section titles are large; article-body headings stay measured (do not give article bodies 5rem headings).
- Letter-spacing/weight behavior: tight tracking on display/serif headings (`-0.01em` to `-0.03em`); generous tracking (`0.18em`+) on tiny uppercase labels; occasional blown-out letter-spacing as a graphic device is welcome but optional.
- What not to do: do not alias headings to mono-italic anymore (that was the academic baseline). Headings are serif now. Do not let Archivo Black leak into body or article headings — it is for hero/statement scale only.

## Surface and Material

- Surface logic: flat warm grounds. The paper-grid texture from the baseline is removed (henry's grounds are flat). Differentiation comes from the light/dark band flip, not from texture.
- Borders/rules: hairline warm rules (`#eee`-equivalent light, `#bdbdbd`-equivalent mid). Thin section-divider rules.
- Texture/noise: essentially none on grounds. One optional drifting decorative grace note is allowed.
- Shadows/depth: minimal. Cards lean on border + rounded corner (`~0.75rem`) and a border-color/underline shift on hover rather than heavy shadow.
- Media framing: preserve `FeaturedMediaFrame` and all `data-featured-*` / `clip-path` transition hooks. Media can be reframed compositionally (e.g. as the backing of an editorial row) but the hooks stay.

## Layout and Composition

Push beyond token swaps. The structural ideas are the point.

- Homepage: a vertical sequence of alternating light/dark bands. Suggested rhythm: light giant-name hero → dark "letter to the reader" / vital info → dark Selected Work (editorial rows) → light testimonials → dark Side Projects → light Latest Writing → dark footer. Tune the alternation so it reads intentionally, not stripey.
- Cards: Selected Work becomes full-bleed editorial **rows** — gigantic title, small uppercase meta, parenthetical annotation, media as the row's backing/inset. Latest Writing stays as cards but henry-style: rounded hairline border, uppercase mono date meta, animated underline, hover border shift.
- Article rhythm: article/detail pages stay on LIGHT ground (protect `.content-flow` + transitions). Headings become Fraunces serif at a measured document scale. Body is Hanken Grotesk. Keep generous vertical rhythm and a comfortable reading measure.
- Footer/nav: nav stays a small unobtrusive affordance but adopts the uppercase-tracked label voice. Footer goes dark/espresso with grouped links and a breadcrumb/credit base.
- Mobile behavior: bands stack; giant type clamps down but should still feel oversized. Labels and annotations stay legible.
- Composition experiments to attempt: the light/dark band flip via locally-scoped token overrides (`.themed.dark`); Selected Work as rows; parenthetical pseudo-content annotations; oversized hero name.

## Motion and Interaction

- Page/route motion: keep the existing featured-media transition system intact. Fallback fade/slide stays.
- Hover/touch behavior: animated underline reveal on links (`background-size`); subtle border-color shift on cards; restrained transforms. Easing leans `cubic-bezier(0.645, 0.045, 0.355, 1)`.
- Scroll behavior: no scroll-jacking. One optional slow infinite "drift" on a single decorative element is allowed.
- Reduced-motion expectation: every new transition/animation must have a `prefers-reduced-motion: reduce` fallback. The drift loop must stop under reduced motion.

## Accessibility and Usability

- Color contrast: espresso/near-white both directions must pass AA for body and large text; verify muted/meta on both bands.
- Focus states: keep a visible `:focus-visible` ring everywhere. Because the primary blue is retired, introduce an adaptive focus token (ink ring on light, surface ring on dark) so focus stays visible on dark bands.
- Keyboard behavior: all interactive surfaces remain real links/buttons; card rows are real links.
- Link affordances: links are distinguishable without relying on color alone — the animated underline plus hover state must read; ensure non-hover state is still discernibly a link in body copy.
- Readability: comfortable measure, generous rhythm, captions small but not invisible.

## Anti-Goals

- Avoid: reproducing Henry's actual copy, identity statements, or imagery.
- Avoid: any electric-blue / brand-accent leftover from the academic baseline.
- Avoid: stripey, mechanical light/dark alternation with no compositional intent.
- Avoid: letting the heavy display face bleed into body or article-body headings.
- Avoid: paper-grid texture or shiny SaaS gradients — grounds are flat and warm.

## Implementation Notes for the Agent

The agent may edit palette files, shared-component recipes, scoped SFC styles, and supporting SFC markup where the visual direction needs it. Preserve the content model, GraphQL query shape, block registry, transition data hooks, static deploy scripts, Docker infrastructure, and CMS schema.

Expected checks:

- `corepack pnpm check`
- Visual QA via `corepack pnpm generate:static:preview` (the user's chosen QA path for this branch).

## Handoff Summary

- Main visual decisions:
  - Three-typeface system: **Archivo Black** (giant display / hero names), **Fraunces** (editorial serif headings + italic literary voice), **Hanken Grotesk** (body), IBM Plex Mono kept for code and tiny uppercase labels. Headings repointed from mono-italic to serif via `--type-heading-family`; added `--font-display` and `--font-serif` tokens.
  - Warm espresso monochrome palette: ground `#fafafa`, ink `#2a2722`. Electric-blue accent retired — `--color-primary*` repointed to monochrome ink; links are ink with a resting hairline underline that animates to solid on hover; focus uses a new `--color-focus` token (= ink, inverts on dark bands).
  - `.themed.dark` band helper locally overrides the surface/ink tokens so sections invert to warm espresso. Homepage rhythm: hero (light) → "letter to the reader" (dark) → Selected Work (light) → Testimonials (light) → Side Projects (dark) → Latest Writing (light) → Footer (dark). No adjacent dark bands.
  - Selected Work reframed as editorial row-bands with giant serif titles + a `(Read the case study →)` cue; all featured-media transition hooks preserved. Detail-page titles/meta realigned to serif + mono-uppercase so card→detail transitions interpolate cleanly. Post cards: rounded hairline border, mono-uppercase date, serif title with animated underline.
  - Paper-grid body texture removed (flat warm grounds). Fixed the footer's previously-undefined `--color-paper-warm` background by moving it to the dark-band system.
- Files changed: `_type-fonts.scss`, `_type-palette.scss`, `_color-palette.scss`, `_base.scss`, `shared-components/_link.scss`, `shared-components/_heading-block.scss`, `context-role/_vue-frontend.scss`, `context-role/_wp-editor.scss`; `pages/index.vue`, `pages/about.vue`, `pages/writing/index.vue`, `pages/writing/[slug].vue`, `pages/case-studies/[slug].vue`, `pages/side-projects/index.vue`; `components/home/*` (VitalInfo, SelectedWork, LatestWriting, SideProjects, EmployerTestimonials), `components/navigation/SiteNav.vue`, `SiteFooter.vue`, `cards/CaseStudyCard.vue`, `cards/PostCard.vue`.
- Known compromises:
  - Free font substitutes stand in for the commercial Manuka (→ Archivo Black) and Louize (→ Fraunces).
  - Selected Work keeps the existing media-backed slip structure (restyled into a shorter editorial band) rather than a fully rebuilt two-column row, to avoid disturbing the transition geometry.
  - Testimonial placeholder copy is still lorem ipsum (CMS-driven; only shows with no real data).
- Screens or routes that need special QA: homepage band rhythm + giant hero clamp on mobile; case-study card → detail featured-media transition (color/serif interpolation); dark-band contrast for muted/meta text; focus rings on dark bands; article reading surface with serif headings.
- Whether static generation was smoke-tested: not yet — `corepack pnpm check` passes (editor CSS rebuild + lint + typecheck). User QAs via `corepack pnpm generate:static:preview`.
</content>
</invoke>
