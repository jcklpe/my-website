<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { addContentMediaDefaultsToHtml } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const html = computed(() =>
    addContentMediaDefaultsToHtml(props.block.renderedHtml ?? ''),
  );
</script>

<template>
  <div class="fallback-html" v-html="html" />
</template>
