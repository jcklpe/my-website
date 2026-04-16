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

const FALLBACK_TRANSITION_DURATION = 200;
const RECTANGULAR_CLIP = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';

function rectFromElement(element: HTMLElement): FeaturedMediaTransitionRect {
  const rect = element.getBoundingClientRect();

  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function findMediaFrame(kind: 'source' | 'target', key: string) {
  return document.querySelector<HTMLElement>(
    `[data-featured-media-${kind}="${key}"]`,
  );
}

function findTitleFrame(kind: 'source' | 'target', key: string) {
  return document.querySelector<HTMLElement>(
    `[data-featured-title-${kind}="${key}"]`,
  );
}

function findMetaFrame(kind: 'source' | 'target', key: string) {
  return document.querySelector<HTMLElement>(
    `[data-featured-meta-${kind}="${key}"]`,
  );
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

export function useFeaturedMediaTransitionState() {
  return useState<FeaturedMediaTransitionState>(
    'featured-media-transition',
    () => ({
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
    }),
  );
}

export function useFeaturedMediaTransition() {
  const nuxtApp = useNuxtApp();
  const state = useFeaturedMediaTransitionState();

  async function navigateWithFeaturedMediaTransition(
    event: MouseEvent,
    to: string,
    key: string,
    media?: FeaturedImage | null,
  ) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    setTransitionScrollLock(true);

    const source = findMediaFrame('source', key);
    const sourceTitle = findTitleFrame('source', key);
    const sourceMeta = findMetaFrame('source', key);

    if (
      !media?.sourceUrl ||
      !source ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setTransitionScrollLock(false);
      await navigateTo(to);
      return;
    }

    state.value = {
      active: true,
      key,
      media,
      from: rectFromElement(source),
      to: null,
      mediaClipFrom: clipFromElement(source),
      mediaClipTo: RECTANGULAR_CLIP,
      title: sourceTitle?.textContent?.trim() || null,
      titleFrom: sourceTitle ? rectFromElement(sourceTitle) : null,
      titleTo: null,
      titleStyleFrom: titleStyleFromElement(sourceTitle),
      titleStyleTo: null,
      meta: sourceMeta?.textContent?.trim() || null,
      metaFrom: sourceMeta ? rectFromElement(sourceMeta) : null,
      metaTo: null,
      metaStyleFrom: metaStyleFromElement(sourceMeta),
      metaStyleTo: null,
      phase: 'starting',
    };

    await waitForPaint();

    const pageFinished = new Promise<void>((resolve) => {
      nuxtApp.hooks.hookOnce('page:finish', () => {
        requestAnimationFrame(() => resolve());
      });
    });

    await navigateTo(to);
    await pageFinished;
    window.scrollTo({ left: 0, top: 0 });
    await waitForPaint();

    const target = findMediaFrame('target', key);
    const targetTitle = findTitleFrame('target', key);
    const targetMeta = findMetaFrame('target', key);

    if (!target) {
      setTransitionScrollLock(false);
      state.value = {
        ...state.value,
        active: false,
        key: null,
        phase: 'idle',
      };
      return;
    }

    state.value = {
      ...state.value,
      to: rectFromElement(target),
      mediaClipTo: clipFromElement(target),
      titleTo: targetTitle ? rectFromElement(targetTitle) : null,
      titleStyleTo: titleStyleFromElement(targetTitle),
      metaTo: targetMeta ? rectFromElement(targetMeta) : null,
      metaStyleTo: metaStyleFromElement(targetMeta),
      phase: 'moving',
    };

    window.setTimeout(() => {
      setTransitionScrollLock(false);
      state.value = {
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
    }, routeTransitionDuration());
  }

  return {
    navigateWithFeaturedMediaTransition,
    state,
  };
}
