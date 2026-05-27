<script setup lang="ts">
  defineProps<{
    message: string;
  }>();
</script>

<template>
  <p class="empty-state">
    {{ message }}
  </p>
</template>

<style lang="scss" scoped>
  .empty-state {
    max-width: var(--article-column);
    margin: var(--space-5) auto;
    padding: var(--space-5);
    background: var(--color-black);
    box-shadow: var(--shadow-label);
    color: var(--color-surface);
    font-style: normal;
  }
</style>
