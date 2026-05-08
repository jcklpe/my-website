<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    decodeHtmlEntities,
    extractAttribute,
    extractFigcaptionHtml,
    extractFirstImage,
    extractRootElement,
    removeWordPressFrontendClasses,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const wrapper = computed(() => extractRootElement(props.block.renderedHtml));
  const figure = computed(() => {
    if (wrapper.value?.tagName === 'figure') {
      return wrapper.value;
    }

    return extractRootElement(wrapper.value?.innerHtml, 'figure');
  });
  const figureClass = computed(() =>
    removeWordPressFrontendClasses(
      extractAttribute(figure.value?.attributes, 'class'),
    ),
  );
  const image = computed(() => extractFirstImage(figure.value?.innerHtml));
  const imageAttributes = computed(() =>
    cleanImageAttributes(image.value?.attributes ?? ''),
  );
  const linkedImageAttributes = computed(() =>
    extractLinkedImageAttributes(figure.value?.innerHtml ?? ''),
  );
  const captionHtml = computed(() =>
    extractFigcaptionHtml(figure.value?.innerHtml),
  );

  function cleanImageAttributes(attributes: string) {
    const attributeMap = parseAttributeMap(attributes);
    const className = removeWordPressFrontendClasses(attributeMap.class ?? '');

    if (className) {
      attributeMap.class = className;
    } else {
      delete attributeMap.class;
    }

    attributeMap.loading ??= 'lazy';
    attributeMap.decoding ??= 'async';

    return attributeMap;
  }

  function extractLinkedImageAttributes(html: string) {
    const match = html.match(/<a\b([^>]*)>\s*<img\b[^>]*\/?>\s*<\/a>/i);

    if (!match) {
      return null;
    }

    const attributeMap = parseAttributeMap(match[1] ?? '');

    if (!attributeMap.href) {
      return null;
    }

    return attributeMap;
  }

  function parseAttributeMap(attributes: string) {
    const attributeMap: Record<string, string> = {};
    const attributePattern =
      /([^\s=/"'>`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>`]+)))?/g;

    for (const match of attributes.matchAll(attributePattern)) {
      const name = match[1];

      if (!name || /^on/i.test(name)) {
        continue;
      }

      attributeMap[name] = decodeHtmlEntities(
        match[2] ?? match[3] ?? match[4] ?? '',
      );
    }

    return attributeMap;
  }
</script>

<template>
  <figure v-if="figure && imageAttributes.src" :class="figureClass">
    <a v-if="linkedImageAttributes" v-bind="linkedImageAttributes">
      <img v-bind="imageAttributes" />
    </a>
    <img v-else v-bind="imageAttributes" />
    <figcaption v-if="captionHtml" v-html="captionHtml" />
  </figure>
</template>

<style scoped lang="scss">
  figure {
    @include image-block;
  }
</style>
