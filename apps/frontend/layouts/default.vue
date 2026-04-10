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

    <main class="site-main">
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
  color: $color-ink;
}

.site-main {
  padding: 0 $space-6 $space-7;
}

.site-shell__footer {
  margin-inline: $space-6;
}

@media (max-width: 720px) {
  .site-main {
    padding-inline: $space-4;
  }

  .site-shell__footer {
    margin-inline: $space-4;
  }
}
</style>
