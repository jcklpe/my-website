import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const backupRoot = path.join(repoRoot, '.backups/cms');

const environments = {
  public: {
    backupDirName: 'content',
  },
  content: {
    backupDirName: 'content',
  },
  qa: {
    backupDirName: 'qa',
  },
};

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const environment = environments[options.environment];

  if (!environment) {
    throw new Error(
      `Unsupported CMS backup environment "${options.environment}". Use "public" or "qa".`,
    );
  }

  const backupParentDir = path.join(backupRoot, environment.backupDirName);
  const backups = markBackupStatuses(
    await listBackups(backupParentDir),
    options.keep,
  );

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          backups,
          environment: options.environment,
          keep: options.keep,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(`${capitalize(options.environment)} CMS backups`);
  console.log(`Directory: ${path.relative(repoRoot, backupParentDir)}`);
  console.log(`Retention target: latest ${options.keep}`);
  console.log('');

  if (!backups.length) {
    console.log('No backups found.');
    return;
  }

  for (const backup of backups) {
    console.log(`${backup.name} (${backup.status})`);
    console.log(`  path: ${backup.relativePath}`);
    console.log(`  database: ${formatBytes(backup.files.database.bytes)}`);
    console.log(`  uploads: ${formatBytes(backup.files.uploads.bytes)}`);
    console.log(`  total: ${formatBytes(backup.totalBytes)}`);

    if (!backup.hasManifest) {
      console.log('  manifest: missing');
      console.log('  note: incomplete backup, ignored by retention count');
    } else if (!backup.hasChecksums) {
      console.log('  manifest: present, checksums missing');
    } else {
      console.log('  manifest: present, checksums present');
    }
  }
}

function markBackupStatuses(backups, keep) {
  let completeBackupCount = 0;

  return backups.map((backup) => {
    if (!backup.hasManifest) {
      return {
        ...backup,
        status: 'incomplete',
      };
    }

    const status = completeBackupCount < keep ? 'kept' : 'prunable';
    completeBackupCount += 1;

    return {
      ...backup,
      status,
    };
  });
}

function parseArgs(args) {
  const options = {
    environment: 'public',
    json: false,
    keep: parsePositiveInteger(process.env.CMS_BACKUP_KEEP ?? '5'),
  };

  for (const arg of args) {
    if (arg === '--json') {
      options.json = true;
      continue;
    }

    if (arg.startsWith('--env=')) {
      options.environment = arg.slice('--env='.length);
      continue;
    }

    if (arg.startsWith('--keep=')) {
      options.keep = parsePositiveInteger(arg.slice('--keep='.length));
    }
  }

  return options;
}

function parsePositiveInteger(value) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new Error('Backup retention must be a positive integer.');
  }

  return parsedValue;
}

async function listBackups(backupParentDir) {
  const entries = await readDirectoryIfPresent(backupParentDir);
  const backupDirs = entries
    .filter((entry) => entry.isDirectory())
    .filter((entry) => isBackupTimestamp(entry.name))
    .map((entry) => ({
      name: entry.name,
      path: path.join(backupParentDir, entry.name),
    }))
    .sort((first, second) => second.name.localeCompare(first.name));
  const backups = [];

  for (const backupDir of backupDirs) {
    backups.push(await inspectBackup(backupDir));
  }

  return backups;
}

async function readDirectoryIfPresent(directoryPath) {
  try {
    return await readdir(directoryPath, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function inspectBackup(backupDir) {
  const manifest = await readManifestIfPresent(
    path.join(backupDir.path, 'manifest.json'),
  );
  const database = await fileSummary({
    backupDir,
    fileName: 'database.sql',
    manifestFile: manifest?.files?.database,
  });
  const uploads = await fileSummary({
    backupDir,
    fileName: 'uploads.tar.gz',
    manifestFile: manifest?.files?.uploads,
  });

  return {
    createdAt: manifest?.createdAt ?? '',
    files: {
      database,
      uploads,
    },
    hasChecksums: Boolean(
      manifest?.files?.database?.sha256 && manifest?.files?.uploads?.sha256,
    ),
    hasManifest: Boolean(manifest),
    name: backupDir.name,
    path: backupDir.path,
    relativePath: path.relative(repoRoot, backupDir.path),
    totalBytes: database.bytes + uploads.bytes,
  };
}

async function readManifestIfPresent(manifestPath) {
  try {
    return JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

async function fileSummary({ backupDir, fileName, manifestFile }) {
  const filePath = path.join(backupDir.path, fileName);
  const fileStat = await statIfPresent(filePath);

  return {
    bytes: manifestFile?.bytes ?? fileStat?.size ?? 0,
    path: fileName,
    sha256: manifestFile?.sha256 ?? '',
  };
}

async function statIfPresent(filePath) {
  try {
    return await stat(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

function isBackupTimestamp(value) {
  return /^\d{4}-\d{2}-\d{2}T\d{6}Z$/.test(value);
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
