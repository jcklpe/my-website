import type { FeaturedImage } from '~/types/wordpress';

interface FeaturedMediaTransitionRect {
  left: number;
  top: number;
  width: number;
  height: number;
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
}

interface FeaturedMediaTransitionState {
  active: boolean;
  key: string | null;
  media: FeaturedImage | null;
  from: FeaturedMediaTransitionRect | null;
  to: FeaturedMediaTransitionRect | null;
  mediaClipFrom: string;
  mediaClipTo: string;
  mediaRadiusFrom: string;
  mediaRadiusTo: string;
  title: string | null;
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
  // 'moving' = clone is animating to its destination rect (to).
  phase: 'idle' | 'starting' | 'moving';
}

type FeaturedMediaTransitionRole = 'source' | 'target';
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
}

type FeaturedMediaSourceSnapshotRegistry = Record<
  string,
  Record<string, FeaturedMediaSourceSnapshot>
>;

const FALLBACK_TRANSITION_DURATION = 200;
const RECTANGULAR_CLIP = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
const SQUARE_RADIUS = '0px';
const TRANSITION_LOCK_STORAGE_KEY = 'featured-media-transition-active';

function initialFeaturedMediaTransitionState(): FeaturedMediaTransitionState {
  return {
    active: false,
    key: null,
    media: null,
    from: null,
    to: null,
    mediaClipFrom: RECTANGULAR_CLIP,
    mediaClipTo: RECTANGULAR_CLIP,
    mediaRadiusFrom: SQUARE_RADIUS,
    mediaRadiusTo: SQUARE_RADIUS,
    title: null,
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
    surroundingsCue: 0,
    hideDestination: false,
    phase: 'idle',
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

function mediaFromFrame(element: HTMLElement | null): FeaturedImage | null {
  const image = element?.querySelector<HTMLImageElement>('img');
  const sourceUrl = image?.currentSrc || image?.src || '';

  if (!sourceUrl) {
    return null;
  }

  return {
    sourceUrl,
    altText: image?.alt ?? '',
  };
}

function clipFromElement(element: HTMLElement | null) {
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

function titleStyleFromElement(
  element: HTMLElement | null,
): FeaturedMediaTransitionTitleStyle | null {
  if (!element) {
    return null;
  }

  const labelElement =
    element.firstElementChild instanceof HTMLElement
      ? element.firstElementChild
      : element;
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
  };
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

function routeTransitionDuration() {
  return cssDurationVar(
    '--motion-route-transition-duration',
    FALLBACK_TRANSITION_DURATION,
  );
}

// Reverse: how long the detail body slides out before the rest begins. Short
// and independent of the (possibly slowed-for-testing) route duration.
function contentExitDuration() {
  return cssDurationVar('--motion-content-exit-duration', 450);
}

// Hand-off: duotone cross-fade duration. Independent of the route duration.
function duotoneFadeDuration() {
  return cssDurationVar('--motion-duotone-fade-duration', 350);
}

export function featuredMediaTransitionDuration() {
  return routeTransitionDuration();
}

function waitForAnimationFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitForPaint() {
  await nextTick();
  await waitForAnimationFrame();
}

// Reverse only: hold while the detail body plays its slide-out exit, before
// navigating away (the body unmounts on nav). Skipped under reduced motion.
function waitForContentExit() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, contentExitDuration());
  });
}

