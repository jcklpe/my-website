<script setup lang="ts">
  import type { WordPressCaseStudy } from '~/types/wordpress';

  const props = defineProps<{
    caseStudy: WordPressCaseStudy;
  }>();

  // Transition system coupling: this card participates in the featured-media
  // card-to-detail transition. useFeaturedMediaTransition reads geometry from
  // this card's FeaturedMediaFrame and data-transition-source attribute.
  // The detail target is case-studies/[slug].vue. See also:
  // composables/useFeaturedMediaTransition.ts
  // components/transitions/FeaturedMediaTransitionLayer.vue
  const { navigateWithFeaturedMediaTransition } = useFeaturedMediaTransition();
  const { prefetchCaseStudy, prefetchCaseStudyFromViewport } =
    useContentDetailPrefetch();
  const transitionState = useFeaturedMediaTransitionState();
  const cardElement = ref<HTMLElement | null>(null);
  const caseStudySlug = computed(() => props.caseStudy.slug);
  const caseStudyUrl = computed(() => `/case-studies/${caseStudySlug.value}`);
  const mediaTransitionKey = computed(() =>
    `case-study-${caseStudySlug.value}`.replace(/[^a-zA-Z0-9_-]/g, '-'),
  );
  const isTitleTransitioning = computed(
    () =>
      transitionState.value.active &&
      transitionState.value.key === mediaTransitionKey.value,
  );

  let viewportPrefetchObserver: IntersectionObserver | null = null;

  onMounted(() => {
    const element = cardElement.value;

    if (!element || !('IntersectionObserver' in window)) {
      return;
    }

    viewportPrefetchObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        prefetchCaseStudyFromViewport(
          caseStudySlug.value,
          props.caseStudy.featuredMedia,
        );
        viewportPrefetchObserver?.disconnect();
        viewportPrefetchObserver = null;
      },
      {
        rootMargin: '800px 0px',
        threshold: 0.01,
      },
    );

    viewportPrefetchObserver.observe(element);
  });

  onBeforeUnmount(() => {
    viewportPrefetchObserver?.disconnect();
    viewportPrefetchObserver = null;
  });

  function prefetchCaseStudyDetail() {
    prefetchCaseStudy(caseStudySlug.value, props.caseStudy.featuredMedia);
  }

  async function navigateToCaseStudy(event: MouseEvent) {
    prefetchCaseStudyDetail();
    await navigateWithFeaturedMediaTransition(
      event,
      caseStudyUrl.value,
      mediaTransitionKey.value,
      props.caseStudy.featuredMedia,
    );
  }
</script>

<template>
  <article ref="cardElement" class="case-study-card" data-transition-source>
    <NuxtLink v-slot="{ href }" :to="caseStudyUrl" custom>
      <a
        :href="href"
        class="link-box"
        :data-featured-slip-source="mediaTransitionKey"
        @focus="prefetchCaseStudyDetail"
        @pointerdown="prefetchCaseStudyDetail"
        @pointerenter="prefetchCaseStudyDetail"
        @click="navigateToCaseStudy"
      >
        <div class="label-stack">
          <h3 class="title" :data-featured-title-source="mediaTransitionKey">
            <span
              class="title-label"
              :class="{ 'is-transition-hidden': isTitleTransitioning }"
            >
              {{ caseStudy.title }}
            </span>
          </h3>

          <p v-if="caseStudy.excerpt" class="subheading">
            {{ caseStudy.excerpt }}
          </p>
        </div>
      </a>
    </NuxtLink>

    <div class="card-halftone-box is-halftone-separate-k">
      <div class="card-halftone">
        <FeaturedMediaFrame
          class="media-frame"
          :media="caseStudy.featuredMedia"
          label="Case Study"
          :transition-key="mediaTransitionKey"
          transition-role="source"
          transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
          sizes="(max-width: 900px) 100vw, 50vw"
        />
        <div class="card-ink" aria-hidden="true" />
      </div>
      <div
        v-if="caseStudy.featuredMedia?.sourceUrl"
        class="card-k-layer"
        aria-hidden="true"
      >
        <img
          class="card-k-image"
          :src="caseStudy.featuredMedia.sourceUrl"
          alt=""
          loading="lazy"
        />
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
  .case-study-card {
    width: 100%;
    position: relative;
    min-height: clamp(320px, 46vh, 560px);
    overflow: hidden;
    z-index: 1;
    padding: 0;
    display: flex;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    margin-bottom: 0;
    align-items: flex-end;
    background: var(--color-ink);
  }

  // Title sits directly on the halftoned image — no slip panel. The
  // data-featured-slip-source attribute on this element is kept so the
  // featured-media transition can read geometry; visually there's no panel.
  .link-box {
    position: absolute;
    bottom: var(--space-6);
    left: var(--space-6);
    z-index: 4;
    max-width: min(54rem, calc(100% - var(--space-7)));
    padding: var(--space-4) var(--space-5) var(--space-5);
    color: var(--color-ink);
    text-decoration: none;
    user-select: none;
    transition: opacity 160ms ease;
  }

  .label-stack {
    position: relative;
    height: 100%;
    width: 100%;
    flex-direction: column;
    z-index: 4;
  }

  .title {
    position: relative;
    color: var(--color-ink);
    text-align: left;
    font-size: clamp(1.35rem, 2.5vw, 2.25rem);
    max-width: 38rem;
    padding: 0;
    z-index: 4;
    user-select: none;
    text-decoration: none;
    line-height: 1.05;
    text-wrap: balance;
  }

  .title-label {
    padding: 0;
    font-family: var(--font-mono);
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .subheading {
    margin-top: var(--space-3);
    margin-left: 0;
    margin-right: 0;
    line-height: 1.4;
  }

  // Halftone treatment wraps the FeaturedMediaFrame inside the card. The
  // .card-halftone-box is absolute-inset positioned to fill the card area;
  // .card-halftone is the main pane, .card-k-layer is the K pane sibling.
  // See packages/styles/shared-components/_halftone-image.scss for defaults
  // and override knobs.
  .card-halftone-box {
    position: absolute;
    inset: 0;
    @include halftone-image-box;
  }

  .card-halftone {
    width: 100%;
    height: 100%;
    @include halftone-image-pane;
  }

  .media-frame {
    width: 100%;
    height: 100%;
    overflow: hidden;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }

  .card-ink {
    @include halftone-image-ink;
  }

  .card-halftone-box.is-halftone-separate-k {
    :deep(.image) {
      @include halftone-image-media-hues;
    }

    .card-ink {
      @include halftone-image-ink-separate-k-override;
    }
  }

  .card-k-layer {
    @include halftone-image-k-pane;
  }

  .card-k-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    @include halftone-image-k-media;
  }

  .card-k-layer::after {
    @include halftone-image-k-ink;
  }

  .case-study-card :deep(.image),
  .case-study-card :deep(.placeholder) {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    object-fit: cover;
    transform: translate(0, 0);
    transition:
      transform var(--motion-slow) var(--motion-snappy),
      filter var(--motion-slow) var(--motion-snappy);
  }

  @media (prefers-reduced-motion: reduce) {
    .title-label,
    .subheading span,
    .case-study-card :deep(.image) {
      transition: none;
    }
  }
</style>
