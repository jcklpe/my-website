<script setup lang="ts">
import type { WordPressCaseStudy } from '~/types/wordpress'

defineProps<{
  caseStudy: WordPressCaseStudy
}>()
</script>

<template>
  <article class="case-study-card">
    <NuxtLink :to="`/case-studies/${caseStudy.slug}`" class="case-study-card__link">
      <CardMedia
        :media="caseStudy.featuredMedia"
        label="Case Study"
        :transition-key="`case-study:${caseStudy.slug}`"
      />

      <div class="case-study-card__body">
        <p class="case-study-card__meta">Case Study</p>
        <h3>{{ caseStudy.title }}</h3>
        <p class="case-study-card__excerpt">{{ caseStudy.excerpt }}</p>
      </div>
    </NuxtLink>
  </article>
</template>

<style lang="scss" scoped>
.case-study-card {
  border: 1px solid rgba(12, 17, 43, 0.18);
  background: rgba(255, 255, 255, 0.58);
  box-shadow: var(--shadow-soft);
  transition:
    transform 240ms var(--motion-snappy),
    box-shadow 240ms var(--motion-snappy),
    border-color 240ms var(--motion-snappy);
}

.case-study-card:hover {
  border-color: rgba(31, 56, 197, 0.3);
  box-shadow: var(--shadow-card);
  transform: translateY(-2px);
}

.case-study-card__link {
  display: block;
  min-height: 13rem;
  color: inherit;
  text-decoration: none;
}

.case-study-card__body {
  padding: var(--space-5);
}

.case-study-card__meta {
  color: var(--color-primary-heavy);
  font-size: var(--type-step-1);
  font-style: italic;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.case-study-card h3 {
  margin-top: var(--space-4);
}

.case-study-card__excerpt {
  margin-top: var(--space-3);
  color: var(--color-ink-80);
}
</style>
