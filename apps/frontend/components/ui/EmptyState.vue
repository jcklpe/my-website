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
  padding: $space-5;
  border-radius: 1.25rem;
  background: $color-card-surface-soft;
}
</style>
