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
      <p class="kicker">Archive</p>
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
      linear-gradient(
        180deg,
        var(--color-surface) 0%,
        var(--color-surface-blueprint) 100%
      );
  }

  .latest-writing-section::before {
    content: '';
    display: block;
    width: 100%;
    height: 0.45rem;
    margin-bottom: var(--space-7);
    background: var(--color-signal);
  }

  .section-label {
    position: relative;
    min-height: 12rem;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
    display: grid;
    align-content: end;
    text-align: left;
  }

  .section-label::after {
    content: '';
    position: absolute;
    inset: auto var(--space-4) 0 auto;
    width: min(24vw, 13rem);
    aspect-ratio: 1;
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
  }

  .kicker {
    margin-bottom: var(--space-6);
    color: var(--color-signal-heavy);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 700;
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
    letter-spacing: -0.035em;
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
    border: var(--border-window);
    color: var(--color-ink);
    font-size: var(--type-large);
    font-style: italic;
    text-decoration: none;
    background: var(--color-surface-soft);
    box-shadow: var(--shadow-hard-low);
    transition:
      color 200ms var(--motion-snappy),
      transform 200ms var(--motion-snappy),
      box-shadow 200ms var(--motion-snappy);
  }

  .more-link:hover,
  .more-link:focus-visible {
    color: var(--color-signal-heavy);
    box-shadow: var(--shadow-hard-mid);
    transform: translate(-0.14rem, -0.14rem);
  }

  @include breakpoint(phone) {
    .latest-writing-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .latest-writing-section::before,
    .section-label {
      margin-inline: var(--space-4);
    }

    .section-label::after {
      width: 9rem;
      opacity: 0.5;
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

    .more-link:hover,
    .more-link:focus-visible {
      transform: none;
    }
  }
</style>
