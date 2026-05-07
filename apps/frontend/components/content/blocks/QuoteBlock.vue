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

  const quote = computed(() =>
    extractRootElement(props.block.renderedHtml, 'blockquote'),
  );
  const quoteClass = computed(() =>
    removeWordPressFrontendClasses(
      extractAttribute(quote.value?.attributes, 'class'),
    ),
  );
</script>

<template>
  <blockquote
    v-if="quote"
    class="quote-block"
    :class="quoteClass"
    v-html="quote.innerHtml"
  />
</template>

<style lang="scss" scoped>
  .quote-block {
    @include quote-block;
  }
</style>
