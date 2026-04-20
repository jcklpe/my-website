<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { extractRootElement } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const paragraph = computed(() =>
    extractRootElement(props.block.renderedHtml, 'p'),
  );
</script>

<template>
  <p v-if="paragraph" v-html="paragraph.innerHtml" />
</template>
