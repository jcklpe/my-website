<script setup lang="ts">
  import MotionCaseStudyLab from '~/components/dev/MotionCaseStudyLab.vue';
  import MotionCaseStudyHalftoneFilters from '~/components/dev/MotionCaseStudyHalftoneFilters.vue';
  import MotionReactionDiffusionStrip from '~/components/dev/MotionReactionDiffusionStrip.vue';

  definePageMeta({ layout: false });

  useHead({
    title: 'Motion Lab',
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  });

  type CardOverlay = 'none' | 'catalog';
  type TextEffect = 'none' | 'ooze' | 'accent-ooze' | 'glyph';
  const { getHomeCaseStudies } = useHomeSurfacePrefetch();
  const { data: caseStudies } = await useAsyncData(
    'motion-lab-case-studies',
    () => getHomeCaseStudies(),
  );
  const cardOverlay = ref<CardOverlay>('catalog');
  const enableCaseParallax = ref(true);
  const enablePhotoColor = ref(true);
  const useOriginalCaseMedia = ref(false);
  const caseParallaxShift = ref(48);
  const textEffect = ref<TextEffect>('none');
  const oozeStrength = ref(12);
  const oozeSpeed = ref(1.4);
  const oozePhase = ref(0);
  const enableEyebrow = ref(true);
  const enableOrganisms = ref(true);
  const controlsCollapsed = ref(false);
  let oozeAnimationFrame = 0;
  let previousOozeTime = 0;

  const cardOverlayOptions: Array<{ value: CardOverlay; label: string }> = [
    { value: 'none', label: 'None' },
    { value: 'catalog', label: 'Catalog shuffle' },
  ];

  const textEffectOptions: Array<{ value: TextEffect; label: string }> = [
    { value: 'none', label: 'None' },
    { value: 'ooze', label: 'Oozing displacement' },
    { value: 'accent-ooze', label: 'Ooze Selected Work rule' },
    { value: 'glyph', label: 'Atlas glyph · rejected draft' },
  ];

  const treatmentNotes: Record<CardOverlay, string> = {
    none: 'No overlay. Use this to judge the independent inset-image parallax and image-source controls by themselves.',
    catalog:
      'Approved project-discipline and engagement-context metadata enters in staggered clipped bands while the inset image moves independently beneath it.',
  };

  onMounted(() => {
    controlsCollapsed.value = window.matchMedia('(max-width: 900px)').matches;
    oozeAnimationFrame = window.requestAnimationFrame(animateOoze);
  });

  onBeforeUnmount(() => {
    window.cancelAnimationFrame(oozeAnimationFrame);
  });

  function animateOoze(time: number) {
    const delta = previousOozeTime
      ? Math.min((time - previousOozeTime) / 1000, 0.05)
      : 0;
    previousOozeTime = time;
    oozePhase.value += delta * oozeSpeed.value;
    oozeAnimationFrame = window.requestAnimationFrame(animateOoze);
  }

  const oozeRulePath = computed(() => {
    const amplitude = 0.35 + (oozeStrength.value / 48) * 3.65;
    const y = (offset: number) =>
      (6 + Math.sin(oozePhase.value + offset) * amplitude).toFixed(2);

    return `M 2 ${y(0)} C 12 ${y(0.15)}, 12 ${y(0.85)}, 22 ${y(1)} S 32 ${y(1.85)}, 42 ${y(2)} S 52 ${y(2.85)}, 62 ${y(3)} S 72 ${y(3.85)}, 82 ${y(4)} S 92 ${y(4.85)}, 102 ${y(5)} S 112 ${y(5.85)}, 118 ${y(6)}`;
  });
</script>