// Forward only: hold while the home surroundings animate out around the lifting
// card, before navigating away (they live on the home page, which unmounts on
// nav). Matches the home choreography's --motion-surroundings-duration token.
function waitForSurroundingsExit() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, cssDurationVar('--motion-surroundings-duration', 500));
  });
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
  const sourceSnapshotRegistry = useFeaturedMediaSourceSnapshotRegistry();

  if (import.meta.client && !state.value.active) {
    setTransitionScrollLock(false);
  }

  function resetTransition() {
    state.value = initialFeaturedMediaTransitionState();
  }

  // After the clone finishes moving, hand off with a cross-fade rather than an
  // instant swap. Flipping `active` to false un-hides the real destination
  // underneath (the hide conditions key off `active`) AND lets the clone's Vue
  // <Transition> leave-fade run over it — a plain CSS opacity fade, nothing
  // orchestrated. Media is kept until the fade ends so the leaving clone still
  // has its image; the full reset clears it after. This is the duotone
  // cross-fade in — its length is the --motion-duotone-fade-duration token.
  function completeTransitionAfterMotion() {
    window.setTimeout(() => {
      setTransitionScrollLock(false);
      state.value = { ...state.value, active: false };

      window.setTimeout(() => {
        resetTransition();
      }, duotoneFadeDuration());
    }, routeTransitionDuration());
  }

  function startFeaturedMediaTransitionFromRole(
    key: string,
    sourceRole: FeaturedMediaTransitionRole,
    media?: FeaturedImage | null,
  ) {
    const source = findMediaFrame(sourceRole, key);
    const sourceTitle = findTitleFrame(sourceRole, key);
    const sourceMeta = findMetaFrame(sourceRole, key);
    const sourceSlip = findSlipFrame(sourceRole, key);
    // Prefer the source IMAGE ELEMENT'S currentSrc (the exact resized variant
    // it already loaded and is showing) over the passed FeaturedImage (whose
    // sourceUrl is the full-size original). The clone must reuse the cached
    // image — otherwise, at sizes="100vw", it fetches a larger/original variant
    // that isn't cached, and the halftone renders solid black while it loads
    // (the Home→Detail black flash). The passed media is only a fallback for
    // when the source img isn't loaded yet.
    const transitionMedia = mediaFromFrame(source) ?? media ?? null;

    if (
      !transitionMedia?.sourceUrl ||
      !source ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return false;
    }

    setTransitionScrollLock(true);
    state.value = {
      ...initialFeaturedMediaTransitionState(),
      active: true,
      key,
      media: transitionMedia,
      from: rectFromElement(source),
      mediaClipFrom: clipFromElement(source),
      mediaRadiusFrom: borderRadiusFromElement(source),
      title: sourceTitle?.textContent?.trim() || null,
      titleFrom: sourceTitle ? rectFromElement(sourceTitle) : null,
      titleStyleFrom: titleStyleFromElement(sourceTitle),
      meta: sourceMeta?.textContent?.trim() || null,
      metaFrom: sourceMeta ? rectFromElement(sourceMeta) : null,
      metaStyleFrom: metaStyleFromElement(sourceMeta),
      slipFrom: sourceSlip ? rectFromElement(sourceSlip) : null,
      slipStyleFrom: slipStyleFromElement(sourceSlip),
      phase: 'starting',
    };

    return true;
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
      phase: 'moving',
    };
  }

  async function waitForTransitionTarget(
    key: string,
    role: FeaturedMediaTransitionRole,
  ) {
    const timeoutAt = window.performance.now() + TRANSITION_TARGET_READY_TIMEOUT;

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
      return knownSourcePaths.includes('/');
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
      phase: 'moving',
    };

    completeTransitionAfterMotion();

    return true;
  }

  async function navigateWithFeaturedMediaTransition(
    event: MouseEvent,
    to: string,
    key: string,
    media?: FeaturedImage | null,
  ) {
    if (!eventAllowsTransitionNavigation(event)) {
      return;
    }

    event.preventDefault();

    if (!startFeaturedMediaTransitionFromRole(key, 'source', media)) {
      setTransitionScrollLock(false);
      await navigateTo(to);
      return;
    }

    rememberSourcePath(key);
    rememberSourceSnapshot(key);
    await waitForPaint();

    // Hold while the home surroundings assemble out around the lifting card
    // (the home page's watcher started that the moment `active` flipped on, in
    // startFeaturedMediaTransitionFromRole). They live on the home page, so
    // they must finish before navigation unmounts it.
    await waitForSurroundingsExit();

    // Source exit is done; hide the destination so the detail page mounts
    // hidden (no flash of its un-transitioned content) until the clone is
    // positioned.
    state.value = { ...state.value, hideDestination: true };

    await navigateTo(to);
    await waitForTransitionTarget(key, 'target');
    window.scrollTo({ left: 0, top: 0 });
    await finishFeaturedMediaTransitionToRole(key, 'target');

    // Clone is positioned and flying (phase 'moving'); reveal the detail page so
    // its body rises in alongside the flight.
    state.value = { ...state.value, hideDestination: false };
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

    if (!shouldAttemptReverseFeaturedMediaTransition(to, key)) {
      setTransitionScrollLock(false);
      await navigateTo(to);
      return;
    }

    if (!startFeaturedMediaTransitionFromRole(key, 'target')) {
      setTransitionScrollLock(false);
      await navigateTo(to);
      return;
    }

    await waitForPaint();

    // Step 1, solo: let the detail body slide out (down + off) on the real
    // page BEFORE anything else moves — its `is-leaving` exit was triggered by
    // the page's watcher when `active` flipped on. Held for the short
    // content-exit token (NOT the route duration), so a slowed route for
    // testing doesn't drag this beat out. The photo clone stays put at the
    // hero during this beat; it flies only after navigation.
    await waitForContentExit();

    // Hide the home destination so it doesn't flash its top (the "Bottom Line"
    // hero) before it's been scrolled to the card and its surroundings placed.
    // It stays hidden through navigation, the scroll, and the surroundings
    // positioning below, then is revealed in place.
    state.value = { ...state.value, hideDestination: true };

    const cachedSourceSnapshot = sourceSnapshotForNavigation(to, key);

    if (cachedSourceSnapshot) {
      moveFeaturedMediaTransitionToSnapshot(cachedSourceSnapshot);
    }

    await navigateTo(to);
    const didFindTarget = await waitForTransitionTarget(key, 'source');

    if (!didFindTarget && cachedSourceSnapshot) {
      scrollToUrlHash(to);
      completeTransitionAfterMotion();
      state.value = { ...state.value, hideDestination: false };
      return;
    }

    const didFinish = await finishFeaturedMediaTransitionToRole(key, 'source', {
      scrollToTarget: true,
    });

    if (!didFinish) {
      scrollToUrlHash(to);
    }

    // The destination card is now scrolled into view and the flight is under
    // way — cue the home page to position its surroundings off-frame, give it a
    // frame to apply that, THEN reveal so they slide in (rather than flashing in
    // place) and the top-of-page is never seen.
    state.value = {
      ...state.value,
      surroundingsCue: state.value.surroundingsCue + 1,
    };
    await waitForPaint();
    state.value = { ...state.value, hideDestination: false };
  }

  return {
    finishFeaturedMediaTransitionToRole,
    navigateWithFeaturedMediaTransition,
    navigateFromFeaturedMediaTarget,
    shouldAttemptReverseFeaturedMediaTransition,
    startFeaturedMediaTransitionFromRole,
    state,
  };
}
