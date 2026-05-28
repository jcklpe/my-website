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
  // During a featured-media transition, hide the incoming page until the overlay
  // is positioned and ready to animate (phase moves from 'starting' to 'moving').
  // This prevents the home page content from flashing in behind the overlay.
  const isFeatureMediaIncoming = computed(
    () =>
      transitionState.value.active && transitionState.value.phase !== 'moving',
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
    width: min(100%, 96rem);
    min-height: 100vh;
    margin-inline: auto;
    background: var(--color-surface);
    color: var(--color-ink);
    box-shadow: 0 0 120px rgba(0, 0, 0, 0.55);
  }

  .site-main {
    padding: 0 0 var(--space-7);
  }

  @media (min-width: 64rem) {
    .site-shell {
      margin-block: var(--space-4) 0;
      overflow: hidden;
      border: 1px solid var(--color-stage-rule);
      border-bottom: 0;
      border-radius: 1.25rem 1.25rem 0 0;
    }
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
