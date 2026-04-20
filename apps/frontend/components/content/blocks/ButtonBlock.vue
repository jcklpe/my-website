<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractClassNames,
    extractFirstAnchor,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const buttonLink = computed(() => extractFirstAnchor(props.block.renderedHtml));
  const isOutline = computed(() =>
    extractClassNames(props.block.renderedHtml).includes('is-style-outline'),
  );
</script>

<template>
  <a
    v-if="buttonLink?.href"
    class="button"
    :class="{ outline: isOutline }"
    :href="buttonLink.href"
    :target="buttonLink.target || undefined"
    :rel="buttonLink.rel || undefined"
    :download="buttonLink.download || undefined"
    v-html="buttonLink.innerHtml"
  />
</template>
