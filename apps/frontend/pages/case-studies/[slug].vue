<script setup lang="ts">
  import type { WordPressCaseStudy } from '~/types/wordpress';

  const route = useRoute();
  const slug = computed(() => String(route.params.slug));

  const {
    data: caseStudy,
    error,
    status,
  } = await useAsyncData<WordPressCaseStudy | null>(
    () => `case-study:${slug.value}`,
    () => queryWordPressCaseStudyBySlug(slug.value),
    {
      dedupe: 'cancel',
      watch: [slug],
    },
  );

  const { data: caseStudyNavigationItems } = await useAsyncData(
    () => `case-study-navigation:${slug.value}`,
    () => queryWordPressCaseStudies(100),
    {
      dedupe: 'cancel',
      watch: [slug],
    },
  );

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

  useSeoMeta({
    title: () => caseStudy.value?.title ?? 'Case Study',
    description: () => caseStudy.value?.excerpt ?? '',
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
      />

      <header class="header">
        <h1 class="title" :data-featured-title-target="mediaTransitionKey">
          <span
            :class="{
              'is-transition-hidden': isTitleTransitioning,
            }"
          >
            {{ caseStudy.title }}
          </span>
        </h1>
      </header>
    </section>

    <BlockRenderer class="content" :blocks="caseStudy.blocks ?? []" />

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
    background: var(--color-paper-warm);
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

  .header {
    position: absolute;
    right: 0;
    bottom: 200px;
    left: 0;
    z-index: 2;
    width: min(72rem, calc(100% - var(--space-6)));
    margin-inline: auto;
    padding: var(--space-6) var(--space-6) var(--space-8);
  }

  .title {
    max-width: min(76rem, 90vw);
    color: white;
    font-family: var(--font-serif);
    font-size: clamp(2.4rem, 6vw, 7rem);
    line-height: 1.6;
    letter-spacing: -0.03em;
    text-wrap: balance;
    text-shadow: 0 2px 2px rgba(0, 0, 0, 0.35);
  }

  .title span {
    display: inline;
    padding: 0.12em 0.22em 0.18em;
    background-color: var(--color-ink);
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .is-transition-hidden {
    opacity: 0;
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
    background: var(--color-paper-warm);
    padding-top: var(--space-5);
    animation: detail-content-rise var(--motion-route-transition-duration)
      var(--motion-snappy) var(--motion-route-content-delay) both;
  }

  .case-study-page-state {
    max-width: 44rem;
    min-height: 55vh;
    padding: var(--space-8) 0 var(--space-9);
    color: var(--color-ink);
    background: var(--color-paper-warm);
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
