<?php
/**
 * Seed writing posts for archive load-more QA.
 *
 * Run from the repo root:
 * docker compose -f docker/compose.yaml -f docker/compose.dev.yaml exec -T cms \
 *   wp eval-file wp-content/plugins/project-bootstrap/dev-tools/seed-writing-load-more-test-content.php --allow-root
 */

if (! defined('ABSPATH')) {
    exit;
}

function my_website_load_more_fixture_log(string $message): void
{
    if (defined('WP_CLI') && WP_CLI) {
        WP_CLI::log($message);
    }
}

function my_website_load_more_fixture_success(string $message): void
{
    if (defined('WP_CLI') && WP_CLI) {
        WP_CLI::success($message);
    }
}

function my_website_load_more_fixture_warning(string $message): void
{
    if (defined('WP_CLI') && WP_CLI) {
        WP_CLI::warning($message);
    }
}

function my_website_load_more_fixture_existing_image_ids(): array
{
    $attachments = get_posts([
        'post_type' => 'attachment',
        'post_mime_type' => 'image',
        'post_status' => 'inherit',
        'posts_per_page' => -1,
        'orderby' => 'date',
        'order' => 'DESC',
        'fields' => 'ids',
    ]);

    return array_map('intval', $attachments);
}

function my_website_load_more_fixture_fallback_image_id(): int
{
    $existing = get_page_by_path('load-more-fixture-featured-media', OBJECT, 'attachment');

    if ($existing) {
        return (int) $existing->ID;
    }

    $source_paths = [
        ABSPATH . 'assets/site-icon.jpg',
        ABSPATH . 'wp-content/themes/my-website-editor-theme/assets/site-icon.jpg',
    ];
    $source_path = '';

    foreach ($source_paths as $path) {
        if (file_exists($path)) {
            $source_path = $path;
            break;
        }
    }

    if (! $source_path) {
        return 0;
    }

    $upload = wp_upload_bits(
        'load-more-fixture-featured-media.jpg',
        null,
        file_get_contents($source_path)
    );

    if (! empty($upload['error'])) {
        my_website_load_more_fixture_warning('Could not create fallback fixture image: ' . $upload['error']);
        return 0;
    }

    $attachment_id = wp_insert_attachment([
        'post_mime_type' => 'image/jpeg',
        'post_title' => 'Load more fixture featured media',
        'post_name' => 'load-more-fixture-featured-media',
        'post_content' => '',
        'post_status' => 'inherit',
    ], $upload['file']);

    if (is_wp_error($attachment_id)) {
        my_website_load_more_fixture_warning('Could not insert fallback fixture image.');
        return 0;
    }

    require_once ABSPATH . 'wp-admin/includes/image.php';

    $metadata = wp_generate_attachment_metadata($attachment_id, $upload['file']);
    wp_update_attachment_metadata($attachment_id, $metadata);
    update_post_meta($attachment_id, '_wp_attachment_image_alt', 'Fixture featured media');

    return (int) $attachment_id;
}

function my_website_load_more_fixture_image_ids(): array
{
    $image_ids = my_website_load_more_fixture_existing_image_ids();

    if (! empty($image_ids)) {
        return $image_ids;
    }

    $fallback_image_id = my_website_load_more_fixture_fallback_image_id();

    if ($fallback_image_id) {
        return [$fallback_image_id];
    }

    return [];
}

function my_website_load_more_fixture_paragraph(string $text): string
{
    $text = esc_html($text);

    return <<<HTML
<!-- wp:paragraph -->
<p>{$text}</p>
<!-- /wp:paragraph -->

HTML;
}

function my_website_load_more_fixture_heading(string $text, int $level = 2): string
{
    $text = esc_html($text);
    $level = max(2, min(6, $level));

    return <<<HTML
<!-- wp:heading {"level":{$level}} -->
<h{$level} class="wp-block-heading">{$text}</h{$level}>
<!-- /wp:heading -->

HTML;
}

