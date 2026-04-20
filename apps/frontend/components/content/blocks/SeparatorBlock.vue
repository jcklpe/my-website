<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { extractAttribute, extractRootElement } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const separator = computed(() =>
    extractRootElement(props.block.renderedHtml, 'hr'),
  );
  const separatorClass = computed(() =>
    extractAttribute(separator.value?.attributes, 'class')
      .split(/\s+/)
      .filter((className) => className.startsWith('is-style-')),
  );
</script>

<template>
  <hr :class="separatorClass">
</template>
