# Notes on general design styling task guiding this work
"""
Your instinct is good, but I’d frame it a little differently:

I don’t think the core problem is only that the current design is “too extreme.” I think the problem is that the extreme visual language is being applied before the editorial/layout system is stable. So the loudness is masking functional QA problems, and some of the QA problems are making the loudness look worse than it actually is.

In other words: the Jackalope-ish language may still have a place, but right now it is operating at the wrong layer.

My Read
The post/body system should enter a “low-noise calibration mode.”

That does not mean bland. It means the article body should become quieter, more systematic, and more legible so we can see what the Gutenberg renderer is actually doing. Once the baseline is working, we can selectively reintroduce expressive treatments where they earn their keep.

The current visual system has a few competing impulses:

The homepage/card system is graphic, poster-like, clipped, label-heavy, high contrast.
The post body wants to be readable, editorial, academic, and robust against arbitrary WordPress content.
The QA page contains a ton of disparate block types, so loud styling on every block makes the whole thing feel more chaotic than authored content probably will.
The WordPress editor/frontend parity question is still unresolved block by block, especially for cover/media-text/columns.
So yes: normalize first, stylize second.

Where I Agree Strongly
Removing or dialing back the black tape label treatment from ordinary article/body blocks makes sense. It currently has too much semantic weight. A black label says “this is a key graphic moment,” but if quotes, accordions, file blocks, headings, and cards all start speaking that language, nothing gets hierarchy.

I would keep black/electric-blue tape language as an accent system, not a baseline system.

Good candidates for keeping that energy:

homepage hero
selected work cards
maybe major CTAs
maybe one-off case-study callouts
maybe transition moments
Bad candidates for that energy by default:

normal h2 headings
tables
details/accordion
file downloads
captions
regular post body UI
That distinction alone will probably make the site feel 40 percent more mature.

Where I’d Push Back A Little
I would not fully “white label” the post body yet. If we strip too much, we may overcorrect into a generic blog template and lose the point of the project. The better move is to establish a restrained editorial grammar:

off-white page background
dark ink text
one electric-blue accent role
thin technical rules/underlines
generous article rhythm
quiet typographic hierarchy
occasional diagrammatic/chip/ASCII-like details
no gratuitous label tape in prose blocks
That is still designed. It is just less shouty.

The A Color Bright article is useful here because it names exactly the tension you’re circling. Their “Non-Brand Academia” point is about authority through restraint, muted colors, lean typography, and functional layouts; “Technical Illustrations” is about borrowing research/engineering visual language to signal rigor; “Shades of Off-White” points toward calm, warm, low-friction surfaces; “Gentle Humanists” softens the tech posture by centering human warmth rather than machinery. The article also warns, correctly, that blindly adopting trend categories creates sameness, so the trick is not “make it look like an AI brand,” but to borrow the useful posture: quiet confidence, technical literacy, humane tone. Source: A Color Bright, “Aesthetics of AI”.

What The New Direction Could Be
I’d describe the next visual target as:

“Research notebook meets technical portfolio, with restrained retro-computing accents.”

Not:
“punk zine screaming over WordPress blocks.”

Also not:
“sterile beige SaaS blog.”

That lets us preserve your taste for weirdness, but it puts weirdness in controlled places.

A practical palette direction:

background: warm off-white / paper
text: near-black blue/ink
accent: electric blue, used sparingly
secondary accent: graphite / muted gray-blue
avoid huge black slabs except in cards/hero/intentional poster moments
A practical typography direction:

IBM Plex Mono Italic for accent/eyebrow/caption-ish moments
likely no IBM Plex Serif, as you noted
either IBM Plex Sans or another readable sans/mono pairing for body
article headings closer to GitHub markdown rhythm: clear, quiet, underlined where useful, not giant unless the page context calls for it
What I Think We Should Do First
I would not start with every block. I’d start by calming the global article system:

Normalize content widths.
Normalize vertical rhythm.
Normalize headings.
Normalize captions.
Normalize figure/image alignment.
Remove black tape styling from baseline article blocks.
Make the footer spacious/electric-blue as a separate page-chrome move.
That would immediately make the QA page easier to read. Then we can evaluate cover, media-text, gallery, tables, accordions, etc. from a calmer baseline.

What To Defer
I would defer full custom gallery/lightbox work. Your note is right: if you eventually want a robust multimedia gallery block supporting images, videos, Sketchfab, looping media, masonry, lightbox, etc., then polishing the default Gutenberg gallery too hard may be wasted effort.

But I would still give default gallery a minimal acceptable baseline:

doesn’t look broken
has sane spacing
doesn’t destroy layout
works on mobile
Not a full art-directed gallery system yet.

I’d also consider temporarily removing cover/media-text from the QA fixture or marking them as “known incomplete” if they are distracting from the blocks you actually expect to use. But I would be careful: sometimes the QA fixture is annoying precisely because it exposes unsupported reality. We can keep them, but treat them as lower-priority known issues.

The Important Architectural Point
Your phrase “normalize things, and dial down things selectively” is exactly the right engineering/design principle.

That suggests we should work mostly in:

packages/styles/_wordpress-blocks-baseline.scss
packages/styles/_type-palette.scss
maybe packages/styles/_color-palette.scss
maybe the footer/nav/card SFCs only where page chrome conflicts with article calm
Not by hacking each Vue block component one by one unless the markup itself is wrong.

If the issue is double wrappers or duplicate block content, then yes, we may need to inspect the Vue block components. But most of this sounds like baseline/rhythm/style work first.

My Recommended First Pass
If you ask me to proceed after this discussion, I would do a first “editorial calm pass” with these constraints:

No redesigning the homepage hero.
No redesigning card transitions.
No full gallery/lightbox work.
No new abstractions unless necessary.
Remove/dial back label-tape styling from post body defaults.
Establish article width variables or local custom properties in the WordPress block baseline.
Shift headings toward GitHub-ish rhythm.
Increase captions.
Make full/wide images obey your width/height notes.
Fix columns stacking on desktop.
Fix file button visibility.
Make outline button gradient (currently outline is correct, gradient is a future polish item).
Keep cover/media-text as known lower-priority unless a quick obvious fix appears.
"""
