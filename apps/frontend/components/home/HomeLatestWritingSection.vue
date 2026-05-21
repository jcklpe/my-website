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
    width: 4rem;
    height: 0.4rem;
    margin-bottom: var(--space-7);
    background: var(--accent);
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
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.24em;
    text-transform: uppercase;
  }

  .label-rail {
    display: block;
    font-size: clamp(2.4rem, 7vw, 5rem);
    line-height: 0.92;
  }

  .title {
    flex: 0 0 auto;
    max-width: min(16ch, 80vw);
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1em;
    line-height: inherit;
    letter-spacing: -0.04em;
    text-transform: uppercase;
  }

  .latest-writing-section :deep(.post-list) {
    padding-inline: var(--space-6);
  }

  .more-link {
    display: inline-flex;
    align-items: center;
    margin-top: var(--space-7);
    margin-inline: var(--space-6);
    padding: 0.8rem 1.5rem;
    border: 2px solid var(--color-ink);
    background: var(--accent);
    color: var(--accent-ink);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: var(--type-large);
    letter-spacing: 0.02em;
    text-transform: uppercase;
    text-decoration: none;
    box-shadow: var(--shadow-hard-sm);
    transition:
      transform 160ms var(--motion-snappy),
      box-shadow 160ms var(--motion-snappy);
  }

  .more-link:hover,
  .more-link:focus-visible {
    transform: translate(3px, 3px);
    box-shadow: 0 0 0 var(--color-ink);
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
