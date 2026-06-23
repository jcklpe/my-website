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
  // Hides excerpt + date (slip position below)
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

  // Vertical overflow clip for the slip — horizontal truncation is on the inner span
  .excerpt,
  .date {
    overflow: hidden;
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
    transition: transform var(--card-extra-slip-duration, 220ms) var(--snappy-ease-out) var(--content-delay, 0ms);
  }

  .date {
    white-space: nowrap;
  }

  .date-inner {
    display: block;
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.04em;
    transform: translateY(0);
    transition: transform var(--card-extra-slip-duration, 220ms) var(--snappy-ease-out) var(--content-delay, 0ms);
  }

  // Slip-in state: positioned below, waiting to animate up into place
  .is-slip-hidden .excerpt-inner,
  .is-slip-hidden .date-inner {
    transform: translateY(110%);
    transition-delay: 0ms;
  }

  // Slip-out state: exiting upward (forward navigation, this card is the source)
  .is-slip-exiting .excerpt-inner,
  .is-slip-exiting .date-inner {
    transform: translateY(-110%);
  }

  .is-transition-hidden {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    h3 {
      transition: none;
    }

    .excerpt-inner,
    .date-inner {
      transition: none;
    }
  }
</style>
