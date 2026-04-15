<script setup lang="ts">
import type { GutenbergBlock } from '~/types/wordpress'

defineProps<{
  block: GutenbergBlock
  allBlocks: GutenbergBlock[]
}>()
</script>

<template>
  <div class="wp-block-buttons">
    <BlockRenderer :blocks="allBlocks" :parent-client-id="block.clientId" />
  </div>
</template>
