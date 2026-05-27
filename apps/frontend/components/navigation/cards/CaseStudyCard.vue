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

          <span v-if="caseStudy.excerpt" class="subheading-wrap">
            <span class="subheading">{{ caseStudy.excerpt }}</span>
          </span>
        </div>
      </a>
    </NuxtLink>

    <FeaturedMediaFrame
      class="media-frame"
      :media="caseStudy.featuredMedia"
      label="Case Study"
      :transition-key="mediaTransitionKey"
      transition-role="source"
      transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
      sizes="(max-width: 900px) 100vw, 50vw"
    />
  </article>
</template>

<style lang="scss" scoped>
  .case-study-card {
    position: relative;
    width: 100%;
    min-height: 85vh;
    overflow: hidden;
    display: flex;
    // Dark inset vignette over the background image.
    box-shadow: rgba(0, 0, 0, 0.82) 1px 7vw 120px inset;
    background: var(--color-surface-warmer);
  }

  .link-box {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: var(--space-7) var(--space-6) var(--space-6);
    background: transparent;
    color: #fff;
    text-decoration: none;
    user-select: none;
  }

  .label-stack {
    position: relative;
    max-width: min(54rem, 90%);
  }

  .title {
    position: relative;
    margin: 0;
    color: #fff;
    font-family: var(--font-display);
    font-size: clamp(2.2rem, 5vmax, 5.5rem);
    font-style: normal;
    font-weight: normal;
    line-height: 1.05;
    @include slip-title;
    z-index: 4;
  }

  // Box-shadow text: extends the black background left and right across each line.
  .title-label {
    display: inline;
    background: #000;
    box-shadow:
      0.4em 0 0 #000,
      -5em 0 0 #000,
      0 3px 0 var(--color-primary),
      0 14px 10px rgba(0, 0, 0, 0.15),
      0 24px 2px rgba(0, 0, 0, 0.1),
      0 34px 30px rgba(0, 0, 0, 0.1);
    padding: 0.05em 0;
    line-height: 1.2;
    transition: box-shadow 0.5s cubic-bezier(0.84, 0.01, 0.19, 0.93);
  }

  .link-box:hover .title-label,
  .link-box:focus-visible .title-label {
    box-shadow:
      8em 0 0 #000,
      -10em 0 0 #000,
      0 3px 0 var(--color-primary),
      0 5px 0 rgba(0, 0, 0, 0.3);
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .subheading {
    display: inline;
    margin: 0;
    font-family: var(--font-sans);
    font-size: clamp(0.875rem, 1.5vw, 1.05rem);
    font-weight: 400;
    line-height: 1.4;
    background: #000;
    box-shadow:
      0.4em 0 0 #000,
      -5em 0 0 #000;
    padding: 0.15em 0;
    transition: box-shadow 0.5s cubic-bezier(0.84, 0.01, 0.19, 0.93);
  }

  .subheading-wrap {
    display: block;
    margin-top: var(--space-4);
  }

  .link-box:hover .subheading,
  .link-box:focus-visible .subheading {
    box-shadow:
      8em 0 0 #000,
      -10em 0 0 #000;
  }

  .media-frame {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    transition: transform 0.8s cubic-bezier(0.84, 0.01, 0.19, 0.93);
  }

  .case-study-card:hover .media-frame {
    transform: translateX(12px) scale(1.03);
  }

  .case-study-card :deep(.image) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    @include media-image-scale;
  }

  .case-study-card:hover :deep(.image) {
    transform: scale(1.06);
  }

  @include breakpoint(phone) {
    .case-study-card {
      min-height: 70vh;
    }

    .link-box {
      padding: var(--space-6) var(--space-5) var(--space-5);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .title-label,
    .subheading,
    .media-frame {
      transition: none;
    }

    .case-study-card:hover .media-frame {
      transform: none;
    }

    .case-study-card:hover :deep(.image) {
      transform: scale(1.01);
    }
  }
</style>
