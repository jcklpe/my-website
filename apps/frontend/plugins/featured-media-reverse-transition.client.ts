export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();
  const transitionState = useFeaturedMediaTransitionState();
  const {
    finishFeaturedMediaTransitionToRole,
    shouldAttemptReverseFeaturedMediaTransition,
    startFeaturedMediaTransitionFromRole,
  } = useFeaturedMediaTransition();

  let pendingReverseTransitionKey: string | null = null;

  router.beforeEach((to, from) => {
    if (transitionState.value.active) {
      return;
    }

    const transitionKey = featuredMediaTransitionKeyFromNavigation(
      from.path,
      to.path,
    );

    if (!transitionKey) {
      return;
    }

    if (!shouldAttemptReverseFeaturedMediaTransition(to.fullPath, transitionKey)) {
      return;
    }

    const didStart = startFeaturedMediaTransitionFromRole(
      transitionKey,
      'target',
    );

    if (didStart) {
      pendingReverseTransitionKey = transitionKey;
    }
  });

  nuxtApp.hooks.hook('page:finish', () => {
    if (!pendingReverseTransitionKey) {
      return;
    }

    const transitionKey = pendingReverseTransitionKey;
    pendingReverseTransitionKey = null;

    requestAnimationFrame(() => {
      void finishFeaturedMediaTransitionToRole(transitionKey, 'source', {
        scrollToTarget: true,
      });
    });
  });
});
