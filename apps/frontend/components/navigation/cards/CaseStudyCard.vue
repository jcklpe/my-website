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
    <FeaturedMediaFrame
      class="media-frame"
      :media="caseStudy.featuredMedia"
      label="Case Study"
      :transition-key="mediaTransitionKey"
      transition-role="source"
      transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
      sizes="(max-width: 900px) 100vw, 50vw"
    />

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
        <div class="panel-tag" aria-hidden="true">
          <span class="panel-label">Case Study</span>
          <span class="panel-marker">+</span>
        </div>

        <div class="panel-body">
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

        <div class="panel-cta" aria-hidden="true">→ View</div>
      </a>
    </NuxtLink>
  </article>
</template>

<style lang="scss" scoped>
  .case-study-card {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(240px, 380px);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    height: clamp(200px, 30vh, 400px);
    overflow: hidden;
  }

  .media-frame {
    aspect-ratio: unset;
    height: 100%;
    overflow: hidden;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }

  // Transition state (1) — source/resting slip panel.
  // See shared-components/_featured-media-overlay.scss for the three-state system.
  .link-box {
    display: flex;
    flex-direction: column;
    @include slip-surface;
    color: var(--color-surface);
    text-decoration: none;
    user-select: none;
  }

  .panel-tag {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) var(--space-4);
    background: rgba(0, 0, 0, 0.22);
    border-bottom: 1px solid rgba(245, 241, 230, 0.18);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .panel-marker {
    opacity: 0.5;
    font-weight: 400;
  }

  .panel-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: var(--space-5) var(--space-4);
    border-bottom: 1px solid rgba(245, 241, 230, 0.18);
  }

  .title {
    color: var(--color-surface);
    font-size: clamp(1.35rem, 2vw, 2rem);
    user-select: none;
    line-height: 1.05;
    @include slip-title;
  }

  .title-label {
    font-family: var(--font-mono);
    font-style: normal;
    font-weight: 600;
    letter-spacing: -0.04em;
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .subheading {
    margin-top: var(--space-3);
    line-height: 1.5;
    color: rgba(245, 241, 230, 0.78);
    font-size: var(--type-base);
  }

  .panel-cta {
    padding: var(--space-3) var(--space-4);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 600;
    letter-spacing: 0.08em;
    flex-shrink: 0;
  }

  .case-study-card :deep(.image),
  .case-study-card :deep(.placeholder) {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    object-fit: cover;
    transform: scale(1.01);
    transition:
      transform var(--motion-slow) var(--motion-snappy),
      filter var(--motion-slow) var(--motion-snappy);
  }

  @include breakpoint(phone) {
    .case-study-card {
      grid-template-columns: 1fr;
      min-height: unset;
    }

    .media-frame {
      aspect-ratio: 16 / 9;
      height: auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .case-study-card :deep(.image) {
      transition: none;
    }
  }
</style>
