function fallbackMotionDuration() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 120;
  }

  return featuredMediaTransitionDuration();
}

function scrollToHash(hash: string) {
  if (!hash) {
    return;
  }

  let id = hash.replace(/^#/, '');

  try {
    id = decodeURIComponent(id);
  } catch {
    id = hash.replace(/^#/, '');
  }

  const target = document.getElementById(id);
  target?.scrollIntoView({
    block: 'start',
    inline: 'nearest',
  });
}

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();
  const routeMotion = useRouteChoreography();
  const routeMotionState = useRouteChoreographyState();
  routeMotion.reset();
  const featuredMediaTransition = useFeaturedMediaTransitionState();
  const fallbackPageTransition = useFallbackPageTransitionState();
  const { shouldAttemptReverseFeaturedMediaTransition } =
    useFeaturedMediaTransition();

  router.beforeEach(async (to, from) => {
    if (from.path === to.path) {
      return;
    }

    if (
      featuredMediaTransition.value.active ||
      sessionStorage.getItem('featured-media-transition-active') === 'true'
    ) {
      return;
    }

    const transitionKey = featuredMediaTransitionKeyFromNavigation(
      from.path,
      to.path,
    );

    if (
      transitionKey &&
      shouldAttemptReverseFeaturedMediaTransition(to.fullPath, transitionKey)
    ) {
      return;
    }

    if (
      hasRouteChoreography(from.path, to.path) &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      fallbackPageTransition.value = 'idle';
      await routeMotion.leave(from.path, to.path);
      return;
    }
    routeMotion.reset();
    fallbackPageTransition.value = 'leaving';
  });

  router.afterEach((_to, _from, failure) => {
    if (failure) {
      fallbackPageTransition.value = 'idle';
      routeMotion.reset();
    }
  });

  nuxtApp.hooks.hook('page:finish', () => {
    if (
      routeMotionState.value.active &&
      routeMotionState.value.hideDestination
    ) {
      const route = router.currentRoute.value;
      void routeMotion
        .enter(route.path, route.hash)
        .catch(() => routeMotion.reset());
      return;
    }
    if (fallbackPageTransition.value !== 'leaving') {
      return;
    }

    fallbackPageTransition.value = 'entering';

    requestAnimationFrame(() => {
      // Vue Router stores the destination history entry's saved position here. Its early scroll can be clamped by the outgoing document, so restore again after the new page mounts; a fresh push has no saved position.
      const saved = window.history.state?.scroll;
      if (saved && Number.isFinite(saved.top) && Number.isFinite(saved.left)) {
        window.scrollTo({
          left: saved.left,
          top: saved.top,
          behavior: 'instant',
        });
      } else {
        scrollToHash(router.currentRoute.value.hash);
      }

      requestAnimationFrame(() => {
        fallbackPageTransition.value = 'entering-active';

        window.setTimeout(() => {
          if (fallbackPageTransition.value === 'entering-active') {
            fallbackPageTransition.value = 'idle';
          }
        }, fallbackMotionDuration());
      });
    });
  });
});
