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
    <div class="section-banner">
      <span class="section-eyebrow">Selected work</span>
      <span class="section-rule" aria-hidden="true" />
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
  // Selected Work is a full-width section. The banner is also full-width — a
  // thin periwinkle rule plus a mono ALL CAPS label — not a card.
  .selected-work-section {
    position: relative;
    scroll-margin-top: var(--space-8);
    margin-inline: calc(var(--space-6) * -1);
    padding-block: var(--space-8) var(--space-7);
    border-top: 1px solid var(--color-primary);
  }

  .section-banner {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-5) var(--space-6) var(--space-6);
  }

  .section-eyebrow {
    flex: 0 0 auto;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  .section-rule {
    flex: 1;
    height: 1px;
    background: var(--color-primary);
    opacity: 0.35;
  }

  @include breakpoint(phone) {
    .selected-work-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-banner {
      padding-inline: var(--space-4);
    }
  }
</style>
