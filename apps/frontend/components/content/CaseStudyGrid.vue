<script setup lang="ts">
import type { WordPressCaseStudy } from '~/types/wordpress'

defineProps<{
  caseStudies: WordPressCaseStudy[]
}>()
</script>

<template>
  <ul class="case-study-grid">
    <li v-for="caseStudy in caseStudies" :key="caseStudy.id">
      <CaseStudyCard :case-study="caseStudy" />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.case-study-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: $space-4;
  padding: 0;
  list-style: none;
}

.case-study-grid > li {
  min-width: 0;
}
</style>
