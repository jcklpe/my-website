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
    min-height: 34rem;
    overflow: hidden;
    background: var(--color-primary);
    box-shadow: rgba(0, 0, 0, 0.99) 3px 3px 10px inset;
    clip-path: polygon(0 5vw, 100% 0, 100% 100%, 0 100%);
    margin-bottom: -5vw;
    transition:
      box-shadow 240ms var(--motion-snappy),
      filter 240ms var(--motion-snappy);
  }

  .link {
    display: grid;
    min-height: inherit;
    grid-template-columns: minmax(18rem, 0.42fr) minmax(0, 0.58fr);
    color: inherit;
    text-decoration: none;
  }

  .post-card :deep(.featured-media-frame) {
    position: absolute;
    top: -100px;
    left: 0;
    width: calc(42% + 100px);
    height: calc(100% + 150px);
    aspect-ratio: auto;
    border: 0;
  }

  .post-card :deep(.image),
  .post-card :deep(.placeholder) {
    height: 100%;
    transform: translate(0, 0) scale(1.06);
    filter: saturate(0.96) contrast(1.04);
    opacity: 0.7;
  }

  .body {
    position: relative;
    grid-column: 2;
    z-index: 2;
    display: flex;
    min-height: inherit;
    flex-direction: column;
    justify-content: center;
    padding: var(--space-7) var(--space-6);
    background: var(--color-surface);
  }

  .body::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: -24px;
    width: 0;
    height: 0;
    margin: auto;
    border-top: 50px solid transparent;
    border-right: 25px solid var(--color-surface);
    border-bottom: 50px solid transparent;
    transition:
      border-width var(--motion-slow) var(--motion-snappy),
      left var(--motion-slow) var(--motion-snappy);
  }

  .meta {
    display: block;
    margin-bottom: var(--space-3);
    color: var(--color-charcoal);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .post-card h3 {
    width: 75%;
    color: var(--color-surface);
    font-family: var(--font-sans);
    font-size: clamp(1.6rem, 3vw, 3rem);
    line-height: 1.3;
    letter-spacing: 0;
    text-wrap: balance;
  }

  .post-card h3 span {
    display: inline;
    padding: 0.05em 0.2em;
    background: var(--color-black);
    box-shadow: var(--shadow-label);
    transition: box-shadow 240ms var(--motion-snappy);
  }

  .excerpt {
    position: relative;
    z-index: 2;
    width: 72%;
    margin-top: var(--space-5);
    color: var(--color-surface);
    font-family: var(--font-lite);
    line-height: 1.5;
  }

  .excerpt {
    display: inline;
    padding: 0.15em 0.4em;
    background: var(--color-black);
    box-shadow:
      0.75em 0 0 var(--color-black),
      -0.5em 0 0 var(--color-black);
  }

  .post-card:hover h3 span,
  .post-card:focus-within h3 span {
    box-shadow:
      1.6em 0 0 var(--color-black),
      -0.5em 0 0 var(--color-black),
      1.6em 5px 0 var(--color-primary),
      0 5px 0 var(--color-primary),
      5px 14px 10px rgba(0, 0, 0, 0.15),
      12px 24px 2px rgba(0, 0, 0, 0.1),
      18px 34px 30px rgba(0, 0, 0, 0.1);
  }

  .post-card:hover :deep(.image),
  .post-card:focus-within :deep(.image) {
    transform: translate(-90px, 0) scale(1.06);
    opacity: 0.92;
    filter: saturate(1.08) contrast(1.05);
  }

  .post-card:hover .body::before,
  .post-card:focus-within .body::before {
    left: -60px;
    border-top-width: 150px;
    border-right-width: 61px;
    border-bottom-width: 150px;
  }

  :global(.post-list > li:nth-child(even) .post-card) {
    clip-path: polygon(0 0, 100% 5vw, 100% 100%, 0 100%);
  }

  :global(.post-list > li:nth-child(even) .post-card .link) {
    grid-template-columns: minmax(0, 0.58fr) minmax(18rem, 0.42fr);
  }

  :global(.post-list > li:nth-child(even) .post-card .featured-media-frame) {
    right: 0;
    left: auto;
  }

  :global(.post-list > li:nth-child(even) .post-card .body) {
    grid-column: 1;
  }

  :global(.post-list > li:nth-child(even) .post-card .body::before) {
    right: -24px;
    left: auto;
    border-right: 0;
    border-left: 25px solid var(--color-surface);
  }

  :global(.post-list > li:nth-child(even) .post-card:hover .body::before),
  :global(.post-list > li:nth-child(even) .post-card:focus-within .body::before) {
    right: -60px;
    left: auto;
    border-left-width: 61px;
  }

  @media (prefers-reduced-motion: reduce) {
    .post-card {
      transition: none;
    }

    .post-card:hover {
      transform: none;
    }

    .post-card:hover :deep(.image),
    .post-card:focus-within :deep(.image) {
      transform: translate(0, 0) scale(1.06);
    }
  }

  @include breakpoint(phone) {
    .post-card {
      min-height: 75vh;
    }

    .link {
      grid-template-columns: 1fr;
    }

    .post-card :deep(.featured-media-frame) {
      inset: 0;
      width: calc(100% + 100px);
      height: 100%;
    }

    .body,
    :global(.post-list > li:nth-child(even) .post-card .body) {
      grid-column: 1;
      background: transparent;
      padding: var(--space-8) var(--space-5);
    }

    .body::before {
      content: none;
    }

    .meta {
      width: fit-content;
      padding: 0.1em 0.35em;
      background: var(--color-notice);
      color: var(--color-black);
    }

    .post-card h3,
    .excerpt {
      width: min(100%, 34rem);
    }
  }
</style>
