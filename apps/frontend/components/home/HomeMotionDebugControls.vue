<script setup lang="ts">
  const {
    animateAccentRule,
    accentRuleStrength,
    accentRuleTexture,
    accentRuleSpeed,
    accentWaveAmplitude,
    accentWaveFrequency,
    accentRuleThickness,
    accentRuleOffsetX,
    accentRuleOffsetY,
    accentRuleBoxWidth,
    accentRuleBoxHeight,
    lavaThickness,
    lavaLength,
    lavaDispersion,
    lavaParticleReach,
    enableBentoPointerField,
    bentoPointerStrength,
    enableTestimonialTextureParallax,
    testimonialTextureParallaxStrength,
    useQuoteSignal,
    enableCaseStudyAmbientCurrent,
    enableLatestWritingCrosshairRotation,
    enableFooterQuietSignal,
    enableFooterTicker,
    controlsMinimized,
  } = useHomeMotionDebug();

  const isVectorTexture = computed(() =>
    accentRuleTexture.value.startsWith('vector-'),
  );
  const isWaveTexture = computed(
    () =>
      accentRuleTexture.value === 'vector-flag' ||
      accentRuleTexture.value === 'vector-signal',
  );
  const isSheddingLava = computed(
    () => accentRuleTexture.value === 'webgl-lava-shedding',
  );
</script>

