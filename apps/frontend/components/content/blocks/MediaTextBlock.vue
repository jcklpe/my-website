<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractClassNames,
    extractFirstElementHtml,
    extractRootElement,
    stripWordPressFrontendClassesFromHtml,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks: GutenbergBlock[];
  }>();

  const classNames = computed(() => extractClassNames(props.block.renderedHtml));
  const mediaFigure = computed(() =>
    extractRootElement(
      extractFirstElementHtml(props.block.renderedHtml, 'figure'),
      'figure',
    ),
  );
  const mediaHtml = computed(() =>
    stripWordPressFrontendClassesFromHtml(mediaFigure.value?.innerHtml ?? ''),
  );
  const mediaOnRight = computed(() =>
    classNames.value.includes('has-media-on-the-right'),
  );
</script>

<template>
  <section
    class="media-text-block"
    :class="{ 'media-on-right': mediaOnRight }"
  >
    <figure v-if="mediaHtml" class="media" v-html="mediaHtml" />
    <div class="copy">
      <BlockChildren :blocks="allBlocks" :parent-client-id="block.clientId" />
    </div>
  </section>
</template>
