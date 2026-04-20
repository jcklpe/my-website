# Post And Case Study Body To-Do
This is a focused backlog for the rendered WordPress/Gutenberg article body system. It comes from reviewing the block QA kitchen-sink post and should help us improve posts and case studies without mixing every detail into the main project roadmap.

Use the QA seed routes as regression pages:

- `http://my-website.localhost/writing/block-qa-kitchen-sink-post`
- `http://my-website.localhost/case-studies/block-qa-kitchen-sink-case-study`

## Working Principles
- Turn the current state from "all blocks exist" into a coherent editorial article system.
- Keep WordPress editorial semantics intact, but do not preserve WordPress implementation class names on the public frontend unless they carry author intent.
- Preserve useful editorial/layout classes such as `alignleft`, `alignright`, `aligncenter`, `alignwide`, `alignfull`, and useful `size-*` values.
- Strip or replace frontend cruft such as `wp-block-*`, `wp-image-123`, and `wp-element-*` when Vue can render clearer semantic markup.
- Keep each supported block mapped through a focused Vue component.
- Use `packages/styles/_wordpress-blocks-baseline.scss` for Gutenberg baseline layout/rhythm.
- Move reusable art-directed recipes into `packages/styles/shared-components` only when the same treatment needs to cross contexts (meaning both visible in the wp-editor and in the vue frontend. this work is handled by the context-role scss system).
- Treat this file as a critique checklist, not a final design spec.

## Recent Cleanup
- Frontend block rendering now favors cleaner Vue-owned markup instead of preserving WordPress wrapper markup.
- Paragraphs, headings, lists, buttons, quotes, pullquotes, accordions, groups, columns, media/text, cover, code, tables, files, audio, and video have had first-pass markup cleanup.
- Nested `content-flow` wrappers have mostly been removed from group/columns/cover/media-text internals.
- Code blocks now use Shiki-backed syntax highlighting with a shared retroterm visual recipe.
- Remaining cleanup should focus less on markup surgery and more on article rhythm, widths, hierarchy, and readable block styling.

## Highest Priority Pass
- Establish one clear article text column and a small set of deliberate breakout widths.
- Rework heading rhythm first, because the whole page currently feels like disconnected sections.
- Give cover, gallery, media/text, table, file, audio/video, details, and accordion blocks enough styling to stop feeling like raw Gutenberg output.