function my_website_load_more_fixture_quote(string $text, string $citation): string
{
    $text = esc_html($text);
    $citation = esc_html($citation);

    return <<<HTML
<!-- wp:quote -->
<blockquote class="wp-block-quote"><p>{$text}</p><cite>{$citation}</cite></blockquote>
<!-- /wp:quote -->

HTML;
}

function my_website_load_more_fixture_pullquote(string $text, string $citation): string
{
    $text = esc_html($text);
    $citation = esc_html($citation);

    return <<<HTML
<!-- wp:pullquote -->
<figure class="wp-block-pullquote"><blockquote><p>{$text}</p><cite>{$citation}</cite></blockquote></figure>
<!-- /wp:pullquote -->

HTML;
}

function my_website_load_more_fixture_list(array $items): string
{
    $list_items = '';

    foreach ($items as $item) {
        $list_items .= '<li>' . esc_html($item) . '</li>';
    }

    return <<<HTML
<!-- wp:list -->
<ul>{$list_items}</ul>
<!-- /wp:list -->

HTML;
}

function my_website_load_more_fixture_details(string $summary, string $body): string
{
    $summary = esc_html($summary);
    $body = esc_html($body);

    return <<<HTML
<!-- wp:details -->
<details class="wp-block-details"><summary>{$summary}</summary><p>{$body}</p></details>
<!-- /wp:details -->

HTML;
}

