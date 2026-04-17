<script setup lang="ts">
  defineProps<{
    title: string;
    description?: string;
  }>();
</script>

<template>
  <div class="section-heading">
    <p class="kicker">Filed under</p>
    <h2 class="title">
      <span>{{ title }}</span>
    </h2>
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
    color: var(--color-primary-heavy);
    font-size: var(--type-step-1);
    font-style: italic;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .title {
    max-width: 14ch;
    line-height: 1.08;
  }

  .title span {
    display: inline;
    background: var(--color-poster-black);
    color: white;
    padding-inline: 0.12em;
    box-shadow: var(--shadow-label-long);
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .description {
    margin-top: var(--space-3);
    color: var(--color-muted);
  }
</style>
