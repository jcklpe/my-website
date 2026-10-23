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

  const rootClass = computed(() => {
    const root = extractRootElement(props.block.renderedHtml, 'div');
    return removeWordPressFrontendClasses(
      extractAttribute(root?.attributes, 'class'),
    );
  });
</script>

<template>
  <section
    class="group-block"
    :class="rootClass"
    :data-toc-obstacle="
      rootClass.split(' ').includes('is-style-editorial-panel') ? '' : undefined
    "
  >
    <BlockChildren :blocks="allBlocks" :parent-client-id="block.clientId" />
  </section>
</template>

<style scoped lang="scss">
  .group-block {
    margin-bottom: var(--space-7);

    @include group-block;

    :deep(> * + *) {
      margin-top: var(--space-4);
    }
  }
</style>

<style lang="scss">
  // The panel owns its nested core blocks as one composition, across Vue component boundaries.
  .group-block.is-style-editorial-panel {
    @include editorial-panel;
  }
</style>
