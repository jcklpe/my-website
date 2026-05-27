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
    padding: calc(var(--space-8) + 5vw) 0 0;
    background: var(--color-primary-heavy);
    color: var(--color-surface);
  }

  .selected-work-section::before {
    content: '';
    display: block;
    width: 3rem;
    height: 0.45rem;
    margin: 0 0 var(--space-7) var(--space-6);
    background: var(--color-notice);
  }

  .section-label {
    position: relative;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
    text-align: left;
  }

  .kicker {
    width: fit-content;
    margin-bottom: var(--space-4);
    padding: 0.1em 0.35em;
    background: var(--color-notice);
    color: var(--color-black);
    font-size: var(--type-base);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .label-rail {
    display: block;
    font-size: 3.25rem;
    line-height: 1;
  }

  .title {
    flex: 0 0 auto;
    max-width: min(16ch, 70vw);
    margin: 0;
    padding: 0.05em 0.24em 0.12em;
    background: var(--color-black);
    box-shadow: var(--shadow-label);
    color: var(--color-surface);
    font-family: var(--font-display);
    font-size: 1em;
    line-height: inherit;
    letter-spacing: 0;
  }

  @include breakpoint(phone) {
    .selected-work-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .selected-work-section::before,
    .section-label {
      margin-left: var(--space-4);
    }

    .label-rail {
      font-size: 3rem;
    }
  }
</style>
