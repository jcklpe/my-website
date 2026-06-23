<?php
/**
 * Generate baked halftone media derivatives for frontend case-study imagery.
 *
 * This intentionally mirrors the browser CSS effect more than a real print
 * workflow. The CSS recipe is: filtered source image + radial-gradient ink
 * fields + blend modes + blur/contrast threshold + final toning.
 */

if (! defined('ABSPATH')) {
    exit;
}

function my_website_halftone_media_sizes(): array
{
    return [
        'case-study-halftone-600' => 600,
        'case-study-halftone-1200' => 1200,
        'case-study-halftone-1800' => 1800,
    ];
}

function my_website_is_halftone_supported_mime(string $mime_type): bool
{
    return in_array(
        $mime_type,
        ['image/jpeg', 'image/png', 'image/webp'],
        true
    );
}

function my_website_is_halftone_derivative_path(string $path): bool
{
    return (bool) preg_match('/-halftone-\d+w\.(?:jpe?g|png)$/i', $path);
}

function my_website_halftone_cell_size(): float
{
    return 11.0;
}

function my_website_halftone_dot_size(): float
{
    return my_website_halftone_cell_size() * 0.45;
}

function my_website_imagick_quantum(): float
{
    $range = Imagick::getQuantumRange();

    return (float) ($range['quantumRangeLong'] ?? $range['quantumRange'] ?? 65535);
}

function my_website_apply_rgb_matrix(Imagick $image, array $matrix): void
{
    $image->colorMatrixImage([
        (float) $matrix[0][0],
        (float) $matrix[0][1],
        (float) $matrix[0][2],
        0,
        0,
        0,
        (float) $matrix[1][0],
        (float) $matrix[1][1],
        (float) $matrix[1][2],
        0,
        0,
        0,
        (float) $matrix[2][0],
        (float) $matrix[2][1],
        (float) $matrix[2][2],
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
    ]);
}

function my_website_apply_css_saturate(Imagick $image, float $amount): void
{
    my_website_apply_rgb_matrix($image, [
        [
            0.213 + (0.787 * $amount),
            0.715 - (0.715 * $amount),
            0.072 - (0.072 * $amount),
        ],
        [
            0.213 - (0.213 * $amount),
            0.715 + (0.285 * $amount),
            0.072 - (0.072 * $amount),
        ],
        [
            0.213 - (0.213 * $amount),
            0.715 - (0.715 * $amount),
            0.072 + (0.928 * $amount),
        ],
    ]);
}

function my_website_apply_css_grayscale(Imagick $image, float $amount = 1): void
{
    $inverse = 1 - $amount;

    my_website_apply_rgb_matrix($image, [
        [
            0.2126 + (0.7874 * $inverse),
            0.7152 - (0.7152 * $inverse),
            0.0722 - (0.0722 * $inverse),
        ],
        [
            0.2126 - (0.2126 * $inverse),
            0.7152 + (0.2848 * $inverse),
            0.0722 - (0.0722 * $inverse),
        ],
        [
            0.2126 - (0.2126 * $inverse),
            0.7152 - (0.7152 * $inverse),
            0.0722 + (0.9278 * $inverse),
        ],
    ]);
}

function my_website_apply_css_sepia(Imagick $image, float $amount): void
{
    $inverse = 1 - $amount;

    my_website_apply_rgb_matrix($image, [
        [
            0.393 + (0.607 * $inverse),
            0.769 - (0.769 * $inverse),
            0.189 - (0.189 * $inverse),
        ],
        [
            0.349 - (0.349 * $inverse),
            0.686 + (0.314 * $inverse),
            0.168 - (0.168 * $inverse),
        ],
        [
            0.272 - (0.272 * $inverse),
            0.534 - (0.534 * $inverse),
            0.131 + (0.869 * $inverse),
        ],
    ]);
}

function my_website_new_image(
    int $width,
    int $height,
    string $color,
    string $format = 'png'
): Imagick {
    $image = new Imagick();
    $image->newImage($width, $height, new ImagickPixel($color));
    $image->setImageFormat($format);
    $image->setImageColorspace(Imagick::COLORSPACE_SRGB);

    return $image;
}

