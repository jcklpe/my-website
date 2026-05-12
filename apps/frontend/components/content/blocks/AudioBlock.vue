<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    addMediaPreloadDefaultsToHtml,
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
    removeWordPressFrontendClasses(
      extractAttribute(audio.value?.attributes, 'class'),
    ),
  );
  const audioHtml = computed(() =>
    addMediaPreloadDefaultsToHtml(
      stripWordPressFrontendClassesFromHtml(audio.value?.innerHtml ?? ''),
    ),
  );
</script>

<template>
  <figure
    v-if="audio"
    class="audio-block"
    :class="figureClass"
    v-html="audioHtml"
  />
</template>

<style scoped lang="scss">
  .audio-block {
    @include audio-block-shell;

    :deep(audio) {
      width: 100%;
    }
  }
</style>
