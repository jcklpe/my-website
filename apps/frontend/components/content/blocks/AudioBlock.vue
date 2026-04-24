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

  const audio = computed(() =>
    extractRootElement(props.block.renderedHtml, 'figure'),
  );
  const figureClass = computed(() =>
    removeWordPressFrontendClasses(extractAttribute(audio.value?.attributes, 'class')),
  );
  const audioHtml = computed(() =>
    stripWordPressFrontendClassesFromHtml(audio.value?.innerHtml ?? ''),
  );
</script>

<template>
  <figure v-if="audio" class="audio-block" :class="figureClass" v-html="audioHtml" />
</template>
