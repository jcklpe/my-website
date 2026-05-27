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
    padding: var(--space-8) 0 0;
    overflow: hidden;
    background: var(--color-black);
  }

  .section-heading {
    margin: 0 var(--space-6) var(--space-7);
    max-width: 52rem;
    color: var(--color-surface);
  }

  .kicker {
    width: fit-content;
    margin-bottom: var(--space-4);
    padding: 0.1em 0.35em;
    background: var(--color-notice);
    color: var(--color-black);
    font-size: var(--type-base);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .title {
    max-width: 14ch;
    width: fit-content;
    padding: 0.04em 0.2em 0.12em;
    background: var(--color-black);
    box-shadow: var(--shadow-label);
    color: var(--color-surface);
    font-family: var(--font-display);
    font-size: clamp(4rem, 12vw, 9rem);
    line-height: 0.9;
    letter-spacing: 0;
  }

  .description {
    width: fit-content;
    margin-top: var(--space-5);
    margin-left: var(--space-6);
    padding: 0.25em 0.55em;
    background: var(--color-black);
    box-shadow:
      3em 0 0 var(--color-black),
      -0.5em 0 0 var(--color-black),
      0 4px 0 var(--color-primary);
    color: var(--color-surface);
    font-family: var(--font-lite);
    font-size: 1.25rem;
  }

  .archive-actions {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
    margin-top: calc(var(--space-7) + 5vw);
    padding-bottom: var(--space-8);
  }

  .load-more {
    min-width: min(100%, 12rem);
    border: 0;
    padding: 0.8em 1.1em;
    background: var(--color-primary);
    color: var(--color-surface);
    cursor: pointer;
    font: inherit;
    font-weight: 700;
    transition:
      transform 180ms var(--motion-snappy),
      opacity 180ms var(--motion-snappy);
  }

  .load-more:hover:not(:disabled) {
    transform: translateY(-2px);
    background: var(--color-notice);
    color: var(--color-black);
  }

  .load-more:disabled {
    cursor: wait;
    opacity: 0.68;
  }

  .load-more-error {
    color: var(--color-notice);
    font-size: var(--type-small);
  }

  @include breakpoint(phone) {
    .archive {
      padding-inline: 0;
    }

    .section-heading {
      margin-inline: var(--space-4);
    }

    .description {
      margin-left: var(--space-3);
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
