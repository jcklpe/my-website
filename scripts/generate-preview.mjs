import { spawn } from 'node:child_process';

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

console.log(`
Generating static output from the public CMS.
Make sure the public CMS is running before using this command.
`);

try {
  await runCommand('Generating public static output', 'corepack', [
    'pnpm',
    'generate:static:public',
  ]);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

console.log(`
Static output generated.

Local static preview: http://127.0.0.1:3002
Static preview via Caddy: http://static.my-website.localhost
Run "corepack pnpm inspect:static" before any CDN deploy.
`);

runForeground('Starting local static preview server', 'corepack', [
  'pnpm',
  'start:static:preview',
]);
