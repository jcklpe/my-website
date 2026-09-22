import { installHalftone } from '../utils/halftone-shader.client';

export default defineNuxtPlugin(async (nuxtApp) => {
  // We only run this on the client
  if (process.client) {
    // Install the global WebGL halftone shader to dynamically scan and render .is-baked-halftone images
    await installHalftone();
  }
});
