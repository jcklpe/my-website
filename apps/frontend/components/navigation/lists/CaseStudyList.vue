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
    gap: var(--space-3);
    width: 100%;
    margin: 0;
    padding: 0;
    counter-reset: case-studies;
    list-style: none;
  }

  .case-study-list > li {
    min-width: 0;
    max-width: none;
    counter-increment: case-studies;
  }

  .case-study-list > li::before {
    content: '(0' counter(case-studies) ')';
    display: block;
    margin: 0 0 var(--space-1) var(--space-4);
    color: var(--color-surface-softer);
    font-size: var(--type-small);
  }

  @media (min-width: 900px) {
    .case-study-list > li:nth-child(2n) {
      padding-left: 10vw;
    }

    .case-study-list > li:nth-child(3n) {
      padding-left: 22vw;
    }

    .case-study-list > li:nth-child(4n) {
      padding-left: 4vw;
    }
  }
</style>
