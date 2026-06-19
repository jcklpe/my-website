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

    // Only animate the body's rise when arriving via the featured-media
    // transition — not on plain refresh. Mirrors the case-study page.
    if (
      transitionState.value.active &&
      transitionState.value.key === mediaTransitionKey.value
    ) {
      enteredViaTransition.value = true;
    }
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
  const enteredViaTransition = ref(false);
  // Departure (detail → home): the reverse fires while this page is mounted,
  // flipping `active` false→true, so this watcher catches only the departure
  // (arrival had it true at mount). Drives the body's down+out exit, mirror of
  // the arrival rise. Mirrors the case-study page.
  const leaving = ref(false);
  watch(
    () => transitionState.value.active,
    (isActive, wasActive) => {
      if (
        isActive &&
        !wasActive &&
        transitionState.value.key === mediaTransitionKey.value
      ) {
        leaving.value = true;
      }
    },
  );
</script>

<template>
  <article v-if="post" class="post-page" :class="{ 'is-leaving': leaving }">
    <section class="hero">
      <div class="hero-plate">
        <FeaturedMediaFrame
          class="hero-media"
          :media="post.featuredMedia"
          label="Post"
          :transition-key="mediaTransitionKey"
          transition-role="target"
          transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
          loading="eager"
          fetch-priority="high"
          sizes="100vw"
        />
      </div>

      <header
        class="header"
        :class="{ 'is-transition-hidden': isTitleTransitioning }"
        :data-featured-slip-target="mediaTransitionKey"
      >
        <div
          v-if="postDate || postAuthor"
          class="meta-row"
        >
          <p
            v-if="postDate"
            class="meta"
            :class="{ 'is-transition-hidden': isTitleTransitioning }"
            :data-featured-meta-target="mediaTransitionKey"
          >
            {{ postDate }}
          </p>
          <span
            v-if="postAuthor"
            class="separator detail-only-meta"
            :class="{ 'is-author-transition-hidden': isTitleTransitioning }"
          >
            /
          </span>
          <span
            v-if="postAuthor"
            class="author detail-only-meta"
            :class="{ 'is-author-transition-hidden': isTitleTransitioning }"
          >
            {{ postAuthor }}
          </span>
        </div>
        <h1
          class="title"
          :class="{ 'is-transition-hidden': isTitleTransitioning }"
          :data-featured-title-target="mediaTransitionKey"
        >
          <span>
            {{ post.title }}
          </span>
        </h1>
      </header>
    </section>

    <BlockRenderer
      class="content has-paper-top"
      :class="{
        'is-arriving': enteredViaTransition && !leaving,
        'is-leaving': leaving,
      }"
      :data-featured-body-exit-target="mediaTransitionKey"
      :blocks="postBlocks"
    />

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
    background: var(--color-surface-warmer);
  }

  .hero {
    --hero-carve-sweep: 160px;
    --hero-plate-height: 500px;
    --photo-left-bleed: 40%;
    --title-shift: 50%;
    --title-shelf-height: 60px;

    position: relative;
    z-index: auto;
    margin-bottom: 0;
    overflow: visible;
  }

  .hero::after {
    content: none;
  }

  .hero-plate {
    position: relative;
    width: calc(100% - var(--photo-left-bleed));
    height: var(--hero-plate-height);
    margin-left: auto;
    overflow: hidden;
    border-bottom-right-radius: min(var(--hero-carve-sweep), 70vw);
  }

  .header {
    position: absolute;
    left: var(--title-shift);
    right: auto;
    bottom: var(--title-shelf-height);
    transform: translateX(calc(-1 * var(--title-shift)));
    z-index: 3;
    box-sizing: border-box;
    width: min(
      calc(100% - var(--space-6)),
      calc(var(--article-column) + 2 * var(--space-5))
    );
    padding: var(--space-4) var(--space-5) 0;
    background: var(--color-surface-warmer);
  }

  .hero-media {
    display: block;
    width: 100%;
    height: 100%;
    aspect-ratio: auto;
    margin: 0;
    overflow: hidden;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 0.4em;
    margin-bottom: var(--space-3);
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 600;
    letter-spacing: 0.1em;
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

  .is-transition-hidden {
    opacity: 0;
    transition: none;
  }

  .detail-only-meta {
    transition:
      opacity 180ms var(--snappy-ease-out),
      transform 180ms var(--snappy-ease-out);
  }

  .is-author-transition-hidden {
    opacity: 0;
    transform: translateY(-0.12rem);
  }

  .title {
    margin: 5px 0 0;
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: clamp(1.9rem, 4vw, 3.75rem);
    line-height: 1.08;
    @include slip-title;
  }

  .title span {
    display: inline;
  }

  @include breakpoint(phone) {
    .hero-plate {
      width: 100%;
      height: clamp(240px, 42vh, 420px);
      border-radius: 0;
    }

    .header {
      position: static;
      width: 100%;
      transform: none;
      padding: var(--space-4) var(--space-4) 0;
    }
  }

  .hero-media :deep(.image) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  // z-index 2 keeps the body above the flying media clone (z-index 1) during
  // the transition, so its rise is visible over the photo. The rise only
  // plays when arriving via the transition (.is-arriving) — never on plain
  // refresh. Mirrors the case-study fix.
  .content {
    position: relative;
    z-index: 2;
    width: 100%;
    background: var(--color-surface-warmer);
    padding-top: var(--space-5);
  }

  .content.is-arriving {
    animation: detail-content-rise var(--featured-media-flight-duration)
      var(--snappy-ease-out) var(--content-delay) both;
  }

  @keyframes detail-content-rise {
    from {
      transform: translateY(46vh);
    }
    to {
      transform: translateY(0);
    }
  }

  // Departure (reverse): the body slides RIGHT and off before the rest of the
  // transition. The composable measures the visible body and sets
  // --detail-content-exit-x before this animation starts, so the animation's
  // endpoint clears the viewport without hiding a long off-screen tail.
  .content.is-leaving {
    animation: detail-content-exit var(--article-bodyplate-exit-duration, 450ms)
      var(--snappy-ease-in) both;
  }

  @keyframes detail-content-exit {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(var(--detail-content-exit-x, 100vw));
    }
  }

  .post-page.is-leaving {
    overflow-x: clip;
  }

  @media (prefers-reduced-motion: reduce) {
    .content.is-arriving,
    .content.is-leaving {
      animation: none;
    }
  }

  .content.has-paper-top {
    --paper-step: 66px;
    --paper-col: min(
      calc(100% - var(--space-6)),
      calc(var(--article-column) + 2 * var(--space-5))
    );
    --paper-col-left: calc((100% - var(--paper-col)) / 2);
    --paper-col-right: calc((100% + var(--paper-col)) / 2);
    margin-top: calc(-1 * var(--paper-step, 240px));
    background:
      linear-gradient(
          to right,
          transparent var(--paper-col-left),
          var(--color-surface-warmer) var(--paper-col-left),
          var(--color-surface-warmer) var(--paper-col-right),
          transparent var(--paper-col-right)
        )
        top left / 100% var(--paper-step, 240px) no-repeat,
      linear-gradient(var(--color-surface-warmer), var(--color-surface-warmer))
        left 0 top var(--paper-step, 240px) / 100%
        calc(100% - var(--paper-step, 240px)) no-repeat;
  }

  .content.has-paper-top > :deep(:first-child) {
    margin-top: 0;
  }

  @include breakpoint(phone) {
    .content.has-paper-top {
      margin-top: 0;
      background: var(--color-surface-warmer);
    }
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

</style>
