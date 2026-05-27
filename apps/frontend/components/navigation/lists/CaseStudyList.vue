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

  .case-study-list > li:nth-of-type(odd) {
    margin-right: 30vw;
    margin-left: 0;
  }

  .case-study-list > li:nth-of-type(even) {
    margin-left: 30vw;
    margin-right: 0;
  }

  .case-study-list > li:nth-of-type(even) :deep(.label-stack) {
    align-self: flex-end;
    text-align: right;
  }

  .case-study-list > li:nth-of-type(odd) :deep(.media-frame) {
    padding-left: 100px;
  }

  .case-study-list > li:nth-of-type(even) :deep(.media-frame) {
    padding-right: 100px;
  }

  .case-study-list > li:nth-of-type(odd) :deep(.link-box:hover .media-frame),
  .case-study-list
    > li:nth-of-type(odd)
    :deep(.link-box:focus-visible .media-frame) {
    transform: translateX(-7vw);
  }

  .case-study-list > li:nth-of-type(odd) :deep(.link-box:hover .label-stack),
  .case-study-list
    > li:nth-of-type(odd)
    :deep(.link-box:focus-visible .label-stack) {
    transform: translateX(50px);
  }

  .case-study-list > li:nth-of-type(even) :deep(.link-box:hover .media-frame),
  .case-study-list
    > li:nth-of-type(even)
    :deep(.link-box:focus-visible .media-frame) {
    transform: translateX(7vw);
  }

  .case-study-list > li:nth-of-type(even) :deep(.link-box:hover .label-stack),
  .case-study-list
    > li:nth-of-type(even)
    :deep(.link-box:focus-visible .label-stack) {
    transform: translateX(-50px);
  }

  @include breakpoint(phone) {
    .case-study-list > li:nth-of-type(odd) {
      margin-left: 2vw;
      margin-right: 0;
    }

    .case-study-list > li:nth-of-type(even) {
      margin-left: 0;
      margin-right: 2vw;
    }

    .case-study-list > li:nth-of-type(odd) :deep(.media-frame),
    .case-study-list > li:nth-of-type(even) :deep(.media-frame) {
      padding-right: 0;
      padding-left: 0;
    }

    .case-study-list > li:nth-of-type(even) :deep(.label-stack) {
      align-self: stretch;
      text-align: left;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .case-study-list > li :deep(.link-box:hover .media-frame),
    .case-study-list > li :deep(.link-box:focus-visible .media-frame),
    .case-study-list > li :deep(.link-box:hover .label-stack),
    .case-study-list > li :deep(.link-box:focus-visible .label-stack) {
      transform: none;
    }
  }
</style>
