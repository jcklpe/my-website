<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';

  defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();
</script>

<template>
  <div
    class="wp-block-spacer"
    :style="{ minHeight: `${block.attributes?.height ?? 32}px` }"
    aria-hidden="true"
  />
</template>
