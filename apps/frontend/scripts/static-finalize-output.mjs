import { copyFile, mkdir, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(frontendDir, '../..');
const outputDir = path.join(frontendDir, '.output/public');
const clientAssetsDir = path.join(repoRoot, '.nuxt-static/frontend/dist/client');
const publicAssetsDir = path.join(frontendDir, 'public');

const textExtensions = new Set(['.css', '.html', '.js', '.json']);
const localAssetPrefixes = [
  '/_nuxt/',
  '/apple-touch-icon',
  '/favicon',
  '/fonts/',
  '/temp-editorial-images/',
];

async function main() {
  await assertDirectory(outputDir);

  const copiedClientAssets = await copyDirectoryContents(
    clientAssetsDir,
    outputDir,
  );
  const copiedPublicAssets = await copyDirectoryContents(
    publicAssetsDir,
    outputDir,
    {
      optional: true,
    },
  );
  const files = await listFiles(outputDir);
  const missingAssets = await findMissingLocalAssetReferences(files);

  if (missingAssets.length) {
    const details = missingAssets
      .slice(0, 20)
      .map(
        (item) =>
          `- ${item.assetPath} referenced by ${[...item.files].sort().join(', ')}`,
      )
      .join('\n');
    const suffix =
      missingAssets.length > 20
        ? `\n...and ${missingAssets.length - 20} more missing assets.`
        : '';

    throw new Error(
      `Static output references missing local assets:\n${details}${suffix}`,
    );
  }

  console.log('Static output finalized.');
  console.log(`Copied client assets: ${copiedClientAssets}`);
  console.log(`Copied public assets: ${copiedPublicAssets}`);
  console.log(`Output: ${path.relative(repoRoot, outputDir)}`);
}

async function assertDirectory(directoryPath) {
  const directoryStat = await stat(directoryPath);

  if (!directoryStat.isDirectory()) {
    throw new Error(`${directoryPath} is not a directory`);
  }
}

async function copyDirectoryContents(
  sourceDirectory,
  destinationDirectory,
  options = {},
) {
  try {
    await assertDirectory(sourceDirectory);
  } catch (error) {
    if (options.optional && error?.code === 'ENOENT') {
      return 0;
    }

    throw error;
  }

  let copiedFiles = 0;
  const sourceFiles = await listFiles(sourceDirectory);

  for (const file of sourceFiles) {
    const destinationPath = path.join(destinationDirectory, file.relativePath);

    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(file.path, destinationPath);
    copiedFiles += 1;
  }

  return copiedFiles;
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

async function findMissingLocalAssetReferences(files) {
  const missingByAsset = new Map();

  for (const file of files) {
    const extension = path.extname(file.path).toLowerCase();

    if (!textExtensions.has(extension)) {
      continue;
    }

    const content = await readFile(file.path, 'utf8');

    for (const assetPath of findLocalAssetReferences(content)) {
      const relativeAssetPath = decodeAssetPath(assetPath).replace(/^\/+/, '');
      const resolvedAssetPath = path.resolve(outputDir, relativeAssetPath);

      if (!isInsideOutputDir(resolvedAssetPath)) {
        addMissingAssetReference(missingByAsset, assetPath, file.relativePath);
        continue;
      }

      try {
        const assetStat = await stat(resolvedAssetPath);

        if (!assetStat.isFile()) {
          addMissingAssetReference(missingByAsset, assetPath, file.relativePath);
        }
      } catch (error) {
        if (error?.code === 'ENOENT') {
          addMissingAssetReference(missingByAsset, assetPath, file.relativePath);
          continue;
        }

        throw error;
      }
    }
  }

  return [...missingByAsset.entries()]
    .map(([assetPath, sourceFiles]) => ({
      assetPath,
      files: sourceFiles,
    }))
    .sort((first, second) => first.assetPath.localeCompare(second.assetPath));
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

function decodeAssetPath(assetPath) {
  try {
    return decodeURIComponent(assetPath);
  } catch {
    return assetPath;
  }
}

function isInsideOutputDir(filePath) {
  const relativePath = path.relative(outputDir, filePath);

  return (
    relativePath === '' ||
    (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
  );
}

function addMissingAssetReference(missingByAsset, assetPath, sourceFile) {
  const sourceFiles = missingByAsset.get(assetPath) ?? new Set();

  sourceFiles.add(sourceFile);
  missingByAsset.set(assetPath, sourceFiles);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
