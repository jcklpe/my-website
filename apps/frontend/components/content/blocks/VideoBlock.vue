<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractAttribute,
    extractRootElement,
    removeWordPressFrontendClasses,
    stripWordPressFrontendClassesFromHtml,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const video = computed(() =>
    extractRootElement(props.block.renderedHtml, 'figure'),
  );
  const figureClass = computed(() =>
    removeWordPressFrontendClasses(extractAttribute(video.value?.attributes, 'class')),
  );
  const videoHtml = computed(() =>
    stripWordPressFrontendClassesFromHtml(video.value?.innerHtml ?? ''),
  );
</script>

<template>
  <figure v-if="video" class="video-block" :class="figureClass" v-html="videoHtml" />
</template>
