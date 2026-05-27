<script setup lang="ts">
  import type { WordPressCaseStudy } from '~/types/wordpress';

  defineProps<{
    caseStudies: WordPressCaseStudy[];
  }>();
</script>

<template>
  <ul class="case-study-list">
    <li
      v-for="(caseStudy, index) in caseStudies"
      :key="caseStudy.id"
      class="case-study-item"
      :class="index % 2 === 0 ? 'item-even' : 'item-odd'"
    >
      <CaseStudyCard :case-study="caseStudy" />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
  // Diagonal clip-path stacking: each card is clipped on a 5vw diagonal
  // that hides the top edge of the card below. The negative margin pulls
  // the next card up so the diagonals overlap rather than gap.

  .case-study-list {
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .case-study-item {
    position: relative;
    margin-bottom: -5vw;
  }

  // Even-indexed: top-left stays flush, top-right rises to create a \ slope.
  .item-even {
    clip-path: polygon(0 0, 100% 5vw, 100% 100%, 0 100%);
    z-index: 2;
  }

  // Odd-indexed: top-right stays flush, top-left rises to create a / slope.
  .item-odd {
    clip-path: polygon(0 5vw, 100% 0, 100% 100%, 0 100%);
    z-index: 3;
  }

  // Last item doesn't need the bottom bleed-off margin.
  .case-study-item:last-child {
    margin-bottom: 0;
    clip-path: none;
  }
</style>
