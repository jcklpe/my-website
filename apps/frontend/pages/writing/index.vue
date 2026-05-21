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
    background:
      linear-gradient(90deg, var(--color-pop-yellow) 0 18%, transparent 18%),
      var(--color-pop-cream);
  }

  .section-heading {
    margin-bottom: var(--space-6);
    max-width: 42rem;
    border: var(--border-default);
    padding: var(--space-5);
    background: var(--color-pop-cream);
    box-shadow: 0.55rem 0.55rem 0 var(--color-pop-aqua);
  }

  .kicker {
    margin-bottom: var(--space-3);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: var(--type-base);
    font-style: normal;
    font-weight: 600;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .title {
    max-width: 14ch;
    font-size: 3rem;
    font-weight: 700;
    line-height: 0.98;
    text-transform: uppercase;
  }

  .description {
    margin-top: var(--space-3);
    color: var(--color-ink-80);
    font-weight: 600;
  }

  .archive-actions {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
    margin-top: var(--space-7);
  }

  .load-more {
    min-width: min(100%, 12rem);
    border: var(--border-default);
    padding: 0.8em 1.1em;
    background: var(--color-pop-yellow);
    box-shadow: 0.35rem 0.35rem 0 var(--color-pop-coral);
    color: var(--color-ink);
    cursor: pointer;
    font: inherit;
    font-weight: 700;
    transition:
      transform 180ms var(--motion-snappy),
      opacity 180ms var(--motion-snappy);
  }

  .load-more:hover:not(:disabled) {
    transform: translate(-0.1rem, -0.1rem);
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

    .title {
      font-size: 2.25rem;
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
