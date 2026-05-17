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
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--color-surface) 92%, transparent) 0%,
        color-mix(in srgb, var(--color-surface-screen) 84%, transparent) 100%
      );
  }

  .latest-writing-section::before {
    content: 'Writing feed / recent logs';
    display: block;
    width: fit-content;
    margin: 0 var(--space-6) var(--space-6);
    padding: var(--space-2) var(--space-3);
    border: var(--border-panel);
    background: var(--color-surface-soft);
    color: var(--color-signal-heavy);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .section-label {
    position: relative;
    display: grid;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
    padding: var(--space-5);
    border: var(--border-window);
    background:
      linear-gradient(
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
  }

  .kicker {
    margin-bottom: var(--space-6);
    color: var(--color-signal-heavy);
    font-size: var(--type-small);
    font-family: var(--font-mono);
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
    letter-spacing: -0.075em;
    text-transform: uppercase;
  }

  .latest-writing-section :deep(.post-list) {
    padding-inline: var(--space-6);
  }

  .latest-writing-section :deep(.post-card) {
    border: var(--border-window);
    background: var(--color-surface-soft);
    box-shadow: var(--shadow-hard-low);
  }

  .latest-writing-section :deep(.post-card:hover) {
    border-color: var(--color-signal);
    box-shadow: var(--shadow-hard-mid);
  }

  .more-link {
    display: inline-flex;
    margin-top: var(--space-6);
    margin-inline: var(--space-6);
    padding: var(--space-3) var(--space-4);
    border: var(--border-signal);
    color: var(--color-signal-heavy);
    background: var(--color-surface-soft);
    box-shadow: var(--shadow-hard-low);
    font-family: var(--font-mono);
    font-size: var(--type-large);
    text-decoration: none;
    transition:
      background 200ms var(--motion-snappy),
      color 200ms var(--motion-snappy),
      box-shadow 200ms var(--motion-snappy);
  }

  .more-link:hover,
  .more-link:focus-visible {
    background: var(--color-signal);
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

    .section-label {
      padding: var(--space-4);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .more-link {
      transition: none;
    }
  }
</style>
