<script setup lang="ts">
  import type { GutenbergBlock, WordPressCaseStudy } from '~/types/wordpress';

  // Transition system coupling: this page is the target of the featured-media
  // card-to-detail transition originating from CaseStudyCard.vue. The
  // FeaturedMediaFrame, data-featured-slip-target, and data-featured-title-target
  // attributes below must be preserved for the transition to function. See:
  // composables/useFeaturedMediaTransition.ts
  // components/transitions/FeaturedMediaTransitionLayer.vue
  const route = useRoute();
  const { getCaseStudyBlocks, getCaseStudyShell } = useContentDetailPrefetch();
  const { prefetchHomeSurface } = useHomeSurfacePrefetch();
  const slug = computed(() => String(route.params.slug));
  const loopNavSentinel = ref<HTMLElement | null>(null);

  let loopNavObserver: IntersectionObserver | null = null;

  onMounted(() => {
    window.setTimeout(() => {
      prefetchHomeSurface();
    }, 500);

    const sentinel = loopNavSentinel.value;

    if (!sentinel || !('IntersectionObserver' in window)) {
      loadCaseStudyNavigation();
      return;
    }

    loopNavObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        loadCaseStudyNavigation();
        loopNavObserver?.disconnect();
        loopNavObserver = null;
      },
      {
        rootMargin: '900px 0px',
      },
    );

    loopNavObserver.observe(sentinel);
  });

  onBeforeUnmount(() => {
    loopNavObserver?.disconnect();
    loopNavObserver = null;
  });

  const {
    data: caseStudy,
    error,
    status,
  } = await useAsyncData<WordPressCaseStudy | null>(
    () => `case-study-shell:${slug.value}`,
    () => getCaseStudyShell(slug.value),
    {
      dedupe: 'cancel',
      watch: [slug],
    },
  );

  const { data: caseStudyBodyBlocks, error: caseStudyBodyError } =
    useLazyAsyncData<GutenbergBlock[]>(
      () => `case-study-body:${slug.value}`,
      async () => (await getCaseStudyBlocks(slug.value)) ?? [],
      {
        dedupe: 'cancel',
        default: () => [],
        watch: [slug],
      },
    );

  const {
    data: caseStudyNavigationItems,
    execute: loadCaseStudyNavigationItems,
    status: caseStudyNavigationStatus,
  } = useLazyAsyncData(
    'case-study-navigation',
    () => queryWordPressCaseStudies(100),
    {
      dedupe: 'cancel',
      default: () => [],
      immediate: false,
      server: false,
    },
  );

  function loadCaseStudyNavigation() {
    if (
      caseStudyNavigationStatus.value === 'pending' ||
      caseStudyNavigationStatus.value === 'success'
    ) {
      return;
    }

    void loadCaseStudyNavigationItems();
  }

  const caseStudyLoopNav = computed(() => {
    const caseStudies = caseStudyNavigationItems.value ?? [];

    if (!caseStudy.value || caseStudies.length < 2) {
      return null;
    }

    const currentIndex = caseStudies.findIndex(
      (navigationCaseStudy) =>
        navigationCaseStudy.slug === caseStudy.value?.slug,
    );

    if (currentIndex < 0) {
      return null;
    }

    const previousIndex =
      (currentIndex - 1 + caseStudies.length) % caseStudies.length;
    const nextIndex = (currentIndex + 1) % caseStudies.length;
    const previous = caseStudies[previousIndex];
    const next = caseStudies[nextIndex];

    if (!previous || !next) {
      return null;
    }

    return { previous, next };
  });

  const isLoading = computed(
    () => status.value === 'idle' || status.value === 'pending',
  );
  const caseStudyBlocks = computed(() => caseStudyBodyBlocks.value ?? []);

  useSiteSeoMeta({
    title: () => caseStudy.value?.title ?? 'Case Study',
    description: () => caseStudy.value?.excerpt ?? '',
    type: 'article',
    image: () => caseStudy.value?.featuredMedia?.sourceUrl,
    imageAlt: () => caseStudy.value?.featuredMedia?.altText,
  });

  const mediaTransitionKey = computed(() =>
    `case-study-${slug.value}`.replace(/[^a-zA-Z0-9_-]/g, '-'),
  );

  const transitionState = useFeaturedMediaTransitionState();
  const isTitleTransitioning = computed(
    () =>
      transitionState.value.active &&
      transitionState.value.key === mediaTransitionKey.value,
  );

  // SPIKE: duotone / legibility exploration controls. Live-comparison UI for
  // toggling between full CMYK halftone and various duotone treatments.
  // Remove with the entire control block once a direction is locked in.
  type DuotoneMode = 'off' | 'direct' | 'chromatic' | 'bleed';
  type TonePair =
    | 'ink-cream'
    | 'blue-cream'
    | 'ink-blue'
    | 'tritone-ink-blue-cream'
    | 'tritone-ink-soft-cream';
  type BleedDirection = 'to top' | 'to bottom' | 'to left' | 'to right';
  const duotoneMode = ref<DuotoneMode>('off');
  const tonePair = ref<TonePair>('ink-cream');
  const chromaticOffset = ref(4);
  const bleedDirection = ref<BleedDirection>('to top');
  const bleedStrength = ref(100);
  const bleedOpacity = ref(0.7);
  const hoverReveals = ref(false);
  const duotoneClasses = computed(() => ({
    'is-halftone-duotone-direct': duotoneMode.value === 'direct',
    'is-halftone-duotone-chromatic': duotoneMode.value === 'chromatic',
    'is-halftone-duotone-bleed': duotoneMode.value === 'bleed',
    [`is-halftone-tone-${tonePair.value}`]: true,
    'is-halftone-hover-reveals': hoverReveals.value,
  }));
  const duotoneStyle = computed<Record<string, string>>(() => ({
    '--halftone-chromatic-offset': `${chromaticOffset.value}px`,
    '--halftone-bleed-direction': bleedDirection.value,
    '--halftone-bleed-strength': `${bleedStrength.value}%`,
    '--halftone-bleed-opacity': String(bleedOpacity.value),
  }));
