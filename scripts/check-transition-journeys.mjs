#!/usr/bin/env node

// Round-trip transition check. Drives system Chrome over the DevTools pipe (no browser library), clicks real cards with a real pointer, then walks Back.
// It encodes the structural motion contract that visual QA keeps re-finding: surroundings must physically leave, nothing may stay still and then vanish, no clone may be stranded, and Back must restore a visible source card.
// It does not judge easing, timing feel or appearance. Those stay with human QA.

import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const DEFAULT_CHROME =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const JOURNEYS = [
  {
    name: 'case-study',
    startPath: '/',
    startHash: '#selected-work',
    linkSelector:
      '.selected-work-section .case-study-card a[href^="/case-studies/"]',
  },
  {
    // Same click with the card at the bottom of the viewport, so the hero section is still partly in view.
    name: 'case-study-hero-in-view',
    startPath: '/',
    startHash: '#selected-work',
    linkSelector:
      '.selected-work-section .case-study-card a[href^="/case-studies/"]',
    cardAt: 'bottom',
  },
  {
    name: 'latest-writing',
    startPath: '/',
    startHash: '#latest-writing',
    linkSelector: '.latest-writing-section .post-card a[href^="/writing/"]',
  },
  {
    name: 'archive',
    startPath: '/writing',
    startHash: '',
    linkSelector: '.post-archive-row a.row-link',
    // The second visible row has neighbours on both sides, which exercises the ripple in both directions.
    linkIndex: 1,
  },
];

// Elements handed to the flying clone. They disappear under the clone by design, so they are not surroundings.
const SHARED_SELECTOR = [
  '[data-featured-media-source]',
  '[data-featured-media-target]',
  '[data-featured-title-source]',
  '[data-featured-title-target]',
].join(', ');

const CLONE_SELECTOR =
  '.ftml-layer--media .shell-plate, .ftml-layer--media .frame, .ftml-layer--text .text-plate';

const HYDRATION_TIMEOUT_MS = 15000;
const SETTLE_TIMEOUT_MS = 12000;
const HOVER_DWELL_MS = 400;
const RETURN_REVEAL_TIMEOUT_MS = 3000;
const POLL_INTERVAL_MS = 100;

function parseArguments(argv) {
  const values = new Map(
    argv.map((argument) => {
      const [key, value = 'true'] = argument.replace(/^--/, '').split('=');
      return [key, value];
    }),
  );
  const journeyNames = (values.get('journey') ?? '').split(',').filter(Boolean);

  return {
    origin: values.get('origin') ?? 'http://127.0.0.1:3002',
    width: Number(values.get('width') ?? 1512),
    height: Number(values.get('height') ?? 945),
    deviceScaleFactor: Number(values.get('dpr') ?? 1),
    journeys: journeyNames.length
      ? JOURNEYS.filter((journey) => journeyNames.includes(journey.name))
      : JOURNEYS,
    json: values.has('json'),
    shader: values.has('shader'),
    linkText: values.get('link-text') ?? null,
    cardAt: values.get('card-at') ?? null,
    finishingGraceMs: Number(values.get('finishing-grace-ms') ?? 34),
    traceSurroundings: values.has('trace-surroundings'),
    chrome: process.env.CHROME_BIN ?? DEFAULT_CHROME,
  };
}

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

