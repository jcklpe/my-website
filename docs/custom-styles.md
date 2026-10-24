# Custom Block Styles
Named Gutenberg styles add visual treatments to existing blocks. They are not Custom HTML blocks, new block types, or a general page builder. The content stays in ordinary headings, paragraphs, lists, and columns; selecting a style adds an `is-style-*` class to its wrapper.

## Available Project Styles
| Editor block | Style label | Saved class | Purpose |
| --- | --- | --- | --- |
| Group | Editorial panel | `is-style-editorial-panel` | A dark interjection with cream text, blue edging, and stronger heading hierarchy. |
| Columns | Timeline (inside editorial panel) | `is-style-timeline` | Connected stages inside an Editorial panel; horizontal on desktop, vertical on phone. |

These styles were introduced for the two slide-derived compositions in Building Enzo. They can be reused in other articles where the same visual structure fits. The normal style remains available; do not apply the dark treatment to every Group.

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
