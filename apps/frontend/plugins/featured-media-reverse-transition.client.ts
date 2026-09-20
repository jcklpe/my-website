export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();
  const transitionState = useFeaturedMediaTransitionState();
  const {
    waitForCardExtraPreflight,
    finishFeaturedMediaTransitionToRole,
    shouldAttemptReverseFeaturedMediaTransition,
    startFeaturedMediaTransitionFromRole,
  } = useFeaturedMediaTransition();

  let pendingReverseTransitionKey: string | null = null;

  router.beforeEach(async (to, from) => {
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

    if (
      !shouldAttemptReverseFeaturedMediaTransition(to.fullPath, transitionKey)
    ) {
      return;
    }

    if (transitionKey.startsWith('post-') && to.path === '/writing') {
      await waitForCardExtraPreflight(transitionKey, 'target');
    }

    const didStart = startFeaturedMediaTransitionFromRole(
      transitionKey,
      'target',
      undefined,
      to.path !== '/writing',
    );

    if (didStart) {
      if (to.path === '/') {
        transitionState.value = {
          ...transitionState.value,
          hideDestination: true,
        };
      }
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
