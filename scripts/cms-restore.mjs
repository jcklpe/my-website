import { createReadStream } from 'node:fs';
import { mkdir, readFile, rename, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const restoreSafetyRoot = path.join(repoRoot, '.backups/restore-safety');
const contentUploadsRoot = path.join(repoRoot, 'apps/cms/wp-content/uploads');
const containerUploadsRoot = '/var/www/html/wp-content/uploads';
const containerWpContentRoot = '/var/www/html/wp-content';

const environments = {
  public: {
    composeFiles: ['docker/compose.yaml', 'docker/compose.dev.yaml'],
    confirmation: 'restore-public-cms',
    service: 'cms',
    sourceUrlsToReplace: [],
    uploadsRoot: contentUploadsRoot,
    uploadsStrategy: 'host',
  },
  content: {
    composeFiles: ['docker/compose.yaml', 'docker/compose.dev.yaml'],
    confirmation: 'restore-content-cms',
    service: 'cms',
    sourceUrlsToReplace: [],
    uploadsRoot: contentUploadsRoot,
    uploadsStrategy: 'host',
  },
  qa: {
    composeFiles: [
      'docker/compose.yaml',
      'docker/compose.dev.yaml',
      'docker/compose.cms-dev.yaml',
    ],
    confirmation: 'restore-qa-cms',
    service: 'cms_dev',
    sourceUrlsToReplace: [
      'http://cms.my-website.localhost',
      'http://127.0.0.1:8080',
      'http://dev.cms.my-website.localhost',
    ],
    uploadsRoot: containerUploadsRoot,
    uploadsStrategy: 'container',
  },
  dev: {
    composeFiles: [
      'docker/compose.yaml',
      'docker/compose.dev.yaml',
      'docker/compose.cms-dev.yaml',
    ],
    confirmation: 'restore-dev-cms',
    service: 'cms_dev',
    sourceUrlsToReplace: [
      'http://cms.my-website.localhost',
      'http://127.0.0.1:8080',
    ],
    uploadsRoot: containerUploadsRoot,
    uploadsStrategy: 'container',
  },
};

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const environment = environments[options.environment];

  if (!environment) {
    throw new Error(
      `Unsupported CMS restore environment "${options.environment}". Only "public" and "qa" are supported for now.`,
    );
  }

  if (!options.backupPath) {
    throw new Error(
      'Missing backup directory. Usage: corepack pnpm restore:cms:public -- .backups/cms/content/<timestamp> --yes',
    );
  }

  assertConfirmed({ environment, options });

  const backupDir = path.resolve(repoRoot, options.backupPath);
  const databasePath = path.join(backupDir, 'database.sql');
  const uploadsArchivePath = path.join(backupDir, 'uploads.tar.gz');
  const manifestPath = path.join(backupDir, 'manifest.json');

  await assertFile(databasePath);
  await assertFile(uploadsArchivePath);
  await validateBackupManifest({
    databasePath,
    manifestPath,
    uploadsArchivePath,
  });

  console.log(`Restoring backup into ${options.environment} CMS`);
  console.log(`Backup directory: ${path.relative(repoRoot, backupDir)}`);
  console.log('');

  await importDatabase({
    databasePath,
    environment,
  });

  await normalizeRestoredSiteUrl({ environment });

  await restoreUploads({
    environment,
    uploadsArchivePath,
  });

  console.log('');
  console.log('CMS restore complete.');
}

function parseArgs(args) {
  const options = {
    backupPath: '',
    environment: 'public',
    yes: false,
  };

  for (const arg of args) {
    if (arg === '--yes') {
      options.yes = true;
      continue;
    }

    if (arg.startsWith('--env=')) {
      options.environment = arg.slice('--env='.length);
      continue;
    }

    if (!arg.startsWith('--') && !options.backupPath) {
      options.backupPath = arg;
    }
  }

  return options;
}

function assertConfirmed({ environment, options }) {
  if (
    options.yes ||
    process.env.CMS_RESTORE_CONFIRM === environment.confirmation
  ) {
    return;
  }

  throw new Error(
    `Restore is destructive. Re-run with --yes or set CMS_RESTORE_CONFIRM=${environment.confirmation}.`,
  );
}

async function importDatabase({ databasePath, environment }) {
  console.log('Importing WordPress database...');

  const input = createReadStream(databasePath);

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
      `${mysqlHostPortPrelude()}; if [ -n "$db_port" ]; then exec mysql --default-character-set=utf8mb4 -h "$db_host" -P "$db_port" -u "$WORDPRESS_DB_USER" "-p$WORDPRESS_DB_PASSWORD" "$WORDPRESS_DB_NAME"; fi; exec mysql --default-character-set=utf8mb4 -h "$db_host" -u "$WORDPRESS_DB_USER" "-p$WORDPRESS_DB_PASSWORD" "$WORDPRESS_DB_NAME"`,
    ],
    {
      stdin: input,
    },
  );
}

