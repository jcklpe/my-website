<script setup lang="ts">
import type { GutenbergBlock } from '~/types/wordpress'

defineProps<{
  block: GutenbergBlock
  allBlocks?: GutenbergBlock[]
}>()
</script>

<template>
  <blockquote class="wp-block-quote" v-html="block.renderedHtml" />
</template>
