<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    getBestLightboxImageSource,
    isImageFileUrl,
    type ImageLightboxSlide,
  } from '~/composables/useImageLightbox';
  import {
    decodeHtmlEntities,
    extractAttribute,
    extractFigcaptionHtml,
    extractFirstImage,
    extractRootElement,
    removeWordPressFrontendClasses,
  } from '~/utils/block-html';

  const props = withDefaults(defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
    lightboxSlides?: ImageLightboxSlide[];
    lightboxIndex?: number;
    lightboxDisabled?: boolean;
  }>(), {
    allBlocks: undefined,
    lightboxSlides: undefined,
    lightboxIndex: 0,
    lightboxDisabled: false,
  });

  const { openImage, openSlides } = useImageLightbox();

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
  const imageSrc = computed(() => imageAttributes.value.src ?? '');
  const imageAlt = computed(() => imageAttributes.value.alt ?? '');
  const linkedHref = computed(() => linkedImageAttributes.value?.href ?? '');
  const lightboxSrc = computed(() =>
    getBestLightboxImageSource({
      href: linkedHref.value,
      src: imageSrc.value,
      srcset: imageAttributes.value.srcset,
    }),
  );
  const hasMediaFileLink = computed(() => isImageFileUrl(linkedHref.value));
  const shouldOpenLightbox = computed(
    () => !props.lightboxDisabled && Boolean(lightboxSrc.value),
  );
  const shouldPreserveLink = computed(
    () => Boolean(linkedImageAttributes.value) && !hasMediaFileLink.value,
  );
  const hasAuthorResize = computed(() =>
    figureClass.value.split(/\s+/).includes('is-resized'),
  );
  const resizedWidth = computed(() => {
    if (!hasAuthorResize.value) {
      return '';
    }

    return (
      extractPixelWidth(extractAttribute(figure.value?.attributes, 'style')) ??
      extractPixelWidth(imageAttributes.value.style) ??
      extractPixelWidth(imageAttributes.value.width) ??
      ''
    );
  });
  const figureStyle = computed<Record<string, string> | undefined>(() => {
    if (!resizedWidth.value) {
      return undefined;
    }

    return { '--image-resized-width': `${resizedWidth.value}px` };
  });
  const figureClasses = computed(() => [
    figureClass.value,
    { 'has-lightbox': shouldOpenLightbox.value },
  ]);

  async function openLightbox() {
    if (!shouldOpenLightbox.value) {
      return;
    }

    if (props.lightboxSlides?.length) {
      await openSlides(props.lightboxSlides, props.lightboxIndex);
      return;
    }

    await openImage(lightboxSrc.value, imageAlt.value);
  }

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

  function extractPixelWidth(value?: string) {
    if (!value) {
      return null;
    }

    const styleWidthMatch = value.match(/(?:^|;)\s*width\s*:\s*(\d+(?:\.\d+)?)px\s*(?:;|$)/i);
    const attributeWidthMatch = value.match(/^\d+(?:\.\d+)?$/);
    const matchedWidth = styleWidthMatch?.[1] ?? attributeWidthMatch?.[0];

    if (!matchedWidth) {
      return null;
    }

    const width = Number(matchedWidth);

    if (!Number.isFinite(width) || width <= 0) {
      return null;
    }

    return String(width);
  }
</script>

<template>
  <figure
    v-if="figure && imageAttributes.src"
    :class="figureClasses"
    :style="figureStyle"
  >
    <a v-if="shouldPreserveLink" v-bind="linkedImageAttributes">
      <img v-bind="imageAttributes" data-toc-obstacle />
    </a>
    <button
      v-else-if="shouldOpenLightbox"
      type="button"
      class="image-lightbox-trigger"
      :aria-label="imageAlt ? `View: ${imageAlt}` : 'View image fullsize'"
      @click="openLightbox"
    >
      <img v-bind="imageAttributes" data-toc-obstacle />
    </button>
    <img v-else v-bind="imageAttributes" data-toc-obstacle />
    <figcaption v-if="captionHtml" v-html="captionHtml" />
  </figure>
</template>

<style scoped lang="scss">
  figure {
    @include image-block;
  }
</style>
