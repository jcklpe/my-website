<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { extractRootElement } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const details = computed(() =>
    extractRootElement(props.block.renderedHtml, 'details'),
  );
</script>

<template>
  <details v-if="details" v-html="details.innerHtml" />
</template>
