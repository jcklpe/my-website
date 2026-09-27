import type { FeaturedImage, FeaturedMediaTreatment } from '~/types/wordpress';
import {
  isLiveHalftoneRequested,
  waitForLiveHalftonePaint,
} from '~/utils/halftone-control.client';
import { prepareWritingFlightMedia } from '~/utils/writing-flight-media';

interface FeaturedMediaTransitionRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface FeaturedMediaTitleWord {
  text: string;
  left: number;
  top: number;
}

interface FeaturedMediaTransitionTitleStyle {
  backgroundColor: string;
  boxShadow: string;
  color: string;
  fontFamily: string;
  fontSize: string;
  fontStyle: string;
  fontWeight: string;
  letterSpacing: string;
  lineHeight: string;
  textShadow: string;
  whiteSpace: string;
  textWrap: string;
  words: FeaturedMediaTitleWord[];
}

interface FeaturedMediaTransitionMetaStyle {
  backgroundColor: string;
  color: string;
  fontFamily: string;
  fontSize: string;
  fontStyle: string;
  fontWeight: string;
  letterSpacing: string;
  lineHeight: string;
  textTransform: string;
}

interface FeaturedMediaTransitionSlipStyle {
  backgroundColor: string;
  borderRadius: string;
}

// The whole card surface behind the slip: a Writing Archive row's white back, including its bottom rule.
interface FeaturedMediaTransitionShellStyle {
  backgroundColor: string;
  borderBottomColor: string;
  borderBottomWidth: string;
}

type FeaturedMediaTransitionRole = 'source' | 'target';

type FeaturedMediaHandoffPhase =
  | 'idle'
  | 'clone-owned'
  | 'revealing-destination'
  | 'destination-ready'
  | 'releasing-clone';

interface FeaturedMediaTransitionState {
  // `active` covers the entire orchestration, including the final overlap and
  // clone leave. It is a navigation/motion lock, not a visual-ownership flag.
  active: boolean;
  key: string | null;
  flightId: number;
  sourceRole: FeaturedMediaTransitionRole | null;
  media: FeaturedImage | null;
  from: FeaturedMediaTransitionRect | null;
  to: FeaturedMediaTransitionRect | null;
  mediaClipFrom: string;
  mediaClipTo: string;
  mediaRadiusFrom: string;
  mediaRadiusTo: string;
  title: string | null;
  titleGroundColor: string | null;
  titleFrom: FeaturedMediaTransitionRect | null;
  titleTo: FeaturedMediaTransitionRect | null;
  titleStyleFrom: FeaturedMediaTransitionTitleStyle | null;
  titleStyleTo: FeaturedMediaTransitionTitleStyle | null;
  meta: string | null;
  metaFrom: FeaturedMediaTransitionRect | null;
  metaTo: FeaturedMediaTransitionRect | null;
  metaStyleFrom: FeaturedMediaTransitionMetaStyle | null;
  metaStyleTo: FeaturedMediaTransitionMetaStyle | null;
  slipFrom: FeaturedMediaTransitionRect | null;
  slipTo: FeaturedMediaTransitionRect | null;
  slipStyleFrom: FeaturedMediaTransitionSlipStyle | null;
  slipStyleTo: FeaturedMediaTransitionSlipStyle | null;
  // Present only at an end that has a card shell (Writing Archive rows). The clone's shell plate morphs between it and the other end's slip, so the row's back becomes the text plate instead of popping.
  shellFrom: FeaturedMediaTransitionRect | null;
  shellTo: FeaturedMediaTransitionRect | null;
  shellStyleFrom: FeaturedMediaTransitionShellStyle | null;
  shellStyleTo: FeaturedMediaTransitionShellStyle | null;
  // Bumped on a reverse once the destination card has been scrolled into view
  // and the flight geometry is set — the home page watches this to assemble its
  // surroundings IN around the now-visible card (running it at mount would
  // measure the card below the fold, before the auto-scroll).
  surroundingsCue: number;
  // Page-VISIBILITY, kept separate from the clone's geometry phase below.
  // True while the freshly-navigated destination page has mounted but isn't yet
  // positioned (scrolled to the card, surroundings placed) — the layout hides
  // it so its un-transitioned content (e.g. the home "Bottom Line" hero at the
  // top) doesn't flash before it's revealed in place. Never true for the
  // outgoing source page, whose exit animations must stay visible.
  hideDestination: boolean;
  // Clone GEOMETRY: 'starting' = clone sits at its source rect (from);
  // 'moving' = clone is animating to its destination rect (to). 'preflight'
  // is a source-card-only beat before the clone mounts, used for card-local
  // extras to slip away without being covered by the clone plate.
  phase: 'idle' | 'preflight' | 'starting' | 'moving';
  // Geometry has landed; surrounding entrances need not wait for the ownership handoff.
  motionComplete: boolean;
  archiveEntranceReady: boolean;
  // Keep the outgoing case-study photo visible until its replacement has committed a paint.
  cloneMediaPainted: boolean;
  // HANDOFF OWNERSHIP — intentionally separate from `active` and `phase`.
  // A is the teleported clone; B is the real destination. B must enter and
  // reach full opacity while A remains mounted at opacity 1. We then hold an
  // actually painted frame with both present before A may leave. Never reveal
  // B and remove/fade A in the same state update. This overlap is deliberate
  // visual redundancy required by the art-directed transition, not cleanup or
  // optimization debt. See completeTransitionAfterMotion() below.
  handoffPhase: FeaturedMediaHandoffPhase;
}

type FeaturedMediaSourceRegistry = Record<string, string[]>;

interface FeaturedMediaSourceSnapshot {
  media: FeaturedMediaTransitionRect;
  mediaClip: string;
  mediaRadius: string;
  title: FeaturedMediaTransitionRect | null;
  titleStyle: FeaturedMediaTransitionTitleStyle | null;
  meta: FeaturedMediaTransitionRect | null;
  metaStyle: FeaturedMediaTransitionMetaStyle | null;
  slip: FeaturedMediaTransitionRect | null;
  slipStyle: FeaturedMediaTransitionSlipStyle | null;
  shell: FeaturedMediaTransitionRect | null;
  shellStyle: FeaturedMediaTransitionShellStyle | null;
}

interface ArticleBodyplateExitMeasurement {
  element: HTMLElement;
}

type FeaturedMediaSourceSnapshotRegistry = Record<
  string,
  Record<string, FeaturedMediaSourceSnapshot>
>;

// Resolve a CSS token string (e.g. "var(--color-surface)") to its actual value
// by reading from :root's computed style. Returns the raw token if it can't be
// resolved. This avoids nested var() chains inside @keyframes, which Safari
// sometimes fails to interpolate correctly.
function resolveColorToken(token: string): string {
  const match = token.trim().match(/^var\((--[\w-]+)\)$/);
  if (!match) return token.trim();
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(match[1])
    .trim();
  return value || token.trim();
}

