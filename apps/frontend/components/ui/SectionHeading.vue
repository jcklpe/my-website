<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="section-heading">
    <h2>{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
  </div>
</template>

<style lang="scss" scoped>
.section-heading {
  margin-bottom: var(--space-6);
  max-width: 42rem;
}

.section-heading p {
  margin-top: var(--space-3);
  color: var(--color-muted);
}
</style>
