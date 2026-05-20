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
      <p class="kicker">Case studies</p>
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
      linear-gradient(90deg, var(--color-ink-025) 1px, transparent 1px),
      var(--color-surface);
    background-size: 7rem 100%;
  }

  .selected-work-section::before {
    content: '';
    position: absolute;
    top: var(--space-7);
    right: var(--space-6);
    width: min(17rem, 32vw);
    height: 5.5rem;
    border-top: var(--border-signal-strong);
    border-right: var(--border-signal-strong);
    pointer-events: none;
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
    margin: 0 0 var(--space-4) auto;
    background: var(--color-primary);
  }

  .kicker {
    margin-bottom: var(--space-4);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .label-rail {
    display: block;
    font-size: clamp(2.2rem, 5vw, 4.25rem);
    line-height: 1;
  }

  .title {
    flex: 0 0 auto;
    max-width: min(16ch, 70vw);
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-style: italic;
    font-weight: 600;
    font-size: 1em;
    line-height: inherit;
    letter-spacing: -0.035em;
    text-transform: none;
  }

  @include breakpoint(phone) {
    .selected-work-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-label {
      margin-inline: var(--space-4);
    }

    .selected-work-section::before {
      right: var(--space-4);
      width: 8rem;
      height: 3.5rem;
    }

    .label-rail {
      font-size: clamp(3rem, 18vw, 5rem);
    }
  }
</style>
