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
    min-height: 70vh;
    padding: var(--space-8) var(--space-6) var(--space-9);
    background: var(--color-stage);
    color: var(--color-stage-ink);
  }

  .section-heading {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(12rem, 0.35fr);
    gap: var(--space-6);
    align-items: end;
    margin-bottom: var(--space-7);
    padding-bottom: var(--space-5);
    border-bottom: 1px solid var(--color-stage-rule);
  }

  .kicker {
    grid-column: 2;
    margin: 0;
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-base);
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .title {
    grid-column: 1;
    grid-row: 1 / span 2;
    max-width: 14ch;
    color: var(--color-stage-ink);
    font-family: var(--font-mono);
    font-size: 5.75rem;
    line-height: 0.9;
    text-transform: uppercase;
  }

  .description {
    grid-column: 2;
    margin: 0;
    color: var(--color-stage-muted);
    line-height: 1.5;
  }

  .archive-actions {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
    margin-top: var(--space-7);
  }

  .load-more {
    min-width: min(100%, 12rem);
    border: 1px solid var(--color-ink);
    padding: 0.8em 1.1em;
    background: var(--color-primary);
    color: white;
    cursor: pointer;
    font: inherit;
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

  @include breakpoint(phone) {
    .archive {
      padding-inline: var(--space-4);
    }

    .section-heading {
      grid-template-columns: 1fr;
      gap: var(--space-3);
    }

    .kicker,
    .title,
    .description {
      grid-column: 1;
      grid-row: auto;
    }

    .title {
      font-size: 3.25rem;
    }
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
