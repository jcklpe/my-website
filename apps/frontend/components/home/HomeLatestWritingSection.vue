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
      <HomeBentoPostList :posts="posts" />

      <NuxtLink
        class="more-link"
        to="/writing"
        @focus="prefetchInitialArchivePage"
        @pointerdown="prefetchInitialArchivePage"
        @pointerenter="prefetchInitialArchivePage"
      >
        View writing archive
        <span class="arrow-slot" aria-hidden="true">
          <span class="arrow">→</span>
        </span>
      </NuxtLink>
    </template>

    <EmptyState v-else message="No posts yet." />
  </section>
</template>

<style lang="scss" scoped>
  .latest-writing-section {
    position: relative;
    scroll-margin-top: var(--space-8);
    padding: var(--space-10) 0 var(--space-8);
    margin-inline: calc(var(--space-6) * -1);
  }

  // Two blue rule lines with no card framing — the symbol element is sized
  // larger than the banner height so it bleeds above and below both rules.
  .section-banner {
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: var(--space-8);
    padding: var(--space-4) var(--space-6);
    // Fill the band between the two rules with the same surface as the circle
    // glyph so the banner reads as one continuous strip rather than transparent.
    background: var(--color-surface);
    border-top: 1px solid var(--color-primary);
    border-bottom: 1px solid var(--color-primary);
  }

  .title {
    position: relative;
    z-index: 1;
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-style: italic;
    font-size: clamp(2.1rem, 3.5vw, 2.95rem);
    font-weight: 600;
    line-height: 1;
    letter-spacing: 0;
  }

  // Crosshair circle — sized to break out of the banner's top/bottom borders.
  // Uses a real element (not ::after) so it isn't clipped by overflow.
  .symbol {
    position: absolute;
    top: 50%;
    right: var(--space-6);
    transform: translateY(-50%);
    width: clamp(4rem, 7vw, 6rem);
    aspect-ratio: 1;
    border: 1px solid var(--color-primary);
    border-radius: 50%;
    background:
      linear-gradient(
          90deg,
          transparent 49%,
          var(--color-primary-tint) 49% 51%,
          transparent 51%
        )
        no-repeat,
      linear-gradient(
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

  .latest-writing-section :deep(.bento-post-list) {
    padding-inline: var(--space-6);
  }

  .more-link {
    display: flex;
    align-items: center;
    gap: 0.4em;
    width: fit-content;
    margin-top: var(--space-7);
    margin-inline: auto;
    font-family: var(--font-mono);
    font-size: var(--type-base);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    @include rich-link;
  }

  .more-link:hover,
  .more-link:focus-visible {
    @include rich-link-hover;
  }

  @include arrow-cta-slit('.more-link');

  @include breakpoint(phone) {
    .latest-writing-section {
      padding-top: var(--space-9);
      margin-inline: calc(var(--space-3) * -1); // match .home-page phone padding-inline exactly
    }

    .section-banner {
      padding-inline: var(--space-4);
    }

    .symbol {
      right: var(--space-4);
      width: clamp(3rem, 12vw, 4.5rem);
    }

    .latest-writing-section :deep(.bento-post-list) {
      padding-inline: var(--space-4);
    }

    .more-link {
      margin-inline: auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .more-link {
      transition: none;
    }
  }
</style>
