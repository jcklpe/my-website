<script setup lang="ts">
  const {
    animateAccentRule,
    accentRuleStrength,
    accentRuleTexture,
    accentRuleSpeed,
    accentWaveFrequency,
    accentRuleThickness,
    lavaThickness,
    lavaLength,
    lavaDispersion,
    lavaParticleReach,
    hybridShedDensity,
    hybridShedForce,
    bentoPointerStrength,
    enableTestimonialTextureParallax,
    testimonialTextureParallaxStrength,
    useQuoteSignal,
    caseStudyOrdinalMotion,
    enableConstructionBanner,
    controlsMinimized,
  } = useHomeMotionDebug();
  const {
    viewport: accentRuleViewport,
    offsetX: accentRuleOffsetX,
    offsetY: accentRuleOffsetY,
    boxWidth: accentRuleBoxWidth,
    boxHeight: accentRuleBoxHeight,
    waveAmplitude: accentWaveAmplitude,
  } = useHomeResponsiveAccentRule();

  const isVectorTexture = computed(
    () =>
      accentRuleTexture.value === 'vector-flag' ||
      accentRuleTexture.value === 'hybrid-flag-shedding',
  );
  const isWaveTexture = computed(() => isVectorTexture.value);
  const isSheddingLava = computed(
    () =>
      accentRuleTexture.value === 'webgl-lava-shedding' ||
      accentRuleTexture.value === 'hybrid-flag-shedding',
  );
  const isHybridTexture = computed(
    () => accentRuleTexture.value === 'hybrid-flag-shedding',
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
      <details class="group" open>
        <summary>Selected Work rule</summary>
        <div class="group-content">
          <label class="select-control">
            <span>Rule distortion texture</span>
            <select v-model="accentRuleTexture" :disabled="!animateAccentRule">
              <option value="vector-flag">SVG irregular flag wave</option>
              <option value="webgl-lava-shedding">WebGL shedding lava</option>
              <option value="hybrid-flag-shedding">
                Irregular flag with shedding lava
              </option>
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
            <span
              >Rule X ({{ accentRuleViewport }}) ·
              {{ accentRuleOffsetX }}px</span
            >
            <input
              v-model.number="accentRuleOffsetX"
              type="range"
              min="-500"
              max="500"
              step="1"
            />
          </label>
          <label class="range-control">
            <span
              >Rule Y ({{ accentRuleViewport }}) ·
              {{ accentRuleOffsetY }}px</span
            >
            <input
              v-model.number="accentRuleOffsetY"
              type="range"
              min="-300"
              max="300"
              step="1"
            />
          </label>
          <label class="range-control">
            <span
              >Rule box width ({{ accentRuleViewport }}) ·
              {{ accentRuleBoxWidth }}px</span
            >
            <input
              v-model.number="accentRuleBoxWidth"
              type="range"
              min="24"
              max="600"
              step="2"
            />
          </label>
          <label class="range-control">
            <span
              >Rule box height ({{ accentRuleViewport }}) ·
              {{ accentRuleBoxHeight }}px</span
            >
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
            <template v-if="isHybridTexture">
              <label class="range-control">
                <span
                  >Rope shed density · {{ hybridShedDensity.toFixed(2) }}</span
                >
                <input
                  v-model.number="hybridShedDensity"
                  type="range"
                  min="0.08"
                  max="1"
                  step="0.01"
                />
              </label>
              <label class="range-control">
                <span>Whip throw · {{ hybridShedForce.toFixed(2) }}×</span>
                <input
                  v-model.number="hybridShedForce"
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.05"
                />
              </label>
            </template>
          </template>
        </div>
      </details>

      <details class="group">
        <summary>Case-study cards</summary>
        <div class="group-content">
          <p class="locked-note">Broad blue current is locked on.</p>
          <label class="select-control">
            <span>Ordinal ambient motion</span>
            <select v-model="caseStudyOrdinalMotion">
              <option value="none">None</option>
              <option value="star">Rotating star</option>
              <option value="wave">Travelling wave</option>
              <option value="brackets">Breathing brackets</option>
            </select>
          </label>
        </div>
      </details>

      <details class="group">
        <summary>Latest Writing</summary>
        <div class="group-content">
          <p class="locked-note">
            Card proximity and crosshair rotation are locked on.
          </p>
          <label class="range-control">
            <span
              >Bento proximity · {{ bentoPointerStrength.toFixed(2) }}×</span
            >
            <input
              v-model.number="bentoPointerStrength"
              type="range"
              min="0"
              max="4"
              step="0.05"
            />
          </label>
        </div>
      </details>

      <details class="group">
        <summary>Testimonials</summary>
        <div class="group-content">
          <label
            ><input
              v-model="enableTestimonialTextureParallax"
              type="checkbox"
            />Testimonial texture pointer / tilt depth</label
          >
          <label class="range-control">
            <span
              >Texture pointer / tilt depth ·
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
          <label
            ><input v-model="useQuoteSignal" type="checkbox" />Use slow
            quote-mark color wash</label
          >
        </div>
      </details>

      <details class="group">
        <summary>Footer and site chrome</summary>
        <div class="group-content">
          <p class="locked-note">
            Quiet signal and heading ticker are locked on.
          </p>
          <label
            ><input
              v-model="enableConstructionBanner"
              type="checkbox"
            />Construction banner</label
          >
        </div>
      </details>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
  .controls {
    position: fixed;
    right: var(--space-4);
    bottom: var(--space-4);
    z-index: var(--z-higher);
    width: min(23rem, calc(100vw - var(--space-6)));
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
    max-height: calc(100vh - 7rem);
    padding: 0.75rem;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-gutter: stable;
  }

  .group {
    border: 1px solid color-mix(in srgb, var(--color-ink) 35%, transparent);
    background: color-mix(in srgb, var(--color-surface) 94%, white);
  }

  .group summary {
    padding: 0.55rem 0.65rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
  }

  .group[open] summary {
    border-bottom: 1px solid
      color-mix(in srgb, var(--color-ink) 35%, transparent);
  }

  .group-content {
    display: grid;
    gap: 0.55rem;
    padding: 0.65rem;
  }

  .locked-note {
    margin: 0;
    color: var(--color-muted);
    line-height: 1.4;
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
