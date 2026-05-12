<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractAttribute,
    extractRootElement,
    removeWordPressFrontendClasses,
    stripWordPressBlockClassesFromHtml,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const list = computed(() => extractRootElement(props.block.renderedHtml));
  const safeTag = computed(() => (list.value?.tagName === 'ol' ? 'ol' : 'ul'));
  const listClass = computed(() =>
    removeWordPressFrontendClasses(
      extractAttribute(list.value?.attributes, 'class'),
    ),
  );
  const listItemsHtml = computed(() =>
    stripWordPressBlockClassesFromHtml(list.value?.innerHtml ?? ''),
  );
</script>

<template>
  <ol
    v-if="list && safeTag === 'ol'"
    :class="listClass"
    v-html="listItemsHtml"
  />
  <ul
    v-else-if="list"
    :class="listClass"
    v-html="listItemsHtml"
  />
</template>

<style lang="scss" scoped>
  ul,
  ol {
    @include list-block;
    @include list-deep-content;
  }
</style>
