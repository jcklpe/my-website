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
      <p class="eyebrow">Field notes</p>
      <h2 class="title">Latest Writing</h2>
      <hr class="section-rule" aria-hidden="true" />
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
        Browse the full archive <span aria-hidden="true">→</span>
      </NuxtLink>
    </template>

    <EmptyState v-else message="No posts yet." />
  </section>
</template>

<style lang="scss" scoped>
  // Stratum: dawn — first light climbing back up out of the night-desert.
  .latest-writing-section {
    position: relative;
    scroll-margin-top: var(--space-8);
    padding: var(--space-8) 0;
    margin-inline: calc(var(--space-6) * -1);
    background: var(--color-stratum-dawn);
  }

  // Header anchored RIGHT — the asymmetric mirror of Selected Work's left
  // header, so the two list sections lean against each other.
  .section-header {
    margin-inline: var(--space-6);
    margin-bottom: var(--space-7);
    margin-left: auto;
    max-width: 28rem;
    text-align: right;
  }

  .eyebrow {
    margin: 0 0 var(--space-2);
    @include kicker;
  }

  .title {
    margin: 0;
    font-family: var(--font-display);
    font-optical-sizing: auto;
    font-weight: 460;
    font-size: clamp(2.4rem, 5.5vw, 4.5rem);
    line-height: 0.98;
    letter-spacing: -0.015em;
    color: var(--color-ink);

    @include display-character($opsz: 144, $soft: 55, $wonk: 1);
  }

  .section-rule {
    @include folk-rule;

    margin: var(--space-5) 0 0;
  }

  .latest-writing-section :deep(.post-list) {
    padding-inline: var(--space-6);
  }

  .more-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    margin-top: var(--space-6);
    margin-inline: var(--space-6);
    color: var(--color-primary);
    font-family: var(--font-sans);
    font-size: var(--type-large);
    font-weight: 500;
    text-decoration: none;
    @include rich-link;
  }

  .more-link:hover,
  .more-link:focus-visible {
    @include rich-link-hover;
  }

  @include breakpoint(phone) {
    .latest-writing-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-header {
      margin-inline: var(--space-4);
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
