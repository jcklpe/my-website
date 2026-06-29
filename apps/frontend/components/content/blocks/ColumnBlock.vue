<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractAttribute,
    extractRootElement,
    removeWordPressFrontendClasses,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks: GutenbergBlock[];
  }>();

  const root = computed(() =>
    extractRootElement(props.block.renderedHtml, 'div'),
  );
  const rootClass = computed(() =>
    removeWordPressFrontendClasses(
      extractAttribute(root.value?.attributes, 'class'),
    ),
  );
</script>

<template>
  <div class="column-block" :class="rootClass">
    <BlockChildren :blocks="allBlocks" :parent-client-id="block.clientId" />
  </div>
</template>

<style lang="scss" scoped>
  .column-block {
    @include column-block;
  }

  @include breakpoint(phone) {
    // heading-article-frame adds padding-inline: var(--space-4) on phone so that
    // headings in grid-column:wide (full viewport) align with the content column.
    // Inside a stacked columns block the heading is already within the content
    // column, so that extra inset is wrong — zero it out here.
    .column-block :deep(h2),
    .column-block :deep(h3),
    .column-block :deep(h4),
    .column-block :deep(h5),
    .column-block :deep(h6) {
      padding-inline: 0;
    }
  }
</style>
