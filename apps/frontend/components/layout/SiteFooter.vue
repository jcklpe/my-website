<script setup lang="ts">
import type { FooterSettings } from '~/types/wordpress'

defineProps<{
  footer: FooterSettings
}>()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__content">
      <div class="site-footer__intro">
        <h2>{{ footer.heading }}</h2>
        <p>{{ footer.body }}</p>
      </div>

      <nav class="site-footer__nav" aria-label="Footer">
        <a
          v-for="link in footer.links"
          :key="`${link.label}-${link.url}`"
          :href="link.url"
        >
          {{ link.label }}
        </a>
      </nav>
    </div>

    <p class="site-footer__note">{{ footer.note }}</p>
  </footer>
</template>

<style lang="scss" scoped>
.site-footer {
  margin-top: $space-8;
  padding: $space-7 0 $space-6;
  border-top: 1px solid rgba(12, 17, 43, 0.16);
}

.site-footer__content {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(12rem, 1fr);
  gap: $space-6;
}

.site-footer__intro {
  max-width: 38rem;
}

.site-footer__intro p {
  margin-top: $space-3;
  color: $color-ink-80;
}

.site-footer__nav {
  display: grid;
  align-content: start;
  gap: $space-2;
}

.site-footer__nav a {
  color: $color-ink;
  text-decoration: none;
}

.site-footer__note {
  margin-top: $space-7;
  color: $color-muted;
  font-size: $type-step-1;
}

@media (max-width: 720px) {
  .site-footer__content {
    grid-template-columns: 1fr;
  }
}
</style>
