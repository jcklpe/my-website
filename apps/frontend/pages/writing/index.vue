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
    <header class="section-heading">
      <p class="eyebrow">Journal</p>
      <h1 class="title">Writing</h1>
    </header>
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
    padding: 0;
  }

  .archive :deep(.post-list) {
    padding-inline: var(--space-6);
  }

  .section-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: var(--space-6) var(--space-6) var(--space-5);
    border-bottom: var(--border-default);
    margin-bottom: 0;
  }

  .eyebrow {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 5vw, 5rem);
    line-height: 0.92;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--color-ink);
  }

  .description {
    display: none;
  }

  .archive-actions {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
    margin-top: var(--space-7);
    padding: 0 var(--space-6);
  }

  .load-more {
    min-width: min(100%, 12rem);
    border: 1px solid var(--color-ink);
    padding: 0.8em 1.1em;
    background: transparent;
    color: var(--color-ink);
    cursor: pointer;
    font: inherit;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    transition:
      background 180ms var(--motion-snappy),
      color 180ms var(--motion-snappy);
  }

  .load-more:hover:not(:disabled) {
    background: var(--color-ink);
    color: var(--color-surface);
  }

  .load-more:disabled {
    cursor: wait;
    opacity: 0.68;
  }

  .load-more-error {
    color: var(--color-primary);
    font-size: var(--type-small);
  }

  @include breakpoint(phone) {
    .section-heading {
      flex-direction: column;
      gap: var(--space-2);
      padding-inline: var(--space-4);
    }

    .title {
      font-size: clamp(2.5rem, 14vw, 4rem);
    }

    .archive :deep(.post-list) {
      padding-inline: var(--space-4);
    }

    .archive-actions {
      padding-inline: var(--space-4);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .load-more {
      transition: none;
    }
  }
</style>