const FALLBACK_TRANSITION_DURATION = 200;
const BODY_EXIT_CLEAR_BUFFER_PX = 24;
const RECTANGULAR_CLIP = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
const SQUARE_RADIUS = '0px';
const TRANSITION_LOCK_STORAGE_KEY = 'featured-media-transition-active';
let nextFeaturedMediaTransitionFlightId = 1;

function initialFeaturedMediaTransitionState(): FeaturedMediaTransitionState {
  return {
    active: false,
    motionComplete: false,
    archiveEntranceReady: false,
    cloneMediaPainted: false,
    key: null,
    flightId: 0,
    sourceRole: null,
    media: null,
    from: null,
    to: null,
    mediaClipFrom: RECTANGULAR_CLIP,
    mediaClipTo: RECTANGULAR_CLIP,
    mediaRadiusFrom: SQUARE_RADIUS,
    mediaRadiusTo: SQUARE_RADIUS,
    title: null,
    titleGroundColor: null,
    titleFrom: null,
    titleTo: null,
    titleStyleFrom: null,
    titleStyleTo: null,
    meta: null,
    metaFrom: null,
    metaTo: null,
    metaStyleFrom: null,
    metaStyleTo: null,
    slipFrom: null,
    slipTo: null,
    slipStyleFrom: null,
    slipStyleTo: null,
    shellFrom: null,
    shellTo: null,
    shellStyleFrom: null,
    shellStyleTo: null,
    surroundingsCue: 0,
    hideDestination: false,
    phase: 'idle',
    handoffPhase: 'idle',
  };
}

function rectFromElement(element: HTMLElement): FeaturedMediaTransitionRect {
  const rect = element.getBoundingClientRect();

  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function selectorForDataValue(attribute: string, value: string) {
  const escapedValue = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  return `[${attribute}="${escapedValue}"]`;
}

function findMediaFrame(kind: FeaturedMediaTransitionRole, key: string) {
  return document.querySelector<HTMLElement>(
    `[data-featured-media-${kind}="${key}"]`,
  );
}

function findTitleFrame(kind: FeaturedMediaTransitionRole, key: string) {
  return document.querySelector<HTMLElement>(
    `[data-featured-title-${kind}="${key}"]`,
  );
}

function findMetaFrame(kind: FeaturedMediaTransitionRole, key: string) {
  return document.querySelector<HTMLElement>(
    `[data-featured-meta-${kind}="${key}"]`,
  );
}

function findSlipFrame(kind: FeaturedMediaTransitionRole, key: string) {
  return document.querySelector<HTMLElement>(
    `[data-featured-slip-${kind}="${key}"]`,
  );
}

function findShellFrame(kind: FeaturedMediaTransitionRole, key: string) {
  return document.querySelector<HTMLElement>(
    `[data-featured-shell-${kind}="${key}"]`,
  );
}

function findCardExtraFrame(kind: FeaturedMediaTransitionRole, key: string) {
  return document.querySelector<HTMLElement>(
    `[data-featured-card-extra-${kind}="${key}"]`,
  );
}

function findBodyExitFrame(key: string) {
  return document.querySelector<HTMLElement>(
    selectorForDataValue('data-featured-body-exit-target', key),
  );
}

function mediaFromFrame(element: HTMLElement | null): FeaturedImage | null {
  const image = element?.querySelector<HTMLImageElement>('img');
  const sourceUrl = image?.currentSrc || image?.src || '';
  const treatment = image?.dataset.featuredMediaTreatment;

  if (!sourceUrl) {
    return null;
  }

  return {
    sourceUrl,
    liveSourceUrl: image?.dataset.originalSrc || sourceUrl,
    srcSet: image?.srcset || null,
    sizes: image?.sizes || null,
    altText: image?.alt ?? '',
    treatment: isFeaturedMediaTreatment(treatment) ? treatment : 'default',
  };
}

function isFeaturedMediaTreatment(
  treatment?: string,
): treatment is FeaturedMediaTreatment {
  return treatment === 'default' || treatment === 'case-study-halftone';
}

function clipFromElement(element: HTMLElement | null) {
  const clipFrame = element?.closest<HTMLElement>(
    '[data-featured-media-clip-frame]',
  );

  if (element && clipFrame) {
    const media = element.getBoundingClientRect();
    const frame = clipFrame.getBoundingClientRect();

    if (media.width > 0 && media.height > 0) {
      // Keep the parallax image's full geometry and crop it to the visible card, including any pointer offset, so the clone and card paint the same region at handoff.
      const left = Math.max(0, ((frame.left - media.left) / media.width) * 100);
      const top = Math.max(0, ((frame.top - media.top) / media.height) * 100);
      const right = Math.min(
        100,
        ((frame.right - media.left) / media.width) * 100,
      );
      const bottom = Math.min(
        100,
        ((frame.bottom - media.top) / media.height) * 100,
      );

      return `polygon(${left}% ${top}%, ${right}% ${top}%, ${right}% ${bottom}%, ${left}% ${bottom}%)`;
    }
  }

  return element?.dataset.featuredMediaClip || RECTANGULAR_CLIP;
}

function isRoundedRadius(radius: string) {
  return radius !== '' && !/^(0px)(\s+0px)*$/.test(radius.trim());
}

// The visible corner rounding often lives on a clipping ancestor of the
// tracked media frame (e.g. the layered hero's `.hero-plate` carries the
// big corner while the media frame inside is square). Walk up a few levels
// to find it so the flying clone can morph the corner instead of popping.
function borderRadiusFromElement(element: HTMLElement | null) {
  let current: HTMLElement | null = element;
  let depth = 0;

  while (current && depth < 6) {
    const radius = getComputedStyle(current).borderRadius;

    if (isRoundedRadius(radius)) {
      return radius;
    }

    current = current.parentElement;
    depth += 1;
  }

  return SQUARE_RADIUS;
}

function measuredTitleWords(element: HTMLElement) {
  const source = element.querySelector('.slit-text .source') ?? element;
  const walker = document.createTreeWalker(source, NodeFilter.SHOW_TEXT);
  const bounds = element.getBoundingClientRect();
  const words: FeaturedMediaTitleWord[] = [];
  const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
  let node = walker.nextNode();
  while (node) {
    const text = node.textContent ?? '';
    for (const match of text.matchAll(/\S+/g)) {
      const range = document.createRange();
      range.setStart(node, match.index!);
      range.setEnd(node, match.index! + match[0].length);
      const rect = range.getBoundingClientRect();
      words.push({
        text: match[0],
        left: rect.left - bounds.left,
        top: Math.round((rect.top - bounds.top) / lineHeight) * lineHeight,
      });
    }
    node = walker.nextNode();
  }
  return words;
}

function titleStyleFromElement(
  element: HTMLElement | null,
): FeaturedMediaTransitionTitleStyle | null {
  if (!element) {
    return null;
  }

  const explicitLabelElement = element.querySelector<HTMLElement>(
    '[data-featured-title-text-layer]',
  );
  const fallbackLabelElement =
    element.firstElementChild instanceof HTMLElement
      ? element.firstElementChild
      : element;
  const labelElement = explicitLabelElement ?? fallbackLabelElement;
  const style = getComputedStyle(labelElement);

  return {
    backgroundColor: style.backgroundColor,
    boxShadow: style.boxShadow,
    color: style.color,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontStyle: style.fontStyle,
    fontWeight: style.fontWeight,
    letterSpacing: style.letterSpacing,
    lineHeight: style.lineHeight,
    textShadow: style.textShadow,
    whiteSpace: style.whiteSpace,
    textWrap: style.textWrap,
    words: element.closest('.post-page, .post-archive-row, .post-card')
      ? measuredTitleWords(element)
      : [],
  };
}

function titleTextFromElement(element: HTMLElement | null) {
  return (
    element?.dataset.featuredTitleText?.trim() ||
    element?.textContent?.trim() ||
    null
  );
}

function metaStyleFromElement(
  element: HTMLElement | null,
): FeaturedMediaTransitionMetaStyle | null {
  if (!element) {
    return null;
  }

  const style = getComputedStyle(element);

  return {
    backgroundColor: style.backgroundColor,
    color: style.color,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontStyle: style.fontStyle,
    fontWeight: style.fontWeight,
    letterSpacing: style.letterSpacing,
    lineHeight: style.lineHeight,
    textTransform: style.textTransform,
  };
}

function isTransparentColor(color: string) {
  const normalizedColor = color.replace(/\s+/g, '').toLowerCase();

  if (!normalizedColor || normalizedColor === 'transparent') {
    return true;
  }

  const rgbaMatch = normalizedColor.match(
    /^rgba\([^,]+,[^,]+,[^,]+,([^)]+)\)$/,
  );

  if (!rgbaMatch?.[1]) {
    return false;
  }

  return Number.parseFloat(rgbaMatch[1]) === 0;
}

