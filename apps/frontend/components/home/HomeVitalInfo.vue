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
    margin-top: var(--space-6);
    padding: var(--space-5);
    border: var(--border-window);
    background: var(--color-surface-soft);
    box-shadow: var(--shadow-hard-low);
  }

  .home-vital-info::before {
    content: '';
    position: absolute;
    inset: var(--space-5) auto var(--space-5) var(--space-5);
    width: 0.35rem;
    background: repeating-linear-gradient(
      180deg,
      var(--color-signal) 0 0.75rem,
      transparent 0.75rem 1.15rem
    );
  }

  .intro {
    padding-left: var(--space-5);
  }

  .eyebrow {
    margin: 0 0 var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--type-base);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  .tagline {
    margin: 0;
    max-width: 34rem;
    font-size: clamp(1.125rem, 1.8vw, 1.4rem);
    line-height: 1.5;
  }

  .about-link {
    display: inline-flex;
    gap: var(--space-2);
    margin-top: var(--space-4);
    font-size: var(--type-large);
    font-style: italic;
    @include rich-link;
  }

  .about-link::before {
    content: '→';
    color: var(--color-primary);
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
    padding: 0 0 0 var(--space-4);
    border-left: var(--border-panel);
    list-style: none;
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
    text-decoration: none;
    text-transform: uppercase;
    transition: color 180ms var(--motion-snappy);
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
      padding-inline: var(--space-4);
    }

    .home-vital-info::before {
      inset: var(--space-4) var(--space-4) auto;
      width: auto;
      height: 0.35rem;
      background: repeating-linear-gradient(
        90deg,
        var(--color-signal) 0 0.75rem,
        transparent 0.75rem 1.15rem
      );
    }

    .intro {
      padding-top: var(--space-5);
      padding-left: 0;
    }

    .links {
      padding: var(--space-4) 0 0;
      border-left: 0;
      border-top: var(--border-panel);
    }
  }
</style>
