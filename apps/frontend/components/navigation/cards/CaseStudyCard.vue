<script setup lang="ts">
  import type { WordPressCaseStudy } from '~/types/wordpress';

  const props = withDefaults(
    defineProps<{
      caseStudy: WordPressCaseStudy;
      cardIndex?: number;
    }>(),
    {
      cardIndex: 0,
    },
  );

  // SPIKE: live duotone/halftone controls. State is provided by
  // HomeSelectedWorkSection (or other host) via provide(); when absent
  // (e.g. consumed elsewhere with no host), the card falls back to its own
  // baseline halftone-only treatment. Remove this block with the rest of
  // the case-hero spike scaffolding.
  type CaseStudyCardSpike = {
    resolveClasses: (index: number) => Record<string, boolean>;
    resolveStyle: (index: number) => Record<string, string>;
    resolveTonePair: (index: number) => string;
    resolveDuotoneMode: (index: number) => string;
    resolveTintOverlayEnabled: (index: number) => boolean;
    resolveTitleCream: (index: number) => boolean;
    resolveLayout: (index: number) => string;
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
  const isTitleCream = computed(
    () => spike?.resolveTitleCream(props.cardIndex) ?? false,
  );
  const layout = computed(
    () => spike?.resolveLayout(props.cardIndex) ?? 'floating',
  );
  const layoutClass = computed(() => `layout-${layout.value}`);

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
    :class="layoutClass"
    data-transition-source
  >
    <!-- SPIKE: image area is a wrapper so editorial-split can constrain it
         to the top portion of the card while other layouts let it fill. -->
    <div class="card-image-area">
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
      <!-- SPIKE: bleed-band layout — solid cream scrim fading from
           transparent at top to opaque at bottom, sits between image and
           text. Provides a known legibility ground at the card's bottom
           strip. -->
      <div v-if="layout === 'bleed-band'" class="card-scrim" aria-hidden="true" />
    </div>

    <NuxtLink v-slot="{ href }" :to="caseStudyUrl" custom>
      <a
        :href="href"
        class="link-box"
        :class="{ 'is-title-cream': isTitleCream }"
        :data-featured-slip-source="mediaTransitionKey"
        @focus="prefetchCaseStudyDetail"
        @pointerdown="prefetchCaseStudyDetail"
        @pointerenter="prefetchCaseStudyDetail"
        @click="navigateToCaseStudy"
      >
        <div class="label-stack">
          <h3 class="title" :data-featured-title-source="mediaTransitionKey">
            <span
              class="title-label"
              :class="{ 'is-transition-hidden': isTitleTransitioning }"
            >
              {{ caseStudy.title }}
            </span>
          </h3>

          <p v-if="caseStudy.excerpt" class="subheading">
            {{ caseStudy.excerpt }}
          </p>
        </div>
      </a>
    </NuxtLink>
  </article>
</template>

<style lang="scss" scoped>
  .case-study-card {
    width: 100%;
    position: relative;
    min-height: clamp(320px, 46vh, 560px);
    overflow: hidden;
    z-index: 1;
    padding: 0;
    display: flex;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    margin-bottom: 0;
    align-items: flex-end;
    background: var(--color-ink);
  }

  // SPIKE: image-area wrapper. For most layouts this fills the card; for
  // editorial-split it constrains the image to the top portion so a text
  // band can occupy the rest. Removed with the spike scaffolding.
  .card-image-area {
    position: absolute;
    inset: 0;
  }

  // Title sits directly on the halftoned image — no slip panel. The
  // data-featured-slip-source attribute on this element is kept so the
  // featured-media transition can read geometry; visually there's no panel.
  .link-box {
    position: absolute;
    bottom: var(--space-6);
    left: var(--space-6);
    z-index: 4;
    max-width: min(54rem, calc(100% - var(--space-7)));
    padding: var(--space-4) var(--space-5) var(--space-5);
    color: var(--color-ink);
    text-decoration: none;
    user-select: none;
    transition: opacity 160ms ease;
  }

  // SPIKE: layout B — specimen plate. Title + excerpt sit in a bordered card
  // with hard offset shadow, solid surface ground, anchored bottom-left.
  // Unconditional legibility (solid ground), keeps "floats over image" feel.
  // The plate is always cream-on-ink regardless of the cream-title toggle:
  // it provides its own neutral ground, so inversion isn't needed.
  .case-study-card.layout-specimen-plate .link-box {
    background: var(--color-surface);
    border: var(--border-window);
    box-shadow: var(--shadow-hard-low);
    max-width: min(22rem, calc(100% - var(--space-7) * 2));
    padding: var(--space-3) var(--space-4) var(--space-4);
  }

  .case-study-card.layout-specimen-plate .link-box.is-title-cream .title,
  .case-study-card.layout-specimen-plate .link-box.is-title-cream .subheading {
    color: var(--color-ink);
  }

  // SPIKE: layout C — editorial split. Card becomes two stacked bands:
  // image on top, text band below on solid surface. The image-area is
  // constrained to the top portion via a grid; the link-box sits in flow
  // in the second row. Always cream-on-ink — the band is its own neutral
  // ground, no inversion for dark images.
  .case-study-card.layout-editorial-split {
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    align-items: stretch;
  }

  .case-study-card.layout-editorial-split .card-image-area {
    position: relative;
    inset: auto;
    grid-row: 1;
    min-height: 0;
  }

  .case-study-card.layout-editorial-split .link-box {
    position: relative;
    grid-row: 2;
    bottom: auto;
    left: auto;
    width: 100%;
    max-width: none;
    background: var(--color-surface);
    border-top: var(--border-window);
    padding: var(--space-4) var(--space-5) var(--space-5);
    color: var(--color-ink);
  }

  .case-study-card.layout-editorial-split .link-box.is-title-cream .title,
  .case-study-card.layout-editorial-split .link-box.is-title-cream .subheading {
    color: var(--color-ink);
  }

  // SPIKE: layout D — ribbon. Title floats on the image like in 'floating',
  // excerpt drops to a slim solid bottom band. Title and excerpt share one
  // <a> for click-target sanity; the link-box has a partial scrim sized to
  // cover the excerpt row only, so the title sits over the bare halftone
  // and the excerpt sits over solid ground.
  .case-study-card.layout-ribbon .link-box {
    bottom: 0;
    left: 0;
    right: auto;
    width: 100%;
    max-width: none;
    padding: var(--space-3) var(--space-5) var(--space-4);
    background: linear-gradient(
      to bottom,
      transparent 0%,
      transparent 35%,
      var(--color-surface) 35%,
      var(--color-surface) 100%
    );
  }

  .case-study-card.layout-ribbon .link-box .title {
    color: var(--color-ink);
  }

  .case-study-card.layout-ribbon .link-box .subheading {
    color: var(--color-ink);
    margin-top: var(--space-2);
  }

  .case-study-card.layout-ribbon .link-box.is-title-cream {
    background: linear-gradient(
      to bottom,
      transparent 0%,
      transparent 35%,
      var(--color-ink) 35%,
      var(--color-ink) 100%
    );
  }

  // SPIKE: layout E — bleed band. A cream scrim fades from transparent at
  // the top to opaque at the bottom, providing a known ground for the
  // text under it. Title + excerpt sit in the standard floating position
  // but reliably on a known background.
  .card-scrim {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 55%;
    z-index: 2;
    pointer-events: none;
    background: linear-gradient(
      to top,
      var(--color-surface) 0%,
      var(--color-surface) 30%,
      rgba(247, 245, 239, 0) 100%
    );
  }

  .case-study-card.layout-bleed-band .link-box.is-title-cream ~ * {
    // Inverted scrim variant for cream-title — handled below via :has().
  }

  .case-study-card.layout-bleed-band:has(.link-box.is-title-cream) .card-scrim {
    background: linear-gradient(
      to top,
      var(--color-ink) 0%,
      var(--color-ink) 30%,
      rgba(12, 17, 43, 0) 100%
    );
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
    color: var(--color-ink);
    text-align: left;
    font-size: clamp(1.35rem, 2.5vw, 2.25rem);
    max-width: 38rem;
    padding: 0;
    z-index: 4;
    user-select: none;
    text-decoration: none;
    line-height: 1.05;
    text-wrap: balance;
  }

  // SPIKE: matches the slug page's `.header.is-title-cream` switch. Remove
  // with the rest of the case-hero spike scaffolding.
  .link-box.is-title-cream .title,
  .link-box.is-title-cream .subheading {
    color: var(--color-surface);
  }

  .title-label {
    padding: 0;
    font-family: var(--font-mono);
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .subheading {
    margin-top: var(--space-3);
    margin-left: 0;
    margin-right: 0;
    line-height: 1.4;
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

  // SPIKE: hover-reveals — on hover, drop the duotone filter and fade out
  // overlays so the underlying photo + halftone shows. Caveat: filter
  // transitions between url() SVG filters and CSS function filters
  // interpolate poorly in most browsers — likely snaps rather than cross-
  // fades; overlay opacity transitions DO cross-fade smoothly.
  .card-halftone-box.is-halftone-hover-reveals {
    transition: filter 300ms var(--motion-snappy);
  }

  .case-study-card:hover .card-halftone-box.is-halftone-hover-reveals {
    &.is-halftone-duotone-direct,
    &.is-halftone-duotone-crisp {
      filter: sepia(var(--halftone-sepia)) saturate(var(--halftone-saturation));
    }
  }

  .case-study-card:hover .card-bleed,
  .case-study-card:hover .card-gradient-tint {
    transition: opacity 300ms var(--motion-snappy);
  }

  .case-study-card:hover
    .card-halftone-box.is-halftone-hover-reveals
    ~ .card-gradient-tint,
  .case-study-card:hover
    .card-halftone-box.is-halftone-hover-reveals
    .card-bleed {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .card-halftone-box.is-halftone-hover-reveals,
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
      transform var(--motion-slow) var(--motion-snappy),
      filter var(--motion-slow) var(--motion-snappy);
  }

  @media (prefers-reduced-motion: reduce) {
    .title-label,
    .subheading span,
    .case-study-card :deep(.image) {
      transition: none;
    }
  }
</style>