<template>
  <aside class="controls" :class="{ 'is-minimized': controlsMinimized }">
    <button
      class="toggle"
      type="button"
      :aria-expanded="!controlsMinimized"
      aria-controls="home-motion-debug-options"
      @click="controlsMinimized = !controlsMinimized"
    >
      <span>Motion QA</span>
      <span aria-hidden="true">{{ controlsMinimized ? '+' : '−' }}</span>
    </button>

    <div
      v-if="!controlsMinimized"
      id="home-motion-debug-options"
      class="options"
    >
      <label class="select-control">
        <span>Rule distortion texture</span>
        <select v-model="accentRuleTexture" :disabled="!animateAccentRule">
          <option value="vector-fluid">Vector fluid ribbon</option>
          <option value="vector-flag">SVG irregular flag wave</option>
          <option value="vector-signal">SVG regular signal wave</option>
          <option value="webgl-flow">WebGL flowing displacement</option>
          <option value="webgl-lava">WebGL lava metaballs</option>
          <option value="webgl-lava-shedding">WebGL shedding lava</option>
        </select>
      </label>
      <label>
        <input v-model="animateAccentRule" type="checkbox" />
        Animate Selected Work rule
      </label>
      <label class="range-control">
        <span>Rule fluidity · {{ accentRuleStrength.toFixed(2) }}</span>
        <input
          v-model.number="accentRuleStrength"
          type="range"
          min="0"
          max="24"
          step="0.1"
          :disabled="!animateAccentRule"
        />
      </label>
      <label class="range-control">
        <span>Rule speed · {{ accentRuleSpeed.toFixed(2) }}×</span>
        <input
          v-model.number="accentRuleSpeed"
          type="range"
          min="0.15"
          max="8"
          step="0.05"
          :disabled="!animateAccentRule"
        />
      </label>
      <label class="range-control">
        <span>Rule X · {{ accentRuleOffsetX }}px</span>
        <input
          v-model.number="accentRuleOffsetX"
          type="range"
          min="-500"
          max="500"
          step="1"
        />
      </label>
      <label class="range-control">
        <span>Rule Y · {{ accentRuleOffsetY }}px</span>
        <input
          v-model.number="accentRuleOffsetY"
          type="range"
          min="-300"
          max="300"
          step="1"
        />
      </label>
      <label class="range-control">
        <span>Rule box width · {{ accentRuleBoxWidth }}px</span>
        <input
          v-model.number="accentRuleBoxWidth"
          type="range"
          min="24"
          max="600"
          step="2"
        />
      </label>
      <label class="range-control">
        <span>Rule box height · {{ accentRuleBoxHeight }}px</span>
        <input
          v-model.number="accentRuleBoxHeight"
          type="range"
          min="6"
          max="180"
          step="2"
        />
      </label>
      <label v-if="isVectorTexture" class="range-control">
        <span>Rule thickness · {{ accentRuleThickness.toFixed(2) }}×</span>
        <input
          v-model.number="accentRuleThickness"
          type="range"
          min="0.5"
          max="10"
          step="0.05"
          :disabled="!animateAccentRule"
        />
      </label>
      <label v-if="isWaveTexture" class="range-control">
        <span>Wave amplitude · {{ accentWaveAmplitude.toFixed(2) }}×</span>
        <input
          v-model.number="accentWaveAmplitude"
          type="range"
          min="0"
          max="8"
          step="0.05"
          :disabled="!animateAccentRule"
        />
      </label>
      <label v-if="isWaveTexture" class="range-control">
        <span>Wave frequency · {{ accentWaveFrequency.toFixed(2) }}×</span>
        <input
          v-model.number="accentWaveFrequency"
          type="range"
          min="0.25"
          max="10"
          step="0.05"
          :disabled="!animateAccentRule"
        />
      </label>
      <template v-if="isSheddingLava">
        <label class="range-control">
          <span>Lava height · {{ lavaThickness.toFixed(2) }}×</span>
          <input
            v-model.number="lavaThickness"
            type="range"
            min="0.35"
            max="8"
            step="0.05"
          />
        </label>
        <label class="range-control">
          <span>Lava body length · {{ lavaLength.toFixed(2) }}×</span>
          <input
            v-model.number="lavaLength"
            type="range"
            min="0.45"
            max="6"
            step="0.05"
          />
        </label>
        <label class="range-control">
          <span>Lava dispersion · {{ lavaDispersion.toFixed(2) }}×</span>
          <input
            v-model.number="lavaDispersion"
            type="range"
            min="0"
            max="8"
            step="0.05"
          />
        </label>
        <label class="range-control">
          <span>Particle reach · {{ lavaParticleReach.toFixed(2) }}×</span>
          <input
            v-model.number="lavaParticleReach"
            type="range"
            min="0.25"
            max="8"
            step="0.05"
          />
        </label>
      </template>
      <label>
        <input v-model="enableCaseStudyAmbientCurrent" type="checkbox" />
        Selected-work blue current
      </label>
      <label>
        <input v-model="enableBentoPointerField" type="checkbox" />
        Latest-writing card proximity
      </label>
      <label>
        <input
          v-model="enableLatestWritingCrosshairRotation"
          type="checkbox"
        />
        Rotate latest-writing crosshair
      </label>
      <label class="range-control">
        <span>Bento proximity · {{ bentoPointerStrength.toFixed(2) }}×</span>
        <input
          v-model.number="bentoPointerStrength"
          type="range"
          min="0"
          max="4"
          step="0.05"
          :disabled="!enableBentoPointerField"
        />
      </label>
      <label>
        <input v-model="enableTestimonialTextureParallax" type="checkbox" />
        Testimonial texture scroll depth
      </label>
      <label class="range-control">
        <span
          >Texture scroll depth ·
          {{ testimonialTextureParallaxStrength.toFixed(2) }}×</span
        >
        <input
          v-model.number="testimonialTextureParallaxStrength"
          type="range"
          min="0"
          max="4"
          step="0.05"
          :disabled="!enableTestimonialTextureParallax"
        />
      </label>
      <label>
        <input v-model="useQuoteSignal" type="checkbox" />
        Use slow quote-mark color wash
      </label>
      <label>
        <input v-model="enableFooterQuietSignal" type="checkbox" />
        Footer quiet signal
      </label>
      <label>
        <input v-model="enableFooterTicker" type="checkbox" />
        Footer heading ticker
      </label>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
  .controls {
    position: fixed;
    right: var(--space-4);
    bottom: var(--space-4);
    z-index: var(--z-higher);
    width: min(19rem, calc(100vw - var(--space-6)));
    border: var(--border-window);
    background: var(--color-surface);
    box-shadow: 4px 4px 0 var(--color-primary);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }

  .controls.is-minimized {
    width: auto;
  }

  .toggle {
    display: flex;
    justify-content: space-between;
    gap: var(--space-5);
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 0;
    background: var(--color-primary);
    color: var(--color-surface);
    font: inherit;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .options {
    display: grid;
    gap: 0.55rem;
    padding: 0.75rem;
  }

  label {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.55rem;
    align-items: start;
    cursor: pointer;
  }

  input {
    margin: 0.1rem 0 0;
    accent-color: var(--color-primary);
  }

  input:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .range-control,
  .select-control {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.3rem;
    margin-top: 0.2rem;
  }

  .range-control input {
    width: 100%;
    margin: 0;
  }

  .select-control select {
    width: 100%;
    min-width: 0;
    border: 1px solid var(--color-ink);
    border-radius: 0;
    background: var(--color-surface);
    color: var(--color-ink);
    font: inherit;
  }
</style>
