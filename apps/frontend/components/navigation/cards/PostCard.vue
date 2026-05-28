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
  .post-card {
    height: 100%;
    border: 1px solid var(--color-stage-rule);
    background: var(--color-stage);
    color: var(--color-stage-ink);
    box-shadow: 0 22px 58px rgba(0, 0, 0, 0.24);
    transition:
      transform 240ms var(--motion-snappy),
      box-shadow 240ms var(--motion-snappy),
      border-color 240ms var(--motion-snappy);
  }

  .post-card:hover {
    border-color: var(--color-primary);
    box-shadow: 0 28px 72px rgba(0, 0, 0, 0.34);
    transform: translateY(-4px);
  }

  .link {
    display: grid;
    grid-template-rows: auto 1fr;
    min-height: 100%;
    color: inherit;
    text-decoration: none;
  }

  .post-card :deep(.featured-media-frame) {
    border-bottom: 1px solid var(--color-stage-rule);
  }

  .body {
    display: flex;
    flex-direction: column;
    padding: var(--space-5);
  }

  .meta {
    display: block;
    margin-bottom: var(--space-3);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .post-card h3 {
    color: var(--color-stage-ink);
    font-family: var(--font-mono);
    font-size: 1.55rem;
    line-height: 1.12;
    text-wrap: balance;
  }

  .post-card h3 span {
    display: inline;
  }

  .excerpt {
    position: relative;
    z-index: 901;
    margin-top: var(--space-3);
    color: var(--color-stage-muted);
    line-height: 1.55;
  }

  @media (prefers-reduced-motion: reduce) {
    .post-card {
      transition: none;
    }

    .post-card:hover {
      transform: none;
    }
  }

  @include breakpoint(phone) {
    .post-card h3 {
      font-size: 1.35rem;
    }
  }
</style>