// Minimal DevTools protocol client over --remote-debugging-pipe: NUL-delimited JSON on fds 3 (to Chrome) and 4 (from Chrome).
function connectToChrome(chromePath, profileDirectory, options) {
  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      `--user-data-dir=${profileDirectory}`,
      '--remote-debugging-pipe',
      `--window-size=${options.width},${options.height}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] },
  );
  const pending = new Map();
  const listeners = [];
  let buffer = '';
  let nextId = 0;
  let stderr = '';

  chrome.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  chrome.stdio[4].on('data', (chunk) => {
    buffer += chunk;

    while (buffer.includes('\0')) {
      const end = buffer.indexOf('\0');
      const message = JSON.parse(buffer.slice(0, end));
      buffer = buffer.slice(end + 1);

      if (message.method) {
        listeners.forEach((listener) => listener(message));
        continue;
      }

      const request = pending.get(message.id);

      if (!request) {
        continue;
      }

      pending.delete(message.id);

      if (message.error) {
        request.reject(new Error(JSON.stringify(message.error)));
      } else {
        request.resolve(message.result);
      }
    }
  });

  chrome.on('exit', (code) => {
    for (const request of pending.values()) {
      request.reject(new Error(`Chrome exited ${code}: ${stderr.slice(-500)}`));
    }
  });

  function call(method, params = {}, sessionId) {
    return new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      chrome.stdio[3].write(
        JSON.stringify({ id, method, params, sessionId }) + '\0',
      );
    });
  }

  function close() {
    const exited = new Promise((resolve) => chrome.once('exit', resolve));
    chrome.kill('SIGTERM');
    return exited;
  }

  return {
    call,
    onEvent: (listener) => listeners.push(listener),
    close,
  };
}

async function evaluate(browser, sessionId, expression) {
  const result = await browser.call(
    'Runtime.evaluate',
    { expression, awaitPromise: true, returnByValue: true },
    sessionId,
  );

  if (result.exceptionDetails) {
    const description =
      result.exceptionDetails.exception?.description ??
      result.exceptionDetails.text;
    throw new Error(description);
  }

  return result.result.value;
}

// Serialize a page-side function with its argument. Page functions must stay self-contained.
function pageCall(pageFunction, argument) {
  return `(${pageFunction.toString()})(${JSON.stringify(argument ?? null)})`;
}

async function pollUntil(read, isDone, timeout) {
  const deadline = Date.now() + timeout;
  let value = await read();

  while (!isDone(value) && Date.now() < deadline) {
    await wait(POLL_INTERVAL_MS);
    value = await read();
  }

  return { value, timedOut: !isDone(value) };
}

// ---- Page-side functions -------------------------------------------------

function readNavigationState() {
  const payloadState =
    document.querySelector('#__nuxt')?.__vue_app__?.config?.globalProperties
      ?.$nuxt?.payload?.state;
  const transition = payloadState?.['$sfeatured-media-transition'];

  return {
    path: location.pathname,
    hydrated:
      document.readyState === 'complete' &&
      Boolean(document.querySelector('#__nuxt')?.__vue_app__),
    cloneLayers: document.querySelectorAll('.ftml-layer').length,
    transitionActive: Boolean(transition?.active),
    transitionPhase: transition?.phase ?? 'unknown',
  };
}

// Scroll so the target card's bottom sits just inside the viewport, leaving as much of the page above it in view as possible.
function alignCardToViewportBottom({ linkSelector, linkIndex, linkText }) {
  const links = [...document.querySelectorAll(linkSelector)];
  const link = linkText
    ? links.find((candidate) => candidate.textContent.includes(linkText))
    : links[linkIndex ?? 0];

  if (!link) {
    return null;
  }

  const card =
    link.closest('[data-transition-source], .case-study-card') ?? link;
  const rect = card.getBoundingClientRect();
  window.scrollBy(0, rect.bottom - innerHeight + 8);

  return Math.round(scrollY);
}

function chooseClickTarget({ linkSelector, linkIndex, linkText }) {
  const allLinks = [...document.querySelectorAll(linkSelector)];
  const links = linkText
    ? allLinks.filter((link) => link.textContent.includes(linkText))
    : allLinks;

  function isClickable(link) {
    const rect = link.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + Math.min(rect.height / 2, 60);
    const insideViewport =
      rect.top >= 0 && rect.bottom <= innerHeight && rect.width > 0;

    if (!insideViewport) {
      return null;
    }

    const hit = document.elementFromPoint(centerX, centerY);

    if (!hit || !link.contains(hit)) {
      return null;
    }

    return { x: centerX, y: centerY };
  }

  const clickable = links
    .map((link) => ({ link, point: isClickable(link) }))
    .filter((entry) => entry.point);
  const chosen = clickable[linkIndex ?? 0] ?? clickable[0];

  if (!chosen) {
    const fallback = links[linkIndex ?? 0] ?? links[0];
    fallback?.scrollIntoView({ block: 'center' });
    return { found: false, linkCount: links.length };
  }

  document
    .querySelectorAll('[data-qa-clicked]')
    .forEach((element) => element.removeAttribute('data-qa-clicked'));
  chosen.link.setAttribute('data-qa-clicked', '');

  return {
    found: true,
    href: chosen.link.getAttribute('href'),
    x: chosen.point.x,
    y: chosen.point.y,
    scrollY: Math.round(scrollY),
  };
}

// Records every directly painted element of the current page from the click until it disconnects (page swap or v-if removal), then judges how it left.
function installMotionRecorder(settings) {
  const minimumArea = settings.minimumVisibleArea;
  const minimumSide = settings.minimumVisibleSide;
  const minimumUncoveredArea = settings.minimumUncoveredArea;
  const stillTolerance = settings.stillTolerance;
  const viewport = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
  const startedAt = performance.now();
  const clicked = document.querySelector('[data-qa-clicked]');
  const sourceRoot = clicked?.closest('[data-transition-source]') ?? clicked;

  function toBox(rect) {
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
    };
  }

  function intersect(first, second, axes = { x: true, y: true }) {
    if (!first) {
      return null;
    }

    const box = { ...first };

    if (axes.x) {
      box.left = Math.max(first.left, second.left);
      box.right = Math.min(first.right, second.right);
    }

    if (axes.y) {
      box.top = Math.max(first.top, second.top);
      box.bottom = Math.min(first.bottom, second.bottom);
    }

    if (box.right <= box.left || box.bottom <= box.top) {
      return null;
    }

    return box;
  }

  function areaOf(box) {
    if (!box) {
      return 0;
    }

    return (box.right - box.left) * (box.bottom - box.top);
  }

  // Sub-pixel slivers along a clip edge are not something a person can see vanish.
  function isNoticeable(sample, minimumAlpha) {
    const box = sample.visibleBox;

    if (!box || sample.alpha < minimumAlpha) {
      return false;
    }

    const wideEnough = box.right - box.left >= minimumSide;
    const tallEnough = box.bottom - box.top >= minimumSide;

    return sample.visibleArea >= minimumArea && wideEnough && tallEnough;
  }

  function isTransparent(color) {
    return color === 'transparent' || /,\s*0\)$/.test(color);
  }

  function paintsDirectly(element) {
    if (element.matches('img, svg, video, canvas, hr')) {
      return true;
    }

    const hasOwnText = [...element.childNodes].some(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
    );

    if (hasOwnText) {
      return true;
    }

    const style = getComputedStyle(element);
    const hasBackground =
      style.backgroundImage !== 'none' || !isTransparent(style.backgroundColor);
    const hasBorder =
      parseFloat(style.borderTopWidth) > 0 &&
      !isTransparent(style.borderTopColor);

    return hasBackground || hasBorder;
  }

  function clippingAncestors(element) {
    const clips = [];
    let ancestor = element.parentElement;

    while (ancestor && ancestor !== document.documentElement) {
      const style = getComputedStyle(ancestor);
      const clipsBoth =
        style.clipPath !== 'none' || /paint|strict|content/.test(style.contain);
      const clipsX = clipsBoth || style.overflowX !== 'visible';
      const clipsY = clipsBoth || style.overflowY !== 'visible';

      if (clipsX || clipsY) {
        clips.push({ element: ancestor, axes: { x: clipsX, y: clipsY } });
      }

      ancestor = ancestor.parentElement;
    }

    return clips;
  }

  function describe(element) {
    const parts = [];
    let node = element;

    while (node && node !== document.body && parts.length < 4) {
      const firstClass = [...node.classList].find(
        (name) => !name.startsWith('data-v-'),
      );
      let part = node.tagName.toLowerCase();

      if (firstClass) {
        part += `.${firstClass}`;
      }

      parts.unshift(part);
      node = node.parentElement;
    }

    return parts.join(' > ');
  }

  // Per-frame memo so shared ancestors are measured once per frame.
  function createFrame() {
    const rects = new Map();
    const alphas = new Map();

    function rectOf(element) {
      if (!rects.has(element)) {
        rects.set(element, element.getBoundingClientRect());
      }

      return rects.get(element);
    }

    function alphaOf(element) {
      if (!element || element === document.documentElement) {
        return 1;
      }

      if (!alphas.has(element)) {
        const own = Number(getComputedStyle(element).opacity);
        alphas.set(element, own * alphaOf(element.parentElement));
      }

      return alphas.get(element);
    }

    const clones = [...document.querySelectorAll(settings.cloneSelector)]
      .filter((clone) => alphaOf(clone) > 0.9)
      .map((clone) => toBox(rectOf(clone)));

    // Milliseconds of finite motion still scheduled on each animated element this frame.
    const remainingByTarget = new Map();

    for (const animation of document.getAnimations()) {
      const target = animation.effect?.target;
      const timing = animation.effect?.getComputedTiming();

      if (!target || !timing || !Number.isFinite(timing.endTime)) {
        continue;
      }

      const remaining = Math.max(
        0,
        timing.endTime - (timing.localTime ?? timing.endTime),
      );
      const known = remainingByTarget.get(target) ?? 0;
      remainingByTarget.set(target, Math.max(known, remaining));
    }

    // Motion on an element or any ancestor moves it; null means nothing scheduled.
    function remainingMotionOf(element) {
      let remaining = null;
      let node = element;

      while (node && node !== document.documentElement) {
        if (remainingByTarget.has(node)) {
          remaining = Math.max(remaining ?? 0, remainingByTarget.get(node));
        }

        node = node.parentElement;
      }

      return remaining;
    }

    return { rectOf, alphaOf, clones, remainingMotionOf };
  }

  // Exact union area of the clone boxes inside `box`, by coordinate compression. A shell's border ring is a thin sliver of its area, so a percentage threshold would hide exactly the part a person sees vanish.
  function areaCoveredByClones(box, frame) {
    if (!box) {
      return 0;
    }

    const pieces = frame.clones
      .map((clone) => intersect(box, clone))
      .filter(Boolean);

    if (!pieces.length) {
      return 0;
    }

    const xs = [
      ...new Set(pieces.flatMap((piece) => [piece.left, piece.right])),
    ];
    const ys = [
      ...new Set(pieces.flatMap((piece) => [piece.top, piece.bottom])),
    ];
    xs.sort((first, second) => first - second);
    ys.sort((first, second) => first - second);
    let covered = 0;

    for (let column = 0; column < xs.length - 1; column += 1) {
      for (let row = 0; row < ys.length - 1; row += 1) {
        const centerX = (xs[column] + xs[column + 1]) / 2;
        const centerY = (ys[row] + ys[row + 1]) / 2;
        const isCovered = pieces.some(
          (piece) =>
            centerX > piece.left &&
            centerX < piece.right &&
            centerY > piece.top &&
            centerY < piece.bottom,
        );

        if (isCovered) {
          covered += (xs[column + 1] - xs[column]) * (ys[row + 1] - ys[row]);
        }
      }
    }

    return covered;
  }

  function uncoveredArea(box, frame) {
    return Math.max(0, areaOf(box) - areaCoveredByClones(box, frame));
  }

  function coverageByClones(box, frame) {
    const area = areaOf(box);

    if (!area) {
      return 0;
    }

    return areaCoveredByClones(box, frame) / area;
  }

  function measure(candidate, frame) {
    const element = candidate.element;
    const rect = toBox(frame.rectOf(element));
    let visibleBox = intersect(rect, viewport);

    for (const clip of candidate.clips) {
      visibleBox = intersect(visibleBox, frame.rectOf(clip.element), clip.axes);
    }

    const shown = element.checkVisibility({ visibilityProperty: true });
    let alpha = 0;

    if (shown) {
      alpha = frame.alphaOf(element);
    }

    return {
      rect,
      visibleBox,
      visibleArea: areaOf(visibleBox),
      alpha,
      remainingMs: frame.remainingMotionOf(element),
    };
  }

  function travel(first, second) {
    return Math.max(
      Math.abs(first.left - second.left),
      Math.abs(first.top - second.top),
      Math.abs(first.right - second.right),
      Math.abs(first.bottom - second.bottom),
    );
  }

  const initialFrame = createFrame();
  const all = [...document.querySelectorAll('#__nuxt *')].filter(
    (element) => !element.closest('svg') || element.matches('svg'),
  );
  const isPageBackdrop = (visibleArea) => visibleArea >= 0.9 * areaOf(viewport);

  const candidates = all
    .filter((element) => !element.closest(settings.sharedSelector))
    .filter((element) => !element.closest('.ftml-layer'))
    .filter(paintsDirectly)
    .map((element) => {
      const candidate = { element, clips: clippingAncestors(element) };
      candidate.initial = measure(candidate, initialFrame);
      return candidate;
    })
    .filter(
      (candidate) =>
        isNoticeable(candidate.initial, 0.5) &&
        !isPageBackdrop(candidate.initial.visibleArea),
    )
    .sort(
      (first, second) => second.initial.visibleArea - first.initial.visibleArea,
    )
    .slice(0, settings.maximumCandidates);

  candidates.forEach((candidate) => {
    candidate.samples = [candidate.initial];
    candidate.isSourceShell = candidate.element === sourceRoot;
  });

  const issues = [];
  // Frame-by-frame record of the clicked card's own shell, for diagnosing how it hands off to the clone.
  const shellTimeline = [];
  const surroundingTimelines = settings.traceSurroundings ? [] : null;
  const shell = candidates.find((candidate) => candidate.isSourceShell);
  const surroundingCards = settings.traceSurroundings
    ? candidates.filter(
        (candidate) =>
          candidate.element.matches('.post-card') && !candidate.isSourceShell,
      )
    : [];
  const surroundingTimelineByElement = new Map(
    surroundingCards.map((candidate) => {
      const timeline = {
        title: candidate.element.textContent
          .trim()
          .replace(/\s+/g, ' ')
          .slice(0, 80),
        samples: [],
      };
      surroundingTimelines.push(timeline);
      return [candidate.element, timeline];
    }),
  );
  let frames = 0;
  let running = true;

  function recordShell(sample, frame) {
    shellTimeline.push({
      t: Math.round(performance.now() - startedAt),
      path: location.pathname,
      visibleArea: Math.round(sample.visibleArea),
      alpha: Number(sample.alpha.toFixed(2)),
      movedPx: Math.round(travel(sample.rect, shell.initial.rect)),
      coveredByClone: Number(
        coverageByClones(sample.visibleBox, frame).toFixed(2),
      ),
    });
  }

  function report(candidate, kind, sample, details = {}) {
    const text = candidate.element.textContent.trim().replace(/\s+/g, ' ');
    const box = sample.visibleBox;

    issues.push({
      element: candidate.element,
      kind,
      label: describe(candidate.element),
      text: text.slice(0, 48),
      isSourceShell: candidate.isSourceShell,
      atMs: Math.round(performance.now() - startedAt),
      path: location.pathname,
      visibleArea: Math.round(sample.visibleArea),
      visibleWidth: box ? Math.round(box.right - box.left) : 0,
      visibleHeight: box ? Math.round(box.bottom - box.top) : 0,
      alpha: Number(sample.alpha.toFixed(2)),
      ...details,
    });
  }

  // The element disconnected. Judge the last frame in which it painted.
  function judgeDeparture(candidate, frame) {
    const last = candidate.samples.at(-1);

    if (!isNoticeable(last, 0.05)) {
      return;
    }

    if (uncoveredArea(last.visibleBox, frame) < minimumUncoveredArea) {
      return;
    }

    const moved = travel(last.rect, candidate.initial.rect);

    if (moved < stillTolerance) {
      report(candidate, 'still-then-vanished', last);
      return;
    }

    report(candidate, 'exit-incomplete', last, { movedPx: Math.round(moved) });
  }

  // Visible in one frame and gone in the next without moving: a pop, unless the clone now covers the same area.
  function judgePop(candidate, frame) {
    const [beforePrevious, previous, current] = candidate.samples.slice(-3);

    if (!previous || !current || candidate.popped) {
      return;
    }

    const wasShown = isNoticeable(previous, 0.5);
    const isGone = current.visibleArea < 1 || current.alpha < 0.05;
    const wasStill =
      !beforePrevious || travel(previous.rect, beforePrevious.rect) < 1;
    // Clipping away while moving is a slit or an ordinary exit. Being hidden while still on screen is a pop even mid-motion: an exit the page swap cut short.
    const hiddenInPlace =
      current.alpha < 0.05 && current.visibleArea >= minimumArea;

    if (!wasShown || !isGone) {
      return;
    }

    if (!wasStill && !hiddenInPlace) {
      return;
    }

    // The snappy ease-in covers most of its distance in the last frame or two, so a swap landing within that window reads as the exit finishing.
    const nearlyFinished =
      previous.remainingMs !== null &&
      previous.remainingMs <= settings.finishingGraceMs;

    if (!wasStill && nearlyFinished) {
      return;
    }

    const exposed = uncoveredArea(previous.visibleBox, frame);

    if (exposed < minimumUncoveredArea) {
      return;
    }

    candidate.popped = true;
    let kind = 'popped';

    if (!wasStill) {
      kind = 'cut-short';
    }

    report(candidate, kind, previous, {
      coveredByClone: Number(
        coverageByClones(previous.visibleBox, frame).toFixed(2),
      ),
      exposedArea: Math.round(exposed),
      movedPx: Math.round(travel(previous.rect, candidate.initial.rect)),
      remainingMs:
        previous.remainingMs === null ? null : Math.round(previous.remainingMs),
    });
  }

  function step() {
    if (!running) {
      return;
    }

    frames += 1;
    const frame = createFrame();

    for (const candidate of candidates) {
      if (candidate.departed) {
        continue;
      }

      if (!candidate.element.isConnected) {
        candidate.departed = true;
        const timeline = surroundingTimelineByElement.get(candidate.element);
        if (timeline) {
          timeline.removedAtMs = Math.round(performance.now() - startedAt);
        }
        judgeDeparture(candidate, frame);
        continue;
      }

      const sample = measure(candidate, frame);
      const timeline = surroundingTimelineByElement.get(candidate.element);
      if (timeline) {
        timeline.samples.push({
          t: Math.round(performance.now() - startedAt),
          visibleArea: Math.round(sample.visibleArea),
          alpha: Number(sample.alpha.toFixed(2)),
          left: Math.round(sample.rect.left),
          top: Math.round(sample.rect.top),
          right: Math.round(sample.rect.right),
          bottom: Math.round(sample.rect.bottom),
          remainingMs:
            sample.remainingMs === null ? null : Math.round(sample.remainingMs),
        });
      }
      candidate.samples.push(sample);

      if (candidate.samples.length > 4) {
        candidate.samples.shift();
      }

      if (candidate === shell) {
        recordShell(sample, frame);
      }

      judgePop(candidate, frame);
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);

  function outermostIssues() {
    return issues.filter(
      (issue) =>
        !issues.some(
          (other) =>
            other !== issue &&
            other.kind === issue.kind &&
            other.element.contains(issue.element),
        ),
    );
  }

  window.__qaMotion = {
    stop() {
      running = false;
      const departed = candidates.filter((candidate) => candidate.departed);

      return {
        frames,
        candidates: candidates.length,
        departed: departed.length,
        persisted: candidates.length - departed.length,
        issues: outermostIssues().map(({ element, ...issue }) => issue),
        shellTimeline,
        surroundingTimelines,
      };
    },
  };

  return { candidates: candidates.length, hasSourceShell: Boolean(sourceRoot) };
}

function checkSettledDestination() {
  const heading = document.querySelector('main h1, h1');

  if (!heading) {
    return { headingFound: false };
  }

  let alpha = 1;
  let node = heading;

  while (node && node !== document.documentElement) {
    alpha *= Number(getComputedStyle(node).opacity);
    node = node.parentElement;
  }

  const rect = heading.getBoundingClientRect();

  return {
    headingFound: true,
    headingAlpha: Number(alpha.toFixed(2)),
    headingInView: rect.bottom > 0 && rect.top < innerHeight,
  };
}

function checkReturnedSource(href) {
  const link = [...document.querySelectorAll('a')].find(
    (candidate) => candidate.getAttribute('href') === href,
  );

  if (!link) {
    return { sourceFound: false };
  }

  const root = link.closest('[data-transition-source]') ?? link;
  const media = root.querySelector('[data-featured-media-source]');
  const rect = root.getBoundingClientRect();

  function alphaOf(element) {
    let alpha = 1;
    let node = element;

    while (node && node !== document.documentElement) {
      alpha *= Number(getComputedStyle(node).opacity);
      node = node.parentElement;
    }

    return alpha;
  }

  return {
    sourceFound: true,
    sourceInView: rect.bottom > 0 && rect.top < innerHeight,
    sourceAlpha: Number(alphaOf(root).toFixed(2)),
    mediaAlpha: media ? Number(alphaOf(media).toFixed(2)) : null,
    mediaShown: media
      ? media.checkVisibility({ visibilityProperty: true })
      : null,
  };
}

// ---- Journey runner ------------------------------------------------------

const RECORDER_SETTINGS = {
  minimumVisibleArea: 64,
  minimumVisibleSide: 4,
  // Roughly a 1px ring around a small card: the least a person notices vanishing.
  minimumUncoveredArea: 400,
  // Two 60Hz frames: an exit hidden this close to its scheduled end reads as leaving.
  finishingGraceMs: 34,
  stillTolerance: 2,
  maximumCandidates: 300,
  sharedSelector: SHARED_SELECTOR,
  cloneSelector: CLONE_SELECTOR,
};

async function openPage(browser, options, url, pageErrors) {
  const { targetId } = await browser.call('Target.createTarget', {
    url: 'about:blank',
  });
  const { sessionId } = await browser.call('Target.attachToTarget', {
    targetId,
    flatten: true,
  });

  browser.onEvent((message) => {
    if (message.sessionId !== sessionId) {
      return;
    }

    if (message.method === 'Runtime.exceptionThrown') {
      const details = message.params.exceptionDetails;
      pageErrors.push(details.exception?.description ?? details.text);
    }

    if (
      message.method === 'Runtime.consoleAPICalled' &&
      message.params.type === 'error'
    ) {
      const text = message.params.args
        .map((argument) => argument.value ?? argument.description ?? '')
        .join(' ');
      pageErrors.push(`console.error: ${text}`);
    }
  });

  await browser.call('Runtime.enable', {}, sessionId);
  await browser.call('Page.enable', {}, sessionId);
  await browser.call(
    'Emulation.setDeviceMetricsOverride',
    {
      width: options.width,
      height: options.height,
      deviceScaleFactor: options.deviceScaleFactor,
      mobile: false,
    },
    sessionId,
  );
  await browser.call('Page.navigate', { url }, sessionId);

  return { targetId, sessionId };
}

async function readState(browser, sessionId) {
  return evaluate(browser, sessionId, pageCall(readNavigationState));
}

async function waitForSettledPath(browser, sessionId, isExpectedPath) {
  const isSettled = (state) =>
    isExpectedPath(state.path) &&
    state.cloneLayers === 0 &&
    !state.transitionActive;

  return pollUntil(
    () => readState(browser, sessionId),
    isSettled,
    SETTLE_TIMEOUT_MS,
  );
}

async function clickLikeAPerson(browser, sessionId, point) {
  const base = { x: point.x, y: point.y, button: 'left', clickCount: 1 };

  await browser.call(
    'Input.dispatchMouseEvent',
    { type: 'mouseMoved', x: point.x, y: point.y },
    sessionId,
  );
  await wait(HOVER_DWELL_MS);

  return async function press() {
    await browser.call(
      'Input.dispatchMouseEvent',
      { ...base, type: 'mousePressed' },
      sessionId,
    );
    await browser.call(
      'Input.dispatchMouseEvent',
      { ...base, type: 'mouseReleased' },
      sessionId,
    );
  };
}

async function recordLeg(browser, sessionId, action, isExpectedPath, options) {
  const recorder = await evaluate(
    browser,
    sessionId,
    pageCall(installMotionRecorder, {
      ...RECORDER_SETTINGS,
      finishingGraceMs: options.finishingGraceMs,
      traceSurroundings: options.traceSurroundings,
    }),
  );

  await action();
  const settled = await waitForSettledPath(browser, sessionId, isExpectedPath);
  // Trailing entrance work can still be in flight after the clone leaves.
  await wait(400);
  const motion = await evaluate(browser, sessionId, 'window.__qaMotion.stop()');

  return { recorder, settled, motion };
}

async function runJourney(browser, options, journey) {
  journey = {
    ...journey,
    ...(options.linkText ? { linkText: options.linkText } : {}),
    ...(options.cardAt ? { cardAt: options.cardAt } : {}),
  };
  const pageErrors = [];
  const failures = [];
  const startUrl = new URL(
    `${journey.startPath}${journey.startHash}`,
    options.origin,
  );
  if (options.shader) {
    startUrl.searchParams.set('experimentalHalftone', '1');
  }
  const { targetId, sessionId } = await openPage(
    browser,
    options,
    startUrl.href,
    pageErrors,
  );

  try {
    const ready = await pollUntil(
      () => readState(browser, sessionId),
      (state) => state.hydrated,
      HYDRATION_TIMEOUT_MS,
    );

    if (ready.timedOut) {
      failures.push('start page did not hydrate');
      return { journey: journey.name, failures, pageErrors };
    }

    await evaluate(browser, sessionId, 'document.fonts.ready.then(() => true)');
    await wait(1200);

    if (journey.cardAt === 'bottom') {
      await evaluate(
        browser,
        sessionId,
        pageCall(alignCardToViewportBottom, journey),
      );
      await wait(600);
    }

    let target = await evaluate(
      browser,
      sessionId,
      pageCall(chooseClickTarget, journey),
    );

    if (!target.found) {
      await wait(800);
      target = await evaluate(
        browser,
        sessionId,
        pageCall(chooseClickTarget, journey),
      );
    }

    if (!target.found) {
      failures.push(`no clickable ${journey.linkSelector} in view`);
      return { journey: journey.name, failures, pageErrors };
    }

    const press = await clickLikeAPerson(browser, sessionId, target);
    const forward = await recordLeg(
      browser,
      sessionId,
      press,
      (currentPath) => currentPath === target.href,
      options,
    );

    if (forward.settled.timedOut) {
      failures.push(
        `forward did not settle on ${target.href} (at ${forward.settled.value.path}, ${forward.settled.value.cloneLayers} clone layers, phase ${forward.settled.value.transitionPhase})`,
      );
    }

    const destination = await evaluate(
      browser,
      sessionId,
      pageCall(checkSettledDestination),
    );

    if (!destination.headingFound || destination.headingAlpha < 0.99) {
      failures.push(
        `destination heading not fully shown (${JSON.stringify(destination)})`,
      );
    }

    await wait(600);
    const back = await recordLeg(
      browser,
      sessionId,
      () => evaluate(browser, sessionId, 'history.back(), true'),
      (currentPath) => currentPath === journey.startPath,
      options,
    );

    if (back.settled.timedOut) {
      failures.push(
        `Back did not settle on ${journey.startPath} (at ${back.settled.value.path}, ${back.settled.value.cloneLayers} clone layers, phase ${back.settled.value.transitionPhase})`,
      );
    }

    // Return entrances (ripples, thumbnail decode gates) may legitimately finish after the clone is released.
    const returnCheck = await pollUntil(
      () =>
        evaluate(
          browser,
          sessionId,
          pageCall(checkReturnedSource, target.href),
        ),
      (state) =>
        state.sourceFound &&
        state.sourceInView &&
        state.sourceAlpha >= 0.99 &&
        state.mediaShown !== false,
      RETURN_REVEAL_TIMEOUT_MS,
    );
    const returned = returnCheck.value;

    if (!returned.sourceFound || !returned.sourceInView) {
      failures.push(
        `Back did not restore the source card in view (${JSON.stringify(returned)})`,
      );
    } else if (returned.sourceAlpha < 0.99 || returned.mediaShown === false) {
      failures.push(
        `source card still concealed ${RETURN_REVEAL_TIMEOUT_MS}ms after Back settled (${JSON.stringify(returned)})`,
      );
    }

    for (const [legName, leg] of [
      ['forward', forward],
      ['back', back],
    ]) {
      for (const issue of leg.motion.issues) {
        failures.push({ leg: legName, ...issue });
      }
    }

    return {
      journey: journey.name,
      clicked: target.href,
      clickedAtScrollY: target.scrollY,
      failures,
      pageErrors,
      forward: {
        frames: forward.motion.frames,
        candidates: forward.motion.candidates,
        shellTimeline: forward.motion.shellTimeline,
        surroundingTimelines: forward.motion.surroundingTimelines,
      },
      back: { frames: back.motion.frames, candidates: back.motion.candidates },
    };
  } finally {
    await browser.call('Target.closeTarget', { targetId });
  }
}

function describeFailure(failure) {
  if (typeof failure === 'string') {
    return failure;
  }

  const shell = failure.isSourceShell ? ' [clicked card shell]' : '';
  const text = failure.text ? ` “${failure.text}”` : '';
  const size = `${failure.visibleWidth}×${failure.visibleHeight}px visible`;
  const timing = `at ${failure.atMs}ms on ${failure.path}`;

  if (failure.kind === 'still-then-vanished') {
    return `${failure.leg}: ${failure.label}${shell}${text} stayed still and visible, then vanished (${size}, ${timing})`;
  }

  if (failure.kind === 'exit-incomplete') {
    return `${failure.leg}: ${failure.label}${shell}${text} moved ${failure.movedPx}px but was still on screen when it vanished (${size}, ${timing})`;
  }

  if (failure.kind === 'cut-short') {
    return `${failure.leg}: ${failure.label}${shell}${text} was hidden mid-exit after moving ${failure.movedPx}px with ${failure.remainingMs ?? 'unknown'}ms of motion left, while still on screen (${size}, ${failure.exposedArea}px² not under the clone, ${timing})`;
  }

  return `${failure.leg}: ${failure.label}${shell}${text} popped out in one frame without moving (${size}, ${failure.exposedArea}px² not under the clone, ${timing})`;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const profileDirectory = await mkdtemp(
    path.join(os.tmpdir(), 'transition-journeys-'),
  );
  const browser = connectToChrome(options.chrome, profileDirectory, options);
  const results = [];

  try {
    for (const journey of options.journeys) {
      results.push(await runJourney(browser, options, journey));
    }
  } finally {
    await browser.close();
    await rm(profileDirectory, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 200,
    });
  }

  const failed = results.filter(
    (result) => result.failures.length || result.pageErrors.length,
  );

  if (options.json) {
    console.log(JSON.stringify({ options, results }, null, 2));
  } else {
    console.log(
      `Transition journeys: ${options.origin} at ${options.width}×${options.height}\n`,
    );

    for (const result of results) {
      const problems = [...result.failures, ...result.pageErrors];
      const mark = problems.length ? '✗' : '✓';
      const clicked = result.clicked ? ` → ${result.clicked}` : '';
      console.log(`${mark} ${result.journey}${clicked}`);

      for (const failure of result.failures) {
        console.log(`    ${describeFailure(failure)}`);
      }

      for (const error of result.pageErrors) {
        console.log(`    page error: ${error}`);
      }
    }
  }

  process.exitCode = failed.length ? 1 : 0;
}

await main();
