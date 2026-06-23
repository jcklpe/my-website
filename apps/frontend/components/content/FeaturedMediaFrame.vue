<script setup lang="ts">
  import type { FeaturedImage, FeaturedMediaTreatment } from '~/types/wordpress';
  import { mediaImageSourceForTreatment } from '~/utils/featured-media';

  const props = withDefaults(
    defineProps<{
      media?: FeaturedImage | null;
      label: string;
      transitionKey?: string;
      transitionRole?: 'source' | 'target' | 'none';
      transitionClipPath?: string;
      loading?: 'eager' | 'lazy';
      fetchPriority?: 'high' | 'low' | 'auto';
      sizes?: string;
      treatment?: FeaturedMediaTreatment;
    }>(),
    {
      media: null,
      transitionKey: undefined,
      transitionRole: 'none',
      transitionClipPath: undefined,
      loading: 'lazy',
      fetchPriority: undefined,
      sizes: undefined,
      treatment: 'default',
    },
  );

  const imageSource = computed(() =>
    mediaImageSourceForTreatment(props.media, props.treatment),
  );
  const imageSrc = computed(() => imageSource.value.sourceUrl);
  const imageSrcSet = computed(() => imageSource.value.srcSet ?? '');
  const imageSizes = computed(() => props.sizes ?? props.media?.sizes ?? '');
  const imageWidth = computed(() => imageSource.value.width ?? null);
  const imageHeight = computed(() => imageSource.value.height ?? null);
  const imageTreatment = computed(() => imageSource.value.treatment);
  const transitionState = useFeaturedMediaTransitionState();
  const isForwardSourceMedia = computed(
    () =>
      props.transitionRole === 'source' &&
      transitionState.value.sourceRole === 'source',
  );
  const shouldHideForTransition = computed(() =>
    Boolean(
      props.transitionKey &&
      props.transitionRole !== 'none' &&
      transitionState.value.active &&
      transitionState.value.key === props.transitionKey &&
      !isForwardSourceMedia.value,
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
      'is-transition-hidden': shouldHideForTransition,
    }"
    v-bind="transitionDataAttributes"
  >
    <img
      v-if="media?.sourceUrl"
      class="image"
      :src="imageSrc"
      :srcset="imageSrcSet || undefined"
      :sizes="imageSizes || undefined"
      :alt="media.altText || ''"
      :width="imageWidth || undefined"
      :height="imageHeight || undefined"
      :loading="loading"
      decoding="async"
      :fetchpriority="fetchPriority"
      :data-featured-media-treatment="imageTreatment"
    />
    <div v-else class="placeholder" aria-hidden="true">{{ label }}</div>
  </figure>
</template>

<style lang="scss" scoped>
  .featured-media-frame {
    aspect-ratio: 16 / 10;
    margin: 0;
    overflow: hidden;
    @include media-placeholder-bg;
  }

  .is-transition-hidden {
    opacity: 0 !important;
    visibility: hidden;
  }

  .image,
  .placeholder {
    width: 100%;
    height: 100%;
  }

  .image {
    display: block;
    object-fit: cover;
    @include media-image-scale;
  }

  .placeholder {
    display: grid;
    place-items: center;
    color: var(--color-primary-heavy);
    font-size: var(--type-base);
    font-style: italic;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  :global(a:hover) .image,
  :global(a:focus-visible) .image {
    filter: saturate(1.16) contrast(1.05);
  }

  @media (prefers-reduced-motion: reduce) {
    .image {
      transition: none;
    }
  }
</style>
