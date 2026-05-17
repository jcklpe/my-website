<script setup lang="ts">
  import type { SiteLink } from '~/types/wordpress';

  defineProps<{
    tagline: string;
    quickLinks: SiteLink[];
  }>();
</script>

<template>
  <section class="home-vital-info">
    <div class="panel-header" aria-hidden="true">
      <span class="panel-label">// SYSTEM.INFO</span>
      <span class="panel-marker">+</span>
    </div>
    <div class="inner">
      <div class="intro">
        <p class="eyebrow">{{ '> ' }}Vital info</p>
        <p class="tagline">{{ tagline }}</p>
        <NuxtLink class="about-link" to="/about">→ More about me</NuxtLink>
      </div>

      <ul class="links">
        <li v-for="link in quickLinks" :key="`${link.label}-${link.url}`">
          <a :href="link.url" target="_blank" rel="noreferrer">{{ link.label }}</a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .home-vital-info {
    border: var(--border-default);
    border-top: var(--border-blue-strong);
    margin-top: var(--space-6);
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-2) var(--space-4);
    background: var(--color-primary);
    color: var(--color-surface);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .panel-marker {
    font-weight: 400;
    opacity: 0.7;
  }

  .inner {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(14rem, 1fr);
    gap: var(--space-6);
    padding: var(--space-6) var(--space-5);
  }

  .eyebrow {
    margin: 0 0 var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-primary);
    font-weight: 600;
  }

  .tagline {
    margin: 0;
    max-width: 34rem;
    font-size: clamp(1.05rem, 1.6vw, 1.3rem);
    line-height: 1.6;
  }

  .about-link {
    display: inline-flex;
    margin-top: var(--space-4);
    font-family: var(--font-mono);
    font-size: var(--type-base);
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--color-primary);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 160ms var(--motion-snappy);
  }

  .about-link:hover,
  .about-link:focus-visible {
    border-bottom-color: var(--color-primary);
  }

  .links {
    display: grid;
    align-content: start;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
    border-left: var(--border-blue);
    padding-left: var(--space-4);
  }

  .links a {
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.04em;
    color: var(--color-ink);
    text-decoration: none;
    transition: color 160ms var(--motion-snappy);
  }

  .links a:hover,
  .links a:focus-visible {
    color: var(--color-primary);
  }

  @include breakpoint(phone) {
    .inner {
      grid-template-columns: 1fr;
    }

    .links {
      border-left: none;
      border-top: var(--border-blue);
      padding-left: 0;
      padding-top: var(--space-4);
    }
  }
</style>
