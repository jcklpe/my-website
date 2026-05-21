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
      <p class="kicker">Field notes</p>
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
        rgba(247, 240, 227, 0.16),
        rgba(255, 249, 236, 0.54)
      );
  }

  .latest-writing-section::before {
    content: '';
    display: block;
    width: 4.5rem;
    height: 0.65rem;
    margin-bottom: var(--space-7);
    border: 1px solid var(--color-primary);
    border-bottom: 0;
    border-radius: 999px 999px 0 0;
  }

  .section-label {
    position: relative;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
    text-align: left;
  }

  .section-label::after {
    content: '';
    display: block;
    width: min(24rem, 55vw);
    height: 1px;
    margin-top: var(--space-4);
    background: var(--color-primary-tint);
  }

  .kicker {
    margin-bottom: var(--space-6);
    color: var(--color-primary-heavy);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 600;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .label-rail {
    display: block;
    font-size: 3.25rem;
    line-height: 1;
  }

  .title {
    flex: 0 0 auto;
    max-width: min(16ch, 70vw);
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-serif);
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
    color: var(--color-primary);
    font-size: var(--type-large);
    font-family: var(--font-mono);
    text-decoration: none;
    background-image: linear-gradient(
      var(--color-primary),
      var(--color-primary)
    );
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
      font-size: 2.6rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .more-link {
      transition: none;
    }
  }
</style>
