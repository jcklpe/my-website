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

interface FeaturedMediaTransitionState {
  active: boolean;
  key: string | null;
  media: FeaturedImage | null;
  from: FeaturedMediaTransitionRect | null;
  to: FeaturedMediaTransitionRect | null;
  mediaClipFrom: string;
  mediaClipTo: string;
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
  phase: 'idle' | 'starting' | 'moving';
}

type FeaturedMediaTransitionRole = 'source' | 'target';
type FeaturedMediaSourceRegistry = Record<string, string[]>;

const FALLBACK_TRANSITION_DURATION = 200;
const RECTANGULAR_CLIP = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';

function initialFeaturedMediaTransitionState(): FeaturedMediaTransitionState {
  return {
    active: false,
    key: null,
    media: null,
    from: null,
    to: null,
    mediaClipFrom: RECTANGULAR_CLIP,
    mediaClipTo: RECTANGULAR_CLIP,
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

function routeTransitionDuration() {
  if (!import.meta.client) {
    return FALLBACK_TRANSITION_DURATION;
  }

  const routeDuration = getComputedStyle(
    document.documentElement,
  ).getPropertyValue('--motion-route-transition-duration');

  return millisecondsFromCssTime(routeDuration);
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

function setTransitionScrollLock(isLocked: boolean) {
  if (!import.meta.client) {
    return;
  }

  if (isLocked) {
    sessionStorage.setItem('featured-media-transition-active', 'true');
    return;
  }

  sessionStorage.removeItem('featured-media-transition-active');
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
  const nuxtApp = useNuxtApp();
  const route = useRoute();
  const state = useFeaturedMediaTransitionState();
  const sourceRegistry = useFeaturedMediaSourceRegistry();

  function resetTransition() {
    state.value = initialFeaturedMediaTransitionState();
  }

  function completeTransitionAfterMotion() {
    window.setTimeout(() => {
      setTransitionScrollLock(false);
      resetTransition();
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
    const transitionMedia = media?.sourceUrl ? media : mediaFromFrame(source);

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
      title: sourceTitle?.textContent?.trim() || null,
      titleFrom: sourceTitle ? rectFromElement(sourceTitle) : null,
      titleStyleFrom: titleStyleFromElement(sourceTitle),
      meta: sourceMeta?.textContent?.trim() || null,
      metaFrom: sourceMeta ? rectFromElement(sourceMeta) : null,
      metaStyleFrom: metaStyleFromElement(sourceMeta),
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

  function shouldAttemptReverseFeaturedMediaTransition(to: string, key: string) {
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

    if (!finalTarget) {
      setTransitionScrollLock(false);
      resetTransition();
      return false;
    }

    state.value = {
      ...state.value,
      to: rectFromElement(finalTarget),
      mediaClipTo: clipFromElement(finalTarget),
      titleTo: targetTitle ? rectFromElement(targetTitle) : null,
      titleStyleTo: titleStyleFromElement(targetTitle),
      metaTo: targetMeta ? rectFromElement(targetMeta) : null,
      metaStyleTo: metaStyleFromElement(targetMeta),
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
    await waitForPaint();

    const pageFinished = new Promise<void>((resolve) => {
      nuxtApp.hooks.hookOnce('page:finish', () => {
        requestAnimationFrame(() => resolve());
      });
    });

    await navigateTo(to);
    await pageFinished;
    window.scrollTo({ left: 0, top: 0 });
    await finishFeaturedMediaTransitionToRole(key, 'target');
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

    const pageFinished = new Promise<void>((resolve) => {
      nuxtApp.hooks.hookOnce('page:finish', () => {
        requestAnimationFrame(() => resolve());
      });
    });

    await navigateTo(to);
    await pageFinished;
    const didFinish = await finishFeaturedMediaTransitionToRole(key, 'source', {
      scrollToTarget: true,
    });

    if (!didFinish) {
      scrollToUrlHash(to);
    }
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
