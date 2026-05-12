<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractAttribute,
    extractRootElement,
    removeWordPressFrontendClasses,
  } from '~/utils/block-html';
  import ColumnBlock from './ColumnBlock.vue';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks: GutenbergBlock[];
  }>();

  const root = computed(() =>
    extractRootElement(props.block.renderedHtml, 'div'),
  );
  const sectionClass = computed(() =>
    removeWordPressFrontendClasses(
      extractAttribute(root.value?.attributes, 'class'),
    ),
  );
  const columns = computed(() =>
    props.allBlocks.filter(
      (candidateBlock) =>
        candidateBlock.name === 'core/column' &&
        candidateBlock.parentClientId === props.block.clientId,
    ),
  );
</script>

<template>
  <section class="columns-block" :class="sectionClass">
    <ColumnBlock
      v-for="column in columns"
      :key="column.clientId"
      :block="column"
      :all-blocks="allBlocks"
    />
  </section>
</template>

<style lang="scss" scoped>
  .columns-block {
    @include columns-block;
  }
</style>
