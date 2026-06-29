<script setup lang="ts">
  import type { WordPressCaseStudy } from '~/types/wordpress';
  import {
    hasCaseStudyHalftoneMedia,
    mediaSourceUrlForWidth,
  } from '~/utils/featured-media';
  import {
    caseStudyPhotoTreatmentClasses,
    caseStudyPhotoTreatmentConfig,
    caseStudyPhotoTreatmentStyle,
  } from '~/utils/case-study-photo-treatment';

  const props = withDefaults(
    defineProps<{
      previous: WordPressCaseStudy;
      next: WordPressCaseStudy;
      previousIndex?: number;
      nextIndex?: number;
    }>(),
    {
      previousIndex: 0,
      nextIndex: 1,
    },
  );

  const { navigateWithFeaturedMediaTransition } = useFeaturedMediaTransition();
  const transitionState = useFeaturedMediaTransitionState();

  function isTransitioning(caseStudy: WordPressCaseStudy): boolean {
    return (
      transitionState.value.active &&
      transitionState.value.key === mediaTransitionKey(caseStudy)
    );
  }

  function isCardExtraPreflighting(caseStudy: WordPressCaseStudy): boolean {
    return (
      transitionState.value.phase === 'preflight' &&
      transitionState.value.key === mediaTransitionKey(caseStudy)
    );
  }

  function shouldHideCardExtras(caseStudy: WordPressCaseStudy): boolean {
    return isTransitioning(caseStudy) || isCardExtraPreflighting(caseStudy);
  }

  function shouldExitCardExtras(caseStudy: WordPressCaseStudy): boolean {
    return (
      shouldHideCardExtras(caseStudy) &&
      transitionState.value.sourceRole === 'source'
    );
  }

  function caseStudyUrl(caseStudy: WordPressCaseStudy): string {
    return `/case-studies/${caseStudy.slug}`;
  }

  function mediaTransitionKey(caseStudy: WordPressCaseStudy): string {
    return `case-study-${caseStudy.slug}`.replace(/[^a-zA-Z0-9_-]/g, '-');
  }

  function photoTreatmentConfig(caseStudy: WordPressCaseStudy, index: number) {
    return caseStudyPhotoTreatmentConfig(caseStudy, index);
  }

  function photoTreatmentClasses(caseStudy: WordPressCaseStudy, index: number) {
    return caseStudyPhotoTreatmentClasses(photoTreatmentConfig(caseStudy, index));
  }

  function photoTreatmentStyle(caseStudy: WordPressCaseStudy, index: number) {
    return caseStudyPhotoTreatmentStyle(photoTreatmentConfig(caseStudy, index));
  }

  function photoTonePairClass(caseStudy: WordPressCaseStudy, index: number) {
    return `is-halftone-tone-${photoTreatmentConfig(caseStudy, index).tonePair}`;
  }

  function isBleedMode(caseStudy: WordPressCaseStudy, index: number) {
    return photoTreatmentConfig(caseStudy, index).duotoneMode === 'bleed';
  }

  function isTintOverlayEnabled(caseStudy: WordPressCaseStudy, index: number) {
    return photoTreatmentConfig(caseStudy, index).tintOverlayEnabled;
  }

  function hasBakedHalftone(caseStudy: WordPressCaseStudy) {
    return hasCaseStudyHalftoneMedia(caseStudy.featuredMedia);
  }

  function kLayerSourceUrl(caseStudy: WordPressCaseStudy) {
    return hasBakedHalftone(caseStudy)
      ? ''
      : mediaSourceUrlForWidth(caseStudy.featuredMedia, 1200);
  }
</script>

