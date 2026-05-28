<script setup lang="ts">
  import type { SiteLink } from '~/types/wordpress';

  defineProps<{
    tagline: string;
    quickLinks: SiteLink[];
  }>();
</script>

<template>
  <section class="home-vital-info">
    <header class="section-header">
      <p class="section-eyebrow">Profile</p>
      <h2 class="section-title">About the Author</h2>
    </header>

    <div class="info-body">
      <div class="intro">
        <p class="tagline">{{ tagline }}</p>
        <NuxtLink class="about-link" to="/about">Full profile →</NuxtLink>
      </div>

      <ul class="links">
        <li v-for="link in quickLinks" :key="`${link.label}-${link.url}`">
          <a :href="link.url" target="_blank" rel="noreferrer">{{
            link.label
          }}</a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .home-vital-info {
    margin-inline: calc(var(--space-6) * -1);
  }

  .section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: var(--space-6) var(--space-6) var(--space-5);
    border-top: var(--border-default);
    border-bottom: var(--border-default);
  }

  .section-eyebrow {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .section-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 5vw, 5rem);
    line-height: 0.92;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--color-ink);
  }

  .info-body {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(14rem, 1fr);
    gap: var(--space-6);
    padding: var(--space-6) var(--space-6) var(--space-8);
  }

  .tagline {
    margin-top: 0;
    max-width: 34rem;
    font-family: var(--font-mono);
    font-size: var(--type-base);
    font-style: italic;
    line-height: 1.65;
    color: var(--color-ink-80);
  }

  .about-link {
    display: inline-flex;
    margin-top: var(--space-4);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.12em;
    text-decoration: none;
    text-transform: uppercase;
    transition: color 160ms ease;
  }

  .about-link:hover,
  .about-link:focus-visible {
    color: var(--color-primary);
  }

  .links {
    display: grid;
    gap: var(--space-2);
    align-content: start;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .links a {
    color: var(--color-ink-80);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.08em;
    text-decoration: none;
    text-transform: uppercase;
    transition: color 160ms ease;
  }

  .links a:hover,
  .links a:focus-visible {
    color: var(--color-ink);
  }

  @include breakpoint(phone) {
    .home-vital-info {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-header {
      flex-direction: column;
      gap: var(--space-2);
      padding-inline: var(--space-4);
    }

    .section-title {
      font-size: clamp(2.5rem, 14vw, 4rem);
    }

    .info-body {
      grid-template-columns: 1fr;
      padding-inline: var(--space-4);
    }
  }
</style>
