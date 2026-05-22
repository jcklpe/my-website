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
    padding: var(--space-5);
    border: 1px solid var(--color-slip-border);
    border-radius: 1.25rem;
    background: var(--color-surface-softer);
    color: var(--color-muted);
  }
</style>
