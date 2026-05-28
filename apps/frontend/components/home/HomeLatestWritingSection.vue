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
    padding: var(--space-8) 0 var(--space-9);
    margin-inline: calc(var(--space-6) * -1);
    background: var(--color-stage-elevated);
    color: var(--color-stage-ink);
  }

  .latest-writing-section::before {
    content: '';
    display: block;
    width: min(100%, 16rem);
    height: 0.35rem;
    margin-bottom: var(--space-7);
    background: var(--color-primary);
  }

  .section-label {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(8rem, 0.35fr);
    gap: var(--space-6);
    align-items: end;
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
  }

  .kicker {
    grid-column: 2;
    margin: 0;
    color: var(--color-stage-muted);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .label-rail {
    grid-column: 1;
    grid-row: 1;
    display: block;
    font-size: 3.25rem;
    line-height: 1;
  }

  .title {
    flex: 0 0 auto;
    max-width: min(16ch, 70vw);
    margin: 0;
    color: var(--color-stage-ink);
    font-family: var(--font-mono);
    font-size: 1em;
    line-height: inherit;
    text-transform: uppercase;
  }

  .latest-writing-section :deep(.post-list) {
    padding-inline: var(--space-6);
  }

  .more-link {
    display: inline-flex;
    margin-top: var(--space-6);
    margin-inline: var(--space-6);
    color: var(--color-stage-ink);
    border: 1px solid var(--color-primary);
    padding: var(--space-3) var(--space-4);
    font-size: var(--type-large);
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
    background-size: 100% 100%;
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

    .section-label {
      grid-template-columns: 1fr;
      gap: var(--space-3);
    }

    .kicker,
    .label-rail {
      grid-column: 1;
      grid-row: auto;
    }

    .latest-writing-section :deep(.post-list) {
      padding-inline: var(--space-4);
    }

    .more-link {
      margin-inline: var(--space-4);
    }

    .label-rail {
      font-size: 3.5rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .more-link {
      transition: none;
    }
  }
</style>