<template>
  <div class="motion-lab">
    <MotionCaseStudyHalftoneFilters />
    <svg class="filter-definitions" aria-hidden="true">
      <filter
        id="motion-lab-ooze"
        x="-24%"
        y="-40%"
        width="148%"
        height="180%"
        color-interpolation-filters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.009 0.025"
          numOctaves="2"
          seed="7"
          result="noise"
        >
          <animate
            attributeName="baseFrequency"
            dur="18s"
            values="0.009 0.025;0.013 0.019;0.009 0.025"
            repeatCount="indefinite"
          />
        </feTurbulence>
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          :scale="oozeStrength"
          xChannelSelector="R"
          yChannelSelector="B"
          result="displaced"
        />
        <feGaussianBlur in="displaced" stdDeviation="0.28" />
      </filter>
    </svg>

    <header class="intro">
      <NuxtLink class="back-link" to="/">← Back to site</NuxtLink>
      <p class="kicker">Development specimen · motion</p>
      <h1>Living atlas laboratory</h1>
      <p class="lede">
        Real CMS content in production-like compositions, with deliberately
        exaggerated controls. Choose one treatment at a time; nothing here is a
        production decision.
      </p>
    </header>

    <aside
      class="controls"
      :class="{ 'is-collapsed': controlsCollapsed }"
      aria-label="Motion lab controls"
    >
      <div class="control-heading">
        <span>Debug controls</span>
        <output>Lab 02</output>
        <button
          class="collapse-button"
          type="button"
          :aria-expanded="!controlsCollapsed"
          @click="controlsCollapsed = !controlsCollapsed"
        >
          {{ controlsCollapsed ? 'Open' : 'Close' }}
        </button>
      </div>

      <div v-show="!controlsCollapsed" class="control-body">
        <label>
          <span>Card overlay</span>
          <select v-model="cardOverlay">
            <option
              v-for="option in cardOverlayOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="check">
          <input v-model="enableCaseParallax" type="checkbox" /> Inset-image
          parallax
        </label>

        <fieldset>
          <legend>Existing color-on-hover</legend>
          <label class="radio">
            <input v-model="enablePhotoColor" type="radio" :value="true" />
            On
          </label>
          <label class="radio">
            <input v-model="enablePhotoColor" type="radio" :value="false" />
            Off
          </label>
        </fieldset>

        <fieldset>
          <legend>Case image source</legend>
          <label class="radio">
            <input v-model="useOriginalCaseMedia" type="radio" :value="false" />
            Baked halftone
          </label>
          <label class="radio">
            <input v-model="useOriginalCaseMedia" type="radio" :value="true" />
            CMS original + duotone
          </label>
        </fieldset>

        <label>
          <span>Case-study depth travel · {{ caseParallaxShift }}px</span>
          <input
            v-model.number="caseParallaxShift"
            type="range"
            min="0"
            max="120"
            step="2"
          />
        </label>

        <label>
          <span>Text surface effect</span>
          <select v-model="textEffect">
            <option
              v-for="option in textEffectOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>

        <label>
          <span>Ooze displacement · {{ oozeStrength }}</span>
          <input
            v-model.number="oozeStrength"
            type="range"
            min="2"
            max="48"
            step="1"
          />
        </label>

        <label>
          <span>Ooze speed · {{ oozeSpeed.toFixed(1) }}×</span>
          <input
            v-model.number="oozeSpeed"
            type="range"
            min="0.2"
            max="4"
            step="0.1"
          />
        </label>

        <label class="check"
          ><input v-model="enableEyebrow" type="checkbox" /> RD eyebrow</label
        >
        <label class="check"
          ><input v-model="enableOrganisms" type="checkbox" /> Margin
          organisms</label
        >
      </div>
    </aside>

    <main>
      <section class="specimen card-specimen" aria-labelledby="card-heading">
        <div class="section-heading">
          <p>01 · Interaction grammar</p>
          <h2 id="card-heading">Case-study hover</h2>
          <span>{{ treatmentNotes[cardOverlay] }}</span>
        </div>

        <MotionCaseStudyLab
          :case-studies="caseStudies ?? []"
          :overlay="cardOverlay"
          :enable-parallax="enableCaseParallax"
          :enable-photo-color="enablePhotoColor"
          :use-original-media="useOriginalCaseMedia"
          :parallax-shift="caseParallaxShift"
        />
      </section>

      <section class="specimen text-specimen" aria-labelledby="text-heading">
        <div class="section-heading">
          <p>02 · Text as material</p>
          <h2 id="text-heading">Display motion</h2>
          <span
            >Keep semantic text untouched; animate only a display-sized
            duplicate or its individual letters.</span
          >
        </div>

        <div class="headline-stage" :class="`is-effect-${textEffect}`">
          <p class="headline-label">Selected work</p>
          <div
            class="headline"
            aria-label="Selected work"
            data-label="Selected work"
          >
            <span aria-hidden="true">Selected work</span>
          </div>
          <svg
            v-if="textEffect === 'glyph'"
            class="atlas-glyph"
            viewBox="0 0 120 120"
            aria-hidden="true"
          >
            <circle cx="60" cy="60" r="43" />
            <path d="M60 8v104M8 60h104M26 26l68 68M94 26 26 94" />
            <circle class="orbit" cx="60" cy="17" r="5" />
          </svg>
        </div>

        <div
          class="homepage-text-context"
          :class="{
            'has-ooze': textEffect === 'ooze',
            'has-ooze-rule': textEffect === 'accent-ooze',
          }"
        >
          <section class="selected-work-preview">
            <svg
              class="preview-rule"
              viewBox="0 0 120 12"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path :d="textEffect === 'accent-ooze' ? oozeRulePath : 'M 2 6 H 118'" />
            </svg>
            <h3 data-label="Selected work">Selected work</h3>
            <p>Homepage-scale display heading over the paper-grid ground.</p>
          </section>
          <section class="latest-writing-preview">
            <header>
              <h3 data-label="Latest writing">Latest writing</h3>
              <span class="preview-symbol" aria-hidden="true" />
            </header>
            <p>
              The same displacement inside the actual two-rule banner scale.
            </p>
          </section>
        </div>
      </section>

      <section
        class="specimen structural-specimen"
        aria-labelledby="structural-heading"
      >
        <div class="section-heading">
          <p>03 · Structural accents</p>
          <h2 id="structural-heading">Living eyebrow</h2>
          <span
            >The accent can be alive without asking body text or the whole page
            to deform.</span
          >
        </div>

        <div class="structural-grid">
          <article class="article-sample">
            <div v-if="enableEyebrow" class="rd-eyebrow">
              <MotionReactionDiffusionStrip
                mode="eyebrow"
                :columns="240"
                :rows="36"
                :warmup-steps="0"
                :step-ms="33"
              />
            </div>
            <p v-else class="static-eyebrow">Field note 04</p>
            <h3>An organism used as punctuation</h3>
            <p>
              The narrow simulation reads as a living swatch above editorial
              content. It is intentionally too small to become another
              background field.
            </p>
          </article>
        </div>
      </section>

      <section
        class="specimen organism-specimen"
        :class="{ 'is-disabled': !enableOrganisms }"
        aria-labelledby="organism-heading"
      >
        <div class="section-heading">
          <p>04 · Interior ambience</p>
          <h2 id="organism-heading">Sparse margin organisms</h2>
          <span
            >Reserved for empty margins, clipped aggressively, and absent when
            the content needs the space.</span
          >
        </div>

        <div class="article-ground">
          <div
            v-if="enableOrganisms"
            class="organism organism-a"
            aria-hidden="true"
          >
            <MotionReactionDiffusionStrip
              mode="organism"
              :columns="96"
              :rows="146"
              :warmup-steps="0"
              :step-ms="30"
            />
          </div>
          <div
            v-if="enableOrganisms"
            class="organism organism-b"
            aria-hidden="true"
          >
            <MotionReactionDiffusionStrip
              mode="organism"
              :columns="96"
              :rows="146"
              :warmup-steps="0"
              :step-ms="34"
            />
          </div>
          <article>
            <p class="article-kicker">Working paper · August 2026</p>
            <h3>The page is the habitat</h3>
            <p>
              Ambient organisms should feel discovered at the edge of the
              composition, not placed behind every paragraph. This specimen
              deliberately leaves most of the article ground quiet.
            </p>
            <p>
              These are live reaction-diffusion fields on transparent canvases,
              masked into the empty margins and allowed to drift like slow lava.
            </p>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
  .motion-lab {
    --lab-blue: var(--color-primary, #2657eb);
    --lab-ink: var(--color-ink, #11182f);
    --lab-paper: var(--color-paper, #f8f6f0);
    min-height: 100vh;
    overflow-x: clip;
    color: var(--lab-ink);
    background:
      linear-gradient(rgba(38, 87, 235, 0.055) 1px, transparent 1px),
      linear-gradient(90deg, rgba(38, 87, 235, 0.055) 1px, transparent 1px),
      var(--lab-paper);
    background-size: 24px 24px;
  }

  .filter-definitions {
    position: absolute;
    width: 0;
    height: 0;
  }

  .intro,
  main {
    width: min(1320px, calc(100% - 3rem));
    margin-inline: auto;
  }

  .intro {
    min-height: 72vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 5rem 0 4rem;
    border-bottom: 2px solid var(--lab-ink);
  }

  .back-link,
  .kicker,
  .section-heading > p,
  .controls,
  .discipline,
  .number,
  .article-kicker {
    font-family: var(--font-mono);
    font-size: 0.76rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .back-link {
    position: absolute;
    top: 1.5rem;
    color: inherit;
  }

  .kicker,
  .section-heading > p,
  .number,
  .article-kicker {
    color: var(--lab-blue);
  }

  h1,
  h2,
  h3,
  p {
    margin: 0;
  }

  h1 {
    max-width: 10ch;
    margin-top: 0.8rem;
    font-family: var(--font-bodoni), serif;
    font-size: clamp(4rem, 10vw, 10rem);
    font-weight: 400;
    line-height: 0.78;
    letter-spacing: -0.045em;
  }

  .lede {
    max-width: 58ch;
    margin-top: 2.5rem;
    font-size: clamp(1rem, 1.5vw, 1.3rem);
    line-height: 1.5;
  }

  .controls {
    box-sizing: border-box;
    position: fixed;
    z-index: var(--z-higher, 900);
    top: 1rem;
    right: 1rem;
    width: min(18rem, calc(100vw - 2rem));
    max-height: calc(100vh - 2rem);
    padding: 0.9rem;
    overflow-y: auto;
    color: white;
    background: rgba(12, 17, 43, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0.4rem 0.4rem 0 var(--lab-blue);
    backdrop-filter: blur(10px);
  }

  .control-heading,
  .controls label:not(.check):not(.radio) {
    display: grid;
    gap: 0.35rem;
  }

  .control-heading {
    grid-template-columns: 1fr auto auto;
    align-items: center;
    margin-bottom: 0.7rem;
    color: #b9caff;
  }

  .controls.is-collapsed .control-heading {
    margin-bottom: 0;
  }

  .controls .collapse-button {
    width: auto;
    min-height: 0;
    padding: 0;
    margin: 0 0 0 0.55rem;
    color: inherit;
    background: transparent;
    border: 0;
    text-decoration: underline;
  }

  .controls label {
    margin-top: 0.65rem;
  }

  .controls fieldset {
    display: flex;
    gap: 1rem;
    margin: 0.75rem 0 0;
    padding: 0.55rem;
    border: 1px solid #7f9cff;
  }

  .controls legend {
    padding-inline: 0.25rem;
  }

  .controls .radio {
    margin: 0;
    text-transform: none;
  }

  .controls .radio input {
    accent-color: #6f91ff;
  }

  .controls select,
  .controls button {
    width: 100%;
    min-height: 2.2rem;
    padding: 0.4rem 0.55rem;
    color: white;
    background: #11182f;
    border: 1px solid #7f9cff;
    border-radius: 0;
    font: inherit;
  }

  .controls input[type='range'] {
    width: 100%;
    accent-color: #6f91ff;
  }

  .controls .check {
    display: block;
    text-transform: none;
    letter-spacing: 0.02em;
  }

  .controls .check input {
    accent-color: #6f91ff;
  }

  .controls button {
    margin-top: 0.8rem;
    cursor: pointer;
  }

  .specimen {
    padding: clamp(5rem, 10vw, 9rem) 0;
    border-bottom: 2px solid var(--lab-ink);
  }

  .card-specimen {
    width: calc(100vw - var(--space-6) - var(--space-6));
    margin-left: calc(50% - 50vw + var(--space-6));
  }

  .card-specimen > .section-heading {
    width: min(1320px, 100%);
    margin-inline: auto;
  }

  .section-heading {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(16rem, 0.65fr);
    gap: 1rem 3rem;
    align-items: end;
    margin-bottom: 3rem;
  }

  .section-heading > p {
    grid-column: 1 / -1;
  }

  .section-heading h2 {
    font-family: var(--font-bodoni), serif;
    font-size: clamp(2.8rem, 6vw, 6.2rem);
    font-weight: 400;
    line-height: 0.88;
    letter-spacing: -0.025em;
  }

  .section-heading > span {
    max-width: 50ch;
    padding-bottom: 0.35rem;
    line-height: 1.5;
  }

  .project-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
  }

  .project-card {
    --parallax-x: 0px;
    --parallax-y: 0px;
    position: relative;
    background: rgba(248, 246, 240, 0.96);
    border: 2px solid var(--lab-ink);
    outline-offset: 4px;
  }

  .media {
    position: relative;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: #d9e1f8;
    border-bottom: 2px solid var(--lab-ink);
  }

  .visual,
  .registration-layer,
  .aperture-layer,
  .partitions,
  .signal,
  .catalog {
    position: absolute;
    inset: 0;
  }

  .base-visual {
    transform: scale(1.08);
    transition: transform 650ms var(--snappy-ease-out);
    background:
      radial-gradient(
        circle at 28% 32%,
        rgba(38, 87, 235, 0.9) 0 7%,
        transparent 7.5%
      ),
      radial-gradient(
        circle at 70% 68%,
        rgba(17, 24, 47, 0.88) 0 12%,
        transparent 12.5%
      ),
      linear-gradient(
        135deg,
        transparent 0 38%,
        rgba(38, 87, 235, 0.28) 38% 58%,
        transparent 58%
      ),
      #d9e1f8;
  }

  .visual-archive .base-visual {
    background:
      repeating-linear-gradient(
        90deg,
        transparent 0 13%,
        rgba(17, 24, 47, 0.85) 13% 17%,
        transparent 17% 25%
      ),
      linear-gradient(158deg, #d9e1f8 0 48%, #2657eb 48% 67%, #b8c7ef 67%);
  }

  .visual-field .base-visual {
    background:
      radial-gradient(ellipse at 20% 80%, #11182f 0 11%, transparent 11.5%),
      radial-gradient(ellipse at 78% 25%, #2657eb 0 18%, transparent 18.5%),
      repeating-radial-gradient(
        circle at 52% 52%,
        transparent 0 9px,
        rgba(38, 87, 235, 0.28) 10px 12px
      ),
      #d9e1f8;
  }

  .terrain {
    position: absolute;
    border: 1px solid rgba(17, 24, 47, 0.7);
    border-radius: 50%;
  }

  .terrain-a {
    width: 44%;
    aspect-ratio: 1.7;
    top: 20%;
    left: 10%;
    transform: rotate(-18deg);
  }

  .terrain-b {
    width: 34%;
    aspect-ratio: 0.8;
    right: 9%;
    bottom: 8%;
    transform: rotate(24deg);
  }

  .axis {
    position: absolute;
    background: rgba(17, 24, 47, 0.42);
  }

  .axis-x {
    width: 100%;
    height: 1px;
    top: 50%;
  }

  .axis-y {
    width: 1px;
    height: 100%;
    left: 50%;
  }

  .card-copy {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.35rem 0.8rem;
    min-height: 13.5rem;
    padding: 1.25rem;
  }

  .card-copy .discipline {
    text-align: right;
  }

  .card-copy h3,
  .card-copy > p:last-child {
    grid-column: 1 / -1;
  }

  .card-copy h3 {
    margin-top: 1.2rem;
    font-family: var(--font-bodoni), serif;
    font-size: clamp(1.8rem, 3vw, 2.8rem);
    font-weight: 400;
    line-height: 0.95;
  }

  .card-copy > p:last-child {
    align-self: end;
    line-height: 1.4;
  }

  .project-card.is-parallax:is(:hover, :focus-visible) .base-visual {
    transform: translate(var(--parallax-x), var(--parallax-y)) scale(1.15);
  }

  .partitions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    opacity: 0;
  }

  .partitions span {
    background: rgba(248, 246, 240, 0.34);
    border-right: 1px solid var(--lab-blue);
    transition: transform 520ms var(--snappy-ease-out);
  }

  .project-card.is-partition .partitions {
    opacity: 1;
  }

  .project-card.is-partition:is(:hover, :focus-visible)
    .partitions
    span:nth-child(1) {
    transform: translateX(var(--partition-left));
  }

  .project-card.is-partition:is(:hover, :focus-visible)
    .partitions
    span:nth-child(2) {
    transform: translateY(var(--partition-y));
  }

  .project-card.is-partition:is(:hover, :focus-visible)
    .partitions
    span:nth-child(3) {
    transform: translateX(var(--partition-x));
  }

  .registration-layer {
    opacity: 0;
    background: inherit;
    mix-blend-mode: multiply;
    transition:
      transform 260ms steps(3),
      opacity 150ms linear;
  }

  .project-card.is-registration .registration-layer {
    opacity: 0.42;
    background:
      radial-gradient(circle at 28% 32%, #2657eb 0 7%, transparent 7.5%),
      linear-gradient(
        135deg,
        transparent 0 38%,
        rgba(38, 87, 235, 0.7) 38% 58%,
        transparent 58%
      );
  }

  .project-card.is-registration:is(:hover, :focus-visible) .registration-layer {
    transform: translate(var(--registration-x), var(--registration-y));
  }

  .aperture-layer {
    opacity: 0;
    clip-path: inset(42% 50% 42% 50%);
    background:
      repeating-linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.28) 0 5px,
        transparent 5px 11px
      ),
      #2657eb;
    transition:
      clip-path 620ms var(--snappy-ease-out),
      opacity 100ms linear;
  }

  .project-card.is-aperture .aperture-layer {
    opacity: 1;
  }

  .project-card.is-aperture:is(:hover, :focus-visible) .aperture-layer {
    clip-path: inset(var(--aperture-inset) 12%);
  }

  .catalog {
    display: grid;
    align-content: end;
    gap: 2px;
    padding: 0.75rem;
    opacity: 0;
    pointer-events: none;
  }

  .catalog span {
    width: max-content;
    max-width: 100%;
    padding: 0.2rem 0.4rem;
    overflow: hidden;
    color: white;
    background: var(--lab-ink);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    text-overflow: clip;
    white-space: nowrap;
    transform: translateX(-115%);
    transition: transform 420ms var(--snappy-ease-out);
  }

  .project-card.is-catalog .catalog {
    opacity: 1;
  }

  .project-card.is-catalog:is(:hover, :focus-visible) .catalog span {
    transform: translateX(0);
  }

  .project-card.is-catalog .catalog span:nth-child(2) {
    transition-delay: 55ms;
  }

  .project-card.is-catalog .catalog span:nth-child(3) {
    color: var(--lab-ink);
    background: #b9caff;
    transition-delay: 110ms;
  }

  .signal {
    display: none;
  }

  .project-card.is-signal .signal {
    display: block;
  }

  .signal i {
    position: absolute;
    display: block;
    background: var(--lab-blue);
    transition:
      transform 500ms var(--snappy-ease-out),
      opacity 300ms linear;
  }

  .signal-route i {
    width: 2px;
    height: 28%;
    left: calc(13% * var(--i, 1));
    bottom: 8%;
    transform-origin: bottom;
  }

  .signal-route i:nth-child(1) {
    left: 12%;
  }
  .signal-route i:nth-child(2) {
    left: 24%;
  }
  .signal-route i:nth-child(3) {
    left: 36%;
  }
  .signal-route i:nth-child(4) {
    left: 48%;
  }
  .signal-route i:nth-child(5) {
    left: 60%;
  }
  .signal-route i:nth-child(6) {
    left: 72%;
  }
  .signal-route i:nth-child(7) {
    left: 84%;
  }

  .project-card:is(:hover, :focus-visible) .signal-route i:nth-child(odd) {
    transform: scaleY(2.2);
  }

  .signal-scan i {
    width: 72%;
    height: 1px;
    left: 14%;
    top: calc(10% + 11% * var(--i, 1));
  }

  .signal-scan i:nth-child(1) {
    top: 15%;
  }
  .signal-scan i:nth-child(2) {
    top: 27%;
  }
  .signal-scan i:nth-child(3) {
    top: 39%;
  }
  .signal-scan i:nth-child(4) {
    top: 51%;
  }
  .signal-scan i:nth-child(5) {
    top: 63%;
  }
  .signal-scan i:nth-child(6) {
    top: 75%;
  }
  .signal-scan i:nth-child(7) {
    top: 87%;
  }

  .project-card:is(:hover, :focus-visible) .signal-scan i {
    transform: translateX(var(--signal-shift));
  }

  .signal-pulse i {
    width: 10px;
    aspect-ratio: 1;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0.2);
    opacity: 0;
  }

  .project-card:is(:hover, :focus-visible) .signal-pulse i {
    opacity: 0.75;
    transform: translate(-50%, -50%) scale(var(--pulse-scale, 1));
  }

  .signal-pulse i:nth-child(1) {
    --pulse-scale: var(--pulse-1);
    transition-delay: 0ms;
  }
  .signal-pulse i:nth-child(2) {
    --pulse-scale: var(--pulse-2);
    transition-delay: 40ms;
  }
  .signal-pulse i:nth-child(3) {
    --pulse-scale: var(--pulse-3);
    transition-delay: 80ms;
  }
  .signal-pulse i:nth-child(4) {
    --pulse-scale: var(--pulse-4);
    transition-delay: 120ms;
  }
  .signal-pulse i:nth-child(5) {
    --pulse-scale: var(--pulse-5);
    transition-delay: 160ms;
  }
  .signal-pulse i:nth-child(6) {
    --pulse-scale: var(--pulse-6);
    transition-delay: 200ms;
  }
  .signal-pulse i:nth-child(7) {
    --pulse-scale: var(--pulse-7);
    transition-delay: 240ms;
  }

  .headline-stage {
    position: relative;
    min-height: 29rem;
    display: grid;
    place-content: center;
    overflow: hidden;
    color: white;
    background: var(--lab-ink);
    border: 2px solid var(--lab-ink);
  }

  .headline-label {
    position: absolute;
    top: 1rem;
    left: 1rem;
    color: #b9caff;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
  }

  .headline {
    position: relative;
    z-index: 1;
    display: flex;
    font-family: var(--font-bodoni), serif;
    font-size: clamp(3rem, 9vw, 8rem);
    line-height: 0.85;
    letter-spacing: -0.06em;
    white-space: nowrap;
  }

  .headline-stage.is-effect-ooze .headline {
    color: transparent;
  }

  .headline-stage.is-effect-ooze .headline::after,
  .homepage-text-context.has-ooze h3::after {
    content: attr(data-label);
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    color: #b9caff;
    font: inherit;
    font-size: 200%;
    line-height: inherit;
    letter-spacing: inherit;
    white-space: inherit;
    transform: scale(0.5);
    transform-origin: top left;
    filter: url('#motion-lab-ooze');
    pointer-events: none;
  }

  .homepage-text-context {
    display: grid;
    gap: var(--space-9);
    margin-top: var(--space-8);
    padding-block: var(--space-8);
  }

  .selected-work-preview {
    position: relative;
    padding-inline: var(--space-6);
  }

  .selected-work-preview h3 {
    position: relative;
    max-width: 8ch;
    font-family: var(--font-mono);
    font-size: clamp(3rem, 8.5vw, 9rem);
    font-style: italic;
    line-height: 0.95;
    letter-spacing: -0.04em;
  }

  .preview-rule {
    display: block;
    width: clamp(4rem, 7vw, 7rem);
    height: 0.75rem;
    margin: 0 0 var(--space-4) auto;
    overflow: visible;
  }

  .preview-rule path {
    fill: none;
    stroke: var(--lab-blue);
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }

  .selected-work-preview p,
  .latest-writing-preview > p {
    margin-top: var(--space-4);
    color: var(--color-muted);
  }

  .latest-writing-preview {
    border-block: 1px solid var(--lab-blue);
  }

  .latest-writing-preview header {
    position: relative;
    display: flex;
    align-items: center;
    padding: var(--space-4) var(--space-6);
    background: var(--color-surface);
  }

  .latest-writing-preview h3 {
    position: relative;
    z-index: 1;
    font-family: var(--font-mono);
    font-size: clamp(2.1rem, 3.5vw, 2.95rem);
    font-style: italic;
    line-height: 1;
  }

  .preview-symbol {
    position: absolute;
    right: var(--space-6);
    width: clamp(4rem, 7vw, 6rem);
    aspect-ratio: 1;
    border: 1px solid var(--lab-blue);
    border-radius: 50%;
  }

  .latest-writing-preview > p {
    padding: 0 var(--space-6) var(--space-5);
  }

  .homepage-text-context.has-ooze h3 {
    color: transparent;
  }

  .atlas-glyph {
    position: absolute;
    width: min(18rem, 35vw);
    right: 5%;
    bottom: -9%;
    fill: none;
    stroke: var(--lab-blue);
    stroke-width: 1.5;
    animation: glyph-turn 24s linear infinite;
  }

  .atlas-glyph .orbit {
    fill: #b9caff;
    stroke: none;
  }

  .structural-grid {
    display: grid;
    grid-template-columns: minmax(0, 46rem);
    gap: 2rem;
  }

  .article-sample {
    padding: clamp(2rem, 5vw, 4rem);
    background: rgba(248, 246, 240, 0.92);
    border: 2px solid var(--lab-ink);
  }

  .rd-eyebrow {
    width: min(18rem, 82%);
    height: 2.25rem;
    margin: -1.25rem 0 1.25rem;
    overflow: hidden;
    -webkit-mask-image: linear-gradient(
      90deg,
      transparent,
      #000 12%,
      #000 88%,
      transparent
    );
    mask-image: linear-gradient(
      90deg,
      transparent,
      #000 12%,
      #000 88%,
      transparent
    );
  }

  .rd-eyebrow :deep(.rd-strip) {
    transform: translate3d(-4%, 0, 0) scale(1.12);
    animation: eyebrow-display-drift 5s ease-in-out infinite alternate;
    will-change: transform;
  }

  .static-eyebrow {
    margin-bottom: 2rem;
    color: var(--lab-blue);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
  }

  .article-sample h3,
  .article-ground h3 {
    font-family: var(--font-bodoni), serif;
    font-size: clamp(2.4rem, 5vw, 4.8rem);
    font-weight: 400;
    line-height: 0.9;
  }

  .article-sample > p:last-child,
  .article-ground article > p {
    margin-top: 1.5rem;
    line-height: 1.65;
  }

  .inset-sample {
    --inset-image-x: 0px;
    --inset-image-y: 0px;
    --inset-scroll-y: 0px;
    --inset-scroll-tilt: 0deg;
    display: grid;
    grid-template-rows: 1fr auto;
    min-height: 34rem;
    padding: 1.2rem;
    color: white;
    background: var(--lab-ink);
  }

  .inset-scene {
    position: relative;
    overflow: hidden;
    background: #b9caff;
    clip-path: polygon(0 0, 100% 0, 100% 86%, 90% 100%, 0 100%);
  }

  .inset-scene img,
  .inset-marker {
    position: absolute;
    transition: transform 520ms var(--snappy-ease-out);
  }

  .inset-scene img {
    inset: -7%;
    width: 114%;
    height: 114%;
    object-fit: cover;
  }

  .inset-marker {
    top: 1.2rem;
    right: 1.2rem;
    font-family: var(--font-mono);
  }

  .inset-sample.has-depth .inset-scene img {
    transform: translate(
        var(--inset-image-x),
        calc(var(--inset-image-y) + var(--inset-scroll-y))
      )
      rotate(var(--inset-scroll-tilt)) scale(1.12);
  }

  .inset-sample > p {
    max-width: 56ch;
    padding-top: 1.2rem;
    line-height: 1.45;
  }

  .article-ground {
    position: relative;
    min-height: 42rem;
    padding: 5rem 0;
    overflow: hidden;
    background: rgba(248, 246, 240, 0.72);
    border-block: 1px solid var(--lab-ink);
  }

  .article-ground article {
    position: relative;
    z-index: 1;
    width: min(38rem, calc(100% - 3rem));
    margin-inline: auto;
    padding: 2rem;
    background: var(--lab-paper);
  }

  .organism {
    position: absolute;
    width: 24rem;
    height: 34rem;
    opacity: 0.3;
    -webkit-mask-image: radial-gradient(
      ellipse,
      #000 24%,
      rgba(0, 0, 0, 0.58) 46%,
      transparent 72%
    );
    mask-image: radial-gradient(
      ellipse,
      #000 24%,
      rgba(0, 0, 0, 0.58) 46%,
      transparent 72%
    );
  }

  .organism :deep(.rd-strip) {
    transform: translate3d(-5%, -3%, 0) scale(1.16);
    animation: organism-display-drift 6s ease-in-out infinite alternate;
    will-change: transform;
  }

  .organism-a {
    top: -10%;
    left: -11rem;
  }

  .organism-b {
    right: -12rem;
    bottom: -14%;
  }

  .organism-specimen.is-disabled .organism {
    display: none;
  }

  @keyframes glyph-turn {
    to {
      transform: rotate(1turn);
    }
  }

  @keyframes eyebrow-display-drift {
    to {
      transform: translate3d(4%, 0, 0) scale(1.12);
    }
  }

  @keyframes organism-display-drift {
    to {
      transform: translate3d(5%, 3%, 0) scale(1.16);
    }
  }

  @media (max-width: 900px) {
    .intro,
    main {
      width: min(100% - 2rem, 44rem);
    }

    .intro {
      min-height: 60vh;
      padding-bottom: 3rem;
    }

    .controls {
      position: sticky;
      top: 0;
      width: 100%;
      box-shadow: none;
    }

    .card-specimen {
      width: calc(100vw - 2rem);
      margin-left: calc(50% - 50vw + 1rem);
    }

    .section-heading,
    .project-grid,
    .structural-grid {
      grid-template-columns: 1fr;
    }

    .project-card {
      max-width: 36rem;
    }

    .headline-stage {
      min-height: 20rem;
    }

    .headline {
      font-size: clamp(2.7rem, 14vw, 5rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .base-visual,
    .partitions span,
    .registration-layer,
    .aperture-layer,
    .catalog span,
    .signal i,
    .inset-scene img,
    .inset-marker {
      transition: none;
      transform: none;
    }

    .headline-stage.is-effect-ooze .headline::after,
    .homepage-text-context.has-ooze h3::after,
    .organism {
      filter: none;
    }

    .headline-stage.is-effect-ooze .headline {
      color: #b9caff;
    }

    .homepage-text-context.has-ooze h3 {
      color: inherit;
    }

    .headline-stage.is-effect-ooze .headline::after,
    .homepage-text-context.has-ooze h3::after {
      display: none;
    }

    .homepage-text-context.has-ooze-rule .preview-rule path {
      d: path('M 2 6 H 118');
    }

    .atlas-glyph,
    .rd-eyebrow :deep(.rd-strip),
    .organism,
    .organism :deep(.rd-strip) {
      animation: none;
    }
  }
</style>
