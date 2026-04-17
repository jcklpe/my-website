<script setup lang="ts">
  import type { Component } from 'vue';
  import type { GutenbergBlock } from '~/types/wordpress';

  const props = defineProps<{
    blocks: GutenbergBlock[];
    parentClientId?: string | null;
  }>();

  const registry: Record<string, Component> = {
    'core/paragraph': defineAsyncComponent(
      () => import('~/components/content/blocks/ParagraphBlock.vue'),
    ),
    'core/heading': defineAsyncComponent(
      () => import('~/components/content/blocks/HeadingBlock.vue'),
    ),
    'core/image': defineAsyncComponent(
      () => import('~/components/content/blocks/ImageBlock.vue'),
    ),
    'core/quote': defineAsyncComponent(
      () => import('~/components/content/blocks/QuoteBlock.vue'),
    ),
    'core/list': defineAsyncComponent(
      () => import('~/components/content/blocks/ListBlock.vue'),
    ),
    'core/group': defineAsyncComponent(
      () => import('~/components/content/blocks/GroupBlock.vue'),
    ),
    'core/columns': defineAsyncComponent(
      () => import('~/components/content/blocks/ColumnsBlock.vue'),
    ),
    'core/column': defineAsyncComponent(
      () => import('~/components/content/blocks/ColumnBlock.vue'),
    ),
    'core/gallery': defineAsyncComponent(
      () => import('~/components/content/blocks/GalleryBlock.vue'),
    ),
    'core/cover': defineAsyncComponent(
      () => import('~/components/content/blocks/CoverBlock.vue'),
    ),
    'core/spacer': defineAsyncComponent(
      () => import('~/components/content/blocks/SpacerBlock.vue'),
    ),
    'core/separator': defineAsyncComponent(
      () => import('~/components/content/blocks/SeparatorBlock.vue'),
    ),
    'core/code': defineAsyncComponent(
      () => import('~/components/content/blocks/CodeBlock.vue'),
    ),
    'core/preformatted': defineAsyncComponent(
      () => import('~/components/content/blocks/PreformattedBlock.vue'),
    ),
    'core/table': defineAsyncComponent(
      () => import('~/components/content/blocks/TableBlock.vue'),
    ),
    'core/pullquote': defineAsyncComponent(
      () => import('~/components/content/blocks/PullquoteBlock.vue'),
    ),
    'core/embed': defineAsyncComponent(
      () => import('~/components/content/blocks/EmbedBlock.vue'),
    ),
    'core/html': defineAsyncComponent(
      () => import('~/components/content/blocks/HtmlBlock.vue'),
    ),
    'core/verse': defineAsyncComponent(
      () => import('~/components/content/blocks/VerseBlock.vue'),
    ),
    'core/buttons': defineAsyncComponent(
      () => import('~/components/content/blocks/ButtonsBlock.vue'),
    ),
    'core/button': defineAsyncComponent(
      () => import('~/components/content/blocks/ButtonBlock.vue'),
    ),
    'core/media-text': defineAsyncComponent(
      () => import('~/components/content/blocks/MediaTextBlock.vue'),
    ),
    'core/audio': defineAsyncComponent(
      () => import('~/components/content/blocks/AudioBlock.vue'),
    ),
    'core/video': defineAsyncComponent(
      () => import('~/components/content/blocks/VideoBlock.vue'),
    ),
    'core/file': defineAsyncComponent(
      () => import('~/components/content/blocks/FileBlock.vue'),
    ),
    'core/details': defineAsyncComponent(
      () => import('~/components/content/blocks/DetailsBlock.vue'),
    ),
  };

  function resolveBlockComponent(blockName: string) {
    return registry[blockName] ?? resolveComponent('UnsupportedBlock');
  }

  const rootBlocks = computed(() =>
    props.blocks.filter(
      (block) =>
        (block.parentClientId ?? null) === (props.parentClientId ?? null),
    ),
  );
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
