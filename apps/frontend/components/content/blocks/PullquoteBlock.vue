<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { extractRootElement } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const pullquote = computed(() =>
    extractRootElement(props.block.renderedHtml, 'figure'),
  );
</script>

<template>
  <figure v-if="pullquote" class="pullquote" v-html="pullquote.innerHtml" />
</template>
