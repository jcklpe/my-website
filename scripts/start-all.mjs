import { spawn } from 'node:child_process';

const phonePreview = process.argv.includes('--phone');

function runCommand(label, command, args) {
  console.log(`\n==> ${label}`);

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
    });

    child.on('error', reject);

    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      if (signal) {
        reject(new Error(`${label} stopped with signal ${signal}.`));
        return;
      }

      reject(new Error(`${label} failed with exit code ${code}.`));
    });
  });
}

function runForeground(label, command, args) {
  console.log(`\n==> ${label}`);

  const child = spawn(command, args, {
    stdio: 'inherit',
  });

  let forwardedSignal = false;

  function forwardSignal(signal) {
    forwardedSignal = true;
    child.kill(signal);
  }

  process.once('SIGINT', forwardSignal);
  process.once('SIGTERM', forwardSignal);

  child.on('error', (error) => {
    console.error(error);
    process.exitCode = 1;
  });

  child.on('exit', (code, signal) => {
    process.removeListener('SIGINT', forwardSignal);
    process.removeListener('SIGTERM', forwardSignal);

    if (signal && !forwardedSignal) {
      console.error(`${label} stopped with signal ${signal}.`);
      process.exitCode = 1;
      return;
    }

    process.exitCode = code ?? signalExitCode(signal);
  });
}

function signalExitCode(signal) {
  if (signal === 'SIGINT') return 130;
  if (signal === 'SIGTERM') return 143;

  return 0;
}

try {
  await runCommand('Starting public + QA CMS stack', 'corepack', [
    'pnpm',
    'start:cms:qa',
  ]);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

console.log(`
CMS stack is starting or already running.

Frontend dev app: ${phonePreview ? 'local HTTPS URL and QR code printed below' : 'http://127.0.0.1:3001'}
Public frontend via Caddy: http://my-website.localhost
QA frontend via Caddy: http://qa.my-website.localhost
Public CMS: http://cms.my-website.localhost
QA CMS: http://qa.cms.my-website.localhost
`);

const frontendCommand = phonePreview
  ? ['pnpm', 'start:frontend:phone']
  : ['pnpm', 'start:frontend'];

runForeground('Starting Nuxt frontend', 'corepack', frontendCommand);
