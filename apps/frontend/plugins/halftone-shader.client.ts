import { isLiveHalftoneRequested } from '~/utils/halftone-control.client';

export default defineNuxtPlugin((nuxtApp) => {
  if (!isLiveHalftoneRequested()) return;

  nuxtApp.hook('app:mounted', async () => {
    try {
      const { installHalftone } =
        await import('../utils/halftone-shader.client');
      const renderer = await installHalftone();
      if (!renderer)
        document.documentElement.classList.remove('is-live-halftone-pending');
    } catch (error) {
      document.documentElement.classList.remove('is-live-halftone-pending');
      console.error('Live halftone unavailable:', error);
    }
  });
});
