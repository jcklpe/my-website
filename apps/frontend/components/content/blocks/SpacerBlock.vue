<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { extractStyleValue } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const spacerHeight = computed(() => {
    const attributeHeight = props.block.attributes?.height;
    const renderedHeight = extractStyleValue(props.block.renderedHtml, 'height');

    if (typeof attributeHeight === 'number') {
      return `${attributeHeight}px`;
    }

    return typeof attributeHeight === 'string'
      ? attributeHeight
      : (renderedHeight ?? '32px');
  });
</script>

<template>
  <div
    class="spacer-block"
    :style="{ blockSize: spacerHeight }"
    aria-hidden="true"
  />
</template>
