<script setup lang="ts">
  import type { WordPressPost } from '~/types/wordpress';

  const route = useRoute();
  const slug = computed(() => String(route.params.slug));

  const {
    data: post,
    error,
    status,
  } = await useAsyncData<WordPressPost | null>(
    () => `post:${slug.value}`,
    () => queryWordPressPostBySlug(slug.value),
    {
      dedupe: 'cancel',
      watch: [slug],
    },
  );

  const isLoading = computed(
    () => status.value === 'idle' || status.value === 'pending',
  );

  useSeoMeta({
    title: () => post.value?.title ?? 'Post',
    description: () => post.value?.excerpt ?? '',
  });

  const postDate = computed(() => post.value?.date);
  const postAuthor = computed(() => post.value?.authorName);

  const mediaTransitionKey = computed(() =>
    `post-${slug.value}`.replace(/[^a-zA-Z0-9_-]/g, '-'),
  );
  const transitionState = useFeaturedMediaTransitionState();
  const isTitleTransitioning = computed(
    () =>
      transitionState.value.active &&
      transitionState.value.key === mediaTransitionKey.value,
  );
</script>

<template>
  <article v-if="post" class="post-page">
    <section class="hero">
      <FeaturedMediaFrame
        v-if="post.featuredMedia?.sourceUrl"
        class="hero-media"
        :media="post.featuredMedia"
        label="Post"
        :transition-key="mediaTransitionKey"
        transition-role="target"
        transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
      />

      <header class="header">
        <div
          v-if="postDate || postAuthor"
          class="meta-row"
          :class="{
            'is-transition-hidden': isTitleTransitioning,
          }"
          :data-featured-meta-target="mediaTransitionKey"
        >
          <p v-if="postDate" class="meta">
            {{ postDate }}
          </p>
          <span
            v-if="postAuthor"
            class="separator"
            :class="{
              'is-author-hidden': isTitleTransitioning,
            }"
          >
            /
          </span>
          <span
            v-if="postAuthor"
            class="author"
            :class="{
              'is-author-hidden': isTitleTransitioning,
            }"
          >
            {{ postAuthor }}
          </span>
        </div>
        <h1 class="title" :data-featured-title-target="mediaTransitionKey">
          <span
            :class="{
              'is-transition-hidden': isTitleTransitioning,
            }"
          >
            {{ post.title }}
          </span>
        </h1>
      </header>
    </section>

    <BlockRenderer class="content" :blocks="post.blocks" />
  </article>

  <section v-else class="post-page-state" aria-live="polite">
    <p class="meta">
      {{ isLoading ? 'Loading' : error ? 'Error' : 'Not Found' }}
    </p>
    <h1>
      {{
        isLoading
          ? 'Loading post...'
          : error
            ? 'Unable to load post.'
            : 'Post not found.'
      }}
    </h1>
    <p class="excerpt">
      {{
        isLoading
          ? 'Fetching this post from WordPress.'
          : error
            ? 'The CMS request failed. Try refreshing, or check whether WordPress is running.'
            : `No post exists for "${slug}".`
      }}
    </p>
  </section>
</template>

<style lang="scss" scoped>
  .post-page {
    width: 100%;
    max-width: none;
    min-height: 55vh;
    padding: 0 0 var(--space-9);
    color: var(--color-ink);
    background: var(--color-paper-warm);
  }

  .hero {
    position: relative;
    z-index: 1;
    margin-bottom: 0;
    overflow: hidden;
  }

  .hero::after {
    content: none;
  }

  .header {
    position: absolute;
    right: 0;
    bottom: var(--space-8);
    left: 0;
    z-index: 2;
    width: min(72rem, calc(100% - var(--space-6)));
    margin-inline: auto;
    padding: var(--space-6) var(--space-6) var(--space-8);
  }

  .meta-row {
    display: inline-flex;
    align-items: center;
    margin-bottom: var(--space-5);
    padding: 0.35em 0.55em;
    background: var(--color-ink);
    color: white;
    font-size: var(--type-step--1);
    font-style: italic;
    letter-spacing: 0.08em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .meta-row .meta,
  .separator,
  .author {
    display: inline;
    margin: 0;
    padding: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    line-height: inherit;
    text-transform: inherit;
  }

  .separator {
    padding-inline: 0.45em;
  }

  .is-transition-hidden,
  .is-author-hidden {
    opacity: 0;
  }

  .author {
    transition:
      opacity 280ms var(--motion-snappy),
      transform 280ms var(--motion-snappy);
  }

  .is-author-hidden {
    transform: translateY(0.35rem);
  }

  .title {
    max-width: min(76rem, 90vw);
    color: white;
    font-family: var(--font-serif);
    font-size: clamp(2.4rem, 6vw, 7rem);
    line-height: 1.12;
    letter-spacing: -0.03em;
    text-wrap: balance;
    text-shadow: 0 2px 2px rgba(0, 0, 0, 0.35);
  }

  .title span {
    display: inline;
    padding: 0.12em 0.22em 0.18em;
    background-color: var(--color-ink);
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .hero-media {
    display: block;
    width: 100%;
    height: min(72vh, 44rem);
    aspect-ratio: auto;
    margin: 0;
    overflow: hidden;
  }

  .hero-media :deep(.image) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .content {
    position: relative;
    z-index: 2;
    width: 100%;
    background: var(--color-paper-warm);
    padding-top: var(--space-5);
    animation: detail-content-rise var(--motion-route-transition-duration)
      var(--motion-snappy) var(--motion-route-content-delay) both;
  }

  .post-page-state {
    max-width: 44rem;
    min-height: 55vh;
    padding: var(--space-8) 0 var(--space-9);
    color: var(--color-ink);
    background: var(--color-paper-warm);
  }

  .post-page-state > .meta {
    color: var(--color-muted);
  }

  @keyframes detail-content-rise {
    from {
      transform: translateY(46vh);
    }

    to {
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .content {
      animation: none;
    }
  }
</style>
