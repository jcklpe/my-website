<script setup lang="ts">
  const route = useRoute();
  const fallbackPageTransition = useFallbackPageTransitionState();

  const isHomePage = computed(() => route.path === '/');
  // Pages can opt out of the interior site nav via definePageMeta({ hideSiteNav: true }).
  const showSiteNav = computed(
    () => !isHomePage.value && route.meta.hideSiteNav !== true,
  );
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
  <div class="site-shell has-custom-cursors">
    <SiteNav v-if="showSiteNav" variant="interior" />

    <main
      class="site-main"
      :class="[
        fallbackTransitionClass,
        {
          'has-fixed-nav': showSiteNav,
          'is-home-page': isHomePage,
          'is-featured-media-incoming': isFeatureMediaIncoming,
        },
      ]"
    >
      <slot />
    </main>

    <SiteFooter v-if="footerSettings" class="footer" :footer="footerSettings" />

    <ConstructionBanner v-if="isHomePage" />
    <FeaturedMediaTransitionLayer />
  </div>
</template>

<style lang="scss" scoped>
  .site-shell {
    min-height: 100vh;
    color: var(--color-ink);
  }
  @media (pointer: fine) {
    .has-custom-cursors {
      cursor:
        url('/images/cursors/arrow.png') 6 2,
        auto;
      :deep(p),
      :deep(input),
      :deep(textarea) {
        cursor:
          url('/images/cursors/text.png') 16 16,
          text;
      }
      :deep(a),
      :deep(.card-image-area),
      :deep(button),
      :deep(summary),
      :deep(input[type='checkbox']) {
        cursor:
          url('/images/cursors/pointer.png') 12 2,
          pointer;
      }
      // Lightbox semantics take precedence over the generic link/button hand.
      :deep(.image-lightbox-trigger),
      :deep(.has-lightbox),
      :deep(.has-lightbox img),
      :deep(.mega-gallery-trigger),
      :deep(.in-note-content img),
      :deep(.sidenote-text img) {
        cursor:
          url('/images/cursors/zoom.png') 12 10,
          zoom-in;
      }
    }
  }

  .site-main {
    padding: 0 0 var(--space-7);
  }

  .site-main.is-home-page {
    // Scope the home page's fixed reaction-diffusion canvas (z-index: -1) to
    // this subtree. This isolation MUST stay home-only: applying it to interior
    // routes traps their z-index 2/3 destination grounds below the teleported
    // media clone at z-index 1, defeating the explicit A/B overlap handoff and
    // exposing the hero image when the text clone leaves.
    isolation: isolate;
  }

  .site-main.is-fallback-leaving,
  .site-main.is-fallback-entering,
  .site-main.is-fallback-entering-active {
    transition:
      opacity var(--featured-media-flight-duration) var(--snappy-ease-out),
      transform var(--featured-media-flight-duration) var(--snappy-ease-out);
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
    /* Snap to hidden instantly so Nuxt's scroll-to-top can't briefly reveal
       the old page (e.g. the BLUF hero) mid-transition. The arrival fade-in
       is what the user watches; the departure doesn't need to animate. */
    transition-duration: 0ms;
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
