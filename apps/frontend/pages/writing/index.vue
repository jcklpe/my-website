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
    min-height: 65vh;
    padding: var(--space-8) var(--space-6) var(--space-9);
    background: var(--color-paper);
    color: var(--color-ink);
  }

  .section-heading {
    display: grid;
    grid-template-columns: minmax(0, 0.72fr) minmax(16rem, 0.28fr);
    gap: var(--space-5);
    align-items: end;
    max-width: min(74rem, 100%);
    margin: 0 auto var(--space-7);
    padding-bottom: var(--space-5);
    border-bottom: 2px solid var(--color-ink);
  }

  .kicker {
    grid-column: 1 / -1;
    margin: 0;
    color: var(--color-primary-heavy);
    font-family: var(--font-sans);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 800;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .title {
    max-width: 6ch;
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(6rem, 18vw, 15rem);
    font-weight: 400;
    line-height: 0.82;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .description {
    max-width: 18rem;
    margin: 0 0 var(--space-2);
    color: var(--color-muted);
    font-family: var(--font-serif);
    font-size: clamp(1.4rem, 2.6vw, 2.2rem);
    line-height: 1.05;
  }

  .archive-actions {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
    margin-top: var(--space-7);
  }

  .load-more {
    min-width: min(100%, 12rem);
    border: 2px solid var(--color-ink);
    padding: 0.8em 1.1em;
    background: var(--color-ink);
    color: var(--color-paper);
    cursor: pointer;
    font: inherit;
    font-family: var(--font-sans);
    font-weight: 800;
    letter-spacing: 0;
    text-transform: uppercase;
    box-shadow: 0.35rem 0.35rem 0 var(--color-primary-heavy);
    transition:
      transform 180ms var(--motion-snappy),
      box-shadow 180ms var(--motion-snappy);
  }

  .load-more:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0.5rem 0.5rem 0 var(--color-primary-heavy);
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

  @include breakpoint(tablet-down) {
    .section-heading {
      grid-template-columns: 1fr;
      gap: var(--space-3);
    }

    .description {
      max-width: 30rem;
    }
  }

  @include breakpoint(phone) {
    .archive {
      padding-inline: var(--space-4);
    }

    .title {
      font-size: clamp(5rem, 25vw, 8rem);
    }
  }
</style>
