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
        register_block_type($block_dir);
    }
});

add_action('enqueue_block_editor_assets', function () {
    wp_enqueue_script(
        'my-website-mega-gallery-editor',
        plugins_url('blocks/mega-gallery/editor.js', __FILE__),
        ['wp-blocks', 'wp-element', 'wp-block-editor'],
        filemtime(plugin_dir_path(__FILE__) . 'blocks/mega-gallery/editor.js'),
        true
    );
});
