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
    min-height: calc(100vh - 4rem);
    display: grid;
    align-content: end;
    gap: var(--space-7);
    padding: var(--space-6) var(--space-5) var(--space-5);
    color: white;
  }

  .display {
    position: relative;
    min-height: 15rem;
  }

  .mega-text {
    margin: 0;
    font-size: clamp(4.25rem, 12vw, 8.75rem);
    font-weight: 700;
    line-height: 0.9;
    letter-spacing: -0.05em;
    text-transform: uppercase;
  }

  .title {
    position: relative;
    z-index: 1;
    margin: -0.2em 0 0;
    font-size: clamp(2.25rem, 6vw, 4.75rem);
    font-family: var(--font-sans);
    font-weight: 700;
    line-height: 0.95;
    text-transform: uppercase;
    color: white;
  }

  .subtitle {
    margin: -0.05em 0 0 0.2em;
    font-size: clamp(1.35rem, 2.8vw, 2.35rem);
    font-style: italic;
    color: rgba(255, 255, 255, 0.86);
  }

  @media (max-width: 720px) {
    .home-hero {
      min-height: calc(100vh - 8rem);
      padding: var(--space-6) var(--space-4) var(--space-4);
    }
  }
</style>
