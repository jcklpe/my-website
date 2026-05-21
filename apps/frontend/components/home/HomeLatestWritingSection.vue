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
        <span class="label-circle" aria-hidden="true" />
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
    background: var(--color-surface);
  }

  .latest-writing-section::before {
    content: '';
    display: block;
    width: 2.5rem;
    height: 2px;
    margin-bottom: var(--space-7);
    margin-inline: var(--space-6);
    background: var(--color-accent);
  }

  .section-label {
    position: relative;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
    text-align: left;
  }

  .kicker {
    margin-bottom: var(--space-5);
    color: var(--color-muted);
    font-family: var(--font-sans);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }

  .label-rail {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--space-4);
    font-size: clamp(2.4rem, 5vw, 4.5rem);
    line-height: 1;
  }

  .label-circle {
    display: block;
    flex-shrink: 0;
    width: 0.7em;
    height: 0.7em;
    border-radius: 50%;
    border: 1.5px solid var(--color-accent);
    opacity: 0.65;
  }

  .title {
    flex: 0 0 auto;
    max-width: min(20ch, 80vw);
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-display);
    font-size: 1em;
    font-style: normal;
    font-weight: 500;
    line-height: inherit;
    letter-spacing: 0.01em;
  }

  .latest-writing-section :deep(.post-list) {
    padding-inline: var(--space-6);
  }

  .more-link {
    display: inline-flex;
    margin-top: var(--space-6);
    margin-inline: var(--space-6);
    color: var(--color-accent);
    font-family: var(--font-sans);
    font-size: var(--type-base);
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    text-decoration: none;
    background-image: linear-gradient(var(--color-accent), var(--color-accent));
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
