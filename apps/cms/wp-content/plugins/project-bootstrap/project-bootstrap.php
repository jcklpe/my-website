<?php
/**
 * Plugin Name: Project Bootstrap
 * Description: Project-level WordPress settings for the headless website.
 * Version: 0.1.0
 */

if (! defined('ABSPATH')) {
    exit;
}

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

});

add_filter('show_admin_bar', '__return_false');

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

    acf_add_local_field_group([
        'key' => 'group_my_website_homepage_hero',
        'title' => 'Homepage Hero',
        'fields' => [
            [
                'key' => 'field_my_website_hero_title',
                'label' => 'Title',
                'name' => 'hero_title',
                'type' => 'text',
                'default_value' => 'Title Text',
                'wrapper' => [
                    'width' => '',
                ],
            ],
            [
                'key' => 'field_my_website_hero_subtitle',
                'label' => 'Subtitle',
                'name' => 'hero_subtitle',
                'type' => 'textarea',
                'default_value' => 'Subtitle text',
                'rows' => 3,
                'new_lines' => '',
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
        'position' => 'acf_after_title',
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

add_action('graphql_register_types', function () {
    register_graphql_fields('Page', [
        'heroTitle' => [
            'type' => 'String',
            'description' => 'Homepage hero title stored in ACF.',
            'resolve' => static function ($page) {
                $post_id = $page->databaseId ?? null;

                if (! $post_id) {
                    return null;
                }

                if (! function_exists('get_field')) {
                    return null;
                }

                return get_field('hero_title', $post_id) ?: null;
            },
        ],
        'heroSubtitle' => [
            'type' => 'String',
            'description' => 'Homepage hero subtitle stored in ACF.',
            'resolve' => static function ($page) {
                $post_id = $page->databaseId ?? null;

                if (! $post_id) {
                    return null;
                }

                if (! function_exists('get_field')) {
                    return null;
                }

                return get_field('hero_subtitle', $post_id) ?: null;
            },
        ],
    ]);
});
