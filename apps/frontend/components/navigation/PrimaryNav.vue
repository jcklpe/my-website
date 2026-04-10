<script setup lang="ts">
const navItems = [
  { label: 'Writing', to: '/writing' },
  { label: 'Case Studies', to: '/case-studies' },
  { label: 'Side Projects', to: '/side-projects' },
]

withDefaults(defineProps<{
  centered?: boolean
}>(), {
  centered: false,
})
</script>

<template>
  <nav class="primary-nav" :class="{ 'primary-nav--centered': centered }" aria-label="Primary">
    <NuxtLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="primary-nav__link"
    >
      {{ item.label }}
    </NuxtLink>
  </nav>
</template>

<style lang="scss" scoped>
.primary-nav {
  display: flex;
  flex-wrap: wrap;
  gap: $space-4;
  justify-content: flex-end;
}

.primary-nav--centered {
  justify-content: flex-end;
}

.primary-nav__link {
  background-image: linear-gradient(black, black);
  background-repeat: no-repeat;
  background-size: 120% 0.2em;
  background-position: -0.25rem 100%;
  border-bottom: 0;
  color: white;
  padding-inline: 0.2em;
  text-decoration: none;
  transition:
    background-size 220ms $motion-snappy,
    opacity 220ms $motion-snappy;
}

.primary-nav__link:hover,
.primary-nav__link:focus-visible {
  background-size: 120% 88%;
  color: white;
  opacity: 1;
}
</style>
