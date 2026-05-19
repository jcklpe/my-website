<script setup lang="ts">
  import type { WordPressPost } from '~/types/wordpress';

  withDefaults(
    defineProps<{
      posts?: WordPressPost[] | null;
      error?: boolean;
    }>(),
    {
      posts: null,
      error: false,
    },
  );

  const { prefetchInitialArchivePage } = useWritingArchive();
</script>

<template>
  <section id="latest-writing" class="latest-writing-section">
    <div class="section-label">
      <h2 class="title">Latest writing</h2>
    </div>

    <EmptyState v-if="error" message="Error: Posts could not be loaded." />

    <template v-else-if="posts?.length">
      <PostList :posts="posts" />

      <NuxtLink
        class="more-link"
        to="/writing"
        @focus="prefetchInitialArchivePage"
        @pointerdown="prefetchInitialArchivePage"
        @pointerenter="prefetchInitialArchivePage"
      >
        View writing archive
      </NuxtLink>
    </template>

    <EmptyState v-else message="No posts yet." />
  </section>
</template>

<style lang="scss" scoped>
  .latest-writing-section {
    position: relative;
    scroll-margin-top: var(--space-8);
    padding: var(--space-8) 0;
    margin-inline: calc(var(--space-6) * -1);
  }

  .section-label {
    position: relative;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
    text-align: left;
  }

  .section-label::before {
    content: '';
    display: block;
    width: 4rem;
    height: 2px;
    margin-bottom: var(--space-4);
    background: var(--color-primary);
  }

  .title {
    max-width: min(16ch, 70vw);
    margin: 0;
    font-size: clamp(2rem, 4vw, 3.5rem);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-style: italic;
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .latest-writing-section :deep(.post-list) {
    padding-inline: var(--space-6);
  }

  .more-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-6);
    margin-inline: var(--space-6);
    padding: var(--space-2) var(--space-4);
    border: var(--border-signal);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-decoration: none;
    transition:
      background-color 200ms var(--motion-snappy),
      color 200ms var(--motion-snappy);
  }

  .more-link:hover,
  .more-link:focus-visible {
    background-color: var(--color-primary);
    color: white;
  }

  @include breakpoint(phone) {
    .latest-writing-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-label {
      margin-inline: var(--space-4);
    }

    .latest-writing-section :deep(.post-list) {
      padding-inline: var(--space-4);
    }

    .title {
      font-size: clamp(2.6rem, 14vw, 4.5rem);
    }

    .more-link {
      margin-inline: var(--space-4);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .more-link {
      transition: none;
    }
  }
</style>
