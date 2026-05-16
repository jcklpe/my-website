
# Generative Design Brief: Systems Atlas / Research Terminal

Use this file as the handoff brief for the next generative design branch. This branch should reskin the site into a more immersive, authored, systems-oriented personal website while preserving the existing content model and technical architecture.

## Branch

* Branch name: `gendes-systems-atlas`
* Baseline branch: `gendes-academia`
* Mood-board folder: `docs/gendes-moodboard/gendes-systems-atlas/`
* Working title: **Civic Systems Atlas / Personal Research Terminal**

## Thesis

This version of the site should feel like a civic systems atlas crossed with a personal research terminal: a structured archive for design work, writing, art, experiments, code, and institutional sense-making. It should not feel like a generic UX portfolio. It should feel like a custom environment built by someone who thinks in systems, makes diagrams, works with public infrastructure, writes about technology and culture, and builds tools to make complex things legible.

The design should preserve usability and clarity, but it should be more immersive than a purely functional interface. The brand should not be pasted on as decoration. It should be part of the structural composition of the UI. Ornament should emerge from grids, labels, metadata, panels, captions, maps, diagram overlays, archival framing, and careful page rhythm. The aesthetic should make the work feel researched, filed, mapped, annotated, and interpreted.

The emotional target is rigorous but not sterile, weird but not unserious, technical but not cold, archival but not dusty, civic-minded but not bureaucratic, handmade but not sloppy. The site should feel like a map room, a terminal, a technical manual, and an artist’s field notebook sharing the same interface.

## References

Use the mood-board images in `docs/gendes-moodboard/gendes-systems-atlas/` as the primary visual reference. The references below describe what to borrow from them and what to avoid.

* Reference: Blueprint diagrams, technical schematics, optics charts, systems maps
* What to borrow: Visible structure, coordinate logic, thin rules, diagram overlays, figure labels, measurement marks, modular compositions, annotated image treatment
* What to avoid: Making the site feel like an engineering manual with no warmth, using diagrams as meaningless background clutter, reducing everything to sterile wireframes
* Reference: Archival public-infrastructure graphics, transit maps, planning documents, civic manuals
* What to borrow: Institutional seriousness, index-like navigation, legends, maps, labels, tables, calm density, document-like authority
* What to avoid: Government-site blandness, bureaucratic lifelessness, excessive formality, visual systems that feel purely administrative
* Reference: Old operating systems, early web interfaces, terminals, file browsers, classic Mac/Windows UI chrome
* What to borrow: Panels, title bars, file metadata, tabs, compact controls, record-like cards, inspectable surfaces, tool-like interaction patterns
* What to avoid: A full fake desktop metaphor, novelty nostalgia, pixel-font overload, skeuomorphic windows everywhere, retro UI that harms usability
* Reference: Risograph, Xerox, technical zines, scanned print matter, low-fidelity publishing
* What to borrow: Warm paper, imperfect ink, halftone, duotone image treatment, tactile surface, graphic contrast, clipped captions, editorial rhythm
* What to avoid: Grunge overload, unreadable textures, arbitrary collage, poster chaos on content-heavy pages
* Reference: Cybernetic diagrams, research notebooks, conceptual art documentation, experimental design publications
* What to borrow: A sense of thought made visible, systems of relation, recursive diagrams, field notes, indexical captions, intellectual atmosphere
* What to avoid: Pretentious opacity, academic deadness, abstract graphics that do not connect to the content
* Reference: Personal studio archive and artist field notebook
* What to borrow: Authored specificity, evidence of process, object-like pages, tactile image framing, human traces, small annotations
* What to avoid: Scrapbook randomness, overly sentimental handmade effects, decorative marginalia with no functional role

## Palette

Describe the color world and value structure.

* Ground/background: Warm off-white, paper cream, and slightly aged neutral surfaces. Avoid pure white as the dominant ground unless a section needs maximum reading clarity. The background should feel like a page, map, document, or work surface rather than a blank SaaS canvas.
* Ink/text: Near-black, graphite, and muted ink tones. Text should feel printed rather than glowing. Use strong contrast for body copy and interface controls. Muted ink can be used for secondary labels, metadata, captions, and rules.
* Accent behavior: Saturated blueprint/cobalt blue is the signature accent and should carry the branch identity. Use it for active states, key lines, diagram details, links, selected metadata, and high-emphasis labels. Secondary accents may include muted institutional green/sage, occasional warning red-orange, dusty pink, and rare acid lime. These should support the blue, not compete with it.
* Image treatment: Prefer duotone, monochrome, blueprint-blue overlays, halftone, subtle paper framing, and annotated screenshots. Important UX evidence must remain readable. Do not obscure project screenshots with aggressive filters. Use branded frames and captions around images rather than destroying the content of the image.
* Contrast constraints: Body text, navigation, buttons, and links must meet accessible contrast. Texture and grid layers should stay low opacity. Accent colors must not be used as low-contrast text on warm backgrounds.

