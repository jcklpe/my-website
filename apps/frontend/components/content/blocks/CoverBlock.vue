<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractAttribute,
    extractClassNames,
    extractFirstImage,
    extractRootElement,
    extractStyleValue,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks: GutenbergBlock[];
  }>();

  const rootElement = computed(() =>
    extractRootElement(props.block.renderedHtml, 'div'),
  );
  const rootClasses = computed(() =>
    extractAttribute(rootElement.value?.attributes, 'class')
      .split(/\s+/)
      .filter(Boolean),
  );
  const coverImage = computed(() => extractFirstImage(props.block.renderedHtml));
  const minHeight = computed(
    () => extractStyleValue(props.block.renderedHtml, 'min-height') ?? '22rem',
  );
  const objectPosition = computed(
    () => extractStyleValue(props.block.renderedHtml, 'object-position') ?? '50% 50%',
  );
  const dimOpacity = computed(() => {
    const dimClass = extractClassNames(props.block.renderedHtml).find((className) =>
      /^has-background-dim-\d+$/.test(className),
    );
    const dimValue = dimClass?.match(/\d+$/)?.[0];

    return dimValue ? Number(dimValue) / 100 : 0.28;
  });
  const textColor = computed(
    () => extractStyleValue(props.block.renderedHtml, 'color') ?? '',
  );
  const textAlign = computed(() => {
    if (rootClasses.value.includes('has-text-align-center')) {
      return 'center';
    }

    if (rootClasses.value.includes('has-text-align-right')) {
      return 'right';
    }

    return 'left';
  });
  const contentPosition = computed(() => {
    const positionClass = rootClasses.value.find((className) =>
      /^has-custom-content-position-/.test(className),
    );

    if (!positionClass) {
      return {
        align: 'start',
        justify: 'center',
      };
    }

    const [, vertical = 'center', horizontal = 'center'] =
      positionClass.match(
        /^has-custom-content-position-(top|center|bottom)(?:-(left|center|right))?$/,
      ) ?? [];

    return {
      align:
        horizontal === 'right'
          ? 'end'
          : horizontal === 'center'
            ? 'center'
            : 'start',
      justify:
        vertical === 'top'
          ? 'start'
          : vertical === 'bottom'
            ? 'end'
            : 'center',
    };
  });
</script>

<template>
  <section
    class="cover-block"
    :style="{
      minHeight,
      '--cover-dim-opacity': dimOpacity,
      '--cover-align': contentPosition.align,
      '--cover-justify': contentPosition.justify,
      '--cover-text-align': textAlign,
      '--cover-text-color': textColor || 'white',
    }"
  >
    <img
      v-if="coverImage?.src"
      class="media"
      :src="coverImage.src"
      :alt="coverImage.alt"
      :style="{ objectPosition }"
      loading="lazy"
      decoding="async"
    >
    <div class="shade" aria-hidden="true" />
    <div class="copy">
      <BlockChildren :blocks="allBlocks" :parent-client-id="block.clientId" />
    </div>
  </section>
</template>
