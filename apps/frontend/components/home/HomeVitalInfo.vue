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
    padding: var(--space-6);
    margin-top: var(--space-5);
    border: var(--border-default);
    background: var(--color-surface-soft);
    box-shadow: var(--shadow-soft-low);
  }

  .home-vital-info::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(90deg, transparent 0 calc(100% - 1px), var(--color-primary-tint) calc(100% - 1px)),
      linear-gradient(180deg, transparent 0 calc(100% - 1px), var(--color-primary-tint) calc(100% - 1px));
    background-size: 5rem 5rem;
    opacity: 0.22;
  }

  .eyebrow {
    position: relative;
    font-size: var(--type-base);
    font-family: var(--font-mono);
    font-style: normal;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  .tagline {
    position: relative;
    margin-top: var(--space-1);
    max-width: 34rem;
    font-size: 1.35rem;
    line-height: 1.5;
  }

  .about-link {
    position: relative;
    display: inline-flex;
    margin-top: var(--space-4);
    font-size: var(--type-large);
    font-family: var(--font-mono);
    font-style: normal;
    @include rich-link;
  }

  .about-link:hover,
  .about-link:focus-visible {
    @include rich-link-hover;
  }

  .links {
    position: relative;
    display: grid;
    gap: 0;
    margin: 0;
    padding: 0;
    border: var(--border-default);
    list-style: none;
    background: var(--color-surface);
  }

  .links li + li {
    border-top: var(--border-subtle);
  }

  .links a {
    display: block;
    padding: var(--space-3) var(--space-4);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    @include rich-link;
  }

  .links a:hover,
  .links a:focus-visible {
    @include rich-link-hover;
  }

  @include breakpoint(phone) {
    .home-vital-info {
      grid-template-columns: 1fr;
      padding: var(--space-4);
    }
  }
</style>
