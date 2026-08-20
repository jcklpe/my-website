<?php
/**
 * Plugin Name: Project Bootstrap
 * Description: Project-level WordPress settings for the headless website.
 * Version: 0.1.0
 */

if (! defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/includes/halftone-media.php';

function my_website_get_current_post_id(): int
{
    $post_id = 0;

    if (isset($_GET['post'])) {
        $post_id = absint(wp_unslash($_GET['post']));
    } elseif (isset($_POST['post_ID'])) {
        $post_id = absint(wp_unslash($_POST['post_ID']));
    }

    return $post_id;
}

add_action('init', function () {
    register_post_type('case_study', [
        'label' => 'Case Studies',
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'caseStudy',
        'graphql_plural_name' => 'caseStudies',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions'],
        'has_archive' => true,
        'rewrite' => ['slug' => 'case-studies'],
    ]);

    // WordPress does not include Sketchfab URL patterns by default. Register
    // provider patterns so the core Embed block accepts and resolves model URLs.
    wp_oembed_add_provider(
        '#https?://(www\.)?sketchfab\.com/3d-models/.+#i',
        'https://sketchfab.com/oembed',
        true
    );
    wp_oembed_add_provider(
        '#https?://(www\.)?sketchfab\.com/models/[a-z0-9]{32}/embed/?$#i',
        'https://sketchfab.com/oembed',
        true
    );

});

add_filter('show_admin_bar', '__return_false');

add_filter('embed_oembed_html', function ($html, $url) {
    if (! is_string($html) || ! is_string($url)) {
        return $html;
    }

    if (! str_contains($url, 'sketchfab.com')) {
        return $html;
    }

    // Sketchfab iframes can show internal scrollbars in some editor contexts.
    // Ask browsers to avoid iframe-level scrollbars where possible.
    if (false === stripos($html, 'scrolling=')) {
        $html = preg_replace('/<iframe\b/i', '<iframe scrolling="no"', $html, 1);
    }

    return $html;
}, 10, 2);

add_action('current_screen', function (WP_Screen $screen) {
    if ('page' !== $screen->post_type) {
        return;
    }

    $front_page_id = (int) get_option('page_on_front');
    $current_post_id = my_website_get_current_post_id();

    if (! $front_page_id || $front_page_id !== $current_post_id) {
        return;
    }

    remove_post_type_support('page', 'editor');
});

add_action('acf/init', function () {
    if (! function_exists('acf_add_local_field_group')) {
        return;
    }

    if (function_exists('acf_add_options_page')) {
        acf_add_options_page([
            'page_title' => 'Site Settings',
            'menu_title' => 'Site Settings',
            'menu_slug' => 'my-website-site-settings',
            'capability' => 'manage_options',
            'redirect' => false,
            'position' => 59,
        ]);
    }

    acf_add_local_field_group([
        'key' => 'group_my_website_homepage_about',
        'title' => 'Homepage Vital Info',
        'fields' => [
            [
                'key' => 'field_my_website_about_tagline',
                'label' => 'Tagline',
                'name' => 'about_tagline',
                'type' => 'textarea',
                'default_value' => 'This is the website of Aslan French, design technologist and researcher.',
                'rows' => 2,
                'new_lines' => 'br',
            ],
            [
                'key' => 'field_my_website_quick_links',
                'label' => 'Quick Links',
                'name' => 'quick_links',
                'type' => 'repeater',
                'layout' => 'table',
                'button_label' => 'Add link',
                'sub_fields' => [
                    [
                        'key' => 'field_my_website_quick_link_label',
                        'label' => 'Label',
                        'name' => 'label',
                        'type' => 'text',
                        'required' => 1,
                    ],
                    [
                        'key' => 'field_my_website_quick_link_url',
                        'label' => 'URL',
                        'name' => 'url',
                        'type' => 'url',
                        'required' => 1,
                    ],
                ],
            ],
        ],
        'location' => [
            [
                [
                    'param' => 'page_type',
                    'operator' => '==',
                    'value' => 'front_page',
                ],
            ],
        ],
        'position' => 'normal',
        'style' => 'seamless',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
        'active' => true,
    ]);

    acf_add_local_field_group([
        'key' => 'group_my_website_homepage_hero',
        'title' => 'Homepage Hero',
        'fields' => [
            [
                'key' => 'field_my_website_hero_portrait',
                'label' => 'Hero Portrait',
                'name' => 'hero_portrait',
                'type' => 'image',
                'instructions' => 'Portrait image shown in the homepage BLUF hero. Leave empty to use the built-in mock. A roughly 4:5 portrait crop matches the tuned composition best.',
                'return_format' => 'array',
                'preview_size' => 'medium',
                'library' => 'all',
                'mime_types' => 'jpg,jpeg,png,webp',
            ],
        ],
        'location' => [
            [
                [
                    'param' => 'page_type',
                    'operator' => '==',
                    'value' => 'front_page',
                ],
            ],
        ],
        'position' => 'normal',
        'style' => 'seamless',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
        'active' => true,
    ]);

    acf_add_local_field_group([
        'key' => 'group_my_website_homepage_testimonials',
        'title' => 'Homepage Employer Testimonials',
        'fields' => [
            [
                'key' => 'field_my_website_testimonials_texture',
                'label' => 'Background Texture',
                'name' => 'testimonials_background_texture',
                'type' => 'radio',
                'instructions' => 'Background texture pattern for the testimonials section.',
                'default_value' => 'dots',
                'choices' => [
                    'none'                    => 'None (plain)',
                    'dots'                    => 'Signal dots (default)',
                    'paper_grid'              => 'Paper grid',
                    'paper_grid_ink'          => 'Ink graph paper',
                    'paper_grid_signal_dots'  => 'Signal dots on grid',
                    'blueprint'               => 'Blueprint field',
                    'scanline'                => 'Terminal scanline',
                ],
                'layout' => 'vertical',
                'return_format' => 'value',
            ],
            [
                'key' => 'field_my_website_employer_testimonials',
                'label' => 'Employer Testimonials',
                'name' => 'employer_testimonials',
                'type' => 'repeater',
                'layout' => 'block',
                'button_label' => 'Add testimonial',
                'sub_fields' => [
                    [
                        'key' => 'field_my_website_employer_testimonial_quote',
                        'label' => 'Quote',
                        'name' => 'quote',
                        'type' => 'textarea',
                        'rows' => 4,
                        'new_lines' => '',
                    ],
                    [
                        'key' => 'field_my_website_employer_testimonial_name',
                        'label' => 'Name',
                        'name' => 'name',
                        'type' => 'text',
                    ],
                    [
                        'key' => 'field_my_website_employer_testimonial_role',
                        'label' => 'Role',
                        'name' => 'role',
                        'type' => 'text',
                    ],
                    [
                        'key' => 'field_my_website_employer_testimonial_organization',
                        'label' => 'Organization',
                        'name' => 'organization',
                        'type' => 'text',
                    ],
                ],
            ],
        ],
        'location' => [
            [
                [
                    'param' => 'page_type',
                    'operator' => '==',
                    'value' => 'front_page',
                ],
            ],
        ],
        'position' => 'normal',
        'style' => 'seamless',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
        'active' => true,
    ]);

    acf_add_local_field_group([
        'key' => 'group_my_website_post_meta',
        'title' => 'Post Meta',
        'fields' => [
            [
                'key' => 'field_my_website_post_canonical_url',
                'label' => 'Canonical URL',
                'name' => 'canonical_url',
                'type' => 'text',
                'instructions' => 'Leave blank unless this post is cross-posted. Enter the original URL to mark it as canonical (e.g. the Medium URL for posts that originated on Medium).',
            ],
        ],
        'location' => [
            [
                [
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'post',
                ],
            ],
        ],
        'position' => 'side',
        'style' => 'default',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
        'active' => true,
    ]);

    acf_add_local_field_group([
        'key' => 'group_my_website_case_study_display',
        'title' => 'Selected Work Display',
        'fields' => [
            [
                'key' => 'field_my_website_case_study_selected_work_layout',
                'label' => 'Row Layout',
                'name' => 'selected_work_layout',
                'type' => 'radio',
                'instructions' => 'How this case study sits in the homepage Selected Work list. Auto follows the page rhythm. Narrow rows keep the photo small beside the text; wide rows are taller with the photo at 60% of the row.',
                'choices' => [
                    'auto' => 'Auto',
                    'banner' => 'Banner',
                    'narrow_photo_left' => 'Narrow photo left',
                    'narrow_photo_right' => 'Narrow photo right',
                    'wide_photo_left' => 'Wide photo left',
                    'wide_photo_right' => 'Wide photo right',
                ],
                'default_value' => 'auto',
                'layout' => 'vertical',
                'return_format' => 'value',
            ],
            [
                'key' => 'field_my_website_case_study_selected_work_text_align',
                'label' => 'Text Plate Alignment',
                'name' => 'selected_work_text_align',
                'type' => 'radio',
                'instructions' => 'Where the title and excerpt dock within the text plate. Auto follows the page rhythm.',
                'choices' => [
                    'auto' => 'Auto',
                    'left' => 'Left',
                    'right' => 'Right',
                ],
                'default_value' => 'auto',
                'layout' => 'horizontal',
                'return_format' => 'value',
            ],
            [
                'key' => 'field_my_website_case_study_selected_work_practice',
                'label' => 'Practice / Discipline',
                'name' => 'selected_work_practice',
                'type' => 'text',
                'instructions' => 'Short catalog line describing the work performed, for example “Design systems · Operations”.',
                'maxlength' => 80,
            ],
            [
                'key' => 'field_my_website_case_study_selected_work_engagement_context',
                'label' => 'Engagement Context',
                'name' => 'selected_work_engagement_context',
                'type' => 'text',
                'instructions' => 'Short catalog line describing the situation or intervention, for example “Cross-department product delivery”.',
                'maxlength' => 100,
            ],
            [
                'key' => 'field_my_website_case_study_selected_work_photo_treatment',
                'label' => 'Photo Treatment',
                'name' => 'selected_work_photo_treatment',
                'type' => 'radio',
                'instructions' => 'Halftone color treatment for this case study\'s photo on the homepage. Auto cycles through the full set.',
                'choices' => [
                    'auto' => 'Auto',
                    'bleed_blue_cream' => 'Blue + cream bleed',
                    'direct_ink_blue' => 'Ink + blue duotone',
                    'direct_tritone' => 'Tritone (ink / blue / cream)',
                    'direct_blue_cream' => 'Blue + cream duotone',
                    'crisp_ink_blue' => 'Ink + blue crisp',
                    'bleed_tritone' => 'Tritone bleed',
                ],
                'default_value' => 'auto',
                'layout' => 'vertical',
                'return_format' => 'value',
            ],
        ],
        'location' => [
            [
                [
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'case_study',
                ],
            ],
        ],
        'position' => 'side',
        'style' => 'default',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
        'active' => true,
    ]);

    acf_add_local_field_group([
        'key' => 'group_my_website_page_display',
        'title' => 'Page Display',
        'fields' => [
            [
                'key' => 'field_my_website_display_heading',
                'label' => 'Display Heading',
                'name' => 'display_heading',
                'type' => 'textarea',
                'instructions' => 'Public-facing page heading. Use this when the frontend H1 should be more expressive than the WordPress admin title.',
                'rows' => 2,
                'new_lines' => '',
            ],
            [
                'key' => 'field_my_website_display_description',
                'label' => 'Display Description',
                'name' => 'display_description',
                'type' => 'textarea',
                'instructions' => 'Short description shown on the page itself, below the heading. Separate from the SEO description.',
                'rows' => 2,
                'new_lines' => '',
            ],
        ],
        'location' => [
            [
                [
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'page',
                ],
                [
                    'param' => 'page_type',
                    'operator' => '!=',
                    'value' => 'front_page',
                ],
            ],
        ],
        'position' => 'acf_after_title',
        'style' => 'seamless',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
        'active' => true,
    ]);

    acf_add_local_field_group([
        'key' => 'group_my_website_now',
        'title' => 'Now',
        'fields' => [
            [
                'key' => 'field_my_website_now_content',
                'label' => 'Now Content',
                'name' => 'now_content',
                'type' => 'wysiwyg',
                'instructions' => 'Public "now" statement. Rendered inline on the About page and on the standalone /now route. Primarily used on the About page.',
                'tabs' => 'all',
                'toolbar' => 'basic',
                'media_upload' => 0,
            ],
        ],
        'location' => [
            [
                [
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'page',
                ],
                [
                    'param' => 'page_type',
                    'operator' => '!=',
                    'value' => 'front_page',
                ],
            ],
        ],
        'position' => 'normal',
        'style' => 'default',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
        'active' => true,
    ]);

    acf_add_local_field_group([
        'key' => 'group_my_website_page_seo',
        'title' => 'Page SEO',
        'fields' => [
            [
                'key' => 'field_my_website_seo_description',
                'label' => 'SEO Description',
                'name' => 'seo_description',
                'type' => 'textarea',
                'instructions' => 'Used as the meta description for this page in search results and link previews. One or two sentences.',
                'rows' => 3,
                'new_lines' => '',
            ],
        ],
        'location' => [
            [
                [
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'page',
                ],
            ],
        ],
        'position' => 'side',
        'style' => 'default',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
        'active' => true,
    ]);

    acf_add_local_field_group([
        'key' => 'group_my_website_footer',
        'title' => 'Footer',
        'fields' => [
            [
                'key' => 'field_my_website_footer_heading',
                'label' => 'Heading',
                'name' => 'footer_heading',
                'type' => 'text',
                'default_value' => 'Bottom line, still up front.',
            ],
            [
                'key' => 'field_my_website_footer_body',
                'label' => 'Body',
                'name' => 'footer_body',
                'type' => 'textarea',
                'default_value' => 'A small footer for global links, contact paths, and project context.',
                'rows' => 3,
                'new_lines' => 'br',
            ],
            [
                'key' => 'field_my_website_footer_links',
                'label' => 'Links',
                'name' => 'footer_links',
                'type' => 'repeater',
                'layout' => 'table',
                'button_label' => 'Add link',
                'sub_fields' => [
                    [
                        'key' => 'field_my_website_footer_link_label',
                        'label' => 'Label',
                        'name' => 'label',
                        'type' => 'text',
                        'required' => 1,
                    ],
                    [
                        'key' => 'field_my_website_footer_link_url',
                        'label' => 'URL',
                        'name' => 'url',
                        'type' => 'url',
                        'required' => 1,
                    ],
                ],
            ],
            [
                'key' => 'field_my_website_footer_note',
                'label' => 'Small Note',
                'name' => 'footer_note',
                'type' => 'text',
                'default_value' => 'Built with Nuxt and headless WordPress.',
            ],
        ],
        'location' => [
            [
                [
                    'param' => 'options_page',
                    'operator' => '==',
                    'value' => 'my-website-site-settings',
                ],
            ],
        ],
        'position' => 'normal',
        'style' => 'seamless',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
        'active' => true,
    ]);
});

add_action('admin_notices', function () {
    if (! current_user_can('manage_options')) {
        return;
    }

    if (function_exists('acf_add_local_field_group')) {
        return;
    }

    $screen = function_exists('get_current_screen') ? get_current_screen() : null;

    if (! $screen || 'page' !== $screen->post_type) {
        return;
    }

    echo '<div class="notice notice-warning"><p>ACF Pro is not active. Homepage structured fields are unavailable until the plugin is installed and activated.</p></div>';
});

function my_website_graphql_response_cache_ttl(): int
{
    /**
     * Keep this short so local content editing remains forgiving while still
     * smoothing repeated cold WPGraphQL detail requests.
     */
    return (int) apply_filters('my_website_graphql_response_cache_ttl', 5 * MINUTE_IN_SECONDS);
}

function my_website_graphql_response_cache_limit(): int
{
    return max(1, (int) apply_filters('my_website_graphql_response_cache_limit', 50));
}

function my_website_graphql_response_cache_index_option(): string
{
    return 'my_website_graphql_response_cache_keys';
}

function my_website_graphql_response_cache_is_enabled(): bool
{
    if (defined('MY_WEBSITE_GRAPHQL_RESPONSE_CACHE') && ! MY_WEBSITE_GRAPHQL_RESPONSE_CACHE) {
        return false;
    }

    return (bool) apply_filters('my_website_graphql_response_cache_enabled', true);
}

function my_website_graphql_response_cache_set_status(string $status): void
{
    $GLOBALS['my_website_graphql_response_cache_status'] = $status;
}

function my_website_graphql_response_cache_get_status(): string
{
    return isset($GLOBALS['my_website_graphql_response_cache_status'])
        ? (string) $GLOBALS['my_website_graphql_response_cache_status']
        : 'BYPASS';
}

function my_website_graphql_response_cache_is_authenticated_request(): bool
{
    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    $nonce = $_SERVER['HTTP_X_WP_NONCE'] ?? '';
    $cookie = $_SERVER['HTTP_COOKIE'] ?? '';

    if ($authorization || $nonce || is_user_logged_in()) {
        return true;
    }

    return is_string($cookie) && false !== strpos($cookie, 'wordpress_logged_in_');
}

function my_website_graphql_response_cache_normalize_variables($variables)
{
    if (is_object($variables)) {
        $variables = get_object_vars($variables);
    }

    if (! is_array($variables)) {
        return $variables;
    }

    ksort($variables);

    foreach ($variables as $key => $value) {
        $variables[$key] = my_website_graphql_response_cache_normalize_variables($value);
    }

    return $variables;
}

function my_website_graphql_response_cache_get_params(WPGraphQL\Request $request)
{
    $params = $request->get_params();

    if (is_array($params)) {
        return null;
    }

    return $params;
}

function my_website_graphql_response_cache_is_public_query(WPGraphQL\Request $request): bool
{
    if (! my_website_graphql_response_cache_is_enabled()) {
        my_website_graphql_response_cache_set_status('BYPASS');
        return false;
    }

    if (! function_exists('is_graphql_http_request') || ! is_graphql_http_request()) {
        my_website_graphql_response_cache_set_status('BYPASS');
        return false;
    }

    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        my_website_graphql_response_cache_set_status('BYPASS');
        return false;
    }

    if (my_website_graphql_response_cache_is_authenticated_request()) {
        my_website_graphql_response_cache_set_status('BYPASS');
        return false;
    }

    $params = my_website_graphql_response_cache_get_params($request);

    if (! $params) {
        my_website_graphql_response_cache_set_status('BYPASS');
        return false;
    }

    $query = isset($params->query) ? trim((string) $params->query) : '';

    if (! $query) {
        my_website_graphql_response_cache_set_status('BYPASS');
        return false;
    }

    if (preg_match('/^\s*mutation\b/i', $query)) {
        my_website_graphql_response_cache_set_status('BYPASS');
        return false;
    }

    if (preg_match('/\b(__schema|__type)\b/', $query)) {
        my_website_graphql_response_cache_set_status('BYPASS');
        return false;
    }

    return true;
}

