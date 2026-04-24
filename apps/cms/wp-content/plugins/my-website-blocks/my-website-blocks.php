<?php
/**
 * Plugin Name: My Website Blocks
 * Description: Custom Gutenberg blocks for the website CMS.
 * Version: 0.1.0
 * Author: Aslan French
 */

if (! defined('ABSPATH')) {
    exit;
}

add_action('init', function () {
    $block_dir = __DIR__ . '/blocks/mega-gallery';
    if (is_dir($block_dir)) {
        register_block_type($block_dir, [
            'render_callback' => function (array $attributes, string $content): string {
                $columns  = isset($attributes['columns']) ? (int) $attributes['columns'] : 3;
                $align    = isset($attributes['align']) ? sanitize_html_class($attributes['align']) : '';
                $class    = 'wp-block-my-website-mega-gallery';
                if ($align) {
                    $class .= ' align' . $align;
                }
                return sprintf(
                    '<div class="%s" data-columns="%d">%s</div>',
                    esc_attr($class),
                    $columns,
                    $content
                );
            },
        ]);
    }
});

add_action('enqueue_block_editor_assets', function () {
    wp_enqueue_script(
        'my-website-mega-gallery-editor',
        plugins_url('blocks/mega-gallery/editor.js', __FILE__),
        ['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-data'],
        filemtime(plugin_dir_path(__FILE__) . 'blocks/mega-gallery/editor.js'),
        true
    );
});
