<script setup lang="ts">
  import type { Component } from 'vue';
  import type { GutenbergBlock } from '~/types/wordpress';
  import FloatBreakoutGroup from './FloatBreakoutGroup.vue';

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
    'core/accordion': defineAsyncComponent(
      () => import('~/components/content/blocks/AccordionBlock.vue'),
    ),
    'my-website/mega-gallery': defineAsyncComponent(
      () => import('~/components/content/blocks/MegaGalleryBlock.vue'),
    ),
  };

  function resolveBlockComponent(blockName: string) {
    return registry[blockName] ?? resolveComponent('UnsupportedBlock');
  }

  const childBlocks = computed(() =>
    props.blocks.filter(
      (block) =>
        (block.parentClientId ?? null) === (props.parentClientId ?? null),
    ),
  );

  type FloatAlignment = 'alignleft' | 'alignright';

  type RenderPlanItem =
    | {
        kind: 'block';
        block: GutenbergBlock;
      }
    | {
        kind: 'float-breakout';
        leadBlock: GutenbergBlock;
        blocks: GutenbergBlock[];
        alignment: FloatAlignment;
      };

  const floatBreakoutCompatibleBlocks = new Set([
    'core/paragraph',
    'core/heading',
    'core/list',
    'core/details',
    'core/buttons',
  ]);

  const floatBreakoutLeadBlocks = new Set([
    'core/image',
    'core/quote',
    'core/pullquote',
  ]);

  function getFloatAlignment(block: GutenbergBlock): FloatAlignment | null {
    if (!floatBreakoutLeadBlocks.has(block.name)) {
      return null;
    }

    const renderedHtml = block.renderedHtml ?? '';

    if (/\balignleft\b/.test(renderedHtml)) {
      return 'alignleft';
    }

    if (/\balignright\b/.test(renderedHtml)) {
      return 'alignright';
    }

    return null;
  }

  const renderPlan = computed<RenderPlanItem[]>(() => {
    const siblings = childBlocks.value;
    const plan: RenderPlanItem[] = [];

    for (let index = 0; index < siblings.length; index += 1) {
      const block = siblings[index];
      const alignment = getFloatAlignment(block);

      if (!alignment) {
        plan.push({
          kind: 'block',
          block,
        });
        continue;
      }

      const breakoutBlocks: GutenbergBlock[] = [];
      let nextIndex = index + 1;

      while (
        nextIndex < siblings.length &&
        floatBreakoutCompatibleBlocks.has(siblings[nextIndex]?.name ?? '')
      ) {
        breakoutBlocks.push(siblings[nextIndex]);
        nextIndex += 1;
      }

      if (breakoutBlocks.length === 0) {
        plan.push({
          kind: 'block',
          block,
        });
        continue;
      }

      plan.push({
        kind: 'float-breakout',
        leadBlock: block,
        blocks: breakoutBlocks,
        alignment,
      });

      index = nextIndex - 1;
    }

    return plan;
  });
</script>

<template>
  <template
    v-for="item in renderPlan"
    :key="item.kind === 'block' ? item.block.clientId : item.leadBlock.clientId"
  >
    <component
      :is="resolveBlockComponent(item.block.name)"
      v-if="item.kind === 'block'"
      :block="item.block"
      :all-blocks="blocks"
    />

    <FloatBreakoutGroup
      v-else
      :lead-block="item.leadBlock"
      :blocks="item.blocks"
      :all-blocks="blocks"
      :alignment="item.alignment"
    />
  </template>
</template>
