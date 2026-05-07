<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractAttribute,
    extractRootElement,
    removeWordPressFrontendClasses,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const pullquote = computed(() =>
    extractRootElement(props.block.renderedHtml, 'figure'),
  );
  const pullquoteClass = computed(() =>
    removeWordPressFrontendClasses(
      extractAttribute(pullquote.value?.attributes, 'class'),
    ),
  );
</script>

<template>
  <figure
    v-if="pullquote"
    class="pullquote pullquote-block"
    :class="pullquoteClass"
    v-html="pullquote.innerHtml"
  />
</template>

<style lang="scss" scoped>
  .pullquote-block {
    @include pullquote-block;
  }
</style>
