import { randomBytes } from 'node:crypto';
import { open, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');

function readPathArgument(name, fallback) {
  const prefix = `--${name}=`;
  const argument = process.argv
    .slice(2)
    .find((value) => value.startsWith(prefix));

  if (!argument) {
    return fallback;
  }

  return path.resolve(process.cwd(), argument.slice(prefix.length));
}

const examplePath = readPathArgument(
  'example',
  path.join(repositoryRoot, 'docker/.env.example'),
);
const outputPath = readPathArgument(
  'output',
  path.join(repositoryRoot, 'docker/.env'),
);

const generatedSecretKeys = new Set([
  'WORDPRESS_DB_PASSWORD',
  'WORDPRESS_DB_ROOT_PASSWORD',
  'WORDPRESS_ADMIN_PASSWORD',
  'QA_WORDPRESS_DB_PASSWORD',
  'QA_WORDPRESS_DB_ROOT_PASSWORD',
  'QA_WORDPRESS_ADMIN_PASSWORD',
]);

function generateSecret() {
  return randomBytes(24).toString('base64url');
}

function buildEnvironment(exampleSource) {
  const generatedKeys = new Set();
  const lines = exampleSource.split('\n').map((line) => {
    const separatorIndex = line.indexOf('=');

    if (separatorIndex < 1) {
      return line;
    }

    const key = line.slice(0, separatorIndex).trim();

    if (!generatedSecretKeys.has(key)) {
      return line;
    }

    generatedKeys.add(key);
    return `${key}=${generateSecret()}`;
  });

  const missingKeys = [...generatedSecretKeys].filter(
    (key) => !generatedKeys.has(key),
  );

  if (missingKeys.length > 0) {
    throw new Error(
      `Cannot generate ${outputPath}: missing keys in ${examplePath}: ${missingKeys.join(', ')}`,
    );
  }

  return lines.join('\n');
}

async function createEnvironment() {
  const exampleSource = await readFile(examplePath, 'utf8');
  const environmentSource = buildEnvironment(exampleSource);

  let outputFile;

  try {
    outputFile = await open(outputPath, 'wx', 0o600);
  } catch (error) {
    if (error?.code === 'EEXIST') {
      console.log(`Using existing local Docker environment: ${outputPath}`);
      return;
    }

    throw error;
  }

  try {
    await outputFile.writeFile(environmentSource, 'utf8');
  } finally {
    await outputFile.close();
  }

  console.log(`Created private local Docker environment: ${outputPath}`);
  console.log(
    'Generated passwords were written only to that ignored file. Existing environments are never overwritten.',
  );
}

createEnvironment().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
