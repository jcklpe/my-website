<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';

  defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();
</script>

<template>
  <div class="wp-block-gallery" v-html="block.renderedHtml" />
</template>
