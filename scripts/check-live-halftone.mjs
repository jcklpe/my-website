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
const homeReturn = process.argv.includes('--home-return');
const includeRoutes = process.argv.includes('--routes') || homeReturn;
const slowMotion = process.argv.includes('--slow');
const directDetail = process.argv.includes('--direct-detail');
const noWebgl = process.argv.includes('--no-webgl');
const disabled = process.argv.includes('--disabled');
const failSource = process.argv.includes('--fail-source');
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
    throw new Error(
      response.exceptionDetails.exception?.description ??
        response.exceptionDetails.text,
    );
  }
  return response.result.value;
}

function snapshot() {
  const report = window.__halftoneShader;
  const cloneFrame = document.querySelector('.ftml-layer--media .frame');
  const cloneBounds = cloneFrame?.getBoundingClientRect();
  const cloneImage = cloneFrame?.querySelector('img');
  const cloneHalftone = cloneFrame?.querySelector('.frame-halftone');
  const cloneVisible = Boolean(
    cloneBounds &&
    cloneBounds.width > 0 &&
    cloneBounds.height > 0 &&
    cloneBounds.bottom > 0 &&
    cloneBounds.top < innerHeight &&
    cloneBounds.right > 0 &&
    cloneBounds.left < innerWidth &&
    Number(getComputedStyle(cloneFrame).opacity) > 0,
  );
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
    cloneVisible,
    cloneBounds: cloneBounds
      ? [
          cloneBounds.left,
          cloneBounds.top,
          cloneBounds.width,
          cloneBounds.height,
        ].map(Math.round)
      : null,
    cloneImageVisibility: cloneImage
      ? getComputedStyle(cloneImage).visibility
      : null,
    cloneImageSource: cloneImage?.currentSrc || cloneImage?.src || null,
    cloneOriginalSource: cloneImage?.dataset.originalSrc || null,
    cloneHalftoneClass: cloneHalftone?.className || null,
    at: Math.round(performance.now()),
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
      location.pathname.startsWith('/case-studies/')
        ? '.hero-halftone-box img[data-featured-media-treatment="case-study-halftone"]'
        : '.selected-work-section .case-study-card img[data-featured-media-treatment="case-study-halftone"]',
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

function installFlightTimeline() {
  if (window.__halftoneFlightTimeline) return;
  const storageKey = 'live-halftone-probe-flight';
  let active = null;
  try {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      active = JSON.parse(saved);
      active.startedAt = performance.now();
      active.documentChanges++;
    }
  } catch {
    // The probe will report a missing timeline if this document cannot retain session state.
  }

  function visible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    if (
      rect.width <= 0 ||
      rect.height <= 0 ||
      rect.bottom <= 0 ||
      rect.top >= innerHeight ||
      rect.right <= 0 ||
      rect.left >= innerWidth
    )
      return false;
    for (let current = element; current; current = current.parentElement) {
      const style = getComputedStyle(current);
      if (
        style.display === 'none' ||
        style.visibility !== 'visible' ||
        Number(style.opacity) <= 0.01
      )
        return false;
    }
    return true;
  }

  function sample(now) {
    if (active) {
      const clone = document.querySelector('.ftml-layer--media .frame');
      const wrapper = clone?.querySelector('.frame-halftone');
      const canvas = wrapper?.querySelector('.s51-live-photo');
      const image = wrapper?.querySelector('img');
      const cloneVisible = visible(clone);
      const live = Boolean(
        cloneVisible &&
        wrapper?.classList.contains('is-live-halftone-ready') &&
        canvas?.width &&
        canvas?.height &&
        visible(canvas),
      );
      const imageVisible = cloneVisible && visible(image);
      const hero = document.querySelector('.hero-halftone-box');
      const heroBounds = hero?.getBoundingClientRect();
      const reverseHandoffBlank = Boolean(
        clone?.closest('.is-reverse-source') &&
        heroBounds?.width &&
        heroBounds.bottom > 0 &&
        heroBounds.top < innerHeight &&
        !visible(hero) &&
        !live &&
        !imageVisible,
      );
      const card = document.querySelector(
        '.selected-work-section .case-study-card .card-halftone-box',
      );
      const destinationReady = Boolean(
        (visible(hero) && hero.classList.contains('is-live-halftone-ready')) ||
        (visible(card) && card.classList.contains('is-live-halftone-ready')),
      );
      const state = {
        at: Math.round(active.elapsedBeforeNavigation + now - active.startedAt),
        path: location.pathname,
        cloneVisible,
        live,
        imageVisible,
        destinationReady,
        reverseHandoffBlank,
        cloneCanvases: wrapper?.querySelectorAll('.s51-live-photo').length ?? 0,
        surfaces: window.__halftoneShader?.surfaces ?? 0,
      };
      active.frames++;
      if (reverseHandoffBlank) active.reverseHandoffBlankFrames++;
      if (cloneVisible) {
        active.visibleCloneFrames++;
        if (live) active.liveCloneFrames++;
        else {
          active.withoutLiveFrames++;
          if (!imageVisible) active.blankCloneFrames++;
          if (active.gaps.length < 8) active.gaps.push(state);
        }
      }
      const signature = [
        state.path,
        cloneVisible,
        live,
        imageVisible,
        destinationReady,
        reverseHandoffBlank,
        state.cloneCanvases,
      ].join(':');
      if (signature !== active.lastSignature && active.events.length < 80) {
        active.events.push(state);
        active.lastSignature = signature;
      }
    }
    requestAnimationFrame(sample);
  }

  window.__halftoneFlightTimeline = {
    start(label) {
      try {
        sessionStorage.removeItem(storageKey);
      } catch {
        // Browser history may restore a document with storage access restricted.
      }
      active = {
        label,
        startedAt: performance.now(),
        elapsedBeforeNavigation: 0,
        documentChanges: 0,
        frames: 0,
        visibleCloneFrames: 0,
        liveCloneFrames: 0,
        withoutLiveFrames: 0,
        blankCloneFrames: 0,
        reverseHandoffBlankFrames: 0,
        gaps: [],
        events: [],
        lastSignature: null,
      };
    },
    finish() {
      const finished = active;
      active = null;
      try {
        sessionStorage.removeItem(storageKey);
      } catch {
        // The in-memory timeline is still usable when session storage is unavailable.
      }
      if (!finished) return null;
      delete finished.lastSignature;
      delete finished.startedAt;
      return finished;
    },
  };
  window.addEventListener('pagehide', () => {
    if (!active) return;
    active.elapsedBeforeNavigation += performance.now() - active.startedAt;
    active.startedAt = performance.now();
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(active));
    } catch {
      // A later document will report a lost timeline if this history entry cannot persist it.
    }
  });
  requestAnimationFrame(sample);
}

