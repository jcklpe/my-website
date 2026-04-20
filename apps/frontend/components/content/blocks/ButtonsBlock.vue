<script setup lang="ts">
  import ButtonBlock from './ButtonBlock.vue';
  import type { GutenbergBlock } from '~/types/wordpress';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks: GutenbergBlock[];
  }>();

  const childButtons = computed(() =>
    props.allBlocks.filter(
      (childBlock) => childBlock.parentClientId === props.block.clientId,
    ),
  );
</script>

<template>
  <div class="button-group">
    <ButtonBlock
      v-for="childButton in childButtons"
      :key="childButton.clientId"
      :block="childButton"
    />
  </div>
</template>
