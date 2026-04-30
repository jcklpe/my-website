<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractRootElement,
    stripWordPressBlockClassesFromHtml,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const list = computed(() => extractRootElement(props.block.renderedHtml));
  const safeTag = computed(() => (list.value?.tagName === 'ol' ? 'ol' : 'ul'));
  const listItemsHtml = computed(() =>
    stripWordPressBlockClassesFromHtml(list.value?.innerHtml ?? ''),
  );
</script>

<template>
  <ol
    v-if="list && safeTag === 'ol'"
    class="wp-block-list"
    v-html="listItemsHtml"
  />
  <ul v-else-if="list" class="wp-block-list" v-html="listItemsHtml" />
</template>
