#!/usr/bin/env node

// Verify GPU trail pixels and cleanup on real static case-study and writing round trips. Pixel readback perturbs performance: this is a correctness probe, not a smoothness benchmark.
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
const noWebgl = process.argv.includes('--no-webgl');
const reducedMotion = process.argv.includes('--reduced-motion');
const contextLoss = process.argv.includes('--context-loss');
const narrow = process.argv.includes('--narrow');
const profile = await mkdtemp(path.join(os.tmpdir(), 'gpu-trails-check-'));
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

function installProbe() {
  window.__trailPixels = {
    frames: 0,
    nonempty: 0,
    errors: [],
    contexts: 0,
    starts: [],
  };
  let lastFlightId = null;
  const original = WebGLRenderingContext.prototype.drawArrays;
  let lastCanvas = null;
  let checkedAt = -Infinity;
  WebGLRenderingContext.prototype.drawArrays = function (...args) {
    original.apply(this, args);
    if (
      !this.canvas.classList.contains('featured-media-trails') ||
      this.getParameter(this.FRAMEBUFFER_BINDING)
    )
      return;
    const state =
      document.querySelector('#__nuxt')?.__vue_app__?.config.globalProperties
        ?.$nuxt?.payload.state['$sfeatured-media-transition'];
    if (state?.flightId !== lastFlightId && state?.from) {
      lastFlightId = state.flightId;
      const viewport = Array.from(this.getParameter(this.VIEWPORT));
      const dpr = Math.min(devicePixelRatio, 1.5);
      window.__trailPixels.starts.push({
        flightId: state.flightId,
        expected: { ...state.from },
        actual: {
          left: viewport[0] / dpr,
          top: (this.canvas.height - viewport[1] - viewport[3]) / dpr,
          width: viewport[2] / dpr,
          height: viewport[3] / dpr,
        },
      });
    }
    if (lastCanvas !== this.canvas) {
      window.__trailPixels.contexts++;
      lastCanvas = this.canvas;
    }
    if (performance.now() - checkedAt < 50) return;
    checkedAt = performance.now();
    const pixels = new Uint8Array(
      this.drawingBufferWidth * this.drawingBufferHeight * 4,
    );
    this.readPixels(
      0,
      0,
      this.drawingBufferWidth,
      this.drawingBufferHeight,
      this.RGBA,
      this.UNSIGNED_BYTE,
      pixels,
    );
    let hasAlpha = false;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] > 0) {
        hasAlpha = true;
        break;
      }
    }
    window.__trailPixels.frames++;
    if (hasAlpha) window.__trailPixels.nonempty++;
    const error = this.getError();
    if (error) window.__trailPixels.errors.push(error);
  };
}
function snapshot() {
  return {
    path: location.pathname,
    trails: window.__featuredMediaTrails ?? null,
    pixels: window.__trailPixels,
    canvases: document.querySelectorAll('.featured-media-trails').length,
    clones: document.querySelectorAll('.ftml-layer--media').length,
  };
}
async function waitFor(sessionId, expression) {
  for (let i = 0; i < 100; i++) {
    if (await evaluate(sessionId, expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out: ${expression}`);
}
async function click(sessionId, selector) {
  await evaluate(
    sessionId,
    `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`,
  );
  await new Promise((resolve) => setTimeout(resolve, 250));
  const point = await evaluate(
    sessionId,
    `(() => {const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+Math.min(r.height/2,40)}})()`,
  );
  await call(
    'Input.dispatchMouseEvent',
    { type: 'mouseMoved', ...point },
    sessionId,
  );
  await new Promise((resolve) => setTimeout(resolve, 250));
  await call(
    'Input.dispatchMouseEvent',
    { type: 'mousePressed', button: 'left', clickCount: 1, ...point },
    sessionId,
  );
  await call(
    'Input.dispatchMouseEvent',
    { type: 'mouseReleased', button: 'left', clickCount: 1, ...point },
    sessionId,
  );
}
async function run() {
  const { targetId } = await call('Target.createTarget', {
    url: 'about:blank',
  });
  const { sessionId } = await call('Target.attachToTarget', {
    targetId,
    flatten: true,
  });
  await call('Page.enable', {}, sessionId);
  await call('Runtime.enable', {}, sessionId);
  await call(
    'Emulation.setDeviceMetricsOverride',
    {
      width: narrow ? 390 : 1726,
      height: narrow ? 844 : 923,
      deviceScaleFactor: 2,
      mobile: false,
    },
    sessionId,
  );
  await call(
    'Page.addScriptToEvaluateOnNewDocument',
    { source: `(${installProbe.toString()})()` },
    sessionId,
  );
  if (noWebgl)
    await call(
      'Page.addScriptToEvaluateOnNewDocument',
      {
        source: `const original=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl'||type==='experimental-webgl')return null;return original.call(this,type,...args);}`,
      },
      sessionId,
    );
  if (contextLoss)
    await call(
      'Page.addScriptToEvaluateOnNewDocument',
      {
        source: `const draw=WebGLRenderingContext.prototype.drawArrays;WebGLRenderingContext.prototype.drawArrays=function(...args){draw.apply(this,args);if(this.canvas.classList.contains('featured-media-trails')&&!this.canvas.dataset.loss){this.canvas.dataset.loss='1';this.getExtension('WEBGL_lose_context')?.loseContext();}};`,
      },
      sessionId,
    );
  if (reducedMotion)
    await call(
      'Emulation.setEmulatedMedia',
      { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
      sessionId,
    );
  const results = [];
  const failures = [];
  let caseStudyPath = null;
  for (const journey of [
    {
      name: 'case-study',
      start: '/#selected-work',
      selector:
        '.selected-work-section .case-study-card a[href^="/case-studies/"]',
      home: '.site-nav .home-link',
      counter: 'halftoneDraws',
    },
    {
      name: 'case-study-loop',
      start: null,
      selector: '.case-study-loop-nav a.next',
      home: '.case-study-loop-nav a.previous',
      counter: 'halftoneDraws',
    },
    {
      name: 'latest-writing',
      start: '/#latest-writing',
      selector: '.latest-writing-section .post-card a[href^="/writing/"]',
      home: '.site-nav .home-link',
      counter: 'photoDraws',
    },
    {
      name: 'archive',
      start: '/writing',
      selector: '.post-archive-row a.row-link',
      home: '.site-nav a[href="/writing"]',
      counter: 'photoDraws',
    },
  ]) {
    await call(
      'Page.navigate',
      { url: origin + (journey.start ?? caseStudyPath) },
      sessionId,
    );
    await waitFor(
      sessionId,
      `Boolean(document.querySelector(${JSON.stringify(journey.selector)}))`,
    );
    await new Promise((resolve) => setTimeout(resolve, 900));
    const href = await evaluate(
      sessionId,
      `new URL(document.querySelector(${JSON.stringify(journey.selector)}).href).pathname`,
    );
    if (journey.name === 'case-study') caseStudyPath = href;
    await click(sessionId, journey.selector);
    await waitFor(
      sessionId,
      `location.pathname===${JSON.stringify(href)}&&!document.querySelector('.ftml-layer--media')`,
    );
    await new Promise((resolve) => setTimeout(resolve, 250));
    const forward = await evaluate(sessionId, `(${snapshot.toString()})()`);
    // Site-nav Home is intentionally scroll-aware; a programmatic link click exercises the same handler even while visually hidden.
    await evaluate(
      sessionId,
      `document.querySelector(${JSON.stringify(journey.home)}).click()`,
    );
    const returnPath =
      journey.name === 'case-study-loop'
        ? caseStudyPath
        : journey.name === 'archive'
          ? '/writing'
          : '/';
    await waitFor(
      sessionId,
      `location.pathname===${JSON.stringify(returnPath)}&&!document.querySelector('.ftml-layer--media')`,
    );
    await new Promise((resolve) => setTimeout(resolve, 400));
    const back = await evaluate(sessionId, `(${snapshot.toString()})()`);
    if (!noWebgl && !reducedMotion && !contextLoss) {
      if (!(forward.trails?.[journey.counter] > 0))
        failures.push(`${journey.name}: no forward GPU draws`);
      if (!(back.trails?.[journey.counter] > forward.trails?.[journey.counter]))
        failures.push(`${journey.name}: no return GPU draws`);
      if (
        !forward.pixels.nonempty ||
        back.pixels.nonempty <= forward.pixels.nonempty
      )
        failures.push(`${journey.name}: missing rendered trail pixels`);
    }
    if (!noWebgl && !reducedMotion && !contextLoss) {
      if (back.pixels.starts.length !== 2)
        failures.push(`${journey.name}: missing first-frame trail geometry`);
      for (const start of back.pixels.starts) {
        if (
          ['left', 'top', 'width', 'height'].some(
            (key) => Math.abs(start.actual[key] - start.expected[key]) > 1,
          )
        )
          failures.push(
            `${journey.name}: first trail frame skipped the source position`,
          );
      }
    }
    if (noWebgl || reducedMotion) {
      if (back.trails?.draws || back.pixels.nonempty)
        failures.push(
          `${journey.name}: trails drawn despite fallback/reduced motion`,
        );
    }
    if (back.canvases || back.clones || back.trails?.active)
      failures.push(`${journey.name}: leftover trail or clone`);
    if (back.pixels.errors.length && !contextLoss)
      failures.push(`${journey.name}: GPU error`);
    if (back.trails?.errors.length)
      failures.push(`${journey.name}: trail error`);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const idle = await evaluate(
      sessionId,
      `window.__featuredMediaTrails?.draws??0`,
    );
    if (idle !== (back.trails?.draws ?? 0))
      failures.push(`${journey.name}: trails kept drawing at idle`);
    results.push({ journey: journey.name, forward, back });
  }
  if (pageErrors.length) failures.push('Page errors');
  console.log(
    JSON.stringify(
      {
        origin,
        narrow,
        noWebgl,
        reducedMotion,
        contextLoss,
        results,
        pageErrors,
        failures,
      },
      null,
      2,
    ),
  );
  await call('Target.closeTarget', { targetId });
  if (failures.length) process.exitCode = 1;
}
try {
  await run();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  chrome.kill('SIGTERM');
  await rm(profile, { recursive: true, force: true, maxRetries: 5 });
}
