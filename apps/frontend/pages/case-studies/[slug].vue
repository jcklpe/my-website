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
        transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
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

    <!-- Record header — hardcoded for Phase 5 visual QA; replace with CMS fields when available -->
    <section class="record-header">
      <aside class="record-rail">
        <span class="record-type">Case Study</span>
      </aside>
      <div class="record-body">
        <p class="record-framing">
          Auditing and restructuring a federal health portal's navigation to
          reduce task failure for over two million monthly users.
        </p>
        <ul class="record-impact">
          <li>
            <span class="impact-value">34%</span>
            <span class="impact-label">fewer navigation errors in testing</span>
          </li>
          <li>
            <span class="impact-value">~2M</span>
            <span class="impact-label">citizens affected monthly</span>
          </li>
        </ul>
      </div>
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
    background: var(--color-panel-muted);
  }

  .hero {
    position: relative;
    z-index: 1;
    margin-bottom: 0;
    overflow: hidden;
  }

  .hero::after {
    content: none;
  }

  .hero-corners {
    position: absolute;
    inset: var(--space-4);
    z-index: 3;
    pointer-events: none;
  }

  .corner {
    position: absolute;
    width: 20px;
    height: 20px;
    border-color: var(--color-blueprint);
    border-style: solid;
    border-width: 0;
  }

  .corner-tl {
    top: 0;
    left: 0;
    border-top-width: 2px;
    border-left-width: 2px;
  }

  .corner-tr {
    top: 0;
    right: 0;
    border-top-width: 2px;
    border-right-width: 2px;
  }

  .corner-bl {
    bottom: 0;
    left: 0;
    border-bottom-width: 2px;
    border-left-width: 2px;
  }

  .corner-br {
    bottom: 0;
    right: 0;
    border-bottom-width: 2px;
    border-right-width: 2px;
  }

  .hero-corners {
    position: absolute;
    inset: var(--space-4);
    z-index: 3;
    pointer-events: none;
  }

  .corner {
    position: absolute;
    width: 20px;
    height: 20px;
    border-color: var(--color-blueprint);
    border-style: solid;
    border-width: 0;
  }

  .corner-tl {
    top: 0;
    left: 0;
    border-top-width: 2px;
    border-left-width: 2px;
  }

  .corner-tr {
    top: 0;
    right: 0;
    border-top-width: 2px;
    border-right-width: 2px;
  }

  .corner-bl {
    bottom: 0;
    left: 0;
    border-bottom-width: 2px;
    border-left-width: 2px;
  }

  .corner-br {
    bottom: 0;
    right: 0;
    border-bottom-width: 2px;
    border-right-width: 2px;
  }

  // Transition state (3) — landing target slip panel.
  // See shared-components/_featured-media-overlay.scss for the three-state system.
  .header {
    position: absolute;
    left: var(--space-6);
    bottom: var(--space-7);
    z-index: 2;
    max-width: min(54rem, calc(100% - var(--space-7)));
    padding: var(--space-4) var(--space-5) var(--space-5);
    @include slip-surface;
  }

  .title {
    max-width: 38rem;
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: clamp(1.75rem, 3.5vw, 3.25rem);
    line-height: 1.1;
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
    display: block;
    width: 100%;
    height: min(72vh, 44rem);
    aspect-ratio: auto;
    margin: 0;
    overflow: hidden;
  }

  .hero-media :deep(.image) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .record-header {
    position: relative;
    z-index: 2;
    background: var(--color-panel-muted);
    border-bottom: var(--border-default);
    padding: var(--space-7) var(--space-6) var(--space-6);
    animation: detail-content-rise var(--motion-route-transition-duration)
      var(--motion-snappy) var(--motion-route-content-delay) both;
  }

  .record-rail {
    display: none;
  }

  .record-type {
    color: var(--color-blueprint);
    font-family: var(--type-label-family);
    font-size: var(--type-label-size);
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .record-framing {
    max-width: 40rem;
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-style: italic;
    font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
    line-height: 1.5;
  }

  .record-impact {
    list-style: none;
    padding: 0;
    margin: var(--space-4) 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3) var(--space-6);
  }

  .record-impact li {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .impact-value {
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .impact-label {
    color: var(--color-ink-muted);
    font-family: var(--type-label-family);
    font-size: var(--type-label-size);
    font-weight: var(--type-label-weight);
    letter-spacing: var(--type-label-tracking);
    text-transform: uppercase;
    margin-top: 0.25em;
  }

  @include breakpoint(tablet) {
    .record-header {
      display: flex;
      gap: var(--space-7);
      align-items: start;
      padding-inline: var(--space-8);
    }

    .record-rail {
      display: flex;
      flex: 0 0 7rem;
      align-items: flex-start;
      padding-top: 0.35rem;
      border-right: 1px solid var(--color-line);
      padding-right: var(--space-4);
    }
  }

  .content {
    position: relative;
    z-index: 2;
    width: 100%;
    background: var(--color-panel-muted);
    padding-top: var(--space-5);
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
    background: var(--color-panel-muted);
  }

  .meta {
    color: var(--color-muted);
  }

  @keyframes detail-content-rise {
    from {
      transform: translateY(46vh);
    }

    to {
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .record-header,
    .content {
      animation: none;
    }
  }
</style>
