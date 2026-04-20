<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractAttribute,
    extractRootElement,
    removeWordPressFrontendClasses,
    stripWordPressFrontendClassesFromHtml,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const wrapper = computed(() => extractRootElement(props.block.renderedHtml));
  const figure = computed(() => {
    if (wrapper.value?.tagName === 'figure') {
      return wrapper.value;
    }

    return extractRootElement(wrapper.value?.innerHtml, 'figure');
  });
  const figureClass = computed(() =>
    removeWordPressFrontendClasses(
      extractAttribute(figure.value?.attributes, 'class'),
    ),
  );
  const figureInnerHtml = computed(() =>
    stripWordPressFrontendClassesFromHtml(figure.value?.innerHtml ?? ''),
  );
</script>

<template>
  <figure
    v-if="figure"
    :class="figureClass"
    v-html="figureInnerHtml"
  />
</template>
