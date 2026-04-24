<script setup lang="ts">
  import ButtonBlock from './ButtonBlock.vue';
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractAttribute,
    extractRootElement,
    removeWordPressFrontendClasses,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks: GutenbergBlock[];
  }>();

  const root = computed(() => extractRootElement(props.block.renderedHtml, 'div'));
  const groupClass = computed(() =>
    removeWordPressFrontendClasses(extractAttribute(root.value?.attributes, 'class')),
  );

  const childButtons = computed(() =>
    props.allBlocks.filter(
      (childBlock) => childBlock.parentClientId === props.block.clientId,
    ),
  );
</script>

<template>
  <div class="button-group" :class="groupClass">
    <ButtonBlock
      v-for="childButton in childButtons"
      :key="childButton.clientId"
      :block="childButton"
    />
  </div>
</template>
