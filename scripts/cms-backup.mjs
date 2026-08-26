import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const backupRoot = path.join(repoRoot, '.backups/cms');
const contentUploadsRoot = path.join(repoRoot, 'apps/cms/wp-content/uploads');
const containerUploadsRoot = '/var/www/html/wp-content/uploads';
const defaultBackupRetention = 5;

const environments = {
  public: {
    backupDirName: 'content',
    composeFiles: ['docker/compose.yaml', 'docker/compose.dev.yaml'],
    databaseStrategy: 'mysql',
    service: 'cms',
    uploadsRoot: contentUploadsRoot,
    uploadsStrategy: 'host',
  },
  content: {
    backupDirName: 'content',
    composeFiles: ['docker/compose.yaml', 'docker/compose.dev.yaml'],
    databaseStrategy: 'mysql',
    service: 'cms',
    uploadsRoot: contentUploadsRoot,
    uploadsStrategy: 'host',
  },
  qa: {
    backupDirName: 'qa',
    composeFiles: [
      'docker/compose.yaml',
      'docker/compose.dev.yaml',
      'docker/compose.cms-dev.yaml',
    ],
    databaseStrategy: 'wp-cli',
    service: 'cms_dev',
    uploadsRoot: containerUploadsRoot,
    uploadsStrategy: 'container',
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

  const timestamp = timestampForPath(new Date());
  const backupDir = path.join(backupRoot, environment.backupDirName, timestamp);
  const backupParentDir = path.dirname(backupDir);
  const workingBackupDir = path.join(
    backupParentDir,
    `.tmp-${timestamp}-${process.pid}`,
  );
  const databasePath = path.join(workingBackupDir, 'database.sql');
  const uploadsArchivePath = path.join(workingBackupDir, 'uploads.tar.gz');
  const manifestPath = path.join(workingBackupDir, 'manifest.json');

  await mkdir(backupParentDir, { recursive: true });

  if ((await pathState(backupDir)).exists) {
    throw new Error(
      `Backup directory already exists: ${path.relative(repoRoot, backupDir)}`,
    );
  }

  await rm(workingBackupDir, { force: true, recursive: true });
  await mkdir(workingBackupDir);

  console.log(`Creating ${options.environment} CMS backup`);
  console.log(`Backup directory: ${path.relative(repoRoot, backupDir)}`);
  console.log('');

  try {
    await exportDatabase({
      databasePath,
      environment,
    });

    await archiveUploads({
      environment,
      uploadsArchivePath,
    });

    const databaseFile = await fileMetadata(databasePath);
    const uploadsFile = await fileMetadata(uploadsArchivePath);
    const manifest = {
      createdAt: new Date().toISOString(),
      environment: options.environment,
      retention: {
        keep: options.keep,
        prunedAutomatically: !options.noPrune,
      },
      schemaVersion: 2,
      files: {
        database: databaseFile,
        uploads: uploadsFile,
      },
      notes: [
        'This backup contains local WordPress database content and uploads.',
        'Keep backups private. They may include unpublished content and media.',
        'Copy important backups off this laptop to an encrypted off-device location.',
      ],
    };

    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    await rename(workingBackupDir, backupDir);
  } catch (error) {
    await rm(workingBackupDir, { force: true, recursive: true });
    throw error;
  }

  const finalDatabasePath = path.join(backupDir, 'database.sql');
  const finalUploadsArchivePath = path.join(backupDir, 'uploads.tar.gz');
  const finalManifestPath = path.join(backupDir, 'manifest.json');

  const prunedBackups = options.noPrune
    ? []
    : await pruneBackups(backupParentDir, {
        keep: options.keep,
        preserveDir: backupDir,
      });

  console.log('');
  console.log('CMS backup complete.');
  console.log(`Database: ${path.relative(repoRoot, finalDatabasePath)}`);
  console.log(`Uploads: ${path.relative(repoRoot, finalUploadsArchivePath)}`);
  console.log(`Manifest: ${path.relative(repoRoot, finalManifestPath)}`);

  if (options.noPrune) {
    console.log('Retention pruning skipped.');
    return;
  }

  console.log(`Retention: keeping the latest ${options.keep} local backups.`);

  if (!prunedBackups.length) {
    console.log('No old local backups pruned.');
    return;
  }

  for (const prunedBackup of prunedBackups) {
    console.log(
      `Pruned old local backup: ${path.relative(repoRoot, prunedBackup)}`,
    );
  }
}

function parseArgs(args) {
  const options = {
    environment: 'public',
    keep: parsePositiveInteger(
      process.env.CMS_BACKUP_KEEP ?? String(defaultBackupRetention),
      'CMS_BACKUP_KEEP',
    ),
    noPrune: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--env=')) {
      options.environment = arg.slice('--env='.length);
      continue;
    }

    if (arg.startsWith('--keep=')) {
      options.keep = parsePositiveInteger(
        arg.slice('--keep='.length),
        '--keep',
      );
      continue;
    }

    if (arg === '--no-prune') {
      options.noPrune = true;
    }
  }

  return options;
}

