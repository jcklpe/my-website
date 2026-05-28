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
      <p class="kicker">Selected work ✷ 001—00n</p>
      <div class="label-rail">
        <h2 class="title">Things I&rsquo;ve made</h2>
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
    padding: var(--space-10) 0 var(--space-9);
    margin-inline: calc(var(--space-6) * -1);
    background: var(--color-surface);
    color: var(--color-ink);
  }

  .section-label {
    position: relative;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-8);
  }

  .kicker {
    margin-bottom: var(--space-4);
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .label-rail {
    display: block;
    line-height: 0.9;
  }

  .title {
    max-width: 14ch;
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-display);
    font-size: clamp(2.75rem, 8vw, 7rem);
    font-weight: 400;
    line-height: 0.9;
    letter-spacing: -0.03em;
  }

  @include breakpoint(phone) {
    .selected-work-section {
      margin-inline: calc(var(--space-4) * -1);
      padding-block: var(--space-9) var(--space-8);
    }

    .section-label {
      margin-inline: var(--space-4);
    }
  }
</style>
