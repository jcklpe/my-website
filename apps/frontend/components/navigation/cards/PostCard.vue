<script setup lang="ts">
  import type { WordPressPost } from '~/types/wordpress';

  const props = defineProps<{
    post: WordPressPost;
    // When true, image panel is on the right and text panel is on the left.
    flip?: boolean;
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
  <article
    class="post-card"
    :class="{ 'is-flipped': flip }"
    data-transition-source
  >
    <NuxtLink v-slot="{ href }" :to="postUrl" custom>
      <a
        :href="href"
        class="link"
        @focus="prefetchPostDetail"
        @pointerdown="prefetchPostDetail"
        @pointerenter="prefetchPostDetail"
        @click="navigateToPost"
      >
        <!-- Image panel -->
        <div class="media-panel">
          <FeaturedMediaFrame
            :media="post.featuredMedia"
            label="Post"
            :transition-key="mediaTransitionKey"
            transition-role="source"
            sizes="(max-width: 767px) 100vw, 40vw"
          />
          <div class="chevron" aria-hidden="true" />
        </div>

        <!-- Text panel -->
        <div class="body" :data-featured-slip-source="mediaTransitionKey">
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
              class="title-label"
              :class="{ 'is-transition-hidden': isTitleTransitioning }"
            >{{ post.title }}</span>
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
    overflow: hidden;
    background: var(--color-surface-warm);
    clip-path: polygon(0 0, 100% 5vw, 100% 100%, 0 100%);
    margin-bottom: -5vw;
    // Inset vignette on the card itself.
    box-shadow: rgba(0, 0, 0, 0.6) 0 0 80px inset;
  }

  .post-card:last-child {
    margin-bottom: 0;
    clip-path: none;
  }

  .link {
    display: flex;
    flex-direction: row;
    min-height: 80vh;
    align-items: stretch;
    color: inherit;
    text-decoration: none;
  }

  // Flipped: image on right, text on left.
  .is-flipped .link {
    flex-direction: row-reverse;
  }

  // ── Media panel ────────────────────────────────────────────────────────────
  .media-panel {
    position: relative;
    flex: 0 0 40%;
    overflow: hidden;
  }

  .media-panel :deep(.image),
  .media-panel :deep(.placeholder) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.7s cubic-bezier(0.84, 0.01, 0.19, 0.93);
  }

  .post-card:hover .media-panel :deep(.image) {
    transform: scale(1.05);
  }

  // CSS chevron notch between panels — a border-trick triangle.
  .chevron {
    position: absolute;
    top: 50%;
    right: -25px;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 50px solid transparent;
    border-bottom: 50px solid transparent;
    border-left: 25px solid var(--color-surface-warm);
    z-index: 5;
    transition:
      border-left-width 0.35s cubic-bezier(0.84, 0.01, 0.19, 0.93),
      border-top-width 0.35s cubic-bezier(0.84, 0.01, 0.19, 0.93),
      border-bottom-width 0.35s cubic-bezier(0.84, 0.01, 0.19, 0.93);
  }

  .post-card:hover .chevron {
    border-left-width: 61px;
    border-top-width: 150px;
    border-bottom-width: 150px;
  }

  .is-flipped .chevron {
    right: auto;
    left: -25px;
    border-left: none;
    border-right: 25px solid var(--color-surface-warm);
    transition:
      border-right-width 0.35s cubic-bezier(0.84, 0.01, 0.19, 0.93),
      border-top-width 0.35s cubic-bezier(0.84, 0.01, 0.19, 0.93),
      border-bottom-width 0.35s cubic-bezier(0.84, 0.01, 0.19, 0.93);
  }

  .is-flipped .post-card:hover .chevron,
  .is-flipped:hover .chevron {
    border-right-width: 61px;
    border-top-width: 150px;
    border-bottom-width: 150px;
  }

  // ── Text panel ─────────────────────────────────────────────────────────────
  .body {
    flex: 1 1 60%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: var(--space-8) var(--space-6) var(--space-6);
    position: relative;
    z-index: 2;
  }

  .meta {
    display: block;
    margin-bottom: var(--space-3);
    color: var(--color-muted);
    font-size: var(--type-small);
    font-style: normal;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .post-card h3 {
    margin: 0 0 var(--space-4);
    color: #fff;
    font-family: var(--font-display);
    font-size: clamp(2rem, 4vmax, 4rem);
    font-style: normal;
    font-weight: normal;
    line-height: 1.05;
    letter-spacing: 0.02em;
    text-wrap: balance;
  }

  // Box-shadow text technique on titles.
  .title-label {
    display: inline;
    background: #000;
    box-shadow:
      0.4em 0 0 #000,
      -5em 0 0 #000,
      0 3px 0 var(--color-primary),
      0 14px 10px rgba(0, 0, 0, 0.15),
      0 24px 2px rgba(0, 0, 0, 0.1),
      0 34px 30px rgba(0, 0, 0, 0.1);
    padding: 0.05em 0;
    line-height: 1.2;
    transition: box-shadow 0.5s cubic-bezier(0.84, 0.01, 0.19, 0.93);
  }

  .link:hover .title-label,
  .link:focus-visible .title-label {
    box-shadow:
      8em 0 0 #000,
      -10em 0 0 #000,
      0 3px 0 var(--color-primary),
      0 5px 0 rgba(0, 0, 0, 0.3);
  }

  .excerpt {
    margin: 0;
    color: var(--color-ink-80);
    font-size: clamp(0.875rem, 1.3vw, 1.05rem);
    line-height: 1.6;
  }

  // ── Mobile ─────────────────────────────────────────────────────────────────
  @include breakpoint(phone) {
    .link,
    .is-flipped .link {
      flex-direction: column;
      min-height: auto;
    }

    .media-panel {
      flex: 0 0 auto;
      height: 50vw;
      min-height: 220px;
    }

    .chevron {
      display: none;
    }

    .is-flipped .chevron {
      display: none;
    }

    .body {
      flex: 1 1 auto;
      padding: var(--space-6) var(--space-5) var(--space-5);
      justify-content: flex-start;
    }

    .post-card {
      clip-path: none;
      margin-bottom: 0;
    }
  }

  // ── Reduced motion ─────────────────────────────────────────────────────────
  @media (prefers-reduced-motion: reduce) {
    .title-label,
    .chevron,
    .media-panel :deep(.image) {
      transition: none;
    }

    .post-card:hover .media-panel :deep(.image) {
      transform: none;
    }
  }
</style>
