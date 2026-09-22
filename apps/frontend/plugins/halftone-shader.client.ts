import { installHalftone } from '../utils/halftone-shader.client';

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.client) {
    nuxtApp.hook('app:mounted', async () => {
      console.log('[halftone-shader.client.ts] Plugin starting...');
      await installHalftone();
      console.log('[halftone-shader.client.ts] Plugin installed!');
    });
  }
});