## Tasks
- The main content column feels too narrow for some block types and too wide/loose for others. Text, quotes, images, tables, embeds, and layout blocks are not sharing a clear rhythm. We should normalize this to have a better rhythm.
- Vertical spacing is inconsistent. Some sections have huge gaps, while others are almost touching the next element. For instance there is no space abetween the oetry block and the blockquote block. We need to normalize some kind of min spacing between elements.
- Lots of elements previously seemed double styled because WordPress block wrappers were leaking into frontend markup. This is mostly improved, but keep watching for any remaining duplicated structure in code, table, embed, gallery, and media blocks.
- In general the main content body feels kind of narrow and cramped. This could be widened a little bit. Ux studies say that 50-75 characters is optimal readability and the current character count for a paragraph block is 89, so the number of letters should actually be reduced. So maybe we need to increase font size etc. Medium.com has pretty good styling for readability IMO. Also this styling for the text needs to have a good media breakpoint etc for mobile reading. Mobile reading studies show that the characters per line should be 30-50.
- There's too much padding/margin on the h1-h6 headers on the left side. Headers should be aligned with the rest of the paragraph text, not indented from it. If anything a little bit of outdenting is preferable.
- Full width images need to be all the way from screen edge to screen edge, there should be no margin between it and the edge screen. Currently this appear to be due to a .wp-block-image .wp-block-gallery styling setting a max width, and auto margin. There should be a max height tof 75vh though.
- Media galleries should have lightbox behavior. (eventually I want to create a robust custom block for a multi-media gallery that has light box behavior but also supports sketchfab model embeds, seamless looping videos etc. and be masonry layout. So maybe we wait on this one? Is there a reason to improve the default media library if I'm just going to make a better version of it?)
- Footer needs to be a total height of like vh75, very spacious, and needs to be the electric blue color with white text and content.
    - Aslan note: footer should be super tall and very uncompact, very relaxed in its spacing, giving lots of room to breathe, and probably have some kind of contrasting color. Perhaps some image can eventually be used to create some fade into it. But for now just make it big and dark.
- h2-h6 needs clearer rhythm. Consider adopting a style similar to Github where h2-h3 have very light underlines, h4-5 don't have underlines, and h6 is basically the same size as paragraph text (like 2 px larger) but with bolds styling.
- Make `h2` section headings feel like major article breaks.
- Make `h3` and `h4` useful inside columns, media/text, and long essays without becoming tiny or ornamental.
-  h1 over the featured media hero struggles with long titles. It wraps awkwardly and overlaps on the first line under the second. Needs more vertical spacing for wrap probably.
- Pull quote is too large and too narrow. It also takes up too much vertical space. Pull it down a touch.
- The serif stuff should be IBM Plex Mono, rather than IBM Plex Serif. In general just ditch the IBM Plex Serif entirely. It should also be the italic version of IBM Plex Mono.
- pump up caption sizes about 30%
- wp-block-list lists should have a line height of 1.15 not 1.65
- cover block basically doesn't work at all on the frontend. Changing the color of the overlay text in wp-editor doesn't change it on the frontend. The text isn't overlaid the image. There is two instances of the the overlay text for some reason. The cropping and anchoring that is set on the wp-editor doesn't translate to the frontend at all. I'm not even sure that I would use the cover block all that much but if we are going to include it in the kitchen sink QA then it should work as expected. For now, maybe we remove this from kitchen sink QA block and we'll look at supporting it when we encounter a need for it.
- similarly Media and Text isn't styled like how it appears in the editor at all. And I'm not sure if we need to or not. Why use Media and Text block over just using a 2 column block and putting media and text in there ourselves?
- 2 column layout is not horizontally stacking on frontend. For some reason it's vertically stacking, which is incorrect for desktop view.
- on the wp-editor side of things the h2-h6 headers are all the way left aligned which breaks them out of the reading column. Most content in wp-editor appears to have a left margin of 299px but for some reason the headers don't. Maybe this is a wordpress-blocks-baseline.scss or something.
- wide images should not be as wide as the full width image. They should have a max width of like 75vw, and a max height of like 50vh.
- eventaully we should move the syntax highlighting for the codeblock towards using a Hopscotch inspired color theme.
- Tables are clean but too simple.
- vimeo embed test doesn't work. This is pretty low priority though.
- File download is missing the download button on the vue frontend, and we need to make it more clearly a download with some kind of download icon. It should also be styled to be more different from a quote or accordion or detail block.
- outline button just looks like a normal button. Should have a gradient outline matching the shape of the current button.
- the kitchen sink qa post script or whatever needs to include a full testing of the different widths on different blocks, like `normal`, `wide`, `full` etc, and `float-breakout` content where applicable.
- Make image, table, embed, gallery, and media/text blocks visibly relate to those widths.
- Normalize the vertical rhythm before and after headings, paragraphs, figures, embeds, and layout blocks.
- Avoid random-feeling gaps such as large open vertical spaces after some sections and tight collisions after others.
- the content of the kitchen sink QA stuff should be basically the same between the case study and post tests. Right now the posts for some reason have less blocks than in the case study post. Not sure why.
- Aslan note: the GitHub markdown rendering rhythm is a useful reference for heading hierarchy and spacing.
- Add stronger before/after spacing rules for headings so headings introduce sections rather than floating between unrelated blocks.
- Confirm what happens when floated image content is taller than adjacent paragraph content.
- Confirm what happens when floated image content is shorter than adjacent paragraph content.
- Make centered images feel calm and deliberate, not just default-sized.


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
Make outline button actually outline.
Keep cover/media-text as known lower-priority unless a quick obvious fix appears.
"""
