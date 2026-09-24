#!/usr/bin/env node

// Smoke-check the default generated site: live cards must use unbaked sources, and settled pages must stop drawing.
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
const includeRoutes = process.argv.includes('--routes');
const noWebgl = process.argv.includes('--no-webgl');
const disabled = process.argv.includes('--disabled');
const contextLoss = process.argv.includes('--context-loss');
const reducedMotion = process.argv.includes('--reduced-motion');
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
    startup: window.__halftoneStartup ?? null,
    status: report?.status ?? 'not installed',
    errors: report?.errors ?? [],
    uploads: report?.uploads ?? 0,
    draws: report?.draws ?? 0,
    surfaces: report?.surfaces ?? 0,
    ready: document.querySelectorAll('.is-live-halftone-ready').length,
    canvases: document.querySelectorAll('.s51-live-photo').length,
    path: location.pathname,
    cloneReady: document.querySelectorAll(
      '.ftml-layer--media .frame-halftone.is-live-halftone-ready',
    ).length,
    cloneLayers: document.querySelectorAll('.ftml-layer--media').length,
    cloneCanvases: document.querySelectorAll(
      '.ftml-layer--media .s51-live-photo',
    ).length,
    cloneFailures: document.querySelectorAll(
      '.ftml-layer--media .is-live-halftone-failed',
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
        selected: image.currentSrc,
        original: image.dataset.originalSrc,
      })),
  };
}

