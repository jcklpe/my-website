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
    register_block_style('core/group', [
        'name' => 'editorial-panel',
        'label' => 'Editorial panel',
    ]);
    foreach ([
        'project-overview' => 'Project overview',
        'research-panel' => 'Illustrated research',
        'entity-map' => 'Entity / action map',
        'impact-panel' => 'Illustrated impact',
        'problem-solution' => 'Problems and solutions',
        'process-panel' => 'Process stages',
    ] as $name => $label) {
        register_block_style('core/group', ['name' => $name, 'label' => $label]);
    }
    register_block_style('core/columns', [
        'name' => 'timeline',
        'label' => 'Timeline (inside editorial panel)',
    ]);

    register_block_pattern_category('my-website', ['label' => 'My Website']);
    foreach ([
        'editorial-panel' => ['Editorial panel', 'A wide dark panel with a heading and two editable topic columns.'],
        'editorial-timeline' => ['Editorial timeline', 'A wide dark panel with three connected, editable stages.'],
    ] as $name => [$title, $description]) {
        register_block_pattern('my-website/' . $name, [
            'title' => $title,
            'description' => $description,
            'categories' => ['my-website'],
            'content' => file_get_contents(__DIR__ . '/patterns/' . $name . '.html'),
        ]);
    }

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
        'my-website-inline-code-editor',
        plugins_url('inline-code.js', __FILE__),
        ['wp-format-library', 'wp-dom-ready', 'wp-rich-text', 'wp-data', 'wp-element', 'wp-block-editor', 'wp-components'],
        filemtime(plugin_dir_path(__FILE__) . 'inline-code.js'),
        true
    );
    wp_enqueue_script(
        'my-website-mega-gallery-editor',
        plugins_url('blocks/mega-gallery/editor.js', __FILE__),
        ['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-data'],
        filemtime(plugin_dir_path(__FILE__) . 'blocks/mega-gallery/editor.js'),
        true
    );
});
