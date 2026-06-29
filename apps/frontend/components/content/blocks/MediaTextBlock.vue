<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    addContentMediaDefaultsToHtml,
    extractAttribute,
    extractFirstElementHtml,
    extractRootElement,
    extractStyleValue,
    stripWordPressFrontendClassesFromHtml,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks: GutenbergBlock[];
  }>();

  const rootElement = computed(() =>
    extractRootElement(props.block.renderedHtml, 'div'),
  );
  const classNames = computed(() =>
    extractAttribute(rootElement.value?.attributes, 'class')
      .split(/\s+/)
      .filter(Boolean),
  );
  const shellClass = computed(() =>
    classNames.value.filter((className) =>
      ['alignwide', 'alignfull'].includes(className),
    ),
  );
  const mediaFigure = computed(() =>
    extractRootElement(
      extractFirstElementHtml(props.block.renderedHtml, 'figure'),
      'figure',
    ),
  );
  const mediaHtml = computed(() =>
    addContentMediaDefaultsToHtml(
      stripWordPressFrontendClassesFromHtml(mediaFigure.value?.innerHtml ?? ''),
    ),
  );
  const mediaOnRight = computed(() =>
    classNames.value.includes('has-media-on-the-right'),
  );
  const verticalAlign = computed(() => {
    if (classNames.value.includes('is-vertically-aligned-top')) {
      return 'top';
    }

    if (classNames.value.includes('is-vertically-aligned-bottom')) {
      return 'bottom';
    }

    return 'center';
  });
  const stackOnMobile = computed(() =>
    classNames.value.includes('is-stacked-on-mobile'),
  );
  const backgroundColor = computed(
    () => extractStyleValue(props.block.renderedHtml, 'background-color') ?? '',
  );
</script>

<template>
  <section
    class="media-text-block"
    :class="[
      shellClass,
      {
        'media-on-right': mediaOnRight,
        'stack-on-mobile': stackOnMobile,
        'has-surface': backgroundColor,
      },
      `align-${verticalAlign}`,
    ]"
    :style="{ '--media-text-surface': backgroundColor || 'transparent' }"
  >
    <figure v-if="mediaHtml" class="media" v-html="mediaHtml" />
    <div class="copy">
      <BlockChildren :blocks="allBlocks" :parent-client-id="block.clientId" />
    </div>
  </section>
</template>

<style scoped lang="scss">
  .media-text-block {
    @include media-text-block;
  }

  @include breakpoint(phone) {
    // heading-article-frame adds padding-inline:var(--space-4) on phone to align
    // headings that span the full viewport (grid-column:wide) with paragraph text.
    // Inside .copy the heading is already within a padded container, so that
    // extra inset is wrong — same fix as ColumnBlock.vue.
    .copy :deep(h2),
    .copy :deep(h3),
    .copy :deep(h4),
    .copy :deep(h5),
    .copy :deep(h6) {
      padding-inline: 0;
    }
  }
</style>
