<script setup lang="ts">
  import MotionCaseStudyLab from '~/components/dev/MotionCaseStudyLab.vue';
  import MotionReactionDiffusionStrip from '~/components/dev/MotionReactionDiffusionStrip.vue';

  definePageMeta({ layout: false });

  useHead({
    title: 'Motion Lab',
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  });

  type HoverTreatment =
    | 'parallax'
    | 'partition'
    | 'registration'
    | 'aperture'
    | 'catalog'
    | 'signal';
  type TextTreatment =
    | 'ooze'
    | 'letters-leading'
    | 'letters-plane'
    | 'letters-scroll'
    | 'glyph';

  const { getHomeCaseStudies, getHomeContent, getHomePosts } =
    useHomeSurfacePrefetch();
  const { data: caseStudies } = await useAsyncData(
    'motion-lab-case-studies',
    () => getHomeCaseStudies(),
  );
  const { data: homeContent } = await useAsyncData(
    'motion-lab-home-content',
    () => getHomeContent(),
  );
  const { data: posts } = await useAsyncData('motion-lab-posts', () =>
    getHomePosts(),
  );

  const hoverTreatment = ref<HoverTreatment>('partition');
  const textTreatment = ref<TextTreatment>('ooze');
  const intensity = ref(0.7);
  const oozeStrength = ref(12);
  const enableInsetParallax = ref(true);
  const enableInsetTilt = ref(true);
  const enableEyebrow = ref(true);
  const enableOrganisms = ref(true);
  const entranceKey = ref(0);
  const controlsCollapsed = ref(false);
  const headlinePointerX = ref(0);
  const headlinePointerY = ref(0);
  const insetSample = ref<HTMLElement | null>(null);
  const textSample = ref<HTMLElement | null>(null);
  const entranceSample = ref<HTMLElement | null>(null);
  const textVisible = ref(false);
  const entrancesVisible = ref(false);
  let entranceObserver: IntersectionObserver | null = null;
  let textObserver: IntersectionObserver | null = null;
  let insetFrame = 0;

  const hoverOptions: Array<{ value: HoverTreatment; label: string }> = [
    { value: 'parallax', label: 'Inset parallax' },
    { value: 'partition', label: 'Moving partitions' },
    { value: 'registration', label: 'Print registration' },
    { value: 'aperture', label: 'Aperture reveal' },
    { value: 'catalog', label: 'Catalog shuffle' },
    { value: 'signal', label: 'Project signal' },
  ];

  const textOptions: Array<{ value: TextTreatment; label: string }> = [
    { value: 'ooze', label: 'Oozing displacement' },
    { value: 'letters-leading', label: 'Letters · leading pivot' },
    { value: 'letters-plane', label: 'Letters · flat depth' },
    { value: 'letters-scroll', label: 'Letters · scroll cascade' },
    { value: 'glyph', label: 'Atlas glyph · first draft' },
  ];

  const treatmentNotes: Record<HoverTreatment, string> = {
    parallax:
      'The image behaves like a shallow inset: pointer position shifts the inner field while the card frame remains fixed.',
    partition:
      'Internal panels slide apart and expose a blue structural seam. The card silhouette and measured outer frame do not move.',
    registration:
      'Misregistered ink layers separate briefly, then settle. This is print-process motion rather than a conventional image zoom.',
    aperture:
      'A hard-edged inspection window opens across the image, revealing a brighter second state beneath it.',
    catalog:
      'Clipped index bands reshuffle the project metadata while the primary title stays stable and readable.',
    signal:
      'Every project gets a different signal motif, but all three share the same activation grammar and timing.',
  };

  const rootStyle = computed(() => {
    return {
      '--organism-opacity': Math.min(0.28, 0.2 * intensity.value).toString(),
    };
  });

  onMounted(() => {
    controlsCollapsed.value = window.matchMedia('(max-width: 900px)').matches;
    entranceObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !entrancesVisible.value) {
          entrancesVisible.value = true;
        }
      },
      { threshold: 0.28 },
    );
    if (entranceSample.value) entranceObserver.observe(entranceSample.value);
    textObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) textVisible.value = true;
      },
      { threshold: 0.3 },
    );
    if (textSample.value) textObserver.observe(textSample.value);
    window.addEventListener('scroll', scheduleInsetScroll, { passive: true });
    scheduleInsetScroll();
  });

  onBeforeUnmount(() => {
    entranceObserver?.disconnect();
    textObserver?.disconnect();
    window.removeEventListener('scroll', scheduleInsetScroll);
    window.cancelAnimationFrame(insetFrame);
  });

  function setPointerPosition(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    const element = event.currentTarget as HTMLElement;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    const value = intensity.value;

    headlinePointerX.value = x;
    headlinePointerY.value = y;
    element.style.setProperty('--parallax-x', `${x * -28 * value}px`);
    element.style.setProperty('--parallax-y', `${y * -28 * value}px`);
    element.style.setProperty('--inset-grid-x', `${x * -36 * value}px`);
    element.style.setProperty('--inset-grid-y', `${y * -36 * value}px`);
    element.style.setProperty('--inset-a-x', `${x * -60 * value}px`);
    element.style.setProperty('--inset-a-y', `${y * -60 * value}px`);
    element.style.setProperty('--inset-b-x', `${x * 44 * value}px`);
    element.style.setProperty('--inset-b-y', `${y * 44 * value}px`);
  }

  function resetPointerPosition(event: Event) {
    const element = event.currentTarget as HTMLElement;
    headlinePointerX.value = 0;
    headlinePointerY.value = 0;
    element.style.setProperty('--parallax-x', '0px');
    element.style.setProperty('--parallax-y', '0px');
    element.style.setProperty('--inset-grid-x', '0px');
    element.style.setProperty('--inset-grid-y', '0px');
    element.style.setProperty('--inset-a-x', '0px');
    element.style.setProperty('--inset-a-y', '0px');
    element.style.setProperty('--inset-b-x', '0px');
    element.style.setProperty('--inset-b-y', '0px');
  }

  function replayEntrances() {
    entrancesVisible.value = false;
    entranceKey.value += 1;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        entrancesVisible.value = true;
      });
    });
  }

  function letterStyle(index: number) {
    const pivot = textTreatment.value === 'letters-leading' ? 1 : 0;
    const distance = index - pivot;
    const direction =
      textTreatment.value === 'letters-plane' ? index : distance;
    const x = headlinePointerX.value * direction * 1.45 * intensity.value;
    const y = headlinePointerY.value * direction * 0.8 * intensity.value;

    return {
      '--letter-order': index,
      transform: `translate(${x}px, ${y}px)`,
    };
  }

  function scheduleInsetScroll() {
    window.cancelAnimationFrame(insetFrame);
    insetFrame = window.requestAnimationFrame(updateInsetScroll);
  }

  function updateInsetScroll() {
    const element = insetSample.value;
    if (!element || !enableInsetParallax.value) return;

    const bounds = element.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const elementCenter = bounds.top + bounds.height / 2;
    const progress = Math.max(
      -1,
      Math.min(1, (elementCenter - viewportCenter) / window.innerHeight),
    );
    const scrollShift = progress * -34 * intensity.value;
    const tilt = enableInsetTilt.value ? progress * -1.1 * intensity.value : 0;
    element.style.setProperty('--inset-scroll-y', `${scrollShift}px`);
    element.style.setProperty('--inset-scroll-a', `${scrollShift * 0.72}px`);
    element.style.setProperty('--inset-scroll-b', `${scrollShift * -0.48}px`);
    element.style.setProperty('--inset-scroll-tilt', `${tilt}deg`);
  }

  watch([enableInsetParallax, enableInsetTilt, intensity], () =>
    scheduleInsetScroll(),
  );
