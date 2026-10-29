# Custom Block Styles
Named Gutenberg styles add visual treatments to existing blocks. They are not Custom HTML blocks, new block types, or a general page builder. The content stays in ordinary headings, paragraphs, lists, and columns; selecting a style adds an `is-style-*` class to its wrapper.

## Available Project Styles
| Editor block | Style label | Saved class | Purpose |
| --- | --- | --- | --- |
| Group | Editorial panel | `is-style-editorial-panel` | A dark interjection with cream text, blue edging, and stronger heading hierarchy. |
| Group | Project overview | `is-style-project-overview` | Compact dark context panel with native project details and original identity artwork. |
| Group | Illustrated research | `is-style-research-panel` | Wide blue research composition with an illustration, figures, findings, and a quotation. |
| Group | Entity / action map | `is-style-entity-map` | Wide light diagram with contrasting entity cards and an adjacent action list. |
| Columns | Timeline (inside editorial panel) | `is-style-timeline` | Connected stages inside an Editorial panel; horizontal on desktop, vertical on phone. |

Editorial panel and Timeline were introduced for the two slide-derived compositions in Building Enzo. The case-study styles below were introduced for USCIS. Each can be reused where its visual structure fits. The normal style remains available; do not apply the dark treatment to every Group.

## Insert A Complete Panel
In the block inserter, open **Patterns → My Website**, then choose **Editorial panel** (two topics) or **Editorial timeline** (three stages). Replace the placeholder headings and text directly in the editor. These are unsynced starting arrangements: editing one insertion does not change another. All content remains native Group, Columns, Heading, Paragraph, and List blocks. Use List View to select the outer Group or a nested column.

The outer Group already has Wide width and Editorial panel selected. The timeline also sets the inner Columns style. Adjust heading levels to fit the surrounding article.

## Authoring An Editorial Panel
1. Add a Group and choose **Editorial panel** under its block Styles controls. Use the normal Group layout and **Wide width** alignment.
2. Add a Heading appropriate to the article's existing hierarchy, optionally followed by a short Paragraph.
3. Add Columns containing normal Headings, Paragraphs, and Lists. The current plain panel composition is designed for two columns; the Timeline style is designed for three stages. Use default alignment for the inner Columns: the outer Group owns the width.
4. For chronology, select the inner Columns and choose **Timeline (inside editorial panel)**. Keep stage order meaningful when it becomes a vertical sequence on phones.
5. Keep captions that describe the whole composition outside the Group. Check the frontend at desktop and phone sizes, including its relationship to the article Contents rail.

No hand-authored HTML is needed in the editor. Patterns provide the starting arrangement; named styles control its appearance. Pattern markup lives in the project blocks plugin’s `patterns/` directory and is registered on `init`, so it is available after cloning without a database import.

## Slide-derived Case-study Compositions
These three Group styles were introduced for USCIS. All text is native Heading, Paragraph, or List content; artwork is a normal Image block. The source slide attachments remain available. To reuse a complete composition now, duplicate its Group in the USCIS editor; these styles do not add separate inserter patterns.

- **Project overview:** default-width outer Group, heading, then two Columns: project-detail paragraphs on the left and a nested Group with the `project-marks` class on the right. Put the original identity images and optional project-name paragraph inside that nested Group. Bold labels in the detail paragraphs appear on their own lines. Phone layout puts the marks in a row beneath the details. Default width preserves the case-study hero’s opening content overlap.
- **Illustrated research:** Wide outer Group, heading, then two Columns: transparent illustration on the left; metrics, findings, and a quotation on the right. Give the first List the `research-metrics` class and bold only the numbers. Use an ordinary List for findings and a Paragraph with `research-quote` for the quotation. At tablet/phone widths, the artwork stacks above the text; metrics remain a two-column list.
- **Entity / action map:** Wide outer Group, heading, then two Columns. The first contains the Nouns heading and nested two-column entity cards; each card is a Group with `entity-card`, with `entity-primary` additionally selecting the blue version. The second outer Column uses `entity-actions` and contains its heading and action list. At tablet width the action list moves beneath the cards; on phones the cards also stack. Keep headings nested in document order.

The optional `slide-credit` Paragraph preserves source attribution/footer wording at a quieter scale. Enter these supporting classes in the block’s Advanced → Additional CSS class(es) field. They are scoped to the named outer style, not site-wide utilities. Images keep their original pixels and transparency; the composition suppresses the normal image frame and cream image background. Logos with white backgrounds retain those original backgrounds.

The three styles share the `case-panel` frame recipe and have individual layout recipes in `_group-block.scss`. Wide compositions use the shared breakout geometry capped at the article frame, and collapse to the content column on tablet/phone. The outer Group owns TOC clearing; nested columns must not paint cream mattes over a dark panel.

## How Rendering Works
- `apps/cms/wp-content/plugins/my-website-blocks/my-website-blocks.php` registers the named styles with `register_block_style`. This supplies editor choices; registration alone does not implement frontend styling.
- WordPress saves the style selection in the block's attributes and wrapper class. Structured WPGraphQL blocks retain the content and parent/child relationships.
- `GroupBlock.vue` and `ColumnsBlock.vue` read the wrapper classes from each block's rendered HTML and render their children through the existing Vue block pipeline. They do not insert the whole group as raw HTML or forward arbitrary inline styles.
- `packages/styles/shared-components/_group-block.scss` owns the `editorial-panel` recipe, including the nested timeline treatment. The Group component includes it under `.group-block.is-style-editorial-panel`; the WordPress editor context includes it under `.wp-block-group.is-style-editorial-panel`.
- Wide panels extend beyond the body column. In article flows that enable TOC underlap mattes, the panel inherits the cream buffer as an outer shadow while keeping its own dark surface above it. Its wrapper declares the matching TOC obstacle. Editor and non-TOC contexts do not acquire the cream buffer.

The nested recipe crosses Vue component boundaries deliberately, but only under the named panel class. Shared editor/frontend styling aims for useful authoring correspondence, not identical editor chrome or layout.

## Choosing The Smallest Extension
Use core blocks for content and structure first. Use a named block style when the difference is presentation and the existing block model can express the content. Consider a block pattern when authors repeatedly assemble the same arrangement. Add a custom block only when the composition needs structured inputs, behavior, or validation that core blocks cannot represent clearly.

Avoid article-specific selectors, arbitrary inline CSS, or giant embedded HTML compositions. A new style should have a clear scope, preserve heading order and native semantics, and handle phone layout and TOC overlap. Document its supported arrangements here rather than suggesting every combination of core blocks has been designed.

After changing an editor-facing recipe, run `corepack pnpm check` to regenerate the versioned editor stylesheet and run lint/typecheck. Check the rendered frontend and editor authoring separately; a CSS build does not establish editor usability.
