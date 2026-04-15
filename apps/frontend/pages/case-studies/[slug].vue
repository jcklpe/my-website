<script setup lang="ts">
import type { WordPressCaseStudy } from '~/types/wordpress'

const route = useRoute()
const slug = computed(() => String(route.params.slug))

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
)

const isLoading = computed(() => status.value === 'idle' || status.value === 'pending')

function scrollToPageTop() {
  if (import.meta.client) {
    window.scrollTo({ left: 0, top: 0 })
  }
}

onMounted(scrollToPageTop)
watch(slug, () => nextTick(scrollToPageTop))

useSeoMeta({
  title: () => caseStudy.value?.title ?? 'Case Study',
  description: () => caseStudy.value?.excerpt ?? '',
})
</script>

<template>
  <div class="route-transition-boundary">
    <article v-if="caseStudy" class="case-study-page">
      <section class="case-study-page__hero">
        <figure
          v-if="caseStudy.featuredMedia?.sourceUrl"
          class="case-study-page__hero-media"
          :data-shared-media-key="`case-study:${caseStudy.slug}`"
        >
          <img
            :src="caseStudy.featuredMedia.sourceUrl"
            :alt="caseStudy.featuredMedia.altText || ''"
          >
        </figure>

        <header class="case-study-page__header">
          <h1>{{ caseStudy.title }}</h1>
          <p v-if="caseStudy.excerpt" class="case-study-page__excerpt">
            {{ caseStudy.excerpt }}
          </p>
        </header>
      </section>

      <BlockRenderer class="case-study-page__content" :blocks="caseStudy.blocks ?? []" />
    </article>

    <section v-else class="case-study-page-state" aria-live="polite">
      <p class="case-study-page-state__meta">
        {{ isLoading ? 'Loading' : error ? 'Error' : 'Not Found' }}
      </p>
      <h1>
        {{ isLoading ? 'Loading case study...' : error ? 'Unable to load case study.' : 'Case study not found.' }}
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
  </div>
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
  display: grid;
  align-items: end;
  min-height: min(72vh, 44rem);
  margin-bottom: calc(var(--space-8) + var(--space-7));
  isolation: isolate;
  background:
    linear-gradient(135deg, rgba(38, 87, 235, 0.95), rgba(7, 11, 31, 0.98)),
    var(--color-primary);
}

.case-study-page__hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(7, 11, 31, 0.08), rgba(7, 11, 31, 0.64));
  pointer-events: none;
}

.case-study-page__header {
  position: relative;
  z-index: 2;
  width: min(72rem, calc(100% - var(--space-6)));
  margin-bottom: calc(var(--space-7) * -1);
  margin-inline: auto;
  padding: var(--space-6);
  background: var(--color-paper-warm);
}

.case-study-page__excerpt {
  max-width: 42rem;
  margin-top: var(--space-4);
  color: var(--color-ink-80);
  font-size: 1.125rem;
}

.case-study-page__hero-media {
  position: absolute;
  inset: 0;
  margin: 0;
  overflow: hidden;
}

.case-study-page__hero-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.case-study-page__content {
  width: 100%;
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
</style>
