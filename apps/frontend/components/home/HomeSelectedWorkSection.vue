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
    padding: var(--space-8) 0 var(--space-9);
    margin-inline: calc(var(--space-6) * -1);
    background: var(--color-stage);
    color: var(--color-stage-ink);
  }

  .selected-work-section::before {
    content: '';
    display: block;
    width: min(100%, 16rem);
    height: 0.35rem;
    margin-bottom: var(--space-7);
    background: var(--color-primary);
  }

  .section-label {
    display: grid;
    grid-template-columns: minmax(8rem, 0.35fr) minmax(0, 1fr);
    gap: var(--space-6);
    align-items: end;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
  }

  .kicker {
    margin: 0;
    color: var(--color-stage-muted);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .label-rail {
    display: block;
    font-size: 3.25rem;
    line-height: 1;
  }

  .title {
    max-width: min(14ch, 70vw);
    margin: 0;
    margin-left: auto;
    color: var(--color-stage-ink);
    font-family: var(--font-mono);
    font-size: 1em;
    line-height: inherit;
    text-align: right;
    text-transform: uppercase;
  }

  @include breakpoint(phone) {
    .selected-work-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .selected-work-section::before,
    .section-label {
      margin-inline: var(--space-4);
    }

    .section-label {
      grid-template-columns: 1fr;
      gap: var(--space-3);
    }

    .title {
      margin-left: 0;
      text-align: left;
    }

    .label-rail {
      font-size: 3.5rem;
    }
  }
</style>
