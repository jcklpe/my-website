<?php
/**
 * Seed a comprehensive footnote QA post that exercises every layout combination
 * relevant to the Tufte sidenote implementation.
 *
 * Run from the repo root:
 * docker compose -f docker/compose.yaml -f docker/compose.dev.yaml exec -T cms \
 *   wp eval-file wp-content/plugins/project-bootstrap/dev-tools/seed-footnote-test-content.php --allow-root
 *
 * Covers:
 *   - Plain-text footnote
 *   - Footnote with hyperlink
 *   - Footnote with image (lightbox test)
 *   - Multiple footnotes in one paragraph
 *   - Consecutive paragraphs each with a footnote
 *   - Footnote after wide-aligned image block
 *   - Footnote after full-width image block
 *   - Paragraph with footnote while a left-float image is active
 *   - Paragraph with footnote while a right-float image is active
 *   - Footnote inside a media+text block text column
 *   - Footnote inside a columns block
 *   - Footnote inside a table cell
 *   - Footnote inside a blockquote
 *   - Footnote inside a pullquote
 *   - Footnote at the very start of a paragraph
 *   - Long footnote (multi-sentence)
 *   - Short footnote (single word)
 *   - Footnote in a wide image caption
 *   - Footnote in a full-width image caption
 *   - Footnote inside a wide-aligned table
 *   - Overflow stacking: 8 consecutive footnotes that push the last several
 *     sidenotes far below their markers, triggering the is-overflow fallback
 */

if (! defined('ABSPATH')) {
    exit;
}

// ---------------------------------------------------------------------------
// UUID helpers
// ---------------------------------------------------------------------------

function fn_uuid(): string
{
    return wp_generate_uuid4();
}

// ---------------------------------------------------------------------------
// Footnote marker (inline HTML placed inside a paragraph)
// ---------------------------------------------------------------------------

function fn_marker(string $uuid, int $n): string
{
    return '<sup data-fn="' . esc_attr($uuid) . '" class="fn">'
        . '<a href="#' . esc_attr($uuid) . '" id="' . esc_attr($uuid) . '-link">' . $n . '</a>'
        . '</sup>';
}

// ---------------------------------------------------------------------------
// Image helper
// ---------------------------------------------------------------------------

function fn_first_image_id(): int
{
    $ids = get_posts([
        'post_type'      => 'attachment',
        'post_mime_type' => 'image',
        'post_status'    => 'inherit',
        'posts_per_page' => 1,
        'orderby'        => 'date',
        'order'          => 'DESC',
        'fields'         => 'ids',
    ]);
    return (int) ($ids[0] ?? 0);
}

