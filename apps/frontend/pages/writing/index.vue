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
    padding: var(--space-8) 0;
  }

  .section-heading {
    margin: 0 20vw var(--space-6);
    max-width: 42rem;
  }

  .kicker {
    margin-bottom: var(--space-3);
    color: var(--color-muted);
    font-size: var(--type-base);
    font-style: normal;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .title {
    max-width: 14ch;
    font-size: 4rem;
    line-height: 1.1;
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
    border: 0;
    padding: 15px 40px;
    background: linear-gradient(
      45deg,
      var(--color-primary) 29%,
      var(--color-primary) 100%
    );
    color: white;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
    transition:
      background 1s var(--motion-snappy),
      transform 180ms var(--motion-snappy);
  }

  .load-more:hover:not(:disabled) {
    background: linear-gradient(
      45deg,
      var(--color-primary) 29%,
      var(--color-accent) 100%
    );
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
