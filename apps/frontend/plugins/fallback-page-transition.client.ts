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
  const featuredMediaTransition = useFeaturedMediaTransitionState();
  const fallbackPageTransition = useFallbackPageTransitionState();
  const { shouldAttemptReverseFeaturedMediaTransition } =
    useFeaturedMediaTransition();

  router.beforeEach((to, from) => {
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

    fallbackPageTransition.value = 'leaving';
  });

  router.afterEach((_to, _from, failure) => {
    if (failure) {
      fallbackPageTransition.value = 'idle';
    }
  });

  nuxtApp.hooks.hook('page:finish', () => {
    if (fallbackPageTransition.value !== 'leaving') {
      return;
    }

    fallbackPageTransition.value = 'entering';

    requestAnimationFrame(() => {
      scrollToHash(router.currentRoute.value.hash);

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