async function startFlightTimeline(sessionId, label) {
  await evaluate(
    sessionId,
    `window.__halftoneFlightTimeline.start(${JSON.stringify(label)})`,
  );
}

async function finishFlightTimeline(sessionId) {
  const result = await evaluate(
    sessionId,
    'window.__halftoneFlightTimeline?.finish() ?? null',
  );
  if (!result) throw new Error('Flight timeline was lost across navigation');
  return result;
}

async function runJourney(sessionId) {
  await evaluate(
    sessionId,
    `(() => {
      ${slowMotion ? "document.documentElement.style.setProperty('--featured-media-flight-duration', '1500ms'); document.documentElement.style.setProperty('--surroundings-duration', '1500ms'); document.documentElement.style.setProperty('--featured-media-clone-leave-duration', '1500ms');" : ''}
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
  if (includeRoutes) await startFlightTimeline(sessionId, 'Home → detail');
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
  if (includeRoutes) {
    await waitForTransitionIdle(sessionId);
    await new Promise((resolve) => setTimeout(resolve, 300));
    result.timeline = await finishFlightTimeline(sessionId);
  }
  return result;
}

async function waitForRoute(
  sessionId,
  expectedPath,
  readyField,
  followAfterReadyMs = 0,
) {
  const result = {
    path: '',
    sawCloneLayer: false,
    sawCloneCanvas: false,
    sawCloneFailure: false,
    sawLiveClone: false,
    landedReady: false,
    visibleCloneSamples: 0,
    visibleWithoutLiveSamples: 0,
    visibleWithoutLiveDetails: [],
  };
  let readyAt = null;
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
    if (current.cloneVisible) {
      result.visibleCloneSamples++;
      if (!current.cloneReady) {
        result.visibleWithoutLiveSamples++;
        if (result.visibleWithoutLiveDetails.length < 8)
          result.visibleWithoutLiveDetails.push({
            at: current.at,
            path: current.path,
            bounds: current.cloneBounds,
            imageVisibility: current.cloneImageVisibility,
            className: current.cloneHalftoneClass,
            source: current.cloneImageSource,
            originalSource: current.cloneOriginalSource,
            draws: current.draws,
            uploads: current.uploads,
          });
      }
    }
    if (current.path === expectedPath)
      result.landedReady ||= current[readyField] > 0;
    result.path = current.path;
    if (current.path === expectedPath && result.landedReady) {
      readyAt ??= Date.now();
      if (Date.now() - readyAt >= followAfterReadyMs) break;
    }
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
  if (slowMotion || homeReturn) {
    await startFlightTimeline(sessionId, 'detail → Home');
    await evaluate(
      sessionId,
      "document.querySelector('.site-nav .home-link').click(), true",
    );
    const homeBack = await waitForRoute(sessionId, '/', 'ready', 2500);
    if (homeBack.path !== '/' || !homeBack.landedReady)
      throw new Error(`Home return missed /; reached ${homeBack.path}`);
    await waitForTransitionIdle(sessionId);
    homeBack.timeline = await finishFlightTimeline(sessionId);
    return { loop: null, detailBack: null, homeBack };
  }
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
  await startFlightTimeline(sessionId, 'detail → next detail');
  if (slowMotion) {
    await evaluate(
      sessionId,
      "document.querySelector('.case-study-loop-nav a.next').click(), true",
    );
  } else {
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
  }
  const loop = await waitForRoute(sessionId, next.path, 'heroReady', 600);
  if (loop.path !== next.path || !loop.landedReady)
    throw new Error(
      `Loop navigation missed ${next.path}; reached ${loop.path}`,
    );
  await waitForTransitionIdle(sessionId);
  await new Promise((resolve) => setTimeout(resolve, 300));
  loop.timeline = await finishFlightTimeline(sessionId);
  if (slowMotion) {
    await evaluate(
      sessionId,
      "document.querySelector('.case-study-loop-nav a.previous').scrollIntoView({ block: 'center' })",
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  await startFlightTimeline(sessionId, 'next detail → first detail');
  try {
    await evaluate(
      sessionId,
      slowMotion
        ? "document.querySelector('.case-study-loop-nav a.previous').click(), true"
        : 'history.back(), true',
    );
  } catch (error) {
    if (!String(error).includes('Inspected target navigated or closed'))
      throw error;
  }
  const detailBack = await waitForRoute(
    sessionId,
    firstDetailPath,
    'heroReady',
    2500,
  );
  if (detailBack.path !== firstDetailPath || !detailBack.landedReady)
    throw new Error(
      `Detail return missed ${firstDetailPath}; reached ${detailBack.path}`,
    );
  await waitForTransitionIdle(sessionId);
  detailBack.timeline = await finishFlightTimeline(sessionId);
  await startFlightTimeline(sessionId, 'detail → Home');
  try {
    await evaluate(
      sessionId,
      slowMotion
        ? "document.querySelector('.site-nav .home-link').click(), true"
        : 'history.back(), true',
    );
  } catch (error) {
    if (!String(error).includes('Inspected target navigated or closed'))
      throw error;
  }
  const homeBack = await waitForRoute(sessionId, '/', 'ready', 2500);
  if (homeBack.path !== '/' || !homeBack.landedReady)
    throw new Error(`Home return missed /; reached ${homeBack.path}`);
  await waitForTransitionIdle(sessionId);
  homeBack.timeline = await finishFlightTimeline(sessionId);
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
  if (failSource) {
    await call(
      'Page.addScriptToEvaluateOnNewDocument',
      {
        source: `(() => {
          const original = window.fetch;
          window.fetch = function(input, options) {
            const url = new URL(input instanceof Request ? input.url : input, location.href);
            if (url.pathname.includes('/wp-content/uploads/'))
              return Promise.reject(new Error('Probe blocked shader image fetch'));
            return original.call(this, input, options);
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
  if (includeRoutes) {
    await call(
      'Page.addScriptToEvaluateOnNewDocument',
      { source: `(${installFlightTimeline.toString()})()` },
      sessionId,
    );
  }
  await call(
    'Page.navigate',
    {
      url: directDetail
        ? `${origin}/case-studies/design-system-operations-at-uscis`
        : `${origin}/${disabled ? '?experimentalHalftone=0' : ''}#selected-work`,
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
  if (failSource) {
    const fallback = await evaluate(
      sessionId,
      `(() => {
        const image = document.querySelector(${JSON.stringify(directDetail ? '.hero-halftone-box img[data-featured-media-treatment="case-study-halftone"]' : '.selected-work-section .case-study-card img[data-featured-media-treatment="case-study-halftone"]')});
        const root = image?.closest('.hero-halftone-box, .card-halftone-box');
        return {
          path: location.pathname,
          imageLoaded: Boolean(image?.complete && image.naturalWidth),
          imageVisibility: image ? getComputedStyle(image).visibility : null,
          failed: Boolean(root?.classList.contains('is-live-halftone-failed')),
          ready: Boolean(root?.classList.contains('is-live-halftone-ready')),
          errors: window.__halftoneShader?.errors ?? [],
        };
      })()`,
    );
    const failures = [];
    if (!fallback.imageLoaded || fallback.imageVisibility !== 'visible')
      failures.push('failed shader source did not reveal the original image');
    if (!fallback.failed || fallback.ready)
      failures.push('failed shader source did not enter plain-image fallback');
    if (!fallback.errors.length)
      failures.push('shader source failure was not recorded');
    if (pageErrors.length) failures.push('page error');
    await call('Target.closeTarget', { targetId });
    console.log(JSON.stringify({ fallback, pageErrors, failures }, null, 2));
    if (failures.length) process.exitCode = 1;
    return;
  }
  if (directDetail) {
    const failures = [];
    if (!active.heroReady || !active.pixels.opaquePixels)
      failures.push('direct-entry hero did not draw live halftone');
    if (
      !active.startup?.firstVisibleImageAt ||
      !active.startup.firstLiveFrameAt
    )
      failures.push('direct-entry first-load timing was not observed');
    if (active.startup?.untreatedFrames)
      failures.push('direct-entry original was visible before live paint');
    if (active.errors.length || pageErrors.length)
      failures.push('direct-entry shader or page error');
    await call('Target.closeTarget', { targetId });
    console.log(JSON.stringify({ active, pageErrors, failures }, null, 2));
    if (failures.length) process.exitCode = 1;
    return;
  }
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
  const final = await evaluate(sessionId, `(${snapshot.toString()})()`);
  await new Promise((resolve) => setTimeout(resolve, 600));
  const finalIdle = await evaluate(sessionId, `(${snapshot.toString()})()`);
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
  if (first.errors.length || finalIdle.errors.length || pageErrors.length)
    failures.push('shader or page error');
  if (settled.draws > active.draws + 2)
    failures.push('renderer kept drawing after the page settled');
  if (finalIdle.draws > final.draws + 2)
    failures.push('renderer kept drawing after the final route settled');
  if (finalIdle.cloneLayers || finalIdle.cloneCanvases)
    failures.push('featured-media clone survived the final route');
  if (journey && (!journey.sawLiveClone || !journey.landedHero))
    failures.push('live clone or landed hero was not observed');
  if (journey && (!journey.imageHoverDraws || !journey.textHoverDraws))
    failures.push('image or text-plate hover did not invalidate live dots');
  if (routes?.loop && routes.loop.path === routes.detailBack?.path)
    failures.push('loop link did not navigate to another case study');
  if (routes?.loop && !routes.loop.sawLiveClone)
    failures.push('loop flight had no live clone');
  if (routes?.loop && !routes.loop.landedReady)
    failures.push('loop destination had no live hero');
  if (routes?.detailBack && !routes.detailBack.landedReady)
    failures.push('Back to first detail had no live hero');
  if (routes && (routes.homeBack.path !== '/' || !routes.homeBack.landedReady))
    failures.push('Back to Home had no live card');
  if (
    routes?.loop?.visibleWithoutLiveSamples ||
    routes?.homeBack.visibleWithoutLiveSamples
  )
    failures.push('flying case-study clone was visible without a live frame');
  for (const leg of [
    journey,
    routes?.loop,
    routes?.detailBack,
    routes?.homeBack,
  ]) {
    if (leg?.timeline?.reverseHandoffBlankFrames)
      failures.push(
        `${leg.timeline.label}: ${leg.timeline.reverseHandoffBlankFrames} frames hid both the source hero and replacement`,
      );
    if (leg?.timeline?.withoutLiveFrames)
      failures.push(
        `${leg.timeline.label}: ${leg.timeline.withoutLiveFrames} visible clone frames lacked live canvas`,
      );
  }
  console.log(
    JSON.stringify(
      {
        first,
        active,
        settled,
        journey,
        routes,
        final,
        finalIdle,
        pageErrors,
        failures,
      },
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
