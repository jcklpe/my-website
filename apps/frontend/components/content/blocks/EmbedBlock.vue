<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractAttribute,
    extractFirstAnchor,
    extractFigcaptionHtml,
    extractFirstElementHtml,
    extractRootElement,
    extractTagText,
    removeWordPressFrontendClasses,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const root = computed(() =>
    extractRootElement(props.block.renderedHtml, 'figure'),
  );
  const figureClass = computed(() =>
    removeWordPressFrontendClasses(
      extractAttribute(root.value?.attributes, 'class'),
    ),
  );
  const embedUrl = computed(() => {
    const wrapperUrl = extractTagText(props.block.renderedHtml, 'div').trim();

    if (wrapperUrl) {
      return wrapperUrl;
    }

    const paragraphUrl = extractTagText(props.block.renderedHtml, 'p').trim();

    if (paragraphUrl) {
      return paragraphUrl;
    }

    const firstAnchorHref = extractFirstAnchor(
      props.block.renderedHtml,
    )?.href?.trim();

    if (firstAnchorHref) {
      return firstAnchorHref;
    }

    const iframeElement = extractRootElement(
      extractFirstElementHtml(props.block.renderedHtml, 'iframe'),
      'iframe',
    );
    const iframeSrc = extractAttribute(iframeElement?.attributes, 'src').trim();

    if (iframeSrc) {
      return iframeSrc;
    }

    return '';
  });
  const fallbackIframe = computed(() =>
    extractFirstElementHtml(props.block.renderedHtml, 'iframe'),
  );
  const captionHtml = computed(() =>
    extractFigcaptionHtml(props.block.renderedHtml),
  );
  const youtubeId = computed(() => getYouTubeId(embedUrl.value));
  const youtubeSource = computed(() =>
    youtubeId.value ? `https://www.youtube.com/embed/${youtubeId.value}` : null,
  );
  const vimeoId = computed(() => getVimeoId(embedUrl.value));
  const vimeoSource = computed(() =>
    vimeoId.value ? `https://player.vimeo.com/video/${vimeoId.value}` : null,
  );
  const sketchfabSource = computed(() =>
    getSketchfabEmbedSource(embedUrl.value),
  );

  function getYouTubeId(value: string) {
    const url = parseUrl(value);

    if (!url) {
      return null;
    }

    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace('/', '') || null;
    }

    if (url.hostname.includes('youtube.com')) {
      return (
        url.searchParams.get('v') || url.pathname.split('/embed/')[1] || null
      );
    }

    return null;
  }

  function getVimeoId(value: string) {
    const url = parseUrl(value);

    if (!url || !url.hostname.includes('vimeo.com')) {
      return null;
    }

    return url.pathname.split('/').filter(Boolean)[0] ?? null;
  }

  function parseUrl(value: string) {
    try {
      return new URL(value.trim());
    } catch {
      return null;
    }
  }

  function getSketchfabEmbedSource(value: string) {
    const url = parseUrl(value);

    if (!url || !url.hostname.includes('sketchfab.com')) {
      return null;
    }

    if (url.pathname.includes('/embed')) {
      return url.toString();
    }

    const modelId = extractSketchfabModelId(url.pathname);

    if (!modelId) {
      return null;
    }

    return `https://sketchfab.com/models/${modelId}/embed`;
  }

  function extractSketchfabModelId(pathname: string) {
    const modelPathMatch = pathname.match(/\/models\/([a-z0-9]{32})/i);

    if (modelPathMatch?.[1]) {
      return modelPathMatch[1];
    }

    const slugPathMatch = pathname.match(/-([a-z0-9]{32})(?:$|\/)/i);

    return slugPathMatch?.[1] ?? null;
  }
</script>

<template>
  <figure
    class="embed-block"
    :class="[
      figureClass,
      {
        'provider-youtube': Boolean(youtubeSource),
        'provider-vimeo': Boolean(vimeoSource),
        'provider-sketchfab': Boolean(sketchfabSource),
      },
    ]"
  >
    <div class="embed-surface" data-toc-obstacle>
      <div class="embed-frame">
        <iframe
          v-if="youtubeSource"
          :src="youtubeSource"
          title="Embedded YouTube video"
          loading="lazy"
          allow="
            accelerometer;
            autoplay;
            clipboard-write;
            encrypted-media;
            gyroscope;
            picture-in-picture;
            web-share;
          "
          allowfullscreen
        />
        <iframe
          v-else-if="vimeoSource"
          :src="vimeoSource"
          title="Embedded Vimeo video"
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
        />
        <iframe
          v-else-if="sketchfabSource"
          :src="sketchfabSource"
          title="Embedded Sketchfab model"
          loading="lazy"
          allow="
            autoplay;
            fullscreen;
            xr-spatial-tracking;
            execution-while-out-of-viewport;
            execution-while-not-rendered;
            web-share;
          "
          allowfullscreen
          xr-spatial-tracking
          execution-while-out-of-viewport
          execution-while-not-rendered
          web-share
        />
        <div
          v-else-if="fallbackIframe"
          class="embed-frame-fallback"
          v-html="fallbackIframe"
        />
        <p v-else-if="embedUrl" class="embed-fallback">
          <a :href="embedUrl">{{ embedUrl }}</a>
        </p>
      </div>
    </div>
    <figcaption v-if="captionHtml" v-html="captionHtml" />
  </figure>
</template>

<style scoped lang="scss">
  .embed-block {
    @include embed-block;
  }
</style>
