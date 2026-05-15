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
  STATIC_MEDIA_LOCAL_ROOT: 'apps/cms/wp-content/uploads',
  STATIC_MEDIA_BASE_URL: '',
  STATIC_MEDIA_STORAGE_PREFIX: 'media',
};

const wpUploadsPathSegment = '/wp-content/uploads/';

async function main() {
  const deployEnv = await loadDeployEnv();
  const config = { ...defaultConfig, ...deployEnv };
  const outputDir = path.resolve(repoRoot, config.STATIC_OUTPUT_DIR);

  await assertDirectory(outputDir);

  const files = await listFiles(outputDir);
  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  const referenceAnalysis = await analyzeGeneratedReferences(files, {
    outputDir,
    config,
  });
  const mediaPlan = await buildMediaPlan({
    config,
    uploadReferences: referenceAnalysis.uploadReferences,
  });

  printPlan({
    config,
    outputDir,
    files,
    totalBytes,
    mediaPlan,
    referenceAnalysis,
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

async function analyzeGeneratedReferences(files, options) {
  const sourceHost = safeHost(options.config.STATIC_MEDIA_SOURCE_BASE_URL);
  const uploadReferences = new Map();
  const runtimeReferences = new Map();
  const staticGenerationMarkers = new Map();

  for (const file of files) {
    const extension = path.extname(file.path).toLowerCase();

    if (!textExtensions.has(extension)) {
      continue;
    }

    const content = await readFile(file.path, 'utf8');
    const uniqueUrls = new Set(findUrlMatches(content));

    for (const marker of findStaticGenerationMarkers(content)) {
      addReference(staticGenerationMarkers, marker, file.relativePath);
    }

    for (const url of uniqueUrls) {
      const parsedUrl = safeUrl(url);

      if (!parsedUrl || !isLocalCmsHost(parsedUrl.host, sourceHost)) {
        continue;
      }

      if (isWordPressUploadUrl(parsedUrl)) {
        addReference(uploadReferences, url, file.relativePath);
        continue;
      }

      addReference(runtimeReferences, url, file.relativePath);
    }
  }

  return {
    staticGenerationMarkers: referencesFromMap(staticGenerationMarkers),
    uploadReferences: referencesFromMap(uploadReferences),
    runtimeReferences: referencesFromMap(runtimeReferences),
  };
}

async function buildMediaPlan({ config, uploadReferences }) {
  const localRoot = path.resolve(repoRoot, config.STATIC_MEDIA_LOCAL_ROOT);
  const publicBaseUrl = getPublicMediaBaseUrl(config);
  const storagePrefix = trimSlashes(config.STATIC_MEDIA_STORAGE_PREFIX || '');
  const items = [];

  for (const reference of uploadReferences) {
    const relativeUploadPath = getUploadRelativePath(reference.url);
    const localPath = safeResolve(localRoot, relativeUploadPath);
    const destinationPath = [storagePrefix, relativeUploadPath]
      .filter(Boolean)
      .join('/');
    const publicUrl = publicBaseUrl
      ? joinUrlPath(publicBaseUrl, relativeUploadPath)
      : '';
    const localFile = localPath ? await getLocalFile(localPath) : null;

    items.push({
      ...reference,
      relativeUploadPath,
      localPath,
      destinationPath,
      publicUrl,
      exists: Boolean(localFile),
      size: localFile?.size ?? 0,
    });
  }

  return {
    localRoot,
    publicBaseUrl,
    storagePrefix,
    items,
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

function findUrlMatches(content) {
  const normalizedContent = normalizeEscapedUrlText(content);
  const matches = normalizedContent.matchAll(/https?:\/\/[^"'()<>\s\\]+/g);

  return [...matches].map(([url]) => url);
}

function normalizeEscapedUrlText(content) {
  return content.replace(/\\u002[fF]/g, '/').replace(/\\\//g, '/');
}

function findStaticGenerationMarkers(content) {
  const matches = content.matchAll(
    /(?:staticGenerated|["']staticGenerated["'])\s*:\s*(true|false)/g,
  );

  return [...matches].map(([, value]) => value);
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

function addReference(referenceMap, url, file) {
  const current = referenceMap.get(url) ?? new Set();
  current.add(file);
  referenceMap.set(url, current);
}

function referencesFromMap(referenceMap) {
  return [...referenceMap.entries()]
    .map(([url, files]) => ({
      url,
      files: [...files].sort(),
    }))
    .sort((first, second) => first.url.localeCompare(second.url));
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

function printPlan({
  config,
  outputDir,
  files,
  totalBytes,
  mediaPlan,
  referenceAnalysis,
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
  printStaticOutputSummary(referenceAnalysis.staticGenerationMarkers);
  printFileSummary(files);
  printMediaPlanSummary(config, mediaPlan);
  printRuntimeReferenceSummary(referenceAnalysis.runtimeReferences);

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

function printStaticOutputSummary(markers) {
  console.log('Static output marker');

  if (!markers.length) {
    console.log(
      'No staticGenerated marker detected. Make sure this output came from corepack pnpm static:generate before deploying.',
    );
    console.log('');
    return;
  }

  const markerValues = new Set(markers.map((marker) => marker.url));

  if (markerValues.has('false')) {
    console.log(
      'staticGenerated:false detected. This output looks like a normal SSR build, not the static publish output.',
    );
    console.log(
      'Run corepack pnpm static:generate before using this plan for deploy decisions.',
    );
  } else if (markerValues.has('true')) {
    console.log('staticGenerated:true detected.');
  }

  for (const marker of markers.slice(0, 2)) {
    console.log(`- ${marker.url}: ${marker.files.slice(0, 3).join(', ')}`);
  }

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

function printMediaPlanSummary(config, mediaPlan) {
  const foundItems = mediaPlan.items.filter((item) => item.exists);
  const missingItems = mediaPlan.items.filter((item) => !item.exists);
  const totalBytes = foundItems.reduce((total, item) => total + item.size, 0);

  console.log('Media sync plan');
  console.log(`Source base: ${config.STATIC_MEDIA_SOURCE_BASE_URL}`);
  console.log(
    `Local uploads root: ${path.relative(repoRoot, mediaPlan.localRoot)}`,
  );
  console.log(
    `Public media base: ${mediaPlan.publicBaseUrl || '(not configured)'}`,
  );
  console.log(`Storage prefix: ${mediaPlan.storagePrefix || '(none)'}`);
  console.log(`Unique CMS upload URLs: ${mediaPlan.items.length}`);
  console.log(`Local files found: ${foundItems.length}`);
  console.log(`Local files missing: ${missingItems.length}`);
  console.log(`Referenced media size: ${formatBytes(totalBytes)}`);
  console.log('');

  if (!mediaPlan.items.length) {
    console.log(
      'No WordPress upload references detected in generated text files.',
    );
    console.log('');
    return;
  }

  console.log('Largest referenced media files');

  for (const item of [...foundItems]
    .sort((first, second) => second.size - first.size)
    .slice(0, 8)) {
    console.log(`${item.relativeUploadPath}: ${formatBytes(item.size)}`);
  }

  if (!foundItems.length) {
    console.log('(none found locally)');
  }

  console.log('');
  console.log('Sample media mappings');

  for (const item of mediaPlan.items.slice(0, 8)) {
    console.log(`- ${item.url}`);
    console.log(
      `  local: ${item.localPath ? path.relative(repoRoot, item.localPath) : '(unsafe path)'}`,
    );
    console.log(`  storage: ${item.destinationPath}`);
    console.log(`  public: ${item.publicUrl || '(set STATIC_MEDIA_BASE_URL)'}`);
    console.log(`  referenced by: ${item.files.slice(0, 3).join(', ')}`);

    if (item.files.length > 3) {
      console.log(`  ...and ${item.files.length - 3} more files`);
    }
  }

  if (mediaPlan.items.length > 8) {
    console.log(`...and ${mediaPlan.items.length - 8} more media mappings.`);
  }

  if (missingItems.length) {
    console.log('');
    console.log('Missing local media files');

    for (const item of missingItems.slice(0, 10)) {
      console.log(`- ${item.relativeUploadPath}`);
    }

    if (missingItems.length > 10) {
      console.log(`...and ${missingItems.length - 10} more missing files.`);
    }
  }

  console.log('');
}

function printRuntimeReferenceSummary(references) {
  console.log('Local runtime references');

  if (!references.length) {
    console.log(
      'No non-media local CMS/API references detected in generated text files.',
    );
    return;
  }

  console.log(
    `${references.length} local non-media URLs still appear in generated text files.`,
  );

  for (const reference of references.slice(0, 10)) {
    console.log(`- ${reference.url}`);

    for (const file of reference.files.slice(0, 5)) {
      console.log(`  ${file}`);
    }

    if (reference.files.length > 5) {
      console.log(`  ...and ${reference.files.length - 5} more files`);
    }
  }

  if (references.length > 10) {
    console.log(`...and ${references.length - 10} more local runtime URLs.`);
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

function stripTrailingSlash(value) {
  return value.replace(/\/+$/g, '');
}

function joinUrlPath(baseUrl, relativePath) {
  const encodedPath = relativePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${stripTrailingSlash(baseUrl)}/${encodedPath}`;
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

await main();
