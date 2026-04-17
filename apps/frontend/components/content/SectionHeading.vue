<script setup lang="ts">
  defineProps<{
    title: string;
    description?: string;
  }>();
</script>

<template>
  <div class="section-heading">
    <p class="section-heading__kicker">Filed under</p>
    <h2>
      <span>{{ title }}</span>
    </h2>
    <p v-if="description">{{ description }}</p>
  </div>
</template>

<style lang="scss" scoped>
  .section-heading {
    margin-bottom: var(--space-6);
    max-width: 42rem;
  }

  .section-heading__kicker {
    margin-bottom: var(--space-3);
    color: var(--color-primary-heavy);
    font-size: var(--type-step-1);
    font-style: italic;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .section-heading h2 {
    max-width: 14ch;
    line-height: 1.08;
  }

  .section-heading h2 span {
    display: inline;
    background: var(--color-poster-black);
    color: white;
    padding-inline: 0.12em;
    box-shadow: var(--shadow-label-long);
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .section-heading p {
    margin-top: var(--space-3);
    color: var(--color-muted);
  }
</style>
