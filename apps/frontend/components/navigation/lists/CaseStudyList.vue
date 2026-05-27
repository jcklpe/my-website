<script setup lang="ts">
  import type { WordPressCaseStudy } from '~/types/wordpress';

  defineProps<{
    caseStudies: WordPressCaseStudy[];
  }>();
</script>

<template>
  <ul class="case-study-list">
    <li v-for="(caseStudy, index) in caseStudies" :key="caseStudy.id">
      <CaseStudyCard :case-study="caseStudy" :index="index" />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
  .case-study-list {
    display: grid;
    gap: var(--space-6);
    width: 100%;
    margin: 0;
    padding-inline: var(--space-6);
    list-style: none;
  }

  .case-study-list > li {
    min-width: 0;
    max-width: none;
  }

  @include breakpoint(phone) {
    .case-study-list {
      padding-inline: var(--space-4);
    }
  }
</style>
