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
    margin: 0;
    padding: var(--space-6);
    background: var(--color-black);
    box-shadow: inset 0 12px 39px 1px rgba(0, 4, 26, 0.39);
    color: var(--color-surface);
  }

  .eyebrow {
    width: fit-content;
    padding: 0.1em 0.35em;
    background: var(--color-notice);
    color: var(--color-black);
    font-size: var(--type-base);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .tagline {
    margin-top: var(--space-1);
    max-width: 34rem;
    font-size: 1.25rem;
    line-height: 1.5;
    font-family: var(--font-lite);
  }

  .about-link {
    display: inline-flex;
    margin-top: var(--space-4);
    font-size: var(--type-large);
    font-style: normal;
    @include rich-link;
    color: var(--color-surface);
  }

  .about-link:hover,
  .about-link:focus-visible {
    @include rich-link-hover;
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
    color: var(--color-surface);
  }

  .links a:hover,
  .links a:focus-visible {
    @include rich-link-hover;
  }

  @include breakpoint(phone) {
    .home-vital-info {
      grid-template-columns: 1fr;
      padding: var(--space-5);
    }
  }
</style>
