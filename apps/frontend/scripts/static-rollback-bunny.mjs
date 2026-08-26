import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateRelease } from './static-release.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const deployScript = path.join(scriptDir, 'static-deploy-bunny.mjs');
const execute = process.argv.includes('--execute');
const releaseId = process.argv
  .slice(2)
  .find((argument) => !argument.startsWith('--'));

if (!releaseId) {
  throw new Error(
    'Provide a release identifier. Run corepack pnpm releases:static to list releases.',
  );
}

const release = await validateRelease(releaseId);

console.log(`Validated release ${releaseId}.`);
console.log(`Content hash: ${release.manifest.contentHash}`);
console.log(`Files: ${release.manifest.fileCount}`);
console.log(`Canonical origin: ${release.manifest.canonicalOrigin}`);
console.log(`Mode: ${execute ? 'redeploy, purge, and verify' : 'dry run'}`);
console.log('');

const child = spawn(process.execPath, [deployScript], {
  env: {
    ...process.env,
    STATIC_DEPLOY_DRY_RUN: execute ? '0' : '1',
    STATIC_DEPLOY_ENV: 'production',
    STATIC_OUTPUT_DIR: release.releaseOutputDir,
    STATIC_RELEASE_SKIP_CAPTURE: '1',
  },
  stdio: 'inherit',
});

const exitCode = await new Promise((resolve, reject) => {
  child.once('error', reject);
  child.once('exit', (code, signal) => {
    if (signal) {
      reject(new Error(`Rollback deploy was interrupted by ${signal}.`));
      return;
    }

    resolve(code ?? 1);
  });
});

if (exitCode !== 0) {
  process.exitCode = exitCode;
} else if (!execute) {
  console.log('Dry run complete. Add --execute to redeploy this release.');
}
