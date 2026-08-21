<script setup lang="ts">
  import type { WordPressCaseStudy } from '~/types/wordpress';
  import {
    hasCaseStudyHalftoneMedia,
    mediaSourceUrlForWidth,
  } from '~/utils/featured-media';

  // Layout variants for the text-dominant Selected Work composition (score
  // v7): text plates are the section's steady vertical rhythm; the case
  // study's own hero image interrupts horizontally — as a full banner above
  // the text row, or as an inline plate beside it (left or right).
  // plateAlign docks the text block within its plate for extra horizontal
  // rhythm.
  const props = withDefaults(
    defineProps<{
      caseStudy: WordPressCaseStudy;
      cardIndex?: number;
      isFirstCard?: boolean;
      layout?: 'banner' | 'photo-left' | 'photo-right';
      plateAlign?: 'left' | 'right';
      enableBrowseMotion?: boolean;
      enableAmbientCurrent?: boolean;
      enableOrdinalStar?: boolean;
      enableOrdinalWave?: boolean;
      enableOrbitDots?: boolean;
      enableBreathingBrackets?: boolean;
      enableRotatingDial?: boolean;
    }>(),
    {
      cardIndex: 0,
      isFirstCard: false,
      layout: 'banner',
      plateAlign: 'left',
      enableBrowseMotion: false,
      enableAmbientCurrent: false,
      enableOrdinalStar: false,
      enableOrdinalWave: false,
      enableOrbitDots: false,
      enableBreathingBrackets: false,
      enableRotatingDial: false,
    },
  );

  // SPIKE: duotone/halftone seed config injected by host (the home page's
  // Selected Work section). When absent the card falls back to a baseline
  // halftone-only treatment. Removed with the rest of the case-hero spike.
  type CaseStudyCardSpike = {
    resolveClasses: (index: number) => Record<string, boolean>;
    resolveStyle: (index: number) => Record<string, string>;
    resolveTonePair: (index: number) => string;
    resolveDuotoneMode: (index: number) => string;
    resolveTintOverlayEnabled: (index: number) => boolean;
  };
  const spike = inject<CaseStudyCardSpike | null>('caseStudyCardSpike', null);
  const spikeClasses = computed(() =>
    spike ? spike.resolveClasses(props.cardIndex) : {},
  );
  const spikeStyle = computed(() =>
    spike ? spike.resolveStyle(props.cardIndex) : {},
  );
  const spikeTonePairClass = computed(() =>
    spike ? `is-halftone-tone-${spike.resolveTonePair(props.cardIndex)}` : '',
  );
  const isBleedMode = computed(
    () => spike?.resolveDuotoneMode(props.cardIndex) === 'bleed',
  );
  const isTintOverlayEnabled = computed(
    () => spike?.resolveTintOverlayEnabled(props.cardIndex) ?? false,
  );
  const hasBakedHalftone = computed(() =>
    hasCaseStudyHalftoneMedia(props.caseStudy.featuredMedia),
  );
  const usesBakedHalftone = computed(() => hasBakedHalftone.value);
  const kLayerSourceUrl = computed(() =>
    hasBakedHalftone.value
      ? ''
      : mediaSourceUrlForWidth(props.caseStudy.featuredMedia, 1200),
  );

  // Transition system coupling: this card participates in the featured-media
  // card-to-detail transition. useFeaturedMediaTransition reads geometry from
  // this card's FeaturedMediaFrame and data-transition-source attribute.
  // The detail target is case-studies/[slug].vue. See also:
  // composables/useFeaturedMediaTransition.ts
  // components/transitions/FeaturedMediaTransitionLayer.vue
  const { navigateWithFeaturedMediaTransition } = useFeaturedMediaTransition();
  const { prefetchCaseStudy, prefetchCaseStudyFromViewport } =
    useContentDetailPrefetch();
  const transitionState = useFeaturedMediaTransitionState();
  const cardElement = ref<HTMLElement | null>(null);
  const isMobileActive = ref(false);
  let motionObserver: IntersectionObserver | null = null;
  let motionFrame = 0;
  const motionTarget = { x: 0, y: 0 };
  const motionPosition = { x: 0, y: 0 };
  const BROWSE_TRAVEL = 28;
  const catalogPractice = computed(
    () =>
      props.caseStudy.selectedWorkPractice?.trim() || 'Practice / discipline',
  );
  const catalogContext = computed(
    () =>
      props.caseStudy.selectedWorkEngagementContext?.trim() ||
      'Engagement context',
  );
  const caseStudySlug = computed(() => props.caseStudy.slug);
  const caseStudyUrl = computed(() => `/case-studies/${caseStudySlug.value}`);
  // Ordinal label shown in the text plate's number badge. Zero-padded to
  // two digits so single-digit positions read as catalog entries.
  const ordinalLabel = computed(() =>
    (props.cardIndex + 1).toString().padStart(2, '0'),
  );
  const mediaTransitionKey = computed(() =>
    `case-study-${caseStudySlug.value}`.replace(/[^a-zA-Z0-9_-]/g, '-'),
  );
  const isTitleTransitioning = computed(
    () =>
      transitionState.value.active &&
      transitionState.value.key === mediaTransitionKey.value,
  );
  const isCardExtraPreflighting = computed(
    () =>
      transitionState.value.phase === 'preflight' &&
      transitionState.value.key === mediaTransitionKey.value,
  );
  const shouldHideMediaForTransition = computed(
    () =>
      isTitleTransitioning.value &&
      transitionState.value.sourceRole === 'target',
  );
  const shouldHideFrameForTransition = computed(
    () =>
      isTitleTransitioning.value &&
      transitionState.value.sourceRole === 'target',
  );
  const shouldHideCardExtrasForTransition = computed(
    () => isTitleTransitioning.value || isCardExtraPreflighting.value,
  );
  const shouldExitCardExtrasForTransition = computed(
    () =>
      shouldHideCardExtrasForTransition.value &&
      transitionState.value.sourceRole === 'source',
  );

  let viewportPrefetchObserver: IntersectionObserver | null = null;

  onMounted(() => {
    const element = cardElement.value;

    if (!element || !('IntersectionObserver' in window)) {
      return;
    }

    viewportPrefetchObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        prefetchCaseStudyFromViewport(
          caseStudySlug.value,
          props.caseStudy.featuredMedia,
        );
        viewportPrefetchObserver?.disconnect();
        viewportPrefetchObserver = null;
      },
      {
        rootMargin: '800px 0px',
        threshold: 0.01,
      },
    );

    viewportPrefetchObserver.observe(element);

    if (props.enableBrowseMotion) {
      motionObserver = new IntersectionObserver(
        ([entry]) => {
          if (!window.matchMedia('(hover: none)').matches) return;
          isMobileActive.value = Boolean(
            entry?.isIntersecting && entry.intersectionRatio >= 0.55,
          );
        },
        { threshold: [0.35, 0.55, 0.75] },
      );
      motionObserver.observe(element);
      motionFrame = window.requestAnimationFrame(animateBrowseMotion);
    }
  });

  onBeforeUnmount(() => {
    viewportPrefetchObserver?.disconnect();
    viewportPrefetchObserver = null;
    motionObserver?.disconnect();
    window.cancelAnimationFrame(motionFrame);
  });

  function setBrowseMotion(event: PointerEvent) {
    if (!props.enableBrowseMotion || event.pointerType === 'touch') return;
    const bounds = cardElement.value?.getBoundingClientRect();
    if (!bounds) return;

    motionTarget.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    motionTarget.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  }

  function resetBrowseMotion() {
    motionTarget.x = 0;
    motionTarget.y = 0;
  }

  function settleBrowseMotion() {
    resetBrowseMotion();
    motionPosition.x = 0;
    motionPosition.y = 0;
    cardElement.value?.style.setProperty('--browse-image-x', '0px');
    cardElement.value?.style.setProperty('--browse-image-y', '0px');
  }

  function animateBrowseMotion() {
    const element = cardElement.value;
    if (!element || !props.enableBrowseMotion) return;

    motionPosition.x += (motionTarget.x - motionPosition.x) * 0.1;
    motionPosition.y += (motionTarget.y - motionPosition.y) * 0.1;

    const imageArea = element.querySelector<HTMLElement>('.card-image-area');
    const imageWidth = imageArea?.clientWidth ?? 0;
    const imageHeight = imageArea?.clientHeight ?? 0;
    const maximumXTravel = BROWSE_TRAVEL;
    const maximumYTravel = BROWSE_TRAVEL * 0.72;
    const horizontalOverscan = imageWidth
      ? (maximumXTravel * 2) / imageWidth
      : 0;
    const verticalOverscan = imageHeight
      ? (maximumYTravel * 2) / imageHeight
      : 0;
    const overscanScale = 1.02 + Math.max(horizontalOverscan, verticalOverscan);

    element.style.setProperty('--browse-image-scale', overscanScale.toFixed(4));
    element.style.setProperty(
      '--browse-image-x',
      `${motionPosition.x * -BROWSE_TRAVEL}px`,
    );
    element.style.setProperty(
      '--browse-image-y',
      `${motionPosition.y * -BROWSE_TRAVEL * 0.72}px`,
    );
    motionFrame = window.requestAnimationFrame(animateBrowseMotion);
  }

  function prefetchCaseStudyDetail() {
    prefetchCaseStudy(caseStudySlug.value, props.caseStudy.featuredMedia);
  }

  async function navigateToCaseStudy(event: MouseEvent) {
    settleBrowseMotion();
    prefetchCaseStudyDetail();
    await navigateWithFeaturedMediaTransition(
      event,
      caseStudyUrl.value,
      mediaTransitionKey.value,
      props.caseStudy.featuredMedia,
    );
  }
