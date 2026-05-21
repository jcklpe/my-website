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
      <p class="kicker">Specimen index</p>
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
      linear-gradient(
        180deg,
        rgba(255, 249, 236, 0.42),
        rgba(231, 209, 186, 0.24)
      );
  }

  .selected-work-section::before {
    content: '';
    display: block;
    width: 4.5rem;
    height: 0.65rem;
    margin-bottom: var(--space-7);
    border: 1px solid var(--color-primary);
    border-bottom: 0;
    border-radius: 999px 999px 0 0;
  }

  .section-label {
    position: relative;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
    text-align: right;
  }

  .section-label::after {
    content: '';
    display: block;
    width: min(24rem, 55vw);
    height: 1px;
    margin: var(--space-4) 0 0 auto;
    background: var(--color-primary-tint);
  }

  .kicker {
    margin-bottom: var(--space-6);
    color: var(--color-primary-heavy);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 600;
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
    color: var(--color-ink);
    font-family: var(--font-serif);
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
      margin-inline: var(--space-4);
    }

    .label-rail {
      font-size: 2.6rem;
    }
  }
</style>
