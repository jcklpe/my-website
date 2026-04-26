<script setup lang="ts">
  import type { SiteLink } from '~/types/wordpress';

  defineProps<{
    tagline: string;
    quickLinks: SiteLink[];
  }>();
</script>

<template>
  <section class="home-vital-info">
    <div class="spec-header" aria-hidden="true">
      <span class="spec-num">00</span>
      <span class="spec-slash">/</span>
      <span class="spec-name">SPECIFICATION</span>
    </div>

    <div class="spec-body">
      <p class="tagline">{{ tagline }}</p>
    </div>

    <div class="index-panel">
      <p class="index-label" aria-hidden="true">INDEX</p>
      <ol class="links">
        <li
          v-for="(link, i) in quickLinks"
          :key="`${link.label}-${link.url}`"
          class="link-item"
        >
          <span class="index-num" aria-hidden="true">{{
            String(i + 1).padStart(2, '0')
          }}</span>
          <a :href="link.url" target="_blank" rel="noreferrer">{{
            link.label
          }}</a>
        </li>
      </ol>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .home-vital-info {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0 var(--space-7);
    padding-block: var(--space-7);
    border-top: 1px solid rgba(12, 17, 43, 0.14);
    align-items: start;
  }

  .spec-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding-top: 0.15rem;
    font-family: var(--font-mono);
    color: var(--color-amber);
  }

  .spec-num {
    font-size: clamp(2rem, 3.5vw, 2.8rem);
    font-weight: 700;
    font-style: italic;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .spec-slash {
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    opacity: 0.6;
  }

  .spec-name {
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    opacity: 0.7;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    align-self: flex-start;
  }

  .spec-body {
    padding-top: 0.15rem;
    border-left: 1px solid rgba(12, 17, 43, 0.12);
    padding-left: var(--space-5);
  }

  .tagline {
    margin: 0;
    max-width: 34rem;
    font-size: clamp(1.1rem, 1.9vw, 1.45rem);
    line-height: 1.55;
    color: var(--color-ink);
  }

  .index-panel {
    border-left: 1px solid rgba(12, 17, 43, 0.12);
    padding-left: var(--space-5);
  }

  .index-label {
    margin: 0 0 var(--space-3);
    font-family: var(--font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-amber);
  }

  .links {
    display: grid;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .link-item {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
  }

  .index-num {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    color: var(--color-amber);
    flex-shrink: 0;
  }

  .link-item a {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    color: var(--color-ink);
    text-decoration: none;
    border-bottom: 1px solid rgba(12, 17, 43, 0.2);
    padding-bottom: 0.08em;
    transition: border-color 160ms ease;
  }

  .link-item a:hover {
    border-bottom-color: var(--color-amber);
    color: var(--color-amber);
  }

  @media (max-width: 900px) {
    .home-vital-info {
      grid-template-columns: 1fr;
      gap: var(--space-6);
    }

    .spec-header {
      flex-direction: row;
      align-items: baseline;
      gap: var(--space-2);
    }

    .spec-name {
      writing-mode: horizontal-tb;
      transform: none;
    }

    .spec-body,
    .index-panel {
      border-left: none;
      padding-left: 0;
      border-top: 1px solid rgba(12, 17, 43, 0.12);
      padding-top: var(--space-5);
    }
  }
</style>
