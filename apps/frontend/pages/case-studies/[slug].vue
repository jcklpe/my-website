<script setup lang="ts">
  import type { GutenbergBlock, WordPressCaseStudy } from '~/types/wordpress';
  import {
    hasCaseStudyHalftoneMedia,
    mediaSourceUrlForWidth,
  } from '~/utils/featured-media';

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

    return { previous, next, previousIndex, nextIndex };
  });

  const isLoading = computed(
    () => status.value === 'idle' || status.value === 'pending',
  );
  const caseStudyBlocks = computed(() => caseStudyBodyBlocks.value ?? []);

  const hasBakedHalftone = computed(() =>
    hasCaseStudyHalftoneMedia(caseStudy.value?.featuredMedia),
  );
  const heroKLayerSourceUrl = computed(() =>
    hasBakedHalftone.value
      ? ''
      : mediaSourceUrlForWidth(caseStudy.value?.featuredMedia, 1800),
  );

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

  // Only animate the body's rise when the page was ARRIVED AT via the
  // featured-media transition — not on plain refresh/direct-load. Captured
  // once at mount: the transition's `active` flag is still set when the
  // detail page mounts (it clears later, at hand-off). Now that the body
  // renders above the flying media clone (see FeaturedMediaTransitionLayer),
  // the rise is finally visible over the photo instead of hidden under it.
  const enteredViaTransition = ref(false);
  onMounted(() => {
    if (
      transitionState.value.active &&
      transitionState.value.key === mediaTransitionKey.value
    ) {
      enteredViaTransition.value = true;
    }
  });

  // Departure (detail → home): when the reverse transition fires, the page is
  // already mounted and `active` flips false→true (arrival had it true at
  // mount, so this watcher only catches the later departure). The body then
  // animates DOWN and out — the mirror of the arrival rise — before the
  // composable navigates away. See waitForBodyExit in the transition composable.
  const leaving = ref(false);
  watch(
    () => transitionState.value.active,
    (isActive, wasActive) => {
      if (
        isActive &&
        !wasActive &&
        transitionState.value.key === mediaTransitionKey.value
      ) {
        leaving.value = true;
      }
    },
  );

  // SPIKE: duotone / legibility exploration controls. Live-comparison UI for
  // toggling between full CMYK halftone and various duotone treatments.
  // Remove with the entire control block once a direction is locked in.
  type DuotoneMode = 'off' | 'direct' | 'crisp' | 'bleed';
  type TonePair =
    | 'ink-cream'
    | 'blue-cream'
    | 'ink-blue'
    | 'tritone-ink-blue-cream'
    | 'tritone-ink-soft-cream';
  type BleedDirection = 'to top' | 'to bottom' | 'to left' | 'to right';
  const duotoneMode = ref<DuotoneMode>('off');
  const tonePair = ref<TonePair>('ink-cream');
  // Matches the flying clone's halftone size (halftone-image-box default,
  // 11px). Keeping the resting detail photoplate at the same resolution as the
  // in-flight/hover treatment means the hand-off cross-fade lands on a
  // pixel-identical plate (invisible swap) instead of "resolving down" to a
  // finer grain — which read as a slight vibration and made the cross-fade
  // look like the photoplate fading out.
  const halftoneSize = ref(11);
  const bleedDirection = ref<BleedDirection>('to top');
  const bleedStrength = ref(100);
  const bleedOpacity = ref(0.5);
  const bleedBlend = ref('overlay');
  const tintOverlayEnabled = ref(false);
  const tintOpacity = ref(0.4);
  const tintAngle = ref(135);
  const hoverReveals = ref(false);

  // SPIKE phase A — hero composition controls. Layout variants:
  //   layered       the user's sketch (current direction): photo plate at
  //                 the top, anchored to one side, its outer bottom corner
  //                 swept by one giant circular radius — the plate's own
  //                 corner, a curve IN, not a carve out. The title column
  //                 is plain page ground layered OVER the plate's lower
  //                 inner region (the page rising over the mounted plate —
  //                 the desert-jackalope overlap). The column is straight;
  //                 it ignores the curve entirely.
  //   carved        title shelf carved into the plate with an elliptical
  //                 arc (reviewed: not a fan — kept for comparison)
  //   mount         specimen mount (reviewed: not a fan — kept for
  //                 comparison)
  //   mount-carved  mount plus carved corner
  // Resting color mode is full CMYK halftone (duotone mode "off") per the
  // color journey: duotone at browsing distance, color on arrival.
  type HeroLayout = 'layered' | 'carved' | 'mount' | 'mount-carved';
  const heroLayout = ref<HeroLayout>('layered');
  const carveSide = ref<'right' | 'left'>('right');
  const carveSweep = ref(900);
  // Layered: the title column's bottom offset from the plate's bottom.
  // Default matches paperStep so the title bottom meets the rising body top
  // (continuous column). Carved/mount reuse it as the shelf/arc height.
  const shelfHeight = ref(560);
  const shelfWidth = ref(56);
  const mountWidth = ref(77);
  // Layered: title horizontal position (0% = flush left, 50% = centered on
  // the body column, 100% = flush right), single-line vs. column-width
  // wrapping, and how far the photo plate bleeds left (0% = full-bleed left
  // edge, larger = more inset from the left).
  const titleShift = ref(7);
  const titleSingleLine = ref(true);
  const photoLeftBleed = ref(13);
  // Layered: photo plate height (px). The plate can now run much deeper
  // behind the rising body column — floats carry the cream mat, so body
  // imagery sitting over the photo stays legible. 0 keeps the responsive
  // default clamp.
  const heroHeight = ref(1000);

  // The hero-composition control panel is now a shipped easter egg rather
  // than dev scaffolding: hidden by default, revealed by the Konami code
  // (↑ ↑ ↓ ↓ ← → ← → b a). The ref defaults above are the committed design;
  // the panel just lets a curious visitor (or the author) replay the knobs.
  const devControlsVisible = ref(false);
  const konamiSequence = [
    'arrowup',
    'arrowup',
    'arrowdown',
    'arrowdown',
    'arrowleft',
    'arrowright',
    'arrowleft',
    'arrowright',
    'b',
    'a',
  ];
  let konamiPosition = 0;

  function handleKonamiKey(event: KeyboardEvent) {
    const key = event.key.toLowerCase();

    if (key === konamiSequence[konamiPosition]) {
      konamiPosition += 1;

      if (konamiPosition === konamiSequence.length) {
        devControlsVisible.value = !devControlsVisible.value;
        konamiPosition = 0;
      }

      return;
    }

    // Reset, but allow the mistyped key to start a fresh sequence.
    konamiPosition = key === konamiSequence[0] ? 1 : 0;
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKonamiKey);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKonamiKey);
  });
  // Layered: pull the article's opening paragraphs into the overlapping
  // text column so the layered feel includes real body copy (capped at 3;
  // the remainder renders through BlockRenderer as usual).
  // Layered: the "fake paper top". Raising the shelf pulls the body slab up
  // with it (the hero's flow height shrinks), so the slab's ground gets a
  // shaped top — for the first --paper-step px it paints cream only across
  // the tab (page edge → just past the article column), leaving the photo
  // visible beyond it. Below the photo the transparent zone sits over page
  // ground of the same color, so the step is invisible there and an
  // overshoot is harmless.
  const paperStep = ref(400);
  const contentClasses = computed(() => ({
    'has-paper-top': heroLayout.value === 'layered',
    'is-arriving': enteredViaTransition.value && !leaving.value,
    'is-leaving': leaving.value,
  }));
  const contentStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {};

    if (heroLayout.value === 'layered') {
      style['--paper-step'] = `${paperStep.value}px`;
    }

    return style;
  });
  const heroClasses = computed(() => [
    `is-hero-${heroLayout.value}`,
    `is-carve-${carveSide.value}`,
    { 'is-title-single-line': titleSingleLine.value },
  ]);
  const heroStyle = computed<Record<string, string>>(() => ({
    '--hero-carve-sweep': `${carveSweep.value}px`,
    '--hero-shelf-height': `${shelfHeight.value}px`,
    '--hero-shelf-width': `${shelfWidth.value}%`,
    '--hero-mount-width': `${mountWidth.value}%`,
    '--title-shift': `${titleShift.value}%`,
    '--photo-left-bleed': `${photoLeftBleed.value}%`,
    '--hero-plate-height': `${heroHeight.value}px`,
  }));
  const duotoneClasses = computed(() => ({
    'is-halftone-duotone-direct': duotoneMode.value === 'direct',
    'is-halftone-duotone-crisp': duotoneMode.value === 'crisp',
    'is-halftone-duotone-bleed': duotoneMode.value === 'bleed',
    [`is-halftone-tone-${tonePair.value}`]: true,
    'is-halftone-hover-reveals': hoverReveals.value,
  }));
  const duotoneStyle = computed<Record<string, string>>(() => ({
    '--halftone-size': `${halftoneSize.value}px`,
    '--halftone-bleed-direction': bleedDirection.value,
    '--halftone-bleed-strength': `${bleedStrength.value}%`,
    '--halftone-bleed-opacity': String(bleedOpacity.value),
    '--halftone-bleed-blend': bleedBlend.value,
    '--halftone-tint-opacity': String(tintOpacity.value),
    '--halftone-tint-angle': `${tintAngle.value}deg`,
  }));