function my_website_graphql_response_cache_key(WPGraphQL\Request $request): string
{
    $params = my_website_graphql_response_cache_get_params($request);

    if (! $params) {
        return '';
    }

    $payload = [
        'query' => isset($params->query) ? (string) $params->query : '',
        'operation' => isset($params->operation) ? (string) $params->operation : '',
        'variables' => my_website_graphql_response_cache_normalize_variables($params->variables ?? null),
    ];

    return 'my_website_gql_' . md5(wp_json_encode($payload));
}

function my_website_graphql_response_cache_normalize_response($response, WPGraphQL\Request $request)
{
    if (is_object($response) && method_exists($response, 'toArray')) {
        $response = $response->toArray($request->get_debug_flag());
    }

    if (! is_array($response) || isset($response['errors'])) {
        return null;
    }

    if (isset($response['data']) && is_array($response['data'])) {
        $non_null_root_values = array_filter($response['data'], function ($value) {
            return null !== $value;
        });

        if ([] === $non_null_root_values) {
            return null;
        }
    }

    return $response;
}

function my_website_graphql_response_cache_register_key(string $cache_key): void
{
    $index_option = my_website_graphql_response_cache_index_option();
    $index = get_option($index_option, []);

    if (! is_array($index)) {
        $index = [];
    }

    $ttl = my_website_graphql_response_cache_ttl();
    $now = time();

    foreach ($index as $indexed_key => $created_at) {
        if (($now - (int) $created_at) <= $ttl) {
            continue;
        }

        delete_transient((string) $indexed_key);
        unset($index[$indexed_key]);
    }

    $index[$cache_key] = $now;
    asort($index);

    $limit = my_website_graphql_response_cache_limit();

    while (count($index) > $limit) {
        $oldest_key = (string) array_key_first($index);
        delete_transient($oldest_key);
        unset($index[$oldest_key]);
    }

    update_option($index_option, $index, false);
}

