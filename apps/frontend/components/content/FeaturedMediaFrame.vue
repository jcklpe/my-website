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
    }>(),
    {
      media: null,
      transitionKey: undefined,
      transitionRole: 'none',
      transitionClipPath: undefined,
      loading: 'lazy',
      fetchPriority: undefined,
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
      'is-transition-hidden': shouldHideForTransition,
    }"
    v-bind="transitionDataAttributes"
  >
    <img
      v-if="media?.sourceUrl"
      class="image"
      :src="media.sourceUrl"
      :alt="media.altText || ''"
      :loading="loading"
      decoding="async"
      :fetchpriority="fetchPriority"
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
    font-size: var(--type-step-1);
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