<template>
  <nav class="case-study-loop-nav" aria-label="Case study navigation">
    <NuxtLink v-slot="{ href }" :to="caseStudyUrl(previous)" custom>
      <a
        :href="href"
        class="link previous"
        @click="
          navigateWithFeaturedMediaTransition(
            $event,
            caseStudyUrl(previous),
            mediaTransitionKey(previous),
            previous.featuredMedia,
          )
        "
      >
        <div class="media-shell">
          <div
            class="media-treatment is-halftone-separate-k"
            :class="{
              ...photoTreatmentClasses(previous, props.previousIndex),
              'is-baked-halftone': hasBakedHalftone(previous),
            }"
            :style="photoTreatmentStyle(previous, props.previousIndex)"
          >
            <div class="media-halftone">
              <FeaturedMediaFrame
                class="media-frame"
                :media="previous.featuredMedia"
                label="Previous"
                :treatment="
                  hasBakedHalftone(previous) ? 'case-study-halftone' : 'default'
                "
                :transition-key="mediaTransitionKey(previous)"
                transition-role="source"
                transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                sizes="(max-width: 760px) 100vw, 50vw"
              />
              <div
                v-if="!hasBakedHalftone(previous)"
                class="media-ink"
                aria-hidden="true"
              />
              <div
                v-if="isBleedMode(previous, props.previousIndex)"
                class="media-bleed"
                aria-hidden="true"
              />
            </div>
            <div
              v-if="kLayerSourceUrl(previous)"
              class="media-k-layer"
              aria-hidden="true"
            >
              <img
                class="media-k-image"
                :src="kLayerSourceUrl(previous)"
                alt=""
                loading="lazy"
              />
            </div>
          </div>
          <div
            v-if="
              isTintOverlayEnabled(previous, props.previousIndex) &&
              previous.featuredMedia?.sourceUrl
            "
            class="media-gradient-tint"
            :class="photoTonePairClass(previous, props.previousIndex)"
            :style="photoTreatmentStyle(previous, props.previousIndex)"
            aria-hidden="true"
          />
        </div>

        <div
          class="label-slip"
          :data-featured-slip-source="mediaTransitionKey(previous)"
        >
          <span
            class="direction card-slip is-card-extra-direction"
            :data-featured-card-extra-source="mediaTransitionKey(previous)"
            :class="{
              'is-card-extra-transition-exiting':
                shouldExitCardExtras(previous),
              'is-card-extra-transition-hidden':
                shouldHideCardExtras(previous),
            }"
          >
            <span class="card-slip-inner">Previous</span>
          </span>
          <span
            class="title"
            :class="{ 'is-transition-hidden': isTransitioning(previous) }"
            :data-featured-title-source="mediaTransitionKey(previous)"
          >
            {{ previous.title }}
          </span>
          <p
            v-if="previous.excerpt"
            class="subheading card-slip is-card-extra-excerpt"
            :data-featured-card-extra-source="mediaTransitionKey(previous)"
            :class="{
              'is-card-extra-transition-exiting':
                shouldExitCardExtras(previous),
              'is-card-extra-transition-hidden':
                shouldHideCardExtras(previous),
            }"
          >
            <span class="card-slip-inner">{{ previous.excerpt }}</span>
          </p>
        </div>
      </a>
    </NuxtLink>

    <NuxtLink v-slot="{ href }" :to="caseStudyUrl(next)" custom>
      <a
        :href="href"
        class="link next"
        @click="
          navigateWithFeaturedMediaTransition(
            $event,
            caseStudyUrl(next),
            mediaTransitionKey(next),
            next.featuredMedia,
          )
        "
      >
        <div class="media-shell">
          <div
            class="media-treatment is-halftone-separate-k"
            :class="{
              ...photoTreatmentClasses(next, props.nextIndex),
              'is-baked-halftone': hasBakedHalftone(next),
            }"
            :style="photoTreatmentStyle(next, props.nextIndex)"
          >
            <div class="media-halftone">
              <FeaturedMediaFrame
                class="media-frame"
                :media="next.featuredMedia"
                label="Next"
                :treatment="
                  hasBakedHalftone(next) ? 'case-study-halftone' : 'default'
                "
                :transition-key="mediaTransitionKey(next)"
                transition-role="source"
                transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                sizes="(max-width: 760px) 100vw, 50vw"
              />
              <div
                v-if="!hasBakedHalftone(next)"
                class="media-ink"
                aria-hidden="true"
              />
              <div
                v-if="isBleedMode(next, props.nextIndex)"
                class="media-bleed"
                aria-hidden="true"
              />
            </div>
            <div
              v-if="kLayerSourceUrl(next)"
              class="media-k-layer"
              aria-hidden="true"
            >
              <img
                class="media-k-image"
                :src="kLayerSourceUrl(next)"
                alt=""
                loading="lazy"
              />
            </div>
          </div>
          <div
            v-if="
              isTintOverlayEnabled(next, props.nextIndex) &&
              next.featuredMedia?.sourceUrl
            "
            class="media-gradient-tint"
            :class="photoTonePairClass(next, props.nextIndex)"
            :style="photoTreatmentStyle(next, props.nextIndex)"
            aria-hidden="true"
          />
        </div>

        <div
          class="label-slip"
          :data-featured-slip-source="mediaTransitionKey(next)"
        >
          <span
            class="direction card-slip is-card-extra-direction"
            :data-featured-card-extra-source="mediaTransitionKey(next)"
            :class="{
              'is-card-extra-transition-exiting': shouldExitCardExtras(next),
              'is-card-extra-transition-hidden': shouldHideCardExtras(next),
            }"
          >
            <span class="card-slip-inner">Next</span>
          </span>
          <span
            class="title"
            :class="{ 'is-transition-hidden': isTransitioning(next) }"
            :data-featured-title-source="mediaTransitionKey(next)"
          >
            {{ next.title }}
          </span>
          <p
            v-if="next.excerpt"
            class="subheading card-slip is-card-extra-excerpt"
            :data-featured-card-extra-source="mediaTransitionKey(next)"
            :class="{
              'is-card-extra-transition-exiting': shouldExitCardExtras(next),
              'is-card-extra-transition-hidden': shouldHideCardExtras(next),
            }"
          >
            <span class="card-slip-inner">{{ next.excerpt }}</span>
          </p>
        </div>
      </a>
    </NuxtLink>
  </nav>
