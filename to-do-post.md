# Post And Case Study Body To-Do
This is a focused backlog for the rendered WordPress/Gutenberg article body system. It comes from reviewing the block QA kitchen-sink post and should help us improve posts and case studies without mixing every detail into the main project roadmap.

Use the QA seed routes as regression pages:

- `http://my-website.localhost/writing/block-qa-kitchen-sink-post`
- `http://my-website.localhost/case-studies/block-qa-kitchen-sink-case-study`

## Working Principles
- Turn the current state from "all blocks exist" into a coherent editorial article system.
- Keep WordPress block semantics and class names intact.
- Keep each supported block mapped through a focused Vue component.
- Use `packages/styles/_wordpress-blocks-baseline.scss` for Gutenberg baseline layout/rhythm.
- Move reusable art-directed recipes into `packages/styles/shared-components` only when the same treatment needs to cross contexts (meaning both visible in the wp-editor and in the vue frontend. this work is handled by the context-role scss system).
- Treat this file as a critique checklist, not a final design spec.

## Highest Priority Pass
- Establish one clear article text column and a small set of deliberate breakout widths.
- Rework heading rhythm first, because the whole page currently feels like disconnected sections.
- Give cover, gallery, media/text, table, file, audio/video, details, and accordion blocks enough styling to stop feeling like raw Gutenberg output.

## Tasks
- The main content column feels too narrow for some block types and too wide/loose for others. Text, quotes, images, tables, embeds, and layout blocks are not sharing a clear rhythm. We should normalize this to have a better rhythm.
- Vertical spacing is inconsistent. Some sections have huge gaps, while others are almost touching the next element. For instance there is no space abetween the oetry block and the blockquote block. We need to normalize some kind of min spacing between elements.
- Lots of elements seem to be double styled. For instance, the poetry, block quote, accordion all appear to have a second redudant layer around the content. Perhaps this is due to the way the html of the wordpress block is structured idk. That needs to be fixed though. If it's possible to simplify the frontend markup to be simplier than the wordpress then we should do that (as long as it doesn't beak shared styles too drastically between the wp-editor and vue-frontend-components context roles)
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
