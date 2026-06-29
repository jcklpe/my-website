<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    addMediaPreloadDefaultsToHtml,
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
      extractFirstElementHtml(audio.value?.innerHtml ?? '', 'audio'),
    ),
  );
  const captionHtml = computed(() =>
    extractFigcaptionHtml(audio.value?.innerHtml),
  );
</script>

<template>
  <figure
    v-if="audio"
    class="audio-block"
    :class="figureClass"
  >
    <div class="audio-frame" v-html="audioHtml" />
    <figcaption v-if="captionHtml" v-html="captionHtml" />
  </figure>
</template>

<style scoped lang="scss">
  .audio-block {
    @include audio-block-shell;
  }
</style>
