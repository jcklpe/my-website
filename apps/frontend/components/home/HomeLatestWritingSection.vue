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
    <header class="section-header">
      <h2 class="section-title">
        <span class="section-code" aria-hidden="true">02 — </span>Latest Writing
      </h2>
    </header>

    <EmptyState v-if="error" message="Error: Posts could not be loaded." />

    <template v-else-if="posts?.length">
      <PostList :posts="posts" />

      <div class="more-link-wrap">
        <NuxtLink
          class="more-link"
          to="/writing"
          @focus="prefetchInitialArchivePage"
          @pointerdown="prefetchInitialArchivePage"
          @pointerenter="prefetchInitialArchivePage"
        >
          View writing archive
        </NuxtLink>
      </div>
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

  .section-header {
    display: flex;
    align-items: center;
    padding: var(--space-2) var(--space-6);
    border-top: 1px solid var(--color-line);
    border-bottom: 1px solid var(--color-line);
  }

  .section-title {
    margin: 0;
    color: var(--color-ink);
    font-family: var(--type-label-family);
    font-size: var(--type-label-size);
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .section-code {
    color: var(--color-blueprint);
  }

  .latest-writing-section :deep(.post-list) {
    padding-inline: var(--space-6);
  }

  .more-link-wrap {
    display: flex;
    justify-content: center;
    margin-top: var(--space-5);
    padding-inline: var(--space-6);
  }

  .more-link {
    display: inline-flex;
    color: var(--color-blueprint);
    font-size: var(--type-large);
    font-style: italic;
    text-decoration: none;
    background-image: linear-gradient(
      var(--color-blueprint),
      var(--color-blueprint)
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

    .section-header {
      padding-inline: var(--space-4);
    }

    .latest-writing-section :deep(.post-list) {
      padding-inline: var(--space-4);
    }

    .more-link {
      margin-inline: var(--space-4);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .more-link {
      transition: none;
    }
  }
</style>
