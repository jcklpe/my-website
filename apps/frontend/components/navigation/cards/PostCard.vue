<script setup lang="ts">
  import type { WordPressPost } from '~/types/wordpress';

  type PostCardLayout = 'standard' | 'feature' | 'tile' | 'compact';

  const props = withDefaults(
    defineProps<{
      post: WordPressPost;
      layout?: PostCardLayout;
      mediaSizes?: string;
      showExcerpt?: boolean;
    }>(),
    {
      layout: 'standard',
      mediaSizes: '(max-width: 760px) 100vw, 34vw',
      showExcerpt: true,
    },
  );

  const { navigateWithFeaturedMediaTransition } = useFeaturedMediaTransition();
  const { prefetchPost } = useContentDetailPrefetch();
  const transitionState = useFeaturedMediaTransitionState();
  const postSlug = computed(() => props.post.slug);
  const postUrl = computed(() => `/writing/${postSlug.value}`);
  const postDate = computed(() => props.post.date);
  const mediaTransitionKey = computed(() =>
    `post-${postSlug.value}`.replace(/[^a-zA-Z0-9_-]/g, '-'),
  );
  const isTitleTransitioning = computed(
    () =>
      transitionState.value.active &&
      transitionState.value.key === mediaTransitionKey.value,
  );

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
  <article
    class="post-card"
    :class="`is-${layout}`"
    data-transition-source
  >
    <NuxtLink v-slot="{ href }" :to="postUrl" custom>
      <a
        :href="href"
        class="link"
        @focus="prefetchPostDetail"
        @pointerdown="prefetchPostDetail"
        @pointerenter="prefetchPostDetail"
        @click="navigateToPost"
      >
        <FeaturedMediaFrame
          class="media"
          :media="post.featuredMedia"
          label="Post"
          :transition-key="mediaTransitionKey"
          transition-role="source"
          :sizes="mediaSizes"
        />

        <div
          class="body"
          :class="{ 'is-transition-hidden': isTitleTransitioning }"
          :data-featured-slip-source="mediaTransitionKey"
        >
          <p
            v-if="postDate"
            class="meta"
            :class="{
              'is-transition-hidden': isTitleTransitioning,
            }"
            :data-featured-meta-source="mediaTransitionKey"
          >
            {{ postDate }}
          </p>
          <h3 :data-featured-title-source="mediaTransitionKey">
            <span
              :class="{
                'is-transition-hidden': isTitleTransitioning,
              }"
            >
              {{ post.title }}
            </span>
          </h3>
          <p
            v-if="showExcerpt && post.excerpt"
            class="excerpt"
            :class="{ 'is-excerpt-transition-hidden': isTitleTransitioning }"
          >
            {{ post.excerpt }}
          </p>
        </div>
      </a>
    </NuxtLink>
  </article>
</template>

<style lang="scss" scoped>
  .post-card {
    height: 100%;
    min-width: 0;
    border: var(--border-window);
    background: var(--color-surface-soft);
    box-shadow: var(--shadow-hard-low);
    transition:
      transform 240ms var(--motion-snappy),
      box-shadow 240ms var(--motion-snappy),
      border-color 240ms var(--motion-snappy);
  }

  .post-card:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-hard-mid);
    transform: translate(-0.15rem, -0.15rem);
  }

  .link {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    min-height: 0;
    color: inherit;
    text-decoration: none;
  }

  .media {
    flex: 0 0 auto;
  }

  .body {
    flex: 1;
    min-width: 0;
    padding: var(--space-5);
    background: var(--color-surface-soft);
    overflow: hidden;
  }

  .meta {
    display: block;
    margin-bottom: var(--space-3);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 600;
    letter-spacing: 0.1em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .post-card h3 {
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: clamp(1.2rem, 2vw, 1.8rem);
    line-height: 1.12;
    letter-spacing: -0.025em;
    text-wrap: balance;
    overflow-wrap: anywhere;
  }

  .post-card h3 span {
    display: inline;
  }

  .excerpt {
    display: -webkit-box;
    overflow: hidden;
    margin-top: var(--space-3);
    color: var(--color-ink-80);
    transition: opacity 240ms var(--motion-snappy);
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .is-excerpt-transition-hidden {
    opacity: 0;
  }

  .post-card.is-feature,
  .post-card.is-tile,
  .post-card.is-compact {
    overflow: hidden;
  }

  .post-card.is-feature .media,
  .post-card.is-tile .media {
    flex: 1 1 0;
    min-height: 0;
    aspect-ratio: auto;
  }

  .post-card.is-feature .body,
  .post-card.is-tile .body {
    flex: 0 0 auto;
  }

  .post-card.is-feature h3 {
    font-size: 1.45rem;
  }

  .post-card.is-feature .excerpt {
    font-size: var(--type-base);
    line-height: 1.45;
    -webkit-line-clamp: 2;
  }

  .post-card.is-tile .body {
    padding: var(--space-4);
  }

  .post-card.is-tile .meta {
    margin-bottom: var(--space-2);
    font-size: calc(var(--type-small) * 0.92);
    letter-spacing: 0.08em;
  }

  .post-card.is-tile h3 {
    display: -webkit-box;
    overflow: hidden;
    font-size: 1.05rem;
    line-height: 1.15;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .post-card.is-compact .link {
    flex-direction: row;
  }

  .post-card.is-compact .media {
    flex: 0 0 34%;
    align-self: stretch;
    aspect-ratio: auto;
  }

  .post-card.is-compact .body {
    padding: var(--space-3) var(--space-4);
    overflow: hidden;
  }

  .post-card.is-compact .meta {
    margin-bottom: var(--space-2);
    font-size: calc(var(--type-small) * 0.9);
    letter-spacing: 0.08em;
  }

  .post-card.is-compact h3 {
    display: -webkit-box;
    overflow: hidden;
    font-size: 0.95rem;
    line-height: 1.14;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  @include breakpoint(phone) {
    .post-card.is-compact .link {
      flex-direction: column;
    }

    .post-card.is-compact .media {
      flex-basis: auto;
      width: 100%;
      aspect-ratio: 16 / 10;
    }

    .post-card.is-feature h3 {
      font-size: 1.35rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .post-card {
      transition: none;
    }

    .excerpt {
      transition: none;
    }

    .post-card:hover {
      transform: none;
    }
  }
</style>
