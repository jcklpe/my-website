<script setup lang="ts">
  import type { WordPressCaseStudy } from '~/types/wordpress';

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
      layout?: 'banner' | 'photo-left' | 'photo-right';
      plateAlign?: 'left' | 'right';
    }>(),
    {
      cardIndex: 0,
      layout: 'banner',
      plateAlign: 'left',
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
  const caseStudySlug = computed(() => props.caseStudy.slug);
  const caseStudyUrl = computed(() => `/case-studies/${caseStudySlug.value}`);
  // Ordinal label shown in the text plate's number badge. Zero-padded to
  // two digits so single-digit positions read as catalog entries.
  const ordinalLabel = computed(
    () => (props.cardIndex + 1).toString().padStart(2, '0'),
  );
  const mediaTransitionKey = computed(() =>
    `case-study-${caseStudySlug.value}`.replace(/[^a-zA-Z0-9_-]/g, '-'),
  );
  const isTitleTransitioning = computed(
    () =>
      transitionState.value.active &&
      transitionState.value.key === mediaTransitionKey.value,
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
  });

  onBeforeUnmount(() => {
    viewportPrefetchObserver?.disconnect();
    viewportPrefetchObserver = null;
  });

  function prefetchCaseStudyDetail() {
    prefetchCaseStudy(caseStudySlug.value, props.caseStudy.featuredMedia);
  }

  async function navigateToCaseStudy(event: MouseEvent) {
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
    :class="[`is-layout-${layout}`, { 'is-plate-right': plateAlign === 'right' }]"
    data-transition-source
  >
    <!-- Image area takes the top of the card; the text plate sits below it
         via the editorial-split grid. -->
    <div
      class="card-image-area"
      :class="{ 'is-media-transition-hidden': isTitleTransitioning }"
    >
      <div
        class="card-halftone-box is-halftone-separate-k"
        :class="spikeClasses"
        :style="spikeStyle"
      >
        <div class="card-halftone">
          <FeaturedMediaFrame
            class="media-frame"
            :media="caseStudy.featuredMedia"
            label="Case Study"
            :transition-key="mediaTransitionKey"
            transition-role="source"
            transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
            sizes="(max-width: 900px) 100vw, 50vw"
          />
          <div class="card-ink" aria-hidden="true" />
          <div v-if="isBleedMode" class="card-bleed" aria-hidden="true" />
        </div>
        <div
          v-if="caseStudy.featuredMedia?.sourceUrl"
          class="card-k-layer"
          aria-hidden="true"
        >
          <img
            class="card-k-image"
            :src="caseStudy.featuredMedia.sourceUrl"
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
    </div>

    <NuxtLink v-slot="{ href }" :to="caseStudyUrl" custom>
      <a
        :href="href"
        class="link-box"
        :class="{ 'is-transition-hidden': isTitleTransitioning }"
        :data-featured-slip-source="mediaTransitionKey"
        @focus="prefetchCaseStudyDetail"
        @pointerdown="prefetchCaseStudyDetail"
        @pointerenter="prefetchCaseStudyDetail"
        @click="navigateToCaseStudy"
      >
        <div
          class="plate-content"
          :class="{ 'is-transition-hidden': isTitleTransitioning }"
        >
          <span class="card-number-badge" aria-hidden="true">
            {{ ordinalLabel }}
          </span>
          <div class="label-stack">
            <h3 class="title" :data-featured-title-source="mediaTransitionKey">
              <span class="title-label">
                {{ caseStudy.title }}
              </span>
            </h3>

            <p v-if="caseStudy.excerpt" class="subheading">
              {{ caseStudy.excerpt }}
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
    width: 100%;
    position: relative;
    z-index: 1;
    padding: 0;
    display: grid;
    align-items: stretch;
    margin-bottom: 0;
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
    border-top: var(--border-window);
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
    // Hand-off final step (see .is-media-transition-hidden): once the flying
    // clone has fully seated on the card, the real duotone plate fades IN over
    // this window while the clone fades OUT — a clean cross-fade between two
    // co-located plates, rather than the duotone popping in. Length is the
    // --duotone-fade-duration token (matches the clone's media-handoff
    // leave) so it stays controllable independent of the flight duration.
    transition: opacity var(--duotone-fade-duration, 350ms)
      var(--snappy-ease-out);
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

  // Text plate. The row's steady voice: cream ground, ink text, tight
  // vertical padding.
  .link-box {
    position: relative;
    z-index: 4;
    display: block;
    // No width: 100% — the project has no global border-box reset, so
    // width: 100% PLUS the inline padding overflowed the card by 48px and
    // gave the page a horizontal scrollbar. A block-level grid/flex child
    // stretches to its track on its own, with padding contained.
    padding: var(--space-2) var(--space-5) var(--space-3);
    background: var(--color-surface);
    color: var(--color-ink);
    text-decoration: none;
    user-select: none;
    transition: opacity 160ms ease;
  }

  .is-layout-banner .link-box {
    grid-row: 2;
    border-top: var(--border-window);
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

  // The excerpt must not drive the text cell's intrinsic width — a long
  // unwrapped excerpt would defeat the title-driven min-width:
  // fit-content. With inline-size containment it wraps inside whatever
  // width the title establishes.
  .is-layout-photo-left .subheading,
  .is-layout-photo-right .subheading {
    contain: inline-size;
  }

  @include breakpoint(phone) {
    .title {
      white-space: normal;
    }

    // Inline layouts stack on phones: photo as a short band above the text
    // plate (a mini-banner). A side-docked photo has no room in a single
    // narrow column.
    .case-study-card.is-layout-photo-left,
    .case-study-card.is-layout-photo-right {
      min-height: var(--card-min-height, clamp(240px, 30vh, 360px));
      flex-direction: column;
    }

    .is-layout-photo-left .card-image-area,
    .is-layout-photo-right .card-image-area {
      flex: 1 1 auto;
      min-height: 0;
      border-inline: 0;
    }

    .is-layout-photo-left .link-box,
    .is-layout-photo-right .link-box {
      flex: 0 0 auto;
      min-width: 0;
      display: block;
      border-top: var(--border-window);
    }
  }

  .title-label {
    padding: 0;
    font-family: var(--font-mono);
  }

  // The card's number + title + excerpt fade out together when the
  // card-to-detail transition lifts off (the flying clone takes over the
  // title), rather than popping out on click.
  .is-transition-hidden {
    opacity: 0;
    transition: opacity 200ms ease;
  }

  @media (prefers-reduced-motion: reduce) {
    .is-transition-hidden {
      transition: none;
    }
  }

  // Hand-off step 1: hide the ENTIRE photoplate (halftone box, ink, K-layer,
  // gradient tint) while the clone flies/morphs into the card geometry — not
  // just the FeaturedMediaFrame's <img>. On the reverse the destination card
  // mounts during the flight; with only the image hidden, its duotone
  // treatment rendered as an empty blue plate the flying photo slid under.
  // Removing the class at hand-off triggers the cross-fade in (.card-image-area
  // transition above). It mounts hidden, so no fade plays on the way in — only
  // on the way out, once the clone is seated.
  .is-media-transition-hidden {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .card-image-area {
      transition: none;
    }
  }

  .subheading {
    margin: var(--space-1) 0 0;
    max-width: 90ch;
    line-height: 1.35;
    // Excerpts can carry long URLs — unbreakable strings must wrap rather
    // than widen the page.
    overflow-wrap: anywhere;
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

  // Color-on-hover: the text plate (link-box) is the hover trigger so the
  // styling reveal aligns with the click target — hovering the image alone
  // doesn't change anything. Drops the duotone filter, fades out the
  // bleed + gradient-tint overlays, and finer-grains the halftone to 8px.
  .card-halftone-box {
    --halftone-size: var(--halftone-size-rest, 11px);
    transition: filter 300ms var(--snappy-ease-out);
  }

  .case-study-card:has(.link-box:hover) .card-halftone-box {
    --halftone-size: 8px;
  }

  .card-bleed,
  .card-gradient-tint {
    transition: opacity 300ms var(--snappy-ease-out);
  }

  .case-study-card:has(.link-box:hover) .card-halftone-box {
    &.is-halftone-duotone-direct,
    &.is-halftone-duotone-crisp {
      filter: sepia(var(--halftone-sepia)) saturate(var(--halftone-saturation));
    }
  }

  .case-study-card:has(.link-box:hover) .card-bleed,
  .case-study-card:has(.link-box:hover) .card-gradient-tint {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .card-halftone-box,
    .card-bleed,
    .card-gradient-tint {
      transition: none;
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
