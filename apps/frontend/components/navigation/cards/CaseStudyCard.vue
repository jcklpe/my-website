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
        @focus="prefetchCaseStudyDetail"
        @pointerdown="prefetchCaseStudyDetail"
        @pointerenter="prefetchCaseStudyDetail"
        @click="navigateToCaseStudy"
      >
        <div class="label-stack" :data-featured-slip-source="mediaTransitionKey">
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

        <FeaturedMediaFrame
          class="media-frame"
          :media="caseStudy.featuredMedia"
          label="Case Study"
          :transition-key="mediaTransitionKey"
          transition-role="source"
          transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
          sizes="(max-width: 900px) 100vw, 70vw"
        />
      </a>
    </NuxtLink>
  </article>
</template>

<style lang="scss" scoped>
  .case-study-card {
    width: 100%;
    position: relative;
    min-height: 0;
    overflow: visible;
    z-index: 1;
    padding-top: 200px;
    display: flex;
    flex-direction: column;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    margin-bottom: 0;
    align-items: stretch;
    background: transparent;
  }

  // Transition state (1) — source/resting slip panel.
  // See shared-components/_featured-media-overlay.scss for the three-state system.
  .link-box {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    max-width: none;
    padding: 0;
    background: transparent;
    border: 0;
    color: var(--color-ink);
    text-decoration: none;
    user-select: none;
  }

  .label-stack {
    position: relative;
    z-index: 4;
    width: fit-content;
    max-width: min(42rem, 90%);
    flex-direction: column;
    padding: 25px 25px 0;
    transition: transform 1.3s var(--motion-snappy);
  }

  .title {
    position: relative;
    margin: 0;
    color: var(--color-ink);
    text-align: left;
    font-size: 4rem;
    max-width: 38rem;
    padding: 0;
    z-index: 4;
    user-select: none;
    text-decoration: none;
    line-height: 1.02;
    @include slip-title;
  }

  .title-label {
    padding: 0;
    font-family: var(--font-mono);
    font-weight: 700;
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .subheading {
    margin-top: var(--space-3);
    margin-left: 0;
    margin-right: 0;
    max-width: 36rem;
    color: var(--color-ink-80);
    line-height: 1.4;
  }

  .media-frame {
    box-sizing: border-box;
    width: 100%;
    height: auto;
    min-height: 18rem;
    max-height: 100vh;
    overflow: hidden;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    transition: transform 1.5s var(--motion-snappy);
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

  @include breakpoint(phone) {
    .case-study-card {
      padding-top: var(--space-7);
    }

    .label-stack {
      max-width: 100%;
      padding-left: 2vw;
      padding-right: var(--space-4);
    }

    .title {
      font-size: 2rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .label-stack,
    .media-frame,
    .title-label,
    .subheading span,
    .case-study-card :deep(.image) {
      transition: none;
    }
  }
</style>
