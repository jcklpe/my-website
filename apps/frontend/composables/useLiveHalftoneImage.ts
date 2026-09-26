import type { Ref, WatchStopHandle } from 'vue';
import { isLiveHalftoneRequested } from '~/utils/halftone-control.client';

// The owning component registers only its own image. Dynamic import keeps WebGL code out of ordinary page startup while the integration flag is off.
export function useLiveHalftoneImage(
  image: Ref<HTMLImageElement | null>,
  enabled: Ref<boolean>,
  source: Ref<string>,
  options: { preserveUntilDetached?: boolean } = {},
) {
  let stopWatch: WatchStopHandle | null = null;
  let unregister: (() => void) | null = null;
  let registeredImage: HTMLImageElement | null = null;
  let generation = 0;

  // Vue clears a Transition ref before its leave animation detaches the node; keep the drawn canvas through that visible handoff.
  function releaseWhenDetached(element: HTMLImageElement, release: () => void) {
    if (!element.isConnected) {
      release();
      return;
    }

    let finished = false;
    const observer = new MutationObserver(() => {
      if (!element.isConnected) finish();
    });
    function finish() {
      if (finished) return;
      finished = true;
      observer.disconnect();
      release();
    }

    observer.observe(document, { childList: true, subtree: true });
  }

  function releaseCurrent(nextElement: HTMLImageElement | null) {
    if (!unregister) return;
    const release = unregister;
    const previousElement = registeredImage;
    unregister = null;
    registeredImage = null;

    if (
      options.preserveUntilDetached &&
      previousElement &&
      previousElement !== nextElement
    ) {
      releaseWhenDetached(previousElement, release);
    } else {
      release();
    }
  }

  onMounted(() => {
    stopWatch = watch(
      [image, enabled, source],
      async ([element, shouldRender]) => {
        const currentGeneration = ++generation;
        releaseCurrent(element);
        if (!element || !shouldRender || !isLiveHalftoneRequested()) return;

        const { registerHalftoneSurface } =
          await import('~/utils/halftone-shader.client');
        if (currentGeneration !== generation || !element.isConnected) return;

        const release = await registerHalftoneSurface(element);
        if (currentGeneration !== generation || !element.isConnected) {
          if (options.preserveUntilDetached && image.value !== element)
            releaseWhenDetached(element, release);
          else release();
          return;
        }
        unregister = release;
        registeredImage = element;
      },
      { immediate: true, flush: 'post' },
    );
  });

  onBeforeUnmount(() => {
    generation++;
    stopWatch?.();
    releaseCurrent(null);
  });
}
