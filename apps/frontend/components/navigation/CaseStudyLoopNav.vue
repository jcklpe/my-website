<script setup lang="ts">
  import type { WordPressCaseStudy } from '~/types/wordpress';
  withDefaults(
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
</script>

<template>
  <nav class="case-study-loop-nav" aria-label="Case study navigation">
    <NuxtLink v-slot="{ href }" :to="caseStudyUrl(previous)" custom>
      <a
        :href="href"
        class="link previous"
        :class="{ 'is-transition-source': isTransitioning(previous) }"
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
          <div class="media-treatment">
            <div class="media-halftone">
              <FeaturedMediaFrame
                class="media-frame"
                :media="previous.featuredMedia"
                label="Previous"
                treatment="case-study-halftone"
                :transition-key="mediaTransitionKey(previous)"
                transition-role="source"
                transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                sizes="(max-width: 760px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>

        <div
          class="label-slip"
          :data-featured-slip-source="mediaTransitionKey(previous)"
        >
          <span
            class="direction card-slip is-card-extra-direction is-previous-card"
            :data-featured-card-extra-source="mediaTransitionKey(previous)"
            :class="{
              'is-card-extra-transition-exiting':
                shouldExitCardExtras(previous),
              'is-card-extra-transition-hidden': shouldHideCardExtras(previous),
            }"
          >
            <span class="card-slip-inner">Previous</span>
          </span>
          <span
            class="title"
            :class="{ 'is-transition-hidden': isTransitioning(previous) }"
            :data-featured-title-source="mediaTransitionKey(previous)"
            data-ground-color="var(--color-surface)"
          >
            {{ previous.title }}
          </span>
          <p
            v-if="previous.excerpt"
            class="subheading card-slip is-card-extra-excerpt is-previous-card"
            :data-featured-card-extra-source="mediaTransitionKey(previous)"
            :class="{
              'is-card-extra-transition-exiting':
                shouldExitCardExtras(previous),
              'is-card-extra-transition-hidden': shouldHideCardExtras(previous),
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
        :class="{ 'is-transition-source': isTransitioning(next) }"
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
          <div class="media-treatment">
            <div class="media-halftone">
              <FeaturedMediaFrame
                class="media-frame"
                :media="next.featuredMedia"
                label="Next"
                treatment="case-study-halftone"
                :transition-key="mediaTransitionKey(next)"
                transition-role="source"
                transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                sizes="(max-width: 760px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>

        <div
          class="label-slip"
          :data-featured-slip-source="mediaTransitionKey(next)"
        >
          <span
            class="direction card-slip is-card-extra-direction is-next-card"
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
            data-ground-color="var(--color-surface)"
          >
            {{ next.title }}
          </span>
          <p
            v-if="next.excerpt"
            class="subheading card-slip is-card-extra-excerpt is-next-card"
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

  .media-treatment {
    position: absolute;
    inset: 0;
  }

  .media-halftone {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
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
    background: var(--color-surface);
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
    transform: translateX(0);
    transition: transform var(--card-extra-slip-duration, 220ms)
      var(--snappy-ease-out) var(--card-extra-slip-delay, var(--content-delay));
  }

  .is-card-extra-excerpt {
    --card-extra-slip-delay: calc(
      var(--content-delay) + var(--card-extra-stagger, 80ms)
    );
  }

  .is-card-extra-transition-hidden .card-slip-inner {
    transition-delay: 0ms;
  }

  .is-card-extra-transition-exiting .card-slip-inner {
    transition-delay: 0ms;
  }

  .is-previous-card.is-card-extra-transition-hidden .card-slip-inner {
    transform: translateX(-115%);
  }

  .is-previous-card.is-card-extra-transition-exiting .card-slip-inner {
    transform: translateX(-145%);
  }

  .is-next-card.is-card-extra-transition-hidden .card-slip-inner {
    transform: translateX(115%);
  }

  .is-next-card.is-card-extra-transition-exiting .card-slip-inner {
    transform: translateX(145%);
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
    font-weight: 500;
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

  .next .title {
    width: fit-content;
    text-align: left;
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
      // Right card's box-shadow (0.35rem right offset) needs room; left card
      // sits flush to the viewport edge with no left shadow so padding-left:0.
      padding-inline: 0 var(--space-2);
    }

    .link {
      min-height: 0;
      background: var(--color-surface);
    }

    .media-shell {
      min-height: clamp(8rem, 35vw, 11rem);
    }

    .label-slip {
      padding: var(--space-3);
      background: var(--color-surface);
      border-top: var(--border-window);
    }

    .title {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
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

    // The next title remains a left-aligned unit placed at the right edge.
  }

  @media (prefers-reduced-motion: reduce) {
    .card-slip-inner {
      transition: none;
    }
  }
</style>
