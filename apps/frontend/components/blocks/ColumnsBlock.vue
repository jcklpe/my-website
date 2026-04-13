<script setup lang="ts">
import type { GutenbergBlock } from '~/types/wordpress'

defineProps<{
  block: GutenbergBlock
  allBlocks: GutenbergBlock[]
}>()
</script>

<template>
  <section class="wp-block-columns">
    <BlockRenderer :blocks="allBlocks" :parent-client-id="block.clientId" />
  </section>
</template>

<style lang="scss" scoped>
.wp-block-columns {
  display: grid;
  gap: var(--space-4);
}
</style>
