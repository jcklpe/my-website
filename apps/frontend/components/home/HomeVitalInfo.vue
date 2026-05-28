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
    grid-template-columns: minmax(0, 0.72fr) minmax(14rem, 0.28fr);
    gap: var(--space-7);
    padding: var(--space-8) var(--space-4);
    border-top: var(--border-default);
    border-bottom: var(--border-default);
    background: var(--color-surface);
    color: var(--color-ink);
  }

  .intro {
    display: grid;
    align-content: start;
  }

  .eyebrow {
    margin: 0 0 var(--space-4);
    font-family: var(--font-display);
    font-size: var(--type-base);
    line-height: 0.9;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .tagline {
    max-width: 44rem;
    margin: 0;
    font-size: clamp(1.35rem, 3vw, 2.4rem);
    line-height: 1.05;
    text-wrap: balance;
  }

  .about-link {
    display: inline-flex;
    width: fit-content;
    margin-top: var(--space-5);
    font-size: var(--type-base);
    font-style: italic;
    text-transform: uppercase;
    @include rich-link;
  }

  .about-link:hover,
  .about-link:focus-visible {
    @include rich-link-hover;
  }

  .links {
    display: grid;
    align-content: start;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .links a {
    display: inline-flex;
    color: var(--color-ink);
    font-size: var(--type-large);
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
