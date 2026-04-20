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

function my_website_block_test_cover_block(int $image_id): string
{
    if (! $image_id) {
        return '<!-- wp:paragraph --><p><em>Cover test skipped because no media image exists yet.</em></p><!-- /wp:paragraph -->';
    }

    $url = wp_get_attachment_image_url($image_id, 'large');
    $alt = get_post_meta($image_id, '_wp_attachment_image_alt', true);

    return <<<HTML
<!-- wp:cover {"url":"{$url}","id":{$image_id},"dimRatio":30,"minHeight":360,"isDark":false} -->
<div class="wp-block-cover is-light" style="min-height:360px"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-30 has-background-dim"></span><img class="wp-block-cover__image-background wp-image-{$image_id}" alt="{$alt}" src="{$url}" data-object-fit="cover"/><div class="wp-block-cover__inner-container"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Cover block headline</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Cover blocks should preserve readable text over a media background.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:cover -->
HTML;
}

function my_website_block_test_media_text_block(int $image_id): string
{
    if (! $image_id) {
        return '<!-- wp:paragraph --><p><em>Media/text test skipped because no media image exists yet.</em></p><!-- /wp:paragraph -->';
    }

    $url = wp_get_attachment_image_url($image_id, 'large');
    $alt = get_post_meta($image_id, '_wp_attachment_image_alt', true);

    return <<<HTML
<!-- wp:media-text {"mediaId":{$image_id},"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="{$url}" alt="{$alt}" class="wp-image-{$image_id} size-full"/></figure><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Media and text</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This block checks paired media and copy. It should stay readable on desktop and stack cleanly on narrow screens.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->
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
    $cover = my_website_block_test_cover_block($image_id);
    $media_text = my_website_block_test_media_text_block($alternate_image_id);

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

<!-- wp:paragraph -->
<p>This paragraph includes <a href="https://example.com">a normal text link</a>, <strong>bold text</strong>, <em>emphasis</em>, and enough body copy to show line length and spacing. The goal is to make regressions obvious when changing global content styles.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><li>First unordered list item</li><li>Second unordered list item with <a href="https://example.com">a link</a><ul><li>Nested unordered list item</li><li>Another nested item</li></ul></li><li>Third unordered list item</li></ul>
<!-- /wp:list -->

<!-- wp:list {"ordered":true} -->
<ol><li>First ordered list item</li><li>Second ordered list item<ol><li>Nested ordered item</li><li>Another nested ordered item</li></ol></li><li>Third ordered list item</li></ol>
<!-- /wp:list -->

<!-- wp:verse -->
<pre class="wp-block-verse">A verse block preserves line breaks,
  indentation,
and a different kind of rhythm.</pre>
<!-- /wp:verse -->

<!-- wp:quote -->
<blockquote class="wp-block-quote"><p>Everything should be legible before it is clever.</p><cite>Generated block QA</cite></blockquote>
<!-- /wp:quote -->

<!-- wp:pullquote -->
<figure class="wp-block-pullquote"><blockquote><p>A pullquote should feel distinct from a regular quote.</p><cite>QA fixture</cite></blockquote></figure>
<!-- /wp:pullquote -->

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

{$cover}

{$media_text}

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

<!-- wp:group {"className":"qa-callout-group"} -->
<div class="wp-block-group qa-callout-group"><!-- wp:heading {"level":3} -->
<h3>Grouped callout</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Group blocks are useful for callouts and should not accidentally destroy body rhythm.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:heading -->
<h2>Code, Preformatted, and HTML</h2>
<!-- /wp:heading -->

<!-- wp:code {"className":"language-js"} -->
<pre class="wp-block-code language-js"><code>// A highlighted JavaScript example.
const message = 'Bottom line, still up front.';
console.log(message.toUpperCase());</code></pre>
<!-- /wp:code -->

<!-- wp:preformatted -->
<pre class="wp-block-preformatted">Preformatted text should preserve spacing
  and indentation
    without pretending to be highlighted code.</pre>
<!-- /wp:preformatted -->

<!-- wp:html -->
<table><tbody><tr><th>HTML table heading</th><th>Status</th></tr><tr><td>Fallback HTML table</td><td>Visible</td></tr></tbody></table>
<!-- /wp:html -->

<!-- wp:heading -->
<h2>Tables and Embeds</h2>
<!-- /wp:heading -->

<!-- wp:table {"hasFixedLayout":false} -->
<figure class="wp-block-table"><table><thead><tr><th>Block</th><th>Expected behavior</th></tr></thead><tbody><tr><td>Table</td><td>Readable and horizontally safe</td></tr><tr><td>Caption</td><td>Styled below</td></tr></tbody><tfoot><tr><td>Footer row</td><td>Still legible</td></tr></tfoot></table><figcaption>Table caption test.</figcaption></figure>
<!-- /wp:table -->

<!-- wp:embed {"url":"https://www.youtube.com/watch?v=NdVG45wveo","type":"video","providerNameSlug":"youtube","responsive":true,"className":"wp-embed-aspect-16-9 wp-has-aspect-ratio"} -->
<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper">https://www.youtube.com/watch?v=NdVG45wveo</div><figcaption>YouTube embed test.</figcaption></figure>
<!-- /wp:embed -->

<!-- wp:embed {"url":"https://vimeo.com/76979871","type":"video","providerNameSlug":"vimeo","responsive":true,"className":"wp-embed-aspect-16-9 wp-has-aspect-ratio"} -->
<figure class="wp-block-embed is-type-video is-provider-vimeo wp-block-embed-vimeo wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper">https://vimeo.com/76979871</div><figcaption>Vimeo embed test.</figcaption></figure>
<!-- /wp:embed -->

<!-- wp:embed {"url":"https://example.com","type":"rich","providerNameSlug":"example","responsive":true} -->
<figure class="wp-block-embed is-type-rich is-provider-example wp-block-embed-example"><div class="wp-block-embed__wrapper">https://example.com</div><figcaption>Generic embed fallback test.</figcaption></figure>
<!-- /wp:embed -->

<!-- wp:audio -->
<figure class="wp-block-audio"><audio controls src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"></audio><figcaption>Audio block test.</figcaption></figure>
<!-- /wp:audio -->

<!-- wp:video -->
<figure class="wp-block-video"><video controls src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"></video><figcaption>Video block test.</figcaption></figure>
<!-- /wp:video -->

<!-- wp:file {"href":"https://example.com/example-download.pdf","displayPreview":false} -->
<div class="wp-block-file"><a href="https://example.com/example-download.pdf">Example downloadable file</a><a href="https://example.com/example-download.pdf" class="wp-block-file__button wp-element-button" download>Download</a></div>
<!-- /wp:file -->

<!-- wp:heading -->
<h2>Details and Accordion</h2>
<!-- /wp:heading -->

<!-- wp:details -->
<details class="wp-block-details"><summary>Details title</summary><p>This is content inside a core Details block.</p></details>
<!-- /wp:details -->

<!-- wp:accordion -->
<div class="wp-block-accordion"><button aria-expanded="false" aria-controls="accordion-panel-generated">Accordion title</button><div id="accordion-panel-generated"><p>This is content inside a generated accordion block.</p></div></div>
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
