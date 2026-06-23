import {
  HALFTONE_PERFORMANCE_CLASS,
  shouldUseHalftonePerformanceFallback,
  watchHalftonePerformanceFallback,
} from '~/utils/halftone-performance';

export function useHalftonePerformanceFallback() {
  const shouldUseFallback = useState('halftone-performance-fallback', () => false);

  if (import.meta.client) {
    shouldUseFallback.value =
      document.documentElement.classList.contains(HALFTONE_PERFORMANCE_CLASS) ||
      shouldUseHalftonePerformanceFallback();

    let stopWatching: (() => void) | null = null;

    onMounted(() => {
      stopWatching = watchHalftonePerformanceFallback((nextValue) => {
        shouldUseFallback.value = nextValue;
      });
    });

    onBeforeUnmount(() => stopWatching?.());
  }

  return shouldUseFallback;
}