function my_website_draw_css_radial_dot(
    ImagickDraw $draw,
    float $x,
    float $y,
    float $radius,
    array $stops
): void {
    $stops = array_values($stops);
    $stop_count = count($stops);

    if ($stop_count < 2) {
        return;
    }

    for ($index = $stop_count - 1; $index >= 0; $index--) {
        $position = $stop_count === 1 ? 1 : ($index + 1) / $stop_count;
        $dot_radius = $radius * $position;

        $draw->setFillColor(new ImagickPixel((string) $stops[$index]));
        $draw->circle($x, $y, $x + $dot_radius, $y);
    }
}

function my_website_draw_rotated_dot_field(
    Imagick $pattern,
    float $angle_degrees,
    float $translate_x,
    array $dots
): void {
    $width = $pattern->getImageWidth();
    $height = $pattern->getImageHeight();
    $cell_size = my_website_halftone_cell_size();
    $dot_size = my_website_halftone_dot_size();
    $angle = deg2rad($angle_degrees);
    $cos = cos($angle);
    $sin = sin($angle);
    $center_x = $width / 2;
    $center_y = $height / 2;
    $half_diagonal = (sqrt(($width * $width) + ($height * $height)) / 2)
        + ($cell_size * 4);
    $draw = new ImagickDraw();
    $draw->setStrokeColor(new ImagickPixel('transparent'));
    $draw_count = 0;

    for ($origin_y = -$half_diagonal; $origin_y <= $half_diagonal; $origin_y += $cell_size) {
        for ($origin_x = -$half_diagonal; $origin_x <= $half_diagonal; $origin_x += $cell_size) {
            foreach ($dots as $dot) {
                $screen_x = $origin_x + ($cell_size * (float) $dot['x']) + $translate_x;
                $screen_y = $origin_y + ($cell_size * (float) $dot['y']);
                $x = $center_x + ($screen_x * $cos) - ($screen_y * $sin);
                $y = $center_y + ($screen_x * $sin) + ($screen_y * $cos);

                if (
                    $x < -$cell_size ||
                    $x > $width + $cell_size ||
                    $y < -$cell_size ||
                    $y > $height + $cell_size
                ) {
                    continue;
                }

                my_website_draw_css_radial_dot(
                    $draw,
                    $x,
                    $y,
                    $dot_size,
                    (array) $dot['stops']
                );
                $draw_count++;

                if ($draw_count % 6000 === 0) {
                    $pattern->drawImage($draw);
                    $draw = new ImagickDraw();
                    $draw->setStrokeColor(new ImagickPixel('transparent'));
                }
            }
        }
    }

    if ($draw_count % 6000 !== 0) {
        $pattern->drawImage($draw);
    }
}

function my_website_css_like_ink_pattern(int $width, int $height): Imagick
{
    $before = my_website_new_image($width, $height, '#ffffff');
    $after = my_website_new_image($width, $height, '#ffffff');

    // Separate-K mode from the CSS: the main ::before keeps only Y dots.
    my_website_draw_rotated_dot_field(
        $before,
        30,
        0,
        [
            ['x' => 0.25, 'y' => 0.25, 'stops' => ['#ffff00', '#ffff66', '#ffffff']],
            ['x' => 0.75, 'y' => 0.75, 'stops' => ['#ffff00', '#ffff66', '#ffffff']],
        ]
    );

    // M + C plate, rotated and translated like the CSS ::after.
    my_website_draw_rotated_dot_field(
        $after,
        -21,
        my_website_halftone_cell_size() * 0.58,
        [
            ['x' => 0.75, 'y' => 0.25, 'stops' => ['#ff00ff', '#ff66ff', '#ffffff']],
            ['x' => 0.25, 'y' => 0.75, 'stops' => ['#ff00ff', '#ff66ff', '#ffffff']],
            ['x' => 0.75, 'y' => 0.75, 'stops' => ['#00ffff', '#66ffff', '#ffffff']],
            ['x' => 0.25, 'y' => 0.25, 'stops' => ['#00ffff', '#66ffff', '#ffffff']],
        ]
    );

    $before->compositeImage($after, Imagick::COMPOSITE_MULTIPLY, 0, 0);
    $after->clear();
    $after->destroy();

    return $before;
}

function my_website_css_like_k_pattern(int $width, int $height): Imagick
{
    $pattern = my_website_new_image($width, $height, '#ffffff');

    my_website_draw_rotated_dot_field(
        $pattern,
        30,
        0,
        [
            ['x' => 0.25, 'y' => 0.25, 'stops' => ['#000000', '#666666', '#cccccc', '#ffffff']],
            ['x' => 0.75, 'y' => 0.75, 'stops' => ['#000000', '#ffffff']],
        ]
    );

    return $pattern;
}

