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
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    background: var(--color-ink-30);
    border: var(--border-default);
  }

  .case-study-list > li {
    min-width: 0;
    background: var(--color-surface);
  }

  // First card spans full width — featured / landscape layout.
  .case-study-list > li:first-child {
    grid-column: 1 / -1;
  }

  .case-study-list > li:first-child :deep(.case-study-card) {
    height: clamp(160px, 22vh, 300px);
  }

  // Non-featured cards: stack image above info panel (portrait layout).
  .case-study-list > li:not(:first-child) :deep(.case-study-card) {
    grid-template-columns: 1fr;
    grid-template-rows: clamp(100px, 16vh, 200px) auto;
    height: auto;
  }

  .case-study-list > li:not(:first-child) :deep(.media-frame) {
    aspect-ratio: unset;
    height: 100%;
  }

  // Last portrait card alone in its row — restore landscape layout.
  .case-study-list > li:not(:first-child):last-child:nth-child(even) {
    grid-column: 1 / -1;
  }

  .case-study-list > li:not(:first-child):last-child:nth-child(even) :deep(.case-study-card) {
    grid-template-columns: minmax(0, 1.4fr) minmax(240px, 380px);
    grid-template-rows: unset;
    height: clamp(160px, 22vh, 300px);
  }

  @include breakpoint(phone) {
    .case-study-list {
      grid-template-columns: 1fr;
    }

    .case-study-list > li:first-child {
      grid-column: 1;
    }

    .case-study-list > li:not(:first-child) :deep(.case-study-card) {
      grid-template-columns: 1fr;
    }
  }
</style>
