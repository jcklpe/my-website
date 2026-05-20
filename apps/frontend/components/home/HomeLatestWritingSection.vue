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
    <header class="section-banner">
      <h2 class="title">Latest writing</h2>
      <span class="symbol" aria-hidden="true" />
    </header>

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
        All writing <span aria-hidden="true">→</span>
      </NuxtLink>
    </template>

    <EmptyState v-else message="No posts yet." />
  </section>
</template>

<style lang="scss" scoped>
  // Latest Writing section title is a full-width banner — not a card — with a
  // crosshair/circle symbol that "breaks out" of the banner's top and bottom
  // edges. The layered effect (the shape escaping the rule line) is the
  // visual move pulled from blue1.2; the full-width treatment is the
  // synthesis correction.
  .latest-writing-section {
    position: relative;
    scroll-margin-top: var(--space-8);
    margin-inline: calc(var(--space-6) * -1);
    padding-bottom: var(--space-8);
  }

  .section-banner {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-7);
    padding: var(--space-5) var(--space-6);
    border-top: 1px solid var(--color-primary);
    border-bottom: 1px solid var(--color-primary);
  }

  .title {
    flex: 0 0 auto;
    margin: 0;
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-style: normal;
    font-weight: 600;
    font-size: var(--type-base);
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  // The symbol sits to the right of the title, sized larger than the banner
  // height so it overlaps both rules — half above, half below. Crosshair
  // pattern inside a thin periwinkle ring, like a target plate on a print.
  .symbol {
    position: absolute;
    top: 50%;
    right: var(--space-6);
    transform: translateY(-50%);
    width: clamp(3.5rem, 6vw, 5rem);
    aspect-ratio: 1;
    border-radius: 50%;
    border: 1px solid var(--color-primary);
    background:
      linear-gradient(
          90deg,
          transparent 49%,
          var(--color-primary-tint) 49% 51%,
          transparent 51%
        )
        no-repeat,
      linear-gradient(
          0deg,
          transparent 49%,
          var(--color-primary-tint) 49% 51%,
          transparent 51%
        )
        no-repeat,
      var(--color-surface);
    background-size:
      100% 100%,
      100% 100%,
      auto;
    pointer-events: none;
  }

  .latest-writing-section :deep(.post-list) {
    padding-inline: var(--space-6);
  }

  .more-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-6);
    margin-inline: var(--space-6);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-primary);
    text-decoration: none;
    transition: color 160ms var(--motion-snappy);
  }

  .more-link:hover,
  .more-link:focus-visible {
    color: var(--color-primary-heavy);
  }

  @include breakpoint(phone) {
    .latest-writing-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-banner {
      padding-inline: var(--space-4);
    }

    .symbol {
      right: var(--space-4);
      width: clamp(3rem, 12vw, 4rem);
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
