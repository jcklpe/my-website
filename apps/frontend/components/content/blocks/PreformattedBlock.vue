<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';

  defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();
</script>

<template>
  <div class="wp-block-preformatted" v-html="block.renderedHtml" />
</template>
