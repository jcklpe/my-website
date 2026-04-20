<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractClassNames,
    extractFirstImage,
    extractStyleValue,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks: GutenbergBlock[];
  }>();

  const coverImage = computed(() => extractFirstImage(props.block.renderedHtml));
  const minHeight = computed(
    () => extractStyleValue(props.block.renderedHtml, 'min-height') ?? '22rem',
  );
  const objectPosition = computed(
    () => extractStyleValue(props.block.renderedHtml, 'object-position') ?? '50% 50%',
  );
  const dimOpacity = computed(() => {
    const dimClass = extractClassNames(props.block.renderedHtml).find((className) =>
      /^has-background-dim-\d+$/.test(className),
    );
    const dimValue = dimClass?.match(/\d+$/)?.[0];

    return dimValue ? Number(dimValue) / 100 : 0.28;
  });
</script>

<template>
  <section
    class="cover-block"
    :style="{ minHeight, '--cover-dim-opacity': dimOpacity }"
  >
    <img
      v-if="coverImage?.src"
      class="media"
      :src="coverImage.src"
      :alt="coverImage.alt"
      :style="{ objectPosition }"
      loading="lazy"
      decoding="async"
    >
    <div class="shade" aria-hidden="true" />
    <div class="copy">
      <BlockChildren :blocks="allBlocks" :parent-client-id="block.clientId" />
    </div>
  </section>
</template>
