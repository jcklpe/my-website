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
  const headingElement = ref<HTMLElement | null>(null);
  const ruleElement = ref<HTMLElement | null>(null);
  const { decorationStyle: headingRuleStyle, letterStyle: headingLetterStyle } =
    useHomeHeadingParallax(headingElement, ruleElement);
  const headingWords = [
    { text: 'Selected', start: 0 },
    { text: 'work', start: 9 },
  ];

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
      <span ref="ruleElement" class="rule-position">
        <HomeFluidAccentRule class="rule" :style="headingRuleStyle()" />
      </span>
      <h2 ref="headingElement" class="title" aria-label="Selected work">
        <span
          v-for="word in headingWords"
          :key="word.text"
          class="word"
          aria-hidden="true"
        >
          <span
            v-for="(letter, letterIndex) in word.text"
            :key="`${letter}-${letterIndex}`"
            class="letter-entry"
            :data-heading-position="word.start + letterIndex"
          >
            <span
              class="letter-depth"
              :style="headingLetterStyle(word.start + letterIndex)"
              >{{ letter }}</span
            >
          </span>
        </span>
      </h2>
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
    padding: var(--space-8) 0 0;
    margin-inline: calc(var(--space-6) * -1);
  }

  .section-label {
    position: relative;
    width: min(60vw, 70rem);
    margin-inline: var(--space-6);
    margin-bottom: 2rem;
    text-align: left;
  }

  .rule-position {
    display: block;
    width: clamp(3.5rem, 5.5vw, 5.5rem);
    margin-left: auto;
    margin-bottom: var(--space-2);
  }

  .rule {
    display: block;
    width: 100%;
  }

  .title {
    max-width: min(16ch, 80vw);
    margin: 0;
    font-size: clamp(3rem, 8.5vw, 9rem);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-style: italic;
    font-weight: 700;
    line-height: 0.95;
    letter-spacing: -0.04em;
    perspective: 1000px;
    overflow: visible;
  }

  .word,
  .letter-entry,
  .letter-depth {
    display: inline-block;
    overflow: visible;
  }

  .word {
    white-space: nowrap;
  }

  .word + .word {
    margin-left: 0.22em;
  }

  .letter-depth {
    will-change: transform;
  }

  @media (min-width: 768px) and (max-width: 1199px) {
    // Size the label to its widest word ("Selected") so the right-aligned rule
    // lands over the end of that word (the "d") instead of floating off in the
    // wide 42vw box, and so the two-line wrap is preserved.
    .section-label {
      width: min-content;
      // Take the label out of flow (zero height, content overflows visibly) so
      // the case-study cards no longer react to the label's scaling title — the
      // cards sit at a stable position governed only by the section padding,
      // and the label is free to float into the pocket beside the portrait.
      height: 0;
      margin-bottom: 0;
      // Float the label into the pocket below the vital card. Because the label
      // is height:0, its pull-up must exceed its own visual height to keep it
      // ABOVE the cards — and that height grows with the (vw-scaled) title. This
      // shallower affine tracks that: enough lift to clear the cards at the wide
      // end where the title is tall, easing off at the narrow end where it is
      // short, so it neither floats up under Vital nor drops behind the cards.
      transform: translateY(clamp(-16rem, 4rem - 26vw, -8rem));
    }

    // Nudge the rule back to the right so it sits just over the "d" of Selected
    // rather than pulled fully to the word's left.
    .rule-position {
      transform: translateX(35%);
    }

    .title {
      font-size: clamp(3.25rem, 8vw, 7.5rem);
    }
  }

  // Narrowest tablet — the vertical pocket beneath the vital card is tight here,
  // so trim the title a step so the label doesn't run down into the first
  // case-study card.
  @media (min-width: 768px) and (max-width: 880px) {
    .title {
      font-size: clamp(2.5rem, 6vw, 4rem);
    }
  }

  // Desktop — keep "Selected work" on a single line at every width by letting
  // the type scale with the viewport instead of wrapping. The wrapped two-line
  // state left the blue rule stranded to the right of the words.
  @media (min-width: 1200px) {
    // Push the whole section down a little so the tall portrait clears the
    // first case-study card with some room to breathe.
    .selected-work-section {
      margin-top: 2rem;
    }

    .section-label {
      width: max-content;
      // Sit the label low in the intro field so it reads as belonging to the
      // case studies (closer to the cards than to the portrait), with a little
      // air before the first card.
      margin-top: 5px;
      margin-bottom: 1rem;
    }

    // Nudge the rule right so it sits just past the end of "work".
    .rule-position {
      transform: translateX(35%);
    }

    // Single line, scaling with the viewport, grown to nearly fill the space
    // between the left edge and the portrait; the base right-aligned rule then
    // lands over the end of "work".
    .title {
      max-width: none;
      white-space: nowrap;
      font-size: clamp(3rem, 7.8vw, 9rem);
    }
  }

  @include breakpoint(phone) {
    // Full-bleed must mirror .home-page's phone padding-inline (space-3)
    // exactly — bleeding wider than the page gutter (the old space-4 here)
    // pushed the section 4px past the viewport on each side and gave phones
    // a horizontal scrollbar.
    .selected-work-section {
      margin-inline: calc(var(--space-3) * -1);
      // Pull the section up to close the gap between the vital card and the
      // Selected Work title on phone.
      margin-top: -3rem;
    }

    .section-label {
      width: auto;
      margin-inline: var(--space-3);
      text-align: right;
    }

    .title {
      margin-left: auto;
      font-size: clamp(3rem, 16vw, 6rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .letter-entry,
    .letter-depth,
    .rule {
      transform: none !important;
      transition: none !important;
    }
  }
</style>