function observeStartup() {
  const startup = {
    firstVisibleImageAt: null,
    firstLiveFrameAt: null,
    untreatedFrames: 0,
    lastUntreatedFrameAt: null,
  };
  window.__halftoneStartup = startup;
  const beganAt = performance.now();

  function sample() {
    const image = document.querySelector(
      '.selected-work-section .case-study-card img[data-featured-media-treatment="case-study-halftone"]',
    );
    if (image?.complete && image.naturalWidth) {
      const rect = image.getBoundingClientRect();
      const inViewport =
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.top < innerHeight;
      if (inViewport) {
        const now = Math.round(performance.now());
        startup.firstVisibleImageAt ??= now;
        if (image.closest('.is-live-halftone-ready')) {
          startup.firstLiveFrameAt ??= now;
          return;
        }
        const style = getComputedStyle(image);
        if (style.visibility !== 'hidden' && Number(style.opacity) > 0) {
          startup.untreatedFrames++;
          startup.lastUntreatedFrameAt = now;
        }
      }
    }
    if (performance.now() - beganAt < 5000) requestAnimationFrame(sample);
  }

  requestAnimationFrame(sample);
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
  const points = await evaluate(
    sessionId,
    `(() => {
      const image = document.querySelector('.selected-work-section .case-study-card .card-image-area').getBoundingClientRect();
      const text = document.querySelector('.selected-work-section .case-study-card .link-box').getBoundingClientRect();
      return {
        image: { x: image.left + image.width / 2, y: image.top + image.height / 2 },
        text: { x: text.left + text.width / 2, y: text.top + text.height / 2 },
      };
    })()`,
  );
  const beforeHover = await evaluate(sessionId, `(${snapshot.toString()})()`);
  await call(
    'Input.dispatchMouseEvent',
    { type: 'mouseMoved', ...points.image },
    sessionId,
  );
  await new Promise((resolve) => setTimeout(resolve, 500));
  const afterImageHover = await evaluate(
    sessionId,
    `(${snapshot.toString()})()`,
  );
  await call(
    'Input.dispatchMouseEvent',
    { type: 'mouseMoved', ...points.text },
    sessionId,
  );
  await new Promise((resolve) => setTimeout(resolve, 500));
  const afterTextHover = await evaluate(
    sessionId,
    `(${snapshot.toString()})()`,
  );
  await call(
    'Input.dispatchMouseEvent',
    { type: 'mouseMoved', ...points.image },
    sessionId,
  );
  await new Promise((resolve) => setTimeout(resolve, 300));
  await call(
    'Input.dispatchMouseEvent',
    { type: 'mousePressed', ...points.image, button: 'left', clickCount: 1 },
    sessionId,
  );
  await call(
    'Input.dispatchMouseEvent',
    { type: 'mouseReleased', ...points.image, button: 'left', clickCount: 1 },
    sessionId,
  );

  const result = {
    imageHoverDraws: afterImageHover.draws - beforeHover.draws,
    textHoverDraws: afterTextHover.draws - afterImageHover.draws,
    sawLiveClone: false,
    landedHero: false,
    path: '',
  };
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

async function waitForRoute(sessionId, expectedPath, readyField) {
  const result = {
    path: '',
    sawCloneLayer: false,
    sawCloneCanvas: false,
    sawCloneFailure: false,
    sawLiveClone: false,
    landedReady: false,
  };
  for (let attempt = 0; attempt < 120; attempt++) {
    let current;
    try {
      current = await evaluate(sessionId, `(${snapshot.toString()})()`);
    } catch (error) {
      if (!String(error).includes('Inspected target navigated or closed'))
        throw error;
      await new Promise((resolve) => setTimeout(resolve, 100));
      continue;
    }
    result.sawCloneLayer ||= current.cloneLayers > 0;
    result.sawCloneCanvas ||= current.cloneCanvases > 0;
    result.sawCloneFailure ||= current.cloneFailures > 0;
    result.sawLiveClone ||= current.cloneReady > 0;
    if (current.path === expectedPath)
      result.landedReady ||= current[readyField] > 0;
    result.path = current.path;
    if (current.path === expectedPath && result.landedReady) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return result;
}

async function waitForTransitionIdle(sessionId) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const current = await evaluate(sessionId, `(${snapshot.toString()})()`);
    if (!current.cloneLayers) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Featured-media clone did not finish its transition');
}

async function runRouteCoverage(sessionId, firstDetailPath) {
  await waitForTransitionIdle(sessionId);
  await evaluate(
    sessionId,
    `(() => {
      document.querySelector('.case-study-loop-nav a.next').scrollIntoView({ block: 'center' });
    })()`,
  );
  await new Promise((resolve) => setTimeout(resolve, 500));
  const next = await evaluate(
    sessionId,
    `(() => {
      const link = document.querySelector('.case-study-loop-nav a.next');
      const rect = link.getBoundingClientRect();
      return { path: new URL(link.href).pathname, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`,
  );
  await call(
    'Input.dispatchMouseEvent',
    { type: 'mouseMoved', x: next.x, y: next.y },
    sessionId,
  );
  await call(
    'Input.dispatchMouseEvent',
    {
      type: 'mousePressed',
      x: next.x,
      y: next.y,
      button: 'left',
      clickCount: 1,
    },
    sessionId,
  );
  await call(
    'Input.dispatchMouseEvent',
    {
      type: 'mouseReleased',
      x: next.x,
      y: next.y,
      button: 'left',
      clickCount: 1,
    },
    sessionId,
  );
  const loop = await waitForRoute(sessionId, next.path, 'heroReady');
  await waitForTransitionIdle(sessionId);
  try {
    await evaluate(sessionId, 'history.back(), true');
  } catch (error) {
    if (!String(error).includes('Inspected target navigated or closed'))
      throw error;
  }
  const detailBack = await waitForRoute(
    sessionId,
    firstDetailPath,
    'heroReady',
  );
  await waitForTransitionIdle(sessionId);
  try {
    await evaluate(sessionId, 'history.back(), true');
  } catch (error) {
    if (!String(error).includes('Inspected target navigated or closed'))
      throw error;
  }
  const homeBack = await waitForRoute(sessionId, '/', 'ready');
  return { loop, detailBack, homeBack };
}

async function runReducedMotionJourney(sessionId) {
  const detailPath = await evaluate(
    sessionId,
    `(() => {
      const link = document.querySelector('.selected-work-section .case-study-card a[href^="/case-studies/"]');
      const path = new URL(link.href).pathname;
      link.click();
      return path;
    })()`,
  );
  const detail = await waitForRoute(sessionId, detailPath, 'heroReady');
  try {
    await evaluate(sessionId, 'history.back(), true');
  } catch (error) {
    if (!String(error).includes('Inspected target navigated or closed'))
      throw error;
  }
  const home = await waitForRoute(sessionId, '/', 'ready');
  return { detail, home };
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
  if (reducedMotion) {
    await call(
      'Emulation.setEmulatedMedia',
      {
        features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
      },
      sessionId,
    );
  }
  if (noWebgl) {
    await call(
      'Page.addScriptToEvaluateOnNewDocument',
      {
        source: `(() => {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function(type, ...options) {
            if (type === 'webgl' || type === 'experimental-webgl') return null;
            return original.call(this, type, ...options);
          };
        })()`,
      },
      sessionId,
    );
  }
  if (contextLoss) {
    await call(
      'Page.addScriptToEvaluateOnNewDocument',
      {
        source: `(() => {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function(type, ...options) {
            const context = original.call(this, type, ...options);
            if (type === 'webgl' || type === 'experimental-webgl') {
              window.__probeWebglCanvas = this;
              window.__probeWebglContext = context;
            }
            return context;
          };
        })()`,
      },
      sessionId,
    );
  }
  await call(
    'Page.addScriptToEvaluateOnNewDocument',
    { source: `(${observeStartup.toString()})()` },
    sessionId,
  );
  await call(
    'Page.navigate',
    {
      url: `${origin}/${disabled ? '?experimentalHalftone=0' : ''}#selected-work`,
    },
    sessionId,
  );

  if (noWebgl || disabled) {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const fallback = await evaluate(
      sessionId,
      `(() => {
        const image = document.querySelector('.selected-work-section .case-study-card img[data-featured-media-treatment="case-study-halftone"]');
        return {
          imageLoaded: Boolean(image?.complete && image.naturalWidth),
          imageVisibility: image ? getComputedStyle(image).visibility : null,
          pending: document.documentElement.classList.contains('is-live-halftone-pending'),
          ready: document.querySelectorAll('.is-live-halftone-ready').length,
          pageErrors: window.__halftoneShader?.errors ?? [],
        };
      })()`,
    );
    await call('Target.closeTarget', { targetId });
    const failures = [];
    if (!fallback.imageLoaded || fallback.imageVisibility !== 'visible')
      failures.push('original image did not appear');
    if (fallback.pending) failures.push('first-paint gate remained active');
    if (fallback.ready) failures.push('live shader unexpectedly drew');
    if (pageErrors.length || fallback.pageErrors.length)
      failures.push('page error');
    console.log(JSON.stringify({ fallback, pageErrors, failures }, null, 2));
    if (failures.length) process.exitCode = 1;
    return;
  }

  let first;
  for (let attempt = 0; attempt < 60; attempt++) {
    first = await evaluate(sessionId, `(${snapshot.toString()})()`);
    if (first.ready > 0 || first.errors.length) break;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  await new Promise((resolve) => setTimeout(resolve, 700));
  const active = await evaluate(sessionId, `(${snapshot.toString()})()`);
  if (reducedMotion) {
    const journey = await runReducedMotionJourney(sessionId);
    await call('Target.closeTarget', { targetId });
    const failures = [];
    if (!first.ready || !active.pixels.opaquePixels)
      failures.push('Home did not render live halftone');
    if (!journey.detail.landedReady || !journey.home.landedReady)
      failures.push('reduced-motion route did not restore live surfaces');
    if (pageErrors.length) failures.push('page error');
    console.log(JSON.stringify({ journey, pageErrors, failures }, null, 2));
    if (failures.length) process.exitCode = 1;
    return;
  }
  if (contextLoss) {
    const trigger = await evaluate(
      sessionId,
      `(() => {
        const extension = window.__probeWebglContext?.getExtension('WEBGL_lose_context');
        if (extension) {
          extension.loseContext();
          return 'WEBGL_lose_context';
        }
        if (window.__probeWebglCanvas) {
          window.__probeWebglCanvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
          return 'dispatched event';
        }
        return 'no context';
      })()`,
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
    const fallback = await evaluate(
      sessionId,
      `(() => {
        const image = document.querySelector('.selected-work-section .case-study-card img[data-featured-media-treatment="case-study-halftone"]');
        return {
          imageLoaded: Boolean(image?.complete && image.naturalWidth),
          imageVisibility: image ? getComputedStyle(image).visibility : null,
          pending: document.documentElement.classList.contains('is-live-halftone-pending'),
          ready: document.querySelectorAll('.is-live-halftone-ready').length,
          status: window.__halftoneShader?.status ?? null,
        };
      })()`,
    );
    await call('Target.closeTarget', { targetId });
    const failures = [];
    if (trigger === 'no context') failures.push('no WebGL context to lose');
    if (!fallback.imageLoaded || fallback.imageVisibility !== 'visible')
      failures.push('original image did not appear after context loss');
    if (fallback.pending || fallback.ready)
      failures.push('live treatment remained active after context loss');
    if (pageErrors.length) failures.push('page error');
    console.log(
      JSON.stringify({ trigger, fallback, pageErrors, failures }, null, 2),
    );
    if (failures.length) process.exitCode = 1;
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, 600));
  const settled = await evaluate(sessionId, `(${snapshot.toString()})()`);
  const journey =
    includeJourney || includeRoutes ? await runJourney(sessionId) : null;
  const routes = includeRoutes
    ? await runRouteCoverage(sessionId, journey.path)
    : null;
  await call('Target.closeTarget', { targetId });

  const failures = [];
  if (!first.ready) failures.push('no live case-study surface drew');
  if (!active.startup?.firstVisibleImageAt || !active.startup.firstLiveFrameAt)
    failures.push('first-load image timing was not observed');
  if (active.startup?.untreatedFrames)
    failures.push(
      'original case-study image was visible before the shader frame',
    );
  if (!first.uploads) failures.push('no unbaked texture uploaded');
  if (first.sources.some((source) => source.selected.includes('-halftone-')))
    failures.push('card still selected a baked halftone image');
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
  if (journey && (!journey.imageHoverDraws || !journey.textHoverDraws))
    failures.push('image or text-plate hover did not invalidate live dots');
  if (routes?.loop.path === routes?.detailBack.path)
    failures.push('loop link did not navigate to another case study');
  if (routes && !routes.loop.sawLiveClone)
    failures.push('loop flight had no live clone');
  if (routes && !routes.loop.landedReady)
    failures.push('loop destination had no live hero');
  if (routes && !routes.detailBack.landedReady)
    failures.push('Back to first detail had no live hero');
  if (routes && (routes.homeBack.path !== '/' || !routes.homeBack.landedReady))
    failures.push('Back to Home had no live card');
  console.log(
    JSON.stringify(
      { first, active, settled, journey, routes, pageErrors, failures },
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
