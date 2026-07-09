<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    addMediaPreloadDefaultsToHtml,
    extractAttribute,
    extractRootElement,
    removeWordPressFrontendClasses,
    stripWordPressFrontendClassesFromHtml,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const video = computed(() =>
    extractRootElement(props.block.renderedHtml, 'figure'),
  );
  const figureClass = computed(() =>
    removeWordPressFrontendClasses(
      extractAttribute(video.value?.attributes, 'class'),
    ),
  );
  const blockAlign = computed(() => {
    const alignValue = props.block.attributes?.align;

    return typeof alignValue === 'string' ? alignValue : null;
  });
  const alignmentClass = computed(() => {
    const alignValue = blockAlign.value;

    if (!alignValue) {
      return null;
    }

    const candidate = `align${alignValue}`;

    if (
      ![
        'alignwide',
        'alignfull',
        'alignleft',
        'alignright',
        'aligncenter',
      ].includes(candidate)
    ) {
      return null;
    }

    return figureClass.value.split(/\s+/).includes(candidate)
      ? null
      : candidate;
  });
  const videoElement = computed(() =>
    extractRootElement(video.value?.innerHtml, 'video'),
  );
  const fallbackVideoAspectRatio = computed(() => {
    const width = Number.parseInt(
      extractAttribute(videoElement.value?.attributes, 'width'),
      10,
    );
    const height = Number.parseInt(
      extractAttribute(videoElement.value?.attributes, 'height'),
      10,
    );

    if (
      Number.isFinite(width) &&
      width > 0 &&
      Number.isFinite(height) &&
      height > 0
    ) {
      return width / height;
    }

    return 16 / 9;
  });
  const videoHtml = computed(() =>
    addMediaPreloadDefaultsToHtml(
      stripWordPressFrontendClassesFromHtml(video.value?.innerHtml ?? ''),
    ),
  );
  const videoBlockRef = ref<HTMLElement | null>(null);
  const measuredVideoAspectRatio = ref<number | null>(null);
  const effectiveVideoAspectRatio = computed(
    () => measuredVideoAspectRatio.value ?? fallbackVideoAspectRatio.value,
  );
  const videoSizingStyle = computed(() => ({
    '--video-aspect-ratio': String(effectiveVideoAspectRatio.value),
  }));

  let detachMetadataListener: (() => void) | null = null;

  function clearMetadataListener() {
    detachMetadataListener?.();
    detachMetadataListener = null;
  }

  function bindVideoMetadataRatio() {
    clearMetadataListener();

    const videoNode = videoBlockRef.value?.querySelector('video');

    if (!videoNode) {
      return;
    }

    const applyMeasuredRatio = () => {
      if (videoNode.videoWidth > 0 && videoNode.videoHeight > 0) {
        measuredVideoAspectRatio.value =
          videoNode.videoWidth / videoNode.videoHeight;
      }
    };

    applyMeasuredRatio();

    if (measuredVideoAspectRatio.value) {
      return;
    }

    const onLoadedMetadata = () => {
      applyMeasuredRatio();
      clearMetadataListener();
    };

    videoNode.addEventListener('loadedmetadata', onLoadedMetadata);
    detachMetadataListener = () => {
      videoNode.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }

  onMounted(async () => {
    await nextTick();
    bindVideoMetadataRatio();
  });

  watch(videoHtml, async () => {
    measuredVideoAspectRatio.value = null;
    await nextTick();
    bindVideoMetadataRatio();
  });

  onBeforeUnmount(() => {
    clearMetadataListener();
  });
</script>

<template>
  <figure
    v-if="video"
    ref="videoBlockRef"
    class="video-block"
    :class="[figureClass, alignmentClass]"
    :style="videoSizingStyle"
    v-html="videoHtml"
  />
</template>

<style scoped lang="scss">
  .video-block {
    @include video-block-shell;
    --video-max-height: min(75vh, var(--article-media-height-full));

    .content-flow > & {
      width: min(
        100%,
        var(--article-frame),
        calc(var(--video-max-height) * var(--video-aspect-ratio))
      );
      max-width: 100%;
      margin-inline: auto;
    }

    .content-flow > &.alignwide,
    .content-flow > &.alignfull {
      width: min(
        100%,
        calc(var(--video-max-height) * var(--video-aspect-ratio))
      );
      max-width: 100%;
      margin-inline: auto;
      justify-self: center;
    }

    .content-flow > &.alignfull {
      margin-left: auto;
      margin-right: auto;
    }

    :deep(video) {
      @include embed-media;

      width: 100%;
      max-width: 100%;
      max-height: none;
      height: auto;
      aspect-ratio: auto;
      margin-inline: auto;
      background: transparent;
    }

    :deep(figcaption) {
      @include figure-caption;
      @include breakpoint(phone) {
        margin-left: 20px;
      }
    }
  }
</style>
