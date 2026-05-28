<script setup lang="ts">
  import type { GutenbergBlock, WordPressPost } from '~/types/wordpress';

  // Transition system coupling: this page is the target of the featured-media
  // card-to-detail transition originating from PostCard.vue. The
  // FeaturedMediaFrame, data-featured-slip-target, and data-featured-title-target
  // attributes below must be preserved for the transition to function. See:
  // composables/useFeaturedMediaTransition.ts
  // components/transitions/FeaturedMediaTransitionLayer.vue
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

  useSiteSeoMeta({
    title: () => post.value?.title ?? 'Post',
    description: () => post.value?.excerpt ?? '',
    type: 'article',
    image: () => post.value?.featuredMedia?.sourceUrl,
    imageAlt: () => post.value?.featuredMedia?.altText,
  });

  useHead({
    link: computed(() =>
      post.value?.canonicalUrl
        ? [{ rel: 'canonical', href: post.value.canonicalUrl }]
        : [],
    ),
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
        transition-clip-path="inset(0 round 48% 48% 0 0)"
        loading="eager"
        fetch-priority="high"
        sizes="100vw"
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
    background: var(--color-surface);
  }

  .hero {
    position: relative;
    z-index: var(--z-lower);
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(18rem, 34rem);
    gap: var(--space-7);
    align-items: end;
    min-height: 82svh;
    padding: var(--space-8) var(--space-6);
    margin-bottom: 0;
    overflow: hidden;
  }

  .hero::before {
    content: '';
    position: absolute;
    inset: auto -8rem -14rem 35%;
    height: 36rem;
    pointer-events: none;
    background: radial-gradient(circle, rgba(140, 165, 157, 0.18), transparent 66%);
  }

  // Transition state (3) — landing target slip panel (writing variant).
  // See shared-components/_featured-media-overlay.scss for the three-state system.
  .header {
    position: relative;
    grid-column: 1;
    z-index: var(--z-mid);
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
    font-size: var(--type-small);
    letter-spacing: 0.06em;
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
    max-width: 11ch;
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: 4.2rem;
    font-weight: 600;
    line-height: 0.92;
    @include slip-title;
  }

  .title span {
    display: inline;
  }

  .hero-media {
    grid-column: 2;
    grid-row: 1;
    justify-self: stretch;
    align-self: end;
    display: block;
    width: 100%;
    height: min(68svh, 44rem);
    aspect-ratio: auto;
    margin: 0;
    overflow: hidden;
    box-shadow: var(--shadow-soft-high);
    clip-path: inset(0 round 48% 48% 0 0);
  }

  .hero-media :deep(.image) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .content {
    position: relative;
    z-index: var(--z-low);
    width: 100%;
    background: var(--color-surface-warmer);
    padding-top: var(--space-7);
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
    background: var(--color-surface-warmer);
  }

  .post-page-state > .meta {
    color: var(--color-muted);
  }

  @keyframes detail-content-rise {
    from {
      transform: translateY(14rem);
    }

    to {
      transform: translateY(0);
    }
  }

  @media (max-width: 980px) {
    .hero {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    .header,
    .hero-media {
      grid-column: 1;
    }

    .hero-media {
      grid-row: 1;
      height: 28rem;
    }

    .header {
      grid-row: 2;
      max-width: none;
    }

    .title {
      max-width: 14ch;
      font-size: 3.1rem;
    }
  }

  @include breakpoint(phone) {
    .hero {
      padding-inline: var(--space-4);
    }

    .hero-media {
      height: 23rem;
    }

    .title {
      font-size: 2.45rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .content {
      animation: none;
    }
  }
</style>
