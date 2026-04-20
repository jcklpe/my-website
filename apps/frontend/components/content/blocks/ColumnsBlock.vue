<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import ColumnBlock from './ColumnBlock.vue';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks: GutenbergBlock[];
  }>();

  const columns = computed(() =>
    props.allBlocks.filter(
      (candidateBlock) =>
        candidateBlock.name === 'core/column' &&
        candidateBlock.parentClientId === props.block.clientId,
    ),
  );
</script>

<template>
  <section class="columns-block">
    <ColumnBlock
      v-for="column in columns"
      :key="column.clientId"
      :block="column"
      :all-blocks="allBlocks"
    />
  </section>
</template>
