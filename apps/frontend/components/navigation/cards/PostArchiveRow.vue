<script setup lang="ts">
  import type { WordPressPost } from '~/types/wordpress';

  const props = defineProps<{
    post: WordPressPost;
  }>();

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
  const isExtraPreflighting = computed(
    () =>
      transitionState.value.phase === 'preflight' &&
      transitionState.value.key === mediaTransitionKey.value,
  );
  // Hides excerpt + date in their slip-ready position.
  const shouldSlipExtra = computed(
    () => isTitleTransitioning.value || isExtraPreflighting.value,
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
    prefetchPost(postSlug.value, props.post.featuredMedia);
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
  <article class="post-archive-row" data-transition-source>
    <NuxtLink v-slot="{ href }" :to="postUrl" custom>
      <a
        :href="href"
        class="row-link"
        @focus="prefetchPostDetail"
        @pointerdown="prefetchPostDetail"
        @pointerenter="prefetchPostDetail"
        @click="navigateToPost"
      >
        <FeaturedMediaFrame
          class="thumb"
          :media="post.featuredMedia"
          label="Post"
          :transition-key="mediaTransitionKey"
          transition-role="source"
          sizes="80px"
          loading="lazy"
        />

        <div class="content" :data-featured-slip-source="mediaTransitionKey">
          <h3 :data-featured-title-source="mediaTransitionKey">
            <span :class="{ 'is-transition-hidden': isTitleTransitioning }">
              {{ post.title }}
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
            <span class="excerpt-inner">{{ post.excerpt }}</span>
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
          <span class="date-inner">{{ displayDate }}</span>
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
  }

  :deep(.featured-media-frame) {
    width: 52px;
    height: 52px;
    aspect-ratio: 1 / 1;
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
    margin-top: 0.2em;
  }

  .excerpt-inner {
    display: block;
    color: var(--color-muted);
    font-size: var(--type-small);
    line-height: 1.35;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transform: translateY(0);
    opacity: 1;
    transition:
      transform 160ms var(--snappy-ease-out) 80ms,
      opacity 160ms var(--snappy-ease-out) 80ms;
  }

  .date {
    white-space: nowrap;
    overflow: hidden;
  }

  .date-inner {
    display: block;
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.04em;
    transform: translateY(0);
    opacity: 1;
    // 80ms delay on enter so the slip-in starts after the clone has clearly
    // settled; the exit direction zeroes this out via .is-slip-hidden override
    transition:
      transform 160ms var(--snappy-ease-out) 80ms,
      opacity 160ms var(--snappy-ease-out) 80ms;
  }

  // Enter from below: starts outside the clip boundary, slides up into place
  .is-slip-hidden .excerpt-inner,
  .is-slip-hidden .date-inner {
    transform: translateY(110%);
    opacity: 0;
    transition-delay: 0ms;
  }

  // Exit upward: fully clears the clip boundary so the element is gone before
  // the clone starts flying (preflight gives 300ms; this completes in 160ms)
  .is-slip-exiting .excerpt-inner,
  .is-slip-exiting .date-inner {
    transform: translateY(-110%);
    opacity: 0;
  }

  .is-transition-hidden {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    h3,
    .excerpt-inner,
    .date-inner {
      transition: none;
    }
  }
</style>