function opaqueColor(color: string) {
  const rgbaMatch = color.match(
    /^rgba\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*[0-9.]+\s*\)$/i,
  );

  if (rgbaMatch?.[1] && rgbaMatch[2] && rgbaMatch[3]) {
    return `rgb(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]})`;
  }

  const modernRgbMatch = color.match(
    /^rgb\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*\/\s*[0-9.]+%?\s*\)$/i,
  );

  if (modernRgbMatch?.[1] && modernRgbMatch[2] && modernRgbMatch[3]) {
    return `rgb(${modernRgbMatch[1]}, ${modernRgbMatch[2]}, ${modernRgbMatch[3]})`;
  }

  const srgbMatch = color.match(
    /^color\(srgb\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*[0-9.]+)?\s*\)$/i,
  );

  if (srgbMatch?.[1] && srgbMatch[2] && srgbMatch[3]) {
    const red = Math.round(Number.parseFloat(srgbMatch[1]) * 255);
    const green = Math.round(Number.parseFloat(srgbMatch[2]) * 255);
    const blue = Math.round(Number.parseFloat(srgbMatch[3]) * 255);

    return `rgb(${red}, ${green}, ${blue})`;
  }

  return color;
}

function backgroundColorFromElement(element: HTMLElement | null) {
  let current: HTMLElement | null = element;
  let depth = 0;

  while (current && depth < 6) {
    const backgroundColor = getComputedStyle(current).backgroundColor;

    if (!isTransparentColor(backgroundColor)) {
      return opaqueColor(backgroundColor);
    }

    current = current.parentElement;
    depth += 1;
  }

  return 'transparent';
}

function slipStyleFromElement(
  element: HTMLElement | null,
): FeaturedMediaTransitionSlipStyle | null {
  if (!element) {
    return null;
  }

  return {
    backgroundColor: backgroundColorFromElement(element),
    borderRadius: getComputedStyle(element).borderRadius,
  };
}

function shellStyleFromElement(
  element: HTMLElement | null,
): FeaturedMediaTransitionShellStyle | null {
  if (!element) {
    return null;
  }

  const style = getComputedStyle(element);

  // Keep the rule's own alpha: the row draws a translucent ink line over its own background, and the plate does the same.
  return {
    backgroundColor: backgroundColorFromElement(element),
    borderBottomColor: style.borderBottomColor,
    borderBottomWidth: style.borderBottomWidth,
  };
}

function millisecondsFromCssTime(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return FALLBACK_TRANSITION_DURATION;
  }

  if (trimmedValue.endsWith('ms')) {
    return Number.parseFloat(trimmedValue) || FALLBACK_TRANSITION_DURATION;
  }

  if (trimmedValue.endsWith('s')) {
    return (
      (Number.parseFloat(trimmedValue) || FALLBACK_TRANSITION_DURATION / 1000) *
      1000
    );
  }

  return Number.parseFloat(trimmedValue) || FALLBACK_TRANSITION_DURATION;
}

function cssDurationVar(name: string, fallback: number) {
  if (!import.meta.client) {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(
    name,
  );

  return value.trim() ? millisecondsFromCssTime(value) : fallback;
}

function featuredMediaFlightDuration() {
  return cssDurationVar(
    '--featured-media-flight-duration',
    FALLBACK_TRANSITION_DURATION,
  );
}

function cardExtraSlipDuration() {
  return (
    cssDurationVar('--card-extra-slip-duration', 220) +
    cssDurationVar('--card-extra-stagger', 80)
  );
}

// Reverse: how long the detail bodyplate slides out before the rest begins.
// Independent of the flight duration so slow flight QA doesn't drag it out.
function articleBodyplateExitDuration() {
  return cssDurationVar('--article-bodyplate-exit-duration', 450);
}

function rectEdgesFromElement(element: HTMLElement) {
  const rect = element.getBoundingClientRect();

  return {
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    height: rect.height,
    width: rect.width,
  };
}

function rectIntersectsViewport(rect: ReturnType<typeof rectEdgesFromElement>) {
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.top < window.innerHeight &&
    rect.right > 0 &&
    rect.left < window.innerWidth
  );
}

function bodyExitVisibleRect(element: HTMLElement) {
  const childRects = Array.from(element.children)
    .filter((child): child is HTMLElement => child instanceof HTMLElement)
    .map((child) => rectEdgesFromElement(child))
    .filter((rect) => rectIntersectsViewport(rect));

  if (!childRects.length) {
    return rectEdgesFromElement(element);
  }

  return childRects.reduce((mergedRect, rect) => {
    const bottom = Math.max(mergedRect.bottom, rect.bottom);
    const left = Math.min(mergedRect.left, rect.left);
    const right = Math.max(mergedRect.right, rect.right);
    const top = Math.min(mergedRect.top, rect.top);

    return {
      bottom,
      left,
      right,
      top,
      height: bottom - top,
      width: right - left,
    };
  });
}

