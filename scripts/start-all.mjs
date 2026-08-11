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

async function waitForPublicCms() {
  const endpoint = 'http://127.0.0.1:8080/graphql';
  const timeoutAt = Date.now() + 60_000;

  console.log('\n==> Waiting for public CMS');

  while (Date.now() < timeoutAt) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: 'query { generalSettings { title } }' }),
      });

      if (response.ok) {
        console.log('Public CMS is ready.');
        return;
      }
    } catch {
      // The containers can accept connections a few seconds after `docker compose up` returns.
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(
    `Public CMS did not become ready at ${endpoint} within 60 seconds.`,
  );
}

try {
  await runCommand('Starting public + QA CMS stack', 'corepack', [
    'pnpm',
    'start:cms:qa',
  ]);
  await waitForPublicCms();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

console.log(`
CMS stack is starting or already running.

Frontend dev app: ${phonePreview ? 'temporary Cloudflare HTTPS URL and QR code printed below' : 'http://127.0.0.1:3001'}
Public frontend via Caddy: http://my-website.localhost
QA frontend via Caddy: http://qa.my-website.localhost
Public CMS: http://cms.my-website.localhost
QA CMS: http://qa.cms.my-website.localhost
`);

if (phonePreview) {
  console.log(
    'Phone preview is publicly reachable at its random tunnel URL while this command runs. Press Ctrl+C to close it.\n',
  );
}

const frontendCommand = phonePreview
  ? ['pnpm', 'start:frontend:phone']
  : ['pnpm', 'start:frontend'];

runForeground('Starting Nuxt frontend', 'corepack', frontendCommand);
