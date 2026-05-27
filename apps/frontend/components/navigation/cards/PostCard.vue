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
  @include caustic-keyframes;

  .post-card {
    position: relative;
    overflow: hidden;
    @include glass-pane;
    transition:
      transform 240ms var(--motion-snappy),
      box-shadow 240ms var(--motion-snappy),
      border-color 240ms var(--motion-snappy);
  }

  // Caustic light drifting across the glass, behind the content.
  .post-card::before {
    @include caustic-layer(0);
    transition: opacity 320ms var(--motion-snappy);
  }

  .post-card:hover {
    @include glass-pane-hover;
  }

  .post-card:hover::before,
  .post-card:focus-within::before {
    opacity: 0.85;
  }

  .link {
    position: relative;
    z-index: 1;
    display: block;
    color: inherit;
    text-decoration: none;
  }

  .body {
    padding: var(--space-5);
  }

  .meta {
    display: block;
    margin-bottom: var(--space-3);
    color: var(--color-muted);
    @include specimen-label;
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .post-card h3 {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(1.4rem, 2.3vw, 2.1rem);
    line-height: 1.5;
    letter-spacing: 0.01em;
    text-transform: uppercase;
    text-wrap: balance;
  }

  .post-card h3 span {
    @include marker-label;
  }

  .excerpt {
    position: relative;
    z-index: 901;
    margin-top: var(--space-3);
    color: var(--color-ink-80);
  }

  @media (prefers-reduced-motion: reduce) {
    .post-card {
      transition: none;
    }

    .post-card:hover {
      transform: none;
    }
  }
</style>