function my_website_apply_main_media_hues(Imagick $image): void
{
    // CSS: invert(1) brightness(0.75) invert(1) saturate(2)
    $image->negateImage(false);
    $image->modulateImage(75, 100, 100);
    $image->negateImage(false);
    my_website_apply_css_saturate($image, 2);
}

function my_website_apply_css_threshold_pane(Imagick $image): void
{
    $cell_size = my_website_halftone_cell_size();
    $bleed = 0.45;
    $brightness_percent = (0.5 + ($bleed * 0.3)) * 100;

    $image->modulateImage($brightness_percent, 100, 100);
    $image->blurImage(0, $cell_size * 0.1);
    $image->evaluateImage(
        Imagick::EVALUATE_THRESHOLD,
        my_website_imagick_quantum() * 0.5
    );
    $image->blurImage(0, 0.6);
}

function my_website_apply_soft_k_media(Imagick $image): void
{
    // CSS: grayscale(1) brightness(0.8)
    my_website_apply_css_grayscale($image);
    $image->modulateImage(80, 100, 100);
}

function my_website_apply_css_final_tone(Imagick $image): void
{
    // CSS box filter: sepia(.35) saturate(1.5)
    my_website_apply_css_sepia($image, 0.35);
    my_website_apply_css_saturate($image, 1.5);
}

function my_website_prepare_halftone_source(string $source_path, int $target_width): ?Imagick
{
    if (! class_exists('Imagick')) {
        return null;
    }

    try {
        $source = new Imagick($source_path);
        $source->setIteratorIndex(0);

        if (method_exists($source, 'autoOrient')) {
            $source->autoOrient();
        } elseif (method_exists($source, 'autoOrientImage')) {
            $source->autoOrientImage();
        }

        $source->setImageColorspace(Imagick::COLORSPACE_SRGB);
        $source->setImageBackgroundColor(new ImagickPixel('#f7f2e8'));

        if (method_exists($source, 'setImageAlphaChannel')) {
            $source->setImageAlphaChannel(Imagick::ALPHACHANNEL_REMOVE);
        }

        $source = $source->mergeImageLayers(Imagick::LAYERMETHOD_FLATTEN);

        if ($source->getImageWidth() !== $target_width) {
            $source->resizeImage($target_width, 0, Imagick::FILTER_LANCZOS, 1);
        }

        $source->setImageDepth(8);
        $source->stripImage();

        return $source;
    } catch (Throwable $error) {
        error_log(sprintf(
            'Halftone media source preparation failed for %s: %s',
            $source_path,
            $error->getMessage()
        ));

        return null;
    }
}

function my_website_generate_halftone_derivative(
    string $source_path,
    string $destination_path,
    int $target_width
): ?array {
    $source = my_website_prepare_halftone_source($source_path, $target_width);

    if (! $source) {
        return null;
    }

    try {
        $width = $source->getImageWidth();
        $height = $source->getImageHeight();
        $main = clone $source;
        my_website_apply_main_media_hues($main);

        $ink_pattern = my_website_css_like_ink_pattern($width, $height);
        $main->compositeImage($ink_pattern, Imagick::COMPOSITE_SCREEN, 0, 0);
        $ink_pattern->clear();
        $ink_pattern->destroy();
        my_website_apply_css_threshold_pane($main);

        $k_layer = clone $source;
        my_website_apply_soft_k_media($k_layer);
        $k_pattern = my_website_css_like_k_pattern($width, $height);
        $k_layer->compositeImage($k_pattern, Imagick::COMPOSITE_SCREEN, 0, 0);
        $k_pattern->clear();
        $k_pattern->destroy();
        $k_layer->blurImage(0, my_website_halftone_cell_size() * 0.1);
        $k_layer->blurImage(0, 0.6);

        $main->compositeImage($k_layer, Imagick::COMPOSITE_MULTIPLY, 0, 0);
        $k_layer->clear();
        $k_layer->destroy();
        my_website_apply_css_final_tone($main);

        $main->setImageFormat('jpeg');
        $main->setImageCompression(Imagick::COMPRESSION_JPEG);
        $main->setImageCompressionQuality(88);
        $main->stripImage();
        $main->writeImage($destination_path);

        $file_size = file_exists($destination_path)
            ? (int) filesize($destination_path)
            : null;

        return [
            'file' => basename($destination_path),
            'width' => $width,
            'height' => $height,
            'mime-type' => 'image/jpeg',
            'filesize' => $file_size,
        ];
    } catch (Throwable $error) {
        error_log(sprintf(
            'Halftone media derivative failed for %s: %s',
            $source_path,
            $error->getMessage()
        ));

        return null;
    } finally {
        $source->clear();
        $source->destroy();

        foreach (['main', 'ink_pattern', 'k_layer', 'k_pattern'] as $variable) {
            if (isset($$variable) && $$variable instanceof Imagick) {
                $$variable->clear();
                $$variable->destroy();
            }
        }
    }
}

