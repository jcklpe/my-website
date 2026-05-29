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
    overflow: hidden;
    margin-bottom: var(--space-7);
    padding: var(--space-5) var(--space-6);
    border: var(--border-window);
    background: linear-gradient(
      90deg,
      var(--color-surface-soft) 0%,
      color-mix(in srgb, var(--color-surface-screen) 86%, transparent) 100%
    );
    box-shadow: var(--shadow-hard-low);
    text-align: left;
  }

  .section-label::after {
    content: '';
    position: absolute;
    inset: auto var(--space-5) var(--space-5) auto;
    width: min(18vw, 10rem);
    height: min(18vw, 10rem);
    border: var(--border-signal);
    border-radius: 50%;
    background:
      linear-gradient(
        90deg,
        transparent 49%,
        var(--color-signal-soft) 49% 51%,
        transparent 51%
      ),
      linear-gradient(
        transparent 49%,
        var(--color-signal-soft) 49% 51%,
        transparent 51%
      );
    pointer-events: none;
    opacity: 0.9;
  }

  .title {
    position: relative;
    z-index: 1;
    max-width: min(16ch, 70vw);
    margin: 0;
    font-size: clamp(2rem, 4vw, 3.5rem);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-style: italic;
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.03em;
    text-transform: uppercase;
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
      padding: var(--space-4);
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
