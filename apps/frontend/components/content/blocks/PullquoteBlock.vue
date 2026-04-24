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
    removeWordPressFrontendClasses(extractAttribute(pullquote.value?.attributes, 'class')),
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
    @include pullquote-shell;
  }

  .pullquote-block.alignwide {
    @include pullquote-wide-frame;
  }

  .pullquote-block.alignfull {
    @include pullquote-full-frame;
  }

  .pullquote-block.has-text-align-center,
  .pullquote-block.aligncenter {
    @include pullquote-align-center;
  }

  .pullquote-block.has-text-align-right {
    @include pullquote-align-right;
  }

  .pullquote-block.has-text-align-left {
    @include pullquote-align-left;
  }

  .pullquote-block:deep(blockquote) {
    margin: 0;
  }

  .pullquote-block:deep(p) {
    @include pullquote-copy;
  }

  .pullquote-block.alignwide :deep(p),
  .pullquote-block.alignfull :deep(p) {
    @include pullquote-wide-copy;
  }

  .pullquote-block:deep(cite) {
    @include quote-cite;
  }
</style>
