import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const frontendDir = path.resolve(scriptDir, '..');
export const repoRoot = path.resolve(frontendDir, '../..');
export const releaseStore = path.join(repoRoot, '.releases', 'static');
export const defaultRetentionCount = 5;

export async function preparePublicReleaseMetadata({
  canonicalOrigin,
  outputDir,
}) {
  const publicMetadataPath = path.join(outputDir, 'release.json');

  await rm(publicMetadataPath, { force: true });

  const files = await buildFileManifest(outputDir);
  const contentHash = hashManifestFiles(files);
  const indexStat = await stat(path.join(outputDir, 'index.html'));
  const generatedAt = indexStat.mtime.toISOString();
  const preparedAt = new Date().toISOString();
  const source = await readSourceState();
  const metadata = {
    schemaVersion: 1,
    releaseId: `${toCompactTimestamp(preparedAt)}-${contentHash.slice(0, 12)}`,
    generatedAt,
    preparedAt,
    canonicalOrigin,
    sourceRevision: source.revision,
    sourceDirty: source.dirty,
    contentHash,
    fileCount: files.length,
    totalBytes: files.reduce((total, file) => total + file.bytes, 0),
  };

  await writeFile(publicMetadataPath, `${JSON.stringify(metadata, null, 2)}\n`);

  return metadata;
}

export async function captureVerifiedRelease({ canonicalOrigin, outputDir }) {
  const files = await buildFileManifest(outputDir);
  const publicMetadata = await readPublicReleaseMetadata(outputDir);
  const capturedAt = new Date().toISOString();
  const artifactHash = hashManifestFiles(files);
  const contentHash = publicMetadata?.contentHash ?? artifactHash;
  const releaseId =
    publicMetadata?.releaseId ??
    `${toCompactTimestamp(capturedAt)}-${contentHash.slice(0, 12)}`;
  const releaseDir = path.join(releaseStore, releaseId);
  const releaseOutputDir = path.join(releaseDir, 'public');

  await mkdir(releaseStore, { recursive: true });
  await rm(releaseDir, { force: true, recursive: true });
  await mkdir(releaseDir, { recursive: true });
  await cp(outputDir, releaseOutputDir, { recursive: true });

  const manifest = {
    schemaVersion: 1,
    releaseId,
    generatedAt: publicMetadata?.generatedAt ?? capturedAt,
    capturedAt,
    canonicalOrigin,
    sourceRevision:
      publicMetadata?.sourceRevision ?? (await readSourceState()).revision,
    sourceDirty: publicMetadata?.sourceDirty ?? null,
    contentHash,
    artifactHash,
    fileCount: files.length,
    totalBytes: files.reduce((total, file) => total + file.bytes, 0),
    files,
  };

  await writeFile(
    path.join(releaseDir, 'release.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  await validateRelease(releaseId);

  return { manifest, releaseDir, releaseOutputDir };
}

export async function validateRelease(releaseId) {
  assertSafeReleaseId(releaseId);

  const releaseDir = path.join(releaseStore, releaseId);
  const releaseOutputDir = path.join(releaseDir, 'public');
  const manifest = JSON.parse(
    await readFile(path.join(releaseDir, 'release.json'), 'utf8'),
  );

  if (manifest.releaseId !== releaseId || manifest.schemaVersion !== 1) {
    throw new Error(`Release metadata is invalid for ${releaseId}.`);
  }

  const files = await buildFileManifest(releaseOutputDir);
  const actualHash = hashManifestFiles(files);
  const expectedArtifactHash = manifest.artifactHash ?? manifest.contentHash;

  if (
    actualHash !== expectedArtifactHash ||
    files.length !== manifest.fileCount ||
    JSON.stringify(files) !== JSON.stringify(manifest.files)
  ) {
    throw new Error(`Release ${releaseId} failed its content hash check.`);
  }

  return { manifest, releaseDir, releaseOutputDir };
}

export async function applyReleaseRetention(
  retentionCount = defaultRetentionCount,
) {
  const keepCount = Number.parseInt(retentionCount, 10);

  if (!Number.isInteger(keepCount) || keepCount < 1) {
    throw new Error('Release retention must be a positive integer.');
  }

  await mkdir(releaseStore, { recursive: true });
  const entries = await readdir(releaseStore, { withFileTypes: true });
  const releases = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const releaseDir = path.join(releaseStore, entry.name);
    const manifestPath = path.join(releaseDir, 'release.json');

    try {
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      const pinned = await exists(path.join(releaseDir, 'PINNED'));
      releases.push({
        retainedAt: manifest.capturedAt || manifest.generatedAt || '',
        pinned,
        releaseDir,
        releaseId: entry.name,
      });
    } catch {
      console.warn(
        `Release retention skipped unrecognized directory ${entry.name}.`,
      );
    }
  }

  const unpinned = releases
    .filter((release) => !release.pinned)
    .sort((first, second) =>
      second.retainedAt.localeCompare(first.retainedAt),
    );
  const removed = [];

  for (const release of unpinned.slice(keepCount)) {
    await rm(release.releaseDir, { force: true, recursive: true });
    removed.push(release.releaseId);
  }

  return { removed, retained: releases.length - removed.length };
}

export async function listStoredReleases() {
  await mkdir(releaseStore, { recursive: true });
  const entries = await readdir(releaseStore, { withFileTypes: true });
  const releases = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    try {
      const releaseDir = path.join(releaseStore, entry.name);
      const manifest = JSON.parse(
        await readFile(path.join(releaseDir, 'release.json'), 'utf8'),
      );
      releases.push({
        ...manifest,
        pinned: await exists(path.join(releaseDir, 'PINNED')),
      });
    } catch {
      // Unknown directories are reported by retention and ignored here.
    }
  }

  return releases.sort((first, second) =>
    (second.capturedAt || second.preparedAt || second.generatedAt || '').localeCompare(
      first.capturedAt || first.preparedAt || first.generatedAt || '',
    ),
  );
}

