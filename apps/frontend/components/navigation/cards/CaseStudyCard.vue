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
            <span>{{ caseStudy.excerpt }}</span>
          </p>
        </div>
      </a>
    </NuxtLink>

    <FeaturedMediaFrame
      class="media-frame"
      :media="caseStudy.featuredMedia"
      label="Case Study"
      :transition-key="mediaTransitionKey"
      transition-role="source"
      transition-clip-path="polygon(0 0, 100% 5vw, 100% 100%, 0 100%)"
      sizes="(max-width: 900px) 100vw, 50vw"
    />
  </article>
</template>

<style lang="scss" scoped>
  .case-study-card {
    width: 100%;
    position: relative;
    min-height: 86vh;
    overflow: hidden;
    z-index: 2;
    padding: 0;
    display: flex;
    clip-path: polygon(0 0, 100% 5vw, 100% 100%, 0 100%);
    margin-bottom: -5vw;
    align-items: center;
    background: var(--color-primary-heavy);
  }

  .case-study-card::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    background: linear-gradient(180deg, transparent 25%, rgba(0, 0, 0, 0.42));
    box-shadow: rgba(0, 0, 0, 0.85) 1px 7vw 100px inset;
  }

  // Transition state (1) — source/resting slip panel.
  // See shared-components/_featured-media-overlay.scss for the three-state system.
  .link-box {
    position: relative;
    top: -4vh;
    left: var(--space-6);
    z-index: 4;
    display: block;
    width: min(72rem, calc(100% - var(--space-8)));
    max-width: min(72rem, calc(100% - var(--space-8)));
    padding: var(--space-6) var(--space-5);
    color: var(--color-surface);
    text-decoration: none;
    user-select: none;
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
    color: var(--color-surface);
    text-align: left;
    font-size: clamp(3rem, 8vw, 7rem);
    max-width: min(12ch, 90vw);
    padding: 0;
    z-index: 4;
    user-select: none;
    text-decoration: none;
    line-height: 1.05;
    @include slip-title;
  }

  .title-label {
    display: inline;
    padding: 0.02em 0.12em 0.12em;
    background: var(--color-black);
    box-shadow: var(--shadow-label);
    color: var(--color-surface);
    font-family: var(--font-display);
    font-weight: 400;
    transition: box-shadow 300ms var(--motion-snappy);
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .subheading {
    margin: var(--space-6) 0 0 var(--space-6);
    color: var(--color-surface);
    font-family: var(--font-lite);
    font-size: clamp(1.25rem, 2.5vw, 2rem);
    line-height: 1.5;
  }

  .subheading span {
    display: inline;
    padding: 0.25em 0.55em;
    background: var(--color-black);
    box-shadow:
      -0.5em 0 0 var(--color-black),
      3em 0 0 var(--color-black),
      5px 14px 10px rgba(0, 0, 0, 0.15),
      12px 24px 2px rgba(0, 0, 0, 0.1),
      18px 34px 30px rgba(0, 0, 0, 0.1);
    transition: box-shadow 300ms var(--motion-snappy);
  }

  .media-frame {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    clip-path: inherit;
  }

  .case-study-card :deep(.image),
  .case-study-card :deep(.placeholder) {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    object-fit: cover;
    transform: translate(-100px, 0) scale(1.08);
    filter: blur(2.5px) saturate(0.96) contrast(1.04);
    transition:
      transform var(--motion-slow) var(--motion-snappy),
      filter var(--motion-slow) var(--motion-snappy);
  }

  .case-study-card:hover .title-label,
  .case-study-card:focus-within .title-label {
    box-shadow: var(--shadow-label-hover);
  }

  .case-study-card:hover .subheading span,
  .case-study-card:focus-within .subheading span {
    box-shadow:
      -5em 0 0 var(--color-black),
      1em 0 0 var(--color-black);
  }

  .case-study-card:hover :deep(.image),
  .case-study-card:focus-within :deep(.image) {
    transform: translate(0, 0) scale(1.02);
    filter: blur(0) saturate(1.08) contrast(1.05);
  }

  @include breakpoint(phone) {
    .case-study-card {
      min-height: 64vh;
    }

    .link-box {
      top: 0;
      left: var(--space-4);
      max-width: calc(100% - var(--space-6));
      padding: var(--space-5) 0;
    }

    .title {
      font-size: 3rem;
    }

    .subheading {
      margin-left: var(--space-4);
      font-size: 1.15rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .title-label,
    .subheading span,
    .case-study-card :deep(.image) {
      transition: none;
    }

    .case-study-card:hover :deep(.image),
    .case-study-card:focus-within :deep(.image) {
      transform: translate(-100px, 0) scale(1.08);
    }
  }
</style>
