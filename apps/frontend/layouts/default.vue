<script setup lang="ts">
const route = useRoute()

const showHomeLink = computed(() => route.path !== '/')
</script>

<template>
  <div class="site-shell">
    <header class="site-header">
      <NuxtLink v-if="showHomeLink" to="/" class="site-mark">Home</NuxtLink>
      <div v-else class="site-mark-placeholder" aria-hidden="true"></div>
      <nav class="site-nav" aria-label="Primary">
        <NuxtLink to="/writing">Writing</NuxtLink>
      </nav>
    </header>

    <main class="site-main">
      <slot />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.site-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(24, 102, 255, 0.08), transparent 28rem),
    linear-gradient(180deg, #f8f7f3 0%, #f3f0e8 100%);
  color: $color-ink;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $space-4;
  padding: $space-5 $space-6;
}

.site-mark,
.site-nav a {
  color: inherit;
  text-decoration: none;
}

.site-mark {
  font-weight: 600;
  letter-spacing: 0.02em;
}

.site-mark-placeholder {
  min-height: 1.5rem;
}

.site-nav {
  display: flex;
  gap: $space-4;
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
