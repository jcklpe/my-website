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
    <header class="section-header">
      <p class="section-eyebrow">Journal</p>
      <h2 class="section-title">Articles</h2>
    </header>

    <EmptyState v-if="error" message="Error: Posts could not be loaded." />

    <template v-else-if="posts?.length">
      <PostList :posts="posts" />

      <div class="archive-footer">
        <NuxtLink
          class="more-link"
          to="/writing"
          @focus="prefetchInitialArchivePage"
          @pointerdown="prefetchInitialArchivePage"
          @pointerenter="prefetchInitialArchivePage"
        >
          View all articles →
        </NuxtLink>
      </div>
    </template>

    <EmptyState v-else message="No posts yet." />
  </section>
</template>

<style lang="scss" scoped>
  .latest-writing-section {
    position: relative;
    scroll-margin-top: var(--space-8);
    margin-inline: calc(var(--space-6) * -1);
  }

  .section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: var(--space-6) var(--space-6) var(--space-5);
    border-top: var(--border-default);
    border-bottom: var(--border-default);
  }

  .section-eyebrow {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .section-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 5vw, 5rem);
    line-height: 0.92;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--color-ink);
  }

  .latest-writing-section :deep(.post-list) {
    padding-inline: var(--space-6);
  }

  .archive-footer {
    padding: var(--space-5) var(--space-6);
    border-top: var(--border-default);
  }

  .more-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.14em;
    text-decoration: none;
    text-transform: uppercase;
    transition: color 200ms var(--motion-snappy);
  }

  .more-link:hover,
  .more-link:focus-visible {
    color: var(--color-primary);
  }

  @include breakpoint(phone) {
    .latest-writing-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-header {
      flex-direction: column;
      gap: var(--space-2);
      padding-inline: var(--space-4);
    }

    .section-title {
      font-size: clamp(2.5rem, 14vw, 4rem);
    }

    .latest-writing-section :deep(.post-list) {
      padding-inline: var(--space-4);
    }

    .archive-footer {
      padding-inline: var(--space-4);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .more-link {
      transition: none;
    }
  }
</style>
