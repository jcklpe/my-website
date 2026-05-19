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
      <p class="kicker">Archive</p>
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
  }

  .section-heading {
    margin-bottom: var(--space-7);
    max-width: 44rem;
  }

  .kicker {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin: 0 0 var(--space-4);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;

    &::before {
      content: '';
      display: block;
      width: 2rem;
      height: 1px;
      background: currentColor;
    }
  }

  .title {
    max-width: 14ch;
    margin: 0;
    font-family: var(--font-mono);
    font-style: normal;
    font-weight: 600;
    font-size: clamp(2.5rem, 5vw, 4rem);
    line-height: 0.98;
    letter-spacing: -0.025em;
  }

  .description {
    margin-top: var(--space-4);
    color: var(--color-muted);
    font-size: var(--type-base);
    line-height: 1.55;
  }

  .archive-actions {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
    margin-top: var(--space-7);
  }

  .load-more {
    min-width: min(100%, 14rem);
    padding: 0.7em 1.4em;
    background: transparent;
    color: var(--color-primary);
    cursor: pointer;
    border: 1px solid var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition:
      background 160ms var(--motion-snappy),
      color 160ms var(--motion-snappy),
      opacity 160ms var(--motion-snappy);
  }

  .load-more:hover:not(:disabled),
  .load-more:focus-visible:not(:disabled) {
    background: var(--color-primary);
    color: var(--color-surface);
  }

  .load-more:disabled {
    cursor: wait;
    opacity: 0.5;
  }

  .load-more-error {
    color: var(--color-primary);
    font-size: var(--type-small);
  }

  @media (prefers-reduced-motion: reduce) {
    .load-more {
      transition: none;
    }
  }
</style>
