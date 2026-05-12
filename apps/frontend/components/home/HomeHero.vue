<script setup lang="ts">
  defineProps<{
    megaText: string;
    title: string;
    subtitle: string;
  }>();
</script>

<template>
  <section class="home-hero">
    <div class="display">
      <p class="mega-text">{{ megaText }}</p>
      <h1 class="title">{{ title }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .home-hero {
    box-sizing: border-box;
    padding: var(--space-8) 0 var(--space-7);
    display: grid;
    align-content: end;
    gap: var(--space-5);
    color: var(--color-ink);
  }

  .display {
    position: relative;
  }

  .mega-text {
    margin: 0;
    font-family: var(--font-mono);
    font-style: italic;
    font-size: var(--type-small);
    font-weight: 400;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .title {
    position: relative;
    z-index: 1;
    margin: var(--space-3) 0 0;
    font-size: clamp(2rem, 4vw, 3.5rem);
    font-family: var(--font-mono);
    font-style: italic;
    font-weight: 500;
    line-height: 0.97;
    letter-spacing: -0.04em;
    color: var(--color-ink);
    text-transform: none;
  }

  .subtitle {
    margin: var(--space-3) 0 0;
    font-size: clamp(0.875rem, 1.2vw, 1.05rem);
    font-style: italic;
    font-weight: 400;
    line-height: 1.6;
    color: var(--color-muted);
  }

  @include breakpoint(phone) {
    .home-hero {
      padding: var(--space-7) 0 var(--space-6);
    }
  }
</style>