</script>

<template>
  <article
    ref="cardElement"
    class="case-study-card"
    :class="[
      `is-layout-${layout}`,
      {
        'is-not-first-card': !isFirstCard,
        'is-frame-transition-hidden': shouldHideFrameForTransition,
        'is-plate-right': plateAlign === 'right',
        'has-browse-motion': enableBrowseMotion,
        'has-ambient-current': enableAmbientCurrent,
        'has-ordinal-star': enableOrdinalStar,
        'has-ordinal-wave': enableOrdinalWave,
        'has-orbit-dots': enableOrbitDots,
        'has-breathing-brackets': enableBreathingBrackets,
        'has-rotating-dial': enableRotatingDial,
        'is-mobile-active': isMobileActive,
      },
    ]"
    data-transition-source
    @pointermove="setBrowseMotion"
    @pointerleave="resetBrowseMotion"
  >
    <!-- Image area takes the top of the card; the text plate sits below it
         via the editorial-split grid. -->
    <div
      class="card-image-area"
      :class="{
        'is-baked-halftone': usesBakedHalftone,
        'is-media-transition-hidden': shouldHideMediaForTransition,
      }"
      @click="navigateToCaseStudy"
      @focus="prefetchCaseStudyDetail"
      @pointerenter="prefetchCaseStudyDetail"
    >
      <span
        v-if="enableAmbientCurrent"
        class="ambient-current"
        :style="{ animationDelay: `${cardIndex * -1.3}s` }"
        aria-hidden="true"
      />
      <div
        class="card-halftone-box is-halftone-separate-k"
        :class="{
          ...spikeClasses,
          'is-baked-halftone': usesBakedHalftone,
        }"
        :style="spikeStyle"
      >
        <div class="card-halftone">
          <FeaturedMediaFrame
            class="media-frame"
            :media="caseStudy.featuredMedia"
            label="Case Study"
            :treatment="usesBakedHalftone ? 'case-study-halftone' : 'default'"
            :transition-key="mediaTransitionKey"
            transition-role="source"
            transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
            sizes="(max-width: 900px) 100vw, 50vw"
          />
          <div v-if="!hasBakedHalftone" class="card-ink" aria-hidden="true" />
          <div v-if="isBleedMode" class="card-bleed" aria-hidden="true" />
        </div>
        <div v-if="kLayerSourceUrl" class="card-k-layer" aria-hidden="true">
          <img
            class="card-k-image"
            :src="kLayerSourceUrl"
            alt=""
            loading="lazy"
          />
        </div>
      </div>
      <div
        v-if="isTintOverlayEnabled && caseStudy.featuredMedia?.sourceUrl"
        class="card-gradient-tint"
        :class="spikeTonePairClass"
        :style="spikeStyle"
        aria-hidden="true"
      />
      <div v-if="enableBrowseMotion" class="catalog" aria-hidden="true">
        <span v-if="catalogPractice" class="practice">{{
          catalogPractice
        }}</span>
        <span v-if="catalogContext" class="engagement">{{
          catalogContext
        }}</span>
      </div>
    </div>

    <NuxtLink v-slot="{ href }" :to="caseStudyUrl" custom>
      <a
        :href="href"
        class="link-box"
        :data-featured-slip-source="mediaTransitionKey"
        @focus="prefetchCaseStudyDetail"
        @pointerdown="prefetchCaseStudyDetail"
        @pointerenter="prefetchCaseStudyDetail"
        @click="navigateToCaseStudy"
      >
        <div class="plate-content">
          <span
            class="card-number-badge card-slip is-card-extra-number"
            :data-featured-card-extra-source="mediaTransitionKey"
            :class="{
              'is-card-extra-transition-exiting':
                shouldExitCardExtrasForTransition,
              'is-card-extra-transition-hidden':
                shouldHideCardExtrasForTransition,
            }"
            aria-hidden="true"
          >
            <span class="card-slip-inner">
              <span
                class="ordinal-core"
                :class="{
                  'has-brackets': enableBreathingBrackets,
                }"
              >
                <span
                  v-if="enableBreathingBrackets"
                  class="ordinal-bracket is-left"
                  >[</span
                >
                {{ ordinalLabel }}
                <span
                  v-if="enableBreathingBrackets"
                  class="ordinal-bracket is-right"
                  >]</span
                >
              </span>
              <span v-if="enableOrdinalStar" class="ordinal-star">✦</span>
              <span v-if="enableOrdinalWave" class="ordinal-wave">
                <svg viewBox="0 0 48 12" aria-hidden="true">
                  <path
                    pathLength="1"
                    d="M1 6 C7 1 11 11 17 6 S27 1 33 6 S43 11 47 6"
                  />
                </svg>
              </span>
              <span v-if="enableOrbitDots" class="ordinal-orbit" />
              <span v-if="enableRotatingDial" class="ordinal-dial" />
            </span>
          </span>
          <div class="label-stack">
            <h3
              class="title"
              :class="{ 'is-transition-hidden': isTitleTransitioning }"
              :data-featured-title-source="mediaTransitionKey"
              :data-featured-title-text="caseStudy.title"
            >
              <SteppedTitleGround
                class="title-label"
                :text="caseStudy.title"
                ground-color="var(--color-surface)"
                data-featured-title-text-layer
              />
            </h3>

            <p
              v-if="caseStudy.excerpt"
              class="subheading card-slip is-card-extra-excerpt"
              :data-featured-card-extra-source="mediaTransitionKey"
              :class="{
                'is-card-extra-transition-exiting':
                  shouldExitCardExtrasForTransition,
                'is-card-extra-transition-hidden':
                  shouldHideCardExtrasForTransition,
              }"
            >
              <span class="card-slip-inner">{{ caseStudy.excerpt }}</span>
            </p>
          </div>
        </div>
      </a>
    </NuxtLink>
  </article>
