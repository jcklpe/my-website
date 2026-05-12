<script setup lang="ts">
  defineProps<{
    title: string;
    description?: string;
  }>();
</script>

<template>
  <div class="section-heading">
    <p class="kicker">Filed under</p>
    <h2 class="title">{{ title }}</h2>
    <p v-if="description" class="description">{{ description }}</p>
  </div>
</template>

<style lang="scss" scoped>
  .section-heading {
    margin-bottom: var(--space-6);
    max-width: 42rem;
  }

  .kicker {
    margin-bottom: var(--space-3);
    color: var(--color-muted);
    font-size: var(--type-base);
    font-style: italic;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .title {
    max-width: 14ch;
    font-size: clamp(1.6rem, 3vw, 2.25rem);
    line-height: 1.1;
  }

  .description {
    margin-top: var(--space-3);
    color: var(--color-muted);
  }
</style>
