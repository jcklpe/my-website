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
    padding: var(--space-8) var(--space-4);
    background: var(--color-ink);
    color: var(--color-surface);
  }

  .selected-work-section::before {
    content: none;
  }

  .selected-work-section::after {
    content: '';
    display: block;
    height: 0.7rem;
    margin-top: var(--space-7);
    border: 2px solid var(--color-surface);
    border-radius: 999px;
    background:
      repeating-linear-gradient(
        90deg,
        var(--color-surface) 0 4rem,
        transparent 4rem 6rem
      ),
      var(--color-ink);
  }

  .section-label {
    position: relative;
    margin-bottom: var(--space-5);
  }

  .kicker {
    margin: 0 0 var(--space-2);
    color: var(--color-surface-softer);
    font-size: var(--type-small);
    text-transform: uppercase;
  }

  .label-rail {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .label-rail::after {
    content: '';
    flex: 1 1 auto;
    height: 0.13em;
    background: currentColor;
  }

  .title {
    flex: 0 0 auto;
    max-width: min(12ch, 80vw);
    margin: 0;
    color: var(--color-surface);
    font-family: var(--font-display);
    font-size: clamp(6rem, 17vw, 16rem);
    font-weight: 400;
    line-height: 0.75;
    text-transform: uppercase;
  }

  @include breakpoint(phone) {
    .selected-work-section {
      padding-inline: var(--space-4);
    }

    .label-rail {
      align-items: end;
    }
  }
</style>
