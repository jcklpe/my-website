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
    z-index: 1;
    margin-bottom: 0;
    overflow: hidden;
  }

  .hero::after {
    content: none;
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
    font-family: var(--font-condensed);
    font-weight: 700;
    font-size: clamp(1.75rem, 3.5vw, 3.25rem);
    line-height: 1.05;
    letter-spacing: 0.01em;
    text-transform: uppercase;
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

  .content {
    position: relative;
    z-index: 2;
    width: 100%;
    background: var(--color-reading);
    color: var(--color-ink-on-reading);
    padding-top: var(--space-5);
    animation: detail-content-rise var(--motion-route-transition-duration)
      var(--motion-snappy) var(--motion-route-content-delay) both;

    // Re-map ink scale for the light reading surface so all shared-component
    // recipes (headings, borders, captions) use dark values instead of the
    // global dark-surface near-white.
    --color-ink: var(--color-ink-on-reading);
    --color-ink-90: rgba(12, 17, 43, 0.9);
    --color-ink-80: rgba(12, 17, 43, 0.8);
    --color-ink-30: rgba(12, 17, 43, 0.3);
    --color-ink-08: rgba(12, 17, 43, 0.08);
    --color-ink-04: rgba(12, 17, 43, 0.04);
    --color-muted: var(--color-muted-on-reading);
    // Direct overrides for type tokens — needed because var() chains in custom
    // properties resolve at :root scope, so overriding --color-ink-90 alone
    // does not update the already-inherited --type-body-color value.
    --type-body-color: rgba(12, 17, 43, 0.9);
    --type-heading-color: var(--color-ink-on-reading);
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
    color: var(--color-ink-on-reading);
    background: var(--color-reading);
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
    .content {
      animation: none;
    }
  }
</style>
