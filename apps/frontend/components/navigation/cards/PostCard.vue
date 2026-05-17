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
  <article class="post-card" data-transition-source>
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
          :media="post.featuredMedia"
          label="Post"
          :transition-key="mediaTransitionKey"
          transition-role="source"
          sizes="(max-width: 760px) 100vw, 34vw"
        />

        <div class="body" :data-featured-slip-source="mediaTransitionKey">
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
          <p class="excerpt">{{ post.excerpt }}</p>
        </div>
      </a>
    </NuxtLink>
  </article>
</template>

<style lang="scss" scoped>
  .post-card {
    position: relative;
    border: var(--border-default);
    background: var(--color-surface-soft);
    box-shadow: var(--shadow-soft-mid);
    transition:
      transform 240ms var(--motion-snappy),
      box-shadow 240ms var(--motion-snappy),
      border-color 240ms var(--motion-snappy);
  }

  .post-card::before {
    content: '';
    display: block;
    height: 1.85rem;
    border-bottom: var(--border-default);
    background:
      radial-gradient(circle, var(--color-ink) 0 0.22rem, transparent 0.24rem) calc(100% - 3.4rem) 50% / 0.72rem 0.72rem no-repeat,
      radial-gradient(circle, var(--color-ink) 0 0.22rem, transparent 0.24rem) calc(100% - 2.25rem) 50% / 0.72rem 0.72rem no-repeat,
      radial-gradient(circle, var(--color-primary) 0 0.22rem, transparent 0.24rem) calc(100% - 1.1rem) 50% / 0.72rem 0.72rem no-repeat,
      var(--color-surface-warmer);
  }

  .post-card:hover {
    border-color: var(--color-primary-tint);
    box-shadow: var(--shadow-soft-high);
    transform: translate(-0.2rem, -0.2rem);
  }

  .link {
    display: block;
    color: inherit;
    text-decoration: none;
  }

  .body {
    position: relative;
    padding: var(--space-5);
  }

  .body::before {
    content: 'Writing log';
    display: block;
    margin-bottom: var(--space-3);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .meta {
    display: block;
    margin-bottom: var(--space-3);
    color: var(--color-muted);
    font-size: var(--type-small);
    font-family: var(--font-mono);
    font-style: normal;
    letter-spacing: 0.06em;
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .post-card h3 {
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: 1.35rem;
    line-height: 1.12;
    letter-spacing: 0;
    text-wrap: balance;
  }

  .post-card h3 span {
    display: inline;
  }

  .excerpt {
    position: relative;
    z-index: 901;
    margin-top: var(--space-3);
    color: var(--color-ink-80);
  }

  .post-card :deep(.featured-media-frame) {
    border-bottom: var(--border-default);
  }

  @media (prefers-reduced-motion: reduce) {
    .post-card {
      transition: none;
    }

    .post-card:hover {
      transform: none;
    }
  }
</style>