function parsePositiveInteger(value, label) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new Error(`${label} must be a positive integer.`);
  }

  return parsedValue;
}

async function exportDatabase({ databasePath, environment }) {
  console.log('Exporting WordPress database...');

  const output = createWriteStream(databasePath, { flags: 'wx' });

  try {
    if (environment.databaseStrategy === 'wp-cli') {
      await runCommand(
        'docker',
        [
          'compose',
          ...composeFileArgs(environment.composeFiles),
          'exec',
          '-T',
          environment.service,
          'wp',
          'db',
          'export',
          '-',
          '--add-drop-table',
          '--allow-root',
        ],
        { stdout: output },
      );

      return;
    }

    await runCommand(
      'docker',
      [
        'compose',
        ...composeFileArgs(environment.composeFiles),
        'exec',
        '-T',
        environment.service,
        'sh',
        '-lc',
        `${mysqlHostPortPrelude()}; if [ -n "$db_port" ]; then exec mysqldump --single-transaction --quick --default-character-set=utf8mb4 -h "$db_host" -P "$db_port" -u "$WORDPRESS_DB_USER" "-p$WORDPRESS_DB_PASSWORD" "$WORDPRESS_DB_NAME"; fi; exec mysqldump --single-transaction --quick --default-character-set=utf8mb4 -h "$db_host" -u "$WORDPRESS_DB_USER" "-p$WORDPRESS_DB_PASSWORD" "$WORDPRESS_DB_NAME"`,
      ],
      {
        stdout: output,
      },
    );
  } finally {
    output.end();
  }
}

async function archiveUploads({ environment, uploadsArchivePath }) {
  console.log('Archiving WordPress uploads...');

  if (environment.uploadsStrategy === 'container') {
    const output = createWriteStream(uploadsArchivePath, { flags: 'wx' });

    try {
      await runCommand(
        'docker',
        [
          'compose',
          ...composeFileArgs(environment.composeFiles),
          'exec',
          '-T',
          environment.service,
          'tar',
          '-czf',
          '-',
          '-C',
          path.dirname(environment.uploadsRoot),
          path.basename(environment.uploadsRoot),
        ],
        { stdout: output },
      );
    } finally {
      output.end();
    }

    return;
  }

  const uploadsState = await pathState(environment.uploadsRoot);

  if (!uploadsState.exists) {
    await mkdir(environment.uploadsRoot, { recursive: true });
  }

  await runCommand('tar', [
    '-czf',
    uploadsArchivePath,
    '-C',
    path.dirname(environment.uploadsRoot),
    path.basename(environment.uploadsRoot),
  ]);
}

function composeFileArgs(composeFiles) {
  return composeFiles.flatMap((composeFile) => ['-f', composeFile]);
}

function mysqlHostPortPrelude() {
  return [
    'db_host="${WORDPRESS_DB_HOST%%:*}"',
    'db_port="${WORDPRESS_DB_HOST##*:}"',
    'if [ "$db_host" = "$WORDPRESS_DB_HOST" ]; then db_port=""; fi',
  ].join('; ');
}

async function fileMetadata(filePath) {
  const fileStat = await stat(filePath);

  return {
    bytes: fileStat.size,
    path: path.basename(filePath),
    sha256: await sha256File(filePath),
  };
}

function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);

    stream.on('data', (chunk) => {
      hash.update(chunk);
    });

    stream.on('error', reject);

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
  });
}

async function pruneBackups(backupParentDir, { keep, preserveDir }) {
  const entries = await readdir(backupParentDir, { withFileTypes: true });
  const preservePath = path.resolve(preserveDir);
  const backupDirs = entries
    .filter((entry) => entry.isDirectory())
    .filter((entry) => isBackupTimestamp(entry.name))
    .map((entry) => path.join(backupParentDir, entry.name))
    .sort((first, second) =>
      path.basename(second).localeCompare(path.basename(first)),
    );
  const prunedBackups = [];

  for (const backupDir of backupDirs.slice(keep)) {
    if (path.resolve(backupDir) === preservePath) {
      continue;
    }

    await rm(backupDir, { recursive: true });
    prunedBackups.push(backupDir);
  }

  return prunedBackups;
}

function isBackupTimestamp(value) {
  return /^\d{4}-\d{2}-\d{2}T\d{6}Z$/.test(value);
}

async function pathState(filePath) {
  try {
    const fileStat = await stat(filePath);

    return {
      exists: true,
      isDirectory: fileStat.isDirectory(),
    };
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return {
        exists: false,
        isDirectory: false,
      };
    }

    throw error;
  }
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      stdio: ['ignore', options.stdout ? 'pipe' : 'inherit', 'inherit'],
    });

    if (options.stdout) {
      child.stdout.pipe(options.stdout);
    }

    child.on('error', reject);

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} failed with ${code}`));
    });
  });
}

function timestampForPath(date) {
  return date
    .toISOString()
    .replaceAll(':', '')
    .replace(/\.\d{3}Z$/, 'Z');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
