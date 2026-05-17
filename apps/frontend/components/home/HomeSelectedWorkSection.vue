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
    padding: var(--space-8) 0 var(--space-7);
    margin-inline: calc(var(--space-6) * -1);
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--color-surface) 86%, transparent) 0%,
        color-mix(in srgb, var(--color-surface-blueprint) 78%, transparent) 100%
      );
  }

  .selected-work-section::before {
    content: 'Selected work / primary artifacts';
    display: block;
    width: fit-content;
    margin: 0 var(--space-6) var(--space-6);
    padding: var(--space-2) var(--space-3);
    border: var(--border-signal);
    background: var(--color-surface-soft);
    color: var(--color-signal-heavy);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .section-label {
    position: relative;
    display: grid;
    justify-items: end;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
    padding: var(--space-5);
    border: var(--border-window);
    background: var(--texture-blueprint-field);
    background-size: var(--texture-blueprint-field-size);
    box-shadow: var(--shadow-hard-low);
    text-align: right;
  }

  .section-label::after {
    content: '';
    position: absolute;
    right: var(--space-5);
    bottom: var(--space-5);
    width: min(20vw, 12rem);
    height: min(12vw, 7rem);
    border-right: var(--border-signal-strong);
    border-bottom: var(--border-signal-strong);
    opacity: 0.8;
    pointer-events: none;
  }

  .kicker {
    margin-bottom: var(--space-6);
    color: var(--color-signal-heavy);
    font-size: var(--type-small);
    font-family: var(--font-mono);
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .label-rail {
    display: block;
    font-size: clamp(2rem, 4vw, 3.5rem);
    line-height: 1;
  }

  .title {
    flex: 0 0 auto;
    max-width: min(16ch, 70vw);
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: 1em;
    line-height: inherit;
    letter-spacing: -0.075em;
    text-transform: uppercase;
  }

  .selected-work-section :deep(.case-study-list) {
    border-top: var(--border-window);
    border-bottom: var(--border-window);
  }

  .selected-work-section :deep(.case-study-card) {
    border-top: var(--border-ink);
  }

  .selected-work-section :deep(.case-study-card:first-child) {
    border-top: 0;
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

    .section-label {
      padding: var(--space-4);
    }
  }
</style>
