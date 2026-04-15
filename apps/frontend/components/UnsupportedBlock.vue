<script setup lang="ts">
import type { GutenbergBlock } from '~/types/wordpress'

defineProps<{
  block: GutenbergBlock
  allBlocks?: GutenbergBlock[]
}>()
</script>

<template>
  <section v-if="block.renderedHtml" class="unsupported-block">
    <div
      class="unsupported-block__html"
      :data-block-name="block.name"
      v-html="block.renderedHtml"
    />
  </section>
</template>

<style lang="scss" scoped>
.unsupported-block {
  display: contents;
}
</style>
