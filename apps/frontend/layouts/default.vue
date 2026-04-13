<script setup lang="ts">
const route = useRoute()

const isHomePage = computed(() => route.path === '/')

const { data: footerSettings } = await useAsyncData('footer-settings', () =>
  queryFooterSettings(),
)
</script>

<template>
  <div class="site-shell">
    <SiteNav v-if="!isHomePage" variant="interior" />

    <main class="site-main" :class="{ 'site-main--with-fixed-nav': !isHomePage }">
      <slot />
    </main>

    <SiteFooter
      v-if="footerSettings"
      class="site-shell__footer"
      :footer="footerSettings"
    />
  </div>
</template>

<style lang="scss" scoped>
.site-shell {
  min-height: 100vh;
  color: var(--color-ink);
}

.site-main {
  padding: 0 var(--space-6) var(--space-7);
}

.site-main--with-fixed-nav {
  padding-top: calc(var(--space-10) + var(--space-4));
}

.site-shell__footer {
  margin-inline: var(--space-6);
}

@media (max-width: 720px) {
  .site-main {
    padding-inline: var(--space-4);
  }

  .site-shell__footer {
    margin-inline: var(--space-4);
  }
}
</style>