Suggested starting tokens:

```scss
// Foundation
--color-paper: #f4efe4;
--color-paper-soft: #fbf8ef;
--color-ink: #12120f;
--color-ink-muted: #4a4a42;
--color-grid: rgba(18, 18, 15, 0.12);

// Signature color
--color-blueprint: #123cff;
--color-blueprint-dark: #001d9b;
--color-blueprint-soft: #dfe5ff;

// Secondary accents
--color-sage: #9fb7a6;
--color-sage-dark: #315f49;
--color-acid: #c9ff18;
--color-warning: #ff4b1f;
--color-dust-pink: #e8c8c1;

// UI surfaces
--color-panel: #fffdf5;
--color-panel-muted: #eee8dc;
--color-line: rgba(18, 18, 15, 0.22);
--color-line-strong: rgba(18, 18, 15, 0.55);
```

## Typography

Describe the typographic voice.

* Primary body face: Use the existing readable body face unless there is a strong reason to change it. If a body pairing is needed, prefer IBM Plex Sans, Public Sans, Inter, or Atkinson Hyperlegible. The body should remain calm, clear, and readable in long case studies and essays.
* Heading voice: Headings can be more graphic and index-like. Use scale, weight, line breaks, spacing, section numbers, and metadata labels to create atmosphere. IBM Plex Mono should be central for labels, captions, metadata, project IDs, navigation details, and technical UI language. Headings may combine a readable sans with IBM Plex Mono support text.
* Scale and rhythm: Use strong but not chaotic hierarchy. Large headings can feel like poster or manual titles on landing/index pages. Case study body sections should use measured editorial rhythm with readable line lengths, clear sectioning, captions, and callouts.
* Letter-spacing/weight behavior: Use slight letter-spacing for small uppercase metadata, tags, section labels, and navigation atoms. Avoid heavy tracking on long text. Use weight contrast sparingly. Mono labels should feel intentional and technical, not noisy.
* What not to do: Do not make all prose mono if it hurts reading. Do not use novelty pixel fonts for core content. Do not overuse all caps. Do not mix many typefaces. Do not use tiny low-contrast captions for important information.

## Surface and Material

Describe cards, panels, borders, shadows, textures, media frames, and article surfaces.

* Surface logic: Surfaces should feel like records, files, specimens, panels, pages, and artifacts. A card is not just a container. It is a filed object with metadata, category, title, summary, and sometimes an image or figure. Panels should feel like inspectable areas in a custom research system.
* Borders/rules: Prefer thin 1px rules, divided metadata strips, measurement-like dividers, dotted rules, coordinate ticks, and labeled section separators. Borders should often clarify structure. Use stronger borders for interactive cards and panels. Avoid generic rounded SaaS cards.
* Texture/noise: Use subtle paper texture, halftone, scan noise, or grid overlays at low opacity. Texture should be felt before it is noticed. Never put busy texture under long body text. Use texture most strongly in hero, index, thumbnail, and art/experiment areas.
* Shadows/depth: Use shadows lightly or not at all. Favor flat, printed, document-like surfaces. If depth is used, keep it shallow and utilitarian, more like stacked paper or lifted panels than glossy product cards.
* Media framing: Frame screenshots and images as evidence or artifacts. Use captions, figure numbers, metadata labels, and optional diagram overlays around the media. Do not over-stylize screenshots that need to prove UX work. Treat art and experimental images with more freedom: duotone, crop, halftone, collage, and archival treatment are acceptable there.

Suggested reusable primitives:

* `RecordCard`
* `MetadataStrip`
* `SystemPanel`
* `FigureCaption`
* `TagList`
* `SectionMarker`
* `GridBackground`
* `DiagramOverlay`
* `ArtifactFrame`
* `IndexTable`
* `CalloutPanel`
* `ProjectHeader`

Names can vary, but the system should be componentized rather than one-off decorative CSS.

## Layout and Composition

Describe how the homepage, cards, article pages, and archives should compose. Push beyond token swaps when the direction needs a stronger structural idea.

