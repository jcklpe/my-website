<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractRootElement,
    stripWordPressFrontendClassesFromHtml,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const video = computed(() =>
    extractRootElement(props.block.renderedHtml, 'figure'),
  );
  const videoHtml = computed(() =>
    stripWordPressFrontendClassesFromHtml(video.value?.innerHtml ?? ''),
  );
</script>

<template>
  <figure v-if="video" class="video-block" v-html="videoHtml" />
</template>
