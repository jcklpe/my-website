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
    padding: var(--space-7) var(--space-6);
    margin-inline: calc(var(--space-6) * -1);
    border-top: 1px solid var(--color-stage-rule);
    border-bottom: 1px solid var(--color-stage-rule);
    background: var(--color-stage);
    color: var(--color-stage-ink);
  }

  .eyebrow {
    font-size: var(--type-base);
    font-family: var(--font-mono);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  .tagline {
    margin-top: var(--space-1);
    max-width: 34rem;
    font-size: 1.28rem;
    line-height: 1.5;
  }

  .about-link {
    display: inline-flex;
    margin-top: var(--space-4);
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
      margin-inline: calc(var(--space-4) * -1);
      padding-inline: var(--space-4);
    }
  }
</style>
