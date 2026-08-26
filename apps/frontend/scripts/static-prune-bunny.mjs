import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { buildFileManifest, repoRoot, validateRelease } from './static-release.mjs';

const deployEnvPath = path.join(repoRoot, '.env.deploy');
const execute = process.argv.includes('--execute');
const releaseId = readArgumentValue('--release');
const confirmedPlanHash = readArgumentValue('--confirm-plan');
const config = {
  ...(await readEnvFileIfPresent(deployEnvPath)),
  ...readRelevantProcessEnv(),
};

assertCredentials(config);
assertSafeTarget(config);

let inventoryDirectory;
let inventoryLabel;

if (execute) {
  if (!releaseId) {
    throw new Error(
      'Executed pruning requires --release=<verified-release-id>. Dry-run first and review the exact deletion set.',
    );
  }

  const release = await validateRelease(releaseId);
  inventoryDirectory = release.releaseOutputDir;
  inventoryLabel = `verified release ${releaseId}`;
} else if (releaseId) {
  const release = await validateRelease(releaseId);
  inventoryDirectory = release.releaseOutputDir;
  inventoryLabel = `verified release ${releaseId}`;
} else {
  inventoryDirectory = path.resolve(
    repoRoot,
    config.STATIC_OUTPUT_DIR || 'apps/frontend/.output/public',
  );
  inventoryLabel = path.relative(repoRoot, inventoryDirectory);
}

await assertDirectory(inventoryDirectory);

const localFiles = await buildFileManifest(inventoryDirectory);

if (!localFiles.length || !localFiles.some((file) => file.path === 'index.html')) {
  throw new Error('Refusing to prune from an empty or non-site inventory.');
}

const remoteFiles = await listRemoteFiles(config);
const localPaths = new Set(localFiles.map((file) => file.path));
const deletionPlan = [...remoteFiles.entries()]
  .filter(([remotePath]) => !localPaths.has(remotePath))
  .filter(([remotePath]) => !isProtectedPath(remotePath))
  .map(([remotePath, metadata]) => ({
    bytes: metadata.bytes,
    path: remotePath,
  }))
  .sort((first, second) => first.path.localeCompare(second.path));
const planHash = createHash('sha256')
  .update(JSON.stringify(deletionPlan))
  .digest('hex');
const planPath = path.join(repoRoot, '.deploy', 'static-prune-plan.json');

await mkdir(path.dirname(planPath), { recursive: true });
await writeFile(
  planPath,
  `${JSON.stringify(
    {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      inventory: inventoryLabel,
      releaseId: releaseId || null,
      planHash,
      protectedPrefixes: ['media/', 'dot-prefixed provider/system paths'],
      deletionCandidates: deletionPlan,
    },
    null,
    2,
  )}\n`,
);

if (execute && confirmedPlanHash !== planHash) {
  throw new Error(
    `Executed pruning requires --confirm-plan=${planHash}. Review the exact plan first; if remote inventory changed, review the newly generated plan instead of reusing an old hash.`,
  );
}

console.log('Bunny obsolete-file pruning');
console.log('');
console.log(`Mode: ${execute ? 'DELETE' : 'dry run'}`);
console.log(`Inventory: ${inventoryLabel}`);
console.log(`Local files: ${localFiles.length}`);
console.log(`Remote files: ${remoteFiles.size}`);
console.log(`Protected media/system files: retained unconditionally`);
console.log(`Deletion candidates: ${deletionPlan.length}`);
console.log(`Plan hash: ${planHash}`);
console.log(`Exact plan: ${path.relative(repoRoot, planPath)}`);
console.log(
  `Candidate size: ${formatBytes(deletionPlan.reduce((total, file) => total + file.bytes, 0))}`,
);
console.log('');

for (const file of deletionPlan.slice(0, 30)) {
  console.log(`- ${file.path} (${formatBytes(file.bytes)})`);
}

if (deletionPlan.length > 30) {
  console.log(`...and ${deletionPlan.length - 30} more exact paths in the plan file.`);
}

if (!execute) {
  console.log('');
  console.log(
    deletionPlan.length
      ? `Nothing was deleted. After reviewing the exact plan, run with --release=<id> --confirm-plan=${planHash} --execute.`
      : 'Nothing was deleted; the generated-site inventory is already clean.',
  );
  process.exit(0);
}

if (!deletionPlan.length) {
  console.log('Nothing to delete.');
  process.exit(0);
}

await verifyPublicIndex(config, inventoryDirectory);

for (const [index, file] of deletionPlan.entries()) {
  await deleteRemoteFile(config, file.path);

  if ((index + 1) % 25 === 0 || index + 1 === deletionPlan.length) {
    console.log(`Deleted ${index + 1}/${deletionPlan.length}`);
  }
}

await purgePullZone(config);
await verifyPublicIndex(config, inventoryDirectory);
await verifyDeletedRoute(config, deletionPlan);
console.log('Obsolete generated files deleted; cache purged; public root reverified.');

async function listRemoteFiles(deployConfig) {
  const remoteFiles = new Map();
  const storageHost = stripProtocol(
    deployConfig.BUNNY_STORAGE_HOST || 'storage.bunnycdn.com',
  );
  const zone = deployConfig.BUNNY_STORAGE_ZONE;
  const prefix = trimSlashes(deployConfig.BUNNY_STATIC_PATH_PREFIX || '');

  async function walk(relativeDirectory = '') {
    const urlPath = [zone, prefix, relativeDirectory].filter(Boolean).join('/');
    const response = await fetch(
      `https://${storageHost}/${encodePath(urlPath)}/`,
      {
        headers: {
          AccessKey: deployConfig.BUNNY_STORAGE_ACCESS_KEY,
          accept: 'application/json',
        },
      },
    );

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
      } else {
        remoteFiles.set(entryPath, { bytes: entry.Length ?? 0 });
      }
    }
  }

  await walk();
  return remoteFiles;
}

