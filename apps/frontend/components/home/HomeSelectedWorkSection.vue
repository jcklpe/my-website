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
      <h2 class="title">Selected work</h2>
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
    padding: var(--space-8) 0;
    margin-inline: calc(var(--space-6) * -1);
  }

  .section-label {
    position: relative;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
    text-align: right;
  }

  .section-label::before {
    content: '';
    display: block;
    width: 4rem;
    height: 2px;
    margin-left: auto;
    margin-bottom: var(--space-4);
    background: var(--color-primary);
  }

  .title {
    max-width: min(16ch, 70vw);
    margin: 0 0 0 auto;
    font-size: clamp(2rem, 4vw, 3.5rem);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-style: italic;
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  @include breakpoint(phone) {
    .selected-work-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-label {
      margin-inline: var(--space-4);
    }

    .title {
      font-size: clamp(2.6rem, 14vw, 4.5rem);
    }
  }
</style>
