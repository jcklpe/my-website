<script setup lang="ts">
  import type { WordPressPost } from '~/types/wordpress';

  const props = defineProps<{
    post: WordPressPost;
  }>();

  const { navigateWithFeaturedMediaTransition } = useFeaturedMediaTransition();
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
</script>

<template>
  <article class="post-card" data-transition-source>
    <NuxtLink v-slot="{ href }" :to="postUrl" custom>
      <a
        :href="href"
        class="link"
        @click="
          navigateWithFeaturedMediaTransition(
            $event,
            postUrl,
            mediaTransitionKey,
            post.featuredMedia,
          )
        "
      >
        <div class="media-region">
          <FeaturedMediaFrame
            :media="post.featuredMedia"
            label="Post"
            :transition-key="mediaTransitionKey"
            transition-role="source"
          />
        </div>

        <div class="panel">
          <div
            class="panel-header"
            :class="{
              'is-transition-hidden': isTitleTransitioning,
            }"
            :data-featured-meta-source="mediaTransitionKey"
          >
            <span class="sys-label" aria-hidden="true">WRITING</span>
            <span v-if="postDate" class="date">{{ postDate }}</span>
          </div>
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
    background: var(--color-ink);
    overflow: hidden;
    position: relative;
  }

  .post-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--color-amber);
    z-index: 2;
    transition: background 250ms ease;
  }

  .post-card:hover::before {
    background: var(--color-amber-warm);
  }

  .link {
    display: flex;
    flex-direction: column;
    color: inherit;
    text-decoration: none;
  }

  .media-region {
    height: 220px;
    overflow: hidden;
    position: relative;
    background: rgba(255, 255, 255, 0.04);
  }

  .media-region::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.1) 2px,
      rgba(0, 0, 0, 0.1) 3px
    );
    pointer-events: none;
    z-index: 2;
  }

  .media-region :deep(.featured-media-frame) {
    width: 100%;
    height: 100%;
  }

  .media-region :deep(.image),
  .media-region :deep(.placeholder) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: saturate(0.45) brightness(0.65);
    transition: filter 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .post-card:hover .media-region :deep(.image) {
    filter: saturate(0.75) brightness(0.85);
  }

  .panel {
    padding: var(--space-4) var(--space-5) var(--space-5);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: var(--space-3);
    border-bottom: 1px solid rgba(181, 104, 0, 0.22);
    margin-bottom: var(--space-4);
  }

  .sys-label {
    font-family: var(--font-mono);
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-amber);
  }

  .date {
    font-family: var(--font-mono);
    font-size: 0.58rem;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.3);
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .post-card h3 {
    color: rgba(255, 255, 255, 0.9);
    font-family: var(--font-mono);
    font-size: clamp(1.15rem, 2.2vw, 1.85rem);
    font-style: italic;
    line-height: 1.08;
    letter-spacing: -0.04em;
    transition: color 200ms ease;
  }

  .post-card:hover h3 {
    color: white;
  }

  .post-card h3 span {
    background: none;
    box-shadow: none;
  }

  .excerpt {
    margin-top: var(--space-3);
    font-size: 0.72rem;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.3);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @media (prefers-reduced-motion: reduce) {
    .media-region :deep(.image),
    .post-card h3,
    .post-card::before {
      transition: none;
    }
  }
</style>
