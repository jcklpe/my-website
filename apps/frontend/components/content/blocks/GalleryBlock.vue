<script setup lang="ts">
  import ImageBlock from './ImageBlock.vue';
  import type { GutenbergBlock } from '~/types/wordpress';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks: GutenbergBlock[];
  }>();

  const galleryImages = computed(() =>
    props.allBlocks.filter(
      (childBlock) => childBlock.parentClientId === props.block.clientId,
    ),
  );
</script>

<template>
  <div class="gallery-block">
    <ImageBlock
      v-for="imageBlock in galleryImages"
      :key="imageBlock.clientId"
      :block="imageBlock"
    />
  </div>
</template>
