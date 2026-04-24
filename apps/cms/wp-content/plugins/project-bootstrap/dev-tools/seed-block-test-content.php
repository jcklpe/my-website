<?php
/**
 * Seed representative Gutenberg block test content for frontend QA.
 *
 * Run from the repo root:
 * docker compose -f docker/compose.yaml -f docker/compose.dev.yaml exec -T cms \
 *   wp eval-file wp-content/plugins/project-bootstrap/dev-tools/seed-block-test-content.php --allow-root
 */

if (! defined('ABSPATH')) {
    exit;
}

function my_website_block_test_first_image_id(): int
{
    $attachments = my_website_block_test_image_ids(1);

    return (int) ($attachments[0] ?? 0);
}

function my_website_block_test_image_ids(int $count = 4): array
{
    $attachments = get_posts([
        'post_type' => 'attachment',
        'post_mime_type' => 'image',
        'post_status' => 'inherit',
        'posts_per_page' => $count,
        'orderby' => 'date',
        'order' => 'DESC',
        'fields' => 'ids',
    ]);

    return array_map('intval', $attachments);
}

function my_website_block_test_image_block(int $image_id, string $align, string $caption): string
{
    if (! $image_id) {
        return '<!-- wp:paragraph --><p><em>Image alignment test skipped because no media image exists yet.</em></p><!-- /wp:paragraph -->';
    }

    $url = wp_get_attachment_image_url($image_id, 'large');
    $alt = get_post_meta($image_id, '_wp_attachment_image_alt', true);
    $align_class = $align ? " align{$align}" : '';
    $block_align = $align ? "\"align\":\"{$align}\"," : '';

    return <<<HTML
<!-- wp:image {{$block_align}"id":{$image_id},"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large{$align_class}"><img src="{$url}" alt="{$alt}" class="wp-image-{$image_id}"/><figcaption>{$caption}</figcaption></figure>
<!-- /wp:image -->
HTML;
}

function my_website_block_test_gallery_block(array $image_ids): string
{
    $image_ids = array_values(array_filter(array_map('intval', $image_ids)));

    if (count($image_ids) < 2) {
        return '<!-- wp:paragraph --><p><em>Gallery test skipped because fewer than two media images exist yet.</em></p><!-- /wp:paragraph -->';
    }

    $gallery_items = '';

    foreach ($image_ids as $image_id) {
        $url = wp_get_attachment_image_url($image_id, 'large');
        $alt = get_post_meta($image_id, '_wp_attachment_image_alt', true);

        $gallery_items .= <<<HTML
<!-- wp:image {"id":{$image_id},"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="{$url}" alt="{$alt}" class="wp-image-{$image_id}"/></figure>
<!-- /wp:image -->

HTML;
    }

    $ids = '[' . implode(',', $image_ids) . ']';

    return <<<HTML
<!-- wp:gallery {"ids":{$ids},"linkTo":"none"} -->
<figure class="wp-block-gallery has-nested-images columns-default is-cropped">
{$gallery_items}</figure>
<!-- /wp:gallery -->
HTML;
}

function my_website_block_test_media_text_block(
    int $image_id,
    string $align = '',
    bool $media_on_right = false,
    string $title = 'Media and text',
    string $body = 'This block checks paired media and copy. It should stay readable on desktop and stack cleanly on narrow screens.',
    string $vertical_align = ''
): string
{
    if (! $image_id) {
        return '<!-- wp:paragraph --><p><em>Media/text test skipped because no media image exists yet.</em></p><!-- /wp:paragraph -->';
    }

    $url = wp_get_attachment_image_url($image_id, 'large');
    $alt = get_post_meta($image_id, '_wp_attachment_image_alt', true);
    $align_attr = $align ? "\"align\":\"{$align}\"," : '';
    $align_class = $align ? " align{$align}" : '';
    $media_right_attr = $media_on_right ? '"mediaPosition":"right",' : '';
    $media_right_class = $media_on_right ? ' has-media-on-the-right' : '';
    $vertical_align_attr = $vertical_align ? "\"verticalAlignment\":\"{$vertical_align}\"," : '';
    $vertical_align_class = $vertical_align ? " is-vertically-aligned-{$vertical_align}" : '';

    return <<<HTML
<!-- wp:media-text {{$align_attr}{$media_right_attr}{$vertical_align_attr}"mediaId":{$image_id},"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile{$media_right_class}{$align_class}{$vertical_align_class}"><figure class="wp-block-media-text__media"><img src="{$url}" alt="{$alt}" class="wp-image-{$image_id} size-full"/></figure><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">{$title}</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>{$body}</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->
HTML;
}

function my_website_block_test_columns_block(array $columns, string $align = '', string $class_name = ''): string
{
    $align_attr = $align ? "\"align\":\"{$align}\"," : '';
    $class_attr = $class_name ? "\"className\":\"{$class_name}\"," : '';
    $block_classes = trim(($align ? " align{$align}" : '') . ($class_name ? " {$class_name}" : ''));
    $block_class_attr = $block_classes ? " {$block_classes}" : '';
    $column_markup = '';

    foreach ($columns as $column) {
        $column_class = trim((string) ($column['className'] ?? ''));
        $column_html = $column['html'] ?? '';
        $column_attr = $column_class ? " {\"className\":\"{$column_class}\"}" : '';
        $column_class_attr = $column_class ? " {$column_class}" : '';

        $column_markup .= <<<HTML
<!-- wp:column{$column_attr} -->
<div class="wp-block-column{$column_class_attr}">{$column_html}</div>
<!-- /wp:column -->

HTML;
    }

    return <<<HTML
<!-- wp:columns {{$align_attr}{$class_attr}} -->
<div class="wp-block-columns{$block_class_attr}">{$column_markup}</div>
<!-- /wp:columns -->
HTML;
}

function my_website_block_test_content(): string
{
    $image_ids = my_website_block_test_image_ids(4);
    $image_id = (int) ($image_ids[0] ?? 0);
    $alternate_image_id = (int) ($image_ids[1] ?? $image_id);
    $left_image = my_website_block_test_image_block($image_id, 'left', 'Left aligned image with breakout and wrapped text.');
    $right_image = my_website_block_test_image_block($alternate_image_id, 'right', 'Right aligned image with breakout and wrapped text.');
    $center_image = my_website_block_test_image_block($image_id, 'center', 'Centered image.');
    $wide_image = my_website_block_test_image_block($alternate_image_id, 'wide', 'Wide image.');
    $full_image = my_website_block_test_image_block($image_id, 'full', 'Full-width image.');
    $gallery = my_website_block_test_gallery_block($image_ids);
    $media_text = my_website_block_test_media_text_block(
        $alternate_image_id,
        '',
        false,
        'Media and text',
        'This default variant keeps media on the left and should remain readable within the normal article column.'
    );
    $media_text_wide = my_website_block_test_media_text_block(
        $image_id,
        'wide',
        true,
        'Wide media and text',
        'This wide variant checks whether a media-text block can break wider than the article column while keeping the media on the right.'
    );
    $media_text_full = my_website_block_test_media_text_block(
        $alternate_image_id,
        'full',
        false,
        'Full-width media and text',
        'This full-width variant checks whether the block can use the full shell width without falling apart or drifting off the page system.'
    );
    $media_text_middle = my_website_block_test_media_text_block(
        $image_id,
        'wide',
        false,
        'Middle-aligned media and text',
        'This variant checks the frontend vertical centering behavior for media and copy.',
        'center'
    );
    $media_text_bottom = my_website_block_test_media_text_block(
        $alternate_image_id,
        'wide',
        true,
        'Bottom-aligned media and text',
        'This variant checks whether media-on-right and bottom alignment can coexist without collapsing the shell.',
        'bottom'
    );
    $two_column_full = my_website_block_test_columns_block([
        [
            'html' => '<!-- wp:heading {"level":3} --><h3>Full-width two-column layout</h3><!-- /wp:heading --><!-- wp:paragraph --><p>This variant checks whether a full-width two-column block actually uses more of the shell than the normal and wide versions.</p><!-- /wp:paragraph -->',
        ],
        [
            'html' => '<!-- wp:paragraph --><p>The second column should still feel attached to the same article geometry rather than becoming a free-floating layout island.</p><!-- /wp:paragraph -->',
        ],
    ], 'full');
    $three_column_full = my_website_block_test_columns_block([
        [
            'html' => '<!-- wp:heading {"level":3} --><h3>Full-width three-column layout</h3><!-- /wp:heading --><!-- wp:paragraph --><p>Column one.</p><!-- /wp:paragraph -->',
        ],
        [
            'html' => '<!-- wp:paragraph --><p>Column two.</p><!-- /wp:paragraph -->',
        ],
        [
            'html' => '<!-- wp:paragraph --><p>Column three.</p><!-- /wp:paragraph -->',
        ],
    ], 'full');
    $four_column_wide = my_website_block_test_columns_block([
        ['html' => '<!-- wp:paragraph --><p>Wide four-column one.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Wide four-column two.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Wide four-column three.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Wide four-column four.</p><!-- /wp:paragraph -->'],
    ], 'wide');
    $four_column_full = my_website_block_test_columns_block([
        ['html' => '<!-- wp:paragraph --><p>Full four-column one.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Full four-column two.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Full four-column three.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Full four-column four.</p><!-- /wp:paragraph -->'],
    ], 'full');
    $five_column_wide = my_website_block_test_columns_block([
        ['html' => '<!-- wp:paragraph --><p>Wide five-column one.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Wide five-column two.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Wide five-column three.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Wide five-column four.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Wide five-column five.</p><!-- /wp:paragraph -->'],
    ], 'wide');
    $five_column_full = my_website_block_test_columns_block([
        ['html' => '<!-- wp:paragraph --><p>Full five-column one.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Full five-column two.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Full five-column three.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Full five-column four.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Full five-column five.</p><!-- /wp:paragraph -->'],
    ], 'full');
    $six_column_wide = my_website_block_test_columns_block([
        ['html' => '<!-- wp:paragraph --><p>One.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Two.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Three.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Four.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Five.</p><!-- /wp:paragraph -->'],
        ['html' => '<!-- wp:paragraph --><p>Six.</p><!-- /wp:paragraph -->'],
    ], 'wide');
    $vertical_columns = my_website_block_test_columns_block([
        [
            'className' => 'is-vertically-aligned-top',
            'html' => '<!-- wp:heading {"level":4} --><h4>Top aligned</h4><!-- /wp:heading --><!-- wp:paragraph --><p>Short content.</p><!-- /wp:paragraph -->',
        ],
        [
            'className' => 'is-vertically-aligned-center',
            'html' => '<!-- wp:heading {"level":4} --><h4>Middle aligned</h4><!-- /wp:heading --><!-- wp:paragraph --><p>This column is taller so the middle alignment is actually visible when compared to its neighbors in the same row.</p><!-- /wp:paragraph -->',
        ],
        [
            'className' => 'is-vertically-aligned-bottom',
            'html' => '<!-- wp:heading {"level":4} --><h4>Bottom aligned</h4><!-- /wp:heading --><!-- wp:paragraph --><p>Short content.</p><!-- /wp:paragraph -->',
        ],
    ], 'wide', 'are-vertically-aligned-center');

    return <<<HTML
<!-- wp:paragraph -->
<p>This is a generated block QA article. It exists so the frontend can be tested against realistic Gutenberg output instead of one-off hand-authored examples.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Text Rhythm</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3>Third-level heading</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Third-level headings should feel subordinate to section headings while still being obvious scan points.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4>Fourth-level heading</h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Fourth-level headings are included because long essays and case studies often need nested sections.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":5} -->
<h5>Fifth-level heading</h5>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Fifth-level headings should still inherit the same article column and not drift outside the editorial rhythm.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":6} -->
<h6>Sixth-level heading</h6>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Sixth-level headings exist here mainly as a regression check so the shell and typography systems do not quietly forget about them.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>This paragraph includes <a href="https://example.com">a normal text link</a>, <strong>bold text</strong>, <em>emphasis</em>, and enough body copy to show line length and spacing. The goal is to make regressions obvious when changing global content styles.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><li>First unordered list item</li><li>Second unordered list item with <a href="https://example.com">a link</a><ul><li>Nested unordered list item</li><li>Another nested item</li></ul></li><li>Third unordered list item</li></ul>
<!-- /wp:list -->

<!-- wp:list {"ordered":true} -->
<ol><li>First ordered list item</li><li>Second ordered list item<ol><li>Nested ordered item</li><li>Another nested ordered item</li></ol></li><li>Third ordered list item</li></ol>
<!-- /wp:list -->

<!-- wp:quote -->
<blockquote class="wp-block-quote"><!-- wp:paragraph -->
<p>Everything should be legible before it is clever.</p>
<!-- /wp:paragraph --><cite>Generated block QA</cite></blockquote>
<!-- /wp:quote -->

<!-- wp:paragraph -->
<p>Introductory prose before the left-aligned quote makes it easier to judge whether the block feels embedded in real article flow rather than floating as an isolated specimen.</p>
<!-- /wp:paragraph -->

<!-- wp:quote {"align":"left"} -->
<blockquote class="wp-block-quote alignleft"><!-- wp:paragraph -->
<p>Left-aligned quote block.</p>
<!-- /wp:paragraph --><cite>QA fixture</cite></blockquote>
<!-- /wp:quote -->

<!-- wp:paragraph -->
<p>Follow-up prose after the left quote checks whether spacing and column rhythm recover gracefully.</p>
<!-- /wp:paragraph -->

<!-- wp:quote {"textAlign":"center"} -->
<blockquote class="wp-block-quote has-text-align-center"><!-- wp:paragraph -->
<p>Centered quote text block.</p>
<!-- /wp:paragraph --><cite>QA fixture</cite></blockquote>
<!-- /wp:quote -->

<!-- wp:paragraph -->
<p>Another paragraph after the centered quote checks whether centered quotation styling still returns cleanly to ordinary article reading width.</p>
<!-- /wp:paragraph -->

<!-- wp:quote {"align":"right"} -->
<blockquote class="wp-block-quote alignright"><!-- wp:paragraph -->
<p>Right-aligned quote block.</p>
<!-- /wp:paragraph --><cite>QA fixture</cite></blockquote>
<!-- /wp:quote -->

<!-- wp:paragraph -->
<p>This concluding paragraph after the right-aligned quote should make any remaining wrap or spacing problems obvious.</p>
<!-- /wp:paragraph -->

<!-- wp:pullquote -->
<figure class="wp-block-pullquote"><blockquote><p>A pullquote should feel distinct from a regular quote.</p><cite>QA fixture</cite></blockquote></figure>
<!-- /wp:pullquote -->

<!-- wp:paragraph -->
<p>Text before the left pullquote should help show whether the block feels like a deliberate article interruption rather than a disconnected banner.</p>
<!-- /wp:paragraph -->

<!-- wp:pullquote {"align":"left"} -->
<figure class="wp-block-pullquote alignleft"><blockquote><p>Left-aligned pullquote.</p><cite>QA fixture</cite></blockquote></figure>
<!-- /wp:pullquote -->

<!-- wp:paragraph -->
<p>Supporting text after the left pullquote should make it easier to judge its width, offset, and recovery back into the article column.</p>
<!-- /wp:paragraph -->

<!-- wp:pullquote {"align":"right"} -->
<figure class="wp-block-pullquote alignright"><blockquote><p>Right-aligned pullquote.</p><cite>QA fixture</cite></blockquote></figure>
<!-- /wp:pullquote -->

<!-- wp:paragraph -->
<p>More body copy after the right pullquote helps reveal whether the pullquote breaks the shell or still behaves like part of the same page system.</p>
<!-- /wp:paragraph -->

<!-- wp:pullquote {"align":"wide"} -->
<figure class="wp-block-pullquote alignwide"><blockquote><p>Wide pullquote.</p><cite>QA fixture</cite></blockquote></figure>
<!-- /wp:pullquote -->

<!-- wp:pullquote {"align":"full"} -->
<figure class="wp-block-pullquote alignfull"><blockquote><p>Full-width pullquote.</p><cite>QA fixture</cite></blockquote></figure>
<!-- /wp:pullquote -->

<!-- wp:heading -->
<h2>Text Alignment</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Default left-aligned paragraph text should remain calm, readable, and column-based.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">Centered paragraph text tests middle alignment without widening the reading measure.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"align":"right"} -->
<p class="has-text-align-right">Right-aligned paragraph text tests rag direction, spacing, and whether punctuation or links feel awkward.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center"} -->
<h2 class="wp-block-heading has-text-align-center">Centered section heading</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3,"textAlign":"right"} -->
<h3 class="wp-block-heading has-text-align-right">Right-aligned subheading</h3>
<!-- /wp:heading -->

<!-- wp:heading -->
<h2>Image Alignment</h2>
<!-- /wp:heading -->

{$left_image}

<!-- wp:paragraph -->
<p>This paragraph follows a left-aligned image and should wrap around it. The image should break partly outside the readable text column while the text still occupies the remaining inline space. This copy intentionally runs long enough to make float behavior visible across several lines.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Additional text after the left image checks whether the float clears naturally once the content becomes longer than the media height.</p>
<!-- /wp:paragraph -->

{$right_image}

<!-- wp:paragraph -->
<p>This paragraph follows a right-aligned image and should also wrap around it. The media should sit slightly outside the normal body column on the right while the text remains comfortable and readable on the left.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Additional text after the right image checks how the next paragraph behaves while the float is still active.</p>
<!-- /wp:paragraph -->

{$center_image}

{$wide_image}

{$full_image}

<!-- wp:heading -->
<h2>Media Layout Blocks</h2>
<!-- /wp:heading -->

{$gallery}

{$media_text}

{$media_text_wide}

{$media_text_full}

{$media_text_middle}

{$media_text_bottom}

<!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":3} -->
<h3>First column</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Columns should remain readable and collapse responsibly.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":3} -->
<h3>Second column</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This fixture uses columns sparingly because combinations can explode quickly.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

{$two_column_full}

<!-- wp:columns {"align":"wide"} -->
<div class="wp-block-columns alignwide"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":3} -->
<h3>Wide two-column layout</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This variant checks whether a two-column block actually becomes wider than the ordinary article column without breaking the rhythm.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:paragraph -->
<p>The second column should still feel like part of the same page system and not like an unrelated mini-layout dropped into the middle of the article.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

{$three_column_full}

{$four_column_wide}

{$four_column_full}

{$five_column_wide}

{$five_column_full}

{$six_column_wide}

{$vertical_columns}

<!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":3} -->
<h3>Three-column layout</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Column one.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:paragraph -->
<p>Column two.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:paragraph -->
<p>Column three.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:columns {"align":"wide"} -->
<div class="wp-block-columns alignwide"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":3} -->
<h3>Wide three-column layout</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This wide variant checks whether a three-column block can intentionally break beyond the article column without swallowing the next block.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:paragraph -->
<p>Column two.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:paragraph -->
<p>Column three.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:group {"className":"qa-callout-group"} -->
<div class="wp-block-group qa-callout-group"><!-- wp:heading {"level":3} -->
<h3>Grouped callout</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Group blocks are useful for callouts and should not accidentally destroy body rhythm.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:heading -->
<h2>Code</h2>
<!-- /wp:heading -->

<!-- wp:code {"className":"language-js"} -->
<pre class="wp-block-code language-js"><code>// A highlighted JavaScript example.
const message = 'Bottom line, still up front.';
console.log(message.toUpperCase());</code></pre>
<!-- /wp:code -->

<!-- wp:code {"align":"wide","className":"language-css"} -->
<pre class="wp-block-code alignwide language-css"><code>.wide-preview {
  max-width: 100%;
  padding: 1rem;
  border: 1px solid currentColor;
}</code></pre>
<!-- /wp:code -->

<!-- wp:heading -->
<h2>Tables and Embeds</h2>
<!-- /wp:heading -->

<!-- wp:table {"hasFixedLayout":false} -->
<figure class="wp-block-table"><table><thead><tr><th>Block</th><th>Expected behavior</th></tr></thead><tbody><tr><td>Table</td><td>Readable and horizontally safe</td></tr><tr><td>Caption</td><td>Styled below</td></tr></tbody><tfoot><tr><td>Footer row</td><td>Still legible</td></tr></tfoot></table><figcaption>Table caption test.</figcaption></figure>
<!-- /wp:table -->

<!-- wp:table {"align":"wide","hasFixedLayout":false} -->
<figure class="wp-block-table alignwide"><table><thead><tr><th>Wide table</th><th>Column B</th><th>Column C</th><th>Column D</th></tr></thead><tbody><tr><td>Wide layout</td><td>Should break out wider than body text</td><td>Without pretending to be full width</td><td>And still remain readable</td></tr><tr><td>Second row</td><td>More cells</td><td>More content</td><td>More QA</td></tr></tbody></table><figcaption>Wide table caption test.</figcaption></figure>
<!-- /wp:table -->

<!-- wp:embed {"url":"https://www.youtube.com/watch?v=oxwRVzNesoI","type":"video","providerNameSlug":"youtube","responsive":true,"className":"wp-embed-aspect-16-9 wp-has-aspect-ratio"} -->
<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper">https://www.youtube.com/watch?v=oxwRVzNesoI</div><figcaption>YouTube embed test.</figcaption></figure>
<!-- /wp:embed -->

<!-- wp:embed {"url":"https://www.youtube.com/watch?v=oxwRVzNesoI","type":"video","providerNameSlug":"youtube","responsive":true,"align":"wide","className":"wp-embed-aspect-16-9 wp-has-aspect-ratio"} -->
<figure class="wp-block-embed alignwide is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper">https://www.youtube.com/watch?v=oxwRVzNesoI</div><figcaption>Wide YouTube embed test.</figcaption></figure>
<!-- /wp:embed -->

<!-- wp:embed {"url":"https://vimeo.com/80128671?turnstile=1.RFT5yYxUviTChz5o-mkh5yuSZbfw3nB7Jt8AKUKULeuCytj4hUDw9KbQRgjwcXaE0VZ9qKNk3fYsBy-fbD512pFV4Nm-WZ8qMzAh13Ffx2TyUahZ4q0y_f29c10MmqqfRcfA9Pdz_3KxRHwbEfm9tPL9kEHNGnmgpZW7c9AUfa4Lm-edagSQywON39-2QSKbebffeMVJbIoIV9CID1mCjZdYv4ouIBHRFGKqeJ4ypes1bkyNcXZcwa6mUsuBoNZ7xlDDCWtYs3BlN1jPeCJr2n5TKmsZBeijYkR-TAnRDMNWAuoIH2TjTDHknkSe1GrCYV3jEuOIgNnD_02nQUw5Kqt8wka_cb6tRt9n7-lbYxFJDP2TaN703AOT1IniLneFy06Ta8_ln2OKpDvs1Qaznx4JeoRlBFtkXwXyfSkWdD1w7MH2nf4w037T8c_klvQAa4G0jdvacFW8uJSymsNmnFxSHqLUttSFH_L8H-NGQvvwH-O9TLNjrw2C2sKcsEmQwnf1ESYV3VrUT72S7gj7lz0grnH4TGUtGB-c05bB4k7ciz46CZaitHnv6q0ttxnwNUQQEEYPW41f6VetV8K2HVqZkIGXM2Bc9mUtKaW2_gVjGYYdyT-Z-qbV8OpxmKEkUjj6qaSs_F3h5LsG5RAP4SP3EcgQ4OWGkE2kWLU_r_o.uSZikRNyBU6VkOe4nGjumQ.fb0aa7847ca533eba422fcd6fab97f6931259dcfa6dca5ddeefa510f26a65efc","type":"video","providerNameSlug":"vimeo","responsive":true,"className":"wp-embed-aspect-16-9 wp-has-aspect-ratio"} -->
<figure class="wp-block-embed is-type-video is-provider-vimeo wp-block-embed-vimeo wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper">https://vimeo.com/80128671?turnstile=1.RFT5yYxUviTChz5o-mkh5yuSZbfw3nB7Jt8AKUKULeuCytj4hUDw9KbQRgjwcXaE0VZ9qKNk3fYsBy-fbD512pFV4Nm-WZ8qMzAh13Ffx2TyUahZ4q0y_f29c10MmqqfRcfA9Pdz_3KxRHwbEfm9tPL9kEHNGnmgpZW7c9AUfa4Lm-edagSQywON39-2QSKbebffeMVJbIoIV9CID1mCjZdYv4ouIBHRFGKqeJ4ypes1bkyNcXZcwa6mUsuBoNZ7xlDDCWtYs3BlN1jPeCJr2n5TKmsZBeijYkR-TAnRDMNWAuoIH2TjTDHknkSe1GrCYV3jEuOIgNnD_02nQUw5Kqt8wka_cb6tRt9n7-lbYxFJDP2TaN703AOT1IniLneFy06Ta8_ln2OKpDvs1Qaznx4JeoRlBFtkXwXyfSkWdD1w7MH2nf4w037T8c_klvQAa4G0jdvacFW8uJSymsNmnFxSHqLUttSFH_L8H-NGQvvwH-O9TLNjrw2C2sKcsEmQwnf1ESYV3VrUT72S7gj7lz0grnH4TGUtGB-c05bB4k7ciz46CZaitHnv6q0ttxnwNUQQEEYPW41f6VetV8K2HVqZkIGXM2Bc9mUtKaW2_gVjGYYdyT-Z-qbV8OpxmKEkUjj6qaSs_F3h5LsG5RAP4SP3EcgQ4OWGkE2kWLU_r_o.uSZikRNyBU6VkOe4nGjumQ.fb0aa7847ca533eba422fcd6fab97f6931259dcfa6dca5ddeefa510f26a65efc</div><figcaption>Vimeo embed test.</figcaption></figure>
<!-- /wp:embed -->

<!-- wp:embed {"url":"https://vimeo.com/80128671?turnstile=1.RFT5yYxUviTChz5o-mkh5yuSZbfw3nB7Jt8AKUKULeuCytj4hUDw9KbQRgjwcXaE0VZ9qKNk3fYsBy-fbD512pFV4Nm-WZ8qMzAh13Ffx2TyUahZ4q0y_f29c10MmqqfRcfA9Pdz_3KxRHwbEfm9tPL9kEHNGnmgpZW7c9AUfa4Lm-edagSQywON39-2QSKbebffeMVJbIoIV9CID1mCjZdYv4ouIBHRFGKqeJ4ypes1bkyNcXZcwa6mUsuBoNZ7xlDDCWtYs3BlN1jPeCJr2n5TKmsZBeijYkR-TAnRDMNWAuoIH2TjTDHknkSe1GrCYV3jEuOIgNnD_02nQUw5Kqt8wka_cb6tRt9n7-lbYxFJDP2TaN703AOT1IniLneFy06Ta8_ln2OKpDvs1Qaznx4JeoRlBFtkXwXyfSkWdD1w7MH2nf4w037T8c_klvQAa4G0jdvacFW8uJSymsNmnFxSHqLUttSFH_L8H-NGQvvwH-O9TLNjrw2C2sKcsEmQwnf1ESYV3VrUT72S7gj7lz0grnH4TGUtGB-c05bB4k7ciz46CZaitHnv6q0ttxnwNUQQEEYPW41f6VetV8K2HVqZkIGXM2Bc9mUtKaW2_gVjGYYdyT-Z-qbV8OpxmKEkUjj6qaSs_F3h5LsG5RAP4SP3EcgQ4OWGkE2kWLU_r_o.uSZikRNyBU6VkOe4nGjumQ.fb0aa7847ca533eba422fcd6fab97f6931259dcfa6dca5ddeefa510f26a65efc","type":"video","providerNameSlug":"vimeo","responsive":true,"align":"wide","className":"wp-embed-aspect-16-9 wp-has-aspect-ratio"} -->
<figure class="wp-block-embed alignwide is-type-video is-provider-vimeo wp-block-embed-vimeo wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper">https://vimeo.com/80128671?turnstile=1.RFT5yYxUviTChz5o-mkh5yuSZbfw3nB7Jt8AKUKULeuCytj4hUDw9KbQRgjwcXaE0VZ9qKNk3fYsBy-fbD512pFV4Nm-WZ8qMzAh13Ffx2TyUahZ4q0y_f29c10MmqqfRcfA9Pdz_3KxRHwbEfm9tPL9kEHNGnmgpZW7c9AUfa4Lm-edagSQywON39-2QSKbebffeMVJbIoIV9CID1mCjZdYv4ouIBHRFGKqeJ4ypes1bkyNcXZcwa6mUsuBoNZ7xlDDCWtYs3BlN1jPeCJr2n5TKmsZBeijYkR-TAnRDMNWAuoIH2TjTDHknkSe1GrCYV3jEuOIgNnD_02nQUw5Kqt8wka_cb6tRt9n7-lbYxFJDP2TaN703AOT1IniLneFy06Ta8_ln2OKpDvs1Qaznx4JeoRlBFtkXwXyfSkWdD1w7MH2nf4w037T8c_klvQAa4G0jdvacFW8uJSymsNmnFxSHqLUttSFH_L8H-NGQvvwH-O9TLNjrw2C2sKcsEmQwnf1ESYV3VrUT72S7gj7lz0grnH4TGUtGB-c05bB4k7ciz46CZaitHnv6q0ttxnwNUQQEEYPW41f6VetV8K2HVqZkIGXM2Bc9mUtKaW2_gVjGYYdyT-Z-qbV8OpxmKEkUjj6qaSs_F3h5LsG5RAP4SP3EcgQ4OWGkE2kWLU_r_o.uSZikRNyBU6VkOe4nGjumQ.fb0aa7847ca533eba422fcd6fab97f6931259dcfa6dca5ddeefa510f26a65efc</div><figcaption>Wide Vimeo embed test.</figcaption></figure>
<!-- /wp:embed -->

<!-- wp:embed {"url":"https://www.youtube.com/watch?v=oxwRVzNesoI","type":"video","responsive":true} -->
<figure class="wp-block-embed is-type-video"><div class="wp-block-embed__wrapper">https://www.youtube.com/watch?v=oxwRVzNesoI</div><figcaption>Generic video embed fallback test.</figcaption></figure>
<!-- /wp:embed -->

<!-- wp:audio -->
<figure class="wp-block-audio"><audio controls src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"></audio><figcaption>Audio block test.</figcaption></figure>
<!-- /wp:audio -->

<!-- wp:audio {"align":"wide"} -->
<figure class="wp-block-audio alignwide"><audio controls src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"></audio><figcaption>Wide audio block test.</figcaption></figure>
<!-- /wp:audio -->

<!-- wp:video -->
<figure class="wp-block-video"><video controls src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"></video><figcaption>Video block test.</figcaption></figure>
<!-- /wp:video -->

<!-- wp:video {"align":"wide"} -->
<figure class="wp-block-video alignwide"><video controls src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"></video><figcaption>Wide video block test.</figcaption></figure>
<!-- /wp:video -->

<!-- wp:video {"align":"full"} -->
<figure class="wp-block-video alignfull"><video controls src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"></video><figcaption>Full-width video block test.</figcaption></figure>
<!-- /wp:video -->

<!-- wp:file {"href":"https://example.com/example-download.pdf","displayPreview":false} -->
<div class="wp-block-file"><a href="https://example.com/example-download.pdf">Example downloadable file</a><a href="https://example.com/example-download.pdf" class="wp-block-file__button wp-element-button" download>Download</a></div>
<!-- /wp:file -->

<!-- wp:file {"href":"https://example.com/example-download.pdf","displayPreview":false,"align":"wide"} -->
<div class="wp-block-file alignwide"><a href="https://example.com/example-download.pdf">Wide downloadable file</a><a href="https://example.com/example-download.pdf" class="wp-block-file__button wp-element-button" download>Download</a></div>
<!-- /wp:file -->

<!-- wp:heading -->
<h2>Details and Accordion</h2>
<!-- /wp:heading -->

<!-- wp:details -->
<details class="wp-block-details"><summary>Details title</summary><!-- wp:paragraph -->
<p>This is content inside a core Details block. It includes enough text to verify spacing, the disclosure affordance, and the visual separation between the summary line and the opened body copy.</p>
<!-- /wp:paragraph --></details>
<!-- /wp:details -->

<!-- wp:details {"align":"wide"} -->
<details class="wp-block-details alignwide"><summary>Wide details title</summary><!-- wp:paragraph -->
<p>This is content inside a wide Details block. It should break out wider than a normal paragraph box without becoming a full-bleed element, and it should still feel like part of the same article rhythm.</p>
<!-- /wp:paragraph --></details>
<!-- /wp:details -->

<!-- wp:accordion -->
<div class="wp-block-accordion" role="group"><!-- wp:accordion-item -->
<div class="wp-block-accordion-item"><!-- wp:accordion-heading -->
<h3 class="wp-block-accordion-heading"><button class="wp-block-accordion-heading__toggle" type="button"><span class="wp-block-accordion-heading__toggle-title">Accordion title</span><span class="wp-block-accordion-heading__toggle-icon" aria-hidden="true">+</span></button></h3>
<!-- /wp:accordion-heading -->

<!-- wp:accordion-panel -->
<div class="wp-block-accordion-panel" role="region"><!-- wp:paragraph -->
<p>This is content inside a generated accordion block. It should prove that the accordion can hold normal paragraph content and that the frontend renderer is not just showing an empty disclosure shell.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:accordion-panel --></div>
<!-- /wp:accordion-item -->

<!-- wp:accordion-item -->
<div class="wp-block-accordion-item"><!-- wp:accordion-heading -->
<h3 class="wp-block-accordion-heading"><button class="wp-block-accordion-heading__toggle" type="button"><span class="wp-block-accordion-heading__toggle-title">Second accordion item</span><span class="wp-block-accordion-heading__toggle-icon" aria-hidden="true">+</span></button></h3>
<!-- /wp:accordion-heading -->

<!-- wp:accordion-panel -->
<div class="wp-block-accordion-panel" role="region"><!-- wp:paragraph -->
<p>This second item exists so accordion behavior can actually be distinguished from a single Details disclosure. Opening one item should close the other when auto-close is enabled.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:accordion-panel --></div>
<!-- /wp:accordion-item --></div>
<!-- /wp:accordion -->

<!-- wp:accordion {"align":"wide","autoclose":true} -->
<div class="wp-block-accordion alignwide" role="group"><!-- wp:accordion-item -->
<div class="wp-block-accordion-item"><!-- wp:accordion-heading -->
<h3 class="wp-block-accordion-heading"><button class="wp-block-accordion-heading__toggle" type="button"><span class="wp-block-accordion-heading__toggle-title">Wide accordion title</span><span class="wp-block-accordion-heading__toggle-icon" aria-hidden="true">+</span></button></h3>
<!-- /wp:accordion-heading -->

<!-- wp:accordion-panel -->
<div class="wp-block-accordion-panel" role="region"><!-- wp:paragraph -->
<p>This is content inside a generated wide accordion block. It should break out wider than normal prose, preserve its own body spacing, and remain readable when opened.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:accordion-panel --></div>
<!-- /wp:accordion-item -->

<!-- wp:accordion-item -->
<div class="wp-block-accordion-item"><!-- wp:accordion-heading -->
<h3 class="wp-block-accordion-heading"><button class="wp-block-accordion-heading__toggle" type="button"><span class="wp-block-accordion-heading__toggle-title">Wide accordion second item</span><span class="wp-block-accordion-heading__toggle-icon" aria-hidden="true">+</span></button></h3>
<!-- /wp:accordion-heading -->

<!-- wp:accordion-panel -->
<div class="wp-block-accordion-panel" role="region"><!-- wp:paragraph -->
<p>This second wide item exists so auto-close behavior, grouped borders, and body spacing can all be evaluated together.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:accordion-panel --></div>
<!-- /wp:accordion-item --></div>
<!-- /wp:accordion -->

<!-- wp:separator -->
<hr class="wp-block-separator has-alpha-channel-opacity"/>
<!-- /wp:separator -->

<!-- wp:separator {"className":"is-style-wide"} -->
<hr class="wp-block-separator has-alpha-channel-opacity is-style-wide"/>
<!-- /wp:separator -->

<!-- wp:separator {"className":"is-style-dots"} -->
<hr class="wp-block-separator has-alpha-channel-opacity is-style-dots"/>
<!-- /wp:separator -->

<!-- wp:spacer {"height":"48px"} -->
<div style="height:48px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://example.com">Button link</a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="https://example.com">Outline button</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons is-content-justification-center"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://example.com">Centered button group</a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="https://example.com">Centered outline</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->

<!-- wp:buttons {"align":"wide","layout":{"type":"flex","justifyContent":"right"}} -->
<div class="wp-block-buttons alignwide is-content-justification-right"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://example.com">Wide right-aligned group</a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="https://example.com">Secondary action</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->
HTML;
}

function my_website_block_test_upsert(string $post_type, string $title, string $slug, string $excerpt): int
{
    $existing = get_page_by_path($slug, OBJECT, $post_type);

    $post_data = [
        'post_type' => $post_type,
        'post_title' => $title,
        'post_name' => $slug,
        'post_excerpt' => $excerpt,
        'post_status' => 'publish',
        'post_content' => my_website_block_test_content(),
    ];

    if ($existing instanceof WP_Post) {
        $post_data['ID'] = $existing->ID;
        $post_id = wp_update_post($post_data, true);
    } else {
        $post_id = wp_insert_post($post_data, true);
    }

    if (is_wp_error($post_id)) {
        WP_CLI::error($post_id->get_error_message());
    }

    $image_id = my_website_block_test_first_image_id();

    if ($image_id) {
        set_post_thumbnail((int) $post_id, $image_id);
    }

    return (int) $post_id;
}

$post_id = my_website_block_test_upsert(
    'post',
    'Block QA: Kitchen Sink Post',
    'block-qa-kitchen-sink-post',
    'A generated post for testing common Gutenberg block rendering.'
);

$case_study_id = my_website_block_test_upsert(
    'case_study',
    'Block QA: Kitchen Sink Case Study',
    'block-qa-kitchen-sink-case-study',
    'A generated case study for testing common Gutenberg block rendering.'
);

WP_CLI::success("Created/updated block QA post {$post_id} and case study {$case_study_id}.");
