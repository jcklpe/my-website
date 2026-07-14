<script setup lang="ts">
  import type { SiteLink } from '~/types/wordpress';

  defineProps<{
    tagline: string;
    quickLinks: SiteLink[];
  }>();
</script>

<template>
  <section class="home-vital-info">
    <div class="intro">
      <p class="eyebrow">Vital info</p>
      <p class="tagline">{{ tagline }}</p>
      <NuxtLink class="about-link" to="/about">More about me</NuxtLink>
    </div>

    <ul class="links">
      <li v-for="link in quickLinks" :key="`${link.label}-${link.url}`">
        <a :href="link.url" target="_blank" rel="noreferrer">{{
          link.label
        }}</a>
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
  .home-vital-info {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(14rem, 1fr);
    gap: var(--space-6);
    margin-top: var(--space-9);
    padding: var(--space-5);
    border: var(--border-window);
    background: var(--color-surface-soft);
    box-shadow: var(--shadow-hard-low);
  }

  .eyebrow {
    margin: 0;
    font-size: var(--type-small);
    font-family: var(--font-mono);
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  .tagline {
    margin: var(--space-2) 0 0;
    max-width: 34rem;
    font-size: clamp(1.125rem, 1.8vw, 1.4rem);
    line-height: 1.5;
  }

  .about-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    margin-top: var(--space-4);
    font-size: var(--type-large);
    font-style: italic;
    @include rich-link;
  }

  .about-link::after {
    content: '→';
    font-style: normal;
    display: inline-block;
    transition: transform 180ms var(--snappy-ease-out);
  }

  .about-link:hover,
  .about-link:focus-visible {
    @include rich-link-hover;
  }

  .about-link:hover::after,
  .about-link:focus-visible::after {
    transform: translateX(4px);
  }

  @media (prefers-reduced-motion: reduce) {
    .about-link::after {
      transition: none;
    }
  }

  .links {
    display: grid;
    gap: 0;
    margin: 0;
    padding: 0 0 0 var(--space-4);
    list-style: none;
    border-left: var(--border-signal);
  }

  .links li {
    border-top: var(--border-panel);
  }

  .links li:first-child {
    border-top: none;
  }

  .links a {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    padding-block: var(--space-2);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
  }

  .links a::after {
    content: 'open';
    color: var(--color-primary);
    font-weight: 400;
  }

  .links a:hover,
  .links a:focus-visible {
    color: var(--color-primary);
  }

  @include breakpoint(phone) {
    .home-vital-info {
      grid-template-columns: 1fr;
      margin-top: var(--space-6);
      padding: var(--space-4);
    }

    .links {
      padding: var(--space-4) 0 0;
      border-left: none;
      border-top: var(--border-signal);
    }

    .links li:first-child {
      border-top: var(--border-panel);
    }
  }
</style>