</script>

<template>
  <article v-if="caseStudy" class="case-study-page">
    <!-- SPIKE: SVG filters for true duotone / tritone post-processing of the
         halftone output. Each filter: (1) feColorMatrix converts the
         halftoned RGB to grayscale luminance, (2) feComponentTransfer's
         table lookup maps that luminance to a tone palette. Two values in
         tableValues = duotone, three = tritone. Tone palette values are
         normalized (0–1) approximations of the Blue Atlas tokens.
         Removed with the rest of the spike. -->
    <svg
      width="0"
      height="0"
      style="position: absolute; pointer-events: none"
      aria-hidden="true"
    >
      <defs>
        <filter id="halftone-tone-ink-cream">
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
        <filter id="halftone-tone-blue-cream">
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
        <filter id="halftone-tone-ink-blue">
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
        <filter id="halftone-tone-tritone-ink-blue-cream">
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
        <filter id="halftone-tone-tritone-ink-soft-cream">
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
      </defs>
    </svg>

    <!-- SPIKE: duotone / legibility controls. Remove with the logic above. -->
    <details open class="duotone-controls">
      <summary>Duotone / legibility controls (spike)</summary>
      <div class="duotone-controls-row">
        <label class="duotone-control">
          <span>Mode</span>
          <select v-model="duotoneMode">
            <option value="off">Off (full CMYK)</option>
            <option value="direct">Direct duotone</option>
            <option value="chromatic">Chromatic aberration</option>
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
      </div>
      <div v-if="duotoneMode === 'chromatic'" class="duotone-controls-row">
        <label class="duotone-control">
          <span>Chromatic offset</span>
          <input
            v-model.number="chromaticOffset"
            type="range"
            min="0"
            max="20"
            step="0.5"
          />
          <output>{{ chromaticOffset }}px</output>
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
    </details>

    <section class="hero">
      <div
        v-if="caseStudy.featuredMedia?.sourceUrl"
        class="hero-halftone-box is-halftone-separate-k"
        :class="duotoneClasses"
        :style="duotoneStyle"
      >
        <div class="hero-halftone">
          <FeaturedMediaFrame
            class="hero-media"
            :media="caseStudy.featuredMedia"
            label="Case Study"
            :transition-key="mediaTransitionKey"
            transition-role="target"
            transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
            loading="eager"
            fetch-priority="high"
            sizes="100vw"
          />
          <div class="hero-ink" aria-hidden="true" />
          <div
            v-if="duotoneMode === 'chromatic'"
            class="hero-ink-chromatic"
            aria-hidden="true"
          />
          <div
            v-if="duotoneMode === 'bleed'"
            class="hero-bleed"
            aria-hidden="true"
          />
        </div>
        <div class="hero-k-layer" aria-hidden="true">
          <img
            class="hero-k-image"
            :src="caseStudy.featuredMedia.sourceUrl"
            alt=""
            loading="eager"
          />
        </div>
      </div>

      <header
        class="header"
        :class="{ 'is-transition-hidden': isTitleTransitioning }"
        :data-featured-slip-target="mediaTransitionKey"
      >
        <h1 class="title" :data-featured-title-target="mediaTransitionKey">
          <span>
            {{ caseStudy.title }}
          </span>
        </h1>
      </header>
    </section>

    <BlockRenderer class="content" :blocks="caseStudyBlocks" />

    <section v-if="caseStudyBodyError" class="body-state" aria-live="polite">
      <p class="meta">Error</p>
      <h2>Unable to load case-study body.</h2>
      <p class="excerpt">
        The CMS request for this case study's blocks failed. Try refreshing, or
        check whether WordPress is running.
      </p>
    </section>

    <div ref="loopNavSentinel" class="loop-nav-sentinel" aria-hidden="true" />

    <CaseStudyLoopNav
      v-if="caseStudyLoopNav"
      :previous="caseStudyLoopNav.previous"
      :next="caseStudyLoopNav.next"
    />
  </article>

  <section v-else class="case-study-page-state" aria-live="polite">
    <p class="meta">
      {{ isLoading ? 'Loading' : error ? 'Error' : 'Not Found' }}
    </p>
    <h1>
      {{
        isLoading
          ? 'Loading case study...'
          : error
            ? 'Unable to load case study.'
            : 'Case study not found.'
      }}
    </h1>
    <p class="excerpt">
      {{
        isLoading
          ? 'Fetching this case study from WordPress.'
          : error
            ? 'The CMS request failed. Try refreshing, or check whether WordPress is running.'
            : `No case study exists for "${slug}".`
      }}
    </p>
  </section>
