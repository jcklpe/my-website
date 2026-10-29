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
  const isPanel = computed(() => {
    const panelStyles = [
      'is-style-editorial-panel',
      'is-style-project-overview',
      'is-style-research-panel',
      'is-style-entity-map',
    ];
    return rootClass.value
      .split(' ')
      .some((name) => panelStyles.includes(name));
  });
</script>

<template>
  <section
    class="group-block"
    :class="rootClass"
    :data-toc-obstacle="isPanel ? '' : undefined"
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
  .group-block.is-style-project-overview {
    @include project-overview;
  }
  .group-block.is-style-research-panel {
    @include research-panel;
  }
  .group-block.is-style-entity-map {
    @include entity-map;
  }

  .group-block.is-style-editorial-panel {
    @include editorial-panel;
  }
</style>
