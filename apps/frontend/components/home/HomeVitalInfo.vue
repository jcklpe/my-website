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
      <p class="tagline">
        {{ tagline }}
        <NuxtLink class="about-link" to="/about"
          >More about me <span aria-hidden="true">→</span></NuxtLink
        >
      </p>
    </div>

    <ul v-if="quickLinks.length" class="links">
      <li v-for="link in quickLinks" :key="`${link.label}-${link.url}`">
        <a :href="link.url" target="_blank" rel="noreferrer">
          <span class="label">{{ link.label }}</span>
          <span class="affordance" aria-hidden="true">Open</span>
        </a>
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
  // Panel structure pulled from blue1.2 — bordered card with low printed
  // shadow — minus the BTAK title bar. Vertical periwinkle separator between
  // the bio column and the link column comes from blue1.6.
  .home-vital-info {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(14rem, 1fr);
    gap: var(--space-6);
    margin-top: var(--space-7);
    padding: var(--space-6) var(--space-6);
    border: var(--border-window);
    border-top: 2px solid var(--color-primary);
    background: var(--color-surface-warm);
    box-shadow: var(--shadow-hard-low);
  }

  .eyebrow {
    margin: 0 0 var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  .tagline {
    margin: 0;
    max-width: 38rem;
    font-family: var(--font-sans);
    font-size: clamp(1.1rem, 1.6vw, 1.32rem);
    line-height: 1.55;
  }

  // The About link sits inline at the end of the tagline prose with a clear
  // arrow affordance — so it can never be confused with the section title.
  .about-link {
    display: inline;
    margin-left: 0.35em;
    color: var(--color-primary);
    font-family: var(--font-sans);
    font-size: inherit;
    font-weight: 500;
    text-decoration: none;
    border-bottom: 1px solid currentColor;
    transition: color 160ms var(--motion-snappy);
  }

  .about-link:hover,
  .about-link:focus-visible {
    color: var(--color-primary-heavy);
  }

  // Right column: a stack of quick links composed as "Label . . . Open"
  // (blue1.2's signature pattern). Vertical separator on the left edge.
  .links {
    display: grid;
    align-content: start;
    gap: 0;
    margin: 0;
    padding: 0 0 0 var(--space-5);
    list-style: none;
    border-left: 1px solid var(--color-primary);
  }

  .links li + li a {
    border-top: 1px solid var(--color-ink-08);
  }

  .links a {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-3);
    padding-block: var(--space-3);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    transition: color 160ms var(--motion-snappy);
  }

  .links .affordance {
    color: var(--color-primary);
    font-weight: 400;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .links a:hover,
  .links a:focus-visible {
    color: var(--color-primary);
  }

  @include breakpoint(phone) {
    .home-vital-info {
      grid-template-columns: 1fr;
      padding: var(--space-5) var(--space-4);
    }

    .links {
      padding: var(--space-4) 0 0;
      border-left: none;
      border-top: 1px solid var(--color-primary);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .about-link,
    .links a {
      transition: none;
    }
  }
</style>
