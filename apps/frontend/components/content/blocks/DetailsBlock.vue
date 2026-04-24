<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractElementInnerHtml,
    extractFirstElementHtml,
    extractAttribute,
    extractRootElement,
    removeWordPressFrontendClasses,
    stripWordPressFrontendClassesFromHtml,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const details = computed(() =>
    extractRootElement(props.block.renderedHtml, 'details'),
  );
  const detailsClass = computed(() =>
    removeWordPressFrontendClasses(extractAttribute(details.value?.attributes, 'class')),
  );
  const summaryHtml = computed(() =>
    extractElementInnerHtml(props.block.renderedHtml, 'summary'),
  );
  const panelHtml = computed(() => {
    if (!details.value) {
      return '';
    }

    const summaryElement = extractFirstElementHtml(props.block.renderedHtml, 'summary');
    const innerHtml = details.value.innerHtml;
    const detailsBodyHtml = summaryElement
      ? innerHtml.replace(summaryElement, '').trim()
      : innerHtml;

    return stripWordPressFrontendClassesFromHtml(detailsBodyHtml);
  });
</script>

<template>
  <details v-if="details" class="details-block" :class="detailsClass">
    <summary v-if="summaryHtml" v-html="summaryHtml" />
    <div v-if="panelHtml" class="details-panel" v-html="panelHtml" />
  </details>
</template>

<style lang="scss" scoped>
  .details-block {
    @include details-shell;
  }

  .details-block summary {
    @include details-summary;
  }

  .details-block summary::marker {
    color: var(--color-ink);
  }

  .details-block[open] summary {
    border-bottom: 1px solid rgba(7, 11, 31, 0.12);
  }

  .details-panel {
    @include details-panel;
  }

  .details-panel:deep(> * + *) {
    margin-top: var(--space-3);
  }
</style>
