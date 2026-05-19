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
    <header class="section-banner">
      <h2 class="title">Latest writing</h2>
      <span class="title-shape" aria-hidden="true" />
    </header>

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
        All writing <span aria-hidden="true">→</span>
      </NuxtLink>
    </template>

    <EmptyState v-else message="No posts yet." />
  </section>
</template>

<style lang="scss" scoped>
  // Latest Writing section title is full-width with a periwinkle panel-header
  // treatment and a complementary right-side shape — pulled from blue1.2 but
  // sitting full-width across the section, not as a card itself. The bento
  // grid layout itself is deferred to a follow-up spike; this pass uses the
  // existing PostList layout.
  .latest-writing-section {
    position: relative;
    scroll-margin-top: var(--space-8);
    margin-inline: calc(var(--space-6) * -1);
    padding-bottom: var(--space-8);
    border-top: 1px solid var(--color-primary);
  }

  .section-banner {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-7);
    padding: var(--space-3) var(--space-6);
    background: var(--color-primary);
    color: var(--color-surface);
  }

  .title {
    flex: 0 0 auto;
    margin: 0;
    font-family: var(--font-mono);
    font-style: normal;
    font-weight: 600;
    font-size: var(--type-base);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .title-shape {
    flex: 1;
    height: 0.65rem;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.32) 0%,
      rgba(255, 255, 255, 0.05) 60%,
      transparent 100%
    );
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
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-primary);
    text-decoration: none;
    transition: color 160ms var(--motion-snappy);
  }

  .more-link:hover,
  .more-link:focus-visible {
    color: var(--color-primary-heavy);
  }

  @include breakpoint(phone) {
    .latest-writing-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-banner {
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
