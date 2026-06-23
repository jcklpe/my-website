export const HALFTONE_PERFORMANCE_CLASS = 'is-halftone-performance-safe';

const HALFTONE_FALLBACK_MEDIA_QUERIES = [
  '(max-width: 767px)',
  '(pointer: coarse)',
];

type MediaQueryChangeHandler = (event: MediaQueryListEvent) => void;

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: MediaQueryChangeHandler) => void;
  removeListener?: (listener: MediaQueryChangeHandler) => void;
};

function isAppleSafari() {
  const userAgent = window.navigator.userAgent;
  const vendor = window.navigator.vendor;

  return (
    vendor.includes('Apple') &&
    /Safari/i.test(userAgent) &&
    !/CriOS|FxiOS|EdgiOS|Chrome|Chromium|Android/i.test(userAgent)
  );
}

function isTouchAppleDevice() {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;

  return (
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
  );
}

export function shouldUseHalftonePerformanceFallback() {
  if (!import.meta.client) {
    return false;
  }

  return (
    isAppleSafari() ||
    isTouchAppleDevice() ||
    HALFTONE_FALLBACK_MEDIA_QUERIES.some((query) => window.matchMedia(query).matches)
  );
}

export function syncHalftonePerformanceClass() {
  if (!import.meta.client) {
    return false;
  }

  const shouldUseFallback = shouldUseHalftonePerformanceFallback();

  document.documentElement.classList.toggle(
    HALFTONE_PERFORMANCE_CLASS,
    shouldUseFallback,
  );

  return shouldUseFallback;
}

export function watchHalftonePerformanceFallback(
  onChange: (shouldUseFallback: boolean) => void,
) {
  if (!import.meta.client) {
    return () => {};
  }

  const mediaQueries = HALFTONE_FALLBACK_MEDIA_QUERIES.map((query) =>
    window.matchMedia(query),
  );
  const update = () => onChange(syncHalftonePerformanceClass());
  const addChangeListener = (mediaQuery: MediaQueryList) => {
    const legacyMediaQuery = mediaQuery as LegacyMediaQueryList;

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);
      return;
    }

    legacyMediaQuery.addListener?.(update);
  };
  const removeChangeListener = (mediaQuery: MediaQueryList) => {
    const legacyMediaQuery = mediaQuery as LegacyMediaQueryList;

    if (typeof mediaQuery.removeEventListener === 'function') {
      mediaQuery.removeEventListener('change', update);
      return;
    }

    legacyMediaQuery.removeListener?.(update);
  };

  update();
  mediaQueries.forEach(addChangeListener);

  return () => {
    mediaQueries.forEach(removeChangeListener);
  };
}
