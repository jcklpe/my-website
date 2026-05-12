import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(frontendDir, '../..');
const deployEnvPath = path.join(repoRoot, '.env.deploy');

const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.map',
  '.svg',
  '.txt',
  '.xml',
]);

const defaultConfig = {
  STATIC_DEPLOY_PROVIDER: 'bunny',
  STATIC_DEPLOY_ENV: 'preview',
  STATIC_OUTPUT_DIR: 'apps/frontend/.output/public',
  STATIC_MEDIA_SOURCE_BASE_URL: 'http://cms.my-website.localhost',
};

async function main() {
  const deployEnv = await loadDeployEnv();
  const config = { ...defaultConfig, ...deployEnv };
  const outputDir = path.resolve(repoRoot, config.STATIC_OUTPUT_DIR);

  await assertDirectory(outputDir);

  const files = await listFiles(outputDir);
  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  const localMediaReferences = await findLocalMediaReferences(files, {
    outputDir,
    sourceBaseUrl: config.STATIC_MEDIA_SOURCE_BASE_URL,
  });

  printPlan({
    config,
    outputDir,
    files,
    totalBytes,
    localMediaReferences,
  });
}

async function loadDeployEnv() {
  const fileEnv = await readEnvFileIfPresent(deployEnvPath);
  const deployEnv = { ...fileEnv };

  for (const key of Object.keys(defaultConfig)) {
    if (process.env[key] !== undefined) {
      deployEnv[key] = process.env[key];
    }
  }

  for (const key of Object.keys(process.env)) {
    if (
      key.startsWith('STATIC_') ||
      key.startsWith('BUNNY_') ||
      key.startsWith('CLOUDFLARE_')
    ) {
      deployEnv[key] = process.env[key];
    }
  }

  return deployEnv;
}

async function readEnvFileIfPresent(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');

    return parseEnv(content);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
}

function parseEnv(content) {
  const env = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();

    if (!key) {
      continue;
    }

    env[key] = stripEnvQuotes(rawValue);
  }

  return env;
}

function stripEnvQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

async function assertDirectory(directoryPath) {
  try {
    const directoryStat = await stat(directoryPath);

    if (!directoryStat.isDirectory()) {
      throw new Error(`${directoryPath} is not a directory`);
    }
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(
        `Static output was not found at ${directoryPath}. Run corepack pnpm static:generate first.`,
      );
    }

    throw error;
  }
}

async function listFiles(directoryPath) {
  const files = [];

  await walkDirectory(directoryPath, async (filePath, fileStat) => {
    files.push({
      path: filePath,
      relativePath: path
        .relative(directoryPath, filePath)
        .replaceAll('\\', '/'),
      size: fileStat.size,
    });
  });

  return files.sort((first, second) =>
    first.relativePath.localeCompare(second.relativePath),
  );
}

async function walkDirectory(directoryPath, onFile) {
  const entries = await readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      await walkDirectory(entryPath, onFile);
      continue;
    }

    if (entry.isFile()) {
      await onFile(entryPath, await stat(entryPath));
    }
  }
}

async function findLocalMediaReferences(files, options) {
  const sourceHost = safeHost(options.sourceBaseUrl);
  const matches = [];

  for (const file of files) {
    const extension = path.extname(file.path).toLowerCase();

    if (!textExtensions.has(extension)) {
      continue;
    }

    const content = await readFile(file.path, 'utf8');
    const fileMatches = findUrlMatches(content).filter((url) => {
      const host = safeHost(url);

      return (
        host === sourceHost ||
        host === 'cms.my-website.localhost' ||
        host === '127.0.0.1:8080' ||
        host === 'localhost'
      );
    });

    if (fileMatches.length) {
      matches.push({
        file: file.relativePath,
        urls: [...new Set(fileMatches)].slice(0, 5),
      });
    }
  }

  return matches;
}

