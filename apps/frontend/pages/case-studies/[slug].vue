<script setup lang="ts">
  import type { GutenbergBlock, WordPressCaseStudy } from '~/types/wordpress';

  // Transition system coupling: this page is the target of the featured-media
  // card-to-detail transition originating from CaseStudyCard.vue. The
  // FeaturedMediaFrame, data-featured-slip-target, and data-featured-title-target
  // attributes below must be preserved for the transition to function. See:
  // composables/useFeaturedMediaTransition.ts
  // components/transitions/FeaturedMediaTransitionLayer.vue
  const route = useRoute();
  const { getCaseStudyBlocks, getCaseStudyShell } = useContentDetailPrefetch();
  const { prefetchHomeSurface } = useHomeSurfacePrefetch();
  const slug = computed(() => String(route.params.slug));
  const loopNavSentinel = ref<HTMLElement | null>(null);

  let loopNavObserver: IntersectionObserver | null = null;

  onMounted(() => {
    window.setTimeout(() => {
      prefetchHomeSurface();
    }, 500);

    const sentinel = loopNavSentinel.value;

    if (!sentinel || !('IntersectionObserver' in window)) {
      loadCaseStudyNavigation();
      return;
    }

    loopNavObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        loadCaseStudyNavigation();
        loopNavObserver?.disconnect();
        loopNavObserver = null;
      },
      {
        rootMargin: '900px 0px',
      },
    );

    loopNavObserver.observe(sentinel);
  });

  onBeforeUnmount(() => {
    loopNavObserver?.disconnect();
    loopNavObserver = null;
  });

  const {
    data: caseStudy,
    error,
    status,
  } = await useAsyncData<WordPressCaseStudy | null>(
    () => `case-study-shell:${slug.value}`,
    () => getCaseStudyShell(slug.value),
    {
      dedupe: 'cancel',
      watch: [slug],
    },
  );

  const { data: caseStudyBodyBlocks, error: caseStudyBodyError } =
    useLazyAsyncData<GutenbergBlock[]>(
      () => `case-study-body:${slug.value}`,
      async () => (await getCaseStudyBlocks(slug.value)) ?? [],
      {
        dedupe: 'cancel',
        default: () => [],
        watch: [slug],
      },
    );

  const {
    data: caseStudyNavigationItems,
    execute: loadCaseStudyNavigationItems,
    status: caseStudyNavigationStatus,
  } = useLazyAsyncData(
    'case-study-navigation',
    () => queryWordPressCaseStudies(100),
    {
      dedupe: 'cancel',
      default: () => [],
      immediate: false,
      server: false,
    },
  );

  function loadCaseStudyNavigation() {
    if (
      caseStudyNavigationStatus.value === 'pending' ||
      caseStudyNavigationStatus.value === 'success'
    ) {
      return;
    }

    void loadCaseStudyNavigationItems();
  }

  const caseStudyLoopNav = computed(() => {
    const caseStudies = caseStudyNavigationItems.value ?? [];

    if (!caseStudy.value || caseStudies.length < 2) {
      return null;
    }

    const currentIndex = caseStudies.findIndex(
      (navigationCaseStudy) =>
        navigationCaseStudy.slug === caseStudy.value?.slug,
    );

    if (currentIndex < 0) {
      return null;
    }

    const previousIndex =
      (currentIndex - 1 + caseStudies.length) % caseStudies.length;
    const nextIndex = (currentIndex + 1) % caseStudies.length;
    const previous = caseStudies[previousIndex];
    const next = caseStudies[nextIndex];

    if (!previous || !next) {
      return null;
    }

    return { previous, next };
  });

  const isLoading = computed(
    () => status.value === 'idle' || status.value === 'pending',
  );
  const caseStudyBlocks = computed(() => caseStudyBodyBlocks.value ?? []);

  useSiteSeoMeta({
    title: () => caseStudy.value?.title ?? 'Case Study',
    description: () => caseStudy.value?.excerpt ?? '',
    type: 'article',
    image: () => caseStudy.value?.featuredMedia?.sourceUrl,
    imageAlt: () => caseStudy.value?.featuredMedia?.altText,
  });

  const mediaTransitionKey = computed(() =>
    `case-study-${slug.value}`.replace(/[^a-zA-Z0-9_-]/g, '-'),
  );
  const transitionState = useFeaturedMediaTransitionState();
  const isTitleTransitioning = computed(
    () =>
      transitionState.value.active &&
      transitionState.value.key === mediaTransitionKey.value,
  );
</script>

