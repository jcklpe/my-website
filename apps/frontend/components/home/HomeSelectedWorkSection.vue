<script setup lang="ts">
  import type { ComputedRef, WritableComputedRef } from 'vue';
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

  // SPIKE: case-study card duotone/halftone live controls. Each card carries
  // its own independent config; the radio group selects which card the
  // global controls panel currently edits. Cards are seeded from the
  // comparison-matrix variants 1..7 so the home page starts with visible
  // variance. Removed with the rest of the case-hero spike scaffolding.
  type DuotoneMode = 'off' | 'direct' | 'crisp' | 'bleed';
  type TonePair =
    | 'ink-cream'
    | 'blue-cream'
    | 'ink-blue'
    | 'tritone-ink-blue-cream'
    | 'tritone-ink-soft-cream';
  type BleedDirection = 'to top' | 'to bottom' | 'to left' | 'to right';

  type CardLayout =
    | 'floating'
    | 'specimen-plate'
    | 'editorial-split'
    | 'ribbon'
    | 'bleed-band';

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
    tintAngle: number;
    hoverReveals: boolean;
    titleCream: boolean;
    layout: CardLayout;
  };

  // Gradient tint angle is locked at this value across all seeds and at
  // runtime — 189deg maximizes legibility because the gradient's brightness
  // axis aligns near-vertical, putting the darker stop at the top of the
  // image and the lighter stop at the bottom where text sits.
  const TINT_ANGLE_LOCKED = 189;

  // Seed presets — initial-state-only. Once a card is edited via the panel
  // the live config diverges from these. Order is the seed-cycling order
  // (card 0 = first seed, card 1 = second, etc.).
  const SEED_PRESETS: CardConfig[] = [
    // V7 — duotone bleed, blue+cream, ink title
    {
      duotoneMode: 'bleed',
      tonePair: 'blue-cream',
      halftoneSize: 11,
      bleedDirection: 'to top',
      bleedStrength: 80,
      bleedOpacity: 1,
      bleedBlend: 'color',
      tintOverlayEnabled: true,
      tintOpacity: 0.7,
      tintAngle: TINT_ANGLE_LOCKED,
      hoverReveals: false,
      titleCream: false,
      layout: 'floating',
    },
    // V2 — direct, ink+blue, cream title
    {
      duotoneMode: 'direct',
      tonePair: 'ink-blue',
      halftoneSize: 11,
      bleedDirection: 'to top',
      bleedStrength: 100,
      bleedOpacity: 0.5,
      bleedBlend: 'overlay',
      tintOverlayEnabled: true,
      tintOpacity: 0.7,
      tintAngle: TINT_ANGLE_LOCKED,
      hoverReveals: false,
      titleCream: true,
      layout: 'floating',
    },
    // V3 — direct, tritone, ink title
    {
      duotoneMode: 'direct',
      tonePair: 'tritone-ink-blue-cream',
      halftoneSize: 11,
      bleedDirection: 'to top',
      bleedStrength: 100,
      bleedOpacity: 0.5,
      bleedBlend: 'overlay',
      tintOverlayEnabled: true,
      tintOpacity: 0.7,
      tintAngle: TINT_ANGLE_LOCKED,
      hoverReveals: false,
      titleCream: false,
      layout: 'floating',
    },
    // V1 — direct, blue+cream, ink title
    {
      duotoneMode: 'direct',
      tonePair: 'blue-cream',
      halftoneSize: 11,
      bleedDirection: 'to top',
      bleedStrength: 100,
      bleedOpacity: 0.5,
      bleedBlend: 'overlay',
      tintOverlayEnabled: true,
      tintOpacity: 0.5,
      tintAngle: TINT_ANGLE_LOCKED,
      hoverReveals: false,
      titleCream: false,
      layout: 'floating',
    },
    // V5 — crisp, ink+blue, cream title
    {
      duotoneMode: 'crisp',
      tonePair: 'ink-blue',
      halftoneSize: 11,
      bleedDirection: 'to top',
      bleedStrength: 100,
      bleedOpacity: 0.5,
      bleedBlend: 'overlay',
      tintOverlayEnabled: true,
      tintOpacity: 0.65,
      tintAngle: TINT_ANGLE_LOCKED,
      hoverReveals: false,
      titleCream: true,
      layout: 'floating',
    },
    // V8 — duotone bleed, tritone, ink title
    {
      duotoneMode: 'bleed',
      tonePair: 'tritone-ink-blue-cream',
      halftoneSize: 11,
      bleedDirection: 'to top',
      bleedStrength: 80,
      bleedOpacity: 1,
      bleedBlend: 'color',
      tintOverlayEnabled: true,
      tintOpacity: 0.7,
      tintAngle: TINT_ANGLE_LOCKED,
      hoverReveals: false,
      titleCream: false,
      layout: 'floating',
    },
  ];

  function seedForIndex(index: number): CardConfig {
    return { ...SEED_PRESETS[index % SEED_PRESETS.length]! };
  }

  const caseStudiesList: ComputedRef<WordPressCaseStudy[]> = computed(
    () => props.caseStudies ?? [],
  );

  // Per-card persistent config. Lazy-seeded as case studies appear.
  const cardConfigs = ref<Record<number, CardConfig>>({});
  watch(
    caseStudiesList,
    (list) => {
      const next = { ...cardConfigs.value };
      list.forEach((_, i) => {
        if (!next[i]) {
          next[i] = seedForIndex(i);
        }
      });
      cardConfigs.value = next;
    },
    { immediate: true },
  );

  const activeCardIndex = ref(0);

  function configForIndex(index: number): CardConfig {
    return cardConfigs.value[index] ?? seedForIndex(index);
  }

  function updateActive<K extends keyof CardConfig>(
    key: K,
    value: CardConfig[K],
  ): void {
    const i = activeCardIndex.value;
    const current = configForIndex(i);
    cardConfigs.value = {
      ...cardConfigs.value,
      [i]: { ...current, [key]: value },
    };
  }

  // Two-way bindings routed through the active card. The panel's v-models
  // read/write the active card; switching the radio reroutes to a different
  // card's stored state.
  function activeRef<K extends keyof CardConfig>(
    key: K,
  ): WritableComputedRef<CardConfig[K]> {
    return computed({
      get: () => configForIndex(activeCardIndex.value)[key],
      set: (value) => updateActive(key, value),
    });
  }

  const duotoneMode = activeRef('duotoneMode');
  const tonePair = activeRef('tonePair');
  const halftoneSize = activeRef('halftoneSize');
  const bleedDirection = activeRef('bleedDirection');
  const bleedStrength = activeRef('bleedStrength');
  const bleedOpacity = activeRef('bleedOpacity');
  const bleedBlend = activeRef('bleedBlend');
  const tintOverlayEnabled = activeRef('tintOverlayEnabled');
  const tintOpacity = activeRef('tintOpacity');
  // tintAngle is locked at TINT_ANGLE_LOCKED — no panel binding.
  const hoverReveals = activeRef('hoverReveals');
  const titleCream = activeRef('titleCream');
  const layout = activeRef('layout');

  const LAYOUT_OPTIONS: { value: CardLayout; label: string }[] = [
    { value: 'floating', label: 'A · floating (current)' },
    { value: 'specimen-plate', label: 'B · specimen plate' },
    { value: 'editorial-split', label: 'C · editorial split' },
    { value: 'ribbon', label: 'D · ribbon (excerpt on solid)' },
    { value: 'bleed-band', label: 'E · bleed band (scrim)' },
  ];

  function classesFromConfig(c: CardConfig): Record<string, boolean> {
    return {
      'is-halftone-duotone-direct': c.duotoneMode === 'direct',
      'is-halftone-duotone-crisp': c.duotoneMode === 'crisp',
      'is-halftone-duotone-bleed': c.duotoneMode === 'bleed',
      [`is-halftone-tone-${c.tonePair}`]: true,
      'is-halftone-hover-reveals': c.hoverReveals,
    };
  }

  function styleFromConfig(c: CardConfig): Record<string, string> {
    return {
      '--halftone-size': `${c.halftoneSize}px`,
      '--halftone-bleed-direction': c.bleedDirection,
      '--halftone-bleed-strength': `${c.bleedStrength}%`,
      '--halftone-bleed-opacity': String(c.bleedOpacity),
      '--halftone-bleed-blend': c.bleedBlend,
      '--halftone-tint-opacity': String(c.tintOpacity),
      // Tint angle locked — see TINT_ANGLE_LOCKED above.
      '--halftone-tint-angle': `${TINT_ANGLE_LOCKED}deg`,
    };
  }

  type CaseStudyCardSpike = {
    resolveClasses: (index: number) => Record<string, boolean>;
    resolveStyle: (index: number) => Record<string, string>;
    resolveTonePair: (index: number) => string;
    resolveDuotoneMode: (index: number) => string;
    resolveTintOverlayEnabled: (index: number) => boolean;
    resolveTitleCream: (index: number) => boolean;
    resolveLayout: (index: number) => string;
  };

  provide<CaseStudyCardSpike>('caseStudyCardSpike', {
    resolveClasses: (i) => classesFromConfig(configForIndex(i)),
    resolveStyle: (i) => styleFromConfig(configForIndex(i)),
    resolveTonePair: (i) => configForIndex(i).tonePair,
    resolveDuotoneMode: (i) => configForIndex(i).duotoneMode,
    resolveTintOverlayEnabled: (i) => configForIndex(i).tintOverlayEnabled,
    resolveTitleCream: (i) => configForIndex(i).titleCream,
    resolveLayout: (i) => configForIndex(i).layout,
  });

  function resetActiveToSeed(): void {
    const i = activeCardIndex.value;
    cardConfigs.value = { ...cardConfigs.value, [i]: seedForIndex(i) };
  }
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

    <!-- SPIKE: duotone / legibility controls. The radio group selects which
         card the panel is currently editing; each card's config persists
         when not active. Removed with the rest of the spike. -->
    <details open class="duotone-controls">
      <summary>Case-study card duotone / legibility controls (spike)</summary>

      <fieldset
        v-if="caseStudiesList.length"
        class="active-card-picker"
      >
        <legend>Editing card</legend>
        <label
          v-for="(caseStudy, index) in caseStudiesList"
          :key="caseStudy.id"
          class="active-card-radio"
          :title="caseStudy.title"
        >
          <input
            type="radio"
            name="active-case-study-card"
            :value="index"
            :checked="activeCardIndex === index"
            @change="activeCardIndex = index"
          />
          <span>#{{ index + 1 }} · {{ caseStudy.title }}</span>
        </label>
        <button type="button" class="reset-button" @click="resetActiveToSeed">
          Reset to seed
        </button>
      </fieldset>

      <fieldset class="layout-picker">
        <legend>Layout (active card)</legend>
        <label
          v-for="option in LAYOUT_OPTIONS"
          :key="option.value"
          class="layout-radio"
          :title="option.label"
        >
          <input
            type="radio"
            name="case-study-card-layout"
            :value="option.value"
            :checked="layout === option.value"
            @change="layout = option.value"
          />
          <span>{{ option.label }}</span>
        </label>
      </fieldset>

      <div class="duotone-controls-row">
        <label class="duotone-control">
          <span>Mode</span>
          <select v-model="duotoneMode">
            <option value="off">Off (full CMYK)</option>
            <option value="direct">Direct duotone (linear)</option>
            <option value="crisp">Crisp duotone (engraving, 2-color only)</option>
            <option value="bleed">Duotone bleed</option>
          </select>
        </label>
        <label class="duotone-control">
          <span>Tone pair</span>
          <select v-model="tonePair">
            <option value="ink-cream">duotone · ink + cream</option>
            <option value="blue-cream">duotone · signal-blue + cream</option>
            <option value="ink-blue">duotone · ink + signal-blue</option>
            <option value="tritone-ink-blue-cream">
              tritone · ink + signal-blue + cream
            </option>
            <option value="tritone-ink-soft-cream">
              tritone · ink + signal-soft + cream
            </option>
          </select>
        </label>
        <label class="duotone-control duotone-control-toggle">
          <input v-model="hoverReveals" type="checkbox" />
          <span>Hover reveals full color</span>
        </label>
        <label class="duotone-control duotone-control-toggle">
          <input v-model="tintOverlayEnabled" type="checkbox" />
          <span>Gradient tint overlay</span>
        </label>
        <label class="duotone-control duotone-control-toggle">
          <input v-model="titleCream" type="checkbox" />
          <span>Cream title (vs. ink)</span>
        </label>
      </div>
      <div class="duotone-controls-row">
        <label class="duotone-control">
          <span>Halftone size</span>
          <input
            v-model.number="halftoneSize"
            type="range"
            min="4"
            max="80"
            step="1"
          />
          <output>{{ halftoneSize }}px</output>
        </label>
      </div>
      <div v-if="duotoneMode === 'bleed'" class="duotone-controls-row">
        <label class="duotone-control">
          <span>Bleed direction</span>
          <select v-model="bleedDirection">
            <option value="to top">to top</option>
            <option value="to bottom">to bottom</option>
            <option value="to left">to left</option>
            <option value="to right">to right</option>
          </select>
        </label>
        <label class="duotone-control">
          <span>Bleed blend</span>
          <select v-model="bleedBlend">
            <option value="overlay">overlay</option>
            <option value="soft-light">soft-light</option>
            <option value="multiply">multiply</option>
            <option value="screen">screen</option>
            <option value="color">color</option>
            <option value="hue">hue</option>
          </select>
        </label>
        <label class="duotone-control">
          <span>Bleed strength</span>
          <input
            v-model.number="bleedStrength"
            type="range"
            min="0"
            max="100"
            step="1"
          />
          <output>{{ bleedStrength }}%</output>
        </label>
        <label class="duotone-control">
          <span>Bleed opacity</span>
          <input
            v-model.number="bleedOpacity"
            type="range"
            min="0"
            max="1"
            step="0.05"
          />
          <output>{{ bleedOpacity.toFixed(2) }}</output>
        </label>
      </div>
      <div v-if="tintOverlayEnabled" class="duotone-controls-row">
        <label class="duotone-control">
          <span>Tint opacity</span>
          <input
            v-model.number="tintOpacity"
            type="range"
            min="0"
            max="1"
            step="0.05"
          />
          <output>{{ tintOpacity.toFixed(2) }}</output>
        </label>
        <span class="duotone-control duotone-control-note">
          Tint angle locked at {{ TINT_ANGLE_LOCKED }}deg for legibility.
        </span>
      </div>
    </details>

    <div class="section-label">
      <h2 class="title">Selected work</h2>
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

  // SPIKE: duotone controls panel styling. Removed with the rest of the
  // spike scaffolding.
  .duotone-controls {
    position: sticky;
    top: 0;
    z-index: 10;
    max-height: 80vh;
    margin: 0 var(--space-6) var(--space-6);
    padding: var(--space-3) var(--space-5);
    background: var(--color-surface-warm);
    border: 1px solid var(--color-muted);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    color: var(--color-ink);
    overflow-y: auto;
  }

  .duotone-controls > summary {
    cursor: pointer;
    color: var(--color-muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .active-card-picker {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-3);
    margin-top: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border: 1px dashed var(--color-muted);
  }

  .active-card-picker > legend {
    padding: 0 var(--space-2);
    color: var(--color-muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .active-card-radio {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 2px 8px;
    border: 1px solid var(--color-muted);
    cursor: pointer;
    user-select: none;
    max-width: 18rem;
  }

  .active-card-radio:has(input:checked) {
    background: var(--color-primary);
    color: var(--color-surface);
    border-color: var(--color-primary);
  }

  .active-card-radio input {
    margin: 0;
    accent-color: var(--color-primary);
  }

  .active-card-radio > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reset-button {
    padding: 2px 8px;
    background: transparent;
    border: 1px solid var(--color-muted);
    color: var(--color-muted);
    font: inherit;
    cursor: pointer;
  }

  .reset-button:hover {
    color: var(--color-ink);
    border-color: var(--color-ink);
  }

  .layout-picker {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-3);
    margin-top: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: 1px dashed var(--color-muted);
  }

  .layout-picker > legend {
    padding: 0 var(--space-2);
    color: var(--color-muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .layout-radio {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 2px 8px;
    border: 1px solid var(--color-muted);
    cursor: pointer;
    user-select: none;
  }

  .layout-radio:has(input:checked) {
    background: var(--color-primary);
    color: var(--color-surface);
    border-color: var(--color-primary);
  }

  .layout-radio input {
    margin: 0;
    accent-color: var(--color-primary);
  }

  .duotone-controls-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-4);
    margin-top: var(--space-2);
    padding-top: var(--space-2);
    border-top: 1px dashed var(--color-muted);
  }

  .duotone-control {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  .duotone-control > span {
    color: var(--color-ink);
  }

  .duotone-control input[type='range'] {
    width: 11rem;
  }

  .duotone-control output {
    min-width: 3.2rem;
    font-variant-numeric: tabular-nums;
    color: var(--color-primary);
  }

  .duotone-control select {
    padding: 2px 6px;
    background: var(--color-surface);
    border: 1px solid var(--color-muted);
    color: var(--color-ink);
    font: inherit;
  }

  .duotone-control-note {
    color: var(--color-muted);
    font-style: italic;
  }

  @include breakpoint(phone) {
    .selected-work-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-label {
      margin-inline: var(--space-4);
    }

    .title {
      font-size: clamp(2.6rem, 14vw, 4.5rem);
    }

    .duotone-controls {
      margin-inline: var(--space-4);
    }
  }
</style>
