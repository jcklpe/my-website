<script setup lang="ts">
const route = useRoute()

const navItems = [
  { label: 'Writing', to: '/writing' },
  { label: 'Case Studies', to: '/case-studies' },
  { label: 'Side Projects', to: '/side-projects' },
]

withDefaults(defineProps<{
  variant?: 'home' | 'interior'
}>(), {
  variant: 'interior',
})

const showHomeLink = computed(() => route.path !== '/')
</script>

<template>
  <header class="site-nav" :class="`site-nav--${variant}`">
    <NuxtLink v-if="showHomeLink" to="/" class="site-nav__home">Home</NuxtLink>
    <div v-else class="site-nav__home-placeholder" aria-hidden="true" />

    <nav class="site-nav__items" aria-label="Primary">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="site-nav__link"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
.site-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $space-4;
  padding: $space-4 $space-6 $space-5;
  background: linear-gradient(145deg, #1f38c5 0%, #2657eb 58%, #4d72ef 100%);
  color: white;
}

.site-nav--home {
  margin-inline: calc($space-6 * -1);
}

.site-nav--interior {
  position: sticky;
  z-index: 10;
  top: 0;
}

.site-nav__home,
.site-nav__link {
  color: white;
  text-decoration: none;
}

.site-nav__home {
  font-weight: 600;
  letter-spacing: 0.02em;
}

.site-nav__home-placeholder {
  min-height: 1.5rem;
}

.site-nav__items {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: $space-4;
}

.site-nav__link {
  background-image: linear-gradient(black, black);
  background-repeat: no-repeat;
  background-size: 120% 0.2em;
  background-position: -0.25rem 100%;
  border-bottom: 0;
  padding-inline: 0.2em;
  transition: background-size 220ms $motion-snappy;
}

.site-nav__link:hover,
.site-nav__link:focus-visible {
  background-size: 120% 88%;
}

@media (max-width: 720px) {
  .site-nav {
    flex-direction: column;
    align-items: flex-start;
    padding-inline: $space-4;
  }

  .site-nav--home {
    margin-inline: calc($space-4 * -1);
  }
}
</style>
