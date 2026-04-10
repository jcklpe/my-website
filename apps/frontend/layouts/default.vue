<script setup lang="ts">
const route = useRoute()

const showHomeLink = computed(() => route.path !== '/')
const isHomePage = computed(() => route.path === '/')
</script>

<template>
  <div class="site-shell">
    <header v-if="!isHomePage" class="site-header">
      <NuxtLink v-if="showHomeLink" to="/" class="site-mark">Home</NuxtLink>
      <div v-else class="site-mark-placeholder" aria-hidden="true"></div>
      <PrimaryNav />
    </header>

    <main class="site-main">
      <slot />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.site-shell {
  min-height: 100vh;
  color: $color-ink;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $space-4;
  padding: $space-5 $space-6 $space-6;
}

.site-mark {
  text-decoration: none;
}

.site-mark {
  color: $color-ink;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.site-mark-placeholder {
  min-height: 1.5rem;
}

.site-main {
  padding: 0 $space-6 $space-7;
}

@media (max-width: 720px) {
  .site-header {
    flex-direction: column;
    align-items: flex-start;
    padding-inline: $space-4;
  }

  .site-main {
    padding-inline: $space-4;
  }
}
</style>
