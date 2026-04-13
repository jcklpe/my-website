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
  margin-top: var(--space-8);
  padding: var(--space-7) 0 var(--space-6);
  border-top: 1px solid rgba(12, 17, 43, 0.16);
}

.site-footer__content {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(12rem, 1fr);
  gap: var(--space-6);
}

.site-footer__intro {
  max-width: 38rem;
}

.site-footer__intro p {
  margin-top: var(--space-3);
  color: var(--color-ink-80);
}

.site-footer__nav {
  display: grid;
  align-content: start;
  gap: var(--space-2);
}

.site-footer__nav a {
  color: var(--color-ink);
  text-decoration: none;
}

.site-footer__note {
  margin-top: var(--space-7);
  color: var(--color-muted);
  font-size: var(--type-step-1);
}

@media (max-width: 720px) {
  .site-footer__content {
    grid-template-columns: 1fr;
  }
}
</style>
