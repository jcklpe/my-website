<script setup lang="ts">
  import type { WordPressCaseStudy } from '~/types/wordpress';

  const props = withDefaults(
    defineProps<{
      caseStudy: WordPressCaseStudy;
      index?: number;
    }>(),
    {
      index: 0,
    },
  );

  // Transition system coupling: this card participates in the featured-media
  // card-to-detail transition. useFeaturedMediaTransition reads geometry from
  // this card's FeaturedMediaFrame, data-featured-title-source, and
  // data-featured-slip-source attributes. The detail target is
  // case-studies/[slug].vue. See also:
  // composables/useFeaturedMediaTransition.ts
  // components/transitions/FeaturedMediaTransitionLayer.vue
  const { navigateWithFeaturedMediaTransition } = useFeaturedMediaTransition();
  const { prefetchCaseStudy, prefetchCaseStudyFromViewport } =
    useContentDetailPrefetch();
  const transitionState = useFeaturedMediaTransitionState();
  const cardElement = ref<HTMLElement | null>(null);
  const caseStudySlug = computed(() => props.caseStudy.slug);
  const caseStudyUrl = computed(() => `/case-studies/${caseStudySlug.value}`);
  // Desert Jackalope zigzag: odd cards sit left, even cards sit right.
  const sideClass = computed(() =>
    props.index % 2 === 0 ? 'is-left' : 'is-right',
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
  <article ref="cardElement" class="case-study-card" :class="sideClass" data-transition-source>
    <NuxtLink v-slot="{ href }" :to="caseStudyUrl" custom>
      <a
        :href="href"
        class="link-box"
        @focus="prefetchCaseStudyDetail"
        @pointerdown="prefetchCaseStudyDetail"
        @pointerenter="prefetchCaseStudyDetail"
        @click="navigateToCaseStudy"
      >
        <div class="title-slip" :data-featured-slip-source="mediaTransitionKey">
          <h3 class="title" :data-featured-title-source="mediaTransitionKey">
            <span
              class="title-label"
              :class="{ 'is-transition-hidden': isTitleTransitioning }"
            >
              {{ caseStudy.title }}
            </span>
          </h3>
        </div>

        <FeaturedMediaFrame
          class="media-frame"
          :media="caseStudy.featuredMedia"
          label="Case Study"
          :transition-key="mediaTransitionKey"
          transition-role="source"
          transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
          sizes="(max-width: 900px) 100vw, 70vw"
        />

        <p v-if="caseStudy.excerpt" class="subheading">
          {{ caseStudy.excerpt }}
        </p>
      </a>
    </NuxtLink>
  </article>
</template>

<style lang="scss" scoped>
  // Desert Jackalope zigzag: alternating left/right case studies with a big black
  // title above the image. On hover the image shears toward the outer page edge
  // and the title shears toward center, settling back slowly.
  .case-study-card {
    position: relative;
    width: min(72%, 60rem);
    padding: var(--space-7) 0;
    // Allow the image to slide past the card edge.
    overflow: clip;
    overflow-clip-margin: 12vw;
  }

  .case-study-card.is-left {
    margin-right: auto;
  }

  .case-study-card.is-right {
    margin-left: auto;
  }

  .link-box {
    display: flex;
    flex-direction: column;
    color: var(--color-ink);
    text-decoration: none;
  }

  .title-slip {
    position: relative;
    z-index: 3;
  }

  .title {
    margin: 0 0 var(--space-4);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: clamp(2rem, 5vw, 4rem);
    line-height: 1.02;
    letter-spacing: -0.03em;
    transition: transform var(--motion-drift) var(--motion-snappy);
  }

  .is-right .title {
    text-align: right;
  }

  .title-label {
    font-family: var(--font-mono);
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .subheading {
    max-width: 44ch;
    margin-top: var(--space-4);
    color: var(--color-ink-80);
    line-height: 1.5;
  }

  .is-right .subheading {
    margin-left: auto;
    text-align: right;
  }

  .media-frame {
    position: relative;
    z-index: 1;
    width: 100%;
    overflow: hidden;
    transition: transform var(--motion-drift) var(--motion-snappy);
  }

  // Resting drift back is slow; hover shear is quick (fast-out / slow-back).
  .is-left .link-box:hover .media-frame,
  .is-left .link-box:focus-visible .media-frame {
    transform: translateX(-6%);
    transition: transform var(--motion-slow) var(--motion-snappy);
  }

  .is-left .link-box:hover .title,
  .is-left .link-box:focus-visible .title {
    transform: translateX(2.5rem);
    transition: transform var(--motion-slow) var(--motion-snappy);
  }

  .is-right .link-box:hover .media-frame,
  .is-right .link-box:focus-visible .media-frame {
    transform: translateX(6%);
    transition: transform var(--motion-slow) var(--motion-snappy);
  }

  .is-right .link-box:hover .title,
  .is-right .link-box:focus-visible .title {
    transform: translateX(-2.5rem);
    transition: transform var(--motion-slow) var(--motion-snappy);
  }

  .case-study-card :deep(.image),
  .case-study-card :deep(.placeholder) {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    object-fit: cover;
  }

  @include breakpoint(tablet-down) {
    .case-study-card,
    .case-study-card.is-left,
    .case-study-card.is-right {
      width: 100%;
      margin-inline: 0;
      padding: var(--space-6) 0;
    }

    .is-right .title,
    .is-right .subheading {
      text-align: left;
      margin-left: 0;
    }

    // No horizontal shear on small screens.
    .is-left .link-box:hover .media-frame,
    .is-left .link-box:focus-visible .media-frame,
    .is-right .link-box:hover .media-frame,
    .is-right .link-box:focus-visible .media-frame,
    .is-left .link-box:hover .title,
    .is-left .link-box:focus-visible .title,
    .is-right .link-box:hover .title,
    .is-right .link-box:focus-visible .title {
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .title,
    .media-frame {
      transition: none;
    }

    .is-left .link-box:hover .media-frame,
    .is-left .link-box:focus-visible .media-frame,
    .is-right .link-box:hover .media-frame,
    .is-right .link-box:focus-visible .media-frame,
    .is-left .link-box:hover .title,
    .is-left .link-box:focus-visible .title,
    .is-right .link-box:hover .title,
    .is-right .link-box:focus-visible .title {
      transform: none;
    }
  }
</style>