</template>

<style lang="scss" scoped>
  .case-study-loop-nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-4);
    margin-top: var(--space-8);
    padding-inline: var(--space-5);
  }

  .link {
    position: relative;
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    min-height: clamp(18rem, 30vw, 25rem);
    overflow: hidden;
    color: var(--color-ink);
    text-decoration: none;
    background: var(--color-surface);
    border: var(--border-window);
    box-shadow: var(--shadow-hard-low);
  }

  .media-shell {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: clamp(10rem, 18vw, 15rem);
    overflow: hidden;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    background: var(--color-ink);
  }

  .media-treatment,
  .media-gradient-tint {
    position: absolute;
    inset: 0;
  }

  .media-treatment {
    @include halftone-image-box;

    --halftone-tone-1: var(--color-ink);
    --halftone-tone-2: var(--color-surface);
    --halftone-size: var(--halftone-size-rest, 11px);
    transition: filter 300ms var(--snappy-ease-out);

    &.is-halftone-tone-blue-cream {
      --halftone-tone-1: var(--color-primary);
      --halftone-tone-2: var(--color-surface);
    }

    &.is-halftone-tone-ink-blue {
      --halftone-tone-1: var(--color-ink);
      --halftone-tone-2: var(--color-primary);
    }
  }

  .media-treatment.is-halftone-duotone-direct {
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

  .media-treatment.is-halftone-duotone-crisp {
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

  .media-treatment.is-baked-halftone:not(
      .is-halftone-duotone-direct
    ):not(.is-halftone-duotone-crisp),
  .media-treatment.is-baked-halftone .media-halftone {
    filter: none;
  }

  .media-treatment.is-baked-halftone .media-frame :deep(.image) {
    filter: none;
  }

  .media-halftone {
    width: 100%;
    height: 100%;
    @include halftone-image-pane;
  }

  .media-ink {
    @include halftone-image-ink;
  }

  .media-treatment.is-halftone-separate-k {
    .media-frame :deep(.image) {
      @include halftone-image-media-hues;
    }

    .media-ink {
      @include halftone-image-ink-separate-k-override;
    }
  }

  .media-treatment.is-baked-halftone {
    .media-frame :deep(.image) {
      filter: none;
    }
  }

  .media-bleed {
    @include halftone-image-bleed;

    transition: opacity 300ms var(--snappy-ease-out);
  }

  .media-k-layer {
    @include halftone-image-k-pane;
  }

  .media-k-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    @include halftone-image-k-media;
  }

  .media-k-layer::after {
    @include halftone-image-k-ink;
  }

  .media-gradient-tint {
    --halftone-tone-1: var(--color-ink);
    --halftone-tone-2: var(--color-surface);

    z-index: 1;
    pointer-events: none;
    background: linear-gradient(
      var(--halftone-tint-angle, 135deg),
      var(--halftone-tone-1),
      var(--halftone-tone-2)
    );
    opacity: var(--halftone-tint-opacity, 0.4);
    transition: opacity 300ms var(--snappy-ease-out);

    &.is-halftone-tone-blue-cream {
      --halftone-tone-1: var(--color-primary);
      --halftone-tone-2: var(--color-surface);
    }

    &.is-halftone-tone-ink-blue {
      --halftone-tone-1: var(--color-ink);
      --halftone-tone-2: var(--color-primary);
    }
  }

  .link:hover .media-treatment,
  .link:focus-visible .media-treatment {
    --halftone-size: 8px;

    &.is-baked-halftone {
      filter: none;
    }

    &.is-halftone-duotone-direct:not(.is-baked-halftone),
    &.is-halftone-duotone-crisp:not(.is-baked-halftone) {
      filter: sepia(var(--halftone-sepia)) saturate(var(--halftone-saturation));
    }
  }

  .link:hover .media-bleed,
  .link:hover .media-gradient-tint,
  .link:focus-visible .media-bleed,
  .link:focus-visible .media-gradient-tint {
    opacity: 0;
  }

  .media-frame {
    width: 100%;
    height: 100%;
    overflow: hidden;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }

  .media-frame :deep(.image),
  .media-frame :deep(.placeholder) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: translate(0, 0);
  }

  .label-slip {
    position: relative;
    z-index: 3;
    box-sizing: border-box;
    display: inline-flex;
    flex-direction: column;
    gap: var(--space-2);
    width: 100%;
    max-width: none;
    padding: var(--space-3) var(--space-5) var(--space-4);
    border-top: var(--border-window);
    // Transition state (1) — source/resting slip panel (loop nav variant).
    // See shared-components/_featured-media-overlay.scss for the three-state system.
    @include slip-surface;
  }

  .is-transition-hidden {
    opacity: 0;
    transition: none;
  }

  .card-slip {
    overflow: hidden;
  }

  .card-slip-inner {
    display: block;
    transform: translateY(0);
    transition: transform var(--card-extra-slip-duration, 220ms)
      var(--snappy-ease-out)
      var(--card-extra-slip-delay, var(--content-delay));
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

  .direction {
    display: block;
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .title {
    display: block;
    width: 100%;
    max-width: 100%;
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-style: normal;
    font-size: clamp(1.35rem, 2vw, 2.15rem);
    line-height: 1.06;
    overflow-wrap: anywhere;
    @include slip-title;
  }

  .title span {
    display: inline;
  }

  .subheading {
    width: 100%;
    max-width: 72ch;
    margin: 0;
    color: var(--color-ink-80);
    line-height: 1.32;
    overflow-wrap: anywhere;
  }

  .subheading .card-slip-inner {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .next {
    text-align: right;
  }

  .next .label-slip {
    align-items: flex-end;
    margin-left: auto;
  }

  .next .subheading {
    width: min(100%, 72ch);
    margin-left: auto;
  }

  @include breakpoint(phone) {
    .case-study-loop-nav {
      box-sizing: border-box;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-2);
      padding-inline: var(--space-4);
    }

    .link {
      min-height: 0;
      background: var(--color-surface);
    }

    .media-shell {
      height: clamp(8rem, 35vw, 11rem);
    }

    .label-slip {
      padding: var(--space-3);
      background: var(--color-surface);
      border-top: var(--border-window);
    }

    .title {
      font-size: 1rem;
      line-height: 1.1;
      overflow-wrap: anywhere;
      word-break: break-word;
      text-wrap: wrap;
    }

    .subheading {
      font-size: var(--type-small);
      -webkit-line-clamp: 2;
    }

    // In 2-column layout, .next stays right-aligned per the base styles.
  }

  @media (prefers-reduced-motion: reduce) {
    .media-treatment,
    .media-bleed,
    .media-gradient-tint,
    .card-slip-inner {
      transition: none;
    }
  }
</style>