</template>

<style lang="scss" scoped>
  // SPIKE: card is an editorial-split — image area on top in the grid's 1fr
  // row, text plate below as the auto row. Cream plate + ink text always:
  // the plate provides its own neutral ground regardless of the image, so
  // no inversion is needed. Spike scaffolding removed when the case-hero
  // direction lands.
  .case-study-card {
    --browse-image-x: 0px;
    --browse-image-y: 0px;
    --browse-image-scale: 1.06;
    width: 100%;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
    padding: 0;
    display: grid;
    align-items: stretch;
    margin-bottom: 0;
  }

  .has-browse-motion .card-halftone-box {
    transform: translate3d(var(--browse-image-x), var(--browse-image-y), 0)
      scale(var(--browse-image-scale));
    transform-origin: center;
    will-change: transform;
  }

  .catalog {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: grid;
    align-content: end;
    justify-items: start;
    padding: var(--space-5);
    overflow: hidden;
    pointer-events: none;
  }

  .catalog span {
    max-width: calc(100% - var(--space-4));
    padding: 0.35rem 0.55rem;
    overflow: hidden;
    font-family: var(--font-mono);
    line-height: 1.2;
    white-space: nowrap;
    transform: translateX(-120%);
    transition: transform 520ms var(--snappy-ease-out);
  }

  .catalog .practice {
    color: white;
    background: var(--color-ink);
    font-size: clamp(0.8rem, 1.15vw, 1rem);
    font-weight: 600;
  }

  .catalog .engagement {
    color: var(--color-ink);
    background: var(--color-surface);
    font-size: clamp(0.72rem, 1vw, 0.88rem);
    transition-delay: 130ms;
  }

  .has-browse-motion:is(:hover, :focus-within, .is-mobile-active)
    .catalog
    span {
    transform: translateX(0);
    animation: none;
  }

  .case-study-card::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 6;
    pointer-events: none;
    border: var(--border-window);
    opacity: 1;
    transition: opacity 160ms var(--snappy-ease-out)
      var(--duotone-fade-duration, 350ms);
  }

  .case-study-card.is-not-first-card::after {
    border-top: 0;
  }

  .case-study-card.is-frame-transition-hidden::after {
    opacity: 0;
    transition-delay: 0ms;
  }

  // Banner: photo band on top (1fr row), text plate below (auto row) — the
  // classic editorial split. The score's --card-min-height can override the
  // height register per row.
  .case-study-card.is-layout-banner {
    min-height: var(--card-min-height, clamp(420px, 50vh, 640px));
    grid-template-rows: minmax(0, 1fr) auto;
  }

  // Inline: a text-height row with a photo plate docked at one side. The
  // photo crops to the row (compositional material, cut to fill); the text
  // plate carries the row's identity. The score can override the row height
  // (--card-min-height) and photo width (--inline-photo-width) per beat —
  // the taller "wide" tier is just a bigger pair of overrides.
  .case-study-card.is-layout-photo-left,
  .case-study-card.is-layout-photo-right {
    min-height: var(--card-min-height, clamp(196px, 25vh, 308px));
  }

  // Inline rows are flex, not grid: the photo plate is the flexible element
  // (it shrinks below its scored width when the single-line title demands
  // room) and the text cell can never go narrower than the title. This is
  // what guarantees the hard no-wrap contract without horizontal overflow.
  .case-study-card.is-layout-photo-left,
  .case-study-card.is-layout-photo-right {
    display: flex;
  }

  .case-study-card.is-layout-photo-right {
    // DOM order is image-then-text; reversing puts the photo on the right.
    flex-direction: row-reverse;
  }

  // The image area owns the ink ground, the overflow clipping, and the
  // clip-path — the halftone panes extend far outside the box and must be
  // clipped here.
  .card-image-area {
    position: relative;
    min-height: 0;
    overflow: hidden;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    background: var(--color-ink);
    cursor: pointer;
    // Hand-off final step (see .is-media-transition-hidden): once the flying
    // clone has fully seated on the card, the real duotone plate fades IN over
    // this window while the clone fades OUT — a clean cross-fade between two
    // co-located plates, rather than the duotone popping in. Length is the
    // --duotone-fade-duration token (matches the clone's media-handoff
    // leave) so it stays controllable independent of the flight duration.
    transition: opacity var(--duotone-fade-duration, 350ms)
      var(--snappy-ease-out);
  }

  .ambient-current {
    position: absolute;
    z-index: var(--z-high);
    inset: -30% -18%;
    background: linear-gradient(
      105deg,
      transparent 38%,
      color-mix(in srgb, var(--color-primary) 8%, transparent) 44%,
      color-mix(in srgb, var(--color-primary) 50%, transparent) 49%,
      color-mix(in srgb, white 32%, transparent) 50%,
      color-mix(in srgb, var(--color-primary) 45%, transparent) 51%,
      color-mix(in srgb, var(--color-primary) 8%, transparent) 56%,
      transparent 62%
    );
    opacity: 0;
    transform: translateX(-85%);
    mix-blend-mode: screen;
    pointer-events: none;
    animation: case-study-ambient-current 10s ease-in-out infinite;
  }

  @keyframes case-study-ambient-current {
    0%,
    8% {
      opacity: 0;
      transform: translateX(-85%);
    }

    11% {
      opacity: 0.6;
    }

    28% {
      opacity: 0.6;
      transform: translateX(85%);
    }

    32%,
    100% {
      opacity: 0;
      transform: translateX(85%);
    }
  }

  .is-layout-banner .card-image-area {
    grid-row: 1;
  }

  .is-layout-photo-left .card-image-area,
  .is-layout-photo-right .card-image-area {
    flex: 0 1 var(--inline-photo-width, clamp(252px, 36%, 476px));
    min-width: 0;
  }

  .is-layout-photo-left .card-image-area {
    border-right: var(--border-window);
  }

  .is-layout-photo-right .card-image-area {
    border-left: var(--border-window);
  }

  // Text plate. The row's steady voice: cream ground and ink text, with enough
  // vertical room for the catalog label, title, and excerpt to read as a unit.
  .link-box {
    position: relative;
    z-index: 4;
    display: block;
    // No width: 100% — the project has no global border-box reset, so
    // width: 100% PLUS the inline padding overflowed the card by 48px and
    // gave the page a horizontal scrollbar. A block-level grid/flex child
    // stretches to its track on its own, with padding contained.
    padding: var(--space-4) var(--space-5) var(--space-5);
    background: var(--color-surface);
    color: var(--color-ink);
    text-decoration: none;
    user-select: none;
    transition: opacity 160ms ease;
  }

  .is-layout-banner .link-box {
    grid-row: 2;
    padding: calc(var(--space-5) + var(--space-1)) var(--space-6)
      calc(var(--space-6) + var(--space-1));
  }

  .is-layout-banner .link-box::before {
    content: '';
    position: absolute;
    top: -2px;
    right: 0;
    left: 0;
    height: 2px;
    background: var(--color-ink);
    opacity: 1;
    pointer-events: none;
    transition: opacity 160ms var(--snappy-ease-out)
      var(--duotone-fade-duration, 350ms);
  }

  .case-study-card.is-frame-transition-hidden .link-box::before {
    opacity: 0;
    transition-delay: 0ms;
  }

  // Inline rows vertically center the text beside the photo plate. The
  // text cell takes the row's slack (so plate-content docking still works)
  // and can never shrink below the single-line title: min-width:
  // fit-content, with the excerpt's intrinsic width neutralized (below) so
  // only the title drives it.
  .is-layout-photo-left .link-box,
  .is-layout-photo-right .link-box {
    flex: 1 1 auto;
    width: auto;
    min-width: fit-content;
    display: flex;
    align-items: center;
  }

  // The text block. Real margins, no transforms, so the title's transition
  // geometry stays true. Sized to its content: the single-line title or the
  // 90ch-capped excerpt, whichever is wider. plateAlign="right" docks it at
  // the far end of the plate for horizontal rhythm.
  .plate-content {
    width: fit-content;
    max-width: 100%;
    // Flex items default to min-width: auto and refuse to shrink below
    // their content — a nowrap title would force the box past its cell and
    // give the page a horizontal scrollbar. min-width: 0 keeps the block
    // contained; the title rules below decide how text behaves inside.
    min-width: 0;
    margin-left: var(--plate-margin-left, 0);
    margin-right: var(--plate-margin-right, auto);
  }

  .is-plate-right .plate-content {
    margin-left: auto;
    margin-right: 0;
  }

  @include breakpoint(phone) {
    // Alignment collapses on phones: the block spans the plate and the
    // photo rhythm carries the page.
    .case-study-card .plate-content {
      width: 100%;
      margin-inline: 0;
    }
  }

  // Small ordinal label sitting above the title — catalog-entry style.
  // Mono regular (not italic), signal-blue, letterspaced.
  .card-number-badge {
    display: block;
    margin-bottom: var(--space-1);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-style: normal;
    font-weight: 400;
    font-size: var(--type-small);
    line-height: 1;
    letter-spacing: 0.12em;
    user-select: none;
  }

  .ordinal-star {
    display: inline-block;
    margin-left: 0.35em;
    font-size: 3.2em;
    line-height: 0.5;
    transform: scaleX(0.72);
    transform-origin: 50% 52%;
    animation: case-study-ordinal-star 7s linear infinite;
  }

  @keyframes case-study-ordinal-star {
    from {
      transform: rotate(0) scaleX(0.72);
    }

    to {
      transform: rotate(1turn) scaleX(0.72);
    }
  }

  .ordinal-wave {
    display: inline-block;
    width: 3.4rem;
    height: 0.85rem;
    margin-left: 0.65rem;
    vertical-align: -0.18rem;
    overflow: visible;
  }

  .ordinal-wave svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
    animation: case-study-ordinal-wave-float 4.8s ease-in-out infinite;
  }

  .ordinal-wave path {
    fill: none;
    stroke: currentColor;
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-dasharray: 0.22 0.08;
    animation: case-study-ordinal-wave-current 3.8s linear infinite;
  }

  @keyframes case-study-ordinal-wave-current {
    to {
      stroke-dashoffset: -0.3;
    }
  }

  @keyframes case-study-ordinal-wave-float {
    50% {
      transform: translateY(-0.16rem) scaleY(1.25);
    }
  }

  .ordinal-orbit {
    position: relative;
    display: inline-block;
    width: 1.5rem;
    height: 1.5rem;
    margin-left: 0.55rem;
    vertical-align: -0.5rem;
    border: 1px solid color-mix(in srgb, currentColor 45%, transparent);
    border-radius: 50%;
    animation: case-study-ordinal-orbit 6.5s linear infinite;
  }

  .ordinal-orbit::before,
  .ordinal-orbit::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0.28rem;
    height: 0.28rem;
    margin: -0.14rem;
    border-radius: 50%;
    background: currentColor;
  }

  .ordinal-orbit::before {
    transform: translateX(0.72rem);
  }

  .ordinal-orbit::after {
    transform: translateX(-0.72rem) scale(0.62);
  }

  @keyframes case-study-ordinal-orbit {
    to {
      transform: rotate(1turn);
    }
  }

  .ordinal-core {
    position: relative;
    display: inline-block;
  }

  .ordinal-bracket {
    position: absolute;
    top: 50%;
    font-size: 1.25em;
    line-height: 1;
    transform: translateY(-52%);
    animation: case-study-ordinal-bracket 3.6s ease-in-out infinite;
  }

  .ordinal-bracket.is-left {
    right: calc(100% + 0.12em);
    --bracket-travel: -0.38em;
  }

  .ordinal-bracket.is-right {
    left: calc(100% + 0.04em);
    --bracket-travel: 0.38em;
  }

  @keyframes case-study-ordinal-bracket {
    50% {
      opacity: 0.55;
      transform: translate(var(--bracket-travel), -52%);
    }
  }

  .ordinal-dial {
    position: relative;
    display: inline-block;
    width: 1.35rem;
    height: 1.35rem;
    margin-left: 0.6rem;
    vertical-align: -0.42rem;
    border: 1px solid currentColor;
    border-radius: 50%;
    animation: case-study-ordinal-dial 8s linear infinite;
  }

  .ordinal-dial::before,
  .ordinal-dial::after {
    content: '';
    position: absolute;
    background: currentColor;
  }

  .ordinal-dial::before {
    top: -0.22rem;
    left: calc(50% - 1px);
    width: 2px;
    height: 0.7rem;
  }

  .ordinal-dial::after {
    right: -0.16rem;
    bottom: 0.12rem;
    width: 0.36rem;
    height: 0.36rem;
    border-radius: 50%;
  }

  @keyframes case-study-ordinal-dial {
    to {
      transform: rotate(1turn);
    }
  }

  .label-stack {
    position: relative;
    height: 100%;
    width: 100%;
    flex-direction: column;
    z-index: 4;
  }

  .title {
    position: relative;
    margin: 0;
    color: var(--color-ink);
    text-align: left;
    font-size: clamp(1.35rem, 2.5vw, 2.25rem);
    padding: 0;
    z-index: 4;
    user-select: none;
    text-decoration: none;
    line-height: 1.1;
    // The title runs as a single horizontal line — it does not wrap. Phone
    // restores wrapping since long titles cannot fit a narrow viewport.
    white-space: nowrap;
  }

  // Inline rows: slightly smaller fluid title. The single-line contract is
  // hard — no wrapping on desktop. The flex layout above guarantees the
  // text cell grows to the title (the photo plate gives up width instead),
  // so nowrap can hold without overflowing the page.
  .is-layout-photo-left .title,
  .is-layout-photo-right .title {
    font-size: clamp(1.25rem, 1.8vw, 1.9rem);
  }

  .title-ground {
    display: none;
  }

  // The excerpt must not drive the text cell's intrinsic width — a long
  // unwrapped excerpt would defeat the title-driven min-width:
  // fit-content. With inline-size containment it wraps inside whatever
  // width the title establishes.
  .is-layout-photo-left .subheading,
  .is-layout-photo-right .subheading {
    contain: inline-size;
  }

  @include breakpoint(phone) {
    .case-study-card.is-layout-banner,
    .case-study-card.is-layout-photo-left,
    .case-study-card.is-layout-photo-right {
      min-height: 0;
    }

    .case-study-card.is-layout-banner {
      grid-template-rows: auto auto;
    }

    .card-image-area {
      height: clamp(9.75rem, 48vw, 14rem);
    }

    .is-layout-banner .card-image-area {
      min-height: 0;
    }

    .link-box,
    .is-layout-banner .link-box {
      padding: var(--space-3) var(--space-4) var(--space-4);
    }

    .title {
      font-size: 1.45rem;
      line-height: 1.18;
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
      text-wrap: wrap;
      margin-bottom: 0.2em;
    }

    .title-label {
      position: relative;
      z-index: 1;
    }

    .title-ground {
      display: none;
    }

    .card-number-badge {
      position: relative;
      z-index: 5;
      margin-bottom: calc(var(--space-1) + 0.25em);
    }

    // Inline layouts stack on phones: photo as a short band above the text
    // plate (a mini-banner). A side-docked photo has no room in a single
    // narrow column.
    .case-study-card.is-layout-photo-left,
    .case-study-card.is-layout-photo-right {
      min-height: 0;
      flex-direction: column;
    }

    .is-layout-photo-left .card-image-area,
    .is-layout-photo-right .card-image-area {
      flex: 0 0 auto;
      min-height: clamp(9.75rem, 48vw, 14rem);
      border-inline: 0;
    }

    .is-layout-photo-left .link-box,
    .is-layout-photo-right .link-box {
      flex: 0 0 auto;
      min-width: 0;
      display: block;
      border-top: var(--border-window);
      transition:
        border-color 160ms var(--snappy-ease-out)
          var(--duotone-fade-duration, 350ms),
        opacity 160ms ease;
    }

    .case-study-card.is-frame-transition-hidden .link-box {
      border-top-color: transparent;
      transition-delay: 0ms;
    }
  }

  .title-label {
    padding: 0;
    font-family: var(--font-mono);
  }

  // The real title hides while the flying clone owns the title morph. Card-only
  // extras below get their own masked slip reveal instead of this opacity path.
  .is-transition-hidden {
    opacity: 0;
    transition: none;
  }

  .card-slip {
    overflow: hidden;
  }

  .card-number-badge:not(.is-card-extra-transition-hidden):not(
      .is-card-extra-transition-exiting
    ) {
    overflow: visible;
  }

  .card-slip-inner {
    display: block;
    transform: translateY(0);
    transition: transform var(--card-extra-slip-duration, 220ms)
      var(--snappy-ease-out) var(--card-extra-slip-delay, var(--content-delay));
  }

  .is-card-extra-excerpt {
    --card-extra-slip-delay: calc(
      var(--content-delay) + var(--card-extra-stagger, 80ms)
    );
  }

  .is-card-extra-transition-hidden .card-slip-inner {
    transform: translateY(115%);
    transition-delay: 0ms;
  }

  .is-card-extra-transition-exiting .card-slip-inner {
    transform: translateY(-145%);
    transition-delay: 0ms;
  }

  .is-card-extra-excerpt.is-card-extra-transition-exiting .card-slip-inner {
    transition-delay: var(--card-extra-stagger, 80ms);
  }

  @media (prefers-reduced-motion: reduce) {
    .ambient-current,
    .ordinal-star,
    .ordinal-wave,
    .ordinal-orbit,
    .ordinal-bracket,
    .ordinal-dial {
      display: none;
    }

    .is-transition-hidden,
    .card-slip-inner {
      transition: none;
    }
  }

  // Reverse hand-off: hide the ENTIRE destination photoplate (halftone box,
  // ink, K-layer, gradient tint) while the detail-page clone flies into the
  // card geometry. Forward card→detail keeps the source photoplate visible
  // under the lifting clone; hiding it was the cause of the old black flash.
  // Removing this class at reverse hand-off fades the destination treatment in
  // only once the clone is seated.
  .is-media-transition-hidden {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .card-image-area {
      transition: none;
    }
  }

  .subheading {
    margin: var(--space-4) 0 0;
    max-width: 90ch;
    line-height: 1.35;
    // Excerpts can carry long URLs — unbreakable strings must wrap rather
    // than widen the page.
    overflow-wrap: anywhere;
    position: relative;
    z-index: 5;
  }

  @include breakpoint(phone) {
    .subheading {
      margin-top: var(--space-1);
      display: -webkit-box;
      overflow: hidden;
      font-size: var(--type-small);
      line-height: 1.35;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
  }

  // Halftone treatment wraps the FeaturedMediaFrame inside the card. The
  // .card-halftone-box is absolute-inset positioned to fill the card area;
  // .card-halftone is the main pane, .card-k-layer is the K pane sibling.
  // See packages/styles/shared-components/_halftone-image.scss for defaults
  // and override knobs.
  .card-halftone-box {
    position: absolute;
    inset: 0;
    @include halftone-image-box;

    // SPIKE: duotone tone-pair selectors. Default is ink + cream; override
    // via class. Mirrors the slug page; removed with the rest of the spike.
    --halftone-tone-1: var(--color-ink);
    --halftone-tone-2: var(--color-surface);

    &.is-halftone-tone-blue-cream {
      --halftone-tone-1: var(--color-primary);
      --halftone-tone-2: var(--color-surface);
    }

    &.is-halftone-tone-ink-blue {
      --halftone-tone-1: var(--color-ink);
      --halftone-tone-2: var(--color-primary);
    }
  }

  // SPIKE: direct duotone — SVG color-matrix + component-transfer (linear).
  // Filter defs live on the host page (HomeSelectedWorkSection).
  .card-halftone-box.is-halftone-duotone-direct {
    &.is-halftone-tone-ink-cream {
      filter: url('#halftone-tone-ink-cream');
    }
    &.is-halftone-tone-blue-cream {
      filter: url('#halftone-tone-blue-cream');
    }
    &.is-halftone-tone-ink-blue {
      filter: url('#halftone-tone-ink-blue');
    }
    &.is-halftone-tone-tritone-ink-blue-cream {
      filter: url('#halftone-tone-tritone-ink-blue-cream');
    }
    &.is-halftone-tone-tritone-ink-soft-cream {
      filter: url('#halftone-tone-tritone-ink-soft-cream');
    }
  }

  // SPIKE: crisp duotone — SVG component-transfer with type="discrete".
  .card-halftone-box.is-halftone-duotone-crisp {
    &.is-halftone-tone-ink-cream {
      filter: url('#halftone-tone-crisp-ink-cream');
    }
    &.is-halftone-tone-blue-cream {
      filter: url('#halftone-tone-crisp-blue-cream');
    }
    &.is-halftone-tone-ink-blue {
      filter: url('#halftone-tone-crisp-ink-blue');
    }
    &.is-halftone-tone-tritone-ink-blue-cream {
      filter: url('#halftone-tone-crisp-blue-cream');
    }
    &.is-halftone-tone-tritone-ink-soft-cream {
      filter: url('#halftone-tone-crisp-ink-cream');
    }
  }

  // SPIKE: bleed — duotone gradient overlay sitting inside the halftone pane.
  .card-bleed {
    @include halftone-image-bleed;
  }

  // SPIKE: gradient tint — overlays the halftoned image; lives outside
  // .card-halftone-box so the linear gradient doesn't pass through the box's
  // filter chain (sepia/saturate) or the halftone pane's threshold filter,
  // which would turn the smooth gradient into hard-edged blocks. Tone vars
  // are redefined here because the element sits outside the box scope.
  .card-gradient-tint {
    --halftone-tone-1: var(--color-ink);
    --halftone-tone-2: var(--color-surface);

    &.is-halftone-tone-blue-cream {
      --halftone-tone-1: var(--color-primary);
      --halftone-tone-2: var(--color-surface);
    }

    &.is-halftone-tone-ink-blue {
      --halftone-tone-1: var(--color-ink);
      --halftone-tone-2: var(--color-primary);
    }

    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: linear-gradient(
      var(--halftone-tint-angle, 135deg),
      var(--halftone-tone-1),
      var(--halftone-tone-2)
    );
    opacity: var(--halftone-tint-opacity, 0.4);
  }

  // Color-on-hover: hovering either the image or text plate reveals the baked
  // color halftone, fades out overlays, and finer-grains the live fallback
  // halftone to 8px.
  .card-halftone-box {
    --halftone-size: var(--halftone-size-rest, 11px);
    transition: filter 300ms var(--snappy-ease-out);
  }

  // Safari and coarse/mobile devices struggle with the full live halftone
  // stack: SVG/CSS filters, huge rotated dot fields, blend modes, and a K
  // layer. Keep the composition, but reduce the rendered plate to a direct
  // image treatment in those contexts.
  .card-halftone-box.is-baked-halftone:not(.is-halftone-duotone-direct):not(
      .is-halftone-duotone-crisp
    ),
  .card-halftone-box.is-baked-halftone .card-halftone {
    filter: none;
  }

  .card-halftone-box.is-baked-halftone .media-frame :deep(.image) {
    filter: none;
  }

  .case-study-card:hover .card-halftone-box {
    --halftone-size: 8px;
  }

  .card-bleed,
  .card-gradient-tint {
    transition: opacity 300ms var(--snappy-ease-out);
  }

  .case-study-card:hover .card-halftone-box {
    &.is-baked-halftone {
      filter: none;
    }

    &.is-halftone-duotone-direct:not(.is-baked-halftone),
    &.is-halftone-duotone-crisp:not(.is-baked-halftone) {
      filter: sepia(var(--halftone-sepia)) saturate(var(--halftone-saturation));
    }
  }

  .case-study-card:hover .card-bleed,
  .case-study-card:hover .card-gradient-tint {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .card-halftone-box,
    .card-bleed,
    .card-gradient-tint,
    .catalog span {
      transition: none;
    }

    .has-browse-motion .card-halftone-box {
      transform: none;
    }

    .catalog span {
      transform: none;
    }
  }

  .card-halftone {
    width: 100%;
    height: 100%;
    @include halftone-image-pane;
  }

  .media-frame {
    width: 100%;
    height: 100%;
    overflow: hidden;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }

  .card-ink {
    @include halftone-image-ink;
  }

  .card-halftone-box.is-halftone-separate-k {
    :deep(.image) {
      @include halftone-image-media-hues;
    }

    .card-ink {
      @include halftone-image-ink-separate-k-override;
    }
  }

  .card-halftone-box.is-baked-halftone {
    :deep(.image) {
      filter: none;
    }
  }

  .card-k-layer {
    @include halftone-image-k-pane;
  }

  .card-k-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    @include halftone-image-k-media;
  }

  .card-k-layer::after {
    @include halftone-image-k-ink;
  }

  .case-study-card :deep(.image),
  .case-study-card :deep(.placeholder) {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    object-fit: cover;
    transform: translate(0, 0);
    transition:
      transform var(--slow-duration) var(--snappy-ease-out),
      filter var(--slow-duration) var(--snappy-ease-out);
  }

  @media (prefers-reduced-motion: reduce) {
    .title-label,
    .subheading span,
    .case-study-card :deep(.image) {
      transition: none;
    }
  }
</style>

<style lang="scss">
  .is-halftone-performance-safe {
    .case-study-card
      .card-image-area:not(.is-baked-halftone)
      .card-halftone-box,
    .case-study-card .card-image-area:not(.is-baked-halftone) .card-halftone {
      filter: none !important;
    }

    .case-study-card .card-image-area:not(.is-baked-halftone) .card-ink,
    .case-study-card .card-image-area:not(.is-baked-halftone) .card-bleed,
    .case-study-card .card-image-area:not(.is-baked-halftone) .card-k-layer,
    .case-study-card
      .card-image-area:not(.is-baked-halftone)
      .card-gradient-tint {
      display: none !important;
    }

    .case-study-card
      .card-image-area:not(.is-baked-halftone)
      .card-halftone-box
      .image {
      filter: saturate(1.04) contrast(1.04) !important;
    }
  }
</style>
