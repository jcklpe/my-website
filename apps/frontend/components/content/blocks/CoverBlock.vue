<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';

  defineProps<{
    block: GutenbergBlock;
    allBlocks: GutenbergBlock[];
  }>();
</script>

<template>
  <section class="wp-block-cover">
    <div
      v-if="block.renderedHtml"
      class="wp-block-cover__media"
      v-html="block.renderedHtml"
    />
    <BlockRenderer :blocks="allBlocks" :parent-client-id="block.clientId" />
  </section>
</template>
