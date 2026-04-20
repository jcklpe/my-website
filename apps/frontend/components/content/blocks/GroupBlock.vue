<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';

  defineProps<{
    block: GutenbergBlock;
    allBlocks: GutenbergBlock[];
  }>();
</script>

<template>
  <section class="group-block">
    <BlockChildren :blocks="allBlocks" :parent-client-id="block.clientId" />
  </section>
</template>
