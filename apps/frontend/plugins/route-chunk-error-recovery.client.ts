const routeChunkErrorPatterns = [
  /failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /importing a module script failed/i,
];

function isRouteChunkError(error: unknown) {
  const message =
    error instanceof Error ? error.message : String(error ?? '');

  return routeChunkErrorPatterns.some((pattern) => pattern.test(message));
}

function recoveryKey(path: string) {
  return `route-chunk-reload:${path}`;
}

export default defineNuxtPlugin(() => {
  const router = useRouter();

  router.onError((error) => {
    if (!isRouteChunkError(error)) {
      return;
    }

    const key = recoveryKey(window.location.pathname);

    if (sessionStorage.getItem(key) === 'true') {
      return;
    }

    sessionStorage.setItem(key, 'true');
    window.location.reload();
  });

  router.afterEach((to) => {
    sessionStorage.removeItem(recoveryKey(to.path));
  });
});
