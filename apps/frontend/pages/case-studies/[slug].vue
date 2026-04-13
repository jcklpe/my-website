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
    <article v-if="caseStudy" class="entry-page">
      <header class="entry-page__header">
        <p class="entry-page__eyebrow">Case Study</p>
        <h1>{{ caseStudy?.title }}</h1>
        <p v-if="caseStudy?.excerpt" class="entry-page__excerpt">
          {{ caseStudy.excerpt }}
        </p>
      </header>

      <figure
        v-if="caseStudy?.featuredMedia?.sourceUrl"
        class="entry-page__hero-media"
        :data-shared-media-key="`case-study:${caseStudy.slug}`"
      >
        <img
          :src="caseStudy.featuredMedia.sourceUrl"
          :alt="caseStudy.featuredMedia.altText || ''"
        >
      </figure>

      <BlockRenderer :blocks="caseStudy?.blocks ?? []" />
    </article>

    <section v-else class="entry-page entry-page--state" aria-live="polite">
      <p class="entry-page__eyebrow">
        {{ isLoading ? 'Loading' : error ? 'Error' : 'Not Found' }}
      </p>
      <h1>
        {{ isLoading ? 'Loading case study...' : error ? 'Unable to load case study.' : 'Case study not found.' }}
      </h1>
      <p class="entry-page__excerpt">
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
.entry-page {
  max-width: 54rem;
  min-height: 55vh;
  padding: $space-8 0 $space-9;
  color: $color-ink;
}

.entry-page__header {
  margin-bottom: $space-7;
}

.entry-page--state {
  max-width: 44rem;
}

.entry-page__eyebrow {
  margin-bottom: $space-3;
  color: $color-muted;
  font-size: $type-step-1;
  font-style: italic;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.entry-page__excerpt {
  margin-top: $space-4;
  color: $color-ink-80;
}

.entry-page__hero-media {
  margin: 0 0 $space-7;
}

.entry-page__hero-media img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
</style>
