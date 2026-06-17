<script setup lang="ts">
  import type { ComputedRef } from 'vue';
  import type { WordPressCaseStudy } from '~/types/wordpress';

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

  // SPIKE: case-study card duotone/halftone seed configs. Each card gets a
  // config from SEED_PRESETS by index; the spike's live controls panel has
  // been removed — the seeds carry the home-page visual testing variance.
  // Removed entirely with the rest of the case-hero spike scaffolding.
  type DuotoneMode = 'off' | 'direct' | 'crisp' | 'bleed';
  type TonePair =
    | 'ink-cream'
    | 'blue-cream'
    | 'ink-blue'
    | 'tritone-ink-blue-cream'
    | 'tritone-ink-soft-cream';
  type BleedDirection = 'to top' | 'to bottom' | 'to left' | 'to right';

  type CardConfig = {
    duotoneMode: DuotoneMode;
    tonePair: TonePair;
    halftoneSize: number;
    bleedDirection: BleedDirection;
    bleedStrength: number;
    bleedOpacity: number;
    bleedBlend: string;
    tintOverlayEnabled: boolean;
    tintOpacity: number;
  };

  // Gradient tint angle is locked — 189deg maximizes legibility because the
  // gradient's brightness axis aligns near-vertical, putting the darker stop
  // at the top of the image and the lighter stop at the bottom.
  const TINT_ANGLE_LOCKED = 189;

  // Treatment presets, named for the CMS radio. Values match the ACF
  // selected_work_photo_treatment choices. The set is the user's tuned
  // spike presets; a v6.3 experiment unified all cards onto a single direct
  // duotone and was vetoed as overly monochrome — variety is intentional,
  // and the palette-vs-variety dial is the user's to tune per preset.
  const TREATMENT_PRESETS: Record<string, CardConfig> = {
    // V7 — duotone bleed, blue+cream
    bleed_blue_cream: {
      duotoneMode: 'bleed',
      tonePair: 'blue-cream',
      halftoneSize: 11,
      bleedDirection: 'to top',
      bleedStrength: 80,
      bleedOpacity: 1,
      bleedBlend: 'color',
      tintOverlayEnabled: true,
      tintOpacity: 0.7,
    },
    // V2 — direct, ink+blue
    direct_ink_blue: {
      duotoneMode: 'direct',
      tonePair: 'ink-blue',
      halftoneSize: 11,
      bleedDirection: 'to top',
      bleedStrength: 100,
      bleedOpacity: 0.5,
      bleedBlend: 'overlay',
      tintOverlayEnabled: true,
      tintOpacity: 0.7,
    },
    // V3 — direct, tritone
    direct_tritone: {
      duotoneMode: 'direct',
      tonePair: 'tritone-ink-blue-cream',
      halftoneSize: 11,
      bleedDirection: 'to top',
      bleedStrength: 100,
      bleedOpacity: 0.5,
      bleedBlend: 'overlay',
      tintOverlayEnabled: true,
      tintOpacity: 0.7,
    },
    // V1 — direct, blue+cream
    direct_blue_cream: {
      duotoneMode: 'direct',
      tonePair: 'blue-cream',
      halftoneSize: 11,
      bleedDirection: 'to top',
      bleedStrength: 100,
      bleedOpacity: 0.5,
      bleedBlend: 'overlay',
      tintOverlayEnabled: true,
      tintOpacity: 0.5,
    },
    // V5 — crisp, ink+blue
    crisp_ink_blue: {
      duotoneMode: 'crisp',
      tonePair: 'ink-blue',
      halftoneSize: 11,
      bleedDirection: 'to top',
      bleedStrength: 100,
      bleedOpacity: 0.5,
      bleedBlend: 'overlay',
      tintOverlayEnabled: true,
      tintOpacity: 0.65,
    },
    // V8 — duotone bleed, tritone
    bleed_tritone: {
      duotoneMode: 'bleed',
      tonePair: 'tritone-ink-blue-cream',
      halftoneSize: 11,
      bleedDirection: 'to top',
      bleedStrength: 80,
      bleedOpacity: 1,
      bleedBlend: 'color',
      tintOverlayEnabled: true,
      tintOpacity: 0.7,
    },
  };

  // "Auto" cycle order — the original spike visual-testing order.
  const TREATMENT_CYCLE = [
    'bleed_blue_cream',
    'direct_ink_blue',
    'direct_tritone',
    'direct_blue_cream',
    'crisp_ink_blue',
    'bleed_tritone',
  ];

  function seedForIndex(index: number): CardConfig {
    const choice = caseStudiesList.value[index]?.selectedWorkPhotoTreatment;

    if (choice && choice !== 'auto' && TREATMENT_PRESETS[choice]) {
      return TREATMENT_PRESETS[choice];
    }

    return TREATMENT_PRESETS[TREATMENT_CYCLE[index % TREATMENT_CYCLE.length]!]!;
  }

  const caseStudiesList: ComputedRef<WordPressCaseStudy[]> = computed(
    () => props.caseStudies ?? [],
  );

  function classesFromConfig(c: CardConfig): Record<string, boolean> {
    return {
      'is-halftone-duotone-direct': c.duotoneMode === 'direct',
      'is-halftone-duotone-crisp': c.duotoneMode === 'crisp',
      'is-halftone-duotone-bleed': c.duotoneMode === 'bleed',
      [`is-halftone-tone-${c.tonePair}`]: true,
    };
  }

  function styleFromConfig(c: CardConfig): Record<string, string> {
    return {
      // Resting halftone size emitted as -rest so the SCSS layer can swap
      // --halftone-size on hover without inline-style specificity fighting.
      '--halftone-size-rest': `${c.halftoneSize}px`,
      '--halftone-bleed-direction': c.bleedDirection,
      '--halftone-bleed-strength': `${c.bleedStrength}%`,
      '--halftone-bleed-opacity': String(c.bleedOpacity),
      '--halftone-bleed-blend': c.bleedBlend,
      '--halftone-tint-opacity': String(c.tintOpacity),
      '--halftone-tint-angle': `${TINT_ANGLE_LOCKED}deg`,
    };
  }

  type CaseStudyCardSpike = {
    resolveClasses: (index: number) => Record<string, boolean>;
    resolveStyle: (index: number) => Record<string, string>;
    resolveTonePair: (index: number) => string;
    resolveDuotoneMode: (index: number) => string;
    resolveTintOverlayEnabled: (index: number) => boolean;
  };

  provide<CaseStudyCardSpike>('caseStudyCardSpike', {
    resolveClasses: (i) => classesFromConfig(seedForIndex(i)),
    resolveStyle: (i) => styleFromConfig(seedForIndex(i)),
    resolveTonePair: (i) => seedForIndex(i).tonePair,
    resolveDuotoneMode: (i) => seedForIndex(i).duotoneMode,
    resolveTintOverlayEnabled: (i) => seedForIndex(i).tintOverlayEnabled,
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
        <filter id="halftone-tone-blue-cream" color-interpolation-filters="sRGB">
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
        <filter id="halftone-tone-tritone-ink-blue-cream" color-interpolation-filters="sRGB">
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
        <filter id="halftone-tone-tritone-ink-soft-cream" color-interpolation-filters="sRGB">
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
        <filter id="halftone-tone-crisp-ink-cream" color-interpolation-filters="sRGB">
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
        <filter id="halftone-tone-crisp-blue-cream" color-interpolation-filters="sRGB">
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
        <filter id="halftone-tone-crisp-ink-blue" color-interpolation-filters="sRGB">
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
    padding: var(--space-8) 0;
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
    width: 4rem;
    height: 2px;
    margin-left: auto;
    margin-bottom: var(--space-4);
    background: var(--color-primary);
  }

  .title {
    max-width: min(16ch, 70vw);
    margin: 0 0 0 auto;
    font-size: clamp(2rem, 4vw, 3.5rem);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-style: italic;
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.03em;
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
      font-size: clamp(2.6rem, 14vw, 4.5rem);
    }
  }
</style>
