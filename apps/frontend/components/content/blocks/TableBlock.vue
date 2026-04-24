<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractAttribute,
    extractFigcaptionHtml,
    extractFirstElementHtml,
    extractRootElement,
    removeWordPressFrontendClasses,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const root = computed(() => extractRootElement(props.block.renderedHtml, 'figure'));
  const figureClass = computed(() =>
    removeWordPressFrontendClasses(extractAttribute(root.value?.attributes, 'class')),
  );
  const tableHtml = computed(() =>
    extractFirstElementHtml(props.block.renderedHtml, 'table'),
  );
  const captionHtml = computed(() =>
    extractFigcaptionHtml(props.block.renderedHtml),
  );
</script>

<template>
  <figure v-if="tableHtml" class="table-block" :class="figureClass">
    <div class="table-scroll" v-html="tableHtml" />
    <figcaption v-if="captionHtml" v-html="captionHtml" />
  </figure>
</template>
