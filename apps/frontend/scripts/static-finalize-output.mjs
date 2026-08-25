import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverStaticRoutes } from './static-routes.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(frontendDir, '../..');
const outputDir = path.join(frontendDir, '.output/public');
const clientAssetsDir = path.join(
  repoRoot,
  '.nuxt-static/frontend/dist/client',
);
const publicAssetsDir = path.join(frontendDir, 'public');

const textExtensions = new Set(['.css', '.html', '.js', '.json']);
const localAssetPrefixes = [
  '/_nuxt/',
  '/apple-touch-icon',
  '/favicon',
  '/fonts/',
  '/images/',
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
  const discoveryFiles = await writeDiscoveryFiles();
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
  console.log(`Generated discovery files: ${discoveryFiles.join(', ')}`);
  console.log(`Output: ${path.relative(repoRoot, outputDir)}`);
}

async function writeDiscoveryFiles() {
  const deployEnv = await readDeployEnv();
  const publicSiteUrl = cleanPublicSiteUrl(
    process.env.STATIC_PUBLIC_SITE_URL ?? deployEnv.STATIC_PUBLIC_SITE_URL,
  );
  const deployEnvironment =
    process.env.STATIC_DEPLOY_ENV ?? deployEnv.STATIC_DEPLOY_ENV ?? 'preview';
  const cmsEnvironment =
    process.env.NUXT_STATIC_CMS_ENV === 'qa' ||
    process.env.NUXT_STATIC_CMS_ENV === 'dev'
      ? 'qa'
      : 'public';
  const isIndexableProduction =
    deployEnvironment === 'production' && cmsEnvironment === 'public';

  if (isIndexableProduction && !isProductionOrigin(publicSiteUrl)) {
    throw new Error(
      'Production static generation requires STATIC_PUBLIC_SITE_URL to be a non-local HTTPS origin.',
    );
  }

  const routes = (await discoverStaticRoutes({ strict: true })).filter(
    (route) => !route.startsWith('/dev/'),
  );
  const sitemap = buildSitemap(publicSiteUrl, routes);
  const llms = await buildLlmsText(publicSiteUrl, routes);
  const robots = isIndexableProduction
    ? `User-agent: *\nAllow: /\n\nSitemap: ${publicSiteUrl}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n';

  await writeFile(path.join(outputDir, 'robots.txt'), robots, 'utf8');
  await writeFile(path.join(outputDir, 'sitemap.xml'), sitemap, 'utf8');
  await writeFile(path.join(outputDir, 'llms.txt'), llms, 'utf8');

  return ['robots.txt', 'sitemap.xml', 'llms.txt'];
}

async function readDeployEnv() {
  try {
    const content = await readFile(path.join(repoRoot, '.env.deploy'), 'utf8');

    return Object.fromEntries(
      content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#') && line.includes('='))
        .map((line) => {
          const separatorIndex = line.indexOf('=');
          const key = line.slice(0, separatorIndex).trim();
          const value = line
            .slice(separatorIndex + 1)
            .trim()
            .replace(/^(['"])(.*)\1$/, '$2');

          return [key, value];
        }),
    );
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
}

function cleanPublicSiteUrl(value) {
  return String(value || 'http://my-website.localhost')
    .trim()
    .replace(/\/+$/, '');
}

function isProductionOrigin(value) {
  try {
    const url = new URL(value);

    return (
      url.protocol === 'https:' &&
      !['localhost', '127.0.0.1', 'my-website.localhost'].includes(
        url.hostname,
      ) &&
      !url.hostname.endsWith('.localhost') &&
      !url.hostname.includes('example.com')
    );
  } catch {
    return false;
  }
}

function buildSitemap(publicSiteUrl, routes) {
  const entries = routes
    .map(
      (route) =>
        `  <url><loc>${escapeXml(`${publicSiteUrl}${route}`)}</loc></url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

async function buildLlmsText(publicSiteUrl, routes) {
  const routeEntries = await Promise.all(
    routes.map(async (route) => ({
      route,
      title: await readRouteTitle(route),
      url: `${publicSiteUrl}${route}`,
    })),
  );
  const coreRoutes = routeEntries.filter(
    ({ route }) =>
      route === '/' ||
      route === '/about' ||
      route === '/now' ||
      route === '/side-projects' ||
      route === '/writing',
  );
  const caseStudies = routeEntries.filter(({ route }) =>
    route.startsWith('/case-studies/'),
  );
  const writing = routeEntries.filter(
    ({ route }) => route.startsWith('/writing/') && route !== '/writing/',
  );

  return [
    '# Aslan French',
    '',
    '> Portfolio, case studies, and writing by Aslan French, a design technologist and researcher.',
    '',
    'This file is generated during static publishing from the same public route inventory and rendered page titles used by the site.',
    '',
    buildLlmsSection('Explore', coreRoutes),
    buildLlmsSection('Case studies', caseStudies),
    buildLlmsSection('Writing', writing),
  ]
    .filter(Boolean)
    .join('\n');
}

function buildLlmsSection(title, entries) {
  if (!entries.length) {
    return '';
  }

  const links = entries.map(({ title: label, url }) => `- [${label}](${url})`);

  return [`## ${title}`, '', ...links, ''].join('\n');
}

async function readRouteTitle(route) {
  const routeHtmlPath =
    route === '/'
      ? path.join(outputDir, 'index.html')
      : path.join(outputDir, route.replace(/^\/+|\/+$/g, ''), 'index.html');
  const html = await readFile(routeHtmlPath, 'utf8');
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);

  if (!titleMatch) {
    return route === '/' ? 'Home' : titleCaseRoute(route);
  }

  return decodeHtmlText(titleMatch[1]).replace(
    /\s+[|–—-]\s+(?:Aslan French|My Website)$/i,
    '',
  );
}

function titleCaseRoute(route) {
  return route
    .split('/')
    .filter(Boolean)
    .at(-1)
    .split('-')
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

function decodeHtmlText(value) {
  const namedEntities = new Map([
    ['amp', '&'],
    ['apos', "'"],
    ['gt', '>'],
    ['lt', '<'],
    ['nbsp', ' '],
    ['quot', '"'],
  ]);

  return value
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) => {
      const radix = code.toLowerCase().startsWith('x') ? 16 : 10;
      const number = Number.parseInt(code.replace(/^x/i, ''), radix);

      return Number.isFinite(number) ? String.fromCodePoint(number) : _;
    })
    .replace(/&([a-z]+);/gi, (entity, name) => namedEntities.get(name) ?? entity)
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
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
          addMissingAssetReference(
            missingByAsset,
            assetPath,
            file.relativePath,
          );
        }
      } catch (error) {
        if (error?.code === 'ENOENT') {
          addMissingAssetReference(
            missingByAsset,
            assetPath,
            file.relativePath,
          );
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
    /["'](\/(?:_nuxt\/|apple-touch-icon|favicon|fonts\/|images\/|temp-editorial-images\/)[^"']*)["']/g,
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
