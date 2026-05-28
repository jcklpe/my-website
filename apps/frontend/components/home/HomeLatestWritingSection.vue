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
      <p class="kicker">From the garden ✷ notes & essays</p>
      <div class="label-rail">
        <h2 class="title">Latest writing</h2>
      </div>
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
    padding: var(--space-10) 0 var(--space-9);
    margin-inline: calc(var(--space-6) * -1);
    background: var(--color-surface);
    color: var(--color-ink);
  }

  .section-label {
    position: relative;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-8);
    text-align: left;
  }

  .kicker {
    margin-bottom: var(--space-4);
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .label-rail {
    display: block;
    line-height: 0.9;
  }

  .title {
    max-width: 14ch;
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-display);
    font-size: clamp(2.75rem, 8vw, 7rem);
    font-weight: 400;
    line-height: 0.9;
    letter-spacing: -0.03em;
  }

  .latest-writing-section :deep(.post-list) {
    padding-inline: var(--space-6);
  }

  .more-link {
    display: inline-flex;
    margin-top: var(--space-7);
    margin-inline: var(--space-6);
    color: var(--color-ink);
    font-family: var(--font-serif);
    font-size: var(--type-large);
    font-style: italic;
    text-decoration: none;
    background-image: linear-gradient(var(--color-ink), var(--color-ink));
    background-position: 0% 100%;
    background-repeat: no-repeat;
    background-size: 0% 1px;
    transition: background-size 200ms var(--motion-snappy);
  }

  .more-link:hover,
  .more-link:focus-visible {
    background-size: 100% 1px;
  }

  @include breakpoint(phone) {
    .latest-writing-section {
      margin-inline: calc(var(--space-4) * -1);
      padding-block: var(--space-9) var(--space-8);
    }

    .section-label {
      margin-inline: var(--space-4);
    }

    .latest-writing-section :deep(.post-list) {
      padding-inline: var(--space-4);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .more-link {
      transition: none;
    }
  }
</style>