async function restoreUploads({ environment, uploadsArchivePath }) {
  console.log('Restoring WordPress uploads...');

  if (environment.uploadsStrategy === 'container') {
    await restoreContainerUploads({
      environment,
      uploadsArchivePath,
    });
    return;
  }

  const currentUploads = await pathState(environment.uploadsRoot);

  if (currentUploads.exists) {
    await mkdir(restoreSafetyRoot, { recursive: true });

    const safetyPath = path.join(
      restoreSafetyRoot,
      `${timestampForPath(new Date())}-uploads-before-restore`,
    );

    await rename(environment.uploadsRoot, safetyPath);
    console.log(
      `Previous uploads moved to ${path.relative(repoRoot, safetyPath)}`,
    );
  }

  await mkdir(path.dirname(environment.uploadsRoot), { recursive: true });

  await runCommand('tar', [
    '-xzf',
    uploadsArchivePath,
    '-C',
    path.dirname(environment.uploadsRoot),
  ]);
}

async function restoreContainerUploads({ environment, uploadsArchivePath }) {
  await runCommand('docker', [
    'compose',
    ...composeFileArgs(environment.composeFiles),
    'exec',
    '-T',
    environment.service,
    'sh',
    '-lc',
    `mkdir -p ${containerUploadsRoot} && find ${containerUploadsRoot} -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +`,
  ]);

  const input = createReadStream(uploadsArchivePath);

  await runCommand(
    'docker',
    [
      'compose',
      ...composeFileArgs(environment.composeFiles),
      'exec',
      '-T',
      environment.service,
      'tar',
      '-xzf',
      '-',
      '-C',
      containerWpContentRoot,
    ],
    {
      stdin: input,
    },
  );
}

async function normalizeRestoredSiteUrl({ environment }) {
  console.log('Normalizing restored WordPress URLs...');

  await runWpCliShell({
    command: 'wp option update home "$WORDPRESS_URL" --allow-root',
    environment,
  });
  await runWpCliShell({
    command: 'wp option update siteurl "$WORDPRESS_URL" --allow-root',
    environment,
  });

  for (const sourceUrl of environment.sourceUrlsToReplace) {
    await runWpCliShell({
      command: `wp search-replace ${shellQuote(sourceUrl)} "$WORDPRESS_URL" --skip-columns=guid --allow-root`,
      environment,
    });
  }
}

async function runWpCliShell({ command, environment }) {
  await runCommand('docker', [
    'compose',
    ...composeFileArgs(environment.composeFiles),
    'exec',
    '-T',
    environment.service,
    'sh',
    '-lc',
    command,
  ]);
}

function composeFileArgs(composeFiles) {
  return composeFiles.flatMap((composeFile) => ['-f', composeFile]);
}

function shellQuote(value) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function mysqlHostPortPrelude() {
  return [
    'db_host="${WORDPRESS_DB_HOST%%:*}"',
    'db_port="${WORDPRESS_DB_HOST##*:}"',
    'if [ "$db_host" = "$WORDPRESS_DB_HOST" ]; then db_port=""; fi',
  ].join('; ');
}

async function assertFile(filePath) {
  const fileState = await pathState(filePath);

  if (!fileState.exists || !fileState.isFile) {
    throw new Error(`Required backup file not found: ${filePath}`);
  }
}

async function validateBackupManifest({
  databasePath,
  manifestPath,
  uploadsArchivePath,
}) {
  const manifest = await readManifestIfPresent(manifestPath);

  if (!manifest?.files) {
    return;
  }

  await validateManifestFile({
    filePath: databasePath,
    label: 'database.sql',
    manifestFile: manifest.files.database,
  });
  await validateManifestFile({
    filePath: uploadsArchivePath,
    label: 'uploads.tar.gz',
    manifestFile: manifest.files.uploads,
  });
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

async function validateManifestFile({ filePath, label, manifestFile }) {
  if (!manifestFile) {
    return;
  }

  const fileStat = await stat(filePath);

  if (
    Number.isFinite(manifestFile.bytes) &&
    fileStat.size !== manifestFile.bytes
  ) {
    throw new Error(
      `${label} size does not match manifest. Expected ${manifestFile.bytes} bytes, found ${fileStat.size} bytes.`,
    );
  }

  if (!manifestFile.sha256) {
    return;
  }

  const fileHash = await sha256File(filePath);

  if (fileHash !== manifestFile.sha256) {
    throw new Error(`${label} checksum does not match manifest.`);
  }
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

async function pathState(filePath) {
  try {
    const fileStat = await stat(filePath);

    return {
      exists: true,
      isDirectory: fileStat.isDirectory(),
      isFile: fileStat.isFile(),
    };
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return {
        exists: false,
        isDirectory: false,
        isFile: false,
      };
    }

    throw error;
  }
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      stdio: [options.stdin ? 'pipe' : 'ignore', 'inherit', 'inherit'],
    });

    if (options.stdin) {
      child.stdin.on('error', (error) => {
        if (error?.code === 'EPIPE') {
          return;
        }

        reject(error);
      });
      options.stdin.pipe(child.stdin);
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