function my_website_flush_graphql_response_cache(): void
{
    $index_option = my_website_graphql_response_cache_index_option();
    $index = get_option($index_option, []);

    if (is_array($index)) {
        foreach (array_keys($index) as $cache_key) {
            delete_transient((string) $cache_key);
        }
    }

    update_option($index_option, [], false);
}

add_filter('pre_graphql_execute_request', function ($response, WPGraphQL\Request $request) {
    if (! my_website_graphql_response_cache_is_public_query($request)) {
        return $response;
    }

    $cache_key = my_website_graphql_response_cache_key($request);

    if (! $cache_key) {
        my_website_graphql_response_cache_set_status('BYPASS');
        return $response;
    }

    $cached_response = get_transient($cache_key);

    if (is_array($cached_response)) {
        my_website_graphql_response_cache_set_status('HIT');
        return $cached_response;
    }

    my_website_graphql_response_cache_set_status('MISS');

    return $response;
}, 10, 2);

add_filter('graphql_request_results', function ($response, $schema, $operation, $query, $variables, WPGraphQL\Request $request) {
    if ('HIT' === my_website_graphql_response_cache_get_status()) {
        return $response;
    }

    if (! my_website_graphql_response_cache_is_public_query($request)) {
        return $response;
    }

    $cache_key = my_website_graphql_response_cache_key($request);
    $cache_response = my_website_graphql_response_cache_normalize_response($response, $request);

    if (! $cache_key || null === $cache_response) {
        my_website_graphql_response_cache_set_status('BYPASS');
        return $response;
    }

    set_transient($cache_key, $cache_response, my_website_graphql_response_cache_ttl());
    my_website_graphql_response_cache_register_key($cache_key);
    my_website_graphql_response_cache_set_status('MISS');

    return $response;
}, 10, 7);

