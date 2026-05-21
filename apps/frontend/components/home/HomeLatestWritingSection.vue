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
    background:
      linear-gradient(90deg, transparent 0 58%, var(--color-pop-yellow) 58%),
      var(--color-pop-cream);
    border-top: var(--border-strong);
  }

  .latest-writing-section::before {
    content: '';
    display: block;
    width: 7rem;
    height: 1.1rem;
    margin-bottom: var(--space-7);
    margin-inline: var(--space-6);
    background: var(--color-pop-aqua);
    border: var(--border-default);
    box-shadow: 0.35rem 0.35rem 0 var(--color-pop-pink);
  }

  .section-label {
    position: relative;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
    text-align: left;
  }

  .kicker {
    display: inline-block;
    margin-bottom: var(--space-4);
    padding: 0.35rem 0.55rem;
    border: var(--border-default);
    background: var(--color-pop-coral);
    color: var(--color-ink);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .label-rail {
    display: block;
    font-size: 4.25rem;
    line-height: 1;
  }

  .title {
    flex: 0 0 auto;
    max-width: min(16ch, 70vw);
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-sans);
    font-size: 1em;
    font-weight: 700;
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
    color: var(--color-primary);
    font-size: var(--type-large);
    font-style: normal;
    font-weight: 700;
    text-decoration: none;
    border: var(--border-default);
    padding: 0.75rem 1rem;
    background: var(--color-pop-cream);
    box-shadow: 0.35rem 0.35rem 0 var(--color-pop-aqua);
    transition:
      transform 200ms var(--motion-snappy),
      box-shadow 200ms var(--motion-snappy);
  }

  .more-link:hover,
  .more-link:focus-visible {
    box-shadow: 0.55rem 0.55rem 0 var(--color-pop-pink);
    transform: translate(-0.12rem, -0.12rem);
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
      font-size: 2.9rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .more-link {
      transition: none;
    }

    .more-link:hover,
    .more-link:focus-visible {
      transform: none;
    }
  }
</style>
