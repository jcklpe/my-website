<script setup lang="ts">
  import type { FeaturedImage } from '~/types/wordpress';

  defineProps<{
    media?: FeaturedImage | null;
  }>();
</script>

<template>
  <div v-if="media?.sourceUrl" class="interstitial-strip" aria-hidden="true">
    <div class="strip-halftone-box">
      <div class="strip-halftone">
        <img class="strip-image" :src="media.sourceUrl" alt="" loading="lazy" />
        <div class="strip-ink" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  // Case-hero spike: interstitial specimen strip. A short band of
  // ultra-coarse halftone — a detail of the neighboring case study's own
  // image magnified past legibility, like tissue under a lens. It breaks
  // the band rhythm between case-study rows (the naturalist's field-book
  // register). Decorative only: aria-hidden, no interaction, never a
  // transition source. The crisp duotone filter def
  // (#halftone-tone-crisp-blue-cream) lives on the host page
  // (HomeSelectedWorkSection), same as the card's.
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
    @include halftone-image-box;

    // Screen so coarse the image reads as dot pattern, not photograph.
    --halftone-size: 44px;
    filter: url('#halftone-tone-crisp-blue-cream');
  }

  .strip-halftone {
    width: 100%;
    height: 100%;
    @include halftone-image-pane;
  }

  .strip-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 35%;
    @include halftone-image-media;
  }

  .strip-ink {
    @include halftone-image-ink;
  }
</style>
