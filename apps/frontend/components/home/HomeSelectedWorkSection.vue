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
  }

  .selected-work-section::before {
    content: '';
    display: block;
    width: 8rem;
    height: 1px;
    margin-bottom: var(--space-7);
    background: var(--color-muted);
  }

  .section-label {
    position: relative;
    margin-inline: var(--space-6);
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--space-5);
    align-items: end;
    margin-bottom: var(--space-7);
  }

  .kicker {
    margin-bottom: var(--space-6);
    color: var(--color-muted);
    font-size: var(--type-small);
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .label-rail {
    display: block;
    font-size: 5rem;
    line-height: 1;
  }

  .title {
    flex: 0 0 auto;
    max-width: min(16ch, 70vw);
    margin: 0;
    color: var(--color-primary);
    font-family: var(--font-mono);
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
      font-size: 3.4rem;
    }

    .section-label {
      grid-template-columns: 1fr;
    }
  }
</style>