function findUrlMatches(content) {
  const matches = content.matchAll(/https?:\/\/[^"'()<>\s\\]+/g);

  return [...matches].map(([url]) => url);
}

function safeHost(url) {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
}

function printPlan({
  config,
  outputDir,
  files,
  totalBytes,
  localMediaReferences,
}) {
  console.log('Static deploy plan');
  console.log('');
  console.log(`Provider: ${config.STATIC_DEPLOY_PROVIDER}`);
  console.log(`Environment: ${config.STATIC_DEPLOY_ENV}`);
  console.log(`Output: ${path.relative(repoRoot, outputDir)}`);
  console.log(`Files: ${files.length}`);
  console.log(`Total size: ${formatBytes(totalBytes)}`);
  console.log('');

  printProviderPlan(config);
  printFileSummary(files);
  printMediaReferenceSummary(config, localMediaReferences);

  console.log('');
  console.log(
    'No files were uploaded. This command is a dry-run planning tool.',
  );
}

function printProviderPlan(config) {
  if (config.STATIC_DEPLOY_PROVIDER === 'bunny') {
    const storageHost = config.BUNNY_STORAGE_HOST || 'storage.bunnycdn.com';
    const storageZone = config.BUNNY_STORAGE_ZONE || '(missing)';
    const pathPrefix = trimSlashes(config.BUNNY_STATIC_PATH_PREFIX || '');
    const targetPath = pathPrefix ? `/${pathPrefix}/` : '/';

    console.log('Bunny target');
    console.log(`Storage API host: ${storageHost}`);
    console.log(`Storage zone: ${storageZone}`);
    console.log(`Upload path: ${targetPath}`);
    console.log(
      `Storage access key: ${config.BUNNY_STORAGE_ACCESS_KEY ? '(set)' : '(missing)'}`,
    );
    console.log(
      `Pull Zone URL: ${config.BUNNY_PULL_ZONE_URL || '(not configured)'}`,
    );
    console.log(
      `Purge API key: ${config.BUNNY_PURGE_API_KEY ? '(set)' : '(missing)'}`,
    );
    console.log('');

    return;
  }

  if (config.STATIC_DEPLOY_PROVIDER === 'cloudflare') {
    console.log('Cloudflare Pages target');
    console.log(
      `Account ID: ${config.CLOUDFLARE_ACCOUNT_ID ? '(set)' : '(missing)'}`,
    );
    console.log(
      `Project name: ${config.CLOUDFLARE_PROJECT_NAME || '(missing)'}`,
    );
    console.log(
      `API token: ${config.CLOUDFLARE_API_TOKEN ? '(set)' : '(missing)'}`,
    );
    console.log('');

    return;
  }

  console.log('Provider target');
  console.log('No provider-specific plan exists yet for this provider.');
  console.log('');
}

function printFileSummary(files) {
  const extensionSummary = new Map();

  for (const file of files) {
    const extension = path.extname(file.path).toLowerCase() || '(none)';
    const current = extensionSummary.get(extension) ?? { count: 0, bytes: 0 };
    current.count += 1;
    current.bytes += file.size;
    extensionSummary.set(extension, current);
  }

  console.log('Largest file groups');

  for (const [extension, summary] of [...extensionSummary.entries()]
    .sort((first, second) => second[1].bytes - first[1].bytes)
    .slice(0, 10)) {
    console.log(
      `${extension}: ${summary.count} files, ${formatBytes(summary.bytes)}`,
    );
  }

  console.log('');
}

function printMediaReferenceSummary(config, matches) {
  console.log('CMS/media references');

  if (!matches.length) {
    console.log(
      'No local CMS media references detected in generated text files.',
    );
    return;
  }

  console.log(
    `${matches.length} generated text files still reference local CMS URLs.`,
  );
  console.log(
    `Source base: ${config.STATIC_MEDIA_SOURCE_BASE_URL || '(not configured)'}`,
  );
  console.log(
    `Public media base: ${config.STATIC_MEDIA_BASE_URL || '(not configured)'}`,
  );

  for (const match of matches.slice(0, 10)) {
    console.log(`- ${match.file}`);

    for (const url of match.urls) {
      console.log(`  ${url}`);
    }
  }

  if (matches.length > 10) {
    console.log(`...and ${matches.length - 10} more files.`);
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

function trimSlashes(value) {
  return value.replace(/^\/+|\/+$/g, '');
}

await main();
