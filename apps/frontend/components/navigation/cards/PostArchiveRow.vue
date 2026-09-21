<script setup lang="ts">
  import type { WordPressPost } from '~/types/wordpress';
  import {
    prepareWritingFlightMedia,
    warmWritingFlightFromViewport,
  } from '~/utils/writing-flight-media';

  const props = defineProps<{
    post: WordPressPost;
    concealed?: boolean;
    sharedArrival?: boolean;
  }>();

  const emit = defineEmits<{ mediaReady: [] }>();
  const rowElement = ref<HTMLElement | null>(null);
  let isMounted = false;
  let viewportObserver: IntersectionObserver | null = null;
  onMounted(async () => {
    isMounted = true;
    viewportObserver = new IntersectionObserver((entries) => {
      if (
        !entries.some((entry) => entry.isIntersecting) ||
        !props.post.featuredMedia
      )
        return;
      viewportObserver?.disconnect();
      warmWritingFlightFromViewport(
        props.post.featuredMedia,
        () =>
          !transitionState.value.active &&
          transitionState.value.phase !== 'preflight',
      );
    });
    if (rowElement.value) viewportObserver.observe(rowElement.value);
    const image = rowElement.value?.querySelector('img');
    try {
      await image?.decode();
    } catch {
      // A failed image must not keep the post's text and link hidden.
    }
    if (isMounted) emit('mediaReady');
  });
  onBeforeUnmount(() => {
    isMounted = false;
    viewportObserver?.disconnect();
  });

  const { navigateWithFeaturedMediaTransition } = useFeaturedMediaTransition();
  const { prefetchPost } = useContentDetailPrefetch();
  const transitionState = useFeaturedMediaTransitionState();

  const postSlug = computed(() => props.post.slug);
  const postUrl = computed(() => `/writing/${postSlug.value}`);
  const mediaTransitionKey = computed(() =>
    `post-${postSlug.value}`.replace(/[^a-zA-Z0-9_-]/g, '-'),
  );
  const isTitleTransitioning = computed(
    () =>
      transitionState.value.active &&
      transitionState.value.key === mediaTransitionKey.value,
  );
  const isTransitionDestination = computed(
    () =>
      isTitleTransitioning.value &&
      transitionState.value.sourceRole === 'target',
  );
  const isDestinationCoveredByClone = computed(
    () =>
      isTransitionDestination.value &&
      transitionState.value.handoffPhase === 'clone-owned',
  );
  const isDestinationEntering = computed(
    () =>
      isTransitionDestination.value &&
      transitionState.value.handoffPhase === 'revealing-destination',
  );
  const shouldHideSharedVisual = computed(
    () =>
      isTitleTransitioning.value &&
      (!isTransitionDestination.value || isDestinationCoveredByClone.value),
  );
  const isExtraPreflighting = computed(
    () =>
      transitionState.value.phase === 'preflight' &&
      transitionState.value.key === mediaTransitionKey.value,
  );
  // Hides excerpt + date in their slip-ready position.
  const shouldSlipExtra = computed(
    () =>
      props.concealed ||
      (isTitleTransitioning.value &&
        !(
          isTransitionDestination.value &&
          transitionState.value.handoffPhase === 'releasing-clone'
        )) ||
      isExtraPreflighting.value,
  );
  // Determines direction: exit = slip up and out, enter = slip in from below
  const shouldExitExtra = computed(
    () =>
      shouldSlipExtra.value && transitionState.value.sourceRole === 'source',
  );

  // "January 5, 2026" → "Jan 5"
  const displayDate = computed(() => {
    const d = new Date(props.post.date);
    if (isNaN(d.getTime())) return props.post.date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  function prefetchPostDetail() {
    void preloadRouteComponents(postUrl.value);
    prefetchPost(postSlug.value, props.post.featuredMedia);
    void prepareWritingFlightMedia(props.post.featuredMedia);
  }

  async function navigateToPost(event: MouseEvent) {
    prefetchPostDetail();
    await navigateWithFeaturedMediaTransition(
      event,
      postUrl.value,
      mediaTransitionKey.value,
      props.post.featuredMedia,
    );
  }
</script>

<template>
  <article
    ref="rowElement"
    class="post-archive-row"
    :class="{ 'is-shared-arrival': sharedArrival }"
    data-transition-source
  >
    <NuxtLink v-slot="{ href }" :to="postUrl" custom>
      <a
        :href="href"
        class="row-link"
        :aria-busy="isExtraPreflighting || undefined"
        @focus="prefetchPostDetail"
        @pointerdown="prefetchPostDetail"
        @pointerenter="prefetchPostDetail"
        @click="navigateToPost"
      >
        <div class="thumbnail-slit">
          <FeaturedMediaFrame
            class="thumb"
            :class="{ 'is-part-concealed': concealed && !sharedArrival }"
            :media="post.featuredMedia"
            label="Post"
            :transition-key="mediaTransitionKey"
            transition-role="source"
            sizes="52px"
            loading="eager"
          />
        </div>

        <div class="content" :data-featured-slip-source="mediaTransitionKey">
          <h3
            :class="{
              'is-featured-media-destination-covered':
                isDestinationCoveredByClone,
              'is-featured-media-destination-entering': isDestinationEntering,
            }"
            :data-featured-title-source="mediaTransitionKey"
            :data-featured-title-text="post.title"
          >
            <span :class="{ 'is-transition-hidden': shouldHideSharedVisual }">
              <SlitText
                :text="post.title"
                :hidden="Boolean(concealed && !sharedArrival)"
                :exiting="false"
              />
            </span>
          </h3>
          <p
            v-if="post.excerpt"
            class="excerpt"
            :class="{
              'is-slip-hidden': shouldSlipExtra,
              'is-slip-exiting': shouldExitExtra,
            }"
            :data-featured-card-extra-source="mediaTransitionKey"
          >
            <SlitText
              class="excerpt-inner"
              :text="post.excerpt"
              :hidden="shouldSlipExtra"
              :exiting="shouldExitExtra"
            />
          </p>
        </div>

        <p
          class="date"
          :class="{
            'is-slip-hidden': shouldSlipExtra,
            'is-slip-exiting': shouldExitExtra,
          }"
          :data-featured-card-extra-source="mediaTransitionKey"
        >
          <SlitText
            class="date-inner"
            :text="displayDate"
            :hidden="shouldSlipExtra"
            :exiting="shouldExitExtra"
          />
        </p>
      </a>
    </NuxtLink>
  </article>
