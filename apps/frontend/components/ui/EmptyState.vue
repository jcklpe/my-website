<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <p class="empty-state">
    {{ message }}
  </p>
</template>

<style lang="scss" scoped>
.empty-state {
  padding: var(--space-5);
  border-radius: 1.25rem;
  background: var(--color-card-surface-soft);
}
</style>
