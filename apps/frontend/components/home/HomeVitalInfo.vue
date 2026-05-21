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
    padding: var(--space-8) 0;
    border-top: var(--border-subtle);
  }

  .eyebrow {
    margin: 0 0 var(--space-4);
    font-family: var(--font-sans);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .tagline {
    margin-top: 0;
    max-width: 34rem;
    font-family: var(--font-display);
    font-style: italic;
    font-weight: 400;
    font-size: clamp(1.3rem, 2.2vw, 1.7rem);
    line-height: 1.45;
    letter-spacing: 0.005em;
    color: var(--color-ink);
  }

  .about-link {
    display: inline-flex;
    margin-top: var(--space-5);
    font-family: var(--font-sans);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-accent);
    text-decoration: none;
    background-image: linear-gradient(var(--color-accent), var(--color-accent));
    background-position: 0% 100%;
    background-repeat: no-repeat;
    background-size: 0% 1px;
    transition: background-size 200ms var(--motion-snappy);
  }

  .about-link:hover,
  .about-link:focus-visible {
    background-size: 100% 1px;
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
