<?php

if (! defined('ABSPATH')) {
    exit;
}

add_action('after_setup_theme', function () {
    add_theme_support('editor-styles');
    add_theme_support('wp-block-styles');
    add_theme_support('align-wide');
    add_editor_style('style.css');
});