function prepareArticleBodyplateExitMeasurement(
  key: string,
): ArticleBodyplateExitMeasurement | null {
  const element = findBodyExitFrame(key);

  if (!element) {
    return null;
  }

  const visibleRect = bodyExitVisibleRect(element);
  // The grid wrapper can paint cream outside its children; its left edge must clear too.
  const paintedLeft = Math.min(
    visibleRect.left,
    element.getBoundingClientRect().left,
  );
  const clearDistance = Math.max(
    0,
    Math.ceil(window.innerWidth - paintedLeft + BODY_EXIT_CLEAR_BUFFER_PX),
  );

  element.style.setProperty('--detail-content-exit-x', `${clearDistance}px`);

  return {
    element,
  };
}

// Final overlap handoff: how long clone A takes to leave after destination B is fully opaque and the browser has committed an A+B paint.
function cloneLeaveDuration() {
  return cssDurationVar('--featured-media-clone-leave-duration', 250);
}

function destinationEnterDuration() {
  return cssDurationVar('--featured-media-destination-enter-duration', 140);
}

export function featuredMediaTransitionDuration() {
  return featuredMediaFlightDuration();
}

function waitForAnimationFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitForPaint() {
  await nextTick();
  await waitForAnimationFrame();
}

// Two animation frames bracket a browser paint. The final handoff uses this
// stronger guarantee because one nextTick+rAF can still let Vue remove A before
// a frame containing fully opaque A *and* B has actually reached the screen.
async function waitForCommittedPaint() {
  await nextTick();
  await waitForAnimationFrame();
  await waitForAnimationFrame();
}

function destinationRoleForSourceRole(
  sourceRole: FeaturedMediaTransitionRole | null,
): FeaturedMediaTransitionRole | null {
  if (sourceRole === 'source') return 'target';
  if (sourceRole === 'target') return 'source';
  return null;
}

function waitForBoundedDelay(duration: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

async function waitForDestinationMediaReady(
  role: FeaturedMediaTransitionRole,
  key: string,
) {
  const image = findMediaFrame(role, key)?.querySelector<HTMLImageElement>(
    'img',
  );

  if (!image) return;
  if (!image.complete || image.naturalWidth === 0) {
    const decode = image.decode?.();
    const loaded = decode
      ? decode.catch(() => undefined)
      : new Promise<void>((resolve) => {
          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        });
    await Promise.race([loaded, waitForBoundedDelay(700)]);
  }
  // The seated clone stays opaque until the replacement has live pixels or an explicit plain-image fallback.
  await waitForLiveHalftonePaint(image);
}

function waitForDestinationSurfaceEntry(element: HTMLElement | null) {
  if (
    !element ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return Promise.resolve();
  }

  // Some destinations enter through CSS opacity transitions, while opaque text plates have no fade at all. Wait for the actual surface effects, never a missing animationend event.
  const entrances = element.getAnimations().filter((animation) => {
    if (animation instanceof CSSAnimation)
      return animation.animationName === 'featured-media-destination-enter';
    return (
      animation instanceof CSSTransition &&
      animation.transitionProperty === 'opacity'
    );
  });
  if (!entrances.length) return Promise.resolve();

  return Promise.race([
    Promise.allSettled(entrances.map((animation) => animation.finished)),
    waitForBoundedDelay(destinationEnterDuration() + 120),
  ]);
}

// Reverse only: measure the detail body's right-and-out endpoint, then hold
// until the actual CSS animation ends. Because the endpoint is measured to
// clear the visible body, the declared duration remains the visible beat length
// instead of hiding an off-screen tail.
function waitForArticleBodyplateExit(
  measurement: ArticleBodyplateExitMeasurement | null,
) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return Promise.resolve();
  }

  if (!measurement) {
    return new Promise<void>((resolve) => {
      window.setTimeout(resolve, articleBodyplateExitDuration());
    });
  }

  return new Promise<void>((resolve) => {
    let done = false;
    const { element } = measurement;

    function finish() {
      if (done) {
        return;
      }

      done = true;
      element.removeEventListener('animationend', onAnimationEnd);

      resolve();
    }

    function onAnimationEnd(event: AnimationEvent) {
      if (event.target === element) {
        finish();
      }
    }

    element.addEventListener('animationend', onAnimationEnd);
    window.setTimeout(finish, articleBodyplateExitDuration() + 120);
  });
}

// Forward only: hold while the home surroundings animate out around the lifting
// card, before navigating away (they live on the home page, which unmounts on
// nav). Matches the home choreography's --surroundings-duration token.
async function waitForSurroundingsExit(writingArchive = false) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Let the page watchers register their departures, then wait on the real clocks, including stagger and any delayed first frame.
  await waitForPaint();
  const selector = writingArchive
    ? '.archive .row-item, .archive .year-header, .archive .section-heading, .archive .archive-actions'
    : '.home-page, .case-study-page';
  const motions = Array.from(document.querySelectorAll<HTMLElement>(selector))
    .flatMap((surface) => surface.getAnimations({ subtree: !writingArchive }))
    .filter((motion) => motion.effect?.getTiming().iterations !== Infinity);
  await Promise.allSettled(motions.map((motion) => motion.finished));
  // Present the off-screen endpoint before the outgoing DOM is removed.
  await waitForCommittedPaint();
}

// Give Nuxt a short beat to render the destination source/target element before
// falling back to any cached reverse geometry.
const TRANSITION_TARGET_READY_TIMEOUT = 900;

function setTransitionScrollLock(isLocked: boolean) {
  if (!import.meta.client) {
    return;
  }

  if (isLocked) {
    sessionStorage.setItem(TRANSITION_LOCK_STORAGE_KEY, 'true');
    return;
  }

  sessionStorage.removeItem(TRANSITION_LOCK_STORAGE_KEY);
}

