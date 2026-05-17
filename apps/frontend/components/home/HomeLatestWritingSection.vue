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
    padding: var(--space-8) 0;
    margin-inline: calc(var(--space-6) * -1);
    border-top: var(--border-strong);
    background:
      radial-gradient(var(--color-primary-tint) 1px, transparent 1px),
      var(--color-surface-warmer);
    background-size:
      0.75rem 0.75rem,
      auto;
  }

  .latest-writing-section::before {
    content: '';
    display: block;
    width: 100%;
    height: 0.75rem;
    margin-bottom: var(--space-7);
    background: repeating-linear-gradient(
      90deg,
      var(--color-ink) 0 0.55rem,
      transparent 0.55rem 1.1rem
    );
  }

  .section-label {
    position: relative;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
    text-align: left;
  }

  .kicker {
    margin-bottom: var(--space-6);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .label-rail {
    display: block;
    font-size: clamp(2rem, 4vw, 3.5rem);
    line-height: 1;
  }

  .title {
    flex: 0 0 auto;
    max-width: min(16ch, 70vw);
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: 1em;
    line-height: inherit;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .latest-writing-section :deep(.post-list) {
    padding-inline: var(--space-6);
  }

  .more-link {
    display: inline-flex;
    margin-top: var(--space-6);
    margin-inline: var(--space-6);
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-primary);
    background: var(--color-surface);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    background-image: linear-gradient(var(--color-primary), var(--color-primary));
    background-position: 0% 100%;
    background-repeat: no-repeat;
    background-size: 0% 100%;
    transition: background-size 200ms var(--motion-snappy);
  }

  .more-link:hover,
  .more-link:focus-visible {
    background-size: 100% 100%;
    color: var(--color-surface);
  }

  @include breakpoint(phone) {
    .latest-writing-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .latest-writing-section::before,
    .section-label {
      margin-inline: var(--space-4);
    }

    .latest-writing-section :deep(.post-list) {
      padding-inline: var(--space-4);
    }

    .label-rail {
      font-size: clamp(3rem, 18vw, 5rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .more-link {
      transition: none;
    }
  }
</style>