</template>

<style lang="scss" scoped>
  .post-archive-row {
    background: var(--color-surface-soft);
    border-bottom: 1px solid var(--color-ink-30);
  }

  .row-link {
    display: grid;
    grid-template-columns: 52px 1fr auto;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-4);
    overflow: hidden;
    color: inherit;
    text-decoration: none;
  }

  .thumb {
    width: 52px;
    height: 52px;
    transform: translateY(0);
    transition: transform var(--writing-slit-duration) var(--snappy-ease-out)
      var(--writing-part-lead, 0ms);
  }

  :deep(.featured-media-frame) {
    width: 52px;
    height: 52px;
    aspect-ratio: 1 / 1;
  }

  .thumb.is-part-concealed {
    transition-delay: 0ms;
    transform: translateY(var(--slit-entry-offset, 110%));
  }

  .thumbnail-slit {
    overflow: hidden;
  }

  h3 {
    --slit-part-delay: calc(
      var(--writing-part-lead, 0ms) + var(--writing-part-stagger)
    );
  }
  .excerpt {
    --slit-part-delay: calc(
      var(--writing-part-lead, 0ms) + var(--writing-part-stagger) * 2
    );
  }
  .date {
    --slit-part-delay: calc(
      var(--writing-part-lead, 0ms) + var(--writing-part-stagger) * 3
    );
  }
  .is-shared-arrival .excerpt {
    --slit-part-delay: 0ms;
  }
  .is-shared-arrival .date {
    --slit-part-delay: var(--writing-part-stagger);
  }

  .content {
    min-width: 0;
  }

  h3 {
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-style: italic;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.01em;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: color 160ms var(--snappy-ease-out);
  }

  .post-archive-row:hover h3 {
    color: var(--color-primary);
  }

  .excerpt {
    margin: 0.2em 0 0;
  }

  .excerpt-inner {
    display: block;
    color: var(--color-muted);
    font-size: var(--type-small);
    line-height: 1.35;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .date {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
  }

  .date-inner {
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.04em;
  }

  .is-transition-hidden {
    opacity: 0;
  }

  @include breakpoint(phone) {
    .row-link {
      grid-template-columns: 52px minmax(0, 1fr);
      row-gap: var(--space-2);
    }

    h3,
    .excerpt-inner {
      overflow-wrap: anywhere;
      white-space: normal;
    }

    .date {
      grid-column: 2;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .thumb,
    h3,
    .excerpt-inner,
    .date-inner {
      transition: none;
    }
  }
</style>
