<script setup lang="ts">
  import type { GutenbergBlock, WordPressPost } from '~/types/wordpress';
  import { usePostFootnotes } from '~/composables/usePostFootnotes';

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

  // Provide footnote map at the page level so OrphanSidenoteRenderer (a sibling
  // of BlockRenderer) can inject it. BlockRenderer's own call hits the guard and
  // reuses this same map rather than creating a second one.
  usePostFootnotes(postBlocks);

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
  // True only when this page is the *destination* of a forward transition —
  // distinct from `leaving` (departure). Controls header hide and date slip-in.
  const isArrivingForward = computed(
    () =>
      isTitleTransitioning.value &&
      transitionState.value.sourceRole === 'source',
  );
  // Slip the date in only when arriving from archive (no meta clone is flying).
  // When meta !== null a clone is already morphing the date text (homepage case).
  const shouldSlipDateIn = computed(
    () => isArrivingForward.value && !transitionState.value.meta,
  );
  const enteredViaTransition = ref(false);
  const articleBody = ref<HTMLElement | null>(null);
  const tocScanKey = computed(() => `${slug.value}:${postBlocks.value.length}`);
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
  <article
    v-if="post"
    class="post-page"
    :class="{
      'is-leaving': leaving,
      'is-hero-arriving': isTitleTransitioning && transitionState.sourceRole === 'source',
      'is-hero-departing': isTitleTransitioning && transitionState.sourceRole === 'target',
    }"
  >
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
        :class="{
          'is-transition-hidden': isArrivingForward,
          'is-header-departing': leaving,
        }"
        :data-featured-slip-target="mediaTransitionKey"
      >
        <div
          v-if="postDate || postAuthor"
          class="meta-row"
        >
          <p
            v-if="postDate"
            class="meta detail-only-meta"
            :class="{
              'is-author-transition-hidden': shouldSlipDateIn,
              'is-date-leaving': leaving,
            }"
            :data-featured-meta-target="mediaTransitionKey"
          >
            <span class="detail-only-meta-inner">{{ postDate }}</span>
          </p>
          <span
            v-if="postAuthor"
            class="separator detail-only-meta"
            :class="{ 'is-author-transition-hidden': isArrivingForward }"
            aria-hidden="true"
          >
            <span class="detail-only-meta-inner">/</span>
          </span>
          <span
            v-if="postAuthor"
            class="author detail-only-meta"
            :class="{ 'is-author-transition-hidden': isArrivingForward }"
          >
            <span class="detail-only-meta-inner">{{ postAuthor }}</span>
          </span>
        </div>
        <h1
          class="title"
          :class="{ 'is-transition-hidden': isArrivingForward }"
          :data-featured-title-target="mediaTransitionKey"
        >
          <span>
            {{ post.title }}
          </span>
        </h1>
      </header>
    </section>

    <div ref="articleBody" class="article-apparatus">
      <BlockRenderer
        class="content has-paper-top"
        :class="{
          'is-arriving': enteredViaTransition && !leaving,
          'is-leaving': leaving,
        }"
        :data-featured-body-exit-target="mediaTransitionKey"
        :blocks="postBlocks"
      >
        <template #apparatus>
          <ArticleToc :target="articleBody" :scan-key="tocScanKey" />
        </template>
      </BlockRenderer>
    </div>
    <OrphanSidenoteRenderer />

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

  .post-page.is-hero-arriving {
    animation: cream-bg-in var(--featured-media-flight-duration) var(--snappy-ease-out) both;
  }

  .post-page.is-hero-departing {
    animation: cream-bg-out var(--article-bodyplate-exit-duration) var(--snappy-ease-in) both;
  }

  @keyframes cream-bg-in {
    from { background-color: var(--color-surface-warmer-0); }
    to   { background-color: var(--color-surface-warmer); }
  }

  @keyframes cream-bg-out {
    from { background-color: var(--color-surface-warmer); }
    to   { background-color: var(--color-surface-warmer-0); }
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

  // The date uses the detail-only-meta slip pattern — needs inline-block for overflow clip
  .meta-row .meta.detail-only-meta {
    display: inline-block;
  }

  .separator {
    padding-inline: 0.45em;
  }

  .is-transition-hidden {
    opacity: 0;
    transition: none;
  }

  .detail-only-meta {
    display: inline-block;
    overflow: hidden;
    vertical-align: bottom;
  }

  .detail-only-meta-inner {
    display: inline-block;
    transform: translateY(0);
    transition: transform 260ms var(--snappy-ease-out) var(--content-delay);
  }

  .is-author-transition-hidden .detail-only-meta-inner {
    transform: translateY(115%);
    transition-delay: 0ms;
  }

  // Date arrives first; separator and author follow 60ms later
  .separator .detail-only-meta-inner,
  .author .detail-only-meta-inner {
    transition-delay: calc(var(--content-delay, 150ms) + 60ms);
  }

  // Departure: header fades quickly after the date has already gone
  .is-header-departing {
    transition: opacity 150ms var(--snappy-ease-out) 80ms;
    opacity: 0;
  }

  // Departure: quick fade — the clone starts flying immediately so a slip
  // can't complete; a fast fade stays out of the way.
  .is-date-leaving .detail-only-meta-inner {
    opacity: 0;
    transition: opacity 100ms var(--snappy-ease-out);
    transition-delay: 0ms;
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
      width: calc(100% - var(--space-4));
      height: clamp(13rem, 62vw, 21rem);
      margin-left: 0;
      border-bottom-right-radius: clamp(4rem, 30vw, 8rem);
    }

    .header {
      position: relative;
      top: auto;
      right: auto;
      bottom: auto;
      left: auto;
      width: auto;
      max-width: none;
      transform: none;
      margin: calc(-1 * var(--space-6) + 35px) var(--space-4) 0;
      padding: var(--space-3) var(--space-4) var(--space-3);
    }

    .meta-row {
      flex-wrap: wrap;
      row-gap: var(--space-1);
      margin-bottom: var(--space-2);
    }

    .title {
      font-size: 1.45rem;
      line-height: 1.08;
      overflow-wrap: anywhere;
      word-break: break-word;
      text-wrap: wrap;
    }
  }

  .hero-media :deep(.image) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: translate(0, 0);
    transition: none;
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

  .article-apparatus {
    position: relative;
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
    .content.is-leaving,
    .post-page.is-hero-arriving,
    .post-page.is-hero-departing {
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
      margin-top: calc(-1 * var(--space-5) + 20px);
      padding-top: var(--space-6);
      background: transparent;
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
