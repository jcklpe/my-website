# Generative Design Brief: gendes-blue2

## Branch

- Branch name: `gendes-blue2`
- Source branch: `gendes-blue1`
- Working branch for this pass: `gendes-blue2.codex`
- Mood-board source: `docs/gendes-moodboard/gendes-blue1/`
- Working title: **Academia Blue Annotation / Editorial Systems Collage**

## Thesis

This branch is a synthesis pass, not another blind variation. The goal is to pull the strongest parts of the blue1 runs into one live interface so the whole site can be judged as a coherent direction.

The site should feel like an art-directed editorial system: paper plus screen, diagram plus portfolio, research note plus web object. It can use graph paper, dotted fields, blue rules, hard outlines, shallow vector shadows, annotated media, and occasional dark technical panels. It should not pretend to be a fake terminal, dashboard, live feed, operating system, or lab interface.

The guiding rule:

> Use graphic annotation, not fictional interface language.

Blue marks are welcome when they clarify rhythm, hierarchy, interaction, or real metadata. Blue marks become noise when they invent a system the site does not actually have. Avoid BTAK: bullshit techno aesthetic kayfabe.

## Second-Order Synthesis Notes

The first blue2 Codex pass was useful, but it over-abstracted the synthesis. This pass should be more literal about the section-by-section winners.

- Use the original `gendes-academia` blue as the signal blue. "Periwinkle" was shorthand for a softer usage pattern, not a request to replace the established blue with a new lavender/periwinkle hue.
- Keep the page grounded in warm cream. Avoid drifting toward white SaaS/app surfaces.
- Prefer Copilot's hero, Vital Info, Selected Work, and Side Projects direction as the closest structural interpretation, but improve the typography and recover useful details it missed.
- Keep the Codex testimonial structure, but correct the color and use the stronger "Collaborators / Testimonials" copy.
- Keep the blue1.3 navigation direction.
- Keep footer treatment closer to the simple blue1.1 / Claude Code read.
- Tables should follow the restrained blue1.1/blue1.5 editorial treatment with a dark outline and small blue accent.
- Images should get the explicit dark outline and shallow hard shadow that the prior synthesis pass missed.

## What To Synthesize

### Keep From blue1.2

- Ambition: framed hero surfaces, stronger borders, shadowed cards, more compositional risk.
- Pale blueprint/grid fields as atmospheric surfaces.
- Quick-link styling where links feel like deliberate actions.
- Latest Writing section heading energy, card outlines, and button-like archive affordance.
- Footer arrows and structured site-map feel, but without making the footer a floating fake panel.

### Keep From blue1.3

- Hero direction as the cleanest overall base.
- Blue diagram/target mark in the hero.
- Paper-grid texture and blue dash-rule rhythm.
- Nav treatment as the best of the branch set.
- Testimonial dash mark and crisp card treatment.
- Subtle image hover/filter behavior.

### Keep From blue1.1

- Thin academia-blue line as a quiet footer and table accent.
- Table restraint: mostly editorial, with a small blue signal.
- Latest Writing visual variety as a future direction. The bento layout is desired, but it can wait until the simpler synthesis is working.

### Keep From blue1.5

- Restraint and coherence. If an idea fights the whole page, simplify it.

### Keep From blue1.6

- Vital Info link separator and the arrowed "More about me" idea.
- Horizontal composition experiments as possible future fuel, not required in the first synthesis pass.

## Color Direction

Use the established academia blue as the signal color, but discipline where it appears. The blue should evoke computer cobalt, blueprint ink, and old interface color, but it should not burn the page when used in hover states or broad surfaces.

Use color in four tiers:

- **Ink**: near-black/navy for structure and body text.
- **Paper**: warm off-white, soft paper, blueprint-pale, and translucent surface cards.
- **Signal**: academia blue for rules, arrows, focus, hover details, diagram lines, and small fills.
- **Secondary signal**: restrained green/olive for side-project or living-system moments. It should keep the site from becoming only blue and white.

Avoid broad cobalt fills, purple-blue gradients, color blobs, and decorative color with no job.

## Typography Direction

Typography is still unsettled. Take a strong first pass rather than trying to solve it forever.

- Body text stays readable and modern.
- Editorial and section headings can keep IBM Plex Mono Italic as a stable throughline.
- Hero typography should experiment more: the BLUF text can become large and ornamental, while the actual title stays legible and architectural.
- Local display fonts may be used in the frontend when present under `apps/frontend/public/fonts/`, but do not make CMS/editor parity depend on them.
- Avoid tiny all-caps techno copy as a default voice.

## Homepage Direction

### Hero

Start from the blue1.3 hero idea, then bring in blue1.2 framing and atmospheric blueprint texture. Use a real frame, blue diagram mark, and expressive BLUF/type layering. Remove fake live-feed/system/dial/dashboard copy.

The hero should feel like a poster-canvas or annotated title plate, not a fake app screen.

### Vital Info

Use the blue1.2/blue1.6 direction: a strong framed surface, a link rail, clear action styling, and a visible "More about me" arrow. Remove title-bar redundancy and fake system labels. The section is information about the person, not information about an imaginary machine.

### Selected Work

This area still needs future composition work. For this pass:

- Keep the long strip case-study layout.
- Make the section heading stronger and full-width.
- Use a restrained blue rule/angle and a subtle structural background. Do not add decorative dash rules here unless they specifically improve the composition.
- Remove repeated "Case Study" visual noise from card surfaces where possible.

### Testimonials

Combine blue1.2 card substance with blue1.3 dash rhythm. Rename the flavor away from "Employer notes" because that frames the author too narrowly as an employee. "Collaborators / Testimonials" is the current preferred label.

### Side Projects

Use the darker/green-accent energy from blue1.2/blue1.3, but remove terminal language. This section can be the one place where the palette turns darker and a restrained secondary green appears.

### Latest Writing

Use the blue1.2 heading/card energy, but keep it honest. The bento layout is deferred. Cards should feel crisp, outlined, and dimensional without adding fake "Writing log" labels.

### Footer

Keep it simple and confident: full-width footer, thin blue top line, useful link structure, arrows only where they genuinely help. Do not wrap the whole footer in a floating card.

## Editorial Detail Direction

Article content should mostly stay quiet. Do not turn every block into a card.

- Quotes and pullquotes: defaults mostly win. Add only restrained blue/ink accenting.
- Code blocks: defaults mostly win, but reduce heavy shadow and avoid overly dark theatrical treatment.
- Tables: combine blue1.1/blue1.5 restraint with blue1.2 dark outline/shadow.
- Images/media: subtle flat shadows are good. Captions should remain readable and not become white all-caps labels.
- Columns/media-text: keep them as compositional/article layout elements, not raised panels.

## Anti-Patterns

- Fake system labels: "live feed", "system overview", "terminal", "signal health", "primary artifacts", "quoted signal", "writing log", or similar unless the content truly is that thing.
- Repeating obvious category labels on every card.
- Strong cobalt hover fills.
- Cardifying article layout blocks that should remain part of continuous editorial flow.
- Non-interactive marks that look like controls.
- Decorative diagrams that imply real data when they are only ornament.

## First-Pass Goal

Get the approved pieces into one live interface so the whole direction can be judged. This pass does not need to solve every open issue. It should create a coherent blue2 foundation that can be tweaked visually after human review.
