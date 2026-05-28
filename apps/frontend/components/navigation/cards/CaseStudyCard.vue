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
        <p class="type-label">Case Study</p>

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

        <FeaturedMediaFrame
          class="media-frame"
          :media="caseStudy.featuredMedia"
          label="Case Study"
          :transition-key="mediaTransitionKey"
          transition-role="source"
          transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
          sizes="(max-width: 900px) 100vw, 28vw"
        />

        <span class="action">Open case study</span>
      </a>
    </NuxtLink>
  </article>
</template>

<style lang="scss" scoped>
  .case-study-card {
    width: 100%;
    position: relative;
    overflow: visible;
    z-index: 1;
    padding: 0;
    display: block;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    margin-bottom: 0;
    color: var(--color-surface);
  }

  // Transition state (1) — source/resting slip panel.
  // See shared-components/_featured-media-overlay.scss for the three-state system.
  .link-box {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) minmax(9rem, 18rem) auto;
    gap: var(--space-4);
    align-items: end;
    min-height: 10rem;
    padding: var(--space-4);
    border: 2px solid var(--color-surface-softer);
    border-radius: 0.75rem;
    color: var(--color-surface);
    text-decoration: none;
    user-select: none;
    transition:
      border-color 180ms var(--motion-snappy),
      transform 180ms var(--motion-snappy);
  }

  .link-box:hover,
  .link-box:focus-visible {
    border-color: var(--color-surface);
    transform: translateX(0.75rem);
  }

  .type-label {
    align-self: start;
    margin: 0;
    color: var(--color-surface-softer);
    font-size: var(--type-small);
    text-transform: uppercase;
  }

  .label-stack {
    position: relative;
    width: 100%;
    z-index: 4;
  }

  .title {
    position: relative;
    color: var(--color-surface);
    text-align: left;
    font-size: clamp(3rem, 7vw, 6.2rem);
    max-width: none;
    padding: 0;
    z-index: 4;
    user-select: none;
    text-decoration: none;
    line-height: 0.86;
    @include slip-title;
  }

  .title-label {
    padding: 0;
    font-family: var(--font-serif);
    font-weight: 400;
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .subheading {
    max-width: 42ch;
    margin-top: var(--space-2);
    margin-left: 0;
    margin-right: 0;
    color: var(--color-surface-softer);
    line-height: 1.35;
  }

  .media-frame {
    position: relative;
    z-index: 2;
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border: 2px solid var(--color-surface);
    border-radius: 0.55rem;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    background: var(--color-surface);
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

  .action {
    align-self: end;
    justify-self: end;
    max-width: 16ch;
    color: var(--color-surface-softer);
    font-size: var(--type-small);
    font-weight: 700;
    line-height: 1.1;
    text-align: right;
    text-transform: uppercase;
    text-wrap: balance;
  }

  .link-box:hover .action,
  .link-box:focus-visible .action {
    color: var(--color-surface);
    text-decoration: underline;
  }

  @media (max-width: 900px) {
    .link-box {
      grid-template-columns: 1fr;
      transform: none;
    }

    .link-box:hover,
    .link-box:focus-visible {
      transform: none;
    }

    .type-label,
    .action {
      justify-self: start;
      text-align: left;
    }

    .media-frame {
      max-width: 18rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .title-label,
    .subheading span,
    .case-study-card :deep(.image),
    .link-box {
      transition: none;
    }

    .link-box:hover,
    .link-box:focus-visible {
      transform: none;
    }
  }
</style>
