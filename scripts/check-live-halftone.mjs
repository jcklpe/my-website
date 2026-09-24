#!/usr/bin/env node

// Smoke-check the actual generated site: a live card must draw from an unbaked source, and settled pages must stop drawing.
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const chromePath =
  process.env.CHROME_BIN ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const origin =
  process.argv.find((argument) => argument.startsWith('http')) ??
  'http://127.0.0.1:3002';
const includeJourney = process.argv.includes('--journey');
const profile = await mkdtemp(path.join(os.tmpdir(), 'live-halftone-check-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-timer-throttling',
    `--user-data-dir=${profile}`,
    '--remote-debugging-pipe',
    '--window-size=1512,945',
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] },
);

let stderr = '';
let buffer = '';
let nextId = 0;
const pending = new Map();
const pageErrors = [];
chrome.stderr.on('data', (chunk) => (stderr += chunk));
chrome.stdio[4].on('data', (chunk) => {
  buffer += chunk;
  while (buffer.includes('\0')) {
    const end = buffer.indexOf('\0');
    const message = JSON.parse(buffer.slice(0, end));
    buffer = buffer.slice(end + 1);
    if (message.method === 'Runtime.exceptionThrown') {
      pageErrors.push(
        message.params.exceptionDetails.exception?.description ??
          message.params.exceptionDetails.text,
      );
    }
    const request = pending.get(message.id);
    if (!request) continue;
    pending.delete(message.id);
    clearTimeout(request.timeout);
    if (message.error) request.reject(new Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  }
});
chrome.on('exit', (code) => {
  for (const request of pending.values()) {
    clearTimeout(request.timeout);
    request.reject(new Error(`Chrome exited ${code}: ${stderr.slice(-500)}`));
  }
  pending.clear();
});

function call(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`${method} timed out: ${stderr.slice(-500)}`));
    }, 15000);
    pending.set(id, { resolve, reject, timeout });
    chrome.stdio[3].write(
      JSON.stringify({ id, method, params, sessionId }) + '\0',
    );
  });
}

async function evaluate(sessionId, expression) {
  const response = await call(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    sessionId,
  );
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.text);
  }
  return response.result.value;
}

function snapshot() {
  const report = window.__halftoneShader;
  const canvas = document.querySelector(
    '.is-live-halftone-ready .s51-live-photo',
  );
  const width = Math.min(canvas?.width ?? 0, 64);
  const height = Math.min(canvas?.height ?? 0, 64);
  const pixels =
    width && height
      ? canvas.getContext('2d').getImageData(0, 0, width, height).data
      : [];
  let lowest = 255;
  let highest = 0;
  let opaquePixels = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    lowest = Math.min(
      lowest,
      pixels[index],
      pixels[index + 1],
      pixels[index + 2],
    );
    highest = Math.max(
      highest,
      pixels[index],
      pixels[index + 1],
      pixels[index + 2],
    );
    if (pixels[index + 3] > 0) opaquePixels++;
  }
  return {
    status: report?.status ?? 'not installed',
    errors: report?.errors ?? [],
    uploads: report?.uploads ?? 0,
    draws: report?.draws ?? 0,
    surfaces: report?.surfaces ?? 0,
    ready: document.querySelectorAll('.is-live-halftone-ready').length,
    canvases: document.querySelectorAll('.s51-live-photo').length,
    path: location.pathname,
    cloneReady: document.querySelectorAll(
      '.ftml-layer--media .frame.is-live-halftone-ready',
    ).length,
    heroReady: document.querySelectorAll(
      '.hero-halftone-box.is-live-halftone-ready',
    ).length,
    pixels: { lowest, highest, opaquePixels },
    sources: [
      ...document.querySelectorAll('.case-study-card img[data-original-src]'),
    ]
      .slice(0, 1)
      .map((image) => ({
        baked: image.currentSrc,
        original: image.dataset.originalSrc,
      })),
  };
}

async function runJourney(sessionId) {
  await evaluate(
    sessionId,
    `(() => {
      document.documentElement.style.setProperty('--featured-media-flight-duration', '1500ms');
      document.documentElement.style.setProperty('--surroundings-duration', '1500ms');
      document.querySelector('.selected-work-section .case-study-card .card-image-area').scrollIntoView({ block: 'center' });
    })()`,
  );
  await new Promise((resolve) => setTimeout(resolve, 500));
  const point = await evaluate(
    sessionId,
    `(() => {
      const rect = document.querySelector('.selected-work-section .case-study-card .card-image-area').getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`,
  );
  await call(
    'Input.dispatchMouseEvent',
    { type: 'mouseMoved', ...point },
    sessionId,
  );
  await new Promise((resolve) => setTimeout(resolve, 300));
  await call(
    'Input.dispatchMouseEvent',
    { type: 'mousePressed', ...point, button: 'left', clickCount: 1 },
    sessionId,
  );
  await call(
    'Input.dispatchMouseEvent',
    { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 },
    sessionId,
  );

  const result = { sawLiveClone: false, landedHero: false, path: '' };
  for (let attempt = 0; attempt < 90; attempt++) {
    const current = await evaluate(sessionId, `(${snapshot.toString()})()`);
    result.sawLiveClone ||= current.cloneReady > 0;
    result.landedHero ||= current.heroReady > 0;
    result.path = current.path;
    if (current.path.startsWith('/case-studies/') && current.heroReady) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return result;
}

async function main() {
  const { targetId } = await call('Target.createTarget', {
    url: 'about:blank',
  });
  const { sessionId } = await call('Target.attachToTarget', {
    targetId,
    flatten: true,
  });
  await call('Runtime.enable', {}, sessionId);
  await call('Page.enable', {}, sessionId);
  await call(
    'Page.navigate',
    {
      url: `${origin}/?experimentalHalftone=1#selected-work`,
    },
    sessionId,
  );

  let first;
  for (let attempt = 0; attempt < 60; attempt++) {
    first = await evaluate(sessionId, `(${snapshot.toString()})()`);
    if (first.ready > 0 || first.errors.length) break;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  await new Promise((resolve) => setTimeout(resolve, 700));
  const active = await evaluate(sessionId, `(${snapshot.toString()})()`);
  await new Promise((resolve) => setTimeout(resolve, 600));
  const settled = await evaluate(sessionId, `(${snapshot.toString()})()`);
  const journey = includeJourney ? await runJourney(sessionId) : null;
  await call('Target.closeTarget', { targetId });

  const failures = [];
  if (!first.ready) failures.push('no live case-study surface drew');
  if (!first.uploads) failures.push('no unbaked texture uploaded');
  if (
    !active.pixels.opaquePixels ||
    active.pixels.highest - active.pixels.lowest < 30
  )
    failures.push('live canvas is blank or nearly uniform');
  if (first.errors.length || pageErrors.length)
    failures.push('shader or page error');
  if (settled.draws > active.draws + 2)
    failures.push('renderer kept drawing after the page settled');
  if (journey && (!journey.sawLiveClone || !journey.landedHero))
    failures.push('live clone or landed hero was not observed');
  console.log(
    JSON.stringify(
      { first, active, settled, journey, pageErrors, failures },
      null,
      2,
    ),
  );
  if (failures.length) process.exitCode = 1;
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  chrome.kill('SIGTERM');
  await rm(profile, { recursive: true, force: true, maxRetries: 5 });
}
