<script setup lang="ts">
  import type { FooterSettings } from '~/types/wordpress';

  defineProps<{
    footer: FooterSettings;
  }>();
</script>

<template>
  <footer class="site-footer">
    <div class="eof-marker" aria-hidden="true">
      <span class="eof-rule"></span>
      <span class="eof-label">— END OF INDEX —</span>
      <span class="eof-rule"></span>
    </div>

    <div class="inner">
      <div class="intro">
        <h2 class="heading">{{ footer.heading }}</h2>
      </div>

      <nav class="links" aria-label="Footer">
        <a
          v-for="(link, i) in footer.links"
          :key="`${link.label}-${link.url}`"
          :href="link.url"
          class="link"
        >
          <span class="link-num" aria-hidden="true">{{
            String(i + 1).padStart(2, '0')
          }}</span>
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
        >View source</a
      >
    </div>
  </footer>
</template>

<style lang="scss" scoped>
  .site-footer {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: var(--space-8);
    min-height: 60vh;
    padding: var(--space-8) var(--space-6) var(--space-7);
    background: var(--color-ink);
    color: white;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: repeating-linear-gradient(
        to bottom,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.1) 2px,
        rgba(0, 0, 0, 0.1) 3px
      );
    }
  }

  .eof-marker {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-family: var(--font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(200, 124, 32, 0.55);
  }

  .eof-rule {
    flex: 1;
    height: 1px;
    background: rgba(200, 124, 32, 0.2);
  }

  .inner {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(12rem, 1fr);
    gap: var(--space-7);
    max-width: 88rem;
    margin-inline: auto;
    width: 100%;
    position: relative;
    z-index: 1;
  }

  .heading {
    margin: 0;
    color: white;
    font-size: clamp(2.2rem, 4.5vw, 4rem);
    font-family: var(--font-mono);
    font-style: italic;
    line-height: 1.02;
    letter-spacing: -0.04em;
  }

  .links {
    display: grid;
    align-content: start;
    gap: var(--space-3);
    padding-top: 0.35rem;
  }

  .link {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    color: rgba(255, 255, 255, 0.65);
    text-decoration: none;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    padding-bottom: 0.4em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    transition: color 160ms ease;
  }

  .link:hover {
    color: white;
  }

  .link-num {
    font-size: 0.62rem;
    color: var(--color-amber);
    flex-shrink: 0;
  }

  .base {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 88rem;
    margin-inline: auto;
    width: 100%;
    padding-top: var(--space-5);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.35);
    font-family: var(--font-mono);
    font-size: 0.65rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    position: relative;
    z-index: 1;
  }

  .note {
    margin: 0;
  }

  .source-link {
    color: rgba(255, 255, 255, 0.35);
    text-decoration: none;
    transition: color 160ms ease;
  }

  .source-link:hover {
    color: rgba(200, 124, 32, 0.9);
  }

  @media (max-width: 720px) {
    .site-footer {
      padding: var(--space-7) var(--space-5) var(--space-6);
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