function my_website_load_more_fixture_image_block(int $image_id, string $caption): string
{
    if (! $image_id) {
        return my_website_load_more_fixture_paragraph(
            'Fixture image block skipped because no media attachment was available.'
        );
    }

    $url = wp_get_attachment_image_url($image_id, 'large');
    $alt = get_post_meta($image_id, '_wp_attachment_image_alt', true);
    $caption = esc_html($caption);
    $url = esc_url($url);
    $alt = esc_attr($alt);

    return <<<HTML
<!-- wp:image {"id":{$image_id},"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="{$url}" alt="{$alt}" class="wp-image-{$image_id}"/><figcaption>{$caption}</figcaption></figure>
<!-- /wp:image -->

HTML;
}

function my_website_load_more_fixture_content(int $index, string $title, int $image_id): string
{
    $topic = [
        'editorial rhythm',
        'interface pacing',
        'prototype notes',
        'content modeling',
        'front-end craft',
        'CMS maintenance',
        'visual QA',
        'routing behavior',
    ][($index - 1) % 8];

    $caption = sprintf('Archive fixture image %02d for %s.', $index, strtolower($title));

    return implode('', [
        my_website_load_more_fixture_paragraph(
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. This fixture post is intentionally long enough to make the archive feel like a lived-in writing section while still staying easy to scan during local testing."
        ),
        my_website_load_more_fixture_paragraph(
            "The piece uses realistic WordPress blocks, a featured image, an excerpt, and enough body copy to exercise SSR rendering, card transitions, and the load-more boundary without depending on hand-authored production content."
        ),
        my_website_load_more_fixture_heading('Working note on ' . $topic, 2),
        my_website_load_more_fixture_paragraph(
            "Praesent commodo cursus magna, vel scelerisque nisl consectetur et. The point here is not literary polish; it is making sure the archive behaves when the database contains more posts than the first page can reasonably display."
        ),
        my_website_load_more_fixture_image_block($image_id, $caption),
        my_website_load_more_fixture_paragraph(
            "Donec ullamcorper nulla non metus auctor fringilla. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. The media above gives each post real card geometry and keeps the detail page transition path honest."
        ),
        my_website_load_more_fixture_list([
            'A short observation that reads like a normal article bullet.',
            'A second note with enough words to wrap on narrow screens.',
            'A final item that checks list rhythm inside generated content.',
        ]),
        my_website_load_more_fixture_quote(
            'A fixture should be obvious enough to delete, but realistic enough to reveal layout trouble.',
            'Load-more QA'
        ),
        my_website_load_more_fixture_paragraph(
            "Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Curabitur blandit tempus porttitor. Sed posuere consectetur est at lobortis, and this final sentence pads the post toward a more realistic reading length."
        ),
        my_website_load_more_fixture_pullquote(
            'Archive loading should feel quiet, quick, and boring.',
            'Fixture note'
        ),
        my_website_load_more_fixture_details(
            'Fixture implementation detail',
            'This generated post is safe to rerun because the seeder updates a stable slug instead of creating duplicate posts.'
        ),
        my_website_load_more_fixture_paragraph(
            "Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus mollis interdum. This closing paragraph exists so the detail page has enough block content to feel like a small article rather than a stub."
        ),
    ]);
}

$titles = [
    'Useful Friction in Small Interfaces',
    'A Field Note on Slower Screens',
    'Prototype Debris and Better Defaults',
    'The Shape of a Content System',
    'Notes From a Late Design Pass',
    'What the Editor Teaches the Frontend',
    'Tiny Decisions in Durable UI',
    'A Practical Case for Calm Routing',
    'Testing the Archive Under Weight',
    'Making Placeholder Content Behave',
    'The Quiet Work of Visual QA',
    'Where Block Content Gets Weird',
    'A Small Essay About Click Paths',
    'Keeping the CMS Useful',
    'Card Grids and Reading Rhythm',
    'When Navigation Can Disappear',
    'Notes on the Next Useful Slice',
    'A Short Dispatch From the Backend',
    'What Breaks When Lists Get Real',
    'The Archive as a Design Surface',
    'Content Seeds for Honest Testing',
    'A Layout Pass Before Styling',
    'Remembering the Happy Path',
    'Stress Testing With Ordinary Posts',
    'A Note on Frontend Patience',
    'The Difference Between Fast and Rushed',
    'Maintaining a Local Fixture Garden',
    'A Few Blocks in Search of a Page',
    'How Much Content Is Enough',
    'Load More Without Drama',
];

$image_ids = my_website_load_more_fixture_image_ids();
$created = 0;
$updated = 0;

if (empty($image_ids)) {
    my_website_load_more_fixture_warning('No image attachments were available, so fixture posts will not receive featured media.');
}

foreach ($titles as $offset => $title) {
    $index = $offset + 1;
    $slug = sprintf('load-more-writing-test-%02d', $index);
    $existing = get_page_by_path($slug, OBJECT, 'post');
    $image_id = ! empty($image_ids) ? (int) $image_ids[$offset % count($image_ids)] : 0;
    $post_time = strtotime('-' . (90 + $index) . ' days 10:00:00');
    $excerpt = sprintf(
        'Fixture writing post %02d with featured media, realistic blocks, and enough body copy to test the writing archive load-more behavior.',
        $index
    );
    $post_data = [
        'post_title' => $title,
        'post_name' => $slug,
        'post_excerpt' => $excerpt,
        'post_content' => my_website_load_more_fixture_content($index, $title, $image_id),
        'post_status' => 'publish',
        'post_type' => 'post',
        'post_date' => wp_date('Y-m-d H:i:s', $post_time),
        'post_date_gmt' => gmdate('Y-m-d H:i:s', $post_time),
    ];

    if ($existing) {
        $post_data['ID'] = $existing->ID;
        $post_id = wp_update_post(wp_slash($post_data), true);
        $updated++;
    } else {
        $post_id = wp_insert_post(wp_slash($post_data), true);
        $created++;
    }

    if (is_wp_error($post_id)) {
        my_website_load_more_fixture_warning(sprintf(
            'Could not seed %s: %s',
            $slug,
            $post_id->get_error_message()
        ));
        continue;
    }

    if ($image_id) {
        set_post_thumbnail((int) $post_id, $image_id);
    }
}

my_website_load_more_fixture_log(sprintf(
    'Load-more fixture posts created: %d; updated: %d.',
    $created,
    $updated
));
my_website_load_more_fixture_success('Seeded 30 writing posts for archive load-more QA.');
