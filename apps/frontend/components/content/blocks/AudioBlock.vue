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

  const audio = computed(() =>
    extractRootElement(props.block.renderedHtml, 'figure'),
  );
  const audioHtml = computed(() =>
    stripWordPressFrontendClassesFromHtml(audio.value?.innerHtml ?? ''),
  );
</script>

<template>
  <figure v-if="audio" class="audio-block" v-html="audioHtml" />
</template>
