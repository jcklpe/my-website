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
    <div class="section-label">
      <h2 class="section-title">Selected work</h2>
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
    border-top: 1px solid var(--color-ink);
  }

  .section-label {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-5) var(--space-6) var(--space-6);

    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--color-ink);
      opacity: 0.15;
    }
  }

  .section-title {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  @include breakpoint(phone) {
    .selected-work-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-label {
      padding-inline: var(--space-4);
    }
  }
</style>
