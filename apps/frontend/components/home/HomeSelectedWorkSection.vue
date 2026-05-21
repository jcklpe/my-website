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
    padding: var(--space-8) 0;
    margin-inline: calc(var(--space-6) * -1);
    background:
      linear-gradient(90deg, var(--color-pop-aqua) 0 42%, transparent 42%),
      var(--color-pop-cream);
    border-bottom: var(--border-strong);
  }

  .selected-work-section::before {
    content: '';
    display: block;
    width: 7rem;
    height: 1.1rem;
    margin-bottom: var(--space-7);
    margin-inline: var(--space-6);
    background: var(--color-pop-coral);
    border: var(--border-default);
    box-shadow: 0.35rem 0.35rem 0 var(--color-primary-heavy);
  }

  .section-label {
    position: relative;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
    text-align: right;
  }

  .kicker {
    display: inline-block;
    margin-bottom: var(--space-4);
    padding: 0.35rem 0.55rem;
    border: var(--border-default);
    background: var(--color-pop-yellow);
    color: var(--color-ink);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .label-rail {
    display: block;
    font-size: 4.25rem;
    line-height: 1;
  }

  .title {
    flex: 0 0 auto;
    max-width: min(16ch, 70vw);
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-sans);
    font-size: 1em;
    font-weight: 700;
    line-height: inherit;
    letter-spacing: 0;
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

    .label-rail {
      font-size: 2.9rem;
    }
  }
</style>
