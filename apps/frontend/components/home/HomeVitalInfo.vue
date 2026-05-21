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
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(14rem, 1fr);
    gap: var(--space-6);
    padding: var(--space-7) 0;
    border-top: var(--border-default);
  }

  .home-vital-info::before {
    content: '';
    position: absolute;
    top: calc(var(--space-7) - 0.45rem);
    left: 0;
    width: 0.9rem;
    aspect-ratio: 1;
    background: var(--color-sun);
    border-radius: 999px;
  }

  .eyebrow {
    font-size: var(--type-base);
    font-family: var(--font-mono);
    font-weight: 600;
    letter-spacing: 0;
    text-transform: uppercase;
    color: var(--color-primary-heavy);
  }

  .tagline {
    margin-top: var(--space-1);
    max-width: 34rem;
    font-family: var(--font-serif);
    font-size: 1.7rem;
    line-height: 1.32;
  }

  .about-link {
    display: inline-flex;
    margin-top: var(--space-4);
    font-size: var(--type-large);
    font-family: var(--font-mono);
    @include rich-link;
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
    font-family: var(--font-mono);
    font-size: var(--type-base);
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

    .tagline {
      font-size: 1.35rem;
    }
  }
</style>
