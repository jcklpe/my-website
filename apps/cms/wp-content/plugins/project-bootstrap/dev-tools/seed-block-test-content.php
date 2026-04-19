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
    $attachments = get_posts([
        'post_type' => 'attachment',
        'post_mime_type' => 'image',
        'post_status' => 'inherit',
        'posts_per_page' => 1,
        'orderby' => 'date',
        'order' => 'DESC',
        'fields' => 'ids',
    ]);

    return (int) ($attachments[0] ?? 0);
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

function my_website_block_test_content(): string
{
    $image_id = my_website_block_test_first_image_id();
    $left_image = my_website_block_test_image_block($image_id, 'left', 'Left aligned image with breakout and wrapped text.');
    $right_image = my_website_block_test_image_block($image_id, 'right', 'Right aligned image with breakout and wrapped text.');
    $center_image = my_website_block_test_image_block($image_id, 'center', 'Centered image.');
    $wide_image = my_website_block_test_image_block($image_id, 'wide', 'Wide image.');
    $full_image = my_website_block_test_image_block($image_id, 'full', 'Full-width image.');

    return <<<HTML
<!-- wp:paragraph -->
<p>This is a generated block QA article. It exists so the frontend can be tested against realistic Gutenberg output instead of one-off hand-authored examples.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Text Rhythm</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This paragraph includes <a href="https://example.com">a normal text link</a>, <strong>bold text</strong>, <em>emphasis</em>, and enough body copy to show line length and spacing. The goal is to make regressions obvious when changing global content styles.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><li>First unordered list item</li><li>Second unordered list item with <a href="https://example.com">a link</a></li><li>Third unordered list item</li></ul>
<!-- /wp:list -->

<!-- wp:list {"ordered":true} -->
<ol><li>First ordered list item</li><li>Second ordered list item</li><li>Third ordered list item</li></ol>
<!-- /wp:list -->

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

<!-- wp:table -->
<figure class="wp-block-table"><table><tbody><tr><th>Block</th><th>Expected behavior</th></tr><tr><td>Table</td><td>Readable and horizontally safe</td></tr><tr><td>Caption</td><td>Styled below</td></tr></tbody></table><figcaption>Table caption test.</figcaption></figure>
<!-- /wp:table -->

<!-- wp:embed {"url":"https://www.youtube.com/watch?v=NdVG45wveo","type":"video","providerNameSlug":"youtube","responsive":true,"className":"wp-embed-aspect-16-9 wp-has-aspect-ratio"} -->
<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper">https://www.youtube.com/watch?v=NdVG45wveo</div><figcaption>YouTube embed test.</figcaption></figure>
<!-- /wp:embed -->

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

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button --><div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://example.com">Button link</a></div><!-- /wp:button --></div>
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