</script>

<template>
  <div class="motion-lab" :style="rootStyle">
    <svg class="filter-definitions" aria-hidden="true">
      <filter id="motion-lab-ooze" x="-20%" y="-30%" width="140%" height="160%">
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
        />
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
        <output>{{ Math.round(intensity * 100) }}%</output>
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
          <span>Card treatment</span>
          <select v-model="hoverTreatment">
            <option
              v-for="option in hoverOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>

        <label>
          <span>Text treatment</span>
          <select v-model="textTreatment">
            <option
              v-for="option in textOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>

        <label>
          <span>Intensity</span>
          <input
            v-model.number="intensity"
            type="range"
            min="0.25"
            max="1.25"
            step="0.05"
          />
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

        <label class="check"
          ><input v-model="enableInsetParallax" type="checkbox" /> Inset scroll
          depth</label
        >
        <label class="check"
          ><input v-model="enableInsetTilt" type="checkbox" /> Inset tilt</label
        >
        <label class="check"
          ><input v-model="enableEyebrow" type="checkbox" /> RD eyebrow</label
        >
        <label class="check"
          ><input v-model="enableOrganisms" type="checkbox" /> Margin
          organisms</label
        >
        <button type="button" @click="replayEntrances">Replay entrances</button>
      </div>
    </aside>

    <main>
      <section class="specimen card-specimen" aria-labelledby="card-heading">
        <div class="section-heading">
          <p>01 · Interaction grammar</p>
          <h2 id="card-heading">Case-study hover</h2>
          <span>{{ treatmentNotes[hoverTreatment] }}</span>
        </div>

        <MotionCaseStudyLab
          :case-studies="caseStudies ?? []"
          :treatment="hoverTreatment"
          :intensity="intensity"
        />
      </section>

      <section
        ref="textSample"
        class="specimen text-specimen"
        aria-labelledby="text-heading"
      >
        <div class="section-heading">
          <p>02 · Text as material</p>
          <h2 id="text-heading">Display motion</h2>
          <span
            >Keep semantic text untouched; animate only a display-sized
            duplicate or its individual letters.</span
          >
        </div>

        <div
          class="headline-stage"
          :class="[`is-${textTreatment}`, { 'is-text-visible': textVisible }]"
          @pointermove="setPointerPosition"
          @pointerleave="resetPointerPosition"
        >
          <p class="headline-label">Selected work</p>
          <div class="headline" aria-label="Selected work">
            <template v-if="textTreatment.startsWith('letters-')">
              <span
                v-for="(letter, index) in 'Selected work'.split('')"
                :key="`${letter}-${index}`"
                :style="letterStyle(index)"
                aria-hidden="true"
                >{{ letter === ' ' ? '\u00a0' : letter }}</span
              >
            </template>
            <span v-else aria-hidden="true">Selected work</span>
          </div>
          <svg
            v-if="textTreatment === 'glyph'"
            class="atlas-glyph"
            viewBox="0 0 120 120"
            aria-hidden="true"
          >
            <circle cx="60" cy="60" r="43" />
            <path d="M60 8v104M8 60h104M26 26l68 68M94 26 26 94" />
            <circle class="orbit" cx="60" cy="17" r="5" />
          </svg>
        </div>
      </section>

      <section
        class="specimen structural-specimen"
        aria-labelledby="structural-heading"
      >
        <div class="section-heading">
          <p>03 · Structural accents</p>
          <h2 id="structural-heading">Eyebrow and inset</h2>
          <span
            >The accent can be alive without asking body text or the whole page
            to deform.</span
          >
        </div>

        <div class="structural-grid">
          <article class="article-sample">
            <div v-if="enableEyebrow" class="rd-eyebrow">
              <MotionReactionDiffusionStrip :intensity="intensity" />
            </div>
            <p v-else class="static-eyebrow">Field note 04</p>
            <h3>An organism used as punctuation</h3>
            <p>
              The narrow simulation reads as a living swatch above editorial
              content. It is intentionally too small to become another
              background field.
            </p>
          </article>

          <div
            ref="insetSample"
            class="inset-sample"
            :class="{
              'has-depth': enableInsetParallax,
              'has-tilt': enableInsetTilt,
            }"
            @pointermove="setPointerPosition"
            @pointerleave="resetPointerPosition"
          >
            <div class="inset-scene" aria-hidden="true">
              <span class="inset-grid" />
              <span class="inset-shape shape-a" />
              <span class="inset-shape shape-b" />
              <span class="inset-marker">A–17</span>
            </div>
            <p>
              Clipped-image parallax: the frame stays architectural while the
              scene moves behind it.
            </p>
          </div>
        </div>
      </section>

      <section
        ref="entranceSample"
        class="specimen entrance-specimen"
        aria-labelledby="entrance-heading"
      >
        <div class="section-heading">
          <p>04 · Choreographed arrival</p>
          <h2 id="entrance-heading">Rows and testimony</h2>
          <span
            >One entrance on arrival, then stillness. Replay it from the debug
            controls.</span
          >
        </div>

        <div
          :key="entranceKey"
          class="destination-samples"
          :class="{ 'is-entered': entrancesVisible }"
        >
          <section class="writing-destination">
            <header>
              <p>Writing archive specimen</p>
              <h3>Latest writing</h3>
            </header>
            <WritingArchiveList :posts="(posts ?? []).slice(0, 4)" />
          </section>

          <HomeEmployerTestimonials
            class="testimonial-destination"
            :testimonials="homeContent?.employerTestimonials ?? []"
            :testimonials-texture="homeContent?.testimonialsTexture ?? 'dots'"
          />
        </div>
      </section>

      <section
        class="specimen organism-specimen"
        :class="{ 'is-disabled': !enableOrganisms }"
        aria-labelledby="organism-heading"
      >
        <div class="section-heading">
          <p>05 · Interior ambience</p>
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
              :intensity="intensity"
              :columns="72"
              :rows="116"
              :warmup-steps="760"
              :step-ms="72"
            />
          </div>
          <div
            v-if="enableOrganisms"
            class="organism organism-b"
            aria-hidden="true"
          >
            <MotionReactionDiffusionStrip
              :intensity="intensity"
              :columns="72"
              :rows="116"
              :warmup-steps="690"
              :step-ms="78"
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
    padding: 0.9rem;
    color: white;
    background: rgba(12, 17, 43, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0.4rem 0.4rem 0 var(--lab-blue);
    backdrop-filter: blur(10px);
  }

  .control-heading,
  .controls label:not(.check) {
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

  .headline-stage.is-ooze .headline {
    color: #b9caff;
    filter: url('#motion-lab-ooze');
  }

  .headline-stage.is-letters-leading .headline > span,
  .headline-stage.is-letters-plane .headline > span,
  .headline-stage.is-letters-scroll .headline > span {
    transition: transform 180ms ease-out;
  }

  .headline-stage.is-letters-scroll .headline > span {
    opacity: 0;
    transform: translateY(0.8em);
  }

  .headline-stage.is-letters-scroll.is-text-visible .headline > span {
    animation: letter-scroll-arrive 720ms var(--snappy-ease-out) both;
    animation-delay: calc(var(--letter-order, 0) * 45ms);
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
    grid-template-columns: 0.8fr 1.2fr;
    gap: 2rem;
  }

  .article-sample {
    padding: clamp(2rem, 5vw, 4rem);
    background: rgba(248, 246, 240, 0.92);
    border: 2px solid var(--lab-ink);
  }

  .rd-eyebrow {
    width: 9rem;
    height: 1.4rem;
    margin-bottom: 2rem;
    overflow: hidden;
    background: rgba(185, 202, 255, 0.32);
    border-left: 4px solid var(--lab-blue);
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
    --inset-grid-x: 0px;
    --inset-grid-y: 0px;
    --inset-a-x: 0px;
    --inset-a-y: 0px;
    --inset-b-x: 0px;
    --inset-b-y: 0px;
    --inset-scroll-y: 0px;
    --inset-scroll-a: 0px;
    --inset-scroll-b: 0px;
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

  .inset-grid,
  .inset-shape,
  .inset-marker {
    position: absolute;
    transition: transform 350ms ease-out;
  }

  .inset-grid {
    inset: -10%;
    background:
      linear-gradient(rgba(17, 24, 47, 0.2) 1px, transparent 1px),
      linear-gradient(90deg, rgba(17, 24, 47, 0.2) 1px, transparent 1px);
    background-size: 28px 28px;
  }

  .inset-shape {
    border: 3px solid var(--lab-blue);
    border-radius: 50%;
  }

  .shape-a {
    width: 42%;
    aspect-ratio: 1;
    top: 10%;
    left: 12%;
  }

  .shape-b {
    width: 34%;
    aspect-ratio: 0.65;
    right: 10%;
    bottom: 4%;
    border-color: var(--lab-ink);
    transform: rotate(32deg);
  }

  .inset-marker {
    top: 1.2rem;
    right: 1.2rem;
    font-family: var(--font-mono);
  }

  .inset-sample.has-depth .inset-grid {
    transform: translate(
        var(--inset-grid-x),
        calc(var(--inset-grid-y) + var(--inset-scroll-y))
      )
      rotate(var(--inset-scroll-tilt)) scale(1.12);
  }

  .inset-sample.has-depth .shape-a {
    transform: translate(
      var(--inset-a-x),
      calc(var(--inset-a-y) + var(--inset-scroll-a))
    );
  }

  .inset-sample.has-depth .shape-b {
    transform: translate(
        var(--inset-b-x),
        calc(var(--inset-b-y) + var(--inset-scroll-b))
      )
      rotate(calc(32deg - var(--inset-scroll-tilt)));
  }

  .inset-sample > p {
    max-width: 56ch;
    padding-top: 1.2rem;
    line-height: 1.45;
  }

  .destination-samples {
    display: grid;
    gap: var(--space-8);
  }

  .writing-destination {
    padding: var(--space-6);
    background: var(--color-surface-soft);
    border: var(--border-window);
  }

  .writing-destination header {
    margin-bottom: var(--space-5);
  }

  .writing-destination header p {
    margin-bottom: var(--space-2);
    color: var(--lab-blue);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .writing-destination header h3 {
    font-family: var(--font-mono);
    font-size: clamp(1.8rem, 4vw, 3rem);
    font-style: italic;
  }

  .destination-samples :deep(.row-item),
  .destination-samples :deep(.testimonial) {
    clip-path: inset(0 0 100% 0);
    transform: translateY(1rem);
    transition:
      clip-path 620ms var(--snappy-ease-out),
      transform 620ms var(--snappy-ease-out);
  }

  .destination-samples.is-entered :deep(.row-item),
  .destination-samples.is-entered :deep(.testimonial) {
    clip-path: inset(0);
    transform: translateY(0);
  }

  .destination-samples :deep(.row-item:nth-child(2)),
  .destination-samples :deep(.testimonial:nth-child(2)) {
    transition-delay: 90ms;
  }

  .destination-samples :deep(.row-item:nth-child(3)),
  .destination-samples :deep(.testimonial:nth-child(3)) {
    transition-delay: 180ms;
  }

  .destination-samples :deep(.row-item:nth-child(4)),
  .destination-samples :deep(.testimonial:nth-child(4)) {
    transition-delay: 270ms;
  }

  .testimonial-destination {
    margin-inline: 0;
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
    width: 18rem;
    height: 28rem;
    opacity: max(0.28, var(--organism-opacity));
    animation: organism-drift 13s ease-in-out infinite alternate;
    -webkit-mask-image: radial-gradient(ellipse, #000 20%, transparent 72%);
    mask-image: radial-gradient(ellipse, #000 20%, transparent 72%);
  }

  .organism-a {
    top: -4%;
    left: -8rem;
  }

  .organism-b {
    right: -9rem;
    bottom: -8%;
    animation-delay: -6.5s;
  }

  .organism-specimen.is-disabled .organism {
    display: none;
  }

  @keyframes glyph-turn {
    to {
      transform: rotate(1turn);
    }
  }

  @keyframes letter-scroll-arrive {
    from {
      opacity: 0;
      transform: translateY(0.8em);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes organism-drift {
    from {
      transform: translate3d(-5%, -7%, 0) rotate(-4deg) scale(0.92);
    }
    to {
      transform: translate3d(9%, 11%, 0) rotate(5deg) scale(1.08);
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

    .section-heading,
    .project-grid,
    .structural-grid,
    .entrance-grid {
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
    .headline-stage.is-letters .headline > span,
    .inset-grid,
    .inset-shape,
    .inset-marker {
      transition: none;
      transform: none;
    }

    .headline-stage.is-ooze .headline,
    .organism {
      filter: none;
    }

    .atlas-glyph,
    .writing-list li,
    .testimony,
    .organism {
      animation: none;
    }
  }
</style>
