<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractAttribute,
    extractElementInnerHtmlByClass,
    extractRootElement,
    extractTagText,
    removeWordPressFrontendClasses,
    stripHtmlToText,
    stripWordPressFrontendClassesFromHtml,
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
  const accordionRoot = computed(() =>
    extractRootElement(props.block.renderedHtml, 'div'),
  );
  const accordionClass = computed(() =>
    removeWordPressFrontendClasses(
      extractAttribute(accordionRoot.value?.attributes, 'class'),
    ),
  );
  const autoClose = computed(() => props.block.attributes?.autoclose ?? true);

  const fallbackAccordionItems = computed<AccordionItem[]>(() => {
    if (!accordionRoot.value) {
      return [];
    }

    const title = extractTagText(accordionRoot.value.innerHtml, 'button').trim();
    const panelHtml =
      accordionRoot.value.innerHtml.match(
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
        fallbackPanelHtml: stripWordPressFrontendClassesFromHtml(panelHtml),
        open: accordionRoot.value.innerHtml.includes('aria-expanded="true"'),
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
        fallbackPanelHtml: stripWordPressFrontendClassesFromHtml(
          panelBlock?.renderedHtml ?? '',
        ),
        open: itemBlock.renderedHtml?.includes('is-open') ?? false,
      };
    });
  });

  const openItemIds = ref<string[]>([]);

  watch(
    [accordionItems, autoClose],
    ([items, shouldAutoClose]) => {
      const defaultOpenItems = items.filter((item) => item.open).map((item) => item.id);

      openItemIds.value = shouldAutoClose
        ? defaultOpenItems.slice(0, 1)
        : defaultOpenItems;
    },
    {
      immediate: true,
    },
  );

  function isItemOpen(itemId: string) {
    return openItemIds.value.includes(itemId);
  }

  function toggleItem(itemId: string) {
    if (autoClose.value) {
      openItemIds.value = isItemOpen(itemId) ? [] : [itemId];

      return;
    }

    openItemIds.value = isItemOpen(itemId)
      ? openItemIds.value.filter((openItemId) => openItemId !== itemId)
      : [...openItemIds.value, itemId];
  }
</script>

<template>
  <div v-if="accordionItems.length" class="accordion-block" :class="accordionClass">
    <section
      v-for="item in accordionItems"
      :key="item.id"
      class="accordion-item"
    >
      <button
        class="accordion-toggle"
        type="button"
        :aria-controls="`accordion-panel-${item.id}`"
        :aria-expanded="isItemOpen(item.id)"
        @click="toggleItem(item.id)"
      >
        <span class="accordion-title">{{ item.title }}</span>
      </button>
      <div
        v-show="isItemOpen(item.id)"
        :id="`accordion-panel-${item.id}`"
        class="accordion-panel"
      >
        <BlockChildren
          v-if="item.panelBlock"
          :blocks="allBlocks"
          :parent-client-id="item.panelBlock.clientId"
        />
        <div v-else v-html="item.fallbackPanelHtml" />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
  .accordion-block {
    @include accordion-shell;
  }

  .accordion-item + .accordion-item {
    border-top: 1px solid rgba(7, 11, 31, 0.1);
  }

  .accordion-toggle {
    @include accordion-toggle;
  }

  .accordion-toggle::after {
    content: '+';
    margin-left: var(--space-4);
    color: var(--color-primary);
    font-family: var(--font-mono);
  }

  .accordion-toggle[aria-expanded='true']::after {
    content: '-';
  }

  .accordion-panel {
    @include accordion-panel;
  }

  .accordion-panel:deep(> * + *) {
    margin-top: var(--space-3);
  }
</style>
