#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { mkdtemp, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cmsRoot = path.join(repoRoot, 'apps/cms');
const chromeBin =
  process.env.CHROME_BIN ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const halftoneSizes = {
  'case-study-halftone-600': 600,
  'case-study-halftone-1200': 1200,
  'case-study-halftone-1800': 1800,
};

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = 'true'] = arg.replace(/^--/, '').split('=');
    return [key, value];
  }),
);

const attachmentId = Number(args.get('attachment') ?? 0);
const includeAllAttachments = args.has('all');
const cmsEnv = args.get('env') ?? 'public';

const composeFiles = [
  path.join(repoRoot, 'docker/compose.yaml'),
  path.join(repoRoot, 'docker/compose.dev.yaml'),
];
const cmsService = cmsEnv === 'qa' ? 'cms_dev' : 'cms';

if (cmsEnv === 'qa') {
  composeFiles.push(path.join(repoRoot, 'docker/compose.cms-dev.yaml'));
}

function dockerComposeArgs() {
  return [
    'compose',
    ...composeFiles.flatMap((file) => ['-f', file]),
    'exec',
    '-T',
    cmsService,
  ];
}

function run(command, commandArgs) {
  return new Promise((resolve, reject) => {
    execFile(command, commandArgs, { cwd: repoRoot }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || stdout || error.message));
        return;
      }

      resolve(stdout);
    });
  });
}

async function runWpEval(source) {
  return run('docker', [
    ...dockerComposeArgs(),
    'wp',
    'eval',
    source,
    '--allow-root',
  ]);
}

function sourceListPhp() {
  let selector;

  if (attachmentId > 0) {
    selector = `$attachment_ids = [${attachmentId}];`;
  } else if (includeAllAttachments) {
    selector = `
      $attachment_ids = get_posts([
        'post_type' => 'attachment',
        'post_mime_type' => 'image',
        'post_status' => 'inherit',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'no_found_rows' => true,
      ]);
    `;
  } else {
    selector = `
      $case_study_ids = get_posts([
        'post_type' => 'case_study',
        'post_status' => 'any',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'no_found_rows' => true,
      ]);
      $attachment_ids = array_values(array_unique(array_filter(array_map(
        static fn ($post_id) => (int) get_post_thumbnail_id((int) $post_id),
        $case_study_ids
      ))));
    `;
  }

  return `
    ${selector}
    $items = [];

    foreach ($attachment_ids as $attachment_id) {
      $attachment_id = (int) $attachment_id;
      $metadata = wp_get_attachment_metadata($attachment_id);
      $source_path = get_attached_file($attachment_id);
      $mime_type = get_post_mime_type($attachment_id);

      if (
        ! is_array($metadata) ||
        ! $source_path ||
        ! file_exists($source_path) ||
        ! is_string($mime_type) ||
        ! my_website_is_halftone_supported_mime($mime_type)
      ) {
        continue;
      }

      $items[] = [
        'id' => $attachment_id,
        'sourcePath' => $source_path,
        'relativeFile' => $metadata['file'] ?? '',
        'width' => (int) ($metadata['width'] ?? 0),
        'height' => (int) ($metadata['height'] ?? 0),
      ];
    }

    echo wp_json_encode($items, JSON_UNESCAPED_SLASHES);
  `;
}

function containerPathToHostPath(containerPath) {
  if (!containerPath.startsWith('/var/www/html/')) {
    throw new Error(`Unexpected WordPress path: ${containerPath}`);
  }

  return path.join(cmsRoot, containerPath.replace('/var/www/html/', ''));
}