function my_website_halftone_destination_path(
    string $source_path,
    int $target_width
): string {
    $path_info = pathinfo($source_path);
    $directory = $path_info['dirname'] ?? dirname($source_path);
    $filename = $path_info['filename'] ?? basename($source_path);

    return sprintf('%s/%s-halftone-%dw.jpg', $directory, $filename, $target_width);
}

function my_website_add_halftone_media_sizes($metadata, int $attachment_id)
{
    if (! is_array($metadata)) {
        return $metadata;
    }

    $source_path = get_attached_file($attachment_id);
    $mime_type = get_post_mime_type($attachment_id);

    if (
        ! $source_path ||
        ! is_string($mime_type) ||
        ! file_exists($source_path) ||
        ! my_website_is_halftone_supported_mime($mime_type) ||
        my_website_is_halftone_derivative_path($source_path)
    ) {
        return $metadata;
    }

    $metadata['sizes'] = is_array($metadata['sizes'] ?? null)
        ? $metadata['sizes']
        : [];

    foreach (my_website_halftone_media_sizes() as $size_name => $target_width) {
        $destination_path = my_website_halftone_destination_path(
            $source_path,
            $target_width
        );
        $generated = my_website_generate_halftone_derivative(
            $source_path,
            $destination_path,
            $target_width
        );

        if ($generated) {
            $metadata['sizes'][$size_name] = $generated;
        }
    }

    return $metadata;
}

add_filter('wp_generate_attachment_metadata', 'my_website_add_halftone_media_sizes', 30, 2);

function my_website_case_study_featured_attachment_ids(): array
{
    $case_study_ids = get_posts([
        'post_type' => 'case_study',
        'post_status' => 'any',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'no_found_rows' => true,
    ]);

    $attachment_ids = array_map(
        static fn ($post_id) => (int) get_post_thumbnail_id((int) $post_id),
        $case_study_ids
    );

    return array_values(array_unique(array_filter($attachment_ids)));
}

function my_website_all_image_attachment_ids(): array
{
    return get_posts([
        'post_type' => 'attachment',
        'post_mime_type' => 'image',
        'post_status' => 'inherit',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'no_found_rows' => true,
    ]);
}

function my_website_regenerate_halftones_for_attachment(int $attachment_id): bool
{
    $metadata = wp_get_attachment_metadata($attachment_id);

    if (! is_array($metadata)) {
        return false;
    }

    $metadata = my_website_add_halftone_media_sizes($metadata, $attachment_id);
    wp_update_attachment_metadata($attachment_id, $metadata);

    return true;
}

function my_website_wp_cli_regenerate_halftones(array $args, array $assoc_args): void
{
    $attachment_id = isset($assoc_args['attachment'])
        ? absint($assoc_args['attachment'])
        : 0;

    if ($attachment_id) {
        $attachment_ids = [$attachment_id];
    } elseif (isset($assoc_args['all'])) {
        $attachment_ids = my_website_all_image_attachment_ids();
    } else {
        $attachment_ids = my_website_case_study_featured_attachment_ids();
    }

    if (empty($attachment_ids)) {
        WP_CLI::warning('No matching image attachments found.');
        return;
    }

    $processed = 0;
    $progress = WP_CLI\Utils\make_progress_bar(
        'Generating halftone derivatives',
        count($attachment_ids)
    );

    foreach ($attachment_ids as $id) {
        if (my_website_regenerate_halftones_for_attachment((int) $id)) {
            $processed++;
        }

        $progress->tick();
    }

    $progress->finish();
    WP_CLI::success(sprintf(
        'Generated halftone derivatives for %d attachment%s.',
        $processed,
        $processed === 1 ? '' : 's'
    ));
}

if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command(
        'my-website regenerate-halftones',
        'my_website_wp_cli_regenerate_halftones'
    );
}