</script>

<template>
  <article
    v-if="caseStudy"
    class="case-study-page"
    :class="{
      'is-leaving': leaving,
      'is-hero-arriving': isTitleTransitioning && transitionState.sourceRole === 'source',
      'is-hero-departing': isTitleTransitioning && transitionState.sourceRole === 'target',
    }"
  >
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
        <!-- Discrete (crisp) duotone variants. type="discrete" produces a
             step function — every output pixel is exactly one of two colors,
             no intermediate values. The engraving look. -->
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

    <!-- Hero composition / duotone playground — an easter egg, hidden until
         the Konami code (↑ ↑ ↓ ↓ ← → ← → b a) toggles it. The committed
         design lives in the ref defaults; this panel just replays the knobs.
         The SVG filter defs above stay rendered so a duotone mode chosen in
         the panel resolves immediately. -->
    <details v-if="devControlsVisible" open class="duotone-controls">
      <summary>Hero composition / duotone controls (easter egg)</summary>
      <div class="duotone-controls-row">
        <label class="duotone-control">
          <span>Hero layout</span>
          <select v-model="heroLayout">
            <option value="layered">Layered (column over the plate)</option>
            <option value="carved">Carved (title shelf in the plate)</option>
            <option value="mount">Mount (plate beside title column)</option>
            <option value="mount-carved">Mount + carved corner</option>
          </select>
        </label>
        <label class="duotone-control">
          <span>Carve side</span>
          <select v-model="carveSide">
            <option value="right">Right</option>
            <option value="left">Left</option>
          </select>
        </label>
        <label class="duotone-control">
          <span>Carve sweep</span>
          <input
            v-model.number="carveSweep"
            type="range"
            min="120"
            max="900"
            step="10"
          />
          <output>{{ carveSweep }}px</output>
        </label>
        <label class="duotone-control">
          <span>Title offset / shelf height</span>
          <input
            v-model.number="shelfHeight"
            type="range"
            min="110"
            max="560"
            step="2"
          />
          <output>{{ shelfHeight }}px</output>
        </label>
        <label class="duotone-control">
          <span>Paper step</span>
          <input
            v-model.number="paperStep"
            type="range"
            min="0"
            max="400"
            step="4"
          />
          <output>{{ paperStep }}px</output>
        </label>
        <label class="duotone-control">
          <span>Shelf width</span>
          <input
            v-model.number="shelfWidth"
            type="range"
            min="32"
            max="88"
            step="1"
          />
          <output>{{ shelfWidth }}%</output>
        </label>
        <label class="duotone-control">
          <span>Plate / mount width</span>
          <input
            v-model.number="mountWidth"
            type="range"
            min="42"
            max="94"
            step="1"
          />
          <output>{{ mountWidth }}%</output>
        </label>
        <label class="duotone-control">
          <span>Title position (L↔R)</span>
          <input
            v-model.number="titleShift"
            type="range"
            min="0"
            max="100"
            step="1"
          />
          <output>{{ titleShift }}%</output>
        </label>
        <label class="duotone-control duotone-control-toggle">
          <input v-model="titleSingleLine" type="checkbox" />
          <span>Title single line (no wrap)</span>
        </label>
        <label class="duotone-control">
          <span>Photo left bleed</span>
          <input
            v-model.number="photoLeftBleed"
            type="range"
            min="0"
            max="40"
            step="1"
          />
          <output>{{ photoLeftBleed }}%</output>
        </label>
        <label class="duotone-control">
          <span>Hero height</span>
          <input
            v-model.number="heroHeight"
            type="range"
            min="320"
            max="1200"
            step="10"
          />
          <output>{{ heroHeight }}px</output>
        </label>
      </div>
      <div class="duotone-controls-row">
        <label class="duotone-control">
          <span>Mode</span>
          <select v-model="duotoneMode">
            <option value="off">Off (full CMYK)</option>
            <option value="direct">Direct duotone (linear)</option>
            <option value="crisp">
              Crisp duotone (engraving, 2-color only)
            </option>
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
          <span>Tint angle</span>
          <input
            v-model.number="tintAngle"
            type="range"
            min="0"
            max="360"
            step="1"
          />
          <output>{{ tintAngle }}deg</output>
        </label>
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
      </div>
    </details>

    <section class="hero" :class="heroClasses" :style="heroStyle">
      <!-- The photo plate. In the carved layout it spans the hero; in mount
           layouts it docks to one column. The title shelf/column below is
           page ground, never an overlay on the image. -->
      <div
        class="hero-plate"
        :class="{
          'is-baked-halftone': hasBakedHalftone,
          'is-transition-hidden': isTitleTransitioning,
        }"
      >
        <div
          v-if="caseStudy.featuredMedia?.sourceUrl"
          class="hero-halftone-box is-halftone-separate-k"
          :class="{
            ...duotoneClasses,
            'is-baked-halftone': hasBakedHalftone,
          }"
          :style="duotoneStyle"
        >
          <div class="hero-halftone">
            <FeaturedMediaFrame
              class="hero-media"
              :media="caseStudy.featuredMedia"
              label="Case Study"
              :treatment="
                hasBakedHalftone ? 'case-study-halftone' : 'default'
              "
              :transition-key="mediaTransitionKey"
              transition-role="target"
              transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
              loading="eager"
              fetch-priority="high"
              sizes="100vw"
            />
            <div v-if="!hasBakedHalftone" class="hero-ink" aria-hidden="true" />
            <div
              v-if="!hasBakedHalftone && duotoneMode === 'bleed'"
              class="hero-bleed"
              aria-hidden="true"
            />
          </div>
          <div v-if="heroKLayerSourceUrl" class="hero-k-layer" aria-hidden="true">
            <img
              class="hero-k-image"
              :src="heroKLayerSourceUrl"
              alt=""
              loading="eager"
            />
          </div>
        </div>
        <!-- Gradient tint is an INDEPENDENT overlay toggle now — can compose
             on top of any halftone mode. Lives outside .hero-halftone-box so
             the linear gradient doesn't get fed through the box's filter
             chain (sepia, saturate) or the halftone pane's threshold filter,
             which would turn the smooth gradient into hard-edged blocks. -->
        <div
          v-if="
            !hasBakedHalftone &&
            tintOverlayEnabled &&
            caseStudy.featuredMedia?.sourceUrl
          "
          class="hero-gradient-tint"
          :class="`is-halftone-tone-${tonePair}`"
          :style="duotoneStyle"
          aria-hidden="true"
        />
      </div>

      <header
        class="header"
        :class="{ 'is-transition-hidden': isTitleTransitioning }"
        :data-featured-slip-target="mediaTransitionKey"
      >
        <h1
          class="title"
          :data-featured-title-target="mediaTransitionKey"
          :data-featured-title-text="caseStudy.title"
        >
          <SteppedTitleGround
            class="title-text"
            :text="caseStudy.title"
            ground-color="var(--color-surface-warmer)"
            data-featured-title-text-layer
          />
        </h1>
      </header>
    </section>

    <BlockRenderer
      class="content"
      :class="contentClasses"
      :style="contentStyle"
      :data-featured-body-exit-target="mediaTransitionKey"
      :blocks="caseStudyBlocks"
    />

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
      :previous-index="caseStudyLoopNav.previousIndex"
      :next="caseStudyLoopNav.next"
      :next-index="caseStudyLoopNav.nextIndex"
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

  // Forward (home → detail): fade cream in over the full flight duration so the
  // background rises with the clone rather than popping in at the end.
  .case-study-page.is-hero-arriving {
    animation: cream-bg-in var(--featured-media-flight-duration) var(--snappy-ease-out) both;
  }

  // Reverse (detail → home): fade cream out over the body-exit duration so the
  // background retreats as the content slides away rather than cutting instantly.
  .case-study-page.is-hero-departing {
    animation: cream-bg-out var(--article-bodyplate-exit-duration) var(--snappy-ease-in) both;
  }

  @keyframes cream-bg-in {
    from { background-color: var(--color-surface-warmer-0); }
    to   { background-color: var(--color-surface-warmer); }
  }

  @keyframes cream-bg-out {
    from { background-color: var(--color-surface-warmer); }
    to   { background-color: var(--color-surface-warmer-0); }
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
    flex-wrap: wrap;
    gap: var(--space-2);
    max-width: 100%;
  }

  .duotone-control select {
    max-width: 100%;
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

  // The photo plate wrapper. Owns clipping so carved corners (mount-carved)
  // cut the halftone layers cleanly.
  .hero-plate {
    position: relative;
    overflow: hidden;
  }

  // ── Layered layout (the user's sketch — current direction) ─────────────
  // The photo plate sits at the top, anchored to one side, its outer
  // bottom corner swept by ONE giant circular radius — the plate's own
  // corner, a curve in, not a carve out. The title column is plain page
  // ground layered OVER the plate's lower inner region: the page rising
  // over the mounted plate (the desert-jackalope overlap). The column is
  // straight and ignores the curve entirely. No border, no panel — the
  // column is the page itself, and it is the slip-target rectangle the
  // card's flying plate dissolves into (phase B).
  // Layered hero must NOT clip (the base .hero sets overflow: hidden, which
  // with the header's pull collapsed the hero shorter than the plate and
  // clipped the photo). z-index: auto (overriding the base z-index: 1) stops
  // the hero from forming a stacking context — otherwise the title column
  // (z-index 3, inside the hero) is trapped below the rising content
  // (z-index 2) and the content's cream paints over the title. With auto,
  // plate (auto) < content (2) < title (3) at the page level: content rises
  // over the photo, title stays above the content.
  .is-hero-layered {
    overflow: visible;
    z-index: auto;
  }

  // Photo left bleed: the plate is right-anchored, so its width is how far
  // it reaches left. 0% bleed = full width (flush to the left edge).
  .is-hero-layered .hero-plate {
    width: calc(100% - var(--photo-left-bleed, 20%));
    height: var(--hero-plate-height, clamp(380px, 62vh, 700px));
  }

  .is-hero-layered.is-carve-right .hero-plate {
    margin-left: auto;
    border-bottom-right-radius: min(var(--hero-carve-sweep, 500px), 70vw);
  }

  .is-hero-layered.is-carve-left .hero-plate {
    margin-right: auto;
    border-bottom-left-radius: min(var(--hero-carve-sweep, 500px), 70vw);
  }

  // The title column is absolutely positioned so it does NOT contribute to
  // the hero's height — the plate alone defines that (a relative header as
  // last-in-flow child with a negative margin collapsed the hero shorter
  // than the plate, clipping/overflowing the photo). Bottom-anchored over
  // the photo's lower-left; z-index 3 keeps it above the rising content.
  // --hero-shelf-height is the title's bottom offset from the plate's
  // bottom; keep it >= --paper-step so the title sits above the body that
  // rises to meet it (a continuous column).
  // Title column. Positioned by --title-shift via the left%/translateX(-%)
  // trick so it slides from flush-left (0%) through centered-on-the-body-
  // column (50%) to flush-right (100%) regardless of its own width. The
  // cream padding (space-5 each side) gives the title >=24px breathing room.
  // Width: column mode wraps the title at the body-column width; single-line
  // mode (is-title-single-line) sizes to the title and never wraps.
  .is-hero-layered .header {
    position: absolute;
    left: var(--title-shift, 0%);
    right: auto;
    bottom: var(--hero-shelf-height, 240px);
    transform: translateX(calc(-1 * var(--title-shift, 0%)));
    z-index: 3;
    box-sizing: border-box;
    width: min(
      calc(100% - var(--space-6)),
      calc(var(--article-column) + 2 * var(--space-5))
    );
    padding: var(--space-4) var(--space-5) var(--space-3);
    background: var(--color-surface-warmer);
  }

  .is-hero-layered.is-title-single-line .header {
    width: max-content;
    max-width: calc(100% - var(--space-6));
  }

  .is-hero-layered.is-title-single-line .title {
    white-space: nowrap;
  }

  // Layered: the halftone fills the whole plate (like the cards' image
  // area) so the image and the rounded plate are one box. Otherwise the
  // halftone collapses to the image's aspect height (shorter than the
  // plate), leaving an ink gap hidden under the body — and, worse, the
  // featured-media transition tracks that short media box while the rounded
  // corner lives on the taller plate, so the flying clone can't match it.
  .is-hero-layered .hero-halftone-box {
    position: absolute;
    inset: 0;
  }

  .is-hero-layered .hero-halftone {
    width: 100%;
    height: 100%;
  }

  .is-hero-layered .hero-media {
    height: 100%;
  }

  // ── Carved layout ──────────────────────────────────────────────────────
  // The title shelf: page ground carved into the plate's bottom corner with
  // one drafted elliptical arc (horizontal sweep × shelf height, declared
  // explicitly so the browser can't clamp a long sweep against a short
  // shelf). No border, no background object — deliberately the same surface
  // as the page, because on the detail page text has arrived on the
  // document itself; only the homepage mounts text on plates. The shelf is
  // also the slip-target rectangle the card's flying plate dissolves into
  // (phase B). The title sits at the shelf's bottom, where the arc has
  // fully receded, so type never touches the curve.
  .is-hero-carved .header {
    position: absolute;
    bottom: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    // Explicit border-box: the project has no global reset, and width +
    // arc-clearance padding on content-box overflows the viewport (same
    // footgun as the card's link-box).
    box-sizing: border-box;
    width: var(--hero-shelf-width, 56%);
    min-height: var(--hero-shelf-height, 176px);
    padding: var(--space-4) var(--space-6) var(--space-4);
    background: var(--color-surface-warmer);
  }

  .is-hero-carved.is-carve-right .header {
    right: 0;
    text-align: right;
    border-top-left-radius: min(var(--hero-carve-sweep, 420px), 64vw)
      var(--hero-shelf-height, 176px);
    padding-inline-start: calc(min(var(--hero-carve-sweep, 420px), 64vw) * 0.2);
  }

  .is-hero-carved.is-carve-left .header {
    left: 0;
    text-align: left;
    border-top-right-radius: min(var(--hero-carve-sweep, 420px), 64vw)
      var(--hero-shelf-height, 176px);
    padding-inline-end: calc(min(var(--hero-carve-sweep, 420px), 64vw) * 0.2);
  }

  // ── Mount layouts ──────────────────────────────────────────────────────
  // Specimen mount: the plate docks to one side, the title sets in the
  // cream column beside it. The carve side control decides which side the
  // plate sits on (plate opposite the title).
  .is-hero-mount,
  .is-hero-mount-carved {
    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--hero-mount-width, 58%);
    align-items: end;
  }

  .is-hero-mount .hero-plate,
  .is-hero-mount-carved .hero-plate {
    grid-column: 2;
    grid-row: 1;
  }

  .is-hero-mount .header,
  .is-hero-mount-carved .header {
    grid-column: 1;
    grid-row: 1;
    padding: var(--space-6);
  }

  .is-hero-mount.is-carve-left .hero-plate,
  .is-hero-mount-carved.is-carve-left .hero-plate {
    grid-column: 1;
  }

  .is-hero-mount.is-carve-left .header,
  .is-hero-mount-carved.is-carve-left .header {
    grid-column: 2;
    text-align: right;
  }

  // Mount + carve: the plate's bottom corner facing the title column gets
  // the drafted arc.
  .is-hero-mount-carved.is-carve-right .hero-plate {
    border-bottom-left-radius: min(var(--hero-carve-sweep, 420px), 50vw)
      var(--hero-shelf-height, 176px);
  }

  .is-hero-mount-carved.is-carve-left .hero-plate {
    border-bottom-right-radius: min(var(--hero-carve-sweep, 420px), 50vw)
      var(--hero-shelf-height, 176px);
  }

  .title {
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: clamp(1.9rem, 4vw, 3.75rem);
    line-height: 1.08;
    text-wrap: balance;
  }

  .title span {
    display: inline;
  }

  .title .stepped-title-ground {
    display: block;
  }

  .title-ground {
    display: none;
  }

  @include breakpoint(phone) {
    // Layered mobile keeps a simpler version of the desktop interlock:
    // photo band, title plate pulled up over the photo, then a slight body
    // overlap so the image can dip under the article edge without putting
    // running text directly on the photo.
    .is-hero-layered .hero-plate {
      width: 100%;
      height: max(39vh, clamp(14.25rem, 77vw, 27rem));
      margin-left: 0;
      border-bottom-right-radius: clamp(4rem, 30vw, 8rem);
    }

    .is-hero-layered .header {
      position: relative;
      top: auto;
      right: auto;
      bottom: auto;
      left: auto;
      width: auto;
      max-width: none;
      transform: none;
      margin: calc(-1 * clamp(10.75rem, 54vw, 13.25rem)) 0 0;
      padding: var(--space-3) var(--space-4) var(--space-4);
      background: transparent;
    }

    .is-hero-layered.is-title-single-line .header {
      width: auto;
      max-width: none;
    }

    .is-hero-layered.is-title-single-line .title {
      white-space: normal;
    }

    .title {
      position: relative;
      font-size: 1.45rem;
      line-height: 1.18;
      overflow-wrap: anywhere;
      word-break: break-word;
      text-wrap: wrap;
    }

    .title-text {
      position: relative;
      z-index: 1;
    }

    .title-ground {
      display: none;
    }

    // NOTE: the layered .content phone override lives in its own
    // breakpoint block AFTER the .content rules below — placing it here
    // (before the desktop .content.has-paper-top rule) loses the cascade
    // at equal specificity.

    // The shelf widens and shortens on phones; the sweep is already
    // viewport-clamped by min(). Mounts stack: plate above, title below.
    .is-hero-carved .header {
      width: 90%;
      min-height: calc(var(--hero-shelf-height, 176px) * 0.65);
      padding-inline: var(--space-4);
    }

    .is-hero-mount,
    .is-hero-mount-carved {
      display: block;
    }

    .is-hero-mount .header,
    .is-hero-mount-carved .header,
    .is-hero-mount.is-carve-left .header,
    .is-hero-mount-carved.is-carve-left .header {
      padding: var(--space-4);
      text-align: left;
    }
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

  // SPIKE: direct duotone — SVG color-matrix + component-transfer with
  // type="table" (linear interpolation between tones). Output gamut
  // constrained to the tone palette but with smooth midtones.
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

  // SPIKE: crisp duotone — SVG component-transfer with type="discrete" so the
  // output is exactly 2 colors per pixel, no interpolation. Engraving look.
  // Combine with the halftone-size slider cranked up for the abstract-giant
  // variant.
  .hero-halftone-box.is-halftone-duotone-crisp {
    &.is-halftone-tone-ink-cream {
      filter: url('#halftone-tone-crisp-ink-cream');
    }
    &.is-halftone-tone-blue-cream {
      filter: url('#halftone-tone-crisp-blue-cream');
    }
    &.is-halftone-tone-ink-blue {
      filter: url('#halftone-tone-crisp-ink-blue');
    }
    // Tritone tone pairs fall back to direct mode's linear variant — crisp
    // is by definition 2-color, so a tritone tone-pair on crisp mode just
    // uses the closest 2-color equivalent.
    &.is-halftone-tone-tritone-ink-blue-cream {
      filter: url('#halftone-tone-crisp-blue-cream');
    }
    &.is-halftone-tone-tritone-ink-soft-cream {
      filter: url('#halftone-tone-crisp-ink-cream');
    }
  }

  // SPIKE: bleed — duotone gradient overlay (blend mode defaults to overlay
  // via the page's bleedBlend ref).
  .hero-bleed {
    @include halftone-image-bleed;
  }

  // SPIKE: gradient tint — keep the full halftone pipeline active (sepia +
  // saturate at the box, threshold inside) and overlay the gradient tint as
  // a SIBLING of the halftone box so it doesn't pass through any of the
  // halftone's filters. Tone variables are redefined here because the
  // element sits outside .hero-halftone-box where they're scoped — without
  // these the linear-gradient resolves to empty and renders invisible.
  .hero-gradient-tint {
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

  // SPIKE: hover-reveals — on hover, revert to full-color CMYK halftone (and
  // fade out overlays) so the underlying photo + halftone shows. Transitions
  // animate over 300ms with snappy-ease-out. Caveat: filter transitions between
  // url() SVG filters and CSS function filters (sepia/saturate) interpolate
  // poorly in most browsers — likely snaps rather than cross-fades. The
  // overlay opacity transitions DO cross-fade smoothly.
  .hero-halftone-box.is-halftone-hover-reveals {
    transition: filter 300ms var(--snappy-ease-out);

    .hero-bleed,
    .hero-gradient-tint {
      transition: opacity 300ms var(--snappy-ease-out);
    }
  }

  .hero-halftone-box.is-halftone-hover-reveals:hover {
    &.is-halftone-duotone-direct,
    &.is-halftone-duotone-crisp {
      filter: sepia(var(--halftone-sepia)) saturate(var(--halftone-saturation));
    }

    .hero-bleed,
    .hero-gradient-tint {
      opacity: 0;
    }
  }

  // Safari and coarse/mobile devices can stall on the full live CMYK/K
  // halftone stack. In the performance-safe mode, the case-study composition
  // stays intact but the plate renders as a direct image instead of filters,
  // blends, oversized dot fields, and a duplicate K layer.
  .hero-halftone-box.is-baked-halftone,
  .hero-halftone-box.is-baked-halftone .hero-halftone {
    filter: none;
  }

  .hero-halftone-box.is-baked-halftone .hero-media :deep(.image) {
    filter: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-halftone-box.is-halftone-hover-reveals,
    .hero-halftone-box.is-halftone-hover-reveals .hero-bleed,
    .hero-halftone-box.is-halftone-hover-reveals .hero-gradient-tint {
      transition: none;
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

  .hero-halftone-box.is-baked-halftone {
    :deep(.image) {
      filter: none;
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
    transform: translate(0, 0);
    transition: none;
  }

  // z-index 2 keeps the body above the real hero plate at rest AND above the
  // flying media clone (z-index 1) during the transition, so its entrance rise
  // is visible OVER the photo. The rise only plays when arriving via the
  // transition (.is-arriving, set at mount) — never on plain refresh, where
  // the page should just load.
  .content {
    position: relative;
    z-index: 2;
    width: 100%;
    background: var(--color-surface-warmer);
    padding-top: var(--space-5);
  }

  .content.is-arriving {
    animation: detail-content-rise var(--featured-media-flight-duration)
      var(--snappy-ease-out) var(--content-delay) both;
  }

  @keyframes detail-content-rise {
    from {
      transform: translateY(46vh);
    }
    to {
      transform: translateY(0);
    }
  }

  // Departure (reverse transition): the body slides RIGHT and off before the
  // rest of the transition. The composable measures the visible body and sets
  // --detail-content-exit-x before this animation starts, so the animation's
  // endpoint clears the viewport without hiding a long off-screen tail.
  .content.is-leaving {
    animation: detail-content-exit var(--article-bodyplate-exit-duration, 450ms)
      var(--snappy-ease-in) both;
  }

  @keyframes detail-content-exit {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(var(--detail-content-exit-x, 100vw));
    }
  }

  .case-study-page.is-leaving {
    overflow-x: clip;
  }

  @media (prefers-reduced-motion: reduce) {
    .content.is-arriving,
    .content.is-leaving,
    .case-study-page.is-hero-arriving,
    .case-study-page.is-hero-departing {
      animation: none;
    }
  }

  // Layered: the "fake paper top". The slab is pulled up over the photo's
  // lower region by --paper-step (negative margin; content's z-index 2 sits
  // above the hero's z-index 1, so it overlays the photo). For exactly that
  // same --paper-step height its ground paints cream only across the tab —
  // page edge to just past the article column's right edge — so the photo
  // shows beyond the tab; below the band the slab is full-width as usual.
  // Rise distance and tab height are the same value by construction: the
  // tab covers precisely the over-photo portion. Hard-stop gradients, not
  // clip-path: paint is shaped, content is not. Editorial precondition:
  // blocks that rise into the band must be default-width (no wide/full
  // alignments in the opening blocks).
  .content.has-paper-top {
    // The cream tab is the centered article column (matching the body's
    // content track and the title column), so over the photo it reads as a
    // bounded column with the photo showing on either side — not a hard
    // left-bleed. Below the band the slab is full-width as usual (and
    // cream-on-cream against the page, so the column "widens" invisibly).
    // Widened by space-5 each side so the body text keeps >=24px of cream
    // padding from the column edges over the photo.
    --paper-col: min(
      calc(100% - var(--space-6)),
      calc(var(--article-column) + 2 * var(--space-5))
    );
    --paper-col-left: calc((100% - var(--paper-col)) / 2);
    --paper-col-right: calc((100% + var(--paper-col)) / 2);
    margin-top: calc(-1 * var(--paper-step, 240px));
    background:
      linear-gradient(
          to right,
          transparent var(--paper-col-left),
          var(--color-surface-warmer) var(--paper-col-left),
          var(--color-surface-warmer) var(--paper-col-right),
          transparent var(--paper-col-right)
        )
        top left / 100% var(--paper-step, 240px) no-repeat,
      linear-gradient(var(--color-surface-warmer), var(--color-surface-warmer))
        left 0 top var(--paper-step, 240px) / 100%
        calc(100% - var(--paper-step, 240px)) no-repeat;
  }

  // Layered: the first body block sits right under the title column, so its
  // top margin is a tight gap (~space-5), not the article heading-major
  // spacing it would otherwise inherit when the first block is a heading.
  .content.has-paper-top > :deep(:first-child) {
    margin-top: 0;
  }

  // Layered phone override — must live AFTER the .content.has-paper-top
  // rules above to win the cascade at equal specificity. Phone drops the
  // desktop fake-paper overlap: the title is the only object over the photo,
  // and the article body starts below the full curve.
  @include breakpoint(phone) {
    .content.has-paper-top {
      margin-top: calc(clamp(4.5rem, 24vw, 6.25rem) + 25px);
      padding-top: 0;
      background: var(--color-surface-warmer);
    }
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

</style>

<style lang="scss">
  .is-halftone-performance-safe {
    .case-study-page .hero-plate:not(.is-baked-halftone) .hero-halftone-box,
    .case-study-page .hero-plate:not(.is-baked-halftone) .hero-halftone {
      filter: none !important;
    }

    .case-study-page .hero-plate:not(.is-baked-halftone) .hero-ink,
    .case-study-page .hero-plate:not(.is-baked-halftone) .hero-bleed,
    .case-study-page .hero-plate:not(.is-baked-halftone) .hero-k-layer,
    .case-study-page .hero-plate:not(.is-baked-halftone) .hero-gradient-tint {
      display: none !important;
    }

    .case-study-page .hero-plate:not(.is-baked-halftone) .hero-halftone-box .image {
      filter: saturate(1.04) contrast(1.04) !important;
    }
  }
</style>
