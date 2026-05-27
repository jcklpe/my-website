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
    content: none;
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
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .label-rail {
    display: block;
    font-size: 4rem;
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
  }

  .latest-writing-section :deep(.post-list) {
    padding-inline: var(--space-6);
  }

  .more-link {
    display: inline-flex;
    margin-top: var(--space-6);
    margin-inline: var(--space-6);
    color: var(--color-ink);
    font-size: var(--type-large);
    font-style: normal;
    text-decoration: none;
    background-image: linear-gradient(
      45deg,
      var(--color-primary) 29%,
      var(--color-accent) 100%
    );
    background-position: -0.25em 100%;
    background-repeat: no-repeat;
    background-size: 120% 0.2em;
    border-bottom: 1px solid var(--color-primary);
    padding: 0.1em 0.25em 0;
    transition:
      background-size 250ms var(--motion-snappy),
      color 250ms var(--motion-snappy);
  }

  .more-link:hover,
  .more-link:focus-visible {
    background-size: 120% 88%;
    color: white;
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
      font-size: 2.8rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .more-link {
      transition: none;
    }
  }
</style>
