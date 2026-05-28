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
  }

  .latest-writing-section::before {
    content: '';
    display: block;
    width: 3rem;
    height: 1px;
    margin-bottom: var(--space-7);
    background: var(--color-ink-08);
  }

  .section-label {
    position: relative;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
    text-align: left;
  }

  .kicker {
    margin-bottom: var(--space-6);
    color: var(--color-muted);
    font-size: var(--type-small);
    font-style: normal;
    font-family: var(--font-condensed);
    font-weight: 600;
    letter-spacing: 0.18em;
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
    font-family: var(--font-display);
    font-size: 1em;
    font-style: normal;
    font-weight: 400;
    line-height: inherit;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .latest-writing-section :deep(.post-list) {
    padding-inline: var(--space-6);
  }

  .more-link {
    display: inline-flex;
    margin-top: var(--space-6);
    margin-inline: var(--space-6);
    color: var(--color-ink-80);
    font-size: var(--type-base);
    font-family: var(--font-condensed);
    font-weight: 600;
    font-style: normal;
    letter-spacing: 0.12em;
    text-decoration: none;
    text-transform: uppercase;
    border-bottom: 1px solid var(--color-ink-30);
    transition:
      color 200ms var(--motion-snappy),
      border-color 200ms var(--motion-snappy);
  }

  .more-link:hover,
  .more-link:focus-visible {
    color: var(--color-ink);
    border-color: var(--color-ink-80);
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
