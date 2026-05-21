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
    border: var(--border-default);
    border-radius: 0;
    background: var(--color-pop-cream);
    box-shadow: 0.35rem 0.35rem 0 var(--color-pop-aqua);
  }
</style>