* Homepage: The homepage should act as the entry to the atlas/terminal. It should include a strong hero with a clear positioning statement, visible grid/diagram language, metadata-like labels, and a sense of authored environment. It should quickly communicate UX, civic systems, design systems, research, code, writing, and art without feeling like a resume page. Consider a compact “map of practice” or taxonomy that organizes the site into Work, Writing, Experiments, Artifacts, Methods, and Contact.
* Cards: Project and post cards should feel like records in an archive. They should include visible metadata: year, domain, role, methods, output type, organization, or status where applicable. Cards can have title bars, metadata strips, small IDs, figure labels, duotone thumbnails, and subtle hover states. Avoid generic tile grids. A card should feel like a filed artifact or specimen.
* Article rhythm: Long articles and case studies should be calmer than the homepage. Use a clear reading column with optional metadata rail, side annotations, figure captions, and callout panels. Start case studies with a record header: title, one-sentence summary, role, organization, year, domain, methods, outputs. Use diagrams, artifact indexes, and process evidence to break up text. Avoid dense collage in the main reading path.
* Footer/nav: Navigation should feel like an index or command surface, not a decorative menu. Use concise labels and strong affordances. Footer can feel like a site map, archive index, or system status panel. Include clear paths to portfolio work, writing, experiments/art, about, contact, and RSS/social links if present.
* Mobile behavior: Preserve the atmosphere but simplify the composition. Metadata rails can collapse into stacked panels. Diagram overlays should reduce or disappear if they clutter. Cards should remain scannable and touch-friendly. Avoid tiny labels becoming unreadable on mobile. Keep the site fast and accessible.
* Composition experiments to attempt:
  * Add a subtle grid or coordinate system to the homepage hero.
  * Turn the project index into an archive table/card hybrid, not only a grid.
  * Add metadata strips to cards and project headers.
  * Use large section numbers or short codes as visual anchors.
  * Add figure captions and artifact frames for media.
  * Use a side metadata rail on case studies at desktop widths.
  * Create a reusable `SystemPanel` component with a title strip and content area.
  * Try a homepage “map of practice” that visually connects Work, Writing, Code, Art, and Civic Systems.
  * Add diagrammatic lines or nodes sparingly to connect related sections, especially on index pages.
  * Use asymmetry in hero/index pages while keeping body pages orderly.

Composition philosophy:

Aslan’s natural instinct is functional, constraint-driven, and legibility-first. Preserve that strength. But this branch should create room for “purposeless purposefulness”: visual decisions that are not merely utilitarian, but feel intentional, atmospheric, and authored. The key is to make ornament structural. Grids, captions, metadata, panels, rules, labels, and diagrams are the ornament.

Good ornament:

* a grid that also gives the page rhythm
* a metadata label that also becomes a graphic mark
* a divider that feels like a measurement rule
* a card border that makes the object feel filed and inspectable
* a project index that works as both navigation and visual identity
* a caption system that makes screenshots feel archived and interpreted

Bad ornament:

* random glitch effects
* meaningless floating shapes
* fake warning labels everywhere
* excessive texture over text
* retro buttons that do not behave like buttons
* decorative chrome that makes content harder to use

## Motion and Interaction

Describe motion personality without breaking the featured-media transition hooks.

* Page/route motion: Motion should feel like opening a file, expanding a record, zooming into a map, or revealing an indexed layer. Keep it quick, purposeful, and calm. Preserve existing featured-media transition hooks and do not break current route transition data attributes or component contracts.
* Hover/touch behavior: Hover states should feel like inspection or activation. Examples: metadata strip changes state, thin border shifts to blueprint blue, image overlay reveals a caption or figure number, panel title bar becomes active, tag gains underline or line highlight. Touch behavior must not require hover-only discovery.
* Scroll behavior: Use scroll to reveal structure, not spectacle. Subtle sticky metadata rails, section markers, or progressive caption reveals are appropriate. Avoid gratuitous parallax or animated noise. Long reading should stay calm.
* Reduced-motion expectation: Respect `prefers-reduced-motion`. All major motion should have reduced or non-animated alternatives. No essential content should depend on motion.

## Accessibility and Usability

Non-negotiables for the branch.

* Color contrast: Maintain accessible contrast for body text, links, buttons, navigation, labels, and form controls. Do not use blueprint blue as low-contrast text on saturated or dark backgrounds. Texture and grid layers must not compromise readability.
* Focus states: Focus states must be visible, intentional, and keyboard-friendly. A strong blueprint-blue outline, underline, or bordered focus treatment is appropriate. Do not remove native affordances without replacing them.
* Keyboard behavior: Navigation, filters, cards, links, menus, and interactive panels must remain keyboard accessible. Do not introduce mouse-only exploration patterns.
* Link affordances: Links must look like links in prose. Do not rely only on color. Underlines, rule treatments, or clear hover/focus changes are expected.
* Readability: Long case studies and essays need comfortable line length, spacing, contrast, and hierarchy. Keep texture away from long text. Avoid tiny metadata when it carries important meaning. Decorative visual layers must be non-essential.

