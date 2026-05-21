<script setup lang="ts">
  import type { SiteLink } from '~/types/wordpress';

  defineProps<{
    tagline: string;
    quickLinks: SiteLink[];
  }>();
</script>

<template>
  <section class="home-vital-info">
    <hr class="section-rule" aria-hidden="true" />

    <div class="inner">
      <div class="intro">
        <p class="eyebrow">Vital info</p>
        <p class="tagline">{{ tagline }}</p>
        <NuxtLink class="about-link" to="/about"
          >More about me <span aria-hidden="true">→</span></NuxtLink
        >
      </div>

      <ul v-if="quickLinks.length" class="links">
        <li v-for="link in quickLinks" :key="`${link.label}-${link.url}`">
          <a :href="link.url" target="_blank" rel="noreferrer">
            <span class="label">{{ link.label }}</span>
            <span class="affordance" aria-hidden="true">open ↗</span>
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .home-vital-info {
    padding: var(--space-7) 0;
  }

  .section-rule {
    @include folk-rule;

    margin: 0 0 var(--space-7);
  }

  .inner {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(14rem, 1fr);
    gap: var(--space-7);
    align-items: start;
  }

  .eyebrow {
    margin: 0 0 var(--space-3);
    @include kicker;
  }

  // Tagline carries warm display-serif weight — a stated thing, not a label.
  .tagline {
    margin: 0;
    max-width: 36rem;
    font-family: var(--font-display);
    font-optical-sizing: auto;
    font-weight: 440;
    font-size: clamp(1.3rem, 2.2vw, 1.85rem);
    line-height: 1.28;
    color: var(--color-ink);

    @include display-character($opsz: 60, $soft: 50, $wonk: 0);
  }

  // About link sits inline below the tagline with an arrow affordance + warm
  // sliding underline; it can't be mistaken for the eyebrow label.
  .about-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    margin-top: var(--space-5);
    font-family: var(--font-sans);
    font-size: var(--type-large);
    font-weight: 500;
    color: var(--color-primary);
    @include rich-link;
  }

  .about-link:hover,
  .about-link:focus-visible {
    @include rich-link-hover;
  }

  // Quick links: a "Label … open ↗" row, terracotta affordance on the right.
  // Staggered down from the bio so the two columns don't sit on a tidy top
  // line — the asymmetric offset.
  .links {
    display: grid;
    align-content: start;
    gap: 0;
    margin: var(--space-8) 0 0;
    padding: 0 0 0 var(--space-5);
    list-style: none;
    border-left: var(--border-rule-accent);
  }

  .links li + li a {
    border-top: var(--border-subtle);
  }

  .links a {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-3);
    padding-block: var(--space-3);
    color: var(--color-ink);
    font-family: var(--font-display);
    font-optical-sizing: auto;
    font-variant: small-caps;
    font-size: var(--type-large);
    font-weight: 540;
    letter-spacing: 0.04em;
    text-decoration: none;
    transition: color 160ms var(--motion-snappy);
  }

  .links .affordance {
    @include micro-label;

    color: var(--color-primary);
  }

  .links a:hover,
  .links a:focus-visible {
    color: var(--color-primary);
  }

  @include breakpoint(phone) {
    .inner {
      grid-template-columns: 1fr;
    }

    .links {
      margin-top: var(--space-5);
      padding: var(--space-4) 0 0;
      border-left: none;
      border-top: var(--border-rule-accent);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .about-link,
    .links a {
      transition: none;
    }
  }
</style>