</template>

<style lang="scss" scoped>
  .case-study-page {
    width: 100%;
    max-width: none;
    min-height: 55vh;
    padding: 0 0 var(--space-9);
    color: var(--color-ink);
    background: var(--color-surface-warmer);
  }

  // SPIKE: duotone tuning controls. Sticky panel at the top of the page.
  // Removed with the rest of the spike scaffolding.
  .duotone-controls {
    position: sticky;
    top: 0;
    z-index: 10;
    max-height: 80vh;
    padding: var(--space-3) var(--space-5);
    background: var(--color-surface-warm);
    border-bottom: 1px solid var(--color-slip-border);
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

  .duotone-controls-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-4);
    margin-top: var(--space-2);
    padding-top: var(--space-2);
    border-top: 1px dashed var(--color-slip-border);
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
    border: 1px solid var(--color-slip-border);
    color: var(--color-ink);
    font: inherit;
  }

  .hero {
    position: relative;
    z-index: 1;
    margin-bottom: 0;
    overflow: hidden;
  }

  .hero::after {
    content: none;
  }

  // Title sits directly on the halftoned image — no slip panel. The
  // data-featured-slip-target attribute on this element is kept so the
  // card-to-detail featured-media transition can still read geometry here;
  // visually there's no panel, just type on the photo.
  .header {
    position: absolute;
    left: var(--space-6);
    bottom: var(--space-7);
    z-index: 2;
    max-width: min(54rem, calc(100% - var(--space-7)));
    padding: var(--space-4) var(--space-5) var(--space-5);
  }

  .title {
    max-width: 38rem;
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: clamp(1.75rem, 3.5vw, 3.25rem);
    line-height: 1.1;
    text-wrap: balance;
  }

  .title span {
    display: inline;
  }

  .is-transition-hidden {
    opacity: 0;
    transition: none;
  }

  // Halftone treatment on the case-study hero. Structure:
  //   .hero-halftone-box (outer: sepia + saturation)
  //     > .hero-halftone (main pane: CMY plate filter chain)
  //       > FeaturedMediaFrame + .hero-ink (ink pseudos)
  //     + .hero-k-layer (sibling K pane: soft luminance shadow plate)
  //       > <img> + ::after (K ink)
  // Defaults live in `packages/styles/shared-components/_halftone-image.scss`;
  // override per-page by setting --halftone-* custom properties on the box.
  .hero-halftone-box {
    display: block;
    position: relative;
    width: 100%;
    @include halftone-image-box;

    // SPIKE: duotone tone-pair selectors. Default is ink + cream; override
    // via class. Removed with the rest of the spike scaffolding.
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

  // SPIKE: direct duotone — apply an SVG color-matrix + component-transfer
  // filter to the entire halftone box. This replaces the default sepia +
  // saturate filter chain with a proper luminance-to-tone mapping (the SVG
  // filters are defined inline at the top of this template). Output is
  // constrained to the chosen tone palette regardless of the underlying
  // halftone's CMYK output.
  .hero-halftone-box.is-halftone-duotone-direct {
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

  // SPIKE: chromatic aberration — extra duotone ink plane translated for
  // misregistration feel.
  .hero-ink-chromatic {
    @include halftone-image-ink-chromatic;
  }

  // SPIKE: bleed — duotone gradient overlay.
  .hero-bleed {
    @include halftone-image-bleed;
  }

  // SPIKE: hover-reveals — on hover, revert to default CMYK (and hide any
  // chromatic / bleed overlays) so the underlying full-color halftone shows.
  .hero-halftone-box.is-halftone-hover-reveals:hover {
    &.is-halftone-duotone-direct .hero-ink {
      @include halftone-image-ink;
    }

    .hero-ink-chromatic,
    .hero-bleed {
      display: none;
    }
  }

  .hero-halftone {
    @include halftone-image-pane;
  }

  .hero-media {
    display: block;
    width: 100%;
    height: min(72vh, 44rem);
    aspect-ratio: auto;
    margin: 0;
    overflow: hidden;
  }

  .hero-halftone :deep(.image) {
    @include halftone-image-media;
  }

  .hero-ink {
    @include halftone-image-ink;
  }

  // Separate-K mode: main image rendered hue-only, main ink drops the K plate
  // (K dots come from the K layer below).
  .hero-halftone-box.is-halftone-separate-k {
    :deep(.image) {
      @include halftone-image-media-hues;
    }

    .hero-ink {
      @include halftone-image-ink-separate-k-override;
    }
  }

  // K layer — soft K pane (no threshold) so K carries continuous-tone
  // shading multiplied over the main pane. Preserves highlight detail.
  .hero-k-layer {
    @include halftone-image-k-pane;
  }

  .hero-k-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    @include halftone-image-k-media;
  }

  .hero-k-layer::after {
    @include halftone-image-k-ink;
  }

  .hero-media :deep(.image) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .content {
    position: relative;
    z-index: 2;
    width: 100%;
    background: var(--color-surface-warmer);
    padding-top: var(--space-5);
    animation: detail-content-rise var(--motion-route-transition-duration)
      var(--motion-snappy) var(--motion-route-content-delay) both;
  }

  .loop-nav-sentinel {
    height: 1px;
  }

  .body-state {
    max-width: var(--article-column);
    margin: var(--space-6) auto 0;
    padding-inline: var(--article-padding-inline);
    color: var(--color-ink);
  }

  .body-state > .meta {
    color: var(--color-muted);
  }

  .case-study-page-state {
    max-width: 44rem;
    min-height: 55vh;
    padding: var(--space-8) 0 var(--space-9);
    color: var(--color-ink);
    background: var(--color-surface-warmer);
  }

  .meta {
    color: var(--color-muted);
  }

  @keyframes detail-content-rise {
    from {
      transform: translateY(46vh);
    }

    to {
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .content {
      animation: none;
    }
  }
</style>