async function deleteRemoteFile(deployConfig, remotePath) {
  if (isProtectedPath(remotePath)) {
    throw new Error(`Refusing to delete protected path ${remotePath}.`);
  }

  const storageHost = stripProtocol(
    deployConfig.BUNNY_STORAGE_HOST || 'storage.bunnycdn.com',
  );
  const urlPath = [
    deployConfig.BUNNY_STORAGE_ZONE,
    trimSlashes(deployConfig.BUNNY_STATIC_PATH_PREFIX || ''),
    remotePath,
  ]
    .filter(Boolean)
    .join('/');
  const response = await fetch(`https://${storageHost}/${encodePath(urlPath)}`, {
    method: 'DELETE',
    headers: { AccessKey: deployConfig.BUNNY_STORAGE_ACCESS_KEY },
  });

  if (!response.ok) {
    throw new Error(
      `Bunny delete failed for ${remotePath}: ${response.status} ${response.statusText}`,
    );
  }
}

async function purgePullZone(deployConfig) {
  const response = await fetch(
    `https://api.bunny.net/pullzone/${deployConfig.BUNNY_PULL_ZONE_ID}/purgeCache`,
    {
      method: 'POST',
      headers: {
        AccessKey: deployConfig.BUNNY_PURGE_API_KEY,
        'content-type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Post-prune purge failed: ${response.status} ${response.statusText}. The exact release remains available for a force redeploy.`,
    );
  }
}

async function verifyPublicIndex(deployConfig, directoryPath) {
  const expected = await readFile(path.join(directoryPath, 'index.html'));
  const response = await fetch(
    `${stripTrailingSlash(deployConfig.BUNNY_PULL_ZONE_URL)}/`,
    { headers: { 'cache-control': 'no-cache' } },
  );

  if (!response.ok) {
    throw new Error(`Public root verification failed with ${response.status}.`);
  }

  const actual = Buffer.from(await response.arrayBuffer());

  if (!actual.equals(expected)) {
    throw new Error(
      'Public root does not match the selected release. Refusing to prune.',
    );
  }
}

async function verifyDeletedRoute(deployConfig, deletedFiles) {
  const routeFile = deletedFiles.find(
    (file) => file.path.endsWith('/index.html') && !file.path.startsWith('_nuxt/'),
  );

  if (!routeFile) return;

  const publicPath = `/${routeFile.path.slice(0, -'/index.html'.length)}`;
  const response = await fetch(
    `${stripTrailingSlash(deployConfig.BUNNY_PULL_ZONE_URL)}${publicPath}`,
    { headers: { 'cache-control': 'no-cache' }, redirect: 'manual' },
  );

  if (response.status !== 404) {
    throw new Error(
      `Deleted route ${publicPath} returned ${response.status} instead of 404. Restore the selected release if this indicates a wider inconsistency.`,
    );
  }

  console.log(`Deleted route ${publicPath} now returns 404.`);
}

function isProtectedPath(remotePath) {
  const normalizedPath = remotePath.replace(/^\/+/, '');
  const segments = normalizedPath.split('/');

  return (
    !normalizedPath ||
    normalizedPath === '.' ||
    normalizedPath.startsWith('media/') ||
    segments.some((segment) => segment.startsWith('.'))
  );
}

function assertCredentials(deployConfig) {
  const required = [
    'BUNNY_STORAGE_ZONE',
    'BUNNY_STORAGE_ACCESS_KEY',
    'BUNNY_PURGE_API_KEY',
    'BUNNY_PULL_ZONE_ID',
    'BUNNY_PULL_ZONE_URL',
  ];
  const missing = required.filter((key) => !deployConfig[key]);

  if (missing.length) {
    throw new Error(`Missing Bunny configuration: ${missing.join(', ')}.`);
  }
}

function assertSafeTarget(deployConfig) {
  const zone = deployConfig.BUNNY_STORAGE_ZONE || '';
  const publicUrl = new URL(deployConfig.BUNNY_PULL_ZONE_URL);

  if (!zone.trim() || publicUrl.hostname !== 'www.aslanfrench.work') {
    throw new Error(
      'Pruning is restricted to the configured www.aslanfrench.work production target.',
    );
  }
}

async function readEnvFileIfPresent(filePath) {
  try {
    return parseEnv(await readFile(filePath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return {};
    throw error;
  }
}

function parseEnv(content) {
  const env = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');

    if (separator < 1) continue;

    const value = trimmed.slice(separator + 1).trim();
    env[trimmed.slice(0, separator).trim()] = stripQuotes(value);
  }

  return env;
}

function readRelevantProcessEnv() {
  return Object.fromEntries(
    Object.entries(process.env).filter(([key]) =>
      key.startsWith('BUNNY_') || key.startsWith('STATIC_'),
    ),
  );
}

function readArgumentValue(name) {
  const explicit = process.argv.find((argument) =>
    argument.startsWith(`${name}=`),
  );

  if (explicit) return explicit.slice(name.length + 1);

  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : '';
}

async function assertDirectory(directoryPath) {
  const directoryStat = await stat(directoryPath);

  if (!directoryStat.isDirectory()) {
    throw new Error(`${directoryPath} is not a directory.`);
  }
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
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

function encodePath(value) {
  return value
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}
