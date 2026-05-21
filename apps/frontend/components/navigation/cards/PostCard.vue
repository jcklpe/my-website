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
    min-height: 100%;
    border: 1px solid rgba(168, 95, 43, 0.34);
    background:
      linear-gradient(rgba(255, 249, 236, 0.9), rgba(255, 249, 236, 0.9)),
      var(--texture-paper-grid);
    box-shadow: var(--shadow-soft-mid);
    transition:
      transform 240ms var(--motion-snappy),
      box-shadow 240ms var(--motion-snappy),
      border-color 240ms var(--motion-snappy);
  }

  .post-card::before {
    content: '';
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
    width: 1.25rem;
    aspect-ratio: 1;
    border: 1px solid var(--color-copper);
    border-radius: 999px;
    opacity: 0.62;
    pointer-events: none;
  }

  .post-card:hover {
    border-color: var(--color-copper);
    box-shadow: var(--shadow-soft-high);
    transform: translateY(-0.2rem);
  }

  .link {
    display: block;
    color: inherit;
    text-decoration: none;
  }

  .body {
    padding: var(--space-5);
    border-top: 1px solid rgba(168, 95, 43, 0.24);
  }

  .meta {
    display: block;
    margin-bottom: var(--space-3);
    color: var(--color-primary-heavy);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 600;
    letter-spacing: 0;
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .post-card h3 {
    color: var(--color-ink);
    font-family: var(--font-serif);
    font-size: 1.65rem;
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
    line-height: 1.55;
  }

  .post-card :deep(.featured-media-frame) {
    background: var(--color-surface-warm);
  }

  .post-card :deep(.image) {
    filter: saturate(0.88) sepia(0.1);
  }

  .post-card:hover :deep(.image),
  .post-card:focus-within :deep(.image) {
    filter: saturate(0.98) contrast(1.04) sepia(0.04);
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
