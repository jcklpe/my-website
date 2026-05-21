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
    padding: var(--space-8) var(--space-6);
    background: var(--texture-paper-grid);
  }

  .section-heading {
    margin-bottom: var(--space-6);
    max-width: 42rem;
    border-bottom: var(--border-default);
    padding-bottom: var(--space-5);
  }

  .kicker {
    margin-bottom: var(--space-3);
    color: var(--color-primary-heavy);
    font-family: var(--font-mono);
    font-size: var(--type-base);
    font-weight: 600;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .title {
    max-width: 14ch;
    font-family: var(--font-serif);
    font-size: 3rem;
    line-height: 1.1;
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
    border: 1px solid var(--color-primary-heavy);
    padding: 0.8em 1.1em;
    background: var(--color-primary-heavy);
    color: var(--color-surface);
    cursor: pointer;
    font: inherit;
    font-family: var(--font-mono);
    font-weight: 700;
    transition:
      transform 180ms var(--motion-snappy),
      opacity 180ms var(--motion-snappy);
  }

  .load-more:hover:not(:disabled) {
    transform: translateY(-2px);
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
