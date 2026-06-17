<script setup lang="ts">
  const route = useRoute();
  const fallbackPageTransition = useFallbackPageTransitionState();

  const isHomePage = computed(() => route.path === '/');
  const fallbackTransitionClass = computed(() =>
    fallbackPageTransition.value === 'idle'
      ? ''
      : `is-fallback-${fallbackPageTransition.value}`,
  );

  const transitionState = useFeaturedMediaTransitionState();
  // Hide ONLY the freshly-navigated destination page, and only while it's not
  // yet positioned (scrolled to the card + surroundings placed). The composable
  // owns that window via `hideDestination` — a visibility flag kept separate
  // from the clone's geometry phase, so the outgoing source page (mid exit
  // animation) is never hidden, and the destination is hidden in BOTH
  // directions until it's ready to reveal in place.
  const isFeatureMediaIncoming = computed(
    () => transitionState.value.active && transitionState.value.hideDestination,
  );

  const { data: footerSettings } = await useAsyncData('footer-settings', () =>
    queryFooterSettings(),
  );
</script>

<template>
  <div class="site-shell">
    <SiteNav v-if="!isHomePage" variant="interior" />

    <main
      class="site-main"
      :class="[
        fallbackTransitionClass,
        {
          'has-fixed-nav': !isHomePage,
          'is-featured-media-incoming': isFeatureMediaIncoming,
        },
      ]"
    >
      <slot />
    </main>

    <SiteFooter v-if="footerSettings" class="footer" :footer="footerSettings" />

    <FeaturedMediaTransitionLayer />
  </div>
</template>

<style lang="scss" scoped>
  .site-shell {
    min-height: 100vh;
    color: var(--color-ink);
  }

  .site-main {
    padding: 0 0 var(--space-7);
  }

  .site-main.is-fallback-leaving,
  .site-main.is-fallback-entering,
  .site-main.is-fallback-entering-active {
    transition:
      opacity var(--motion-route-transition-duration) var(--motion-snappy),
      transform var(--motion-route-transition-duration) var(--motion-snappy);
    will-change: opacity, transform;
  }

  .site-main.is-fallback-leaving,
  .site-main.is-fallback-entering {
    pointer-events: none;
  }

  .site-main.is-fallback-entering {
    opacity: 0;
    transform: translateY(0.85rem);
    transition-duration: 0ms;
  }

  .site-main.is-fallback-leaving {
    opacity: 0;
    transform: translateY(-0.65rem);
  }

  .site-main.is-featured-media-incoming {
    opacity: 0;
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .site-main.is-fallback-leaving,
    .site-main.is-fallback-entering,
    .site-main.is-fallback-entering-active {
      transition: opacity 120ms ease;
    }

    .site-main.is-fallback-leaving,
    .site-main.is-fallback-entering {
      opacity: 0;
      transform: none;
    }
  }
</style>
