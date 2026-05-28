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
    <header class="section-header">
      <p class="section-eyebrow">Portfolio</p>
      <h2 class="section-title">Selected Works</h2>
    </header>

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
    position: relative;
    scroll-margin-top: var(--space-8);
    margin-inline: calc(var(--space-6) * -1);
  }

  .section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: var(--space-6) var(--space-6) var(--space-5);
    border-top: var(--border-default);
    border-bottom: var(--border-default);
  }

  .section-eyebrow {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .section-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 5vw, 5rem);
    line-height: 0.92;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--color-ink);
  }

  @include breakpoint(phone) {
    .selected-work-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-header {
      flex-direction: column;
      gap: var(--space-2);
      padding-inline: var(--space-4);
    }

    .section-title {
      font-size: clamp(2.5rem, 14vw, 4rem);
    }
  }
</style>
