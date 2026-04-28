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
        'key' => 'group_my_website_homepage_hero',
        'title' => 'Homepage Hero',
        'fields' => [
            [
                'key' => 'field_my_website_mega_text',
                'label' => 'Mega Text',
                'name' => 'mega_text',
                'type' => 'text',
                'default_value' => 'B.L.U.F.',
                'wrapper' => [
                    'width' => '',
                ],
            ],
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
        'key' => 'group_my_website_homepage_testimonials',
        'title' => 'Homepage Employer Testimonials',
        'fields' => [
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
        'megaText' => [
            'type' => 'String',
            'description' => 'Homepage hero mega text stored in ACF.',
            'resolve' => static function ($page) {
                $post_id = $page->databaseId ?? null;

                if (! $post_id || ! function_exists('get_field')) {
                    return null;
                }

                return get_field('mega_text', $post_id) ?: null;
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
    ]);
});
