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
      <h2 class="section-title">
        <span class="section-code" aria-hidden="true">01 — </span>Selected Work
      </h2>
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
    padding: var(--space-8) 0;
    margin-inline: calc(var(--space-6) * -1);
  }

  .selected-work-section::before {
    content: none;
  }

  .section-header {
    display: flex;
    align-items: center;
    padding: var(--space-2) var(--space-6);
    border-top: 1px solid var(--color-line);
    border-bottom: 1px solid var(--color-line);
    margin-bottom: var(--space-5);
  }

  .section-title {
    margin: 0;
    color: var(--color-ink);
    font-family: var(--type-label-family);
    font-size: var(--type-label-size);
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .section-code {
    color: var(--color-blueprint);
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
