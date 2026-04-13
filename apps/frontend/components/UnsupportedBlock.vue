<script setup lang="ts">
import type { GutenbergBlock } from '~/types/wordpress'

defineProps<{
  block: GutenbergBlock
  allBlocks?: GutenbergBlock[]
}>()
</script>

<template>
  <section class="unsupported-block">
    <p>Unsupported block: <code>{{ block.name }}</code></p>
    <div
      v-if="block.renderedHtml"
      class="unsupported-block__html"
      v-html="block.renderedHtml"
    />
  </section>
</template>

<style lang="scss" scoped>
.unsupported-block {
  padding: var(--space-4);
  border: 1px dashed rgba(15, 23, 42, 0.2);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.75);
}
</style>