Accessibility is part of the brand. This site is about humane systems and civic infrastructure, so it should not sacrifice usability for vibe.

## Anti-Goals

Name the cliches, motifs, effects, and directions this branch should avoid.

* Avoid: A full fake desktop interface with draggable windows, novelty OS chrome everywhere, or a site that feels like a retro computer costume.
* Avoid: Generic SaaS portfolio styling: rounded white cards, soft gradients, vague blobs, glossy shadows, uncommitted blue accents, and template-like hero sections.
* Avoid: Brutalist poster chaos where every page competes for attention and long-form content becomes hard to read.
* Avoid: Random glitch effects, constant scanlines, fake CRT filters, pixel fonts for core text, or noisy “cyber” effects.
* Avoid: Decorative diagrams that do not relate to content, hierarchy, metadata, or navigation.
* Avoid: Government-site blandness, despite the civic/institutional references.
* Avoid: Pure academia styling that feels dry, gray, or timid.
* Avoid: Overly cute labels, jokey microcopy, or fake terminal language that feels forced.
* Avoid: Making all pages equally dense. Landing/index/art pages can be more expressive. Case studies and essays need calm reading surfaces.

## Implementation Notes for the Agent

The agent may edit palette files, shared-component recipes, scoped SFC styles, and supporting SFC markup where the visual direction needs it. Preserve the content model, GraphQL query shape, block registry, transition data hooks, static deploy scripts, Docker infrastructure, and CMS schema.

Do not merely swap colors and fonts. Translate the brand into the structure of the UI. For each page or component, ask:

1. Can this become a record, file, specimen, map, panel, index, or artifact?
2. Can metadata become more visible and useful?
3. Can a grid, label, caption, or divider add atmosphere while clarifying structure?
4. Can imagery be framed like evidence or documentation?
5. Can the component feel more custom without becoming less usable?
6. Can ornament emerge from the content’s organization?

Code and style preferences:

* Prioritize readability over cleverness.
* Avoid ternaries when an `if` statement is clearer.
* Prefer composition over inheritance.
* Prefer clear functions and data transforms over deeply chained methods.
* Keep components small and purposeful.
* Keep styling tokenized and reusable.
* Use existing tooling conventions: Vite, Nuxt, Vue, SCSS, ESLint, and Prettier.
* Do not introduce large dependencies just for visual effects.
* Respect SSR and accessibility constraints.

SCSS/class style preference:

Prefer composed semantic class names over long BEM-style chains.

Preferred:

```html
<article class="project-card record-card featured-work">
  <header class="record-header metadata-strip">
    ...
  </header>
</article>
```

Avoid leaning heavily on:

```html
<article class="case-study-page__hero-card__metadata-row">
```

Use small, semantic, composable classes where it improves clarity.

Suggested implementation phases:

1. Tokens and foundations
   * Define color tokens.
   * Confirm typography stack.
   * Define spacing scale.
   * Define border, radius, and line weights.
   * Add grid/background utilities.
   * Add texture utilities at low opacity.
2. Core primitives
   * Build or reskin buttons, links, tags, captions, panels, cards, metadata strips, section headers, callouts, and image frames.
3. Key templates
   * Apply the system to homepage, project index, case study template, writing index, post template, art/experiments page, and about page.
4. Expressive moments
   * Add controlled atmosphere through homepage hero diagram layers, project thumbnail treatments, map/grid overlays, archival image treatments, and selected animated details.
5. QA
   * Check readability, color contrast, keyboard states, reduced motion, mobile layouts, content hierarchy, performance, and coherence across pages.

Expected checks:

* `corepack pnpm check`
* SSR review via `corepack pnpm start:frontend` at `http://my-website.localhost`
* Static generation smoke test before a winning branch is merged

## Handoff Summary

When the branch is ready for human review, summarize:

* Main visual decisions:
* Files changed:
* Known compromises:
* Screens or routes that need special QA:
* Whether static generation was smoke-tested:

## Final Creative Standard

The finished branch should pass this test:

> If the text were removed, the site should still feel like it belongs to someone who thinks in systems, works with civic infrastructure, makes art, writes about technology and culture, and builds custom tools.

And if the visuals were removed, the content should still be clear, accessible, and professionally credible.

The identity succeeds when both are true.
