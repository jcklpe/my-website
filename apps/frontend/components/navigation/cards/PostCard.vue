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
  // A writing specimen mounted on the plate: soft luminous bloom at rest, an
  // iridescent aura on hover/focus, fine annotation along the top edge.
  .post-card {
    position: relative;
    overflow: hidden;
    border: var(--border-subtle);
    border-radius: 6px;
    background: var(--color-surface-soft);
    box-shadow: var(--glow-halo-soft);
    transition:
      transform 240ms var(--motion-snappy),
      box-shadow 240ms var(--motion-snappy),
      border-color 240ms var(--motion-snappy);
  }

  .post-card:hover,
  .post-card:focus-within {
    border-color: var(--color-primary-tint);
    box-shadow: var(--glow-halo-iris);
    transform: translateY(-4px);
  }

  .link {
    display: block;
    color: inherit;
    text-decoration: none;
  }

  .body {
    position: relative;
    padding: var(--space-5);
  }

  // Iridescent hairline separating the specimen plate label from the body.
  .body::before {
    content: '';
    position: absolute;
    inset-inline: var(--space-5);
    top: 0;
    height: 2px;
    background-image: var(--gradient-iris);
    border-radius: 2px;
    opacity: 0.55;
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
    color: var(--color-ink);
    font-family: var(--font-display);
    font-variation-settings: var(--type-heading-variation);
    font-weight: 500;
    font-size: clamp(1.3rem, 2vw, 1.9rem);
    line-height: 1.1;
    letter-spacing: -0.015em;
    text-wrap: balance;
  }

  .post-card h3 span {
    display: inline;
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
