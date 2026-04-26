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
      <div v-if="post.featuredMedia?.sourceUrl" class="bg-image">
        <FeaturedMediaFrame
          class="hero-media"
          :media="post.featuredMedia"
          label="Post"
          :transition-key="mediaTransitionKey"
          transition-role="target"
          transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
        />
      </div>

      <header class="header">
        <p class="sys-label" aria-hidden="true">◉ WRITING.SYS</p>
        <h1 class="title" :data-featured-title-target="mediaTransitionKey">
          <span
            :class="{
              'is-transition-hidden': isTitleTransitioning,
            }"
          >
            {{ post.title }}
          </span>
        </h1>
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
        <p class="transmission-tag" aria-hidden="true">TRANSMISSION OPEN</p>
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

  /* ─ Hero: image-as-atmosphere, full-bleed ─ */
  .hero {
    position: relative;
    min-height: min(88vh, 68rem);
    background: var(--color-ink);
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - 22vw), 0 100%);
    margin-bottom: -22vw;
    z-index: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* Left PCB trace */
  .hero::before {
    content: '';
    position: absolute;
    left: calc(var(--space-6) - 0.5px);
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(181, 104, 0, 0.5) 12%,
      rgba(181, 104, 0, 0.5) 88%,
      transparent 100%
    );
    z-index: 4;
    pointer-events: none;
  }

  /* Seals top and bottom, frames the atmosphere */
  .hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(12, 17, 43, 0.62) 0%,
      rgba(12, 17, 43, 0.04) 38%,
      rgba(12, 17, 43, 0.78) 100%
    );
    z-index: 2;
    pointer-events: none;
  }

  /* Background image — obliterated to near-black texture */
  .bg-image {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .hero-media {
    display: block;
    width: 100%;
    height: 100%;
  }

  .hero-media :deep(.image),
  .hero-media :deep(.placeholder) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: saturate(0.15) brightness(0.28) contrast(1.4);
  }

  /* Text rides above the atmosphere */
  .header {
    position: relative;
    z-index: 10;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: clamp(5rem, 12vw, 16rem) var(--space-6) clamp(3rem, 6vw, 8rem)
      calc(var(--space-6) + 1.5rem);
  }

  /* Ghost ◈ watermark — huge amber symbol fading behind the title */
  .header::before {
    content: '◈';
    position: absolute;
    top: clamp(1rem, 3vw, 3rem);
    right: calc(var(--space-6) + 0.5rem);
    font-family: var(--font-mono);
    font-size: clamp(10rem, 22vw, 34rem);
    line-height: 1;
    color: rgba(181, 104, 0, 0.06);
    pointer-events: none;
    z-index: 0;
    user-select: none;
  }

  .sys-label {
    margin: 0 0 var(--space-4);
    font-family: var(--font-mono);
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-amber);
    text-shadow: 0 0 14px rgba(181, 104, 0, 0.85);
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .is-author-hidden {
    transform: translateY(0.35rem);
  }

  /* Raw title — phosphor burn direct against near-black atmosphere */
  .title {
    color: white;
    font-family: var(--font-mono);
    font-size: clamp(4rem, 14vw, 22rem);
    line-height: 0.85;
    letter-spacing: -0.06em;
    font-style: italic;
    text-align: right;
    text-shadow:
      0 0 28px rgba(255, 255, 255, 0.2),
      0 0 80px rgba(255, 255, 255, 0.07);
  }

  .title span {
    display: inline;
  }

  /* Right-edge vertical transmission tag */
  .transmission-tag {
    position: absolute;
    right: var(--space-5);
    bottom: clamp(3rem, 6vw, 8rem);
    writing-mode: vertical-rl;
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.44rem;
    font-weight: 700;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(181, 104, 0, 0.32);
    pointer-events: none;
    z-index: 5;
  }
  .meta-row {
    display: flex;
    align-items: center;
    gap: 0;
    margin-top: var(--space-5);
    padding-top: var(--space-4);
    border-top: 1px solid rgba(181, 104, 0, 0.38);
    width: 100%;
    max-width: min(56rem, 90vw);
    font-family: var(--font-mono);
    font-size: 0.6rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-amber);
    line-height: 1.2;
    text-shadow: 0 0 10px rgba(181, 104, 0, 0.5);
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
    padding-inline: 0.6em;
    opacity: 0.4;
  }

  .author {
    transition:
      opacity 280ms var(--motion-snappy),
      transform 280ms var(--motion-snappy);
  }

  /* ─ Content ─ */
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

  /* ─ Mobile ─ */
  @media (max-width: 767px) {
    .header {
      padding-left: calc(var(--space-5) + 1.5rem);
      padding-right: var(--space-5);
    }

    .title {
      font-size: clamp(3rem, 10vw, 6rem);
    }

    .transmission-tag {
      display: none;
    }

    .meta-row {
      max-width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .content {
      animation: none;
    }

    .author {
      transition: none;
    }
  }
</style>
