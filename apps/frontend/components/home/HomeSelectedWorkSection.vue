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
    <header class="section-header">
      <p class="eyebrow">Case studies</p>
      <h2 class="title">Selected Work</h2>
      <hr class="section-rule" aria-hidden="true" />
    </header>

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
  // Stratum: afternoon clay. Full-bleed band that butts against the sand
  // above and the dusk below — the page reads as descending desert layers.
  .selected-work-section {
    position: relative;
    scroll-margin-top: var(--space-8);
    padding: var(--space-8) 0;
    margin-inline: calc(var(--space-6) * -1);
    background: var(--color-stratum-clay);
  }

  // Full-width section header — small-caps kicker, big Fraunces display title,
  // a folk-rule beneath. Not a card. Anchored left.
  .section-header {
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
    max-width: 28rem;
  }

  .eyebrow {
    margin: 0 0 var(--space-2);
    @include kicker;
  }

  .title {
    margin: 0;
    font-family: var(--font-display);
    font-optical-sizing: auto;
    font-weight: 460;
    font-size: clamp(2.4rem, 5.5vw, 4.5rem);
    line-height: 0.98;
    letter-spacing: -0.015em;
    color: var(--color-ink);

    @include display-character($opsz: 144, $soft: 55, $wonk: 1);
  }

  .section-rule {
    @include folk-rule;

    margin: var(--space-5) 0 0;
  }

  @include breakpoint(phone) {
    .selected-work-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-header {
      margin-inline: var(--space-4);
    }
  }
</style>
