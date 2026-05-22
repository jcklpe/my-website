<script setup lang="ts">
  import type { FeaturedImage } from '~/types/wordpress';

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
    }>(),
    {
      media: null,
      transitionKey: undefined,
      transitionRole: 'none',
      transitionClipPath: undefined,
      loading: 'lazy',
      fetchPriority: undefined,
      sizes: undefined,
    },
  );

  const imageSrc = computed(() => {
    if (!props.media?.sourceUrl) {
      return '';
    }

    return largestGeneratedSourceUrl(props.media) ?? props.media.sourceUrl;
  });
  const imageSizes = computed(() => props.sizes ?? props.media?.sizes ?? '');
  const imageWidth = computed(() => props.media?.mediaDetails?.width ?? null);
  const imageHeight = computed(() => props.media?.mediaDetails?.height ?? null);
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

  function largestGeneratedSourceUrl(media: FeaturedImage) {
    const sizes = media.mediaDetails?.sizes ?? [];
    const largestSize = sizes
      .filter((size) => size.sourceUrl)
      .map((size) => ({
        sourceUrl: size.sourceUrl ?? '',
        width: Number(size.width ?? 0),
      }))
      .sort((first, second) => second.width - first.width)[0];

    return largestSize?.sourceUrl || null;
  }
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
      :srcset="media.srcSet || undefined"
      :sizes="imageSizes || undefined"
      :alt="media.altText || ''"
      :width="imageWidth || undefined"
      :height="imageHeight || undefined"
      :loading="loading"
      decoding="async"
      :fetchpriority="fetchPriority"
    />
    <div v-else class="placeholder" aria-hidden="true">{{ label }}</div>
  </figure>
</template>

<style lang="scss" scoped>
  .featured-media-frame {
    position: relative;
    aspect-ratio: 16 / 10;
    margin: 0;
    overflow: hidden;
    @include media-placeholder-bg;
  }

  // Iridescent edge glow that blooms when the enclosing link is hovered/focused.
  // A child element (not captured by the transition clone) so it never disturbs
  // the featured-media transition geometry.
  .featured-media-frame::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    box-shadow: inset 0 0 0 0 rgba(199, 125, 208, 0);
    transition: box-shadow 280ms var(--motion-snappy);
  }

  :global(a:hover) .featured-media-frame::after,
  :global(a:focus-visible) .featured-media-frame::after {
    box-shadow:
      inset 0 0 0 2px rgba(199, 125, 208, 0.5),
      inset 0 0 30px rgba(63, 185, 168, 0.28);
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
    @include specimen-label;
  }

  :global(a:hover) .image,
  :global(a:focus-visible) .image {
    filter: saturate(1.16) contrast(1.05);
  }

  @media (prefers-reduced-motion: reduce) {
    .image,
    .featured-media-frame::after {
      transition: none;
    }
  }
</style>
