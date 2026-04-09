<script setup lang="ts">
import type { GutenbergBlock } from '~/types/wordpress';

defineProps<{
  block: GutenbergBlock;
  allBlocks?: GutenbergBlock[];
}>();
</script>

<template>
  <figure class="wp-block-image" v-html="block.renderedHtml" />
</template>
