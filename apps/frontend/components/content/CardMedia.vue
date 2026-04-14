<script setup lang="ts">
import type { FeaturedImage } from '~/types/wordpress'

defineProps<{
  media?: FeaturedImage | null
  label: string
  transitionKey: string
}>()
</script>

<template>
  <figure
    class="card-media"
    :data-shared-media-key="transitionKey"
  >
    <img
      v-if="media?.sourceUrl"
      :src="media.sourceUrl"
      :alt="media.altText || ''"
      loading="lazy"
      decoding="async"
    >
    <div v-else class="card-media__placeholder" aria-hidden="true">
      <span>{{ label }}</span>
    </div>
  </figure>
</template>

<style lang="scss" scoped>
.card-media {
  aspect-ratio: 16 / 10;
  margin: 0;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(38, 87, 235, 0.18), rgba(114, 0, 255, 0.16)),
    rgba(12, 17, 43, 0.06);
}

.card-media img,
.card-media__placeholder {
  width: 100%;
  height: 100%;
}

.card-media img {
  display: block;
  object-fit: cover;
  transform: scale(1.01);
  transition:
    transform 520ms var(--motion-snappy),
    filter 520ms var(--motion-snappy);
}

.card-media__placeholder span {
  display: inline-block;
  background: var(--color-poster-black);
  color: white;
  padding: 0.3em 0.5em;
  box-shadow: var(--shadow-label);
}

.card-media__placeholder {
  display: grid;
  place-items: center;
  color: var(--color-primary-heavy);
  font-size: var(--type-step-1);
  font-style: italic;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

:global(a:hover) .card-media img,
:global(a:focus-visible) .card-media img {
  filter: saturate(1.16) contrast(1.05);
  transform: scale(1.07) translateX(1.5%);
}

@media (prefers-reduced-motion: reduce) {
  .card-media img {
    transition: none;
  }
}
</style>