export async function buildFileManifest(directoryPath) {
  const files = [];

  await walkDirectory(directoryPath, async (filePath, fileStat) => {
    const body = await readFile(filePath);
    files.push({
      path: path.relative(directoryPath, filePath).replaceAll('\\', '/'),
      bytes: fileStat.size,
      sha256: createHash('sha256').update(body).digest('hex'),
    });
  });

  return files.sort((first, second) => first.path.localeCompare(second.path));
}

export function hashManifestFiles(files) {
  const hash = createHash('sha256');

  for (const file of files) {
    hash.update(`${file.path}\0${file.bytes}\0${file.sha256}\n`);
  }

  return hash.digest('hex');
}

async function walkDirectory(directoryPath, onFile) {
  const entries = await readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      await walkDirectory(entryPath, onFile);
    } else if (entry.isFile()) {
      await onFile(entryPath, await stat(entryPath));
    }
  }
}

async function readSourceState() {
  try {
    const [{ stdout: revision }, { stdout: statusOutput }] = await Promise.all([
      execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot }),
      execFileAsync('git', ['status', '--porcelain'], { cwd: repoRoot }),
    ]);

    return { dirty: Boolean(statusOutput.trim()), revision: revision.trim() };
  } catch {
    return { dirty: null, revision: null };
  }
}

async function readPublicReleaseMetadata(outputDir) {
  try {
    return JSON.parse(
      await readFile(path.join(outputDir, 'release.json'), 'utf8'),
    );
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function toCompactTimestamp(timestamp) {
  return timestamp.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function assertSafeReleaseId(releaseId) {
  if (!/^[A-Za-z0-9._-]+$/.test(releaseId)) {
    throw new Error('Release identifier contains unsafe characters.');
  }
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}
