<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractAttribute,
    extractRootElement,
    removeWordPressFrontendClasses,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const paragraph = computed(() =>
    extractRootElement(props.block.renderedHtml, 'p'),
  );
  const paragraphClass = computed(() =>
    removeWordPressFrontendClasses(
      extractAttribute(paragraph.value?.attributes, 'class'),
    ),
  );
</script>

<template>
  <p
    v-if="paragraph"
    :class="paragraphClass"
    v-html="paragraph.innerHtml"
  />
</template>

<style lang="scss" scoped>
  p.has-text-align-center {
    text-align: center;
  }

  p.has-text-align-right {
    text-align: right;
  }

  p.has-text-align-left {
    text-align: left;
  }
</style>
