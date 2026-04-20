<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import {
    extractFigcaptionHtml,
    extractFirstElementHtml,
    extractTagText,
  } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const embedUrl = computed(() =>
    extractTagText(props.block.renderedHtml, 'div').trim(),
  );
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

  function getYouTubeId(value: string) {
    const url = parseUrl(value);

    if (!url) {
      return null;
    }

    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace('/', '') || null;
    }

    if (url.hostname.includes('youtube.com')) {
      return url.searchParams.get('v') || url.pathname.split('/embed/')[1] || null;
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
</script>

<template>
  <figure class="embed-block">
    <iframe
      v-if="youtubeSource"
      :src="youtubeSource"
      title="Embedded YouTube video"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
    <div v-else-if="fallbackIframe" v-html="fallbackIframe" />
    <p v-else-if="embedUrl" class="embed-fallback">
      <a :href="embedUrl">{{ embedUrl }}</a>
    </p>
    <figcaption v-if="captionHtml" v-html="captionHtml" />
  </figure>
</template>
