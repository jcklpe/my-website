<script setup lang="ts">
import type { HomePageQuickLink } from '~/types/wordpress'

defineProps<{
  tagline: string
  quickLinks: HomePageQuickLink[]
}>()
</script>

<template>
  <section class="home-vital-info">
    <div class="home-vital-info__intro">
      <p class="home-vital-info__eyebrow">Vital info</p>
      <p class="home-vital-info__tagline">{{ tagline }}</p>
    </div>

    <ul class="home-vital-info__links">
      <li v-for="link in quickLinks" :key="`${link.label}-${link.url}`">
        <a :href="link.url" target="_blank" rel="noreferrer">{{ link.label }}</a>
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
.home-vital-info {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(14rem, 1fr);
  gap: $space-6;
  padding: $space-7 0;
  border-top: 1px solid rgba(12, 17, 43, 0.12);
}

.home-vital-info__eyebrow {
  font-size: $type-step-1;
  font-style: italic;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $color-muted;
}

.home-vital-info__tagline {
  margin-top: $space-1;
  max-width: 34rem;
  font-size: clamp(1.125rem, 1.8vw, 1.4rem);
  line-height: 1.5;
}

.home-vital-info__links {
  display: grid;
  gap: $space-2;
  margin: 0;
  padding: 0;
  list-style: none;
}

.home-vital-info__links a {
  color: $color-ink;
  text-decoration: none;
}

@media (max-width: 820px) {
  .home-vital-info {
    grid-template-columns: 1fr;
  }
}
</style>
