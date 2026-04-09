<?php
/**
 * Plugin Name: Project Bootstrap
 * Description: Project-level WordPress settings for the headless website.
 * Version: 0.1.0
 */

if (! defined('ABSPATH')) {
    exit;
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
