<script setup lang="ts">
  const route = useRoute();
  const fallbackPageTransition = useFallbackPageTransitionState();

  const isHomePage = computed(() => route.path === '/');
  const fallbackTransitionClass = computed(() =>
    fallbackPageTransition.value === 'idle'
      ? ''
      : `is-fallback-${fallbackPageTransition.value}`,
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
</style>
