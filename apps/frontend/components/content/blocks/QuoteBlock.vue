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
    removeWordPressFrontendClasses(extractAttribute(quote.value?.attributes, 'class')),
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
    @include quote-shell;
  }

  .quote-block.alignwide {
    @include quote-wide-frame;
  }

  .quote-block.alignfull {
    @include quote-full-frame;
  }

  .quote-block.has-text-align-center,
  .quote-block.aligncenter {
    @include quote-align-center;
  }

  .quote-block.has-text-align-right {
    @include quote-align-right;
  }

  .quote-block.has-text-align-left {
    @include quote-align-left;
  }

  .quote-block.alignwide,
  .quote-block.alignfull {
    :deep(p),
    :deep(cite) {
      @include quote-wide-copy;
    }
  }

  .quote-block:deep(p) {
    @include quote-copy;
  }

  .quote-block:deep(cite) {
    @include quote-cite;
  }
</style>
