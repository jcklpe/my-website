<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractFigcaptionHtml,
    extractFirstElementHtml,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const tableHtml = computed(() =>
    extractFirstElementHtml(props.block.renderedHtml, 'table'),
  );
  const captionHtml = computed(() =>
    extractFigcaptionHtml(props.block.renderedHtml),
  );
</script>

<template>
  <figure v-if="tableHtml" class="table-block">
    <div class="table-scroll" v-html="tableHtml" />
    <figcaption v-if="captionHtml" v-html="captionHtml" />
  </figure>
</template>
