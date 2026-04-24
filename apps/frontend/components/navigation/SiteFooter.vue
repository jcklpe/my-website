<script setup lang="ts">
  import type { FooterSettings } from '~/types/wordpress';

  defineProps<{
    footer: FooterSettings;
  }>();
</script>

<template>
  <footer class="site-footer">
    <div class="inner">
      <div class="intro">
        <h2 class="heading">{{ footer.heading }}</h2>
      </div>

      <nav class="links" aria-label="Footer">
        <a
          v-for="link in footer.links"
          :key="`${link.label}-${link.url}`"
          :href="link.url"
          class="link"
        >
          {{ link.label }}
        </a>
      </nav>
    </div>

    <div class="base">
      <p v-if="footer.note" class="note">{{ footer.note }}</p>
      <a
        href="https://github.com/jcklpe/my-website"
        class="source-link"
        target="_blank"
        rel="noopener noreferrer"
        >View source on GitHub</a
      >
    </div>
  </footer>
</template>

<style lang="scss" scoped>
  .site-footer {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 75vh;
    padding: 8rem var(--space-6) var(--space-7);
    background: var(--color-primary);
    color: white;
  }

  .inner {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(12rem, 1fr);
    gap: var(--space-7);
    max-width: 88rem;
    margin-inline: auto;
    width: 100%;
  }

  .heading {
    margin: 0;
    color: white;
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    font-family: var(--font-serif);
    line-height: 1.02;
    letter-spacing: -0.04em;
  }

  .links {
    display: grid;
    align-content: start;
    gap: var(--space-3);
    padding-top: 0.5rem;
  }

  .link {
    color: white;
    text-decoration: none;
    font-size: var(--type-step-1);
    opacity: 0.82;
    transition: opacity 160ms ease;
  }

  .link:hover {
    opacity: 1;
    text-decoration: underline;
  }

  .base {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 88rem;
    margin-inline: auto;
    width: 100%;
    padding-top: var(--space-5);
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.55);
    font-size: var(--type-step--1);
  }

  .note {
    margin: 0;
  }

  .source-link {
    color: rgba(255, 255, 255, 0.55);
    text-decoration: none;
    transition: color 160ms ease;
  }

  .source-link:hover {
    color: white;
  }

  @media (max-width: 720px) {
    .site-footer {
      padding: 5rem var(--space-5) var(--space-6);
    }

    .inner {
      grid-template-columns: 1fr;
      gap: var(--space-6);
    }

    .base {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-3);
    }
  }
</style>
