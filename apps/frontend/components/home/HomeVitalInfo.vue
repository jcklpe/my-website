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
    margin-inline: calc(var(--space-6) * -1);
    padding: var(--space-7) var(--space-6);
    border-bottom: var(--border-strong);
    background:
      linear-gradient(90deg, var(--color-primary) 0 1.2rem, transparent 1.2rem),
      var(--color-pop-cream);
  }

  .eyebrow {
    display: inline-block;
    padding: 0.35rem 0.55rem;
    border: var(--border-default);
    background: var(--color-pop-lime);
    font-size: var(--type-base);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
    color: var(--color-ink);
  }

  .tagline {
    margin-top: var(--space-1);
    max-width: 34rem;
    font-size: 1.35rem;
    font-weight: 600;
    line-height: 1.35;
  }

  .about-link {
    display: inline-flex;
    margin-top: var(--space-4);
    font-size: var(--type-large);
    font-style: normal;
    font-weight: 700;
    border: var(--border-default);
    padding: 0.65rem 0.85rem;
    background: var(--color-pop-yellow);
    color: var(--color-ink);
    text-decoration: none;
    box-shadow: 0.3rem 0.3rem 0 var(--color-pop-coral);
    transition:
      transform 180ms var(--motion-snappy),
      box-shadow 180ms var(--motion-snappy);
  }

  .about-link:hover,
  .about-link:focus-visible {
    box-shadow: 0.45rem 0.45rem 0 var(--color-primary);
    transform: translate(-0.1rem, -0.1rem);
  }

  .links {
    display: grid;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .links a {
    display: inline-block;
    border-bottom: 0.18rem solid var(--color-ink);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: var(--type-base);
    font-weight: 600;
    letter-spacing: 0;
    text-decoration: none;
  }

  .links a:hover,
  .links a:focus-visible {
    background: var(--color-pop-aqua);
  }

  @include breakpoint(phone) {
    .home-vital-info {
      grid-template-columns: 1fr;
      margin-inline: calc(var(--space-4) * -1);
      padding-inline: var(--space-4);
    }

    .tagline {
      font-size: 1.15rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .about-link {
      transition: none;
    }

    .about-link:hover,
    .about-link:focus-visible {
      transform: none;
    }
  }
</style>
