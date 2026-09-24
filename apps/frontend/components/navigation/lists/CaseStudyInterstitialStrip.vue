<script setup lang="ts">
  import type { FeaturedImage } from '~/types/wordpress';

  const props = defineProps<{
    media?: FeaturedImage | null;
  }>();
  const imageElement = ref<HTMLImageElement | null>(null);
  useLiveHalftoneImage(
    imageElement,
    computed(() => Boolean(props.media?.sourceUrl)),
    computed(() => props.media?.sourceUrl ?? ''),
  );
</script>

<template>
  <div v-if="media?.sourceUrl" class="interstitial-strip" aria-hidden="true">
    <div class="strip-halftone-box">
      <div class="strip-halftone">
        <img
          ref="imageElement"
          class="strip-image"
          :src="media.sourceUrl"
          data-featured-media-treatment="case-study-halftone"
          data-halftone-cell-size="44"
          alt=""
          loading="lazy"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  // Decorative interstitial strip rendered by the same live GPU halftone
  // controller as the case-study cards.
  .interstitial-strip {
    position: relative;
    height: clamp(96px, 12vh, 160px);
    overflow: hidden;
    pointer-events: none;
    background: var(--color-ink);
  }

  .strip-halftone-box {
    position: absolute;
    inset: 0;
  }

  .strip-halftone {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .strip-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 35%;
  }
</style>
