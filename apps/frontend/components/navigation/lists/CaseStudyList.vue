<script setup lang="ts">
  import type { WordPressCaseStudy } from '~/types/wordpress';

  defineProps<{
    caseStudies: WordPressCaseStudy[];
  }>();
</script>

<template>
  <ul class="case-study-list">
    <li v-for="caseStudy in caseStudies" :key="caseStudy.id">
      <CaseStudyCard :case-study="caseStudy" />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
  .case-study-list {
    display: grid;
    gap: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .case-study-list > li {
    min-width: 0;
    max-width: none;
  }

  // Rotate jewel-slab card fields. The media covers the field; the color shows
  // through during load, placeholder, and the featured-media transition.
  .case-study-list > li:nth-child(3n + 1) :deep(.case-study-card) {
    background: var(--color-slab-navy);
  }

  .case-study-list > li:nth-child(3n + 2) :deep(.case-study-card) {
    background: var(--color-slab-oxblood);
  }

  .case-study-list > li:nth-child(3n + 3) :deep(.case-study-card) {
    background: var(--color-slab-clay);
  }
</style>
