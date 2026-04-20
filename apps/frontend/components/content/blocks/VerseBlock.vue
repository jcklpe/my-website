<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { extractRootElement } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const verse = computed(() =>
    extractRootElement(props.block.renderedHtml, 'pre'),
  );
</script>

<template>
  <pre v-if="verse" class="verse">{{ verse.innerHtml }}</pre>
</template>