add_filter('graphql_response_headers_to_send', function (array $headers): array {
    $headers['X-My-Website-GraphQL-Cache'] = my_website_graphql_response_cache_get_status();

    return $headers;
});

add_action('save_post', 'my_website_flush_graphql_response_cache', 10, 0);
add_action('deleted_post', 'my_website_flush_graphql_response_cache', 10, 0);
add_action('edit_attachment', 'my_website_flush_graphql_response_cache', 10, 0);
add_action('delete_attachment', 'my_website_flush_graphql_response_cache', 10, 0);
add_action('acf/save_post', 'my_website_flush_graphql_response_cache', 20, 0);

add_action('graphql_register_types', function () {
    register_graphql_object_type('SiteLink', [
        'description' => 'Reusable label and URL pair for global site settings.',
        'fields' => [
            'label' => [
                'type' => 'String',
            ],
            'url' => [
                'type' => 'String',
            ],
        ],
    ]);

    register_graphql_object_type('EmployerTestimonial', [
        'description' => 'Homepage employer testimonial row from ACF.',
        'fields' => [
            'quote' => [
                'type' => 'String',
            ],
            'name' => [
                'type' => 'String',
            ],
            'role' => [
                'type' => 'String',
            ],
            'organization' => [
                'type' => 'String',
            ],
        ],
    ]);

    register_graphql_object_type('FooterSettings', [
        'description' => 'Global footer settings from the ACF Site Settings page.',
        'fields' => [
            'heading' => [
                'type' => 'String',
            ],
            'body' => [
                'type' => 'String',
            ],
            'links' => [
                'type' => ['list_of' => 'SiteLink'],
            ],
            'note' => [
                'type' => 'String',
            ],
        ],
    ]);

    $normalize_links = static function ($rows) {
        if (! is_array($rows)) {
            return [];
        }

        return array_values(array_map(static function ($row) {
            return [
                'label' => isset($row['label']) ? wp_strip_all_tags((string) $row['label']) : '',
                'url' => isset($row['url']) ? esc_url_raw((string) $row['url']) : '',
            ];
        }, $rows));
    };

    $normalize_testimonials = static function ($rows) {
        if (! is_array($rows)) {
            return [];
        }

        $testimonials = array_map(static function ($row) {
            return [
                'quote' => isset($row['quote']) ? wp_strip_all_tags((string) $row['quote']) : '',
                'name' => isset($row['name']) ? wp_strip_all_tags((string) $row['name']) : '',
                'role' => isset($row['role']) ? wp_strip_all_tags((string) $row['role']) : '',
                'organization' => isset($row['organization']) ? wp_strip_all_tags((string) $row['organization']) : '',
            ];
        }, $rows);

        return array_values(array_filter($testimonials, static function ($testimonial) {
            return $testimonial['quote'] || $testimonial['name'] || $testimonial['role'] || $testimonial['organization'];
        }));
    };

    register_graphql_field('RootQuery', 'footerSettings', [
        'type' => 'FooterSettings',
        'description' => 'Global footer settings from the ACF Site Settings page.',
        'resolve' => static function () use ($normalize_links) {
            if (! function_exists('get_field')) {
                return [
                    'heading' => null,
                    'body' => null,
                    'links' => [],
                    'note' => null,
                ];
            }

            return [
                'heading' => get_field('footer_heading', 'option') ?: null,
                'body' => get_field('footer_body', 'option') ?: null,
                'links' => $normalize_links(get_field('footer_links', 'option')),
                'note' => get_field('footer_note', 'option') ?: null,
            ];
        },
    ]);

    register_graphql_field('Post', 'canonicalUrl', [
        'type' => 'String',
        'description' => 'Optional canonical URL for cross-posted content. Set to the original URL when this post is a cross-post from an external platform.',
        'resolve' => static function ($post) {
            $post_id = $post->databaseId ?? null;

            if (! $post_id || ! function_exists('get_field')) {
                return null;
            }

            return get_field('canonical_url', $post_id) ?: null;
        },
    ]);

    register_graphql_fields('CaseStudy', [
        'selectedWorkLayout' => [
            'type' => 'String',
            'description' => 'Homepage Selected Work row layout override (auto, banner, narrow_photo_left, narrow_photo_right, wide_photo_left, wide_photo_right).',
            'resolve' => static function ($case_study) {
                $post_id = $case_study->databaseId ?? null;

                if (! $post_id || ! function_exists('get_field')) {
                    return 'auto';
                }

                return get_field('selected_work_layout', $post_id) ?: 'auto';
            },
        ],
        'selectedWorkTextAlign' => [
            'type' => 'String',
            'description' => 'Homepage Selected Work text plate alignment override (auto, left, right).',
            'resolve' => static function ($case_study) {
                $post_id = $case_study->databaseId ?? null;

                if (! $post_id || ! function_exists('get_field')) {
                    return 'auto';
                }

                return get_field('selected_work_text_align', $post_id) ?: 'auto';
            },
        ],
        'selectedWorkPractice' => [
            'type' => 'String',
            'description' => 'Short homepage catalog line describing the practice or discipline used in the work.',
            'resolve' => static function ($case_study) {
                $post_id = $case_study->databaseId ?? null;

                if (! $post_id || ! function_exists('get_field')) {
                    return null;
                }

                return get_field('selected_work_practice', $post_id) ?: null;
            },
        ],
        'selectedWorkEngagementContext' => [
            'type' => 'String',
            'description' => 'Short homepage catalog line describing the engagement context or intervention.',
            'resolve' => static function ($case_study) {
                $post_id = $case_study->databaseId ?? null;

                if (! $post_id || ! function_exists('get_field')) {
                    return null;
                }

                return get_field('selected_work_engagement_context', $post_id) ?: null;
            },
        ],
        'selectedWorkPhotoTreatment' => [
            'type' => 'String',
            'description' => 'Homepage Selected Work photo treatment override (auto, bleed_blue_cream, direct_ink_blue, direct_tritone, direct_blue_cream, crisp_ink_blue, bleed_tritone).',
            'resolve' => static function ($case_study) {
                $post_id = $case_study->databaseId ?? null;

                if (! $post_id || ! function_exists('get_field')) {
                    return 'auto';
                }

                return get_field('selected_work_photo_treatment', $post_id) ?: 'auto';
            },
        ],
    ]);

    register_graphql_fields('Page', [
        'aboutTagline' => [
            'type' => 'String',
            'description' => 'Homepage about / vital info tagline stored in ACF.',
            'resolve' => static function ($page) {
                $post_id = $page->databaseId ?? null;

                if (! $post_id || ! function_exists('get_field')) {
                    return null;
                }

                return get_field('about_tagline', $post_id) ?: null;
            },
        ],
        'homepageQuickLinks' => [
            'type' => ['list_of' => 'SiteLink'],
            'description' => 'Homepage quick links stored in ACF.',
            'resolve' => static function ($page) use ($normalize_links) {
                $post_id = $page->databaseId ?? null;

                if (! $post_id || ! function_exists('get_field')) {
                    return [];
                }

                $rows = get_field('quick_links', $post_id);

                return $normalize_links($rows);
            },
        ],
        'homepageEmployerTestimonials' => [
            'type' => ['list_of' => 'EmployerTestimonial'],
            'description' => 'Homepage employer testimonials stored in ACF.',
            'resolve' => static function ($page) use ($normalize_testimonials) {
                $post_id = $page->databaseId ?? null;

                if (! $post_id || ! function_exists('get_field')) {
                    return [];
                }

                $rows = get_field('employer_testimonials', $post_id);

                return $normalize_testimonials($rows);
            },
        ],
        'homepageTestimonialsTexture' => [
            'type' => 'String',
            'description' => 'Background texture choice for the testimonials section, stored in ACF.',
            'resolve' => static function ($page) {
                $post_id = $page->databaseId ?? null;

                if (! $post_id || ! function_exists('get_field')) {
                    return 'dots';
                }

                return get_field('testimonials_background_texture', $post_id) ?: 'dots';
            },
        ],
        'homepageHeroPortrait' => [
            'type' => 'String',
            'description' => 'Homepage hero portrait image URL stored in ACF; null when unset (frontend falls back to the built-in mock).',
            'resolve' => static function ($page) {
                $post_id = $page->databaseId ?? null;

                if (! $post_id || ! function_exists('get_field')) {
                    return null;
                }

                $image = get_field('hero_portrait', $post_id);

                return is_array($image) && ! empty($image['url']) ? $image['url'] : null;
            },
        ],
        'homepageHeroPortraitAlt' => [
            'type' => 'String',
            'description' => 'Homepage hero portrait alt text stored in ACF.',
            'resolve' => static function ($page) {
                $post_id = $page->databaseId ?? null;

                if (! $post_id || ! function_exists('get_field')) {
                    return null;
                }

                $image = get_field('hero_portrait', $post_id);

                return is_array($image) && ! empty($image['alt']) ? $image['alt'] : null;
            },
        ],
        'displayDescription' => [
            'type' => 'String',
            'description' => 'Short display description shown on the page, stored in ACF.',
            'resolve' => static function ($page) {
                $post_id = $page->databaseId ?? null;

                if (! $post_id || ! function_exists('get_field')) {
                    return null;
                }

                return get_field('display_description', $post_id) ?: null;
            },
        ],
        'displayHeading' => [
            'type' => 'String',
            'description' => 'Public-facing standalone page heading stored in ACF.',
            'resolve' => static function ($page) {
                $post_id = $page->databaseId ?? null;

                if (! $post_id || ! function_exists('get_field')) {
                    return null;
                }

                return get_field('display_heading', $post_id) ?: null;
            },
        ],
        'seoDescription' => [
            'type' => 'String',
            'description' => 'Page SEO description stored in ACF.',
            'resolve' => static function ($page) {
                $post_id = $page->databaseId ?? null;

                if (! $post_id || ! function_exists('get_field')) {
                    return null;
                }

                return get_field('seo_description', $post_id) ?: null;
            },
        ],
        'nowContent' => [
            'type' => 'String',
            'description' => 'Public "now" statement (rendered HTML) stored in ACF.',
            'resolve' => static function ($page) {
                $post_id = $page->databaseId ?? null;

                if (! $post_id || ! function_exists('get_field')) {
                    return null;
                }

                return get_field('now_content', $post_id) ?: null;
            },
        ],
    ]);
});
