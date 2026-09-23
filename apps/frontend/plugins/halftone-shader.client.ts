export default defineNuxtPlugin((nuxtApp) => {
  // The port is still broken. Keep normal navigation on the existing treatment while retaining an explicit diagnostic entry point.
  const enabled =
    new URLSearchParams(window.location.search).get('experimentalHalftone') ===
    '1';

  if (!enabled) {
    return;
  }

  nuxtApp.hook('app:mounted', async () => {
    const { installHalftone } = await import('../utils/halftone-shader.client');
    await installHalftone();
  });
});
