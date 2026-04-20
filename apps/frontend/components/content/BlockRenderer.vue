<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';

  defineProps<{
    blocks: GutenbergBlock[];
    parentClientId?: string | null;
  }>();
</script>

<template>
  <div class="content-flow">
    <BlockChildren :blocks="blocks" :parent-client-id="parentClientId" />
  </div>
</template>
