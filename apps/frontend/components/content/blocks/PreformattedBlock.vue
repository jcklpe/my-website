<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { extractTagText } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const preformattedText = computed(() =>
    extractTagText(props.block.renderedHtml, 'pre'),
  );
</script>

<template>
  <pre class="preformatted-block">{{ preformattedText }}</pre>
</template>
