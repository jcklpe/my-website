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
        <div class="entry" :data-featured-slip-source="mediaTransitionKey">
          <div class="entry-text">
            <p
              v-if="postDate"
              class="meta"
              :class="{ 'is-transition-hidden': isTitleTransitioning }"
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

          <FeaturedMediaFrame
            class="entry-thumb"
            :media="post.featuredMedia"
            label="Post"
            :transition-key="mediaTransitionKey"
            transition-role="source"
            sizes="96px"
          />
        </div>
      </a>
    </NuxtLink>
  </article>
</template>

<style lang="scss" scoped>
  .post-card {
    border-bottom: var(--border-default);
  }

  .post-card:first-child {
    border-top: var(--border-default);
  }

  .link {
    display: block;
    color: inherit;
    text-decoration: none;
    padding: var(--space-5) 0;
    transition: opacity 180ms ease;
  }

  .link:hover {
    opacity: 0.72;
  }

  .entry {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-5);
    align-items: start;
  }

  .entry-text {
    min-width: 0;
  }

  .meta {
    display: block;
    margin-bottom: var(--space-2);
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .post-card h3 {
    color: var(--color-ink);
    font-family: var(--font-display);
    font-size: clamp(1.4rem, 3vw, 2.4rem);
    line-height: 0.94;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    text-wrap: balance;
    margin: 0;
  }

  .post-card h3 span {
    display: inline;
  }

  .excerpt {
    margin-top: var(--space-2);
    color: var(--color-ink-80);
    font-size: var(--type-small);
    line-height: 1.55;
  }

  .entry-thumb {
    flex-shrink: 0;
    width: 5rem;
    height: 5rem;
    overflow: hidden;
  }

  .entry-thumb :deep(.image),
  .entry-thumb :deep(.placeholder) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (prefers-reduced-motion: reduce) {
    .link {
      transition: none;
    }
  }
</style>