function halftoneHtml({ imageUrl, width, height }) {
  return `<!doctype html>
<meta charset="utf-8" />
<style>
  html,
  body {
    margin: 0;
    width: ${width}px;
    height: ${height}px;
    overflow: hidden;
    background: #ffffff;
  }

  .box {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    overflow: hidden;
    --halftone-size: 11px;
    --halftone-bleed: 0.45;
    --halftone-contrast: 1000;
    --halftone-sepia: 0.35;
    --halftone-saturation: 1.5;
    --halftone-k-image-brightness: 0.8;
    --halftone-rotation: 0deg;
    --halftone-dot-size: calc(var(--halftone-size) * var(--halftone-bleed));
    --halftone-color-dot-size: var(--halftone-dot-size);
    filter: sepia(var(--halftone-sepia)) saturate(var(--halftone-saturation));
  }

  .pane {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    filter:
      brightness(calc(0.5 + var(--halftone-bleed) * 0.3))
      blur(calc(var(--halftone-size) * 0.1))
      contrast(var(--halftone-contrast))
      blur(0.6px);
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: fill;
  }

  .pane img {
    filter: invert(1) brightness(0.75) invert(1) saturate(2);
  }

  .ink {
    position: absolute;
    inset: 0;
    pointer-events: none;
    mix-blend-mode: screen;
  }

  .ink::before,
  .ink::after {
    content: '';
    position: absolute;
    inset: -150%;
    background-size: var(--halftone-size) var(--halftone-size);
    background-blend-mode: multiply;
    mix-blend-mode: multiply;
  }

  .ink::before {
    transform: rotate(30deg);
    background-image:
      radial-gradient(
        var(--halftone-color-dot-size) at 25% 25%,
        #ff0,
        #ff6,
        #fff
      ),
      radial-gradient(
        var(--halftone-color-dot-size) at 75% 75%,
        #ff0,
        #ff6,
        #fff
      );
  }

  .ink::after {
    transform:
      rotate(calc(-21deg + var(--halftone-rotation)))
      translateX(calc(var(--halftone-size) * 0.58));
    background-image:
      radial-gradient(
        var(--halftone-color-dot-size) at 75% 25%,
        #f0f,
        #f6f,
        #fff
      ),
      radial-gradient(
        var(--halftone-color-dot-size) at 25% 75%,
        #f0f,
        #f6f,
        #fff
      ),
      radial-gradient(
        var(--halftone-color-dot-size) at 75% 75%,
        #0ff,
        #6ff,
        #fff
      ),
      radial-gradient(
        var(--halftone-color-dot-size) at 25% 25%,
        #0ff,
        #6ff,
        #fff
      );
  }

  .k {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    mix-blend-mode: multiply;
    filter:
      blur(calc(var(--halftone-size) * 0.1))
      blur(0.6px);
  }

  .k img {
    filter: grayscale(1) brightness(var(--halftone-k-image-brightness));
  }

  .k::after {
    content: '';
    position: absolute;
    inset: -150%;
    background-size: var(--halftone-size) var(--halftone-size);
    background-blend-mode: multiply;
    mix-blend-mode: screen;
    transform: rotate(30deg);
    background-image:
      radial-gradient(
        var(--halftone-color-dot-size) at 25% 25%,
        #000,
        #666,
        #ccc,
        #fff
      ),
      radial-gradient(
        var(--halftone-color-dot-size) at 75% 75%,
        #000,
        #fff
      );
  }
</style>
<div class="box">
  <div class="pane">
    <img src="${imageUrl}" />
    <div class="ink"></div>
  </div>
  <div class="k">
    <img src="${imageUrl}" />
  </div>
</div>
`;
}

async function renderHalftone({ sourcePath, destinationPath, width, height }) {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), 'my-website-halftone-'),
  );
  const htmlPath = path.join(temporaryDirectory, 'halftone.html');
  const imageUrl = pathToFileURL(sourcePath).href;

  await writeFile(htmlPath, halftoneHtml({ imageUrl, width, height }), 'utf8');
  await run(chromeBin, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--allow-file-access-from-files',
    '--hide-scrollbars',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=500',
    `--screenshot=${destinationPath}`,
    `--window-size=${width},${height}`,
    pathToFileURL(htmlPath).href,
  ]);
}

async function updateAttachmentMetadata(attachment, sizes) {
  const payload = Buffer.from(JSON.stringify(sizes)).toString('base64');
  await runWpEval(`
    $attachment_id = ${attachment.id};
    $sizes = json_decode(base64_decode('${payload}'), true);
    $metadata = wp_get_attachment_metadata($attachment_id);

    if (! is_array($metadata)) {
      $metadata = [];
    }

    $metadata['sizes'] = is_array($metadata['sizes'] ?? null)
      ? $metadata['sizes']
      : [];

    foreach ($sizes as $name => $size) {
      $metadata['sizes'][$name] = $size;
    }

    wp_update_attachment_metadata($attachment_id, $metadata);
  `);
}

async function main() {
  const rawSources = await runWpEval(sourceListPhp());
  const attachments = JSON.parse(rawSources || '[]');

  if (!attachments.length) {
    console.log('No matching image attachments found.');
    return;
  }

  console.log(`Baking CSS halftones for ${attachments.length} attachment(s).`);

  for (const attachment of attachments) {
    const sourcePath = containerPathToHostPath(attachment.sourcePath);
    const sourceDirectory = path.dirname(sourcePath);
    const sourceName = path.parse(sourcePath).name;
    const generatedSizes = {};

    if (!attachment.width || !attachment.height) {
      console.warn(`Skipping attachment ${attachment.id}: missing dimensions.`);
      continue;
    }

    for (const [sizeName, targetWidth] of Object.entries(halftoneSizes)) {
      const targetHeight = Math.round(
        targetWidth * (attachment.height / attachment.width),
      );
      const fileName = `${sourceName}-halftone-${targetWidth}w.png`;
      const destinationPath = path.join(sourceDirectory, fileName);

      console.log(
        `- ${attachment.id} ${sizeName}: ${targetWidth}x${targetHeight}`,
      );

      await renderHalftone({
        sourcePath,
        destinationPath,
        width: targetWidth,
        height: targetHeight,
      });

      const fileStats = await stat(destinationPath);
      generatedSizes[sizeName] = {
        file: fileName,
        width: targetWidth,
        height: targetHeight,
        'mime-type': 'image/png',
        filesize: fileStats.size,
      };
    }

    await updateAttachmentMetadata(attachment, generatedSizes);
  }

  console.log('Done.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
