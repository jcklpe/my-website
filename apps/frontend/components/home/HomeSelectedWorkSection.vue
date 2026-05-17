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
      <div class="section-header-left">
        <span class="section-index" aria-hidden="true">02</span>
        <h2 class="title">Selected Work</h2>
      </div>
      <span class="section-marker" aria-hidden="true">+</span>
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
    position: relative;
    scroll-margin-top: var(--space-8);
    padding-bottom: var(--space-8);
    margin-inline: calc(var(--space-6) * -1);
    margin-top: var(--space-7);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) var(--space-6);
    margin-bottom: var(--space-7);
    background: var(--color-primary);
    color: var(--color-surface);
  }

  .section-header-left {
    display: flex;
    align-items: baseline;
    gap: var(--space-4);
  }

  .section-index {
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.1em;
    opacity: 0.6;
  }

  .title {
    margin: 0;
    color: var(--color-surface);
    font-family: var(--font-mono);
    font-size: clamp(1.1rem, 2.2vw, 1.6rem);
    font-style: normal;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1;
  }

  .section-marker {
    font-family: var(--font-mono);
    font-size: 1.5rem;
    font-weight: 400;
    opacity: 0.5;
  }

  @include breakpoint(phone) {
    .selected-work-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-header {
      padding-inline: var(--space-4);
    }
  }
</style>
