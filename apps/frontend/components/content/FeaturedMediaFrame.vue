<script setup lang="ts">
  import type { FeaturedImage } from '~/types/wordpress';

  const props = withDefaults(
    defineProps<{
      media?: FeaturedImage | null;
      label: string;
      transitionKey?: string;
      transitionRole?: 'source' | 'target' | 'none';
      transitionClipPath?: string;
    }>(),
    {
      media: null,
      transitionKey: undefined,
      transitionRole: 'none',
      transitionClipPath: undefined,
    },
  );

  const transitionState = useFeaturedMediaTransitionState();
  const shouldHideForTransition = computed(() =>
    Boolean(
      props.transitionKey &&
      props.transitionRole !== 'none' &&
      transitionState.value.active &&
      transitionState.value.key === props.transitionKey,
    ),
  );

  const transitionDataAttributes = computed(() => {
    if (!props.transitionKey || props.transitionRole === 'none') {
      return {};
    }

    return {
      [`data-featured-media-${props.transitionRole}`]: props.transitionKey,
      ...(props.transitionClipPath
        ? { 'data-featured-media-clip': props.transitionClipPath }
        : {}),
    };
  });
</script>

<template>
  <figure
    class="featured-media-frame"
    :class="{
      'featured-media-frame--transition-hidden': shouldHideForTransition,
    }"
    v-bind="transitionDataAttributes"
  >
    <img
      v-if="media?.sourceUrl"
      class="featured-media-frame__image"
      :src="media.sourceUrl"
      :alt="media.altText || ''"
      loading="lazy"
      decoding="async"
    />
    <div v-else class="featured-media-frame__placeholder" aria-hidden="true">
      <span>{{ label }}</span>
    </div>
  </figure>
</template>

<style lang="scss" scoped>
  .featured-media-frame {
    aspect-ratio: 16 / 10;
    margin: 0;
    overflow: hidden;
    background:
      linear-gradient(135deg, rgba(38, 87, 235, 0.18), rgba(114, 0, 255, 0.16)),
      rgba(12, 17, 43, 0.06);
  }

  .featured-media-frame--transition-hidden {
    opacity: 0 !important;
    visibility: hidden;
  }

  .featured-media-frame__image,
  .featured-media-frame__placeholder {
    width: 100%;
    height: 100%;
  }

  .featured-media-frame__image {
    display: block;
    object-fit: cover;
    transform: scale(1.01);
    transition:
      transform 520ms var(--motion-snappy),
      filter 520ms var(--motion-snappy);
  }

  .featured-media-frame__placeholder {
    display: grid;
    place-items: center;
    color: var(--color-primary-heavy);
    font-size: var(--type-step-1);
    font-style: italic;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .featured-media-frame__placeholder span {
    display: inline-block;
    background: var(--color-poster-black);
    color: white;
    padding: 0.3em 0.5em;
    box-shadow: var(--shadow-label);
  }

  :global(a:hover) .featured-media-frame__image,
  :global(a:focus-visible) .featured-media-frame__image {
    filter: saturate(1.16) contrast(1.05);
  }

  @media (prefers-reduced-motion: reduce) {
    .featured-media-frame__image {
      transition: none;
    }
  }
</style>
