<script setup lang="ts">
  import type { SiteLink } from '~/types/wordpress';

  defineProps<{
    tagline: string;
    quickLinks: SiteLink[];
  }>();
</script>

<template>
  <section class="home-vital-info themed dark">
    <div class="intro">
      <p class="eyebrow">A letter to the reader</p>
      <p class="tagline">{{ tagline }}</p>
      <NuxtLink class="about-link" to="/about">Read more about me</NuxtLink>
    </div>

    <ul class="links">
      <li class="links-label" aria-hidden="true">Elsewhere</li>
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
    grid-template-columns: minmax(0, 2fr) minmax(13rem, 0.7fr);
    gap: var(--space-8) var(--space-7);
    margin-inline: calc(var(--space-6) * -1);
    padding: var(--space-10) var(--space-6);
    background: var(--color-surface);
    color: var(--color-ink);
  }

  .eyebrow {
    margin: 0 0 var(--space-5);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .tagline {
    margin: 0;
    max-width: 22ch;
    font-family: var(--font-serif);
    font-size: clamp(1.6rem, 1.1rem + 2.4vw, 3.25rem);
    font-style: italic;
    font-weight: 400;
    line-height: 1.16;
    letter-spacing: -0.018em;
    text-wrap: balance;
  }

  .about-link {
    display: inline-flex;
    margin-top: var(--space-6);
    font-family: var(--font-serif);
    font-size: var(--type-large);
    font-style: italic;
    @include rich-link;
  }

  .about-link:hover,
  .about-link:focus-visible {
    @include rich-link-hover;
  }

  .links {
    display: grid;
    align-content: start;
    gap: var(--space-3);
    margin: 0;
    padding-top: 0.6rem;
    list-style: none;
  }

  .links-label {
    margin-bottom: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .links a {
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
      margin-inline: calc(var(--space-4) * -1);
      padding-inline: var(--space-4);
    }
  }
</style>
