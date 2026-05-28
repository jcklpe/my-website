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
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: var(--space-5);
    width: 100%;
    margin: 0;
    padding: 0 var(--space-6);
    list-style: none;
  }

  .case-study-list > li {
    grid-column: span 6;
    min-width: 0;
    max-width: none;
  }

  .case-study-list > li:nth-child(4n + 1),
  .case-study-list > li:nth-child(4n) {
    grid-column: span 7;
  }

  .case-study-list > li:nth-child(4n + 2),
  .case-study-list > li:nth-child(4n + 3) {
    grid-column: span 5;
  }

  .case-study-list > li:only-child {
    grid-column: 1 / -1;
  }

  @media (max-width: 900px) {
    .case-study-list {
      grid-template-columns: 1fr;
      padding-inline: var(--space-4);
    }

    .case-study-list > li,
    .case-study-list > li:nth-child(4n + 1),
    .case-study-list > li:nth-child(4n),
    .case-study-list > li:nth-child(4n + 2),
    .case-study-list > li:nth-child(4n + 3),
    .case-study-list > li:only-child {
      grid-column: 1;
    }
  }
</style>
