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
    <div class="section-header">
      <div class="section-header-left">
        <span class="section-index" aria-hidden="true">04</span>
        <h2 class="title">Latest Writing</h2>
      </div>
      <span class="section-marker" aria-hidden="true">+</span>
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
        → View writing archive
      </NuxtLink>
    </template>

    <EmptyState v-else message="No posts yet." />
  </section>
</template>

<style lang="scss" scoped>
  .latest-writing-section {
    position: relative;
    scroll-margin-top: var(--space-8);
    padding-bottom: var(--space-8);
    margin-inline: calc(var(--space-6) * -1);
    margin-top: var(--space-7);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) var(--space-6);
    margin-bottom: var(--space-7);
    background: var(--color-primary);
    color: var(--color-surface);
  }

  .section-header-left {
    display: flex;
    align-items: baseline;
    gap: var(--space-4);
  }

  .section-index {
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.1em;
    opacity: 0.6;
  }

  .title {
    margin: 0;
    color: var(--color-surface);
    font-family: var(--font-mono);
    font-size: clamp(1.1rem, 2.2vw, 1.6rem);
    font-style: normal;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1;
  }

  .section-marker {
    font-family: var(--font-mono);
    font-size: 1.5rem;
    font-weight: 400;
    opacity: 0.5;
  }

  .latest-writing-section :deep(.post-list) {
    padding-inline: var(--space-6);
  }

  .more-link {
    display: inline-flex;
    margin-top: var(--space-6);
    margin-inline: var(--space-6);
    font-family: var(--font-mono);
    font-size: var(--type-base);
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--color-primary);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 160ms var(--motion-snappy);
  }

  .more-link:hover,
  .more-link:focus-visible {
    border-bottom-color: var(--color-primary);
  }

  @include breakpoint(phone) {
    .latest-writing-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-header {
      padding-inline: var(--space-4);
    }

    .latest-writing-section :deep(.post-list) {
      padding-inline: var(--space-4);
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
