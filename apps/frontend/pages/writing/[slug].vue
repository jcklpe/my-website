<script setup lang="ts">
  import type { GutenbergBlock, WordPressPost } from '~/types/wordpress';

  const route = useRoute();
  const { getPostBlocks, getPostShell } = useContentDetailPrefetch();
  const { prefetchHomeSurface } = useHomeSurfacePrefetch();
  const { prefetchInitialArchivePage } = useWritingArchive();
  const slug = computed(() => String(route.params.slug));

  onMounted(() => {
    window.setTimeout(() => {
      prefetchHomeSurface();
      prefetchInitialArchivePage();
    }, 500);
  });

  const {
    data: post,
    error,
    status,
  } = await useAsyncData<WordPressPost | null>(
    () => `post-shell:${slug.value}`,
    () => getPostShell(slug.value),
    {
      dedupe: 'cancel',
      watch: [slug],
    },
  );

  const { data: postBodyBlocks, error: postBodyError } = useLazyAsyncData<
    GutenbergBlock[]
  >(
    () => `post-body:${slug.value}`,
    async () => (await getPostBlocks(slug.value)) ?? [],
    {
      dedupe: 'cancel',
      default: () => [],
      watch: [slug],
    },
  );

  const isLoading = computed(
    () => status.value === 'idle' || status.value === 'pending',
  );
  const postBlocks = computed(() => postBodyBlocks.value ?? []);

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
        loading="eager"
        fetch-priority="high"
      />

      <header
        class="header"
        :class="{ 'is-transition-hidden': isTitleTransitioning }"
        :data-featured-slip-target="mediaTransitionKey"
      >
        <div
          v-if="postDate || postAuthor"
          class="meta-row"
          :data-featured-meta-target="mediaTransitionKey"
        >
          <p v-if="postDate" class="meta">
            {{ postDate }}
          </p>
          <span v-if="postAuthor" class="separator">/</span>
          <span v-if="postAuthor" class="author">
            {{ postAuthor }}
          </span>
        </div>
        <h1 class="title" :data-featured-title-target="mediaTransitionKey">
          <span>
            {{ post.title }}
          </span>
        </h1>
      </header>
    </section>

    <BlockRenderer class="content" :blocks="postBlocks" />

    <section v-if="postBodyError" class="body-state" aria-live="polite">
      <p class="meta">Error</p>
      <h2>Unable to load post body.</h2>
      <p class="excerpt">
        The CMS request for this post's blocks failed. Try refreshing, or check
        whether WordPress is running.
      </p>
    </section>
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

  // Transition state (3) — landing target slip panel (writing variant).
  // See shared-components/_featured-media-overlay.scss for the three-state system.
  .header {
    position: absolute;
    left: var(--space-6);
    bottom: var(--space-7);
    z-index: 2;
    max-width: min(54rem, calc(100% - var(--space-7)));
    padding: var(--space-4) var(--space-5) var(--space-5);
    @include slip-surface;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 0.4em;
    margin-bottom: var(--space-3);
    color: var(--color-muted);
    font-size: var(--type-step--1);
    font-style: italic;
    letter-spacing: 0.06em;
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

  .is-transition-hidden {
    opacity: 0;
    transition: none;
  }

  .author {
    transition:
      opacity 280ms var(--motion-snappy),
      transform 280ms var(--motion-snappy);
  }

  .title {
    max-width: 38rem;
    color: var(--color-ink);
    font-family: var(--font-serif);
    font-size: clamp(1.75rem, 3.5vw, 3.25rem);
    line-height: 1.1;
    @include slip-title;
  }

  .title span {
    display: inline;
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

  .body-state {
    max-width: var(--article-column);
    margin: var(--space-6) auto 0;
    padding-inline: var(--article-padding-inline);
    color: var(--color-ink);
  }

  .body-state > .meta {
    color: var(--color-muted);
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
