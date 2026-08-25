import { createHash } from 'node:crypto';
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
  STATIC_DEPLOY_FORCE: '0',
  STATIC_MEDIA_BASE_URL: '',
  STATIC_MEDIA_LOCAL_ROOT: 'apps/cms/wp-content/uploads',
  STATIC_MEDIA_SOURCE_BASE_URL: 'http://cms.my-website.localhost',
  STATIC_MEDIA_STORAGE_PREFIX: 'media',
  STATIC_OUTPUT_DIR: 'apps/frontend/.output/public',
  STATIC_PUBLIC_SITE_URL: '',
  BUNNY_STORAGE_HOST: 'storage.bunnycdn.com',
  BUNNY_STATIC_PATH_PREFIX: '',
  BUNNY_PURGE_API_KEY: '',
  BUNNY_PULL_ZONE_URL: '',
  BUNNY_PULL_ZONE_ID: '',
};

const wpUploadsPathSegment = '/wp-content/uploads/';

async function main() {
  const deployEnv = await loadDeployEnv();
  const config = { ...defaultConfig, ...deployEnv };
  const outputDir = path.resolve(repoRoot, config.STATIC_OUTPUT_DIR);
  const dryRun = isEnabled(config.STATIC_DEPLOY_DRY_RUN);
  const forceUpload =
    process.argv.includes('--force') || isEnabled(config.STATIC_DEPLOY_FORCE);

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

  assertProductionTarget(config);

  printHeader({
    config,
    deployTarget,
    dryRun,
    forceUpload,
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

  const remoteIndex = forceUpload
    ? null
    : await listBunnyStorageFiles(deployTarget, config);

  if (forceUpload) {
    console.log(
      'Force upload enabled; bypassing unchanged-media checks for this deploy.',
    );
    console.log('');
  }

  if (mediaPlan.items.length) {
    console.log('Uploading referenced media...');

    let skippedMedia = 0;
    pooledProgressLabel = 'media';
    pooledProgressEvery = 25;

    await runPooled(mediaPlan.items, UPLOAD_CONCURRENCY, async (item) => {
      const file = { path: item.localPath, relativePath: item.destinationPath };

      if (await isAlreadyUploaded(file, remoteIndex)) {
        skippedMedia += 1;

        return;
      }

      await uploadWithRetry(file, deployTarget, config);
    });

    if (skippedMedia) {
      console.log(`Skipped ${skippedMedia} unchanged media file(s).`);
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

  // Not skipped against the remote index: rewriteGeneratedMediaUrls mutates
  // generated files in place after the listing was taken, and generated output
  // changes on nearly every build anyway, so the win is small and the staleness
  // risk real. Revisit as D4.
  pooledProgressLabel = 'static';
  pooledProgressEvery = 50;

  await runPooled(deployFiles, UPLOAD_CONCURRENCY, async (file) => {
    await uploadWithRetry(file, deployTarget, config);
  });

  console.log('');
  console.log('Bunny upload complete.');
  console.log('');
  await purgeBunnyPullZoneCache(config);
  await verifyBunnyDeployment(config, outputDir);
}

async function purgeBunnyPullZoneCache(config) {
  const { BUNNY_PURGE_API_KEY, BUNNY_PULL_ZONE_ID } = config;

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

async function verifyBunnyDeployment(config, outputDir) {
  const publicBaseUrl = stripTrailingSlash(config.BUNNY_PULL_ZONE_URL);
  const writingDetailPath = await findRepresentativeRoute(
    outputDir,
    'writing',
  );
  const caseStudyDetailPath = await findRepresentativeRoute(
    outputDir,
    'case-studies',
  );
  const verificationFiles = [
    { localPath: 'index.html', publicPath: '/', requireHtmlRevalidation: true },
    {
      localPath: 'index.html',
      publicPath: '/index.html',
      requireHtmlRevalidation: true,
    },
    {
      localPath: 'about/index.html',
      publicPath: '/about',
      requireHtmlRevalidation: true,
    },
    {
      localPath: 'writing/index.html',
      publicPath: '/writing',
      requireHtmlRevalidation: true,
    },
    {
      localPath: `${writingDetailPath}/index.html`,
      publicPath: `/${writingDetailPath}`,
      requireHtmlRevalidation: true,
    },
    {
      localPath: `${caseStudyDetailPath}/index.html`,
      publicPath: `/${caseStudyDetailPath}`,
      requireHtmlRevalidation: true,
    },
    { localPath: 'robots.txt', publicPath: '/robots.txt' },
    { localPath: 'sitemap.xml', publicPath: '/sitemap.xml' },
    { localPath: 'llms.txt', publicPath: '/llms.txt' },
  ];

  console.log('');
  console.log('Verifying public Bunny output...');

  for (const verificationFile of verificationFiles) {
    const localContent = await readFile(
      path.join(outputDir, verificationFile.localPath),
    );
    const publicUrl = `${publicBaseUrl}${verificationFile.publicPath}`;
    const cacheControl = await verifyBunnyPublicFile({
      expectedHash: hashContent(localContent),
      publicUrl,
      requireHtmlRevalidation: verificationFile.requireHtmlRevalidation,
    });

    const cacheSummary = cacheControl ? ` (${cacheControl})` : '';
    console.log(
      `${verificationFile.publicPath} matches local output${cacheSummary}.`,
    );
  }

  await verifyRepresentativeMedia({ outputDir, publicBaseUrl });
  await verifyUnknownRoute(publicBaseUrl);

  if (config.STATIC_DEPLOY_ENV === 'production') {
    await verifyCanonicalRedirect(publicBaseUrl);
  }

  console.log('Bunny public output verified.');
}

async function findRepresentativeRoute(outputDir, routeGroup) {
  const entries = await readdir(path.join(outputDir, routeGroup), {
    withFileTypes: true,
  });
  const route = entries.find((entry) => entry.isDirectory());

  if (!route) {
    throw new Error(`No generated ${routeGroup} detail route is available.`);
  }

  return `${routeGroup}/${route.name}`;
}

async function verifyBunnyPublicFile({
  expectedHash,
  publicUrl,
  requireHtmlRevalidation = false,
}) {
  const maxAttempts = 6;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(publicUrl, {
        headers: {
          'cache-control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const publicContent = Buffer.from(await response.arrayBuffer());
      const actualHash = hashContent(publicContent);

      if (actualHash !== expectedHash) {
        throw new Error('public HTML does not match the uploaded index.html');
      }

      const cacheControl = response.headers.get('cache-control') || '';

      if (requireHtmlRevalidation && !htmlRequiresRevalidation(cacheControl)) {
        throw new Error(
          `HTML must require browser revalidation, received Cache-Control: ${cacheControl || '(missing)'}`,
        );
      }

      return cacheControl;
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        await wait(1500);
      }
    }
  }

  throw new Error(
    `Bunny deploy verification failed for ${publicUrl}: ${lastError?.message || 'unknown error'}.`,
  );
}

async function verifyRepresentativeMedia({ outputDir, publicBaseUrl }) {
  const html = await readFile(path.join(outputDir, 'index.html'), 'utf8');
  const mediaBaseUrl = `${publicBaseUrl}/media/`;
  const mediaUrl = findUrlMatches(html).find((url) =>
    url.startsWith(mediaBaseUrl),
  );

  if (!mediaUrl) {
    throw new Error('No same-origin media URL was found for public verification.');
  }

  await verifyPublicStatus(mediaUrl, (response) => response.ok);
  console.log(`${new URL(mediaUrl).pathname} returned 200.`);
}

async function verifyUnknownRoute(publicBaseUrl) {
  const publicPath = '/__static-deploy-verification-missing__';
  const response = await fetchWithRetry(`${publicBaseUrl}${publicPath}`, {
    redirect: 'manual',
  });

  if (response.status !== 404) {
    throw new Error(
      `Expected ${publicPath} to return 404, received ${response.status}.`,
    );
  }

  console.log(`${publicPath} returned 404.`);
}

async function verifyCanonicalRedirect(publicBaseUrl) {
  const canonicalUrl = new URL(publicBaseUrl);

  if (!canonicalUrl.hostname.startsWith('www.')) {
    throw new Error(
      'Production public origin must use www before apex redirect verification.',
    );
  }

  const redirectPath = '/writing?deploy-verification=1';
  const apexUrl = new URL(redirectPath, canonicalUrl);
  apexUrl.hostname = canonicalUrl.hostname.slice(4);
  const response = await fetchWithRetry(apexUrl, { redirect: 'manual' });
  const expectedLocation = new URL(redirectPath, canonicalUrl).href;
  const actualLocation = response.headers.get('location');

  if (response.status !== 301 || actualLocation !== expectedLocation) {
    throw new Error(
      `Expected ${apexUrl.href} to return 301 to ${expectedLocation}, received ${response.status} to ${actualLocation || '(missing)'}.`,
    );
  }

  console.log(`Apex redirect preserves path and query (${response.status}).`);
}

async function verifyPublicStatus(publicUrl, predicate) {
  const response = await fetchWithRetry(publicUrl);

  if (!predicate(response)) {
    throw new Error(
      `Unexpected public response for ${publicUrl}: ${response.status} ${response.statusText}.`,
    );
  }
}

async function fetchWithRetry(publicUrl, options = {}) {
  const maxAttempts = 6;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fetch(publicUrl, {
        ...options,
        headers: { 'cache-control': 'no-cache', ...options.headers },
      });
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        await wait(1500);
      }
    }
  }

  throw new Error(
    `Public verification failed for ${publicUrl}: ${lastError?.message || 'unknown error'}.`,
  );
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function hashContent(content) {
  return createHash('sha256').update(content).digest('hex');
}

function htmlRequiresRevalidation(cacheControl) {
  const directives = cacheControl.toLowerCase();

  return (
    directives.includes('no-cache') ||
    directives.includes('no-store') ||
    /(?:^|,)\s*max-age=0(?:\s*(?:,|$))/.test(directives)
  );
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
  forceUpload,
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
  console.log(`Force media upload: ${forceUpload ? 'yes' : 'no'}`);
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

  if (!config.BUNNY_PURGE_API_KEY) {
    missing.push('BUNNY_PURGE_API_KEY');
  }

  if (!config.BUNNY_PULL_ZONE_ID) {
    missing.push('BUNNY_PULL_ZONE_ID');
  }

  if (!config.BUNNY_PULL_ZONE_URL) {
    missing.push('BUNNY_PULL_ZONE_URL');
  }

  if (missing.length) {
    throw new Error(
      `Missing Bunny deploy configuration: ${missing.join(', ')}.`,
    );
  }
}

function assertProductionTarget(config) {
  if (config.STATIC_DEPLOY_ENV !== 'production') {
    return;
  }

  const publicOrigin = safeUrl(config.STATIC_PUBLIC_SITE_URL)?.origin;
  const pullZoneOrigin = safeUrl(config.BUNNY_PULL_ZONE_URL)?.origin;
  const mediaOrigin = safeUrl(config.STATIC_MEDIA_BASE_URL)?.origin;

  if (
    !publicOrigin ||
    !publicOrigin.startsWith('https://') ||
    publicOrigin.includes('localhost') ||
    publicOrigin.includes('example.com')
  ) {
    throw new Error(
      'Production deploy requires STATIC_PUBLIC_SITE_URL to be a non-local HTTPS origin.',
    );
  }

  if (pullZoneOrigin !== publicOrigin) {
    throw new Error(
      'Production deploy requires BUNNY_PULL_ZONE_URL to use the canonical public origin.',
    );
  }

  if (mediaOrigin && mediaOrigin !== publicOrigin) {
    throw new Error(
      'Production deploy requires STATIC_MEDIA_BASE_URL to use the canonical public origin.',
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

// Bunny's storage API is asked what it already holds rather than trusting a
// local manifest: a manifest silently lies whenever a deploy is interrupted, a
// zone is cleared by hand, or two machines publish. Returns a Map of
// storage-relative path -> { checksum, length }, or null if the listing fails —
// in which case every file is uploaded, because skipping on incomplete
// knowledge would publish stale content.
async function listBunnyStorageFiles(deployTarget, config, directory = '') {
  const remote = new Map();

  async function walk(relativeDirectory) {
    const pathParts = [
      deployTarget.storageZone,
      deployTarget.pathPrefix,
      relativeDirectory,
    ].filter(Boolean);
    const url = `https://${deployTarget.storageHost}/${encodePath(pathParts.join('/'))}/`;
    const response = await fetch(url, {
      headers: {
        AccessKey: config.BUNNY_STORAGE_ACCESS_KEY,
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Bunny storage listing failed: ${response.status} ${response.statusText}`,
      );
    }

    for (const entry of await response.json()) {
      const entryPath = relativeDirectory
        ? `${relativeDirectory}/${entry.ObjectName}`
        : entry.ObjectName;

      if (entry.IsDirectory) {
        await walk(entryPath);

        continue;
      }

      remote.set(entryPath, {
        checksum: (entry.Checksum || '').toLowerCase(),
        length: entry.Length ?? -1,
      });
    }
  }

  try {
    await walk(directory);

    return remote;
  } catch (error) {
    console.log(
      `Could not list storage zone (${error.message}); uploading everything.`,
    );

    return null;
  }
}

// Bunny stores a SHA256 of the object. Matching it against the local file is an
// exact content comparison, so a match is safe to skip; anything else uploads.
async function isAlreadyUploaded(file, remoteIndex) {
  if (!remoteIndex) return false;

  const remote = remoteIndex.get(file.relativePath);

  if (!remote || !remote.checksum) return false;

  const body = await readFile(file.path);

  if (remote.length >= 0 && remote.length !== body.length) return false;

  return createHash('sha256').update(body).digest('hex') === remote.checksum;
}

// Uploads are latency-bound, not bandwidth-bound: each PUT is a full round trip
// to Bunny and only one file was ever in flight, so ~890 files took ~15 minutes
// with the connection mostly idle. A bounded pool keeps several in flight while
// staying polite to a shared storage API — never an unbounded Promise.all.
const UPLOAD_CONCURRENCY = 8;
// Transient faults get a few backed-off attempts. A genuine failure must still
// abort the deploy: a partially uploaded site that reports success is worse
// than a slow one.
const UPLOAD_MAX_ATTEMPTS = 4;
const UPLOAD_RETRY_BASE_MS = 500;

// Runs `worker` over `items` with at most `limit` in flight. Rejects on the
// first error, matching the previous serial behaviour of aborting the deploy.
async function runPooled(items, limit, worker) {
  let nextIndex = 0;
  let completed = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, () =>
    (async () => {
      while (true) {
        const index = nextIndex;
        nextIndex += 1;

        if (index >= items.length) return;

        await worker(items[index], index);
        completed += 1;
        reportPooledProgress(completed, items.length);
      }
    })(),
  );

  await Promise.all(runners);
}

// Progress is reported by COUNT COMPLETED, not by index: with a pool the items
// finish out of order, so an index-based message would jump around.
let pooledProgressLabel = '';
let pooledProgressEvery = 25;

function reportPooledProgress(completed, total) {
  if (completed % pooledProgressEvery === 0 || completed === total) {
    console.log(`Uploaded ${pooledProgressLabel} ${completed}/${total}`);
  }
}

function isRetryableUploadFailure(status) {
  // 429 and 5xx are transient; other 4xx are real (auth, bad path) and must
  // abort immediately rather than burning retries on a certain failure.
  return status === 429 || (status >= 500 && status <= 599);
}

async function uploadWithRetry(file, deployTarget, config) {
  let lastError;

  for (let attempt = 1; attempt <= UPLOAD_MAX_ATTEMPTS; attempt += 1) {
    try {
      await uploadLocalFileToBunny(file, deployTarget, config);

      return;
    } catch (error) {
      lastError = error;

      const retryable = error.retryable !== false;

      if (!retryable || attempt === UPLOAD_MAX_ATTEMPTS) break;

      await wait(UPLOAD_RETRY_BASE_MS * 2 ** (attempt - 1));
    }
  }

  throw lastError;
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
    const error = new Error(
      `Bunny upload failed for ${file.relativePath}: ${response.status} ${response.statusText} ${responseText.slice(0, 300)}`,
    );

    error.retryable = isRetryableUploadFailure(response.status);

    throw error;
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
