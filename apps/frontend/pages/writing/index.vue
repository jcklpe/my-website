<script setup lang="ts">
  const { data: writingSeoDescription } = await useAsyncData(
    'writing-seo-description',
    () => queryPageSeoDescription('/writing'),
  );

  useSiteSeoMeta({
    title: 'Writing',
    description: () =>
      writingSeoDescription.value ??
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  });

  const {
    ensurePostIsVisible,
    hydrateArchive,
    isLoadingMore,
    loadMoreError,
    loadMorePosts,
    pageInfo,
    posts,
    queryInitialArchivePage,
  } = useWritingArchive();
  const { data: initialPostsPage } = await useAsyncData('writing-archive', () =>
    queryInitialArchivePage(),
  );

  hydrateArchive(initialPostsPage.value);

  const transitionState = useFeaturedMediaTransitionState();
  const transitionKey = transitionState.value.key;
  const transitionPostSlug =
    transitionState.value.active && transitionKey?.startsWith('post-')
      ? transitionKey.slice('post-'.length)
      : '';

  await ensurePostIsVisible(transitionPostSlug);
</script>

<template>
  <section class="archive">
    <div class="section-heading">
      <p class="kicker">Filed under</p>
      <h1 class="title">Writing</h1>
      <p class="description">Articles about all kinds of odds and ends.</p>
    </div>
    <PostList v-if="posts.length" :posts="posts" />
    <EmptyState v-else message="No posts yet." />

    <div v-if="posts.length" class="archive-actions">
      <p v-if="loadMoreError" class="load-more-error">
        {{ loadMoreError }}
      </p>
      <button
        v-if="pageInfo.hasNextPage"
        class="load-more"
        type="button"
        :disabled="isLoadingMore"
        @click="loadMorePosts"
      >
        {{ isLoadingMore ? 'Loading...' : 'Load more' }}
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .archive {
    padding: var(--space-8) var(--space-6) var(--space-9);
    background:
      linear-gradient(var(--color-ink-025) 1px, transparent 1px),
      var(--color-surface);
    background-size:
      100% 36px,
      auto;
  }

  .section-heading {
    position: relative;
    margin-bottom: var(--space-6);
    max-width: 42rem;
    padding-top: var(--space-5);
    border-top: 1px solid var(--color-slip-border);
  }

  .kicker {
    margin-bottom: var(--space-3);
    color: var(--color-muted);
    font-size: var(--type-base);
    font-style: italic;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .title {
    max-width: 14ch;
    font-family: var(--font-display);
    font-size: clamp(3rem, 8vw, 6rem);
    line-height: 0.86;
    letter-spacing: 0;
  }

  .description {
    margin-top: var(--space-3);
    color: var(--color-muted);
  }

  .archive-actions {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
    margin-top: var(--space-7);
  }

  .load-more {
    min-width: min(100%, 12rem);
    @include button-solid;
  }

  .load-more:hover:not(:disabled) {
    @include button-solid-hover;
  }

  .load-more:disabled {
    cursor: wait;
    opacity: 0.68;
  }

  .load-more-error {
    color: var(--color-primary);
    font-size: var(--type-small);
  }

  @media (prefers-reduced-motion: reduce) {
    .load-more {
      transition: none;
    }

    .load-more:hover:not(:disabled) {
      transform: none;
    }
  }
</style>
