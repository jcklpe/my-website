import { watchHalftonePerformanceFallback } from '~/utils/halftone-performance';

export default defineNuxtPlugin(() => {
  const stopWatching = watchHalftonePerformanceFallback(() => {});

  window.addEventListener('pagehide', stopWatching, { once: true });
});
