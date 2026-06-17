import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
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

const contentTypes = new Map([
  ['.avif', 'image/avif'],
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.mp3', 'audio/mpeg'],
  ['.mp4', 'video/mp4'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webm', 'video/webm'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

const localAssetPrefixes = [
  '/_nuxt/',
  '/apple-touch-icon',
  '/favicon',
  '/fonts/',
  '/temp-editorial-images/',
];

const defaultConfig = {
  STATIC_DEPLOY_DRY_RUN: '1',
  STATIC_DEPLOY_ENV: 'preview',
  STATIC_MEDIA_BASE_URL: '',
  STATIC_MEDIA_LOCAL_ROOT: 'apps/cms/wp-content/uploads',
  STATIC_MEDIA_SOURCE_BASE_URL: 'http://cms.my-website.localhost',
  STATIC_MEDIA_STORAGE_PREFIX: 'media',
  STATIC_OUTPUT_DIR: 'apps/frontend/.output/public',
  BUNNY_STORAGE_HOST: 'storage.bunnycdn.com',
  BUNNY_STATIC_PATH_PREFIX: '',
  BUNNY_PURGE_API_KEY: '',
  BUNNY_PULL_ZONE_ID: '',
};

const wpUploadsPathSegment = '/wp-content/uploads/';

async function main() {
  const deployEnv = await loadDeployEnv();
  const config = { ...defaultConfig, ...deployEnv };
  const outputDir = path.resolve(repoRoot, config.STATIC_OUTPUT_DIR);
  const dryRun = isEnabled(config.STATIC_DEPLOY_DRY_RUN);

  await assertDirectory(outputDir);

  const files = await listFiles(outputDir);
  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  const outputMarker = await inspectStaticOutput(files);
  const missingLocalAssets = await findMissingLocalAssetReferences(
    files,
    outputDir,
  );
  const deployTarget = getBunnyDeployTarget(config);
  const mediaPlan = await buildMediaPlan(files, {
    config,
    outputDir,
  });

  printHeader({
    config,
    deployTarget,
    dryRun,
    files,
    outputDir,
    outputMarker,
    mediaPlan,
    totalBytes,
  });
  printMissingLocalAssetSummary(missingLocalAssets);

  if (!outputMarker.hasStaticGeneratedTrue) {
    const message =
      'Static output marker is missing or false. Run corepack pnpm static:generate before uploading to Bunny.';

    if (!dryRun) {
      throw new Error(message);
    }

    console.log(`Dry-run warning: ${message}`);
    console.log('');
  }

  if (missingLocalAssets.length) {
    throw new Error(
      'Static output references missing local assets. Run corepack pnpm static:generate before uploading to Bunny.',
    );
  }

  if (dryRun) {
    printDryRunSample(files, deployTarget);
    printMediaDryRunSummary(mediaPlan, deployTarget);
    console.log(
      'No files were uploaded. Set STATIC_DEPLOY_DRY_RUN=0 to upload.',
    );
    return;
  }

  assertBunnyCredentials(config);
  assertMediaPlan(mediaPlan);

  if (mediaPlan.items.length) {
    console.log('Uploading referenced media...');

    for (const [index, item] of mediaPlan.items.entries()) {
      await uploadLocalFileToBunny(
        {
          path: item.localPath,
          relativePath: item.destinationPath,
        },
        deployTarget,
        config,
      );

      if ((index + 1) % 25 === 0 || index + 1 === mediaPlan.items.length) {
        console.log(`Uploaded media ${index + 1}/${mediaPlan.items.length}`);
      }
    }

    console.log('');

    console.log('Rewriting generated media URLs...');
    await rewriteGeneratedMediaUrls(mediaPlan);
    console.log(
      `Rewrote media URLs in ${mediaPlan.changedFiles.length} files.`,
    );
    console.log('');
  }

  const deployFiles = await listFiles(outputDir);

  for (const [index, file] of deployFiles.entries()) {
    await uploadLocalFileToBunny(file, deployTarget, config);

    if ((index + 1) % 50 === 0 || index + 1 === deployFiles.length) {
      console.log(`Uploaded static ${index + 1}/${deployFiles.length} files`);
    }
  }

  console.log('');
  console.log('Bunny upload complete.');
  console.log('');
  await purgeBunnyPullZoneCache(config);
}

async function purgeBunnyPullZoneCache(config) {
  const { BUNNY_PURGE_API_KEY, BUNNY_PULL_ZONE_ID } = config;

  if (!BUNNY_PURGE_API_KEY) {
    console.log('Skipping CDN cache purge: BUNNY_PURGE_API_KEY not set.');
    return;
  }

  if (!BUNNY_PULL_ZONE_ID) {
    console.log('Skipping CDN cache purge: BUNNY_PULL_ZONE_ID not set.');
    return;
  }

  console.log(`Purging Bunny CDN cache for pull zone ${BUNNY_PULL_ZONE_ID}...`);

  const response = await fetch(
    `https://api.bunny.net/pullzone/${BUNNY_PULL_ZONE_ID}/purgeCache`,
    {
      method: 'POST',
      headers: {
        AccessKey: BUNNY_PURGE_API_KEY,
        'content-type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Bunny cache purge failed: ${response.status} ${response.statusText} ${text.slice(0, 200)}`,
    );
  }

  console.log('Bunny CDN cache purged.');
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

async function inspectStaticOutput(files) {
  let hasStaticGeneratedTrue = false;
  let hasStaticGeneratedFalse = false;

  for (const file of files) {
    const extension = path.extname(file.path).toLowerCase();

    if (!textExtensions.has(extension)) {
      continue;
    }

    const content = await readFile(file.path, 'utf8');

    if (
      content.match(/(?:staticGenerated|["']staticGenerated["'])\s*:\s*true/)
    ) {
      hasStaticGeneratedTrue = true;
    }

    if (
      content.match(/(?:staticGenerated|["']staticGenerated["'])\s*:\s*false/)
    ) {
      hasStaticGeneratedFalse = true;
    }
  }

  return {
    hasStaticGeneratedFalse,
    hasStaticGeneratedTrue,
  };
}

async function buildMediaPlan(files, { config, outputDir }) {
  const sourceHost = safeHost(config.STATIC_MEDIA_SOURCE_BASE_URL);
  const localRoot = path.resolve(repoRoot, config.STATIC_MEDIA_LOCAL_ROOT);
  const publicBaseUrl = getPublicMediaBaseUrl(config);
  const storagePrefix = trimSlashes(config.STATIC_MEDIA_STORAGE_PREFIX || '');
  const references = new Map();
  const fileContents = new Map();

  for (const file of files) {
    const extension = path.extname(file.path).toLowerCase();

    if (!textExtensions.has(extension)) {
      continue;
    }

    const content = await readFile(file.path, 'utf8');
    fileContents.set(file.relativePath, {
      content,
      path: file.path,
    });

    for (const url of new Set(findUrlMatches(content))) {
      const parsedUrl = safeUrl(url);
      const relativeUploadPath = getMediaRelativePath({
        parsedUrl,
        publicBaseUrl,
        sourceHost,
        url,
      });

      if (!relativeUploadPath) {
        continue;
      }

      addMediaReference({
        references,
        relativeUploadPath,
        sourceFile: file.relativePath,
        sourceUrl: url,
      });
    }
  }

  const items = [];

  for (const reference of references.values()) {
    const relativeUploadPath = reference.relativeUploadPath;
    const localPath = safeResolve(localRoot, relativeUploadPath);
    const destinationPath = [storagePrefix, relativeUploadPath]
      .filter(Boolean)
      .join('/');
    const publicUrl = publicBaseUrl
      ? joinUrlPath(publicBaseUrl, relativeUploadPath)
      : '';
    const localFile = localPath ? await getLocalFile(localPath) : null;

    items.push({
      destinationPath,
      exists: Boolean(localFile),
      files: [...reference.files].sort(),
      localPath,
      publicUrl,
      relativeUploadPath,
      size: localFile?.size ?? 0,
      sourceUrls: [...reference.sourceUrls].sort(),
    });
  }

  return {
    changedFiles: [],
    fileContents,
    items: items.sort((first, second) =>
      first.relativeUploadPath.localeCompare(second.relativeUploadPath),
    ),
    localRoot,
    outputDir,
    publicBaseUrl,
    storagePrefix,
  };
}

async function getLocalFile(filePath) {
  try {
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      return null;
    }

    return fileStat;
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

async function findMissingLocalAssetReferences(files, outputDir) {
  const missingByAsset = new Map();

  for (const file of files) {
    const extension = path.extname(file.path).toLowerCase();

    if (!textExtensions.has(extension)) {
      continue;
    }

    const content = await readFile(file.path, 'utf8');

    for (const assetPath of findLocalAssetReferences(content)) {
      const relativeAssetPath = decodeUrlPath(assetPath).replace(/^\/+/, '');
      const localAssetPath = safeResolve(outputDir, relativeAssetPath);

      if (!localAssetPath || !(await isExistingFile(localAssetPath))) {
        addMissingLocalAssetReference(
          missingByAsset,
          assetPath,
          file.relativePath,
        );
      }
    }
  }

  return [...missingByAsset.entries()]
    .map(([assetPath, sourceFiles]) => ({
      assetPath,
      files: [...sourceFiles].sort(),
    }))
    .sort((first, second) => first.assetPath.localeCompare(second.assetPath));
}

async function isExistingFile(filePath) {
  const file = await getLocalFile(filePath);

  return Boolean(file);
}

function addMissingLocalAssetReference(missingByAsset, assetPath, sourceFile) {
  const sourceFiles = missingByAsset.get(assetPath) ?? new Set();

  sourceFiles.add(sourceFile);
  missingByAsset.set(assetPath, sourceFiles);
}

function getBunnyDeployTarget(config) {
  const storageHost = stripProtocol(
    config.BUNNY_STORAGE_HOST || defaultConfig.BUNNY_STORAGE_HOST,
  );
  const storageZone = config.BUNNY_STORAGE_ZONE || '';
  const pathPrefix = trimSlashes(config.BUNNY_STATIC_PATH_PREFIX || '');

  return {
    pathPrefix,
    storageHost,
    storageZone,
  };
}

function printHeader({
  config,
  deployTarget,
  dryRun,
  files,
  outputDir,
  outputMarker,
  mediaPlan,
  totalBytes,
}) {
  console.log('Bunny static deploy');
  console.log('');
  console.log(`Environment: ${config.STATIC_DEPLOY_ENV}`);
  console.log(`Mode: ${dryRun ? 'dry run' : 'upload'}`);
  console.log(`Output: ${path.relative(repoRoot, outputDir)}`);
  console.log(`Files: ${files.length}`);
  console.log(`Total size: ${formatBytes(totalBytes)}`);
  console.log(`Storage API host: ${deployTarget.storageHost}`);
  console.log(`Storage zone: ${deployTarget.storageZone || '(missing)'}`);
  console.log(
    `Upload prefix: ${deployTarget.pathPrefix ? `/${deployTarget.pathPrefix}/` : '/'}`,
  );
  console.log(
    `Storage access key: ${config.BUNNY_STORAGE_ACCESS_KEY ? '(set)' : '(missing)'}`,
  );
  console.log(
    `Static output marker: ${
      outputMarker.hasStaticGeneratedTrue
        ? 'staticGenerated:true'
        : outputMarker.hasStaticGeneratedFalse
          ? 'staticGenerated:false'
          : '(missing)'
    }`,
  );
  console.log(`Media references: ${mediaPlan.items.length}`);
  console.log(`Public media base: ${mediaPlan.publicBaseUrl || '(missing)'}`);
  console.log('');
}

function printMissingLocalAssetSummary(missingLocalAssets) {
  console.log('Local generated asset references');

  if (!missingLocalAssets.length) {
    console.log('All generated local asset references exist in output.');
    console.log('');
    return;
  }

  console.log(
    `${missingLocalAssets.length} generated local asset references are missing from output.`,
  );

  for (const reference of missingLocalAssets.slice(0, 12)) {
    console.log(`- ${reference.assetPath}`);

    for (const file of reference.files.slice(0, 4)) {
      console.log(`  ${file}`);
    }

    if (reference.files.length > 4) {
      console.log(`  ...and ${reference.files.length - 4} more files`);
    }
  }

  if (missingLocalAssets.length > 12) {
    console.log(
      `...and ${missingLocalAssets.length - 12} more missing asset references.`,
    );
  }

  console.log('');
}

function printDryRunSample(files, deployTarget) {
  console.log('Sample upload targets');

  for (const file of files.slice(0, 10)) {
    console.log(`- ${file.relativePath}`);
    console.log(`  ${buildBunnyStorageUrl(file.relativePath, deployTarget)}`);
  }

  if (files.length > 10) {
    console.log(`...and ${files.length - 10} more files.`);
  }

  console.log('');
}

function printMediaDryRunSummary(mediaPlan, deployTarget) {
  const foundItems = mediaPlan.items.filter((item) => item.exists);
  const missingItems = mediaPlan.items.filter((item) => !item.exists);
  const totalBytes = foundItems.reduce((total, item) => total + item.size, 0);

  console.log('Media upload/rewrite plan');
  console.log(
    `Local uploads root: ${path.relative(repoRoot, mediaPlan.localRoot)}`,
  );
  console.log(`Storage prefix: ${mediaPlan.storagePrefix || '(none)'}`);
  console.log(`Public media base: ${mediaPlan.publicBaseUrl || '(missing)'}`);
  console.log(`Unique media references: ${mediaPlan.items.length}`);
  console.log(`Local files found: ${foundItems.length}`);
  console.log(`Local files missing: ${missingItems.length}`);
  console.log(`Referenced media size: ${formatBytes(totalBytes)}`);

  if (!mediaPlan.items.length) {
    console.log('');
    return;
  }

  console.log('');
  console.log('Sample media upload targets');

  for (const item of mediaPlan.items.slice(0, 5)) {
    console.log(`- ${item.relativeUploadPath}`);
    console.log(
      `  ${buildBunnyStorageUrl(item.destinationPath, deployTarget)}`,
    );
    console.log(`  public: ${item.publicUrl || '(missing)'}`);
  }

  if (mediaPlan.items.length > 5) {
    console.log(`...and ${mediaPlan.items.length - 5} more media files.`);
  }

  if (missingItems.length) {
    console.log('');
    console.log('Missing media files');

    for (const item of missingItems.slice(0, 10)) {
      console.log(`- ${item.relativeUploadPath}`);
    }
  }

  console.log('');
}

function assertBunnyCredentials(config) {
  const missing = [];

  if (!config.BUNNY_STORAGE_ZONE) {
    missing.push('BUNNY_STORAGE_ZONE');
  }

  if (!config.BUNNY_STORAGE_ACCESS_KEY) {
    missing.push('BUNNY_STORAGE_ACCESS_KEY');
  }

  if (missing.length) {
    throw new Error(
      `Missing Bunny deploy configuration: ${missing.join(', ')}.`,
    );
  }
}

function assertMediaPlan(mediaPlan) {
  if (mediaPlan.items.length && !mediaPlan.publicBaseUrl) {
    throw new Error(
      'Missing public media base URL. Set STATIC_MEDIA_BASE_URL or BUNNY_PULL_ZONE_URL before uploading media.',
    );
  }

  const missingItems = mediaPlan.items.filter((item) => !item.exists);

  if (missingItems.length) {
    throw new Error(
      `Missing ${missingItems.length} local media files. Run corepack pnpm inspect:static for details.`,
    );
  }
}

async function rewriteGeneratedMediaUrls(mediaPlan) {
  const replacements = new Map();

  for (const item of mediaPlan.items) {
    for (const sourceUrl of item.sourceUrls) {
      if (sourceUrl !== item.publicUrl) {
        for (const replacement of buildUrlReplacementVariants(
          sourceUrl,
          item.publicUrl,
        )) {
          replacements.set(replacement.source, replacement.target);
        }
      }
    }
  }

  for (const [relativePath, file] of mediaPlan.fileContents.entries()) {
    let nextContent = file.content;

    for (const [sourceUrl, publicUrl] of replacements.entries()) {
      nextContent = nextContent.replaceAll(sourceUrl, publicUrl);
    }

    if (nextContent === file.content) {
      continue;
    }

    await writeFile(file.path, nextContent);
    mediaPlan.changedFiles.push(relativePath);
  }
}

function buildUrlReplacementVariants(sourceUrl, publicUrl) {
  return [
    {
      source: sourceUrl,
      target: publicUrl,
    },
    {
      source: escapeUrlSlashes(sourceUrl),
      target: escapeUrlSlashes(publicUrl),
    },
    {
      source: escapeUrlSlashesForNuxtPayload(sourceUrl),
      target: escapeUrlSlashesForNuxtPayload(publicUrl),
    },
  ];
}

function escapeUrlSlashes(url) {
  return url.replaceAll('/', '\\/');
}

function escapeUrlSlashesForNuxtPayload(url) {
  return url.replaceAll('/', '\\u002F');
}

async function uploadLocalFileToBunny(file, deployTarget, config) {
  const body = await readFile(file.path);
  const response = await fetch(
    buildBunnyStorageUrl(file.relativePath, deployTarget),
    {
      body,
      headers: {
        AccessKey: config.BUNNY_STORAGE_ACCESS_KEY,
        'content-type': contentTypeForFile(file.path),
      },
      method: 'PUT',
    },
  );

  if (!response.ok) {
    const responseText = await response.text();

    throw new Error(
      `Bunny upload failed for ${file.relativePath}: ${response.status} ${response.statusText} ${responseText.slice(0, 300)}`,
    );
  }
}

function buildBunnyStorageUrl(relativePath, deployTarget) {
  const pathParts = [
    deployTarget.storageZone || '(missing-zone)',
    deployTarget.pathPrefix,
    relativePath,
  ]
    .filter(Boolean)
    .join('/');

  return `https://${deployTarget.storageHost}/${encodePath(pathParts)}`;
}

function encodePath(urlPath) {
  return urlPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function contentTypeForFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  return contentTypes.get(extension) ?? 'application/octet-stream';
}

function findUrlMatches(content) {
  const normalizedContent = normalizeEscapedUrlText(content);
  const matches = normalizedContent.matchAll(/https?:\/\/[^"'()<>\s\\]+/g);

  return [...matches].map(([url]) => url);
}

function findLocalAssetReferences(content) {
  const normalizedContent = normalizeEscapedUrlText(content);
  const references = new Set();
  const patterns = [
    /\b(?:href|src)=["']([^"']+)["']/g,
    /\burl\(["']?([^"')]+)["']?\)/g,
    /\bimport\(["']([^"']+)["']\)/g,
    /["'](\/(?:_nuxt\/|apple-touch-icon|favicon|fonts\/|temp-editorial-images\/)[^"']*)["']/g,
  ];

  for (const pattern of patterns) {
    for (const match of normalizedContent.matchAll(pattern)) {
      const assetPath = pathWithoutQueryOrHash(match[1] ?? '');

      if (isRequiredLocalAsset(assetPath)) {
        references.add(assetPath);
      }
    }
  }

  return references;
}

function normalizeEscapedUrlText(content) {
  return content.replace(/\\u002[fF]/g, '/').replace(/\\\//g, '/');
}

function pathWithoutQueryOrHash(value) {
  return value.split('#')[0]?.split('?')[0] ?? '';
}

function isRequiredLocalAsset(assetPath) {
  if (['/_nuxt/', '/fonts/', '/temp-editorial-images/'].includes(assetPath)) {
    return false;
  }

  return localAssetPrefixes.some((prefix) => assetPath.startsWith(prefix));
}

function safeUrl(url) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function safeHost(url) {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
}

function isLocalCmsHost(host, sourceHost) {
  return (
    host === sourceHost ||
    host === 'cms.my-website.localhost' ||
    host === 'qa.cms.my-website.localhost' ||
    host === 'dev.cms.my-website.localhost' ||
    host === '127.0.0.1:8080' ||
    host === '127.0.0.1:8081'
  );
}

function isWordPressUploadUrl(url) {
  return url.pathname.includes(wpUploadsPathSegment);
}

function addMediaReference({
  references,
  relativeUploadPath,
  sourceFile,
  sourceUrl,
}) {
  const current = references.get(relativeUploadPath) ?? {
    files: new Set(),
    relativeUploadPath,
    sourceUrls: new Set(),
  };

  current.files.add(sourceFile);
  current.sourceUrls.add(sourceUrl);
  references.set(relativeUploadPath, current);
}

function getMediaRelativePath({ parsedUrl, publicBaseUrl, sourceHost, url }) {
  if (!parsedUrl) {
    return '';
  }

  if (
    isLocalCmsHost(parsedUrl.host, sourceHost) &&
    isWordPressUploadUrl(parsedUrl)
  ) {
    return getUploadRelativePath(url);
  }

  if (publicBaseUrl && isUrlUnderBase(parsedUrl, publicBaseUrl)) {
    return getRelativePathUnderBase(parsedUrl, publicBaseUrl);
  }

  return '';
}

function getUploadRelativePath(url) {
  const parsedUrl = safeUrl(url);

  if (!parsedUrl) {
    return '';
  }

  const startIndex = parsedUrl.pathname.indexOf(wpUploadsPathSegment);
  const encodedPath = parsedUrl.pathname.slice(
    startIndex + wpUploadsPathSegment.length,
  );

  return decodeUrlPath(encodedPath).replace(/^\/+/, '');
}

function isUrlUnderBase(url, baseUrl) {
  const parsedBaseUrl = safeUrl(baseUrl);

  if (!parsedBaseUrl || url.origin !== parsedBaseUrl.origin) {
    return false;
  }

  const basePath = stripTrailingSlash(parsedBaseUrl.pathname);

  return url.pathname === basePath || url.pathname.startsWith(`${basePath}/`);
}

function getRelativePathUnderBase(url, baseUrl) {
  const parsedBaseUrl = safeUrl(baseUrl);

  if (!parsedBaseUrl) {
    return '';
  }

  const basePath = stripTrailingSlash(parsedBaseUrl.pathname);
  const encodedPath = url.pathname.slice(basePath.length).replace(/^\/+/, '');

  return decodeUrlPath(encodedPath).replace(/^\/+/, '');
}

function decodeUrlPath(urlPath) {
  try {
    return decodeURIComponent(urlPath);
  } catch {
    return urlPath;
  }
}

function safeResolve(root, relativePath) {
  const resolvedPath = path.resolve(root, relativePath);
  const rootWithSeparator = root.endsWith(path.sep)
    ? root
    : `${root}${path.sep}`;

  if (!resolvedPath.startsWith(rootWithSeparator)) {
    return null;
  }

  return resolvedPath;
}

function getPublicMediaBaseUrl(config) {
  if (
    config.STATIC_MEDIA_BASE_URL &&
    !config.STATIC_MEDIA_BASE_URL.includes('example.com')
  ) {
    return stripTrailingSlash(config.STATIC_MEDIA_BASE_URL);
  }

  if (!config.BUNNY_PULL_ZONE_URL) {
    return '';
  }

  return joinUrlPath(
    config.BUNNY_PULL_ZONE_URL,
    trimSlashes(config.STATIC_MEDIA_STORAGE_PREFIX || ''),
  );
}

function isEnabled(value) {
  const normalizedValue = String(value ?? '')
    .trim()
    .toLowerCase();

  return !['0', 'false', 'no', 'off'].includes(normalizedValue);
}

function stripProtocol(value) {
  return value.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

function trimSlashes(value) {
  return value.replace(/^\/+|\/+$/g, '');
}

function stripTrailingSlash(value) {
  return value.replace(/\/+$/g, '');
}

function joinUrlPath(baseUrl, relativePath) {
  const base = stripTrailingSlash(baseUrl);
  const pathSuffix = trimSlashes(relativePath);

  if (!pathSuffix) {
    return base;
  }

  return `${base}/${pathSuffix
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`;
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

await main();
