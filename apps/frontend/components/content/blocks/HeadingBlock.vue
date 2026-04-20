<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { extractRootElement } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const heading = computed(() => extractRootElement(props.block.renderedHtml));
  const safeLevel = computed(() => {
    const tagName = heading.value?.tagName ?? 'h2';

    return /^h[1-6]$/.test(tagName) ? tagName : 'h2';
  });
</script>

<template>
  <h1 v-if="heading && safeLevel === 'h1'" v-html="heading.innerHtml" />
  <h2 v-else-if="heading && safeLevel === 'h2'" v-html="heading.innerHtml" />
  <h3 v-else-if="heading && safeLevel === 'h3'" v-html="heading.innerHtml" />
  <h4 v-else-if="heading && safeLevel === 'h4'" v-html="heading.innerHtml" />
  <h5 v-else-if="heading && safeLevel === 'h5'" v-html="heading.innerHtml" />
  <h6 v-else-if="heading" v-html="heading.innerHtml" />
</template>