<template>
  <article v-if="caseStudy" class="case-study-page">
    <section class="hero">
      <FeaturedMediaFrame
        v-if="caseStudy.featuredMedia?.sourceUrl"
        class="hero-media"
        :media="caseStudy.featuredMedia"
        label="Case Study"
        :transition-key="mediaTransitionKey"
        transition-role="target"
        transition-clip-path="inset(0 round 48% 48% 0 0)"
        loading="eager"
        fetch-priority="high"
        sizes="100vw"
      />

      <header
        class="header"
        :class="{ 'is-transition-hidden': isTitleTransitioning }"
        :data-featured-slip-target="mediaTransitionKey"
      >
        <h1 class="title" :data-featured-title-target="mediaTransitionKey">
          <span>
            {{ caseStudy.title }}
          </span>
        </h1>
      </header>
    </section>

    <BlockRenderer class="content" :blocks="caseStudyBlocks" />

    <section v-if="caseStudyBodyError" class="body-state" aria-live="polite">
      <p class="meta">Error</p>
      <h2>Unable to load case-study body.</h2>
      <p class="excerpt">
        The CMS request for this case study's blocks failed. Try refreshing, or
        check whether WordPress is running.
      </p>
    </section>

    <div ref="loopNavSentinel" class="loop-nav-sentinel" aria-hidden="true" />

    <CaseStudyLoopNav
      v-if="caseStudyLoopNav"
      :previous="caseStudyLoopNav.previous"
      :next="caseStudyLoopNav.next"
    />
  </article>

  <section v-else class="case-study-page-state" aria-live="polite">
    <p class="meta">
      {{ isLoading ? 'Loading' : error ? 'Error' : 'Not Found' }}
    </p>
    <h1>
      {{
        isLoading
          ? 'Loading case study...'
          : error
            ? 'Unable to load case study.'
            : 'Case study not found.'
      }}
    </h1>
    <p class="excerpt">
      {{
        isLoading
          ? 'Fetching this case study from WordPress.'
          : error
            ? 'The CMS request failed. Try refreshing, or check whether WordPress is running.'
            : `No case study exists for "${slug}".`
      }}
    </p>
  </section>
</template>

<style lang="scss" scoped>
  .case-study-page {
    width: 100%;
    max-width: none;
    min-height: 55vh;
    padding: 0 0 var(--space-9);
    color: var(--color-ink);
    background: var(--color-surface);
  }

  .hero {
    position: relative;
    z-index: var(--z-lower);
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(18rem, 38rem);
    gap: var(--space-7);
    align-items: end;
    min-height: 86svh;
    padding: var(--space-8) var(--space-6);
    margin-bottom: 0;
    overflow: hidden;
  }

  .hero::before {
    content: '';
    position: absolute;
    inset: auto -8rem -14rem 35%;
    height: 36rem;
    pointer-events: none;
    background: radial-gradient(circle, rgba(215, 170, 143, 0.18), transparent 66%);
  }

  // Transition state (3) — landing target slip panel.
  // See shared-components/_featured-media-overlay.scss for the three-state system.
  .header {
    position: relative;
    grid-column: 1;
    z-index: var(--z-mid);
    max-width: min(54rem, calc(100% - var(--space-7)));
    padding: var(--space-4) var(--space-5) var(--space-5);
    @include slip-surface;
  }

  .title {
    max-width: 10ch;
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: 4.4rem;
    font-weight: 600;
    line-height: 0.9;
    @include slip-title;
  }

  .title span {
    display: inline;
  }

  .is-transition-hidden {
    opacity: 0;
    transition: none;
  }

  .hero-media {
    grid-column: 2;
    grid-row: 1;
    justify-self: stretch;
    align-self: end;
    display: block;
    width: 100%;
    height: min(70svh, 48rem);
    aspect-ratio: auto;
    margin: 0;
    overflow: hidden;
    box-shadow: var(--shadow-soft-high);
    clip-path: inset(0 round 48% 48% 0 0);
  }

  .hero-media :deep(.image) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .content {
    position: relative;
    z-index: var(--z-low);
    width: 100%;
    background: var(--color-surface-warmer);
    padding-top: var(--space-7);
    animation: detail-content-rise var(--motion-route-transition-duration)
      var(--motion-snappy) var(--motion-route-content-delay) both;
  }

  .loop-nav-sentinel {
    height: 1px;
  }

  .body-state {
    max-width: var(--article-column);
    margin: var(--space-6) auto 0;
    padding-inline: var(--article-padding-inline);
    color: var(--color-ink);
  }

  .body-state > .meta {
    color: var(--color-muted);
  }

  .case-study-page-state {
    max-width: 44rem;
    min-height: 55vh;
    padding: var(--space-8) 0 var(--space-9);
    color: var(--color-ink);
    background: var(--color-surface-warmer);
  }

  .meta {
    color: var(--color-muted);
  }

  @keyframes detail-content-rise {
    from {
      transform: translateY(14rem);
    }

    to {
      transform: translateY(0);
    }
  }

  @media (max-width: 980px) {
    .hero {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    .header,
    .hero-media {
      grid-column: 1;
    }

    .hero-media {
      grid-row: 1;
      height: 28rem;
    }

    .header {
      grid-row: 2;
      max-width: none;
    }

    .title {
      max-width: 14ch;
      font-size: 3.2rem;
    }
  }

  @include breakpoint(phone) {
    .hero {
      padding-inline: var(--space-4);
    }

    .hero-media {
      height: 24rem;
    }

    .title {
      font-size: 2.6rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .content {
      animation: none;
    }
  }
</style>
