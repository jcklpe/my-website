<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { extractRootElement } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const quote = computed(() =>
    extractRootElement(props.block.renderedHtml, 'blockquote'),
  );
</script>

<template>
  <blockquote v-if="quote" v-html="quote.innerHtml" />
</template>