function fn_image_block(int $image_id, string $align = '', string $caption = ''): string
{
    if (! $image_id) {
        return '<!-- wp:paragraph --><p><em>[Image block skipped — no media uploaded yet]</em></p><!-- /wp:paragraph -->';
    }
    $url        = wp_get_attachment_image_url($image_id, 'large');
    $alt        = get_post_meta($image_id, '_wp_attachment_image_alt', true) ?: '';
    $align_attr = $align ? "\"align\":\"{$align}\"," : '';
    $align_cls  = $align ? " align{$align}" : '';
    $cap_html   = $caption
        ? "<figcaption class=\"wp-element-caption\">{$caption}</figcaption>"
        : '';
    return <<<HTML
<!-- wp:image {{$align_attr}"id":{$image_id},"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large{$align_cls}"><img src="{$url}" alt="{$alt}" class="wp-image-{$image_id}"/>{$cap_html}</figure>
<!-- /wp:image -->
HTML;
}

// ---------------------------------------------------------------------------
// Generate the post content and footnotes meta simultaneously.
// We collect all footnote definitions in $fns = [[id, content], ...] in the
// order they first appear in the markup, then write them as the footnotes meta.
// ---------------------------------------------------------------------------

$image_id = fn_first_image_id();

// Pre-allocate UUIDs for every footnote used below.
$ids = [
    'plain'          => fn_uuid(),
    'link'           => fn_uuid(),
    'image'          => fn_uuid(),
    'multi_a'        => fn_uuid(),
    'multi_b'        => fn_uuid(),
    'consec_a'       => fn_uuid(),
    'consec_b'       => fn_uuid(),
    'after_wide'     => fn_uuid(),
    'after_full'     => fn_uuid(),
    'float_left'     => fn_uuid(),
    'float_right'    => fn_uuid(),
    'media_text'     => fn_uuid(),
    'columns'        => fn_uuid(),
    'table'          => fn_uuid(),
    'blockquote'     => fn_uuid(),
    'pullquote'      => fn_uuid(),
    'start'          => fn_uuid(),
    'long'           => fn_uuid(),
    'short'          => fn_uuid(),
    // Section 8 — figure captions
    'cap_wide'       => fn_uuid(),
    'cap_full'       => fn_uuid(),
    // Section 9 — wide table
    'wide_table'     => fn_uuid(),
    // Section 10 — overflow stacking (8 notes clustered at the top of the section)
    'ovf_1'          => fn_uuid(),
    'ovf_2'          => fn_uuid(),
    'ovf_3'          => fn_uuid(),
    'ovf_4'          => fn_uuid(),
    'ovf_5'          => fn_uuid(),
    'ovf_6'          => fn_uuid(),
    'ovf_7'          => fn_uuid(),
    'ovf_8'          => fn_uuid(),
];

// Number assignment — order they appear in the post.
$n = 1;

$img_src = $image_id ? wp_get_attachment_image_url($image_id, 'large') : '';
$img_alt = $image_id ? (get_post_meta($image_id, '_wp_attachment_image_alt', true) ?: '') : '';

// Footnote content map (keyed by the ids key, values are HTML strings).
// These become the `footnotes` post-meta value.
$fn_content = [
    'plain'       => 'A plain-text sidenote — the simplest possible case.',
    'link'        => 'A footnote with a <a href="https://example.com">hyperlink inside it</a> to verify link styling and click handling in the margin.',
    'image'       => $image_id
        ? "A footnote containing an image. Click the image to open the lightbox.<br><img src=\"{$img_src}\" alt=\"{$img_alt}\"><em>Caption: this image should open in the PhotoSwipe lightbox on click.</em>"
        : 'A footnote that would contain an image but no media has been uploaded yet.',
    'multi_a'     => 'First of two footnotes in the same paragraph.',
    'multi_b'     => 'Second of two footnotes in the same paragraph. The two sidenotes should stack vertically without overlapping.',
    'consec_a'    => 'Footnote from the first of two consecutive paragraphs.',
    'consec_b'    => 'Footnote from the second consecutive paragraph — tests vertical stacking.',
    'after_wide'  => 'Paragraph with a footnote immediately following a wide-aligned image block.',
    'after_full'  => 'Paragraph with a footnote immediately following a full-width image block.',
    'float_left'  => 'Footnote while a left-floated image is still in flow. The sidenote should appear in the right margin regardless.',
    'float_right' => 'Footnote while a right-floated image occupies the right margin. The sidenote lands in the same visual column as the float — potential overlap to QA.',
    'media_text'  => 'Footnote inside the text column of a media+text (50/50) block. BlockRenderer is nested here, so the footnote-map injection guard matters.',
    'columns'     => 'Footnote inside a 2-column layout block.',
    'table'       => 'Footnote in a table cell.',
    'blockquote'  => 'Footnote inside a blockquote.',
    'pullquote'   => 'Footnote inside a pullquote block.',
    'start'       => 'This footnote marker appears at the very beginning of its paragraph.',
    'long'        => '<p>This is a deliberately long, multi-paragraph sidenote to stress-test the note layout. The first paragraph establishes context. Tufte-style margin notes traditionally stay short, but real writing sometimes demands more.</p><p>This second paragraph pushes the note further. It contains enough text to force the sidenote to wrap across several lines in the margin column, testing line-height, spacing, and whether the note clips or overflows its container on both desktop (right margin) and mobile (in-note).</p><p>A third paragraph drives the point home. At this length the note is clearly too long for a comfortable sidenote and a "see more" truncation pattern would be worth considering. For now we just verify it remains readable, fully visible, and doesn\'t break the layout of surrounding notes.</p>',
    'short'       => 'Brief.',
    // Section 8 — figure captions
    'cap_wide'    => 'Footnote from the caption of a wide-aligned image. The sidenote should align to the caption text row, not the top of the image.',
    'cap_full'    => 'Footnote from the caption of a full-width image. Caption is narrow (content column) but the image bleeds edge-to-edge.',
    // Section 9 — wide table
    'wide_table'  => 'Footnote inside a wide-aligned table cell — the table extends into the breakout columns on both sides.',
    // Section 10 — overflow stacking
    'ovf_1'       => 'Overflow stacking note 1.',
    'ovf_2'       => 'Overflow stacking note 2.',
    'ovf_3'       => 'Overflow stacking note 3.',
    'ovf_4'       => 'Overflow stacking note 4.',
    'ovf_5'       => 'Overflow stacking note 5.',
    'ovf_6'       => 'Overflow stacking note 6.',
    'ovf_7'       => 'Overflow stacking note 7.',
    'ovf_8'       => 'Overflow stacking note 8. This one and the note above it should be displaced far enough below their markers that the layout pass marks them as is-overflow — the sidenotes are hidden and clicking the marker on desktop should fall back to the in-note.',
];

// Build the ordered footnotes array (order = appearance order in markup).
$fn_order = [
    'plain', 'link', 'image',
    'multi_a', 'multi_b',
    'consec_a', 'consec_b',
    'after_wide', 'after_full',
    'float_left', 'float_right',
    'media_text', 'columns',
    'table', 'blockquote', 'pullquote',
    'start', 'long', 'short',
    'cap_wide', 'cap_full',
    'wide_table',
    'ovf_1', 'ovf_2', 'ovf_3', 'ovf_4', 'ovf_5', 'ovf_6', 'ovf_7', 'ovf_8',
];

$footnotes_meta = array_map(function (string $key) use ($ids, $fn_content): array {
    return ['id' => $ids[$key], 'content' => $fn_content[$key]];
}, $fn_order);

// Assign sequential footnote numbers in appearance order.
$num = [];
foreach ($fn_order as $i => $key) {
    $num[$key] = $i + 1;
}

// Shorthand marker builder.
$m = function (string $key) use ($ids, $num): string {
    return fn_marker($ids[$key], $num[$key]);
};

// Image block helpers.
$wide_img   = fn_image_block($image_id, 'wide',      'A wide-aligned image above the next paragraph.');
$full_img   = fn_image_block($image_id, 'full',      'A full-width image above the next paragraph.');
$left_img   = fn_image_block($image_id, 'left',      'Left-floated image.');
$right_img  = fn_image_block($image_id, 'right',     'Right-floated image — occupies the right margin.');
$normal_img = fn_image_block($image_id, '',          '');

// Wide/full images whose captions include a footnote marker.
$wide_img_cap = fn_image_block($image_id, 'wide', 'Caption for the wide image' . $m('cap_wide') . '. The sidenote should align to this caption row.');
$full_img_cap = fn_image_block($image_id, 'full', 'Caption for the full-width image' . $m('cap_full') . '. Full-width captions sit in the content column.');

// ---------------------------------------------------------------------------
// Wide-aligned table with a footnoted cell.
// ---------------------------------------------------------------------------
$wide_table_content = <<<HTML
<!-- wp:table {"align":"wide"} -->
<figure class="wp-block-table alignwide"><table><thead><tr><th>Metric</th><th>Q1</th><th>Q2</th><th>Notes</th></tr></thead><tbody><tr><td>Impressions</td><td>14,200</td><td>19,800</td><td>Up 39%{$m('wide_table')}</td></tr><tr><td>Clicks</td><td>320</td><td>510</td><td>Up 59%</td></tr><tr><td>Conversions</td><td>48</td><td>71</td><td>Up 48%</td></tr></tbody></table></figure>
<!-- /wp:table -->
HTML;

// ---------------------------------------------------------------------------
// Media+text block with a footnoted paragraph inside the text column.
// ---------------------------------------------------------------------------
$media_text_content = $image_id ? <<<HTML
<!-- wp:media-text {"mediaId":{$image_id},"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="{$img_src}" alt="{$img_alt}" class="wp-image-{$image_id} size-full"/></figure><div class="wp-block-media-text__content"><!-- wp:paragraph -->
<p>This paragraph is inside the text column of a media+text block{$m('media_text')}. Sidenotes are triggered by BlockRenderer, which is nested inside compositional blocks.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->
HTML : '<!-- wp:paragraph --><p><em>[Media+text test skipped — no media]</em></p><!-- /wp:paragraph -->';

// ---------------------------------------------------------------------------
// Columns block with a footnoted paragraph in one column.
// ---------------------------------------------------------------------------
$columns_content = <<<HTML
<!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:paragraph -->
<p>Left column text with a footnote{$m('columns')}. Because this paragraph is inside a narrow column, the sidenote lands in the far-right margin — test for legibility at reduced width.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:paragraph -->
<p>Right column — no footnote, used as layout reference. Check that the left column's sidenote doesn't overlap this column's text.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->
HTML;

// ---------------------------------------------------------------------------
// Table block with a footnoted cell.
// ---------------------------------------------------------------------------
$table_content = <<<HTML
<!-- wp:table -->
<figure class="wp-block-table"><table><thead><tr><th>Concept</th><th>Notes</th></tr></thead><tbody><tr><td>Row one{$m('table')}</td><td>Supporting detail in the right cell.</td></tr><tr><td>Row two</td><td>No footnote in this row.</td></tr></tbody></table></figure>
<!-- /wp:table -->
HTML;

// ---------------------------------------------------------------------------
// Blockquote with a footnote.
// ---------------------------------------------------------------------------
$blockquote_content = <<<HTML
<!-- wp:quote -->
<blockquote class="wp-block-quote"><!-- wp:paragraph -->
<p>A quotation can itself contain a reference to a source{$m('blockquote')}. The sidenote should appear in the margin aligned to this quote's line.</p>
<!-- /wp:paragraph --><cite>— Hypothetical Author</cite></blockquote>
<!-- /wp:quote -->
HTML;

// ---------------------------------------------------------------------------
// Pullquote with a footnote.
// ---------------------------------------------------------------------------
$pullquote_content = <<<HTML
<!-- wp:pullquote -->
<figure class="wp-block-pullquote"><blockquote><p>Pull-quoted text may also reference a source{$m('pullquote')}.</p><cite>— Another Author</cite></blockquote></figure>
<!-- /wp:pullquote -->
HTML;

// ---------------------------------------------------------------------------
// Full post content
// ---------------------------------------------------------------------------
$content = <<<HTML
<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">1 — Basic Text Footnotes</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This is a paragraph with a plain-text footnote at the end{$m('plain')}. The sidenote should appear in the right margin on wide viewports, aligned to this line of text. On mobile it appears as a click-to-reveal inline note.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>This paragraph contains a footnote whose content includes a hyperlink{$m('link')}. Verify that the link is clickable in the margin, uses the correct link styling, and that the rich-link hover state works.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>This paragraph's footnote contains an image{$m('image')}. Clicking the image should open the PhotoSwipe lightbox (same library as the mega-gallery block). The image in the sidenote should render at full sidenote-column width with natural aspect ratio.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">2 — Multiple &amp; Consecutive Footnotes</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This paragraph contains two footnotes{$m('multi_a')} in the same sentence so they appear close together{$m('multi_b')}. The two sidenotes should stack vertically without overlapping — collision detection QA.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>First of two consecutive footnoted paragraphs{$m('consec_a')}. The sidenotes for this and the next paragraph will be close together vertically.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Second of two consecutive footnoted paragraphs{$m('consec_b')}. If the two sidenotes overlap, collision detection (Phase 3) is needed.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">3 — Wide &amp; Full-Width Image Interactions</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The following wide image is followed immediately by a paragraph with a footnote. The sidenote should align to the paragraph, not the image.</p>
<!-- /wp:paragraph -->

{$wide_img}

<!-- wp:paragraph -->
<p>This paragraph comes directly after the wide image above{$m('after_wide')}. The sidenote should sit in the right margin column, unaffected by the wide block.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The following full-width image is similarly followed by a footnoted paragraph.</p>
<!-- /wp:paragraph -->

{$full_img}

<!-- wp:paragraph -->
<p>This paragraph comes directly after the full-width image above{$m('after_full')}. The sidenote should sit cleanly in the right margin despite the full-width predecessor.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">4 — Floated Image Interactions</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>A left-floated image follows. Paragraphs wrapping around it may have footnotes whose sidenotes should still appear in the right margin unobstructed.</p>
<!-- /wp:paragraph -->

{$left_img}

<!-- wp:paragraph -->
<p>This paragraph wraps next to the left-floated image above{$m('float_left')}. The sidenote should appear in the right margin — the float is on the opposite side so there is no conflict.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Now a right-floated image follows. This is the interesting collision case: both the right-float and the sidenote want the right margin.</p>
<!-- /wp:paragraph -->

{$right_img}

<!-- wp:paragraph -->
<p>This paragraph wraps next to the right-floated image{$m('float_right')}. The sidenote and the float image both target the right margin — verify whether they overlap, and note whether a clearance fix is needed.</p>
<!-- /wp:paragraph -->

<!-- wp:separator -->
<hr class="wp-block-separator has-alpha-channel-opacity"/>
<!-- /wp:separator -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">5 — Compositional Blocks</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">5a — Media + Text Block</h3>
<!-- /wp:heading -->

{$media_text_content}

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">5b — Columns Block</h3>
<!-- /wp:heading -->

{$columns_content}

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">5c — Table</h3>
<!-- /wp:heading -->

{$table_content}

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">6 — Quote Blocks</h2>
<!-- /wp:heading -->

{$blockquote_content}

{$pullquote_content}

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">7 — Edge Cases</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>{$m('start')}This paragraph has its footnote marker at the very beginning. The sidenote should align to the top of the paragraph's first line.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>This paragraph has a deliberately long footnote{$m('long')} to test wrapping and overflow within the margin column. The sidenote should remain fully legible and not clip or overflow its container.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>This paragraph has the shortest possible footnote{$m('short')} — a single word.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">8 — Footnotes in Figure Captions</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>A wide-aligned image with a footnote in its caption follows. The sidenote should align to the caption text line, not the top of the figure.</p>
<!-- /wp:paragraph -->

{$wide_img_cap}

<!-- wp:paragraph -->
<p>A full-width image with a captioned footnote follows. The image bleeds to the viewport edge; the caption sits in the content column. The sidenote should align normally.</p>
<!-- /wp:paragraph -->

{$full_img_cap}

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">9 — Wide Table</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>A wide-aligned table that extends into the breakout columns on both sides. The footnoted cell is in the last column — verify the sidenote appears in the right margin without overlapping the table.</p>
<!-- /wp:paragraph -->

{$wide_table_content}

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">10 — Overflow Stacking</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The eight list items below each carry a footnote. Their markers are clustered within a short vertical span (~160 px), but the stacked sidenotes need ~420 px. The last few notes exceed the displacement threshold and get <code>is-overflow</code>. Clicking those numbered markers on desktop should open the in-note rather than pointing at an invisible sidenote far off-screen.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><li>List item one{$m('ovf_1')}</li><li>List item two{$m('ovf_2')}</li><li>List item three{$m('ovf_3')}</li><li>List item four{$m('ovf_4')}</li><li>List item five{$m('ovf_5')}</li><li>List item six{$m('ovf_6')}</li><li>List item seven{$m('ovf_7')}</li><li>List item eight{$m('ovf_8')}</li></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Paragraph after the overflow list — scroll past it to confirm no lingering visual glitches.</p>
<!-- /wp:paragraph -->

<!-- wp:footnotes /-->
HTML;

// ---------------------------------------------------------------------------
// Upsert the post
// ---------------------------------------------------------------------------

$slug      = 'footnote-qa-all-combinations';
$existing  = get_page_by_path($slug, OBJECT, 'post');
$post_data = [
    'post_type'    => 'post',
    'post_title'   => 'Footnote QA: All Layout Combinations',
    'post_name'    => $slug,
    'post_excerpt' => 'Comprehensive sidenote QA post — exercises every block type and layout combination relevant to the Tufte margin-note implementation.',
    'post_status'  => 'publish',
    'post_content' => $content,
];

if ($existing instanceof WP_Post) {
    $post_data['ID'] = $existing->ID;
    $post_id = wp_update_post(wp_slash($post_data), true);
} else {
    $post_id = wp_insert_post(wp_slash($post_data), true);
}

if (is_wp_error($post_id)) {
    WP_CLI::error($post_id->get_error_message());
}

// Set footnotes meta. update_metadata applies wp_unslash before sanitizing, so we
// must wp_slash the JSON first so the backslash-escaped quotes inside it survive.
update_post_meta((int) $post_id, 'footnotes', wp_slash(wp_json_encode($footnotes_meta)));

// Set a thumbnail if an image exists.
if ($image_id) {
    set_post_thumbnail((int) $post_id, $image_id);
}

WP_CLI::success("Created/updated footnote QA post ID {$post_id}: /writing/{$slug}");
