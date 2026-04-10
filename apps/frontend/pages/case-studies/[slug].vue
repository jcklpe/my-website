<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data: caseStudy } = await useAsyncData(`case-study-${slug}`, () =>
  queryWordPressCaseStudyBySlug(slug),
)

if (!caseStudy.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Case study not found',
  })
}

useSeoMeta({
  title: caseStudy.value.title,
  description: caseStudy.value.excerpt,
})
</script>

<template>
  <article class="entry-page">
    <header class="entry-page__header">
      <p class="entry-page__eyebrow">Case Study</p>
      <h1>{{ caseStudy?.title }}</h1>
      <p v-if="caseStudy?.excerpt" class="entry-page__excerpt">
        {{ caseStudy.excerpt }}
      </p>
    </header>

    <BlockRenderer :blocks="caseStudy?.blocks ?? []" />
  </article>
</template>

<style lang="scss" scoped>
.entry-page {
  max-width: 54rem;
  padding: $space-8 0 $space-9;
}

.entry-page__header {
  margin-bottom: $space-7;
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
</style>
