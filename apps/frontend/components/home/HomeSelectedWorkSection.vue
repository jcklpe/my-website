<script setup lang="ts">
  import type { WordPressCaseStudy } from '~/types/wordpress';

  withDefaults(
    defineProps<{
      caseStudies?: WordPressCaseStudy[] | null;
      error?: boolean;
    }>(),
    {
      caseStudies: null,
      error: false,
    },
  );
</script>

<template>
  <section id="selected-work" class="selected-work-section">
    <div class="section-header">
      <h2 class="section-title">Selected Work</h2>
    </div>

    <EmptyState
      v-if="error"
      message="Error: Case studies could not be loaded."
    />

    <CaseStudyList
      v-else-if="caseStudies?.length"
      :case-studies="caseStudies"
    />

    <EmptyState v-else message="No case studies yet." />
  </section>
</template>

<style lang="scss" scoped>
  .selected-work-section {
    scroll-margin-top: var(--space-8);
  }

  .section-header {
    padding: var(--space-7) var(--space-6) var(--space-6);
    background: #000;
  }

  .section-title {
    margin: 0;
    color: #fff;
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 6vmax, 6rem);
    font-style: normal;
    font-weight: normal;
    line-height: 1;
    letter-spacing: 0.02em;
    border-bottom: 3px solid var(--color-primary);
    display: inline-block;
    padding-bottom: var(--space-2);
  }

  @include breakpoint(phone) {
    .section-header {
      padding: var(--space-6) var(--space-5) var(--space-5);
    }
  }
</style>
