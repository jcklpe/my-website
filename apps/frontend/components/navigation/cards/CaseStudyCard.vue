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
    background: var(--color-night);
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .case-study-card::before,
  .case-study-card::after {
    position: absolute;
    z-index: 3;
    content: '';
    pointer-events: none;
  }

  .case-study-card::before {
    top: var(--space-5);
    right: var(--space-5);
    width: 4rem;
    height: 4rem;
    border-top: 1px solid rgba(255, 255, 255, 0.56);
    border-right: 1px solid rgba(255, 255, 255, 0.56);
  }

  .case-study-card::after {
    right: var(--space-5);
    bottom: var(--space-5);
    left: var(--space-5);
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--color-gold),
      transparent
    );
    opacity: 0.7;
  }

  // Transition state (1) — source/resting slip panel.
  // See shared-components/_featured-media-overlay.scss for the three-state system.
  .link-box {
    position: absolute;
    bottom: var(--space-6);
    left: var(--space-6);
    z-index: 4;
    max-width: min(54rem, calc(100% - var(--space-7)));
    padding: var(--space-4) var(--space-5) var(--space-5);
    @include slip-surface;
    color: var(--color-ink);
    text-decoration: none;
    user-select: none;
    transition:
      box-shadow 220ms var(--motion-snappy),
      opacity 160ms ease,
      transform 220ms var(--motion-snappy);
  }

  .link-box:hover,
  .link-box:focus-visible {
    box-shadow:
      0 22px 56px rgba(8, 7, 18, 0.24),
      0 0 30px var(--color-coral-glow);
    transform: translateY(-0.15rem);
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
    @include slip-title;
  }

  .title-label {
    padding: 0;
    font-family: var(--font-display);
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .subheading {
    margin-top: var(--space-3);
    margin-left: 0;
    margin-right: 0;
    line-height: 1.4;
    color: var(--color-ink-80);
  }

  .media-frame {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
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

  .case-study-card:hover :deep(.image),
  .case-study-card:focus-within :deep(.image) {
    filter: saturate(1.15) contrast(1.05);
    transform: scale(1.035);
  }

  @media (prefers-reduced-motion: reduce) {
    .title-label,
    .subheading span,
    .link-box,
    .case-study-card :deep(.image) {
      transition: none;
    }

    .link-box:hover,
    .link-box:focus-visible,
    .case-study-card:hover :deep(.image),
    .case-study-card:focus-within :deep(.image) {
      transform: none;
    }
  }
</style>