function eventAllowsTransitionNavigation(event: MouseEvent) {
  return !(
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

function scrollToUrlHash(to: string) {
  const hash = to.split('#')[1];

  if (!hash) {
    window.scrollTo({ left: 0, top: 0 });
    return;
  }

  let id = hash;

  try {
    id = decodeURIComponent(hash);
  } catch {
    id = hash;
  }

  const target = document.getElementById(id);

  if (!target) {
    return;
  }

  target.scrollIntoView({
    block: 'start',
    inline: 'nearest',
  });
}

export function useFeaturedMediaTransitionState() {
  return useState<FeaturedMediaTransitionState>(
    'featured-media-transition',
    () => initialFeaturedMediaTransitionState(),
  );
}

export function useFeaturedMediaSourceRegistry() {
  return useState<FeaturedMediaSourceRegistry>(
    'featured-media-source-registry',
    () => ({}),
  );
}

function useFeaturedMediaSourceSnapshotRegistry() {
  return useState<FeaturedMediaSourceSnapshotRegistry>(
    'featured-media-source-snapshot-registry',
    () => ({}),
  );
}

function normalizePath(path: string) {
  return path.replace(/\/+$/, '') || '/';
}

function pathFromNavigationTarget(to: string) {
  try {
    return normalizePath(new URL(to, 'http://local.invalid').pathname);
  } catch {
    return normalizePath(to.split('#')[0]?.split('?')[0] || '/');
  }
}

export function featuredMediaTransitionKeyFromNavigation(
  fromPath: string,
  toPath: string,
) {
  const patterns = [
    {
      prefix: 'case-study',
      regex: /^\/case-studies\/([^/]+)\/?$/,
      targetPaths: ['/'],
    },
    {
      prefix: 'post',
      regex: /^\/writing\/([^/]+)\/?$/,
      targetPaths: ['/', '/writing'],
    },
  ];

  const matchedPattern = patterns
    .map((pattern) => ({
      ...pattern,
      match: fromPath.match(pattern.regex),
    }))
    .find((pattern) => pattern.match?.[1]);

  if (!matchedPattern?.match?.[1]) {
    return null;
  }

  if (!matchedPattern.targetPaths.includes(toPath)) {
    return null;
  }

  let slug = matchedPattern.match[1];

  try {
    slug = decodeURIComponent(slug);
  } catch {
    return null;
  }

  return `${matchedPattern.prefix}-${slug}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

export function useFeaturedMediaTransition() {
  const route = useRoute();
  const state = useFeaturedMediaTransitionState();
  const sourceRegistry = useFeaturedMediaSourceRegistry();
  const { getHomePosts, hasHomePost } = useHomeSurfacePrefetch();
  const sourceSnapshotRegistry = useFeaturedMediaSourceSnapshotRegistry();
  let currentArticleBodyplateExitMeasurement: ArticleBodyplateExitMeasurement | null =
    null;

  if (import.meta.client && !state.value.active) {
    setTransitionScrollLock(false);
  }

  function resetTransition() {
    state.value = initialFeaturedMediaTransitionState();
  }

  function canStartFeaturedMediaTransitionFromRole(
    key: string,
    sourceRole: FeaturedMediaTransitionRole,
    media?: FeaturedImage | null,
  ) {
    const source = findMediaFrame(sourceRole, key);
    const transitionMedia = mediaFromFrame(source) ?? media ?? null;

    return Boolean(
      transitionMedia?.sourceUrl &&
      source &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
  }

  async function waitForCardExtraPreflight(
    key: string,
    role: FeaturedMediaTransitionRole = 'source',
  ) {
    if (
      !findCardExtraFrame(role, key) ||
      !canStartFeaturedMediaTransitionFromRole(key, role)
    ) {
      return Promise.resolve();
    }

    setTransitionScrollLock(true);
    state.value = {
      ...initialFeaturedMediaTransitionState(),
      active: false,
      key,
      sourceRole: role,
      phase: 'preflight',
    };

    await waitForPaint();
    const extras = document.querySelectorAll<HTMLElement>(
      `[data-featured-card-extra-${role}="${key}"]`,
    );
    // Wait for each row's slit, including its delay, but never wait for decorative loops such as the case-study star's continuous rotation.
    const animations = Array.from(extras)
      .flatMap((element) => element.getAnimations({ subtree: true }))
      .filter((animation) => {
        const iterations = animation.effect?.getTiming().iterations;
        return iterations !== Infinity;
      });
    if (animations.length) {
      await Promise.allSettled(
        animations.map((animation) => animation.finished),
      );
    } else {
      await new Promise<void>((resolve) =>
        window.setTimeout(resolve, cardExtraSlipDuration()),
      );
    }
  }

  function finishFeaturedMediaCloneRelease(flightId: number) {
    if (
      state.value.flightId !== flightId ||
      state.value.handoffPhase !== 'releasing-clone'
    ) {
      return;
    }

    setTransitionScrollLock(false);
    resetTransition();
  }

  // Hand off only after the clone has ACTUALLY arrived — i.e. when its flight
  // CSS transition ends — rather than after a parallel stopwatch that merely
  // assumes it has. More importantly, arrival does NOT transfer ownership in a
  // single reactive update.
  //
  // NON-NEGOTIABLE OVERLAP MODEL:
  //   A = the seated teleported clone; B = the real destination surface.
  //   1. Keep A mounted and fully opaque.
  //   2. Decode/rasterize B, then animate B to full opacity underneath A.
  //   3. Hold one committed browser paint with both A and B fully opaque.
  //   4. Only then start A's Vue leave; reset only after both clone layers left.
  //
  // Never simplify this to `active = false` revealing B while A leaves in the
  // same render pass. That atomic-looking handoff repeatedly caused transparent
  // frames, title-ground colour mismatches, and image bleed. The intentional
  // overlap is part of the art direction even though it keeps duplicate pixels
  // alive briefly.
  function completeTransitionAfterMotion() {
    const key = state.value.key;
    const flightId = state.value.flightId;
    const frame = import.meta.client
      ? document.querySelector<HTMLElement>('.ftml-layer--media .frame')
      : null;

    let done = false;
    let archiveEntranceTimer = 0;

    const finish = async () => {
      if (done) {
        return;
      }
      done = true;
      window.clearTimeout(archiveEntranceTimer);
      frame?.removeEventListener('transitionend', onTransitionEnd);

      // A newer navigation may have taken over while we waited — don't clobber it.
      if (state.value.key !== key || state.value.flightId !== flightId) {
        return;
      }

      state.value = {
        ...state.value,
        motionComplete: true,
        archiveEntranceReady: true,
      };

      const destinationRole = destinationRoleForSourceRole(
        state.value.sourceRole,
      );

      if (!destinationRole || !key) {
        state.value = { ...state.value, handoffPhase: 'releasing-clone' };
        window.setTimeout(
          () => finishFeaturedMediaCloneRelease(flightId),
          cloneLeaveDuration() + 120,
        );
        return;
      }

      await waitForDestinationMediaReady(destinationRole, key);

      if (state.value.flightId !== flightId) {
        return;
      }

      // This update reveals B and starts its own entrance while A remains
      // mounted at opacity 1. Clone rendering is keyed to handoffPhase and does
      // not change here.
      state.value = {
        ...state.value,
        handoffPhase: 'revealing-destination',
      };

      await nextTick();

      const destinationSurfaces = [
        findMediaFrame(destinationRole, key),
        findSlipFrame(destinationRole, key),
      ];

      await Promise.all(
        destinationSurfaces.map((surface) =>
          waitForDestinationSurfaceEntry(surface),
        ),
      );

      if (state.value.flightId !== flightId) {
        return;
      }

      state.value = { ...state.value, handoffPhase: 'destination-ready' };
      await waitForCommittedPaint();

      if (state.value.flightId !== flightId) {
        return;
      }

      // Only this phase change removes A from the template and starts its Vue
      // leave. `active` deliberately stays true until both teleported layers
      // report after-leave, keeping navigation and ambient-motion guards intact.
      state.value = { ...state.value, handoffPhase: 'releasing-clone' };

      window.setTimeout(() => {
        finishFeaturedMediaCloneRelease(flightId);
      }, cloneLeaveDuration() + 120);
    };

    const onTransitionEnd = (event: TransitionEvent) => {
      // Only the frame's own flight transition — ignore anything bubbling up
      // from descendants. The frame animates several properties (transform,
      // width, height, border-radius) that all end together; `done` collapses
      // those to a single hand-off.
      if (event.target === frame) {
        void finish();
      }
    };

    // Safety net: if no transition actually runs (clone didn't move, reduced
    // motion, interrupted, or the event never fires) hand off shortly after the
    // nominal flight duration so the transition can never hang. When a real
    // `transitionend` arrives first (~flight duration) this fires later as a
    // harmless no-op (the `done` flag swallows it).
    window.setTimeout(() => void finish(), featuredMediaFlightDuration() + 120);
    frame?.addEventListener('transitionend', onTransitionEnd);

    // The layer groups position and size into native effects after its DOM update. Those finish without a CSS transitionend event; wait for their actual completion before running the same destination-first handoff.
    void nextTick(() => {
      if (state.value.flightId !== flightId || !frame?.isConnected) return;
      const animations = frame.getAnimations();
      if (!animations.length) return;
      if (state.value.sourceRole === 'target' && route.path === '/writing') {
        const animation = animations[0]!;
        const timing = animation.effect?.getComputedTiming();
        const configuredProgress = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            '--writing-return-start-progress',
          ),
        );
        const progress = Number.isFinite(configuredProgress)
          ? Math.min(1, Math.max(0, configuredProgress))
          : 1;
        const duration =
          Number(timing?.duration) || featuredMediaFlightDuration();
        const elapsed =
          typeof animation.currentTime === 'number' ? animation.currentTime : 0;
        const delay = Number(timing?.delay) || 0;
        // Use the live flight clock so slow diagnostic flights keep the same proportional overlap.
        archiveEntranceTimer = window.setTimeout(
          () => {
            if (
              state.value.active &&
              state.value.flightId === flightId &&
              route.path === '/writing'
            )
              state.value = { ...state.value, archiveEntranceReady: true };
          },
          Math.max(0, delay + duration * progress - elapsed),
        );
      }
      void Promise.all(animations.map((animation) => animation.finished))
        .then(finish)
        .catch(() => {
          // Cancellation leaves the existing timeout/flight-identity guards in charge.
        });
    });
  }

  function startFeaturedMediaTransitionFromRole(
    key: string,
    sourceRole: FeaturedMediaTransitionRole,
    media?: FeaturedImage | null,
    includeMeta = true,
    preparedMedia?: FeaturedImage | null,
  ) {
    const source = findMediaFrame(sourceRole, key);
    const sourceTitle = findTitleFrame(sourceRole, key);
    const sourceMeta = includeMeta ? findMetaFrame(sourceRole, key) : null;
    const sourceSlip = findSlipFrame(sourceRole, key);
    const sourceShell = findShellFrame(sourceRole, key);
    // Prefer the source IMAGE ELEMENT'S currentSrc (the exact resized variant
    // it already loaded and is showing) over the passed FeaturedImage (whose
    // sourceUrl is the full-size original). The clone must reuse the cached
    // image — otherwise, at sizes="100vw", it fetches a larger/original variant
    // that isn't cached, and the halftone renders solid black while it loads
    // (the Home→Detail black flash). The passed media is only a fallback for
    // when the source img isn't loaded yet.
    const selectedMedia =
      preparedMedia ?? mediaFromFrame(source) ?? media ?? null;
    const sourceImage = source?.querySelector<HTMLImageElement>('img');
    const transitionMedia = selectedMedia
      ? {
          ...selectedMedia,
          liveSourceUrl:
            sourceImage?.dataset.originalSrc ||
            selectedMedia.liveSourceUrl ||
            media?.sourceUrl ||
            selectedMedia.sourceUrl,
        }
      : null;

    if (
      !transitionMedia?.sourceUrl ||
      !source ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return false;
    }

    currentArticleBodyplateExitMeasurement =
      sourceRole === 'target'
        ? prepareArticleBodyplateExitMeasurement(key)
        : null;

    const rawGroundColor =
      sourceTitle?.querySelector<HTMLElement>(
        '[data-featured-title-text-layer]',
      )?.dataset.groundColor ??
      sourceTitle?.dataset.groundColor ??
      null;
    // Resolve to actual hex so the clone's keyframe never has to chain
    // var(--stepped-title-ground-color) → var(--color-surface) → #hex.
    // Nested var() in @keyframes is unreliable on Safari.
    const titleGroundColor = rawGroundColor
      ? resolveColorToken(rawGroundColor)
      : null;

    setTransitionScrollLock(true);
    state.value = {
      ...initialFeaturedMediaTransitionState(),
      active: true,
      key,
      flightId: nextFeaturedMediaTransitionFlightId,
      sourceRole,
      media: transitionMedia,
      from: rectFromElement(source),
      mediaClipFrom: clipFromElement(source),
      mediaRadiusFrom: borderRadiusFromElement(source),
      title: titleTextFromElement(sourceTitle),
      titleGroundColor,
      titleFrom: sourceTitle ? rectFromElement(sourceTitle) : null,
      titleStyleFrom: titleStyleFromElement(sourceTitle),
      meta: sourceMeta?.textContent?.trim() || null,
      metaFrom: sourceMeta ? rectFromElement(sourceMeta) : null,
      metaStyleFrom: metaStyleFromElement(sourceMeta),
      slipFrom: sourceSlip ? rectFromElement(sourceSlip) : null,
      slipStyleFrom: slipStyleFromElement(sourceSlip),
      shellFrom: sourceShell ? rectFromElement(sourceShell) : null,
      shellStyleFrom: shellStyleFromElement(sourceShell),
      phase: 'starting',
      handoffPhase: 'clone-owned',
    };
    nextFeaturedMediaTransitionFlightId += 1;

    return true;
  }

  // Browser Back can change routes before the clone's asynchronously prepared shader has drawn. Hold the existing page briefly so the clone owns painted pixels before navigation takes them away.
  async function waitForArticleDeparture() {
    await waitForPaint();
    await waitForArticleBodyplateExit(currentArticleBodyplateExitMeasurement);
    currentArticleBodyplateExitMeasurement = null;
    await waitForCommittedPaint();
  }

  async function waitForCaseStudyCloneReady() {
    const flightId = state.value.flightId;
    if (state.value.key?.startsWith('post-')) {
      await nextTick();
      const image = document.querySelector<HTMLImageElement>(
        '.ftml-layer--media .frame img',
      );
      if (!image) return;
      // A cached URL does not guarantee a newly mounted image has decoded. Retain the article photo beneath the clone through its first committed paint.
      await Promise.race([
        image.decode().catch(() => undefined),
        waitForBoundedDelay(1500),
      ]);
      await waitForCommittedPaint();
      if (
        state.value.active &&
        state.value.flightId === flightId &&
        image.complete &&
        image.naturalWidth > 0
      ) {
        state.value = { ...state.value, cloneMediaPainted: true };
      }
      return;
    }
    if (
      !state.value.key?.startsWith('case-study-') ||
      !isLiveHalftoneRequested()
    )
      return;

    await nextTick();
    const image = document.querySelector<HTMLImageElement>(
      '.ftml-layer--media .frame-halftone img',
    );
    if (!image) return;
    await waitForLiveHalftonePaint(image);
    if (!state.value.active || state.value.flightId !== flightId) return;
    await waitForCommittedPaint();
    if (state.value.active && state.value.flightId === flightId) {
      state.value = { ...state.value, cloneMediaPainted: true };
    }
  }

  // A reverse flight bound for a Writing Archive row starts its shell plate as the detail's text plate, so the plate grows into the row instead of appearing there on landing.
  function startShellFromSlip() {
    const current = state.value;

    if (!current.slipFrom) {
      return;
    }

    state.value = {
      ...current,
      shellFrom: current.slipFrom,
      shellStyleFrom: {
        backgroundColor:
          current.slipStyleFrom?.backgroundColor ?? 'transparent',
        borderBottomColor: 'transparent',
        borderBottomWidth: '0px',
      },
    };
  }

  function rememberSourcePath(key: string) {
    const currentPath = normalizePath(route.path);
    const existingPaths = sourceRegistry.value[key] ?? [];

    if (existingPaths.includes(currentPath)) {
      return;
    }

    sourceRegistry.value = {
      ...sourceRegistry.value,
      [key]: [...existingPaths, currentPath],
    };
  }

  function rememberSourceSnapshot(key: string) {
    const currentPath = normalizePath(route.path);
    const currentState = state.value;

    if (!currentState.from) {
      return;
    }

    const snapshot: FeaturedMediaSourceSnapshot = {
      media: currentState.from,
      mediaClip: currentState.mediaClipFrom,
      mediaRadius: currentState.mediaRadiusFrom,
      title: currentState.titleFrom,
      titleStyle: currentState.titleStyleFrom,
      meta: currentState.metaFrom,
      metaStyle: currentState.metaStyleFrom,
      slip: currentState.slipFrom,
      slipStyle: currentState.slipStyleFrom,
      shell: currentState.shellFrom,
      shellStyle: currentState.shellStyleFrom,
    };
    const existingSnapshots = sourceSnapshotRegistry.value[key] ?? {};

    sourceSnapshotRegistry.value = {
      ...sourceSnapshotRegistry.value,
      [key]: {
        ...existingSnapshots,
        [currentPath]: snapshot,
      },
    };
  }

  function sourceSnapshotForNavigation(to: string, key: string) {
    const targetPath = pathFromNavigationTarget(to);

    return sourceSnapshotRegistry.value[key]?.[targetPath] ?? null;
  }

  function moveFeaturedMediaTransitionToSnapshot(
    snapshot: FeaturedMediaSourceSnapshot,
  ) {
    state.value = {
      ...state.value,
      to: snapshot.media,
      mediaClipTo: snapshot.mediaClip,
      mediaRadiusTo: snapshot.mediaRadius,
      titleTo: snapshot.title,
      titleStyleTo: snapshot.titleStyle,
      metaTo: snapshot.meta,
      metaStyleTo: snapshot.metaStyle,
      slipTo: snapshot.slip,
      slipStyleTo: snapshot.slipStyle,
      shellTo: snapshot.shell,
      shellStyleTo: snapshot.shellStyle,
      phase: 'moving',
    };
  }

  async function waitForTransitionTarget(
    key: string,
    role: FeaturedMediaTransitionRole,
  ) {
    const timeoutAt =
      window.performance.now() + TRANSITION_TARGET_READY_TIMEOUT;

    do {
      await waitForPaint();

      if (findMediaFrame(role, key)) {
        return true;
      }

      await waitForAnimationFrame();
    } while (window.performance.now() < timeoutAt);

    return Boolean(findMediaFrame(role, key));
  }

  function shouldAttemptReverseFeaturedMediaTransition(
    to: string,
    key: string,
  ) {
    const targetPath = pathFromNavigationTarget(to);
    const knownSourcePaths = sourceRegistry.value[key] ?? [];

    if (key.startsWith('post-') && targetPath === '/') {
      return hasHomePost(key);
    }

    if (key.startsWith('post-') && targetPath === '/writing') {
      return true;
    }

    if (key.startsWith('case-study-') && targetPath === '/') {
      return true;
    }

    if (!knownSourcePaths.length) {
      return true;
    }

    return knownSourcePaths.includes(targetPath);
  }

  async function finishFeaturedMediaTransitionToRole(
    key: string,
    targetRole: FeaturedMediaTransitionRole,
    options: { scrollToTarget?: boolean } = {},
  ) {
    await waitForPaint();

    const target = findMediaFrame(targetRole, key);

    if (options.scrollToTarget) {
      target?.scrollIntoView({
        block: 'center',
        inline: 'nearest',
      });
      await waitForPaint();
    }

    const finalTarget = findMediaFrame(targetRole, key);
    const targetTitle = findTitleFrame(targetRole, key);
    const targetMeta = findMetaFrame(targetRole, key);
    const targetSlip = findSlipFrame(targetRole, key);
    const targetShell = findShellFrame(targetRole, key);

    if (!finalTarget) {
      setTransitionScrollLock(false);
      resetTransition();
      return false;
    }

    state.value = {
      ...state.value,
      to: rectFromElement(finalTarget),
      mediaClipTo: clipFromElement(finalTarget),
      mediaRadiusTo: borderRadiusFromElement(finalTarget),
      titleTo: targetTitle ? rectFromElement(targetTitle) : null,
      titleStyleTo: titleStyleFromElement(targetTitle),
      metaTo: targetMeta ? rectFromElement(targetMeta) : null,
      metaStyleTo: metaStyleFromElement(targetMeta),
      slipTo: targetSlip ? rectFromElement(targetSlip) : null,
      slipStyleTo: slipStyleFromElement(targetSlip),
      shellTo: targetShell ? rectFromElement(targetShell) : null,
      shellStyleTo: shellStyleFromElement(targetShell),
      phase: 'moving',
    };

    completeTransitionAfterMotion();

    if (targetRole === 'source' && route.path === '/') {
      // Both explicit Home links and browser history finish here after the destination is measured.
      state.value = {
        ...state.value,
        surroundingsCue: state.value.surroundingsCue + 1,
      };
      await waitForPaint();
      state.value = { ...state.value, hideDestination: false };
    }

    return true;
  }

  async function beginFeaturedMediaNavigation(
    to: string,
    key: string,
    media?: FeaturedImage | null,
  ) {
    if (state.value.active || state.value.phase === 'preflight') return false;
    media ??= mediaFromFrame(findMediaFrame('source', key));
    if (!canStartFeaturedMediaTransitionFromRole(key, 'source', media)) {
      setTransitionScrollLock(false);
      return false;
    }

    const originalPath = route.fullPath;
    const isWritingArchive =
      key.startsWith('post-') && route.path === '/writing';
    // A decoded hero candidate must be chosen before the flight; never exchange the texture in mid-morph. Preflight and selected-image preparation share the same wait.
    const [preparedMedia] = await Promise.all([
      isWritingArchive
        ? prepareWritingFlightMedia(media)
        : Promise.resolve(null),
      waitForCardExtraPreflight(key),
    ]);

    if (isWritingArchive && route.fullPath !== originalPath) {
      if (state.value.key === key && !state.value.active) {
        setTransitionScrollLock(false);
        resetTransition();
      }
      return false;
    }

    if (
      !startFeaturedMediaTransitionFromRole(
        key,
        'source',
        media,
        true,
        preparedMedia,
      )
    ) {
      setTransitionScrollLock(false);
      resetTransition();
      return false;
    }

    const flightId = state.value.flightId;
    rememberSourcePath(key);
    rememberSourceSnapshot(key);
    await waitForPaint();
    const cloneReady = waitForCaseStudyCloneReady();

    // Loop cards retain the loaded source beneath the clone until its own image has decoded.
    if (route.path.startsWith('/case-studies/')) {
      const images = Array.from(
        document.querySelectorAll<HTMLImageElement>('.ftml-layer--media img'),
      );
      const exit = waitForSurroundingsExit();
      await Promise.all([
        exit,
        Promise.race([
          Promise.allSettled(images.map((image) => image.decode())),
          waitForBoundedDelay(1500),
        ]),
      ]);
      if (images.some((image) => !image.complete || image.naturalWidth === 0)) {
        resetTransition();
        setTransitionScrollLock(false);
        return false;
      }
      await waitForCommittedPaint();
    }

    // Keep the source mounted until its measured surroundings have left the viewport.
    if (route.path === '/' || route.path === '/writing') {
      await waitForSurroundingsExit(route.path === '/writing');
    }

    await cloneReady;
    if (state.value.flightId !== flightId || !state.value.active) return false;

    // Source exit is done; hide the destination so the detail page mounts
    // hidden (no flash of its un-transitioned content) until the clone is
    // positioned.
    state.value = { ...state.value, hideDestination: true };

    return true;
  }

  async function finishFeaturedMediaNavigation(key: string) {
    await waitForTransitionTarget(key, 'target');
    window.scrollTo({ left: 0, top: 0 });
    await finishFeaturedMediaTransitionToRole(key, 'target');
    state.value = { ...state.value, hideDestination: false };
  }

  async function navigateWithFeaturedMediaTransition(
    event: MouseEvent,
    to: string,
    key: string,
    media?: FeaturedImage | null,
  ) {
    if (!eventAllowsTransitionNavigation(event)) return;
    event.preventDefault();
    if (state.value.active || state.value.phase === 'preflight') return;
    const started = await beginFeaturedMediaNavigation(to, key, media);
    await navigateTo(to);
    if (started) await finishFeaturedMediaNavigation(key);
  }

  async function navigateFromFeaturedMediaTarget(
    event: MouseEvent,
    to: string,
    key: string,
  ) {
    if (!eventAllowsTransitionNavigation(event)) {
      return;
    }

    event.preventDefault();

    if (key.startsWith('post-') && pathFromNavigationTarget(to) === '/') {
      const originalPath = route.fullPath;
      try {
        await getHomePosts();
      } catch {
        // Without confirmed Home membership, retain ordinary page navigation.
      }
      if (route.fullPath !== originalPath || state.value.active) return;
    }

    if (!shouldAttemptReverseFeaturedMediaTransition(to, key)) {
      setTransitionScrollLock(false);
      await navigateTo(to);
      return;
    }

    if (
      key.startsWith('post-') &&
      pathFromNavigationTarget(to) === '/writing' &&
      canStartFeaturedMediaTransitionFromRole(key, 'target')
    ) {
      await waitForCardExtraPreflight(key, 'target');
    }

    if (
      !startFeaturedMediaTransitionFromRole(
        key,
        'target',
        undefined,
        pathFromNavigationTarget(to) !== '/writing',
      )
    ) {
      setTransitionScrollLock(false);
      await navigateTo(to);
      return;
    }

    if (
      key.startsWith('post-') &&
      pathFromNavigationTarget(to) === '/writing'
    ) {
      startShellFromSlip();
    }

    await waitForPaint();
    await waitForCaseStudyCloneReady();

    // Step 1, solo: let the detail body slide right to its measured clear-out
    // endpoint. The photo clone stays put at the hero during this beat; it
    // flies only after navigation.
    await waitForArticleDeparture();

    // Hide the home destination so it doesn't flash its top (the "Bottom Line"
    // hero) before it's been scrolled to the card and its surroundings placed.
    // It stays hidden through navigation, the scroll, and the surroundings
    // positioning below, then is revealed in place.
    state.value = { ...state.value, hideDestination: true };

    const cachedSourceSnapshot = sourceSnapshotForNavigation(to, key);

    await navigateTo(to);
    const didFindTarget = await waitForTransitionTarget(key, 'source');

    if (!didFindTarget && cachedSourceSnapshot) {
      moveFeaturedMediaTransitionToSnapshot(cachedSourceSnapshot);
      scrollToUrlHash(to);
      completeTransitionAfterMotion();
      state.value = { ...state.value, hideDestination: false };
      return;
    }

    // Start once the mounted card has its final scroll position. A cached viewport rect can differ substantially; starting toward it and retargeting mid-flight also leaves the decorative echoes flying to the old endpoint.
    const didFinish = await finishFeaturedMediaTransitionToRole(key, 'source', {
      scrollToTarget: true,
    });

    if (!didFinish) {
      scrollToUrlHash(to);
    }

    state.value = { ...state.value, hideDestination: false };
  }

  return {
    beginFeaturedMediaNavigation,
    finishFeaturedMediaNavigation,
    canStartFeaturedMediaTransitionFromRole,
    waitForCardExtraPreflight,
    finishFeaturedMediaTransitionToRole,
    finishFeaturedMediaCloneRelease,
    navigateWithFeaturedMediaTransition,
    navigateFromFeaturedMediaTarget,
    shouldAttemptReverseFeaturedMediaTransition,
    startFeaturedMediaTransitionFromRole,
    waitForCaseStudyCloneReady,
    waitForArticleDeparture,
    startShellFromSlip,
    state,
  };
}
