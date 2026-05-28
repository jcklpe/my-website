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
    padding: var(--space-7) 0;
    border-top: var(--border-subtle);
  }

  .eyebrow {
    font-family: var(--font-condensed);
    font-size: var(--type-base);
    font-style: normal;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .tagline {
    margin-top: var(--space-1);
    max-width: 34rem;
    font-size: clamp(1.125rem, 1.8vw, 1.4rem);
    line-height: 1.5;
  }

  .about-link {
    display: inline-block;
    margin-top: var(--space-4);
    font-family: var(--font-condensed);
    font-size: var(--type-large);
    font-style: normal;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-ink-80);
    text-decoration: none;
    border-bottom: 1px solid var(--color-ink-30);
    transition:
      color 180ms ease,
      border-color 180ms ease;
  }

  .about-link:hover,
  .about-link:focus-visible {
    color: var(--color-ink);
    border-bottom-color: var(--color-ink);
  }

  .links {
    display: grid;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .links a {
    @include rich-link;
  }

  .links a:hover,
  .links a:focus-visible {
    @include rich-link-hover;
  }

  @include breakpoint(phone) {
    .home-vital-info {
      grid-template-columns: 1fr;
    }
  }
</style>
