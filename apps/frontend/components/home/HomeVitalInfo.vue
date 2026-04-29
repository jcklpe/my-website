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
      <NuxtLink class="about-link" to="/about">Read More</NuxtLink>
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
    padding: var(--space-7) 0;
    border-top: 1px solid rgba(12, 17, 43, 0.12);
  }

  .eyebrow {
    font-size: var(--type-step-1);
    font-style: italic;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .tagline {
    margin-top: var(--space-1);
    max-width: 34rem;
    font-size: clamp(1.125rem, 1.8vw, 1.4rem);
    line-height: 1.5;
  }

  .about-link {
    display: inline-flex;
    margin-top: var(--space-4);
    color: var(--color-primary);
    font-size: var(--type-step-3);
    font-style: italic;
    text-decoration: none;
    background-image: linear-gradient(
      var(--color-primary),
      var(--color-primary)
    );
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
    color: var(--color-primary);
    text-decoration: none;
    background-image: linear-gradient(
      var(--color-primary),
      var(--color-primary)
    );
    background-position: 0% 100%;
    background-repeat: no-repeat;
    background-size: 0% 1px;
    transition: background-size 200ms var(--motion-snappy);
  }

  .links a:hover,
  .links a:focus-visible {
    background-size: 100% 1px;
  }

  @media (max-width: 820px) {
    .home-vital-info {
      grid-template-columns: 1fr;
    }
  }
</style>
