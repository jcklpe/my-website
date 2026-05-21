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

  .case-study-list > li:nth-child(4n + 1) {
    --accent: var(--pop-cobalt);
  }

  .case-study-list > li:nth-child(4n + 2) {
    --accent: var(--pop-pink);
  }

  .case-study-list > li:nth-child(4n + 3) {
    --accent: var(--pop-acid);
  }

  .case-study-list > li:nth-child(4n + 4) {
    --accent: var(--pop-marigold);
  }
</style>
