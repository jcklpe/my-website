<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractElementInnerHtmlByClass,
    extractRootElement,
    extractTagText,
    stripHtmlToText,
    stripWordPressBlockClassesFromHtml,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks: GutenbergBlock[];
  }>();

  interface AccordionItem {
    id: string;
    title: string;
    panelBlock: GutenbergBlock | null;
    fallbackPanelHtml: string;
    open: boolean;
  }

  const itemBlocks = computed(() =>
    props.allBlocks.filter(
      (candidateBlock) =>
        candidateBlock.name === 'core/accordion-item' &&
        candidateBlock.parentClientId === props.block.clientId,
    ),
  );

  const fallbackAccordionItems = computed<AccordionItem[]>(() => {
    const accordionRoot = extractRootElement(props.block.renderedHtml, 'div');

    if (!accordionRoot) {
      return [];
    }

    const title = extractTagText(accordionRoot.innerHtml, 'button').trim();
    const panelHtml =
      accordionRoot.innerHtml.match(
        /<\/button>\s*<div\b[^>]*>([\s\S]*?)<\/div>/i,
      )?.[1] ?? '';

    if (!title && !panelHtml) {
      return [];
    }

    return [
      {
        id: props.block.clientId,
        title: title || 'Accordion item',
        panelBlock: null,
        fallbackPanelHtml: stripWordPressBlockClassesFromHtml(panelHtml),
        open: accordionRoot.innerHtml.includes('aria-expanded="true"'),
      },
    ];
  });

  const accordionItems = computed<AccordionItem[]>(() => {
    if (!itemBlocks.value.length) {
      return fallbackAccordionItems.value;
    }

    return itemBlocks.value.map((itemBlock, index) => {
      const childBlocks = props.allBlocks.filter(
        (candidateBlock) => candidateBlock.parentClientId === itemBlock.clientId,
      );
      const headingBlock =
        childBlocks.find(
          (candidateBlock) => candidateBlock.name === 'core/accordion-heading',
        ) ?? null;
      const panelBlock =
        childBlocks.find(
          (candidateBlock) => candidateBlock.name === 'core/accordion-panel',
        ) ?? null;
      const titleHtml = extractElementInnerHtmlByClass(
        headingBlock?.renderedHtml ?? itemBlock.renderedHtml,
        'wp-block-accordion-heading__toggle-title',
      );
      const fallbackButtonText = extractTagText(
        headingBlock?.renderedHtml ?? itemBlock.renderedHtml,
        'button',
      ).replace(/\+$/, '');
      const title =
        stripHtmlToText(titleHtml) ||
        fallbackButtonText.trim() ||
        `Accordion item ${index + 1}`;

      return {
        id: itemBlock.clientId,
        title,
        panelBlock,
        fallbackPanelHtml: panelBlock?.renderedHtml ?? '',
        open: itemBlock.renderedHtml?.includes('is-open') ?? false,
      };
    });
  });
</script>

<template>
  <div v-if="accordionItems.length" class="accordion-block">
    <details
      v-for="item in accordionItems"
      :key="item.id"
      class="accordion-item"
      :open="item.open"
    >
      <summary>{{ item.title }}</summary>
      <div class="accordion-panel">
        <BlockChildren
          v-if="item.panelBlock"
          :blocks="allBlocks"
          :parent-client-id="item.panelBlock.clientId"
        />
        <div v-else v-html="item.fallbackPanelHtml" />
      </div>
    </details>
  </div>
</template>
