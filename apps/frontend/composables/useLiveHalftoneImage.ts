import type { Ref, WatchStopHandle } from 'vue';
import { isLiveHalftoneRequested } from '~/utils/halftone-control.client';

// The owning component registers only its own image. Dynamic import keeps WebGL code out of ordinary page startup while the integration flag is off.
export function useLiveHalftoneImage(
  image: Ref<HTMLImageElement | null>,
  enabled: Ref<boolean>,
  source: Ref<string>,
) {
  let stopWatch: WatchStopHandle | null = null;
  let unregister: (() => void) | null = null;
  let generation = 0;

  onMounted(() => {
    stopWatch = watch(
      [image, enabled, source],
      async ([element, shouldRender]) => {
        const currentGeneration = ++generation;
        unregister?.();
        unregister = null;
        if (!element || !shouldRender || !isLiveHalftoneRequested()) return;

        const { registerHalftoneSurface } =
          await import('~/utils/halftone-shader.client');
        if (currentGeneration !== generation || !element.isConnected) return;

        const release = await registerHalftoneSurface(element);
        if (currentGeneration !== generation || !element.isConnected) {
          release();
          return;
        }
        unregister = release;
      },
      { immediate: true, flush: 'post' },
    );
  });

  onBeforeUnmount(() => {
    generation++;
    stopWatch?.();
    unregister?.();
  });
}
