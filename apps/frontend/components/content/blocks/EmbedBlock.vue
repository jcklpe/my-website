<script setup lang="ts">
  import type { GutenbergBlock } from '~/types/wordpress';
  import { extractTagText } from '~/utils/block-html';

  const props = defineProps<{
    block: GutenbergBlock;
    allBlocks?: GutenbergBlock[];
  }>();

  const embedUrl = computed(() => extractTagText(props.block.renderedHtml, 'div'));
  const youtubeId = computed(() => getYouTubeId(embedUrl.value));
  const youtubeSource = computed(() =>
    youtubeId.value ? `https://www.youtube.com/embed/${youtubeId.value}` : null,
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

  function parseUrl(value: string) {
    try {
      return new URL(value.trim());
    } catch {
      return null;
    }
  }
</script>

<template>
  <figure class="wp-block-embed">
    <iframe
      v-if="youtubeSource"
      :src="youtubeSource"
      title="Embedded YouTube video"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    />
    <div v-else v-html="block.renderedHtml" />
  </figure>
</template>
