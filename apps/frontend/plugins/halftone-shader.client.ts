import { isLiveHalftoneRequested } from '~/utils/halftone-control.client';

export default defineNuxtPlugin((nuxtApp) => {
  if (!isLiveHalftoneRequested()) return;

  nuxtApp.hook('app:mounted', async () => {
    const { installHalftone } = await import('../utils/halftone-shader.client');
    await installHalftone();
  });
});
