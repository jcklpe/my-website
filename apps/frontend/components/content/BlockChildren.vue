<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { blockComponentRegistry } from '~/utils/block-components';
  import FloatBreakoutGroup from './FloatBreakoutGroup.vue';

  const props = defineProps<{
    // The full flat block list. Always passed down to child components as
    // `all-blocks` so container blocks (group, columns) can find their own
    // descendants by parentClientId.
    blocks: GutenbergBlock[];
    parentClientId?: string | null;
    // Optional explicit set of sibling blocks to render at this level,
    // overriding the parentClientId filter. Used by FloatBreakoutGroup to
    // render a contiguous subset of siblings (the float's wrapping blocks)
    // while still handing descendants the full flat list above.
    renderBlocks?: GutenbergBlock[];
  }>();

  function resolveBlockComponent(blockName: string) {
    return (
      blockComponentRegistry[blockName] ?? resolveComponent('UnsupportedBlock')
    );
  }

  const childBlocks = computed(
    () =>
      props.renderBlocks ??
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
    // A group's inner text wraps beside the float too; include it so an
    // aligned image followed by a group still floats with content beside it.
    'core/group',
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

      // Always route an aligned lead through the float-breakout container
      // (even with no wrapping blocks): a bare aligned image is a grid item,
      // and grid ignores `float`, so it would not float at all. The
      // container is a flow context where `float` works; with no following
      // compatible blocks it simply floats alone.
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
