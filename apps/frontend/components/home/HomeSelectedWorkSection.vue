<script setup lang="ts">
  import type { ComputedRef } from 'vue';
  import type { WordPressCaseStudy } from '~/types/wordpress';
  import {
    caseStudyPhotoTreatmentClasses,
    caseStudyPhotoTreatmentConfig,
    caseStudyPhotoTreatmentStyle,
  } from '~/utils/case-study-photo-treatment';

  const props = withDefaults(
    defineProps<{
      caseStudies?: WordPressCaseStudy[] | null;
      error?: boolean;
    }>(),
    {
      caseStudies: null,
      error: false,
    },
  );

  const caseStudiesList: ComputedRef<WordPressCaseStudy[]> = computed(
    () => props.caseStudies ?? [],
  );

  type CaseStudyCardSpike = {
    resolveClasses: (index: number) => Record<string, boolean>;
    resolveStyle: (index: number) => Record<string, string>;
    resolveTonePair: (index: number) => string;
    resolveDuotoneMode: (index: number) => string;
    resolveTintOverlayEnabled: (index: number) => boolean;
  };

  provide<CaseStudyCardSpike>('caseStudyCardSpike', {
    resolveClasses: (i) =>
      caseStudyPhotoTreatmentClasses(
        caseStudyPhotoTreatmentConfig(caseStudiesList.value[i], i),
      ),
    resolveStyle: (i) =>
      caseStudyPhotoTreatmentStyle(
        caseStudyPhotoTreatmentConfig(caseStudiesList.value[i], i),
      ),
    resolveTonePair: (i) =>
      caseStudyPhotoTreatmentConfig(caseStudiesList.value[i], i).tonePair,
    resolveDuotoneMode: (i) =>
      caseStudyPhotoTreatmentConfig(caseStudiesList.value[i], i).duotoneMode,
    resolveTintOverlayEnabled: (i) =>
      caseStudyPhotoTreatmentConfig(caseStudiesList.value[i], i)
        .tintOverlayEnabled,
  });
</script>

<template>
  <section id="selected-work" class="selected-work-section">
    <!-- SPIKE: SVG filters for true duotone / tritone post-processing of the
         halftone output. Match the defs on case-studies/[slug].vue. Removed
         with the rest of the spike. -->
    <svg
      width="0"
      height="0"
      style="position: absolute; pointer-events: none"
      aria-hidden="true"
    >
      <defs>
        <filter id="halftone-tone-ink-cream" color-interpolation-filters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.047 0.969" />
            <feFuncG type="table" tableValues="0.067 0.961" />
            <feFuncB type="table" tableValues="0.169 0.937" />
          </feComponentTransfer>
        </filter>
        <filter
          id="halftone-tone-blue-cream"
          color-interpolation-filters="sRGB"
        >
          <feColorMatrix
            type="matrix"
            values="0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.149 0.969" />
            <feFuncG type="table" tableValues="0.341 0.961" />
            <feFuncB type="table" tableValues="0.922 0.937" />
          </feComponentTransfer>
        </filter>
        <filter id="halftone-tone-ink-blue" color-interpolation-filters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.047 0.149" />
            <feFuncG type="table" tableValues="0.067 0.341" />
            <feFuncB type="table" tableValues="0.169 0.922" />
          </feComponentTransfer>
        </filter>
        <filter
          id="halftone-tone-tritone-ink-blue-cream"
          color-interpolation-filters="sRGB"
        >
          <feColorMatrix
            type="matrix"
            values="0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.047 0.149 0.969" />
            <feFuncG type="table" tableValues="0.067 0.341 0.961" />
            <feFuncB type="table" tableValues="0.169 0.922 0.937" />
          </feComponentTransfer>
        </filter>
        <filter
          id="halftone-tone-tritone-ink-soft-cream"
          color-interpolation-filters="sRGB"
        >
          <feColorMatrix
            type="matrix"
            values="0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.047 0.863 0.969" />
            <feFuncG type="table" tableValues="0.067 0.886 0.961" />
            <feFuncB type="table" tableValues="0.169 0.973 0.937" />
          </feComponentTransfer>
        </filter>
        <filter
          id="halftone-tone-crisp-ink-cream"
          color-interpolation-filters="sRGB"
        >
          <feColorMatrix
            type="matrix"
            values="0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0.047 0.969" />
            <feFuncG type="discrete" tableValues="0.067 0.961" />
            <feFuncB type="discrete" tableValues="0.169 0.937" />
          </feComponentTransfer>
        </filter>
        <filter
          id="halftone-tone-crisp-blue-cream"
          color-interpolation-filters="sRGB"
        >
          <feColorMatrix
            type="matrix"
            values="0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0.149 0.969" />
            <feFuncG type="discrete" tableValues="0.341 0.961" />
            <feFuncB type="discrete" tableValues="0.922 0.937" />
          </feComponentTransfer>
        </filter>
        <filter
          id="halftone-tone-crisp-ink-blue"
          color-interpolation-filters="sRGB"
        >
          <feColorMatrix
            type="matrix"
            values="0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0.047 0.149" />
            <feFuncG type="discrete" tableValues="0.067 0.341" />
            <feFuncB type="discrete" tableValues="0.169 0.922" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>

    <div class="section-label">
      <h2 class="title">Selected work</h2>
    </div>

    <EmptyState
      v-if="error"
      message="Error: Case studies could not be loaded."
    />

    <CaseStudyList
      v-else-if="caseStudiesList.length"
      :case-studies="caseStudiesList"
    />

    <EmptyState v-else message="No case studies yet." />
  </section>
</template>

<style lang="scss" scoped>
  .selected-work-section {
    position: relative;
    scroll-margin-top: var(--space-8);
    padding: var(--space-9) 0 var(--space-8);
    margin-inline: calc(var(--space-6) * -1);
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
    width: clamp(4rem, 7vw, 7rem);
    height: 2px;
    margin-left: auto;
    margin-bottom: var(--space-4);
    background: var(--color-primary);
  }

  .title {
    max-width: min(16ch, 80vw);
    margin: 0 0 0 auto;
    font-size: clamp(3rem, 8.5vw, 9rem);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-style: italic;
    font-weight: 700;
    line-height: 0.95;
    letter-spacing: -0.04em;
  }

  @include breakpoint(phone) {
    // Full-bleed must mirror .home-page's phone padding-inline (space-3)
    // exactly — bleeding wider than the page gutter (the old space-4 here)
    // pushed the section 4px past the viewport on each side and gave phones
    // a horizontal scrollbar.
    .selected-work-section {
      margin-inline: calc(var(--space-3) * -1);
    }

    .section-label {
      margin-inline: var(--space-3);
    }

    .title {
      font-size: clamp(3rem, 16vw, 6rem);
    }
  }
</style>
