#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rmdir, unlink, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
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
const reuseMaster = args.has('reuse-master');
const prepareOnly = args.has('prepare-only');

if (
  args.has('attachment') &&
  (!Number.isSafeInteger(attachmentId) || attachmentId <= 0)
) {
  throw new Error('Expected --attachment=<positive integer>.');
}

if (!['public', 'qa'].includes(cmsEnv)) {
  throw new Error('Expected --env=public or --env=qa.');
}

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
    execFile(
      command,
      commandArgs,
      { cwd: repoRoot, timeout: 120_000 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || stdout || error.message));
          return;
        }

        resolve(stdout);
      },
    );
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

      $master = $metadata['my_website_halftone_master']
        ?? $metadata['sizes']['case-study-halftone-1800']
        ?? [];
      $items[] = [
        'id' => $attachment_id,
        'sourcePath' => $source_path,
        'relativeFile' => $metadata['file'] ?? '',
        'width' => (int) ($metadata['width'] ?? 0),
        'height' => (int) ($metadata['height'] ?? 0),
        'masterPath' => isset($master['file']) ? dirname($source_path) . '/' . basename($master['file']) : null,
      ];
    }

    echo wp_json_encode($items, JSON_UNESCAPED_SLASHES);
  `;
}

async function copyCmsFile(from, to) {
  await run('docker', [
    'compose',
    ...composeFiles.flatMap((file) => ['-f', file]),
    'cp',
    from,
    to,
  ]);
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

async function hasCompleteScreenshot(filePath, width, height) {
  try {
    const bytes = await readFile(filePath);
    return (
      bytes.length >= 33 &&
      bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) &&
      bytes.readUInt32BE(16) === width &&
      bytes.readUInt32BE(20) === height &&
      bytes.subarray(-8, -4).toString('ascii') === 'IEND'
    );
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function renderHalftone({ sourcePath, destinationPath, width, height }) {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), 'my-website-halftone-'),
  );
  const htmlPath = path.join(temporaryDirectory, 'halftone.html');
  const imageUrl = pathToFileURL(sourcePath).href;

  await writeFile(htmlPath, halftoneHtml({ imageUrl, width, height }), 'utf8');
  const chromeArgs = [
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${path.join(temporaryDirectory, 'chrome-profile')}`,
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
  ];

  let browser;
  let finished = false;
  let failure;
  const exited = new Promise((resolve) => {
    browser = execFile(
      chromeBin,
      chromeArgs,
      { timeout: 120_000, killSignal: 'SIGKILL' },
      (error, _stdout, stderr) => {
        finished = true;
        if (error) failure = new Error(stderr || error.message);
        resolve();
      },
    );
  });

  try {
    // Some Chrome builds keep running after writing the screenshot. Wait for the complete PNG, not browser exit.
    while (!(await hasCompleteScreenshot(destinationPath, width, height))) {
      if (finished) {
        if (failure) throw failure;
        throw new Error(
          'Chrome did not produce a complete, correctly sized PNG.',
        );
      }
      await delay(250);
    }
  } finally {
    if (!finished) browser.kill('SIGTERM');
    await exited;
  }
}

async function resizeMaster(attachment, masterPath) {
  const payload = Buffer.from(
    JSON.stringify({
      masterPath,
      sourcePath: attachment.sourcePath,
    }),
  ).toString('base64');
  const result = await runWpEval(`
    $paths = json_decode(base64_decode('${payload}'), true);
    $generated = my_website_halftone_sizes_from_master($paths['masterPath'], $paths['sourcePath']);
    if (! $generated) {
      WP_CLI::error('Could not generate responsive halftones from the PNG master.');
    }
    echo wp_json_encode($generated);
  `);
  return JSON.parse(result);
}

async function updateAttachmentMetadata(attachment, generated) {
  const payload = Buffer.from(JSON.stringify(generated)).toString('base64');
  await runWpEval(`
    $attachment_id = ${attachment.id};
    $generated = json_decode(base64_decode('${payload}'), true);
    $metadata = wp_get_attachment_metadata($attachment_id);

    if (! is_array($metadata)) {
      $metadata = [];
    }

    $metadata['sizes'] = is_array($metadata['sizes'] ?? null)
      ? $metadata['sizes']
      : [];

    foreach ($generated['sizes'] as $name => $size) {
      $metadata['sizes'][$name] = $size;
    }
    $metadata['my_website_halftone_master'] = $generated['master'];

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
    if (!attachment.width || !attachment.height) {
      console.warn(`Skipping attachment ${attachment.id}: missing dimensions.`);
      continue;
    }

    let temporaryDirectory;
    let temporaryMaster;
    let temporarySource;
    let containerMaster;
    let masterPath = attachment.masterPath;
    try {
      if (!reuseMaster) {
        // Copy through Compose so public bind mounts and QA's separate uploads volume both work.
        temporaryDirectory = await mkdtemp(
          path.join(os.tmpdir(), 'halftone-source-'),
        );
        temporaryMaster = path.join(temporaryDirectory, 'master.png');
        temporarySource = path.join(
          temporaryDirectory,
          path.basename(attachment.sourcePath),
        );
        await copyCmsFile(
          `${cmsService}:${attachment.sourcePath}`,
          temporarySource,
        );
        const width = Math.max(...Object.values(halftoneSizes));
        const height = Math.round(
          width * (attachment.height / attachment.width),
        );
        await renderHalftone({
          sourcePath: temporarySource,
          destinationPath: temporaryMaster,
          width,
          height,
        });
        containerMaster = JSON.parse(
          await runWpEval(
            `echo wp_json_encode(wp_tempnam('halftone-browser-master'));`,
          ),
        );
        if (!containerMaster)
          throw new Error('Could not reserve a CMS master temporary file.');
        await copyCmsFile(temporaryMaster, `${cmsService}:${containerMaster}`);
        masterPath = containerMaster;
      }
      if (!masterPath) {
        throw new Error(
          `Attachment ${attachment.id} has no existing master to reuse.`,
        );
      }
      const generated = await resizeMaster(attachment, masterPath);
      console.log(
        JSON.stringify({ attachment: attachment.id, ...generated }, null, 2),
      );
      if (!prepareOnly) {
        await updateAttachmentMetadata(attachment, generated);
      }
    } finally {
      if (containerMaster) {
        const encodedPath = Buffer.from(containerMaster).toString('base64');
        await runWpEval(`unlink(base64_decode('${encodedPath}'));`);
      }
      if (temporaryMaster) await unlink(temporaryMaster).catch(() => {});
      if (temporarySource) await unlink(temporarySource).catch(() => {});
      if (temporaryDirectory) await rmdir(temporaryDirectory).catch(() => {});
    }
  }

  console.log(
    prepareOnly
      ? 'Prepared files only; attachment metadata unchanged.'
      : 'Done.',
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
