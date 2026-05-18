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

  const bentoGridEl = ref<HTMLElement | null>(null);

  // 5-column desktop bento.
  // Rule: never two consecutive 2-tall items without a 1-tall between them —
  // this forces BentoGrid to stagger row boundaries rather than aligning them.
  // 5 cols gives more size resolution: 1, 2, and 3-wide items all feel distinct.
  // aspectRatio: 1.5 → row ≈ 106px → tallest card (2-row) ≈ 25vh.
  // Compact sizes (1x1, 2x1) use a horizontal image-left layout (see CSS).
  const BENTO_PATTERN = [
    '2x2', '1x1',
    '1x2', '2x1',
    '3x2', '1x1',
    '1x2', '2x1',
    '2x2', '1x1',
    '2x1', '1x2',
  ];
  const COMPACT_SIZES = new Set(['1x1', '2x1']);

  function getBentoSize(index: number): string {
    return BENTO_PATTERN[index % BENTO_PATTERN.length];
  }

  function isCompact(size: string): boolean {
    return COMPACT_SIZES.has(size);
  }

  onMounted(async () => {
    if (!bentoGridEl.value) return;
    const { default: BentoGrid } = await import('@bentogrid/core');
    if (!bentoGridEl.value) return;
    new BentoGrid({
      target: bentoGridEl.value,
      columns: 1,
      cellGap: 12,
      aspectRatio: 2.5,
      breakpoints: {
        768: { columns: 5, cellGap: 14, aspectRatio: 1.5 },
      },
    });
  });
</script>

<template>
  <section id="latest-writing" class="latest-writing-section">
    <div class="section-label">
      <h2 class="section-title">Latest writing</h2>
    </div>

    <EmptyState v-if="error" message="Error: Posts could not be loaded." />

    <template v-else-if="posts?.length">
      <ul ref="bentoGridEl" class="bento-grid">
        <li
          v-for="(post, index) in posts"
          :key="post.id"
          class="bento-item"
          :class="{ 'bento-item--compact': isCompact(getBentoSize(index)) }"
          :data-bento="getBentoSize(index)"
        >
          <PostCard :post="post" />
        </li>
      </ul>

      <NuxtLink
        class="more-link"
        to="/writing"
        @focus="prefetchInitialArchivePage"
        @pointerdown="prefetchInitialArchivePage"
        @pointerenter="prefetchInitialArchivePage"
      >
        All writing →
      </NuxtLink>
    </template>

    <EmptyState v-else message="No posts yet." />
  </section>
</template>

<style lang="scss" scoped>
  .latest-writing-section {
    position: relative;
    scroll-margin-top: var(--space-8);
    padding-bottom: var(--space-8);
    margin-inline: calc(var(--space-6) * -1);
    border-top: 1px solid var(--color-ink);
  }

  .section-label {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-5) var(--space-6) var(--space-6);

    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--color-ink);
      opacity: 0.15;
    }
  }

  .section-title {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .bento-grid {
    padding-inline: var(--space-6);
    margin: 0;
    list-style: none;
  }

  // Cards must fill their bento cells
  .bento-item {
    display: flex;
    min-height: 0;
  }

  .bento-item :deep(.post-card) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .bento-item :deep(.link) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  // Image-led cells: image fills the space above the text body
  .bento-item :deep(.featured-media-frame) {
    flex: 1;
    min-height: 0;
    aspect-ratio: auto;
  }

  .bento-item :deep(.body) {
    flex-shrink: 0;
  }

  // Compact cells (1x1, 2x1): flip to horizontal — image left, text right
  .bento-item--compact :deep(.link) {
    flex-direction: row;
  }

  .bento-item--compact :deep(.featured-media-frame) {
    flex: none;
    width: 40%;
    align-self: stretch;
  }

  .bento-item--compact :deep(.body) {
    flex: 1;
    min-width: 0;
    padding: var(--space-3) var(--space-4);
    overflow: hidden;
  }

  // Excerpt doesn't fit in the compact horizontal layout
  .bento-item--compact :deep(.excerpt) {
    display: none;
  }

  .more-link {
    display: inline-flex;
    margin-top: var(--space-5);
    margin-inline: var(--space-6);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.1em;
    text-decoration: none;
    text-transform: uppercase;
    transition: color 160ms var(--motion-snappy);
  }

  .more-link:hover,
  .more-link:focus-visible {
    color: var(--color-ink);
  }

  @include breakpoint(phone) {
    .latest-writing-section {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-label {
      padding-inline: var(--space-4);
    }

    .bento-grid {
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
