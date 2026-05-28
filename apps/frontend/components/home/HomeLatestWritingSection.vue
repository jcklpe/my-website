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
      <p class="kicker">Filed under</p>
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
    padding: var(--space-8) var(--space-4);
    background: var(--color-surface);
    color: var(--color-ink);
  }

  .latest-writing-section::before {
    content: none;
  }

  .latest-writing-section::after {
    content: '';
    display: block;
    position: absolute;
    top: var(--space-8);
    left: var(--space-4);
    width: min(34vw, 24rem);
    height: 0.75rem;
    background: var(--color-ink);
  }

  .section-label {
    position: relative;
    margin-bottom: var(--space-7);
    text-align: left;
  }

  .kicker {
    margin: 0 0 var(--space-2);
    color: var(--color-muted);
    font-size: var(--type-small);
    text-transform: uppercase;
    text-align: right;
  }

  .label-rail {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: var(--space-4);
  }

  .title {
    flex: 0 0 auto;
    max-width: min(12ch, 80vw);
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-display);
    font-size: clamp(6rem, 17vw, 16rem);
    font-weight: 400;
    line-height: 0.75;
    text-transform: uppercase;
  }

  .latest-writing-section :deep(.post-list) {
    position: relative;
    z-index: 1;
  }

  .more-link {
    display: inline-flex;
    margin-top: var(--space-6);
    color: var(--color-primary);
    font-size: var(--type-base);
    font-style: italic;
    text-transform: uppercase;
    text-decoration: none;
    background-image: linear-gradient(currentColor, currentColor);
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
      padding-inline: var(--space-4);
    }

    .latest-writing-section::after {
      left: var(--space-4);
      width: 32vw;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .more-link {
      transition: none;
    }
  }
</style>
