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
    gap: var(--space-7);
    width: 100%;
    margin: 0;
    padding: 0 var(--space-6);
    list-style: none;
  }

  @include breakpoint(phone) {
    .case-study-list {
      gap: var(--space-5);
      padding-inline: var(--space-4);
    }
  }

  .case-study-list > li {
    min-width: 0;
    max-width: none;
  }
</style>
