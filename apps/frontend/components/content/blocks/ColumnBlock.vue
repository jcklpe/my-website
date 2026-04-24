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

  const root = computed(() => extractRootElement(props.block.renderedHtml, 'div'));
  const rootClass = computed(() =>
    removeWordPressFrontendClasses(extractAttribute(root.value?.attributes, 'class')),
  );
</script>

<template>
  <div class="column-block" :class="rootClass">
    <BlockChildren :blocks="allBlocks" :parent-client-id="block.clientId" />
  </div>
</template>

<style lang="scss" scoped>
  .column-block.is-vertically-aligned-top {
    align-self: start;
  }

  .column-block.is-vertically-aligned-center {
    align-self: center;
  }

  .column-block.is-vertically-aligned-bottom {
    align-self: end;
  }
</style>
