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
    <section class="case-study-page__hero">
      <FeaturedMediaFrame
        v-if="caseStudy.featuredMedia?.sourceUrl"
        class="case-study-page__hero-media"
        :media="caseStudy.featuredMedia"
        label="Case Study"
        :transition-key="mediaTransitionKey"
        transition-role="target"
        transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
      />

      <header class="case-study-page__header">
        <h1
          class="case-study-page__title"
          :data-featured-title-target="mediaTransitionKey"
        >
          <span
            :class="{
              'case-study-page__title-text--transition-hidden':
                isTitleTransitioning,
            }"
          >
            {{ caseStudy.title }}
          </span>
        </h1>
      </header>
    </section>

    <BlockRenderer
      class="case-study-page__content"
      :blocks="caseStudy.blocks ?? []"
    />
  </article>

  <section v-else class="case-study-page-state" aria-live="polite">
    <p class="case-study-page-state__meta">
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
    <p class="case-study-page-state__excerpt">
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

.case-study-page__hero {
  position: relative;
  z-index: 1;
  margin-bottom: 0;
  overflow: hidden;
}

.case-study-page__hero::after {
  content: none;
}

.case-study-page__header {
  position: absolute;
  right: 0;
  bottom: 200px;
  left: 0;
  z-index: 2;
  width: min(72rem, calc(100% - var(--space-6)));
  margin-inline: auto;
  padding: var(--space-6) var(--space-6) var(--space-8);
}

.case-study-page__title {
  max-width: min(76rem, 90vw);
  color: white;
  font-family: var(--font-serif);
  font-size: clamp(2.4rem, 6vw, 7rem);
  line-height: 0.95;
  letter-spacing: -0.055em;
  text-shadow: 0 2px 2px rgba(0, 0, 0, 0.35);
}

.case-study-page__title span {
  background-color: black;
  box-shadow:
    3em 0 0 black,
    -0.3em 0 0 black;
}

.case-study-page__title-text--transition-hidden {
  opacity: 0;
}

.case-study-page__hero-media {
  display: block;
  width: 100%;
  height: min(72vh, 44rem);
  aspect-ratio: auto;
  margin: 0;
  overflow: hidden;
}

.case-study-page__hero-media :deep(.featured-media-frame__image) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.case-study-page__content {
  position: relative;
  z-index: 2;
  width: 100%;
  background: var(--color-paper-warm);
  padding-top: var(--space-5);
  animation:
    detail-content-rise var(--motion-route-transition-duration) var(--motion-snappy)
    var(--motion-route-content-delay) both;
}

.case-study-page-state {
  max-width: 44rem;
  min-height: 55vh;
  padding: var(--space-8) 0 var(--space-9);
  color: var(--color-ink);
  background: var(--color-paper-warm);
}

.case-study-page-state__meta {
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
  .case-study-page__content {
    animation: none;
  }
}
</style>
