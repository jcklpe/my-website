<script setup lang="ts">
  import {
    extractAttribute,
    extractRootElement,
    removeWordPressFrontendClasses,
  } from '~/utils/block-html';
  import ImageBlock from './ImageBlock.vue';
  import type { GutenbergBlock } from '~/types/wordpress';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks: GutenbergBlock[];
  }>();

  const wrapper = computed(() => extractRootElement(props.block.renderedHtml));
  const galleryClass = computed(() =>
    removeWordPressFrontendClasses(
      extractAttribute(wrapper.value?.attributes, 'class'),
    ),
  );
  const galleryImages = computed(() =>
    props.allBlocks.filter(
      (childBlock) => childBlock.parentClientId === props.block.clientId,
    ),
  );
</script>

<template>
  <div class="gallery-block" :class="galleryClass">
    <ImageBlock
      v-for="imageBlock in galleryImages"
      :key="imageBlock.clientId"
      :block="imageBlock"
    />
  </div>
</template>
