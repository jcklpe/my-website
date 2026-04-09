<script setup lang="ts">
import type { Component } from 'vue'
import type { GutenbergBlock } from '~/types/wordpress'

const props = defineProps<{
  blocks: GutenbergBlock[]
  parentClientId?: string | null
}>()

const registry: Record<string, Component> = {
  'core/paragraph': defineAsyncComponent(
    () => import('~/components/blocks/ParagraphBlock.vue'),
  ),
  'core/heading': defineAsyncComponent(
    () => import('~/components/blocks/HeadingBlock.vue'),
  ),
  'core/image': defineAsyncComponent(
    () => import('~/components/blocks/ImageBlock.vue'),
  ),
  'core/quote': defineAsyncComponent(
    () => import('~/components/blocks/QuoteBlock.vue'),
  ),
  'core/list': defineAsyncComponent(
    () => import('~/components/blocks/ListBlock.vue'),
  ),
  'core/group': defineAsyncComponent(
    () => import('~/components/blocks/GroupBlock.vue'),
  ),
  'core/columns': defineAsyncComponent(
    () => import('~/components/blocks/ColumnsBlock.vue'),
  ),
  'core/column': defineAsyncComponent(
    () => import('~/components/blocks/ColumnBlock.vue'),
  ),
  'core/gallery': defineAsyncComponent(
    () => import('~/components/blocks/GalleryBlock.vue'),
  ),
  'core/cover': defineAsyncComponent(
    () => import('~/components/blocks/CoverBlock.vue'),
  ),
  'core/spacer': defineAsyncComponent(
    () => import('~/components/blocks/SpacerBlock.vue'),
  ),
}

function resolveBlockComponent(blockName: string) {
  return registry[blockName] ?? resolveComponent('UnsupportedBlock')
}

const rootBlocks = computed(() =>
  props.blocks.filter(
    block => (block.parentClientId ?? null) === (props.parentClientId ?? null),
  ),
)
</script>

<template>
  <div class="block-renderer">
    <component
      :is="resolveBlockComponent(block.name)"
      v-for="block in rootBlocks"
      :key="block.clientId"
      :block="block"
      :all-blocks="blocks"
    />
  </div>
</template>
