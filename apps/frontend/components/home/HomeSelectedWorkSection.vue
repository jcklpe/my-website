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
      <p class="kicker">Filed under</p>
      <div class="label-rail">
        <span class="label-circle" aria-hidden="true" />
        <h2 class="title">Selected work</h2>
      </div>
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
    background: var(--color-surface-warm);
  }

  .selected-work-section::before {
    content: '';
    display: block;
    width: 2.5rem;
    height: 2px;
    margin-bottom: var(--space-7);
    margin-inline: var(--space-6);
    background: var(--color-accent);
  }

  .section-label {
    position: relative;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
    text-align: right;
  }

  .kicker {
    margin-bottom: var(--space-5);
    color: var(--color-muted);
    font-family: var(--font-sans);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }

  .label-rail {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-4);
    font-size: clamp(2.4rem, 5vw, 4.5rem);
    line-height: 1;
  }

  .label-circle {
    display: block;
    flex-shrink: 0;
    width: 0.7em;
    height: 0.7em;
    border-radius: 50%;
    border: 1.5px solid var(--color-accent);
    opacity: 0.65;
  }

  .title {
    flex: 0 0 auto;
    max-width: min(20ch, 80vw);
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-display);
    font-size: 1em;
    font-style: normal;
    font-weight: 500;
    line-height: inherit;
    letter-spacing: 0.01em;
  }

  @include breakpoint(phone) {
    .selected-work-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .selected-work-section::before,
    .section-label {
      margin-inline: var(--space-4);
    }

    .label-rail {
      font-size: clamp(3rem, 18vw, 5rem);
    }
  }
</style>
