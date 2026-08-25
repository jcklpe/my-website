import { access, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDir = fileURLToPath(new URL('..', import.meta.url));
const previewUrl =
  process.env.SOCIAL_CARD_URL ??
  'http://127.0.0.1:3001/dev/social-page';
const outputPath = path.join(
  frontendDir,
  'public/images/social-card-default.png',
);
const chromePath = await resolveChromePath();

await assertPreviewIsAvailable(previewUrl);
await runChrome(chromePath, previewUrl, outputPath);

const outputStats = await stat(outputPath);

if (outputStats.size === 0) {
  throw new Error(`Chrome created an empty social card at ${outputPath}.`);
}

console.log(`Captured 1200x630 social card: ${outputPath}`);

async function assertPreviewIsAvailable(url) {
  let response;

  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      `Social card preview is unavailable at ${url}. Start the frontend with \`corepack pnpm start:frontend\`, then run this command again.`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Social card preview returned ${response.status} at ${url}.`,
    );
  }
}

async function resolveChromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next explicit browser location.
    }
  }

  throw new Error(
    'No Chrome or Chromium executable was found. Set CHROME_PATH to its executable and run the capture again.',
  );
}

async function runChrome(executablePath, url, screenshotPath) {
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--force-device-scale-factor=1',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=3000',
    '--window-size=1200,630',
    `--screenshot=${screenshotPath}`,
    url,
  ];

  await new Promise((resolve, reject) => {
    const child = spawn(executablePath, args, { stdio: 'inherit' });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Chrome social-card capture exited with code ${code}.`));
    });
  });
}
